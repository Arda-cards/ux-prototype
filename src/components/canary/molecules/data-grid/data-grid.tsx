'use client';

import React, {
  memo,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
} from 'react';
import { Search, Loader2, Package } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GridApi,
  type GridOptions,
  type GridReadyEvent,
  type RowClickedEvent,
  type RowClassParams,
  type CellValueChangedEvent,
  type CellEditingStoppedEvent,
  type SelectionChangedEvent,
} from 'ag-grid-community';
import '@/styles/canary/ag-theme-arda.css';
import { useDragToScroll } from './use-drag-to-scroll';

ModuleRegistry.registerModules([AllCommunityModule]);

// --- Theme ---

const gridTheme = themeQuartz.withParams({
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

const gridColorVars = {
  '--ag-background-color': 'var(--base-background)',
  '--ag-foreground-color': 'var(--base-foreground)',
  '--ag-border-color': 'var(--base-border)',
  '--ag-accent-color': 'var(--base-primary)',
  '--ag-header-text-color': 'var(--base-foreground)',
  '--ag-header-background-color': 'var(--secondary)',
  '--ag-header-cell-hover-background-color': 'var(--base-border)',
  '--ag-header-cell-moving-background-color': 'var(--base-border)',
  '--ag-header-column-resize-handle-color': 'var(--base-border)',
  '--ag-row-border-color': 'var(--secondary)',
  '--ag-odd-row-background-color': 'var(--secondary)',
  '--ag-row-hover-color': 'var(--secondary)',
  '--ag-selected-row-background-color': 'var(--accent-light)',
  '--ag-checkbox-unchecked-border-color': 'var(--base-muted-foreground)',
  '--ag-checkbox-unchecked-background-color': 'var(--base-background)',
} as React.CSSProperties;

const rowStateStyles = `
  .ag-row-saving { background-color: color-mix(in srgb, var(--base-primary) 6%, var(--base-background)) !important; }
  .ag-row-error  { background-color: color-mix(in srgb, var(--destructive) 8%, var(--base-background)) !important; }
`;

// --- Static config (hoisted outside component) ---

const staticGridOptions: GridOptions = {
  stopEditingWhenCellsLoseFocus: true,
  tooltipShowDelay: 400,
  tooltipShowMode: 'whenTruncated' as const,
  ensureDomOrder: true,
};

const AgGridMemo = memo(AgGridReact) as unknown as typeof AgGridReact;

// --- Internal components ---

function LoadingOverlay() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Loading…
    </div>
  );
}

function EmptyOverlay({ message }: { message?: string | undefined }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground">{message || 'No rows to display'}</p>
    </div>
  );
}

// --- Interfaces ---

export interface DataGridStaticConfig<T = Record<string, unknown>> {
  /** Column definitions. */
  columnDefs: ColDef<T>[];
  /** Default column definition applied to all columns. */
  defaultColDef?: ColDef<T>;
  /** Fixed height for the grid. Ignored when `autoHeight` is true. */
  height?: string | number;
  /** Grid grows to fit content. Disables vertical scroll. */
  autoHeight?: boolean;
  /** Enable row selection checkboxes. */
  enableRowSelection?: boolean;
  /** Enable cell editing (double-click or Enter to edit). */
  editable?: boolean;
  /** Enable pagination with page size. */
  pageSize?: number;
  /** Custom empty state message. */
  emptyMessage?: string;
  /** Custom empty state content — overrides emptyMessage. */
  emptyContent?: ReactNode;
  /** Pinned right-side actions column. Pass `actionCount` to auto-calculate width. */
  actionsColumn?: ColDef<T> & { actionCount?: number };
  /** Toolbar actions rendered to the right of the search bar. */
  toolbar?: ReactNode;
  /** Client-side search. Specify which fields to search across. */
  searchConfig?: { fields: string[]; placeholder?: string };
  /** Additional CSS class name. */
  className?: string;
}

export interface DataGridRuntimeConfig<T = Record<string, unknown>> {
  /** Row data array. */
  rowData: T[];
  /** Loading state. */
  loading?: boolean;
  /** Called when a row is clicked. */
  onRowClick?: (entity: T) => void;
  /** Called when selection changes. */
  onSelectionChange?: (entities: T[]) => void;
  /** Called when a cell value changes. */
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void;
  /** Called when cell editing stops. */
  onCellEditingStopped?: (event: CellEditingStoppedEvent<T>) => void;
  /** Function to compute extra CSS classes for a row. */
  getRowClass?: (params: RowClassParams<T>) => string | string[] | undefined;
  /** Ref to access AG Grid API. */
  gridRef?: React.RefObject<AgGridReact<T> | null>;
}

export interface DataGridProps<T = Record<string, unknown>>
  extends DataGridStaticConfig<T>, DataGridRuntimeConfig<T> {}

export interface DataGridRef<T = Record<string, unknown>> {
  getGridApi: () => GridApi<T> | null;
  exportDataAsCsv: () => void;
}

// --- Component ---

export const DataGrid = forwardRef(
  <T extends Record<string, unknown>>(
    {
      // Static
      columnDefs,
      defaultColDef,
      height = 600,
      autoHeight = false,
      enableRowSelection = false,
      editable = false,
      pageSize,
      emptyMessage,
      emptyContent,
      actionsColumn,
      toolbar,
      searchConfig,
      className,

      // Runtime
      rowData,
      loading = false,
      onRowClick,
      onSelectionChange,
      onCellValueChanged,
      onCellEditingStopped,
      getRowClass,
      gridRef: externalGridRef,
    }: DataGridProps<T>,
    ref: React.Ref<DataGridRef<T>>,
  ) => {
    const internalGridRef = useRef<AgGridReact<T>>(null);
    const gridRef = externalGridRef || internalGridRef;
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);

    // Drag-to-scroll
    useDragToScroll(gridContainerRef);

    // Expose imperative API
    useImperativeHandle(ref, () => ({
      getGridApi: () => gridApi,
      exportDataAsCsv: () => gridApi?.exportDataAsCsv(),
    }));

    const handleGridReady = useCallback((params: GridReadyEvent<T>) => {
      setGridApi(params.api);
    }, []);

    // --- Escape key: two-stage behavior ---
    // First Escape exits edit mode (AG Grid default). Second clears focus ring.
    // We track whether editing just stopped so we don't clear focus on the same keypress.
    const wasEditingRef = useRef(false);

    const handleCellEditingStarted = useCallback(() => {
      wasEditingRef.current = true;
    }, []);

    // Type uses any to satisfy AG Grid's CellKeyDownEvent | FullWidthCellKeyDownEvent union
    // under exactOptionalPropertyTypes
    const handleCellKeyDown = useCallback(
      (event: { event: Event | null | undefined; api: { clearFocusedCell(): void } }) => {
        if ((event.event as KeyboardEvent)?.key === 'Escape') {
          if (wasEditingRef.current) {
            // Just exited edit mode — consume this Escape, keep focus
            wasEditingRef.current = false;
          } else {
            // Not editing — clear the focus ring
            event.api.clearFocusedCell();
          }
        }
      },
      [],
    );

    const handleCellEditingStopped = useCallback(() => {
      // wasEditingRef stays true until the next Escape clears it
    }, []);

    // --- Search ---

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [selectedCount, setSelectedCount] = useState(0);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleSearchChange = useCallback((value: string) => {
      setSearchInput(value);
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => setSearch(value), 150);
    }, []);

    useEffect(() => {
      return () => clearTimeout(searchDebounceRef.current);
    }, []);

    const filteredRowData = useMemo(() => {
      if (!search || !searchConfig) return rowData;
      const q = search.toLowerCase();
      return rowData.filter((row) =>
        searchConfig.fields.some((field) => {
          const val = (row as Record<string, unknown>)[field];
          return typeof val === 'string' && val.toLowerCase().includes(q);
        }),
      );
    }, [rowData, search, searchConfig]);

    // --- Row click ---

    const handleRowClicked = useCallback(
      (event: RowClickedEvent<T>) => {
        if (!onRowClick || !event.data) return;
        onRowClick(event.data);
      },
      [onRowClick],
    );

    // --- Selection ---

    const handleSelectionChanged = useCallback(
      (event: SelectionChangedEvent<T>) => {
        const rows = event.api.getSelectedRows();
        setSelectedCount(rows.length);
        onSelectionChange?.(rows);
      },
      [onSelectionChange],
    );

    const rowSelection = useMemo(
      () => (enableRowSelection ? { mode: 'multiRow' as const, headerCheckbox: true } : undefined),
      [enableRowSelection],
    );

    // --- Column defs with actions column ---

    const resolvedColumnDefs = useMemo(() => {
      if (!actionsColumn) return columnDefs;
      const { actionCount, width: actionsWidth, ...actionsRest } = actionsColumn;
      const computedWidth =
        actionsWidth ?? (actionCount ? actionCount * 28 + (actionCount - 1) * 4 + 16 : 200);
      return [
        ...columnDefs,
        {
          ...actionsRest,
          headerName: '',
          sortable: false,
          resizable: false,
          editable: false,
          pinned: 'right' as const,
          lockPinned: true,
          suppressHeaderMenuButton: true,
          suppressNavigable: true,
          suppressSizeToFit: true,
          tooltipValueGetter: () => undefined,
          width: computedWidth,
          cellStyle: {
            borderLeft: '1px solid var(--base-border)',
            borderTop: 'none',
            borderBottom: 'none',
            borderRight: 'none',
            padding: '0 4px',
          },
        } satisfies ColDef<T>,
      ];
    }, [columnDefs, actionsColumn]);

    // --- Default col def ---

    const mergedDefaultColDef: ColDef<T> = useMemo(
      () => ({
        sortable: true,
        resizable: true,
        ...(editable ? { editable: true } : { editable: false }),
        ...defaultColDef,
      }),
      [editable, defaultColDef],
    );

    // --- Grid options ---

    const gridOptions = useMemo<GridOptions<T>>(
      () => ({
        ...staticGridOptions,
        getRowId: (params) => {
          const data = params.data as Record<string, unknown>;
          if (data?.entityId) return String(data.entityId);
          if (data?.eId) return String(data.eId);
          if (data?.id) return String(data.id);
          return `row-${JSON.stringify(data).slice(0, 50)}`;
        },
      }),
      [],
    );

    // --- No rows overlay ---

    const noRowsOverlay = useMemo(
      () => (emptyContent ? () => emptyContent : () => <EmptyOverlay message={emptyMessage} />),
      [emptyContent, emptyMessage],
    );

    // --- Render ---

    const hasHeader = searchConfig || toolbar;

    return (
      <div className={className}>
        <style dangerouslySetInnerHTML={{ __html: rowStateStyles }} />

        {/* Header: search + count + toolbar */}
        {hasHeader && (
          <div className="flex flex-wrap items-center gap-2 pb-4 sm:flex-nowrap sm:gap-3">
            {searchConfig && (
              <div className="relative w-full sm:w-auto sm:min-w-40 sm:max-w-72 sm:flex-1 lg:flex-none">
                <Search
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder={searchConfig.placeholder ?? 'Search…'}
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={searchConfig.placeholder ?? 'Search'}
                />
              </div>
            )}
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {selectedCount > 0
                ? `${selectedCount} of ${filteredRowData.length} selected`
                : `${filteredRowData.length} row${filteredRowData.length !== 1 ? 's' : ''}`}
            </span>
            {toolbar && (
              <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
                {toolbar}
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        <div
          ref={gridContainerRef}
          style={{
            ...(!autoHeight && {
              height: typeof height === 'number' ? `${height}px` : height,
            }),
            ...gridColorVars,
          }}
        >
          <AgGridMemo
            ref={gridRef}
            theme={gridTheme}
            gridOptions={gridOptions}
            domLayout={autoHeight ? 'autoHeight' : 'normal'}
            columnDefs={resolvedColumnDefs}
            defaultColDef={mergedDefaultColDef}
            rowData={filteredRowData}
            loading={loading}
            onGridReady={handleGridReady}
            onCellKeyDown={handleCellKeyDown as never}
            onCellEditingStarted={handleCellEditingStarted as never}
            {...(rowSelection ? { rowSelection } : {})}
            {...(getRowClass ? { getRowClass } : {})}
            {...(enableRowSelection ? { onSelectionChanged: handleSelectionChanged } : {})}
            {...(onRowClick ? { onRowClicked: handleRowClicked } : {})}
            {...(onCellValueChanged ? { onCellValueChanged } : {})}
            {...(onCellEditingStopped
              ? {
                  onCellEditingStopped: (e: CellEditingStoppedEvent) => {
                    handleCellEditingStopped();
                    onCellEditingStopped(e);
                  },
                }
              : { onCellEditingStopped: handleCellEditingStopped })}
            loadingOverlayComponent={LoadingOverlay}
            noRowsOverlayComponent={noRowsOverlay}
            pagination={!!pageSize}
            {...(pageSize ? { paginationPageSize: pageSize } : {})}
            paginationPageSizeSelector={false}
          />
        </div>
      </div>
    );
  },
) as <T extends Record<string, unknown>>(
  props: DataGridProps<T> & { ref?: React.Ref<DataGridRef<T>> },
) => React.ReactElement;

(DataGrid as unknown as { displayName: string }).displayName = 'DataGrid';

// Re-export for convenience
export { GridImage } from './grid-image';
