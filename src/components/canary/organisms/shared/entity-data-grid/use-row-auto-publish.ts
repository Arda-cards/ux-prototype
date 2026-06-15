import { useRef, useState, useCallback, useImperativeHandle, useEffect, type Ref } from 'react';
import type {
  CellValueChangedEvent,
  CellEditingStoppedEvent,
  CutEndEvent,
  FillEndEvent,
  GridApi,
  PasteEndEvent,
  RowClassParams,
} from 'ag-grid-community';

// ============================================================================
// Types
// ============================================================================

/** Per-row accumulation of field-level changes not yet published. */
export type PendingChanges = Record<string, unknown>;

/** Visual state of a row during the auto-publish lifecycle. */
export type RowEditState = 'idle' | 'saving' | 'error';

/**
 * Imperative handle for callers that need to programmatically trigger
 * save/discard operations on all dirty rows.
 */
export interface RowAutoPublishHandle {
  /** Publish all dirty rows sequentially. Resolves when all publishes complete (or fail). */
  saveAll: () => Promise<void>;
  /** Discard all pending changes and reset row states to idle. */
  discardAll: () => void;
  /** Return the IDs of rows that have pending (unpublished) changes. */
  getDirtyRowIds: () => string[];
}

export interface UseRowAutoPublishOptions<T> {
  /**
   * Extract the row identifier from an entity. Must be stable across re-renders.
   * Corresponds to AG Grid's `getRowId`.
   */
  getEntityId: (entity: T) => string;
  /**
   * Called when a row is ready to publish. Receives the row ID, the batched
   * field changes, and (when blurring from a cell) the current entity snapshot.
   * `entity` is `undefined` when called from `saveAll()`.
   */
  onRowPublish?: (rowId: string, changes: PendingChanges, entity?: T) => Promise<void>;
  /** Called when the dirty state (has any unpublished rows) changes. */
  onDirtyChange?: (dirty: boolean) => void;
  /**
   * Draft-aware suppression (DQ-003). Rows for which this returns `true` are
   * unsaved drafts (no server id) and are skipped — their creation is handled by
   * `useDraftPersistence`, not published as a `PUT`.
   */
  isDraft?: (rowId: string) => boolean;
  /** Optional ref to expose `saveAll`, `discardAll`, `getDirtyRowIds` to a parent. */
  handleRef?: Ref<RowAutoPublishHandle> | undefined;
  /**
   * Live AG Grid API getter. Used for two things:
   *
   * 1. **Row-class redraw.** Calling `setRowState` synchronously updates the
   *    state map but the `'ag-row-saving'` / `'ag-row-error'` classes only
   *    become visible after AG Grid re-evaluates `getRowClass` — this getter
   *    lets the hook call `api.redrawRows({ rowNodes })` for just the row
   *    whose state flipped.
   *
   * 2. **Discard-to-baseline.** On `discardAll()` the hook reads the captured
   *    `oldValue` per `(rowId, field)` and writes it back via
   *    `api.applyTransaction({ update: [row] })`. Without `getApi`, discard
   *    only clears the dirty flag — the bad cell value stays on screen.
   *
   * Publish failures themselves do NOT auto-revert (panel-review decision):
   * the typed value is kept and the row goes to `'error'` state, so the
   * user sees the failure persistently and can choose to retry or discard.
   * `ConnectedDataGrid` wires this automatically.
   */
  getApi?: () => import('ag-grid-community').GridApi<T> | null;
}

// ============================================================================
// DOM helpers
// ============================================================================

/**
 * Find a row's DOM element by its grid row id.
 *
 * AG Grid renders each row with a `row-id="<entity-id>"` attribute; we use
 * that as a stable selector to update the row's class without going through
 * `api.redrawRows`, which would destroy the per-row cell-edit state and
 * silently drop the native Ctrl-Z undo stack for the row.
 *
 * Returns `null` when not in a DOM environment (SSR / Vitest jsdom edge
 * cases) or when no row with that id is currently rendered (e.g. it was
 * virtualized out of view — that's fine, `getRowClass` will paint the
 * right class when AG Grid rebuilds the row on scroll-in).
 */
function findRowElement(rowId: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  // `.ag-row[row-id="..."]` scopes us to AG Grid-rendered rows. Row IDs are
  // entity identifiers (UUIDs / DB ids) and are unique across the document
  // in the consumer apps that use ConnectedDataGrid; if two grids on the
  // same page ever share a row id, this will need an explicit grid-root
  // scope, but no consumer has that shape today.
  return document.querySelector<HTMLElement>(`.ag-row[row-id="${CSS.escape(rowId)}"]`);
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Provides row-level auto-publish lifecycle for entity data grids.
 *
 * Replaces the older `useDirtyTracking` hook, which only tracked dirty state
 * without a publish lifecycle. This hook:
 *  - Accumulates cell-level changes into a per-row pending-changes map
 *  - Fires `onRowPublish` after a 50ms debounce when the user moves away from a row
 *  - Manages `RowEditState` per row (`idle | saving | error`)
 *  - Provides `getRowClass` for AG Grid's `getRowClass` callback (visual feedback)
 *  - Exposes an imperative `RowAutoPublishHandle` via `handleRef`
 */
export function useRowAutoPublish<T extends Record<string, any>>({
  getEntityId,
  onRowPublish,
  onDirtyChange,
  isDraft,
  handleRef,
  getApi,
}: UseRowAutoPublishOptions<T>) {
  // --- Refs (not reactive, managed imperatively for perf) ---

  /** Field changes accumulated per row since last publish. */
  const pendingChangesRef = useRef<Record<string, PendingChanges>>({});
  /** Rows with pending changes (source of truth for dirty check). */
  const dirtyRowIdsRef = useRef<Set<string>>(new Set());
  /** Rows currently in flight (publishing in progress — prevent double-publish). */
  const publishingRef = useRef<Set<string>>(new Set());
  /** Timer IDs keyed by rowId — allows cancelling the 50ms debounce. */
  const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  /**
   * Pre-edit snapshots of `oldValue` per (rowId, field) captured on the FIRST
   * `cellValueChanged` for a given row → field. Used by `discardAll()` (and any
   * future explicit-revert flow) to restore the row to its last-saved state.
   *
   * Auto-publish does NOT revert on failure: the row keeps its typed value,
   * its pending dirty cells are preserved, and the row is marked `'error'` so
   * the user can see what they typed and what failed. Cleared on publish
   * success and on `discardAll()`.
   */
  const snapshotFieldsRef = useRef<Map<string, Map<string, unknown>>>(new Map());
  /** Stable refs so callbacks don't go stale in closures. */
  const onRowPublishRef = useRef(onRowPublish);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const isDraftRef = useRef(isDraft);
  const getApiRef = useRef(getApi);

  // Keep callback refs current.
  onRowPublishRef.current = onRowPublish;
  onDirtyChangeRef.current = onDirtyChange;
  isDraftRef.current = isDraft;
  getApiRef.current = getApi;

  // --- State ---
  //
  // The authoritative copy is `rowStateMapRef` — getRowClass reads from it so
  // the class returned is always in sync with the latest setRowState call,
  // regardless of React batching. `rowStates` is kept as a parallel React
  // state purely for any external consumer of the hook return value; AG Grid
  // never reads it directly.

  const rowStateMapRef = useRef<Map<string, RowEditState>>(new Map());
  const [rowStates, setRowStates] = useState<Record<string, RowEditState>>({});

  // -------------------------------------------------------------------------
  // Cleanup on unmount — cancel all pending debounce timers
  // -------------------------------------------------------------------------

  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      for (const timer of Object.values(timers)) {
        clearTimeout(timer);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const setRowState = useCallback((rowId: string, state: RowEditState) => {
    // 1. Update the synchronous ref so getRowClass sees the new value on the
    //    very next call (no React state-batch wait).
    if (state === 'idle') {
      if (!rowStateMapRef.current.has(rowId)) {
        // already idle, but still flow through to optional redraw below
      }
      rowStateMapRef.current.delete(rowId);
    } else {
      if (rowStateMapRef.current.get(rowId) === state) return; // no-op
      rowStateMapRef.current.set(rowId, state);
    }
    // 2. Mirror to React state for any external consumer of the hook return.
    setRowStates((prev) => {
      if (state === 'idle') {
        if (!(rowId in prev)) return prev;
        const next = { ...prev };
        delete next[rowId];
        return next;
      }
      if (prev[rowId] === state) return prev;
      return { ...prev, [rowId]: state };
    });
    // 3. Update the row's class on the DOM without destroying AG Grid's row
    //    state. We previously called `api.redrawRows({ rowNodes: [node] })`
    //    so AG Grid would re-evaluate `getRowClass`, but redrawRows tears
    //    down and recreates the row's DOM and its associated cell-edit
    //    state — which silently drops AG Grid's native Ctrl-Z undo stack
    //    for that row. The cheapest way to update the class without that
    //    side effect is to mutate the row element's classList directly;
    //    `getRowClass` remains the source of truth for AG Grid's own
    //    re-renders (e.g. scroll virtualization, sort, filter), so a row
    //    that scrolls out of view and back in still picks up the right
    //    class on rebuild.
    //
    //    Skip the mutation while the row has a cell in edit mode — the
    //    class flip itself is harmless, but the original implementation
    //    skipped here to avoid AG Grid edit-state churn and we keep the
    //    same guard for parity.
    const api = getApiRef.current?.();
    if (!api) return;
    const node = api.getRowNode(rowId);
    if (!node) return;
    const rowIsEditing = api.getEditingCells().some((cell) => cell.rowIndex === node.rowIndex);
    if (rowIsEditing) return;
    const rowEl = findRowElement(rowId);
    if (rowEl) {
      rowEl.classList.toggle('ag-row-saving', state === 'saving');
      rowEl.classList.toggle('ag-row-error', state === 'error');
    }
  }, []);

  const notifyDirty = useCallback(() => {
    onDirtyChangeRef.current?.(dirtyRowIdsRef.current.size > 0);
  }, []);

  // -------------------------------------------------------------------------
  // Publish a single row
  // -------------------------------------------------------------------------

  /**
   * Revert the row's edited cells to the snapshotted `oldValue`s by replaying
   * them through AG Grid's transaction API. No-op when `getApi` isn't wired or
   * the row isn't in the grid anymore.
   */
  const revertRowToSnapshot = useCallback((rowId: string) => {
    const fieldSnap = snapshotFieldsRef.current.get(rowId);
    const api = getApiRef.current?.();
    if (!fieldSnap || !api) return;
    const node = api.getRowNode(rowId);
    if (!node || !node.data) return;
    const updated: Record<string, unknown> = { ...(node.data as Record<string, unknown>) };
    for (const [field, oldValue] of fieldSnap) {
      updated[field] = oldValue;
    }
    api.applyTransaction({ update: [updated as T] });
  }, []);

  const publishRow = useCallback(
    async (rowId: string, entity?: T) => {
      const changes = pendingChangesRef.current[rowId];
      if (!changes || Object.keys(changes).length === 0) return;
      if (publishingRef.current.has(rowId)) return;

      // Mark as publishing — remove from dirty *optimistically*.
      publishingRef.current.add(rowId);
      dirtyRowIdsRef.current.delete(rowId);
      setRowState(rowId, 'saving');

      try {
        await onRowPublishRef.current?.(rowId, changes, entity);
        delete pendingChangesRef.current[rowId];
        snapshotFieldsRef.current.delete(rowId);
        setRowState(rowId, 'idle');
      } catch {
        // Panel-review decision (write-path semantics, Option 2):
        // KEEP the user's typed value AND mark the row 'error' so the
        // failure is persistently visible. We deliberately do NOT revert
        // the cells: silent revert violates Arda's "never silently change
        // data" principle and is easy to miss on a busy shop-floor screen.
        // The caller still sees the rejection on its own promise chain and
        // should toast — the 'error' row class is the persistent
        // on-screen signal that complements the toast.
        //
        // Pending changes + snapshot are preserved so a retry (e.g., via
        // saveAll() or future per-row retry affordance) can re-attempt the
        // same edit, and discardAll() can revert the visible cells to the
        // captured baseline.
        dirtyRowIdsRef.current.add(rowId);
        setRowState(rowId, 'error');
      } finally {
        publishingRef.current.delete(rowId);
        notifyDirty();
      }
    },
    [setRowState, notifyDirty],
  );

  // -------------------------------------------------------------------------
  // AG Grid event handlers
  // -------------------------------------------------------------------------

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<T>) => {
      const rowId = event.data ? getEntityId(event.data) : undefined;
      if (!rowId) return;
      if (isDraftRef.current?.(rowId)) return; // unsaved draft → handled by useDraftPersistence

      // Combined columns expose a `colId` but no `field`; key the change on it so
      // composite edits (e.g. Address) still mark the row dirty for publish.
      const field = event.colDef.field ?? event.column?.getColId();
      if (!field) return;

      if (!pendingChangesRef.current[rowId]) {
        pendingChangesRef.current[rowId] = {};
      }
      pendingChangesRef.current[rowId][field] = event.newValue;
      // Snapshot the pre-edit value the *first* time we see this (row, field)
      // since last save. Repeat edits to the same cell keep the original
      // baseline so revert restores to last-saved, not last-edited.
      let fieldSnap = snapshotFieldsRef.current.get(rowId);
      if (!fieldSnap) {
        fieldSnap = new Map();
        snapshotFieldsRef.current.set(rowId, fieldSnap);
      }
      if (!fieldSnap.has(field)) {
        fieldSnap.set(field, event.oldValue);
      }
      dirtyRowIdsRef.current.add(rowId);
      notifyDirty();
    },
    [getEntityId, notifyDirty],
  );

  const handleCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent<T>) => {
      const rowId = event.data ? getEntityId(event.data) : undefined;
      if (!rowId || !event.data) return;
      if (isDraftRef.current?.(rowId)) return; // unsaved draft → handled by useDraftPersistence

      // Check if the user is still editing another cell in the same row.
      const editingCells = event.api.getEditingCells();
      const rowNode = event.api.getRowNode(rowId);
      const stillEditingThisRow = editingCells.some(
        (cell) => rowNode && cell.rowIndex === rowNode.rowIndex,
      );

      if (stillEditingThisRow || !dirtyRowIdsRef.current.has(rowId)) return;

      // Cancel any existing debounce for this row.
      clearTimeout(debounceTimersRef.current[rowId]);

      // Capture entity snapshot now (will be valid for the 50ms window).
      const entitySnapshot = event.data;

      // Debounce: if the user immediately moves to another cell in the same row,
      // the editing-stopped + editing-started sequence cancels the publish.
      debounceTimersRef.current[rowId] = setTimeout(() => {
        delete debounceTimersRef.current[rowId];
        void publishRow(rowId, entitySnapshot);
      }, 50);
    },
    [getEntityId, publishRow],
  );

  // -------------------------------------------------------------------------
  // Row class getter (drives visual feedback for saving / error states)
  // -------------------------------------------------------------------------

  const getRowClass = useCallback(
    (params: RowClassParams<T>): string | string[] | undefined => {
      const id = params.data ? getEntityId(params.data) : undefined;
      if (!id) return undefined;
      // Read from the ref so the class returned is in sync with the most
      // recent setRowState call (React state would be a frame behind).
      const state = rowStateMapRef.current.get(id);
      if (state === 'saving') return 'ag-row-saving';
      if (state === 'error') return 'ag-row-error';
      return undefined;
    },
    [getEntityId],
  );

  // -------------------------------------------------------------------------
  // Imperative handle
  // -------------------------------------------------------------------------

  useImperativeHandle(
    handleRef,
    () => ({
      saveAll: async () => {
        const ids = Array.from(dirtyRowIdsRef.current);
        for (const rowId of ids) {
          // Cancel any pending debounce timers for this row.
          clearTimeout(debounceTimersRef.current[rowId]);
          delete debounceTimersRef.current[rowId];

          const changes = pendingChangesRef.current[rowId];
          if (!changes) continue;
          setRowState(rowId, 'saving');
          try {
            await onRowPublishRef.current?.(rowId, changes, undefined);
            delete pendingChangesRef.current[rowId];
            dirtyRowIdsRef.current.delete(rowId);
            setRowState(rowId, 'idle');
          } catch {
            dirtyRowIdsRef.current.add(rowId);
            setRowState(rowId, 'error');
          }
        }
        notifyDirty();
      },
      discardAll: () => {
        // Cancel all pending debounce timers.
        for (const timer of Object.values(debounceTimersRef.current)) {
          clearTimeout(timer);
        }
        debounceTimersRef.current = {};
        // Revert each row's visible cells to its last-saved baseline before
        // clearing pending state. With Option 2 (panel-review), publish
        // failures keep the user's typed value visible; without this revert,
        // discardAll would only clear the dirty FLAG, leaving the bad cell
        // value on screen. No-op when `getApi` isn't wired.
        for (const rowId of snapshotFieldsRef.current.keys()) {
          revertRowToSnapshot(rowId);
        }
        pendingChangesRef.current = {};
        dirtyRowIdsRef.current.clear();
        snapshotFieldsRef.current.clear();
        // Capture rows that need their class re-evaluated before clearing.
        const idsToRedraw = Array.from(rowStateMapRef.current.keys());
        rowStateMapRef.current.clear();
        setRowStates({});
        notifyDirty();
        // Strip 'ag-row-saving' / 'ag-row-error' classes from the rows that
        // had a non-idle state. Direct DOM mutation here for the same reason
        // as in setRowState — `redrawRows` would tear down per-row cell-edit
        // state and break native Ctrl-Z undo on any row that wasn't being
        // discarded but happened to share a redraw batch.
        for (const id of idsToRedraw) {
          const rowEl = findRowElement(id);
          if (rowEl) {
            rowEl.classList.remove('ag-row-saving', 'ag-row-error');
          }
        }
      },
      getDirtyRowIds: () => Array.from(dirtyRowIdsRef.current),
    }),
    [setRowState, notifyDirty, revertRowToSnapshot],
  );

  // -------------------------------------------------------------------------
  // Bulk flush points — paste / fill / cut don't fire cellEditingStopped, so
  // dirty rows accumulated via cellValueChanged would otherwise never publish.
  // Publish every non-draft dirty row with its current snapshot.
  // -------------------------------------------------------------------------

  const flushDirtyRows = useCallback(
    (api: GridApi<T>) => {
      const rowIds = Array.from(dirtyRowIdsRef.current);
      for (const rowId of rowIds) {
        if (isDraftRef.current?.(rowId)) continue;
        const node = api.getRowNode(rowId);
        const entity = node?.data;
        if (!entity) continue;
        void publishRow(rowId, entity);
      }
    },
    [publishRow],
  );

  const handlePasteEnd = useCallback(
    (event: PasteEndEvent<T>) => flushDirtyRows(event.api),
    [flushDirtyRows],
  );
  const handleFillEnd = useCallback(
    (event: FillEndEvent<T>) => flushDirtyRows(event.api),
    [flushDirtyRows],
  );
  const handleCutEnd = useCallback(
    (event: CutEndEvent<T>) => flushDirtyRows(event.api),
    [flushDirtyRows],
  );

  return {
    handleCellValueChanged,
    handleCellEditingStopped,
    handlePasteEnd,
    handleFillEnd,
    handleCutEnd,
    getRowClass,
    rowStates,
  };
}
