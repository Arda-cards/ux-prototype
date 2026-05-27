import { useRef, useState, useCallback, useImperativeHandle, useEffect, type Ref } from 'react';
import type {
  CellValueChangedEvent,
  CellEditingStoppedEvent,
  PasteEndEvent,
  FillEndEvent,
  CutEndEvent,
  RowClassParams,
} from 'ag-grid-community';
import type { PendingChanges, RowEditState } from './use-row-auto-publish';

// ============================================================================
// Types — the bulk-commit seam (DQ-003 / DQ-004)
// ============================================================================

/**
 * One row's accumulated change, ready to commit. The `entity` snapshot is the
 * basis for the full-`<Entity>Input` payload the bulk endpoint expects (see
 * the write-path design); `changes` is the field-level delta that triggered it.
 */
export interface RowChange<T> {
  /** Stable row identifier (from `getEntityId`). */
  rowId: string;
  /** Field-level changes accumulated since the last commit. */
  changes: PendingChanges;
  /** Current full-row snapshot at flush time. */
  entity: T;
}

/**
 * Per-row outcome of a commit. The endpoint is atomic (all-or-nothing), so a
 * thrown `onCommit` fails the whole batch; a resolved array lets a future
 * partial-result body (Phase 4) mark individual rows. `record` carries the
 * authoritative server entity for reconcile (wired in Phase 1).
 */
export interface CommitResult {
  rowId: string;
  status: 'ok' | 'error';
  /** Authoritative record from the server, for reconcile (Phase 1). */
  record?: unknown;
  /** Error detail when `status === 'error'`. */
  error?: string;
}

/**
 * Imperative handle so a parent can drive the pipeline (parity with
 * `RowAutoPublishHandle`).
 */
export interface CommitPipelineHandle {
  /** Flush all dirty rows as a single batch. Resolves when the commit settles. */
  saveAll: () => Promise<void>;
  /** Drop all pending changes and reset row states to idle. */
  discardAll: () => void;
  /** Return the IDs of rows with pending (uncommitted) changes. */
  getDirtyRowIds: () => string[];
}

export interface UseCommitPipelineOptions<T> {
  /** Extract the row identifier from an entity. Stable across re-renders. */
  getEntityId: (entity: T) => string;
  /**
   * Commit a batch of row changes. The consumer routes by size — single
   * `PUT …/{id}` for one row, one atomic `PUT …/bulk` for many — and returns a
   * per-row result the pipeline reconciles against. Throwing rejects the whole
   * batch (the endpoint is all-or-nothing). Omit to leave the pipeline inert.
   */
  onCommit?: (changes: RowChange<T>[]) => Promise<CommitResult[]>;
  /** Called when the dirty state (has any uncommitted rows) changes. */
  onDirtyChange?: (dirty: boolean) => void;
  /**
   * Draft-aware suppression (DQ-003). When provided, rows for which this returns
   * `true` are unsaved drafts with no server id — their edits must NOT fire a
   * `PUT`, so the pipeline skips accumulating and flushing them. Their creation
   * is handled separately by `useDraftPersistence`.
   */
  isDraft?: (rowId: string) => boolean;
  /** Optional ref to expose `saveAll`/`discardAll`/`getDirtyRowIds` to a parent. */
  handleRef?: Ref<CommitPipelineHandle> | undefined;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Bulk commit pipeline for `ConnectedDataGrid` (DQ-003). Every mutating grid
 * operation — single edit, range paste, fill-down, cut, and undo/redo — surfaces
 * as a stream of `cellValueChanged` events, so one pipeline handles them all:
 *
 *   accumulate dirty rows → flush on settle → (route by size → reconcile)
 *
 * This Phase-0 seam implements **accumulate** and **flush**: single edits flush
 * on editing-stopped/row-blur (debounced); paste and fill do not fire
 * editing-stopped, so they flush on `onPasteEnd`/`onFillEnd`/`onCutEnd`. The
 * accumulated batch is handed to `onCommit`, and per-row results drive the
 * `saving`/`error` visuals. Route-by-size, `valueParser` pre-validation and
 * reconcile-from-response land in Phase 1, in the consumer's `onCommit` and the
 * grid wiring.
 */
export function useCommitPipeline<T extends Record<string, any>>({
  getEntityId,
  onCommit,
  onDirtyChange,
  isDraft,
  handleRef,
}: UseCommitPipelineOptions<T>) {
  // --- Refs (imperative, non-reactive for perf) ---

  /** Field changes accumulated per row since the last commit. */
  const pendingChangesRef = useRef<Record<string, PendingChanges>>({});
  /** Latest full-row snapshot per dirty row (basis for the payload). */
  const entitySnapshotsRef = useRef<Record<string, T>>({});
  /** Rows with pending changes (source of truth for dirty check). */
  const dirtyRowIdsRef = useRef<Set<string>>(new Set());
  /** Rows currently in flight (prevent double-commit). */
  const committingRef = useRef<Set<string>>(new Set());
  /** Debounce timers keyed by rowId — coalesces cell-to-cell moves on row blur. */
  const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  /** Stable callback refs so closures don't go stale. */
  const onCommitRef = useRef(onCommit);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const isDraftRef = useRef(isDraft);

  onCommitRef.current = onCommit;
  onDirtyChangeRef.current = onDirtyChange;
  isDraftRef.current = isDraft;

  // --- State (reactive — drives getRowClass visuals) ---

  const [rowStates, setRowStates] = useState<Record<string, RowEditState>>({});

  // --- Cleanup: cancel pending debounce timers on unmount ---

  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      for (const timer of Object.values(timers)) {
        clearTimeout(timer);
      }
    };
  }, []);

  // --- Helpers ---

  const setRowState = useCallback((rowId: string, state: RowEditState) => {
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
  }, []);

  const notifyDirty = useCallback(() => {
    onDirtyChangeRef.current?.(dirtyRowIdsRef.current.size > 0);
  }, []);

  // -------------------------------------------------------------------------
  // Flush — collect dirty rows into a batch and hand them to onCommit.
  // -------------------------------------------------------------------------

  const flush = useCallback(
    async (rowIds?: string[]) => {
      const commit = onCommitRef.current;
      if (!commit) return;

      const ids = (rowIds ?? Array.from(dirtyRowIdsRef.current)).filter(
        (id) => dirtyRowIdsRef.current.has(id) && !committingRef.current.has(id),
      );

      const batch: RowChange<T>[] = [];
      for (const rowId of ids) {
        const changes = pendingChangesRef.current[rowId];
        const entity = entitySnapshotsRef.current[rowId];
        if (!changes || Object.keys(changes).length === 0 || !entity) continue;
        batch.push({ rowId, changes, entity });
      }
      if (batch.length === 0) return;

      // Mark in-flight — remove from dirty optimistically.
      for (const { rowId } of batch) {
        committingRef.current.add(rowId);
        dirtyRowIdsRef.current.delete(rowId);
        setRowState(rowId, 'saving');
      }

      let results: CommitResult[];
      try {
        results =
          (await commit(batch)) ?? batch.map(({ rowId }) => ({ rowId, status: 'ok' as const }));
      } catch {
        // Atomic endpoint: a throw rejects the whole batch. Restore all to dirty.
        for (const { rowId } of batch) {
          committingRef.current.delete(rowId);
          dirtyRowIdsRef.current.add(rowId);
          setRowState(rowId, 'error');
        }
        notifyDirty();
        return;
      }

      const byId = new Map(results.map((r) => [r.rowId, r]));
      for (const { rowId } of batch) {
        committingRef.current.delete(rowId);
        const result = byId.get(rowId);
        if (!result || result.status === 'ok') {
          delete pendingChangesRef.current[rowId];
          delete entitySnapshotsRef.current[rowId];
          setRowState(rowId, 'idle');
        } else {
          dirtyRowIdsRef.current.add(rowId);
          setRowState(rowId, 'error');
        }
      }
      notifyDirty();
    },
    [setRowState, notifyDirty],
  );

  // -------------------------------------------------------------------------
  // AG Grid event handlers
  // -------------------------------------------------------------------------

  /** Accumulate: record the changed field, value and latest row snapshot. */
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<T>) => {
      const rowId = event.data ? getEntityId(event.data) : undefined;
      if (!rowId) return;
      if (isDraftRef.current?.(rowId)) return; // unsaved draft → no PUT (DQ-003)
      const field = event.colDef.field;
      if (!field) return;

      if (!pendingChangesRef.current[rowId]) {
        pendingChangesRef.current[rowId] = {};
      }
      pendingChangesRef.current[rowId][field] = event.newValue;
      entitySnapshotsRef.current[rowId] = event.data as T;
      dirtyRowIdsRef.current.add(rowId);
      notifyDirty();
    },
    [getEntityId, notifyDirty],
  );

  /** Flush on row blur (single-cell edits). Paste/fill use the *End handlers. */
  const handleCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent<T>) => {
      const rowId = event.data ? getEntityId(event.data) : undefined;
      if (!rowId || !event.data) return;
      if (isDraftRef.current?.(rowId)) return; // unsaved draft → no PUT (DQ-003)

      // Still editing another cell in this row? Defer — flush on the final blur.
      const editingCells = event.api.getEditingCells();
      const rowNode = event.api.getRowNode(rowId);
      const stillEditingThisRow = editingCells.some(
        (cell) => rowNode && cell.rowIndex === rowNode.rowIndex,
      );
      if (stillEditingThisRow || !dirtyRowIdsRef.current.has(rowId)) return;

      clearTimeout(debounceTimersRef.current[rowId]);
      debounceTimersRef.current[rowId] = setTimeout(() => {
        delete debounceTimersRef.current[rowId];
        void flush([rowId]);
      }, 50);
    },
    [getEntityId, flush],
  );

  /**
   * Paste, fill and cut emit one `cellValueChanged` per affected cell, then a
   * single *End event — and they never fire editing-stopped. So these are the
   * flush points for bulk operations: commit every row accumulated so far.
   */
  const handlePasteEnd = useCallback(
    (_event: PasteEndEvent<T>) => {
      void flush();
    },
    [flush],
  );

  const handleFillEnd = useCallback(
    (_event: FillEndEvent<T>) => {
      void flush();
    },
    [flush],
  );

  const handleCutEnd = useCallback(
    (_event: CutEndEvent<T>) => {
      void flush();
    },
    [flush],
  );

  // -------------------------------------------------------------------------
  // Row class getter (saving / error visuals)
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
        // Cancel pending row-blur debounces — flush everything now.
        for (const timer of Object.values(debounceTimersRef.current)) {
          clearTimeout(timer);
        }
        debounceTimersRef.current = {};
        await flush();
      },
      discardAll: () => {
        for (const timer of Object.values(debounceTimersRef.current)) {
          clearTimeout(timer);
        }
        debounceTimersRef.current = {};
        pendingChangesRef.current = {};
        entitySnapshotsRef.current = {};
        dirtyRowIdsRef.current.clear();
        committingRef.current.clear();
        setRowStates({});
        notifyDirty();
      },
      getDirtyRowIds: () => Array.from(dirtyRowIdsRef.current),
    }),
    [flush, notifyDirty],
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
