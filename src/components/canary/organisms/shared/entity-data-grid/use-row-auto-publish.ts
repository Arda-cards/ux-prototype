import { useRef, useState, useCallback, useImperativeHandle, useEffect, type Ref } from 'react';
import type {
  CellValueChangedEvent,
  CellEditingStoppedEvent,
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
  /** Optional ref to expose `saveAll`, `discardAll`, `getDirtyRowIds` to a parent. */
  handleRef?: Ref<RowAutoPublishHandle> | undefined;
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
  handleRef,
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
  /** Stable refs so callbacks don't go stale in closures. */
  const onRowPublishRef = useRef(onRowPublish);
  const onDirtyChangeRef = useRef(onDirtyChange);

  // Keep callback refs current.
  onRowPublishRef.current = onRowPublish;
  onDirtyChangeRef.current = onDirtyChange;

  // --- State (reactive — drives AG Grid getRowClass + count display) ---

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
    setRowStates((prev) => {
      if (state === 'idle') {
        if (!(rowId in prev)) return prev; // no-op
        const next = { ...prev };
        delete next[rowId];
        return next;
      }
      if (prev[rowId] === state) return prev; // no-op
      return { ...prev, [rowId]: state };
    });
  }, []);

  const notifyDirty = useCallback(() => {
    onDirtyChangeRef.current?.(dirtyRowIdsRef.current.size > 0);
  }, []);

  // -------------------------------------------------------------------------
  // Publish a single row
  // -------------------------------------------------------------------------

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
        setRowState(rowId, 'idle');
      } catch {
        // Revert dirty — publish failed, changes still pending.
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

      const field = event.colDef.field;
      if (!field) return;

      if (!pendingChangesRef.current[rowId]) {
        pendingChangesRef.current[rowId] = {};
      }
      pendingChangesRef.current[rowId][field] = event.newValue;
      dirtyRowIdsRef.current.add(rowId);
      notifyDirty();
    },
    [getEntityId, notifyDirty],
  );

  const handleCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent<T>) => {
      const rowId = event.data ? getEntityId(event.data) : undefined;
      if (!rowId || !event.data) return;

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
      const state = rowStates[id];
      if (state === 'saving') return 'ag-row-saving';
      if (state === 'error') return 'ag-row-error';
      return undefined;
    },
    [getEntityId, rowStates],
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
        pendingChangesRef.current = {};
        dirtyRowIdsRef.current.clear();
        setRowStates({});
        notifyDirty();
      },
      getDirtyRowIds: () => Array.from(dirtyRowIdsRef.current),
    }),
    [setRowState, notifyDirty],
  );

  return {
    handleCellValueChanged,
    handleCellEditingStopped,
    getRowClass,
    rowStates,
  };
}
