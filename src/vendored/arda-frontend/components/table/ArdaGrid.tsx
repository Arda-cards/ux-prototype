'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  GridOptions,
  GridState,
  IHeaderParams,
  SelectionChangedEvent,
  SortChangedEvent,
  RowClickedEvent,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Import Arda theme styles
import './ArdaGrid.css';

export interface ArdaGridRef {
  getGridApi: () => GridApi | null;
  refreshData: () => void;
  getSelectedRows: () => unknown[];
  selectAll: () => void;
  deselectAll: () => void;
  exportDataAsCsv: () => void;
}

export interface ArdaGridProps<T = any> {
  // Data
  rowData: T[];

  // Column configuration
  columnDefs: ColDef<T>[];
  defaultColDef?: ColDef<T>;

  // Grid options
  gridOptions?: GridOptions<T>;

  // Data loading states
  loading?: boolean;
  error?: string | null;

  // Selection
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  onSelectionChanged?: (selectedRows: T[]) => void;
  selectedItems?: T[]; // External selection tracking
  totalSelectedCount?: number; // Total count of selected items across all pages
  maxItemsSeen?: number; // Maximum number of items seen across all pages (for accumulated range display)

  // Sorting
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  onSortChanged?: (sortModel: any) => void;

  // Filtering
  enableFiltering?: boolean;
  onFilterChanged?: (filterModel: any) => void;

  // Row actions
  enableRowActions?: boolean;
  rowActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (rowData: T) => void;
  }>;

  // Persistence
  enableColumnStatePersistence?: boolean;
  persistenceKey?: string;
  onColumnStateChange?: (columnState: any[]) => boolean | void; // Callback to check if we should save state

  // Initial grid state (AG Grid v31+ native persistence — applied once at grid creation)
  initialState?: GridState;

  // Server-side data
  onGridReady?: (params: GridReadyEvent<T>) => void;

  // Styling
  className?: string;
  height?: string | number;

  // Callbacks
  onRowClicked?: (rowData: T) => void;
  onRowDoubleClicked?: (rowData: T) => void;

  // Cell editing (spreadsheet-like, double-click to edit)
  enableCellEditing?: boolean;
  onCellEditingStarted?: (event: {
    data: T;
    column: { getColId: () => string };
    node: { data: T };
  }) => void;
  onCellValueChanged?: (event: {
    data: T;
    oldValue: unknown;
    newValue: unknown;
    column: { getColId: () => string };
    node: { data: T };
  }) => void;
  onCellEditingStopped?: (event: {
    data: T;
    column: { getColId: () => string };
    node: { data: T };
  }) => void;
  onCellFocused?: (event: {
    api: {
      getFocusedCell: () => { rowIndex: number } | null;
      getDisplayedRowAtIndex: (i: number) => { data?: T } | undefined;
    };
  }) => void;
  getRowClass?: (params: {
    data: T;
    node: { data: T };
  }) => string | string[] | undefined;

  // Pagination
  paginationData?: {
    currentIndex?: number; // Optional for backward compatibility
    currentPageSize: number;
    totalItems: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onFirstPage?: () => void;

  // Empty state
  emptyStateComponent?: React.ReactNode;
  hasActiveSearch?: boolean;
}

// ─── Sort menu header component ───────────────────────────────────────────────
// Renders column name + optional ↑/↓ indicator + ⋮ button that opens a
// sort dropdown (portal into document.body to escape overflow:hidden).
const SortMenuHeader: React.FC<IHeaderParams> = (params) => {
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(() => {
    const s = params.column.getSort?.() ?? null;
    return s === 'asc' || s === 'desc' ? s : null;
  });
  const [menuAnchor, setMenuAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Keep sortDir in sync with AG Grid's column sort state
  useEffect(() => {
    const syncSort = () => {
      const s = params.column.getSort?.() ?? null;
      setSortDir(s === 'asc' || s === 'desc' ? s : null);
    };
    params.column.addEventListener('sortChanged', syncSort);
    return () => {
      params.column.removeEventListener('sortChanged', syncSort);
    };
  }, [params.column]);

  // Close menu on outside click (but not if click is on the button or inside dropdown)
  useEffect(() => {
    if (!menuAnchor) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest('.arda-sort-menu-dropdown')
      )
        return;
      setMenuAnchor(null);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuAnchor]);

  // Toggle menu open / closed using functional state update (stable callback)
  const openMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAnchor((prev) => {
      if (prev) return null;
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return { top: rect.bottom + 4, left: rect.left };
    });
  }, []);

  const applySort = useCallback(
    (dir: 'asc' | 'desc' | null) => {
      params.setSort(dir);
      setMenuAnchor(null);
    },
    [params],
  );

  return (
    <div className='arda-sort-header'>
      <span className='arda-sort-header-text'>{params.displayName}</span>
      {sortDir && (
        <span className='arda-sort-header-icon' aria-hidden='true'>
          {sortDir === 'asc' ? '↑' : '↓'}
        </span>
      )}
      {params.enableSorting && (
        <button
          ref={btnRef}
          className={`arda-sort-header-btn${sortDir ? ' arda-sort-header-btn-active' : ''}`}
          onClick={openMenu}
          title='Sort options'
          aria-label='Sort options'
          aria-expanded={menuAnchor !== null}
        >
          ⋮
        </button>
      )}
      {menuAnchor !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className='arda-sort-menu-dropdown'
            style={{ top: menuAnchor.top, left: menuAnchor.left }}
          >
            <button onClick={() => applySort('asc')}>
              <span aria-hidden='true'>↑</span> Sort Ascending
            </button>
            <button onClick={() => applySort('desc')}>
              <span aria-hidden='true'>↓</span> Sort Descending
            </button>
            {sortDir && (
              <button onClick={() => applySort(null)}>
                <span aria-hidden='true'>↕</span> Clear Sort
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

SortMenuHeader.displayName = 'SortMenuHeader';

// ──────────────────────────────────────────────────────────────────────────────

const ArdaGrid = forwardRef<ArdaGridRef, ArdaGridProps>(
  (
    {
      rowData,
      columnDefs,
      defaultColDef,
      gridOptions = {},
      loading = false,
      error = null,
      enableRowSelection = true,
      enableMultiRowSelection = true,
      onSelectionChanged,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      selectedItems = [], // Used in commented pagination range display (line 1000-1002)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      totalSelectedCount, // Used in commented pagination range display (line 1000-1002)
      enableSorting = true,
      enableMultiSort = true,
      onSortChanged,
      enableFiltering = true,
      onFilterChanged,
      enableRowActions = false,
      rowActions = [],
      enableColumnStatePersistence = true,
      persistenceKey = 'arda-grid-state',
      onColumnStateChange,
      onGridReady,
      className = '',
      height = '100%',
      onRowClicked,
      onRowDoubleClicked,
      enableCellEditing = false,
      onCellEditingStarted,
      onCellValueChanged,
      onCellEditingStopped,
      onCellFocused,
      getRowClass,
      paginationData,
      onNextPage,
      onPreviousPage,
      onFirstPage,
      emptyStateComponent,
      hasActiveSearch = false,
      initialState,
    },
    ref,
  ) => {
    const gridRef = useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const isApplyingPersistedStateRef = useRef(false);
    const justMovedColumnRef = useRef(false); // Flag to prevent other events from overwriting column move
    const lastManualMoveTimeRef = useRef<number>(0); // Track when user manually moved a column
    const previousPersistenceKeyRef = useRef<string | undefined>(
      persistenceKey,
    );

    // Expose imperative API
    useImperativeHandle(ref, () => ({
      getGridApi: () => gridApi,
      refreshData: () => {
        if (gridApi) {
          gridApi.refreshCells();
        }
      },
      getSelectedRows: () => {
        if (gridApi) {
          return gridApi.getSelectedRows();
        }
        return [];
      },
      selectAll: () => {
        if (gridApi) {
          gridApi.selectAll();
        }
      },
      deselectAll: () => {
        if (gridApi) {
          gridApi.deselectAll();
        }
      },
      exportDataAsCsv: () => {
        if (gridApi) {
          gridApi.exportDataAsCsv();
        }
      },
    }));

    // Handle grid ready
    const handleGridReady = useCallback(
      (params: GridReadyEvent) => {
        setGridApi(params.api);

        // Expose the gridApi on window so E2E tests can sort/filter programmatically
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
          (window as unknown as Record<string, unknown>).__ag_grid_api = params.api;
        }

        // Initialize the previous persistence key ref
        previousPersistenceKeyRef.current = persistenceKey;

        // Load persisted column state and sort model
        // Apply immediately to avoid visual lag
        if (enableColumnStatePersistence) {
          const savedState = localStorage.getItem(persistenceKey);
          if (savedState) {
            try {
              const persistedState = JSON.parse(savedState);

              // Apply persisted state immediately to avoid visual lag
              const applyPersistedState = () => {
                // Don't apply persisted state if user just manually moved a column (within last 3 seconds)
                const timeSinceLastMove =
                  Date.now() - lastManualMoveTimeRef.current;
                if (timeSinceLastMove < 3000) {
                  isApplyingPersistedStateRef.current = false;
                  return; // Skip applying persisted state if user just moved columns
                }

                // Set flag to prevent saving state while applying persisted state
                isApplyingPersistedStateRef.current = true;

                // Handle backward compatibility: if it's an array, it's the old format
                if (Array.isArray(persistedState)) {
                  // Clean pinned property: no columns should be pinned
                  const cleanedState = persistedState.map((col: any) => {
                    return {
                      ...col,
                      pinned: null,
                    };
                  });

                  // Apply with order immediately
                  params.api.applyColumnState({
                    state: cleanedState,
                    applyOrder: true,
                  });

                  // Clear flag after a delay to ensure state is fully applied
                  setTimeout(() => {
                    isApplyingPersistedStateRef.current = false;
                  }, 1500); // Increased to 1.5 seconds to ensure all events have processed
                } else {
                  // New format: object with columnState and sortModel
                  if (
                    persistedState.columnState &&
                    Array.isArray(persistedState.columnState)
                  ) {
                    // Merge sort model into column state if it exists
                    let columnStateToApply = persistedState.columnState;

                    if (
                      persistedState.sortModel &&
                      Array.isArray(persistedState.sortModel) &&
                      persistedState.sortModel.length > 0
                    ) {
                      // Create a map of sort by colId for quick lookup
                      const sortMap = new Map(
                        persistedState.sortModel.map((sort: any) => [
                          sort.colId,
                          sort,
                        ]),
                      );

                      // Merge sort information into column state
                      columnStateToApply = persistedState.columnState.map(
                        (col: any) => {
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
                        },
                      );
                    }

                    // Clean pinned property: no columns should be pinned
                    const cleanedState = columnStateToApply.map((col: any) => {
                      return {
                        ...col,
                        pinned: null,
                      };
                    });

                    // Apply column state with order
                    if (cleanedState.length > 0) {
                      params.api.applyColumnState({
                        state: cleanedState,
                        applyOrder: true,
                        defaultState: { sort: null },
                      });

                      // Clear flag after a delay to ensure state is fully applied
                      // Use a longer delay to prevent any events from triggering saves
                      setTimeout(() => {
                        isApplyingPersistedStateRef.current = false;
                      }, 1500); // Increased to 1.5 seconds to ensure all events have processed
                    } else {
                      isApplyingPersistedStateRef.current = false;
                    }
                  }
                }
              };

              // Apply state with a delay to ensure columns are fully initialized
              // When component remounts (e.g., navigating back from dashboard), columns need time to be ready
              setTimeout(() => {
                applyPersistedState();
              }, 200);
            } catch (error) {
              console.warn('Failed to load persisted grid state:', error);
            }
          }
        }

        onGridReady?.(params);
      },
      [enableColumnStatePersistence, persistenceKey, onGridReady],
    );

    // Apply persisted state when persistenceKey changes (e.g., when switching tabs)
    // Only apply when the key actually changes, not on every render
    useEffect(() => {
      if (!gridApi || !enableColumnStatePersistence) {
        return;
      }

      // Only apply if persistenceKey actually changed (tab switch)
      if (previousPersistenceKeyRef.current === persistenceKey) {
        return;
      }

      // Update the ref to track the current key
      previousPersistenceKeyRef.current = persistenceKey;

      const applyPersistedState = () => {
        // Don't apply persisted state if user just manually moved a column (within last 3 seconds)
        const timeSinceLastMove = Date.now() - lastManualMoveTimeRef.current;
        if (timeSinceLastMove < 3000) {
          return; // Skip applying persisted state if user just moved columns
        }

        const savedState = localStorage.getItem(persistenceKey);
        if (savedState) {
          try {
            const persistedState = JSON.parse(savedState);

            // Set flag to prevent saving while applying persisted state
            isApplyingPersistedStateRef.current = true;

            const applyState = (retryCount = 0) => {
              // Ensure columns are available and grid is ready
              const columns = gridApi.getColumns();

              if (!columns || columns.length === 0) {
                // Retry up to 30 times (1.5 seconds total) to ensure columns are ready
                if (retryCount < 30) {
                  setTimeout(() => applyState(retryCount + 1), 50);
                } else {
                  isApplyingPersistedStateRef.current = false;
                }
                return;
              }

              // Also check if we have at least some column definitions
              if (columns.length < 2) {
                // Not enough columns yet, retry
                if (retryCount < 30) {
                  setTimeout(() => applyState(retryCount + 1), 50);
                } else {
                  isApplyingPersistedStateRef.current = false;
                }
                return;
              }

              if (Array.isArray(persistedState)) {
                // Old format: array of column states
                const cleanedState = persistedState
                  .filter((col: any) => col.colId)
                  .map((col: any) => ({
                    ...col,
                    pinned: null,
                  }));

                if (cleanedState.length > 0) {
                  gridApi.applyColumnState({
                    state: cleanedState,
                    applyOrder: true,
                  });
                }
              } else if (
                persistedState.columnState &&
                Array.isArray(persistedState.columnState)
              ) {
                // New format: object with columnState
                let columnStateToApply = persistedState.columnState.filter(
                  (col: any) => col.colId,
                );

                if (
                  persistedState.sortModel &&
                  Array.isArray(persistedState.sortModel) &&
                  persistedState.sortModel.length > 0
                ) {
                  const sortMap = new Map(
                    persistedState.sortModel.map((sort: any) => [
                      sort.colId,
                      sort,
                    ]),
                  );
                  columnStateToApply = columnStateToApply.map((col: any) => {
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

                const cleanedState = columnStateToApply.map((col: any) => ({
                  ...col,
                  pinned: null,
                }));

                if (cleanedState.length > 0) {
                  gridApi.applyColumnState({
                    state: cleanedState,
                    applyOrder: true,
                    defaultState: { sort: null },
                  });
                } else {
                  console.warn(
                    `[GRID_PERSISTENCE] No columns to apply (cleanedState is empty)`,
                  );
                }
              }

              // Clear flag after a delay to ensure all events have processed
              // Use a longer delay to prevent interfering with column moves
              setTimeout(() => {
                isApplyingPersistedStateRef.current = false;
              }, 1500); // Increased to 1.5 seconds to ensure state is fully applied and doesn't interfere with moves
            };

            // Apply immediately - the retry logic will handle if columns aren't ready
            applyState();
          } catch (error) {
            console.warn(
              'Failed to load persisted grid state on key change:',
              error,
            );
            isApplyingPersistedStateRef.current = false;
          }
        } else {
          // If no saved state, ensure flag is cleared
          isApplyingPersistedStateRef.current = false;
        }
      };

      // Apply persisted state when key changes
      applyPersistedState();
    }, [gridApi, enableColumnStatePersistence, persistenceKey]);

    // Handle selection changes
    const handleSelectionChanged = useCallback(
      (event: SelectionChangedEvent) => {
        const selectedRows = event.api.getSelectedRows();
        onSelectionChanged?.(selectedRows);
      },
      [onSelectionChanged],
    );

    // Handle sort changes
    const handleSortChanged = useCallback(
      (event: SortChangedEvent) => {
        const sortModel = event.api.getColumnState();
        onSortChanged?.(sortModel);
      },
      [onSortChanged],
    );

    // Handle filter changes
    const handleFilterChanged = useCallback(
      (event: any) => {
        const filterModel = event.api.getFilterModel();
        onFilterChanged?.(filterModel);
      },
      [onFilterChanged],
    );

    // Save column state and sort model when they change
    useEffect(() => {
      if (gridApi && enableColumnStatePersistence) {
        const saveGridState = () => {
          // Small delay to ensure the state is fully updated
          setTimeout(() => {
            // Don't save if we're applying persisted state
            if (isApplyingPersistedStateRef.current) {
              return;
            }

            // Don't save if we just moved a column (let handleColumnMoved handle it)
            if (justMovedColumnRef.current) {
              return;
            }

            // Get the full column state - this has the correct order and all properties
            const fullColumnState = gridApi.getColumnState();
            if (!fullColumnState || fullColumnState.length === 0) return;

            // Use getColumnState() directly - it already has the correct order and all properties
            // Include colId, hide (visibility), width, and sort to ensure complete persistence
            // This matches the same structure used in handleColumnMoved for consistency
            const columnState = fullColumnState.map((col: any) => ({
              colId: col.colId,
              hide: col.hide,
              width: col.width,
              sort: col.sort,
              sortIndex: col.sortIndex,
              pinned: null, // Ensure no columns are pinned
            }));

            // Check if we should save (e.g., if updating from props, don't save)
            if (onColumnStateChange) {
              const result = onColumnStateChange(columnState);
              if (
                result === false ||
                (result === undefined && isApplyingPersistedStateRef.current)
              ) {
                return;
              }
            }

            // Extract sort model from column state (columns with sort defined)
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
          }, 50);
        };

        // Handler for column visibility changes - preserve order when hiding/showing
        // This works exactly like handleColumnMoved to ensure consistent persistence
        const handleColumnVisible = () => {
          // Save state preserving the current order and visibility
          // Use same delay as columnMoved to ensure visibility change is complete
          setTimeout(() => {
            // Don't save if we're applying persisted state
            if (isApplyingPersistedStateRef.current) {
              return;
            }

            // Don't save if we just moved a column (let handleColumnMoved handle it)
            if (justMovedColumnRef.current) {
              return;
            }

            // Get the full column state - this has the correct order, visibility (hide), and all properties
            const fullColumnState = gridApi.getColumnState();
            if (!fullColumnState || fullColumnState.length === 0) return;

            // Use getColumnState() directly - it already has the correct order, colId, hide, and all properties
            // This includes both the column order (via the array order) and visibility (via hide property)
            const columnState = fullColumnState.map((col: any) => ({
              colId: col.colId,
              hide: col.hide,
              width: col.width,
              sort: col.sort,
              sortIndex: col.sortIndex,
              pinned: null, // Ensure no columns are pinned
            }));

            // Check if we should save
            if (onColumnStateChange) {
              const result = onColumnStateChange(columnState);
              if (result === false) {
                return;
              }
            }

            // Double-check flag hasn't changed
            if (isApplyingPersistedStateRef.current) {
              return;
            }

            // Extract sort model from column state
            const sortModel = columnState
              .filter((col: any) => col.sort !== null && col.sort !== undefined)
              .map((col: any) => ({
                colId: col.colId,
                sort: col.sort,
                sortIndex: col.sortIndex,
              }));

            // Save complete state including colId, hide (visibility), order, and sort
            const gridState = {
              columnState,
              sortModel,
            };

            localStorage.setItem(persistenceKey, JSON.stringify(gridState));
          }, 200); // Same delay as columnMoved to ensure consistency
        };

        // Handler for column moves - save state immediately to prevent other events from overwriting
        const handleColumnMoved = () => {
          // Track that user manually moved a column
          lastManualMoveTimeRef.current = Date.now();

          // Set flag to prevent other events from saving state
          justMovedColumnRef.current = true;

          // Save state preserving the current order
          // Use a delay to ensure the move is complete
          setTimeout(() => {
            // Don't save if we're applying persisted state
            if (isApplyingPersistedStateRef.current) {
              justMovedColumnRef.current = false;
              return;
            }

            // Get the full column state - this has the correct order and all properties
            const fullColumnState = gridApi.getColumnState();
            if (!fullColumnState || fullColumnState.length === 0) {
              justMovedColumnRef.current = false;
              return;
            }

            // Use getColumnState() directly - it already has the correct order and all properties
            // Include colId, hide (visibility), width, and sort to ensure complete persistence
            // This ensures visibility and order are persisted together consistently
            const columnState = fullColumnState.map((col: any) => ({
              colId: col.colId,
              hide: col.hide,
              width: col.width,
              sort: col.sort,
              sortIndex: col.sortIndex,
              pinned: null, // Ensure no columns are pinned
            }));

            // Check if we should save
            if (onColumnStateChange) {
              const result = onColumnStateChange(columnState);
              if (result === false) {
                justMovedColumnRef.current = false;
                return;
              }
            }

            // Double-check flag hasn't changed
            if (isApplyingPersistedStateRef.current) {
              justMovedColumnRef.current = false;
              return;
            }

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

            // Clear flag after a delay to allow other events to save again
            setTimeout(() => {
              justMovedColumnRef.current = false;
            }, 2000); // Keep flag active for 2 seconds to prevent other events from overwriting
          }, 200); // Delay to ensure move is complete
        };

        // Save when columns are resized
        gridApi.addEventListener('columnResized', saveGridState);

        // Save when visibility changes (preserving order)
        gridApi.addEventListener('columnVisible', handleColumnVisible);

        // Save immediately when columns are moved - uses same handler as visibility
        gridApi.addEventListener('columnMoved', handleColumnMoved);

        // Save when sorting changes
        gridApi.addEventListener('sortChanged', saveGridState);

        return () => {
          gridApi.removeEventListener('columnResized', saveGridState);
          gridApi.removeEventListener('columnVisible', handleColumnVisible);
          gridApi.removeEventListener('columnMoved', handleColumnMoved);
          gridApi.removeEventListener('sortChanged', saveGridState);
        };
      }
    }, [
      gridApi,
      enableColumnStatePersistence,
      persistenceKey,
      onColumnStateChange,
    ]);

    // Default column definition
    const defaultColumnDef: ColDef = {
      // Custom header with sort menu (columns with their own headerComponent override this)
      headerComponent: SortMenuHeader,
      sortable: enableSorting,
      filter: enableFiltering,
      resizable: true,
      suppressHeaderMenuButton: true,
      suppressMovable: false,
      ...defaultColDef,
    };

    // Grid options with Arda theme
    const mergedGridOptions: GridOptions = {
      // Theme - use legacy theme to avoid conflicts with CSS files
      theme: 'legacy',

      // Selection — use object form (v33+ API); enableClickSelection:false replaces
      // the deprecated suppressRowClickSelection:true
      rowSelection: enableRowSelection
        ? {
            mode: enableMultiRowSelection ? 'multiRow' : 'singleRow',
            enableClickSelection: false,
          }
        : undefined,

      // Sorting
      multiSortKey: enableMultiSort ? 'ctrl' : undefined,

      // Styling
      headerHeight: 48,
      rowHeight: 48,

      // Performance
      suppressColumnVirtualisation: false,
      suppressRowVirtualisation: false,

      // Column dragging
      suppressColumnMoveAnimation: true,

      // Use entityId as stable row ID for proper selection tracking
      getRowId: (params) => {
        // Try common id fields from data
        const data = params.data as any;
        if (data?.entityId) return data.entityId;
        if (data?.id) return data.id;
        if (data?.eId) return data.eId;
        // Fallback: generate unique ID based on data
        return `row-${JSON.stringify(data).slice(0, 50)}`;
      },

      // Cell editing: double-click only, keyboard (Enter/Tab), blur to stop
      ...(enableCellEditing && {
        singleClickEdit: false,
        stopEditingWhenCellsLoseFocus: true,
        enterNavigatesVertically: true,
        enterNavigatesVerticallyAfterEdit: true,
        ...(getRowClass && { getRowClass }),
      }),

      // Move popup editors (isPopup:true) to document.body so they are not
      // clipped by the grid's overflow:hidden container
      popupParent: typeof document !== 'undefined' ? document.body : undefined,

      // Default cell renderer for actions
      defaultColDef: defaultColumnDef,

      ...gridOptions,
    };

    // Add row actions column if enabled
    const finalColumnDefs =
      enableRowActions && rowActions.length > 0
        ? [
            ...columnDefs,
            {
              headerName: 'Actions',
              field: 'actions',
              width: 120,
              pinned: 'right',
              sortable: false,
              filter: false,
              resizable: false,
              cellRenderer: (params: any) => {
                return (
                  <div className='flex items-center gap-1'>
                    {rowActions.map((action, index) => (
                      <button
                        key={index}
                        className='p-1 hover:bg-gray-100 rounded'
                        onClick={() => action.onClick(params.data)}
                        title={action.label}
                      >
                        {action.icon || action.label}
                      </button>
                    ))}
                  </div>
                );
              },
            } as ColDef,
          ]
        : columnDefs;

    // Loading overlay component
    const LoadingOverlay = () => {
      if (!loading) return null;
      return (
        <div className='flex items-center justify-center h-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
        </div>
      );
    };

    // Error overlay component
    const ErrorOverlay = () => {
      if (!error) return null;
      return (
        <div className='flex items-center justify-center h-full text-red-500'>
          <div className='text-center'>
            <p className='text-lg font-semibold'>Error loading data</p>
            <p className='text-sm'>{error}</p>
          </div>
        </div>
      );
    };

    // Empty state overlay component
    const EmptyStateOverlay = () => {
      if (loading || error || rowData.length > 0 || !emptyStateComponent) {
        return null;
      }
      return (
        <div
          className='flex items-center justify-center h-full w-full'
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className='flex items-center justify-center w-full'
            style={{ pointerEvents: 'auto' }}
          >
            {emptyStateComponent}
          </div>
        </div>
      );
    };

    // No search results overlay component
    const NoSearchResultsOverlay = () => {
      if (loading || error || rowData.length > 0) {
        return null;
      }
      return (
        <div
          className='flex items-center justify-center h-full w-full'
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className='flex items-center justify-center w-full'
            style={{ pointerEvents: 'auto' }}
          >
            <div className='w-full flex flex-col items-center  px-6 py-6 sm:px-10 md:px-24 lg:px-32 '>
              <div className='flex flex-col items-center gap-2 w-full'>
                <h2 className='text-lg sm:text-xl font-semibold text-[#0A0A0A] leading-7 text-center'>
                  No items found
                </h2>
                <p className='text-xs sm:text-sm text-[#737373] leading-5 text-center'>
                  Try adjusting your search criteria
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };

    // Combined no rows overlay component
    const NoRowsOverlay = () => {
      if (error) return <ErrorOverlay />;
      if (!loading && !error && rowData.length === 0) {
        if (hasActiveSearch) {
          return <NoSearchResultsOverlay />;
        }
        if (emptyStateComponent) {
          return <EmptyStateOverlay />;
        }
      }
      return null;
    };

    // Wrap row click handler to prevent opening panel when clicking checkbox
    const handleRowClicked = useCallback(
      (event: RowClickedEvent) => {
        if (!onRowClicked) return;

        if (!event.data) return;

        const nativeEvent = event.event;
        const stopAndReturn = () => {
          nativeEvent?.stopPropagation?.();
        };

        if (nativeEvent) {
          const target = nativeEvent.target as HTMLElement;

          if (
            target?.closest?.('input, textarea, select, [role="listbox"]')
          ) {
            stopAndReturn();
            return;
          }
          if (
            target?.tagName === 'INPUT' &&
            (target as HTMLInputElement).type === 'checkbox'
          ) {
            stopAndReturn();
            return;
          }

          if (target?.closest('.ag-cell[col-id="select"]')) {
            stopAndReturn();
            return;
          }
          if (target?.closest('[col-id="select"]')) {
            stopAndReturn();
            return;
          }
          if (target?.closest('.ag-cell[col-id="quickActions"]')) {
            stopAndReturn();
            return;
          }
          if (target?.closest('[col-id="quickActions"]')) {
            stopAndReturn();
            return;
          }
          if (target?.closest('.ag-cell[col-id="notes"]')) {
            stopAndReturn();
            return;
          }
          if (target?.closest('[col-id="notes"]')) {
            stopAndReturn();
            return;
          }
        }

        const editingCells = event.api?.getEditingCells?.() ?? [];
        if (editingCells.length > 0) {
          stopAndReturn();
          return;
        }

        // Safe to call the row click handler with the row data
        onRowClicked(event.data);
      },
      [onRowClicked],
    );

    const withPagination = Boolean(paginationData);

    return (
      <div className={`arda-grid-container ${className}`} style={{ height }}>
        <div
          className={`ag-theme-arda h-full ${withPagination ? 'arda-grid-with-pagination' : ''}`}
        >
          <div
            className={
              withPagination
                ? 'arda-grid-body-wrap'
                : 'arda-grid-body-wrap h-full min-h-0'
            }
          >
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={finalColumnDefs}
              defaultColDef={defaultColumnDef}
              gridOptions={mergedGridOptions}
              initialState={initialState}
              onGridReady={handleGridReady}
              onSelectionChanged={handleSelectionChanged}
              onSortChanged={handleSortChanged}
              onFilterChanged={handleFilterChanged}
              onRowClicked={handleRowClicked}
              onRowDoubleClicked={onRowDoubleClicked}
              onCellEditingStarted={onCellEditingStarted}
              onCellValueChanged={onCellValueChanged}
              onCellEditingStopped={onCellEditingStopped}
              onCellFocused={onCellFocused}
              loadingOverlayComponent={LoadingOverlay}
              noRowsOverlayComponent={NoRowsOverlay}
            />
          </div>

          {paginationData && (
            <div className='ag-pagination-footer'>
              <div className='pagination-content'>
                {/* Range display */}
                {/* <div className='pagination-range'>
                  {loading ? (
                    <span className='flex items-center gap-1'>
                      <div className='animate-spin rounded-full h-3 w-3 border-b border-current'></div>
                      Loading...
                    </span>
                  ) : (
                    (() => {
                      // Calculate pagination display values
                      // X = number of selected items
                      const X = totalSelectedCount !== undefined
                        ? totalSelectedCount
                        : selectedItems.length;
                      
                      // PageNumber starts at 0, but currentPage starts at 1
                      const pageNumber = (paginationData.currentPage || 1) - 1;
                      const pageSize = paginationData.currentPageSize || 50;
                      const numRecordsInPage = rowData.length;
                      
                      // Y = PageNumber * PageSize + NumRecordsInPage (last record index)
                      const Y = pageNumber * pageSize + numRecordsInPage;
                      
                      return (
                        <span>
                          <span className='font-bold'>{X}</span> to{' '}
                          <span className='font-bold'>{Y}</span>
                        </span>
                      );
                    })()
                  )}
                </div> */}

                {/* Navigation controls */}
                <div className='pagination-controls'>
                  {/* First page button */}
                  <button
                    onClick={onFirstPage}
                    disabled={!paginationData.hasPreviousPage || loading}
                    className='pagination-button'
                    title='First page'
                  >
                    <div>K</div>
                  </button>

                  {/* Previous page button */}
                  <button
                    onClick={onPreviousPage}
                    disabled={!paginationData.hasPreviousPage || loading}
                    className='pagination-button'
                    title='Previous page'
                  >
                    <>&lt;</>
                  </button>

                  {/* Page indicator */}
                  <div className='pagination-page-info'>
                    Page{' '}
                    <span className='font-bold'>
                      {paginationData.currentPage}
                    </span>
                  </div>

                  {/* Next page button */}
                  <button
                    onClick={onNextPage}
                    disabled={!paginationData.hasNextPage}
                    className='pagination-button'
                    title='Next page'
                  >
                    <>&gt;</>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

ArdaGrid.displayName = 'ArdaGrid';

export default ArdaGrid;
