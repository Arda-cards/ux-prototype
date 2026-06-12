import { useCallback } from 'react';
import type { GridApi } from 'ag-grid-community';

// ============================================================================
// Types — add-row mechanics (DQ-006 / DQ-012)
// ============================================================================

/**
 * Emitted after rows are inserted or removed in-memory. `source` distinguishes a
 * fresh user action from an undo/redo-driven replay; only `'user'` is produced
 * by this add-only slice (structural undo/redo arrives in a follow-up).
 */
export interface RowEditPayload<T> {
  rows: T[];
  source: 'user' | 'undo' | 'redo';
}

export interface AddRowOptions<T> {
  /** Insert position. Default `0` (top). */
  addIndex?: number;
  /** Open this column's editor on the new row immediately after insert. */
  startEditingField?: keyof T & string;
}

/** The first visible column whose `editable` is statically `true`. */
function firstEditableColumnId<T>(api: GridApi<T>): string | undefined {
  const columns = api.getAllDisplayedColumns?.() ?? [];
  for (const column of columns) {
    if (column.getColDef?.().editable === true) return column.getColId();
  }
  return undefined;
}

export interface UseRowEditingOptions<T> {
  /** Returns the live AG Grid API, or null before the grid is ready. */
  getApi: () => GridApi<T> | null;
  /** Mint a new row's grid id. */
  getNewRowId: () => string;
  /** Fired after rows are inserted (in-memory). */
  onRowsAdded?: (payload: RowEditPayload<T>) => void;
  /** Fired after rows are removed (in-memory). */
  onRowsRemoved?: (payload: RowEditPayload<T>) => void;
}

// ============================================================================
// Hook — in-memory row insert / remove
// ============================================================================

/**
 * The `DataGrid` molecule's add-row mechanics (DQ-006/DQ-012): inserting and
 * removing rows in-memory via `applyTransaction`, sibling to the paste/fill it
 * already owns. It knows nothing about drafts, required fields or the network —
 * that write lifecycle lives in `ConnectedDataGrid`'s `useDraftPersistence`.
 *
 * A new row's grid id is placed on `eId` (which the molecule's `getRowId`
 * resolves), unless the caller's `seed` already carries one.
 *
 * Structural undo/redo (the unified command stack) is intentionally **not** in
 * this slice; AG Grid's native cell undo is unaffected.
 */
export function useRowEditing<T extends Record<string, unknown>>({
  getApi,
  getNewRowId,
  onRowsAdded,
  onRowsRemoved,
}: UseRowEditingOptions<T>) {
  const addRow = useCallback(
    (seed?: Partial<T>, opts?: AddRowOptions<T>): string => {
      const api = getApi();
      if (!api) return '';

      const id = (seed?.eId as string | undefined) ?? getNewRowId();
      const newRow = { ...seed, eId: id } as unknown as T;

      const result = api.applyTransaction({ add: [newRow], addIndex: opts?.addIndex ?? 0 });
      const node = result?.add?.[0];
      const data = (node?.data ?? newRow) as T;

      onRowsAdded?.({ rows: [data], source: 'user' });

      // Move focus into the new row's first editable cell and open its editor.
      // Deferred to the next tick: the consumer's `onRowsAdded` typically updates
      // `rowData`, and that synchronous reconcile would otherwise cancel an edit
      // started now. We re-resolve the row by id so a sort/filter can't misplace it.
      const colKey = opts?.startEditingField ?? firstEditableColumnId(api);
      if (colKey !== undefined) {
        setTimeout(() => {
          const liveApi = getApi();
          const rowIndex = liveApi?.getRowNode(id)?.rowIndex;
          if (!liveApi || typeof rowIndex !== 'number') return;
          liveApi.ensureIndexVisible(rowIndex);
          liveApi.setFocusedCell(rowIndex, colKey);
          liveApi.startEditingCell({ rowIndex, colKey });
        }, 0);
      }

      return node?.id ?? id;
    },
    [getApi, getNewRowId, onRowsAdded],
  );

  const removeRows = useCallback(
    (ids: string[]): void => {
      const api = getApi();
      if (!api || ids.length === 0) return;

      const removed: T[] = [];
      for (const id of ids) {
        const node = api.getRowNode(id);
        if (node?.data) removed.push(node.data as T);
      }
      if (removed.length === 0) return;

      api.applyTransaction({ remove: removed });
      onRowsRemoved?.({ rows: removed, source: 'user' });
    },
    [getApi, onRowsRemoved],
  );

  return { addRow, removeRows };
}
