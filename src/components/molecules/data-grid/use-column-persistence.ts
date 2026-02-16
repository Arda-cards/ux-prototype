import { useCallback, useEffect, useRef } from 'react';
import type {
  GridApi,
  ColumnMovedEvent,
  ColumnResizedEvent,
  ColumnVisibleEvent,
  SortChangedEvent,
} from 'ag-grid-community';

type ColumnStateEvent =
  | ColumnMovedEvent
  | ColumnResizedEvent
  | ColumnVisibleEvent
  | SortChangedEvent;

/**
 * Hook for persisting column state to localStorage.
 * Saves column width, order, visibility, and sort state.
 *
 * Note: This is a simplified version for the UX prototype.
 * Conflict resolution and backward compatibility features
 * are deferred to issue #717.
 */
export function useColumnPersistence(persistenceKey?: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /**
   * Save column state to localStorage
   */
  const saveColumnState = useCallback(
    (api: GridApi) => {
      if (!persistenceKey) return;

      try {
        const fullColumnState = api.getColumnState();
        if (!fullColumnState || fullColumnState.length === 0) return;

        // Extract column state with all relevant properties
        const columnState = fullColumnState.map((col: any) => ({
          colId: col.colId,
          hide: col.hide,
          width: col.width,
          sort: col.sort,
          sortIndex: col.sortIndex,
          pinned: null, // Never persist pinned state
        }));

        // Extract sort model from column state
        const sortModel = columnState
          .filter((col: any) => col.sort !== null && col.sort !== undefined)
          .map((col: any) => ({
            colId: col.colId,
            sort: col.sort,
            sortIndex: col.sortIndex,
          }));

        const gridState = {
          columnState,
          sortModel,
        };

        localStorage.setItem(persistenceKey, JSON.stringify(gridState));
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn('Failed to save grid state:', message);
      }
    },
    [persistenceKey],
  );

  /**
   * Restore column state from localStorage
   */
  const restoreColumnState = useCallback(
    (api: GridApi) => {
      if (!persistenceKey) return;

      try {
        const savedState = localStorage.getItem(persistenceKey);
        if (!savedState) return;

        const persistedState = JSON.parse(savedState);

        // Handle old format (array) for backward compatibility
        if (Array.isArray(persistedState)) {
          const cleanedState = persistedState.map((col: any) => ({
            ...col,
            pinned: null,
          }));

          api.applyColumnState({
            state: cleanedState,
            applyOrder: true,
          });
          return;
        }

        // New format: object with columnState and sortModel
        if (persistedState.columnState && Array.isArray(persistedState.columnState)) {
          let columnStateToApply = persistedState.columnState;

          // Merge sort model into column state if it exists
          if (
            persistedState.sortModel &&
            Array.isArray(persistedState.sortModel) &&
            persistedState.sortModel.length > 0
          ) {
            const sortMap = new Map(
              persistedState.sortModel.map((sort: any) => [sort.colId, sort]),
            );

            columnStateToApply = persistedState.columnState.map((col: any) => {
              const sortInfo = sortMap.get(col.colId) as
                | { sort: string; sortIndex?: number }
                | undefined;
              if (sortInfo) {
                return {
                  ...col,
                  sort: sortInfo.sort,
                  sortIndex: sortInfo.sortIndex,
                };
              }
              return col;
            });
          }

          // Clean pinned property
          const cleanedState = columnStateToApply.map((col: any) => ({
            ...col,
            pinned: null,
          }));

          if (cleanedState.length > 0) {
            api.applyColumnState({
              state: cleanedState,
              applyOrder: true,
              defaultState: { sort: null },
            });
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn('Failed to load persisted grid state:', message);
      }
    },
    [persistenceKey],
  );

  /**
   * Handler for column state change events.
   * Debounced to avoid excessive saves.
   */
  const onColumnStateChanged = useCallback(
    (event: ColumnStateEvent) => {
      if (!persistenceKey) return;

      // Clear previous timeout to debounce rapid changes
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (event.api) {
          saveColumnState(event.api);
        }
      }, 50);
    },
    [persistenceKey, saveColumnState],
  );

  return {
    onColumnStateChanged,
    restoreColumnState,
  };
}
