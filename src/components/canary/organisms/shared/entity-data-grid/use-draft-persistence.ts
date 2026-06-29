import { useCallback, useRef } from 'react';
import type { CellEditingStoppedEvent, CellValueChangedEvent, GridApi } from 'ag-grid-community';
import type { RowEditPayload } from '@/components/canary/molecules/data-grid';

// ============================================================================
// Types — the create write-lifecycle (DQ-001 … DQ-005)
// ============================================================================

type DraftState = 'draft' | 'saved';

export interface UseDraftPersistenceOptions<T> {
  /** Stable grid row id (AG Grid `getRowId`); never changes across draft→saved. */
  getEntityId: (entity: T) => string;
  /** Returns the live AG Grid API for reconcile, or null before ready. */
  getApi: () => GridApi<T> | null;
  /** Fields that must all be non-empty before an unsaved row auto-creates. */
  requiredFields: (keyof T)[];
  /**
   * Create seam (DQ-001). Called once an unsaved row's `requiredFields` are
   * complete. Resolves to the authoritative entity to reconcile; it MUST keep
   * the grid id (`getEntityId(returned) === rowId`). Throwing leaves the row a
   * draft (the consumer surfaces the error, e.g. a toast). Omit to disable
   * draft tracking entirely.
   */
  onCreate?: (row: T) => Promise<T>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * The `ConnectedDataGrid` write lifecycle for *created* rows (DQ-001/004/005).
 * It reacts to the molecule's `onRowsAdded`: a freshly-added row becomes an
 * unsaved **draft** (excluded from the `PUT` commit pipeline via `isDraft`), and
 * once its `requiredFields` are all non-empty — at row-blur or paste/fill flush —
 * it calls `onCreate` (`POST`) and reconciles the returned record into the grid,
 * keeping the grid id stable.
 *
 * Drafts carry **no row tint**: a new row looks like any other (the consumer's
 * `onCreate` owns success/error feedback, e.g. a toast). Delete and structural
 * undo/redo are out of this add-only slice.
 */
export function useDraftPersistence<T extends Record<string, any>>({
  getEntityId,
  getApi,
  requiredFields,
  onCreate,
}: UseDraftPersistenceOptions<T>) {
  const rowStateMapRef = useRef<Map<string, { state: DraftState; snapshot: T }>>(new Map());
  const creatingRef = useRef<Set<string>>(new Set());
  const onCreateRef = useRef(onCreate);
  const requiredFieldsRef = useRef(requiredFields);
  onCreateRef.current = onCreate;
  requiredFieldsRef.current = requiredFields;

  const isComplete = useCallback((snapshot: T): boolean => {
    return requiredFieldsRef.current.every((field) => {
      const value = snapshot[field];
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      return true;
    });
  }, []);

  // --- Create a single complete draft ------------------------------------

  const create = useCallback(
    async (rowId: string) => {
      const onCreateFn = onCreateRef.current;
      if (!onCreateFn) return;

      const entry = rowStateMapRef.current.get(rowId);
      if (!entry || entry.state !== 'draft') return;
      if (creatingRef.current.has(rowId)) return;
      if (!isComplete(entry.snapshot)) return;

      creatingRef.current.add(rowId);
      try {
        const saved = await onCreateFn(entry.snapshot);
        // Reconcile from the authoritative record; the grid id is preserved so
        // AG Grid updates the existing row rather than treating it as new (DQ-005).
        getApi()?.applyTransaction({ update: [saved] });
        rowStateMapRef.current.set(rowId, { state: 'saved', snapshot: saved });
      } catch {
        // Stays a draft; the consumer surfaces the error. Retry on the next flush.
      } finally {
        creatingRef.current.delete(rowId);
      }
    },
    [getApi, isComplete],
  );

  /** Try to create every draft that is now complete (paste/fill/saveAll flush). */
  const createCompleteDrafts = useCallback(() => {
    for (const [rowId, entry] of rowStateMapRef.current) {
      if (entry.state === 'draft') void create(rowId);
    }
  }, [create]);

  // --- Molecule + grid event handlers ------------------------------------

  /** Mark freshly-added rows as drafts (only when a create seam exists). */
  const markAdded = useCallback(
    (payload: RowEditPayload<T>) => {
      if (!onCreateRef.current) return;
      for (const row of payload.rows) {
        const id = getEntityId(row);
        rowStateMapRef.current.set(id, { state: 'draft', snapshot: { ...row } });
      }
    },
    [getEntityId],
  );

  /** Accumulate edits into a draft's snapshot (never fires a PUT — see isDraft). */
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<T>) => {
      const rowId = event.data ? getEntityId(event.data) : undefined;
      if (!rowId) return;
      const entry = rowStateMapRef.current.get(rowId);
      if (!entry || entry.state !== 'draft') return;
      entry.snapshot = { ...(event.data as T) };
    },
    [getEntityId],
  );

  /** On row blur, create the draft if its required fields are complete. */
  const handleCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent<T>) => {
      const rowId = event.data ? getEntityId(event.data) : undefined;
      if (!rowId || !event.data) return;
      const entry = rowStateMapRef.current.get(rowId);
      if (!entry || entry.state !== 'draft') return;

      // Defer while another cell in the same row is still editing.
      const editingCells = event.api.getEditingCells();
      const rowNode = event.api.getRowNode(rowId);
      const stillEditingThisRow = editingCells.some(
        (cell) => rowNode && cell.rowIndex === rowNode.rowIndex,
      );
      if (stillEditingThisRow) return;

      void create(rowId);
    },
    [getEntityId, create],
  );

  const handlePasteEnd = useCallback(() => createCompleteDrafts(), [createCompleteDrafts]);
  const handleFillEnd = useCallback(() => createCompleteDrafts(), [createCompleteDrafts]);

  const isDraft = useCallback(
    (rowId: string) => rowStateMapRef.current.get(rowId)?.state === 'draft',
    [],
  );

  return {
    isDraft,
    markAdded,
    handleCellValueChanged,
    handleCellEditingStopped,
    handlePasteEnd,
    handleFillEnd,
    createCompleteDrafts,
  };
}
