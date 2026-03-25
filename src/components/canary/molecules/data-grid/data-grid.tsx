'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  type GridOptions,
  type SelectionChangedEvent,
  type CellValueChangedEvent,
  type CellEditingStoppedEvent,
  type RowClickedEvent,
  type RowClassParams,
} from 'ag-grid-community';
import '@/styles/canary/ag-theme-arda.css';
import type { PaginationData } from '@/types/canary/utilities/pagination';
import { useColumnPersistence } from './use-column-persistence';
import { SortMenuHeader } from './sort-menu-header';

// --- Theme ---

// Structural params — sizes, booleans, layout. Colors come from CSS vars below.
const dataGridTheme = themeQuartz.withParams({
  fontFamily: 'var(--font-geist-sans)',
  fontSize: 14,
  headerFontSize: 13,
  headerFontWeight: 600,
  headerColumnBorder: true,
  headerColumnBorderHeight: '50%',
  headerColumnResizeHandleHeight: '50%',
  headerColumnResizeHandleWidth: 1,
  columnBorder: false,
  wrapperBorder: true,
  wrapperBorderRadius: 8,
  rowHeight: 48,
  headerHeight: 36,
  popupShadow: '0 4px 16px color-mix(in srgb, var(--foreground) 12%, transparent)',
  checkboxBorderWidth: 2,
  checkboxBorderRadius: 4,
  inputFocusBorder: 'none',
  cellHorizontalPadding: 12,
  spacing: 6,
});

// Color tokens — maps AG Grid CSS vars to design-system tokens from tokens.css.
// Set on the grid container div so they cascade into AG Grid's internals.
const dataGridColorVars: React.CSSProperties = {
  '--ag-background-color': 'var(--background)',
  '--ag-foreground-color': 'var(--foreground)',
  '--ag-border-color': 'var(--border)',
  '--ag-accent-color': 'var(--primary)',
  '--ag-header-text-color': 'var(--foreground)',
  '--ag-header-background-color': 'var(--secondary)',
  '--ag-header-cell-hover-background-color': 'var(--border)',
  '--ag-header-cell-moving-background-color': 'var(--border)',
  '--ag-header-column-resize-handle-color': 'var(--border)',
  '--ag-row-border-color': 'var(--secondary)',
  '--ag-odd-row-background-color': 'var(--secondary)',
  '--ag-row-hover-color': 'var(--secondary)',
  '--ag-selected-row-background-color': 'var(--primary-muted)',
  '--ag-checkbox-unchecked-border-color': 'var(--muted-foreground)',
  '--ag-checkbox-unchecked-background-color': 'var(--background)',
} as React.CSSProperties;

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Re-export PaginationData from the canonical canary location
export type { PaginationData } from '@/types/canary/utilities/pagination';

export interface DataGridStaticConfig<T = Record<string, any>> {
  /* --- Model / Data Binding --- */
  columnDefs: ColDef<T>[];
  defaultColDef?: ColDef<T>;

  /* --- View / Layout / Controller --- */
  persistenceKey?: string;
  height?: string | number;
  className?: string;
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  enableSorting?: boolean;
}

export interface DataGridInitConfig<T> {
  /* --- Model / Data Binding --- */
  onGridReady?: (params: GridReadyEvent<T>) => void;

  /* --- View / Layout / Controller --- */
  // (No view props in InitConfig)
}

export interface DataGridRuntimeConfig<T> {
  /* --- Model / Data Binding --- */
  rowData: T[];
  selectedItems?: T[];
  onSelectionChanged?: (selectedRows: T[]) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void;
  /** Called when a cell stops editing. Passes through to AG Grid. */
  onCellEditingStopped?: (event: CellEditingStoppedEvent<T>) => void;
  onRowClicked?: (event: RowClickedEvent<T>) => void;
  paginationData?: PaginationData;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onFirstPage?: () => void;
  /** Function to return extra CSS class(es) for a row. Used for row visual states. */
  getRowClass?: (params: RowClassParams<T>) => string | string[] | undefined;
  /**
  /* --- View / Layout / Controller --- */
  loading?: boolean;
  error?: string | null;
  enableCellEditing?: boolean;
  emptyStateComponent?: React.ReactNode;
  /** Enable AG Grid's built-in client-side pagination. */
  pagination?: boolean;
  /** Number of rows per page (client-side pagination). */
  paginationPageSize?: number;
  /** Whether to show the page-size selector (defaults to false when pagination is on). */
  paginationPageSizeSelector?: boolean;
  /** AG Grid layout mode. `'autoHeight'` makes the grid grow to fit content. */
  domLayout?: 'normal' | 'autoHeight' | 'print';
}

export interface DataGridProps<T>
  extends DataGridStaticConfig<T>, DataGridInitConfig<T>, DataGridRuntimeConfig<T> {}

export interface DataGridRef<T> {
  getGridApi: () => GridApi<T> | null;
  exportDataAsCsv: () => void;
}

// ============================================================================
// Internal Components
// ============================================================================

/**
 * GridImage - renders image with fallback for image columns
 */
export function GridImage({ value }: { value?: string }) {
  const [imageError, setImageError] = useState(false);

  if (!value) {
    return (
      <div
        className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded"
        title="No image"
      >
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  if (imageError) {
    return (
      <div
        className="flex items-center justify-center w-8 h-8 bg-red-50 rounded"
        title="Invalid image"
      >
        <svg
          className="w-4 h-4 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={value}
      alt=""
      className="w-8 h-8 object-cover rounded"
      onError={() => setImageError(true)}
    />
  );
}

/**
 * LoadingOverlay - shown when loading is true
 */
function LoadingOverlay() {
  return (
    <div className="flex items-center justify-center h-full" role="status" aria-label="Loading">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}

/**
 * ErrorOverlay - shown when error is present
 */
function ErrorOverlay({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-full text-red-500">
      <div className="text-center">
        <p className="text-lg font-semibold">Error loading data</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );
}

/**
 * EmptyStateOverlay - shown when no rows and emptyStateComponent provided
 */
function EmptyStateOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center h-full w-full"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-center w-full" style={{ pointerEvents: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * DefaultEmptyState - default empty state message
 */
function DefaultEmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No rows to display</p>
    </div>
  );
}

/**
 * PaginationFooter - internal pagination component
 */
function PaginationFooter({
  paginationData,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  loading,
}: {
  paginationData: PaginationData;
  onFirstPage?: () => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="ag-pagination-footer">
      <div className="pagination-content">
        {/* Navigation controls */}
        <div className="pagination-controls">
          {/* First page button */}
          <button
            type="button"
            onClick={onFirstPage}
            disabled={!paginationData.hasPreviousPage || loading}
            className="pagination-button"
            aria-label="First page"
          >
            <span aria-hidden="true">&laquo;</span>
          </button>

          {/* Previous page button */}
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={!paginationData.hasPreviousPage || loading}
            className="pagination-button"
            aria-label="Previous page"
          >
            <span aria-hidden="true">&lsaquo;</span>
          </button>

          {/* Page indicator */}
          <div className="pagination-page-info">
            Page <span className="font-bold">{paginationData.currentPage}</span>
          </div>

          {/* Next page button */}
          <button
            type="button"
            onClick={onNextPage}
            disabled={!paginationData.hasNextPage || loading}
            className="pagination-button"
            aria-label="Next page"
          >
            <span aria-hidden="true">&rsaquo;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export const DataGrid = forwardRef(
  <T extends Record<string, any>>(
    {
      // Static config
      columnDefs,
      defaultColDef,
      persistenceKey,
      height = 600,
      className = '',
      enableRowSelection = true,
      enableMultiRowSelection = true,
      enableSorting = true,

      // Init config
      onGridReady,

      // Runtime config
      rowData,
      loading = false,
      error = null,
      enableCellEditing = false,
      selectedItems: _selectedItems = [],
      onSelectionChanged,
      onCellValueChanged,
      onCellEditingStopped,
      onRowClicked,
      paginationData,
      onNextPage,
      onPreviousPage,
      onFirstPage,
      emptyStateComponent,
      getRowClass,
      pagination = false,
      paginationPageSize,
      paginationPageSizeSelector = false,
      domLayout,
    }: DataGridProps<T>,
    ref: React.Ref<DataGridRef<T>>,
  ) => {
    const gridRef = useRef<AgGridReact<T>>(null);
    const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);

    // Column persistence hook
    const { onColumnStateChanged, restoreColumnState } = useColumnPersistence(persistenceKey);

    // Expose imperative API
    useImperativeHandle(ref, () => ({
      getGridApi: () => gridApi,
      exportDataAsCsv: () => {
        if (gridApi) {
          gridApi.exportDataAsCsv();
        }
      },
    }));

    // Handle grid ready
    const handleGridReady = useCallback(
      (params: GridReadyEvent<T>) => {
        setGridApi(params.api);

        // Restore column state from localStorage
        if (persistenceKey) {
          restoreColumnState(params.api);
        }

        onGridReady?.(params);
      },
      [persistenceKey, restoreColumnState, onGridReady],
    );

    // Handle selection changes
    const handleSelectionChanged = useCallback(
      (event: SelectionChangedEvent<T>) => {
        const selectedRows = event.api.getSelectedRows();
        onSelectionChanged?.(selectedRows);
      },
      [onSelectionChanged],
    );

    // Handle row click - avoid triggering when clicking checkbox
    const handleRowClicked = useCallback(
      (event: RowClickedEvent<T>) => {
        if (!onRowClicked) return;

        // Check if clicking checkbox or select column
        const nativeEvent = event.event;
        if (nativeEvent) {
          const target = nativeEvent.target as HTMLElement;

          // Check if clicking checkbox
          if (target?.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
            return;
          }

          // Check if clicking inside select column
          if (target?.closest('.ag-cell[col-id="select"]')) {
            return;
          }
        }

        onRowClicked(event);
      },
      [onRowClicked],
    );

    // Row selection config using AG Grid native multiRow with header checkbox
    const rowSelection = useMemo(
      () =>
        enableRowSelection
          ? {
              mode: enableMultiRowSelection ? ('multiRow' as const) : ('singleRow' as const),
              headerCheckbox: enableMultiRowSelection,
              selectAll: 'all' as const,
              enableClickSelection: true as const,
            }
          : undefined,
      [enableRowSelection, enableMultiRowSelection],
    );

    // Default column definition — includes SortMenuHeader as headerComponent
    const mergedDefaultColDef: ColDef<T> = {
      sortable: enableSorting,
      resizable: true,
      suppressHeaderMenuButton: true,
      suppressMovable: false,
      headerComponent: SortMenuHeader,
      ...defaultColDef,
    };

    // Grid options
    const gridOptions: GridOptions<T> = {
      // Performance
      suppressColumnVirtualisation: false,
      suppressRowVirtualisation: false,

      // Column dragging
      suppressColumnMoveAnimation: true,

      // Row ID for selection tracking
      getRowId: (params) => {
        const data = params.data as Record<string, unknown>;
        if (data?.entityId) return String(data.entityId);
        if (data?.id) return String(data.id);
        if (data?.eId) return String(data.eId);
        return `row-${JSON.stringify(data).slice(0, 50)}`;
      },

      // Cell editing
      ...(enableCellEditing
        ? {
            singleClickEdit: false,
            stopEditingWhenCellsLoseFocus: false,
            enterNavigatesVertically: true,
            enterNavigatesVerticallyAfterEdit: true,
          }
        : {}),
    };

    // Combined no rows overlay
    const NoRowsOverlay = () => {
      if (error) return <ErrorOverlay error={error} />;
      if (emptyStateComponent) {
        return <EmptyStateOverlay>{emptyStateComponent}</EmptyStateOverlay>;
      }
      return <DefaultEmptyState />;
    };

    return (
      <div
        className={`arda-grid-container ${className}`}
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          ...dataGridColorVars,
        }}
      >
        <div className="ag-theme-arda h-full">
          <AgGridReact<T>
            ref={gridRef}
            theme={dataGridTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={mergedDefaultColDef}
            gridOptions={gridOptions}
            {...(rowSelection !== undefined ? { rowSelection } : {})}
            onGridReady={handleGridReady}
            onSelectionChanged={handleSelectionChanged}
            onRowClicked={handleRowClicked}
            {...(onCellValueChanged !== undefined ? { onCellValueChanged } : {})}
            {...(onCellEditingStopped !== undefined ? { onCellEditingStopped } : {})}
            {...(getRowClass !== undefined ? { getRowClass } : {})}
            onColumnMoved={onColumnStateChanged}
            onColumnResized={onColumnStateChanged}
            onColumnVisible={onColumnStateChanged}
            onSortChanged={onColumnStateChanged}
            {...(loading ? { loadingOverlayComponent: LoadingOverlay } : {})}
            noRowsOverlayComponent={NoRowsOverlay}
            {...(pagination ? { pagination, paginationPageSizeSelector } : {})}
            {...(pagination && paginationPageSize !== undefined ? { paginationPageSize } : {})}
            {...(domLayout !== undefined ? { domLayout } : {})}
          />

          {/* Pagination footer */}
          {paginationData && (
            <PaginationFooter
              paginationData={paginationData}
              {...(onFirstPage !== undefined ? { onFirstPage } : {})}
              {...(onPreviousPage !== undefined ? { onPreviousPage } : {})}
              {...(onNextPage !== undefined ? { onNextPage } : {})}
              loading={loading}
            />
          )}
        </div>
      </div>
    );
  },
) as <T extends Record<string, any>>(
  props: DataGridProps<T> & { ref?: React.Ref<DataGridRef<T>> },
) => React.ReactElement;

(DataGrid as unknown as { displayName: string }).displayName = 'DataGrid';
