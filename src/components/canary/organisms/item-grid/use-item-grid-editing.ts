import { useRef, useState, useCallback, useImperativeHandle, type Ref } from 'react';
import type {
  CellValueChangedEvent,
  CellEditingStoppedEvent,
  RowClassParams,
} from 'ag-grid-community';
import type { Item } from '@/types/extras';

// --- Types ---

export type PendingChanges = Record<string, unknown>;

export type RowEditState = 'idle' | 'saving' | 'error';

export interface ItemGridEditingHandle {
  saveAll: () => Promise<void>;
  discardAll: () => void;
  getDirtyRowIds: () => string[];
}

export interface UseItemGridEditingOptions {
  /** Called when a row is ready to publish (user moved to another row or stopped editing). */
  onPublishRow?:
    | ((rowId: string, changes: PendingChanges, item: Item) => Promise<void>)
    | undefined;
  /** Called when dirty state changes (true = has unsaved changes). */
  onDirtyChange?: ((dirty: boolean) => void) | undefined;
  /** Ref to expose save/discard handle to parent. */
  handleRef?: Ref<ItemGridEditingHandle> | undefined;
}

// --- Hook ---

export function useItemGridEditing({
  onPublishRow,
  onDirtyChange,
  handleRef,
}: UseItemGridEditingOptions = {}) {
  const pendingChangesRef = useRef<Record<string, PendingChanges>>({});
  const dirtyRowIdsRef = useRef<Set<string>>(new Set());
  const publishingRef = useRef<Set<string>>(new Set());
  const editingRowIdRef = useRef<string | null>(null);

  const [rowStates, setRowStates] = useState<Record<string, RowEditState>>({});

  const setRowState = useCallback((rowId: string, state: RowEditState) => {
    setRowStates((prev) => {
      if (state === 'idle') {
        const next = { ...prev };
        delete next[rowId];
        return next;
      }
      return { ...prev, [rowId]: state };
    });
  }, []);

  const notifyDirty = useCallback(() => {
    onDirtyChange?.(dirtyRowIdsRef.current.size > 0);
  }, [onDirtyChange]);

  // --- Publish a single row ---

  const publishRow = useCallback(
    async (rowId: string, item: Item) => {
      const changes = pendingChangesRef.current[rowId];
      if (!changes || Object.keys(changes).length === 0) return;
      if (publishingRef.current.has(rowId)) return;

      publishingRef.current.add(rowId);
      dirtyRowIdsRef.current.delete(rowId);
      setRowState(rowId, 'saving');

      try {
        await onPublishRow?.(rowId, changes, item);
        delete pendingChangesRef.current[rowId];
        setRowState(rowId, 'idle');
      } catch {
        dirtyRowIdsRef.current.add(rowId);
        setRowState(rowId, 'error');
      } finally {
        publishingRef.current.delete(rowId);
        notifyDirty();
      }
    },
    [onPublishRow, setRowState, notifyDirty],
  );

  // --- AG Grid event handlers ---

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<Item>) => {
      const rowId = event.data?.entityId;
      if (!rowId) return;

      const field = event.colDef.field;
      if (!field) return;

      if (!pendingChangesRef.current[rowId]) {
        pendingChangesRef.current[rowId] = {};
      }
      pendingChangesRef.current[rowId][field] = event.newValue;
      dirtyRowIdsRef.current.add(rowId);
      editingRowIdRef.current = rowId;
      notifyDirty();
    },
    [notifyDirty],
  );

  const handleCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent<Item>) => {
      const rowId = event.data?.entityId;
      if (!rowId || !event.data) return;

      // Check if still editing cells in the same row
      const editingCells = event.api.getEditingCells();
      const stillEditingThisRow = editingCells.some((cell) => {
        const node = event.api.getRowNode(rowId);
        return node && cell.rowIndex === node.rowIndex;
      });

      if (!stillEditingThisRow && dirtyRowIdsRef.current.has(rowId)) {
        // Small delay to let AG Grid finish its internal state updates
        const data = event.data;
        if (data) setTimeout(() => publishRow(rowId, data), 50);
      }
    },
    [publishRow],
  );

  // --- Imperative handle for parent ---

  useImperativeHandle(
    handleRef,
    () => ({
      saveAll: async () => {
        const ids = Array.from(dirtyRowIdsRef.current);
        for (const rowId of ids) {
          const changes = pendingChangesRef.current[rowId];
          if (!changes) continue;
          // We need the Item data — but we don't have a grid API ref here.
          // The consumer should use onPublishRow which receives the item.
          // For saveAll, we publish with the changes we have.
          await onPublishRow?.(rowId, changes, {} as Item);
          delete pendingChangesRef.current[rowId];
          dirtyRowIdsRef.current.delete(rowId);
        }
        setRowStates({});
        notifyDirty();
      },
      discardAll: () => {
        pendingChangesRef.current = {};
        dirtyRowIdsRef.current.clear();
        setRowStates({});
        notifyDirty();
      },
      getDirtyRowIds: () => Array.from(dirtyRowIdsRef.current),
    }),
    [onPublishRow, notifyDirty],
  );

  // --- Row class getter for visual states ---

  const getRowClass = useCallback(
    (params: RowClassParams<Item>): string | string[] | undefined => {
      const id = params.data?.entityId;
      if (!id) return undefined;
      const state = rowStates[id];
      if (state === 'saving') return 'ag-row-saving';
      if (state === 'error') return 'ag-row-error';
      return undefined;
    },
    [rowStates],
  );

  return {
    handleCellValueChanged,
    handleCellEditingStopped,
    getRowClass,
    rowStates,
  };
}
