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
import { cn } from '@/types/canary/utilities/utils';
import { SelectionCheckboxCell } from './selection-checkbox';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type CellSelectionOptions,
  type ColDef,
  type ColTypeDef,
  type DataTypeDefinition,
  type GridApi,
  type GridOptions,
  type GridReadyEvent,
  type RowClickedEvent,
  type RowClassParams,
  type CellClickedEvent,
  type CellValueChangedEvent,
  type CellEditingStoppedEvent,
  type SelectionChangedEvent,
  type PasteEndEvent,
  type FillEndEvent,
  type CutEndEvent,
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import '@/styles/canary/ag-theme-arda.css';
import { useDragToScroll } from './use-drag-to-scroll';
import { useRowEditing, type AddRowOptions, type RowEditPayload } from './use-row-editing';

// Match arda-frontend-app's pattern (ArdaGrid.tsx): register all Community +
// all Enterprise modules. That covers clipboard, cell-selection (range +
// fill handle), rich select, header column menu, right-click context menu,
// columns/filters tool panels — everything we use across grids. Enterprise
// features watermark in Storybook (no license set) and run clean in
// arda-frontend-app, which sets the license globally. The try/catch guards
// against AG Grid throwing on an unrelated registration error.
try {
  ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
} catch (error) {
  console.warn(
    '[DataGrid] AG Grid Enterprise modules failed to register. Clipboard / ' +
      'cell-selection / context menu / column menu features will be unavailable.',
    error,
  );
}

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
  wrapperBorderRadius: 0,
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
  '--ag-header-background-color': 'var(--base-background)',
  '--ag-header-cell-hover-background-color': 'var(--base-border)',
  '--ag-header-cell-moving-background-color': 'var(--base-border)',
  '--ag-header-column-resize-handle-color': 'var(--base-border)',
  '--ag-row-border-color': 'var(--secondary)',
  '--ag-odd-row-background-color': 'var(--base-background)',
  '--ag-row-hover-color': 'var(--secondary)',
  '--ag-selected-row-background-color': 'var(--accent-light)',
  '--ag-checkbox-unchecked-border-color': 'var(--base-muted-foreground)',
  '--ag-checkbox-unchecked-background-color': 'var(--base-background)',
} as React.CSSProperties;

const rowStateStyles = `
  .ag-row-saving { background-color: color-mix(in srgb, var(--base-primary) 6%, var(--base-background)) !important; }
  .ag-row-error  { background-color: color-mix(in srgb, var(--destructive) 8%, var(--base-background)) !important; }
  /* Center the header checkbox in the narrowed selection column. */
  .ag-header-cell.ag-selection-header-centered .ag-header-cell-comp-wrapper,
  .ag-header-cell.ag-selection-header-centered .ag-header-select-all {
    justify-content: center;
    padding: 0;
  }
  /* While editing, round the cell and thicken its accent border to 2px to match
     the editor's focus ring. A border (vs a box-shadow) stays inside the cell so
     it isn't cropped by adjacent grid cells. */
  .ag-cell.ag-cell-popup-editing,
  .ag-cell.ag-cell-inline-editing {
    border-radius: calc(var(--radius) - 2px);
    border-width: 2px !important;
    border-color: var(--ring) !important;
  }
`;

// --- Static config (hoisted outside component) ---

const staticGridOptions: GridOptions = {
  stopEditingWhenCellsLoseFocus: true,
  tooltipShowDelay: 400,
  tooltipShowMode: 'whenTruncated' as const,
  ensureDomOrder: true,
};

const AgGridMemo = memo(AgGridReact) as unknown as typeof AgGridReact;

// `clipboardPaste="single"` — keep only the top-left cell of pasted clipboard
// data so a range paste lands in the focused cell instead of spilling across
// rows/columns. Returning the trimmed grid (vs null) still lets the single cell
// paste; an empty clipboard cancels the paste.
function clampPasteToSingleCell({ data }: { data: string[][] }): string[][] | null {
  const firstCell = data[0]?.[0];
  return firstCell === undefined ? null : [[firstCell]];
}

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
  /**
   * Custom cell data type registry (e.g. `tokens`, `address`). Each entry owns
   * the value <-> string round trip (formatter/parser/keyCreator) that drives
   * copy/paste, bulk paste, fill-down, and export. Columns opt in via
   * `cellDataType: '<name>'`. See `createTokenDataType`.
   */
  dataTypeDefinitions?: Record<string, DataTypeDefinition>;
  /** Named column-type bundles referenced by data types (renderer/editor/keyCreator). */
  columnTypes?: Record<string, ColTypeDef>;
  /**
   * Range selection + drag-to-fill handle. Each is a bulk-write source, so both
   * are off unless you opt in:
   * - omit this prop  → no range selection, no bulk range-edit/range-delete.
   * - `true` / `{}`    → range selection only (copy a block) — no fill handle.
   * - `{ handle: { mode: 'fill' } }` → adds the spreadsheet fill-down handle.
   * Enterprise. Leave it off on grids whose save path can't absorb many
   * concurrent row writes (see `clipboardPaste`).
   */
  cellSelection?: boolean | CellSelectionOptions;
  /**
   * Clipboard paste policy. A multi-cell paste maps to one save per affected
   * row, so paste is the largest bulk-write source; copy is always allowed
   * (read-only). Choose how much paste a grid's persistence layer can absorb:
   * - `'range'` (default): multi-cell paste — fills a block from the clipboard.
   * - `'single'`: paste into the focused cell only; range paste is clamped to 1 cell.
   * - `'off'`: paste disabled entirely.
   *
   * To fully disable spreadsheet-style bulk editing during a phased rollout
   * (e.g. the items grid): omit `cellSelection`, set `clipboardPaste="off"`,
   * and leave `undoRedoLimit` at 0.
   */
  clipboardPaste?: 'range' | 'single' | 'off';
  /**
   * Cell-edit undo/redo stack size (0–20). `0` disables it. When > 0, Ctrl/Cmd+Z
   * and Ctrl/Cmd+Y undo/redo edits, paste, fill, cut, and delete (grid must have
   * focus). Defaults to 0 (off).
   */
  undoRedoLimit?: number;
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
  /**
   * Enable horizontal drag-to-scroll on the grid body via `useDragToScroll`.
   * Defaults to `true`. Pass `false` to opt out (e.g., for touch-only
   * surfaces where AG Grid's native touch scrolling is preferable).
   */
  enableDragToScroll?: boolean;
  /** Toolbar actions rendered to the right of the search bar. */
  toolbar?: ReactNode;
  /**
   * Additional class names applied to the header bar (search input + row
   * count + `toolbar` slot). Useful when the grid is rendered full-bleed in
   * the page but the header bar should respect the page's horizontal gutters.
   * Composed with the molecule's defaults via `cn(...)`.
   */
  toolbarClassName?: string;
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
  /**
   * Called once a range paste completes (not per cell). Bulk paste does not fire
   * `onCellEditingStopped`, so a persistence layer flushes pending edits here.
   */
  onPasteEnd?: (event: PasteEndEvent<T>) => void;
  /** Called once a fill-handle drag completes (not per cell). Flush point, like `onPasteEnd`. */
  onFillEnd?: (event: FillEndEvent<T>) => void;
  /** Called once a cut completes. Flush point for the cleared cells. */
  onCutEnd?: (event: CutEndEvent<T>) => void;
  /** Function to compute extra CSS classes for a row. */
  getRowClass?: (params: RowClassParams<T>) => string | string[] | undefined;
  /** Ref to access AG Grid API. */
  gridRef?: React.RefObject<AgGridReact<T> | null>;
  /** Fired after rows are inserted in-memory (add-row mechanics). */
  onRowsAdded?: (payload: RowEditPayload<T>) => void;
  /** Fired after rows are removed in-memory. */
  onRowsRemoved?: (payload: RowEditPayload<T>) => void;
  /** Mint a new row's grid id. Default ``() => `new-${crypto.randomUUID()}` ``. */
  getNewRowId?: () => string;
}

export interface DataGridProps<T = Record<string, unknown>>
  extends DataGridStaticConfig<T>, DataGridRuntimeConfig<T> {}

export interface DataGridRef<T = Record<string, unknown>> {
  getGridApi: () => GridApi<T> | null;
  exportDataAsCsv: () => void;
  /** Insert a row in-memory; returns the new row's grid id. */
  addRow: (seed?: Partial<T>, opts?: AddRowOptions<T>) => string;
  /** Remove rows in-memory by grid id. */
  removeRows: (ids: string[]) => void;
}

// --- Component ---

export const DataGrid = forwardRef(
  <T extends Record<string, unknown>>(
    {
      // Static
      columnDefs,
      defaultColDef,
      dataTypeDefinitions,
      columnTypes,
      cellSelection,
      clipboardPaste = 'range',
      undoRedoLimit = 0,
      height = 600,
      autoHeight = false,
      enableRowSelection = false,
      editable = false,
      pageSize,
      emptyMessage,
      emptyContent,
      actionsColumn,
      enableDragToScroll = true,
      toolbar,
      toolbarClassName,
      searchConfig,
      className,

      // Runtime
      rowData,
      loading = false,
      onRowClick,
      onSelectionChange,
      onCellValueChanged,
      onCellEditingStopped,
      onPasteEnd,
      onFillEnd,
      onCutEnd,
      getRowClass,
      gridRef: externalGridRef,
      onRowsAdded,
      onRowsRemoved,
      getNewRowId,
    }: DataGridProps<T>,
    ref: React.Ref<DataGridRef<T>>,
  ) => {
    const internalGridRef = useRef<AgGridReact<T>>(null);
    const gridRef = externalGridRef || internalGridRef;
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);

    // Drag-to-scroll (defaults on; consumers can opt out via prop)
    useDragToScroll(gridContainerRef, enableDragToScroll);

    // Add-row mechanics (in-memory insert/remove + events)
    const { addRow, removeRows } = useRowEditing<T>({
      getApi: () => gridApi,
      getNewRowId: getNewRowId ?? (() => `new-${crypto.randomUUID()}`),
      ...(onRowsAdded ? { onRowsAdded } : {}),
      ...(onRowsRemoved ? { onRowsRemoved } : {}),
    });

    // Expose imperative API. Deps stabilize the handle so it only rebuilds
    // when an exposed identity actually changes; without them the handle
    // was rebuilt on every parent render.
    useImperativeHandle(
      ref,
      () => ({
        getGridApi: () => gridApi,
        exportDataAsCsv: () => gridApi?.exportDataAsCsv(),
        addRow,
        removeRows,
      }),
      [gridApi, addRow, removeRows],
    );

    const handleGridReady = useCallback((params: GridReadyEvent<T>) => {
      setGridApi(params.api);
    }, []);

    // --- Escape key: two-stage behavior ---
    // First Escape exits edit mode (AG Grid default — we don't intervene).
    // Second Escape (no cell editing) clears the focus ring.
    // We read the live editing state from the api instead of tracking it in a
    // ref so commits via Enter / Tab / click-away don't leave a stale "was
    // editing" flag that would waste the next Escape.
    const handleCellKeyDown = useCallback(
      (event: {
        event: Event | null | undefined;
        api: Pick<GridApi, 'clearFocusedCell' | 'getEditingCells'>;
      }) => {
        if ((event.event as KeyboardEvent)?.key !== 'Escape') return;
        // If a cell is currently editing, AG Grid will consume this Escape to
        // stop the edit — don't also clear focus on the same keypress.
        if (event.api.getEditingCells().length > 0) return;
        event.api.clearFocusedCell();
      },
      [],
    );

    // --- Mobile: tap-to-edit on an already-focused cell ---
    // Touch devices have no natural double-click, so we open the editor when a
    // user taps the same cell twice in a row (first tap focuses, second tap
    // edits). Gated on `(pointer: coarse)` so hybrid devices keep AG Grid's
    // double-click semantics under a fine pointer.
    const isCoarsePointerRef = useRef(false);
    useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const mq = window.matchMedia('(pointer: coarse)');
      isCoarsePointerRef.current = mq.matches;
      const update = (e: MediaQueryListEvent) => {
        isCoarsePointerRef.current = e.matches;
      };
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }, []);

    const lastTappedCellKeyRef = useRef<string | null>(null);

    const handleCellClicked = useCallback((event: CellClickedEvent<T>) => {
      if (!isCoarsePointerRef.current) return;
      const rowIndex = event.node.rowIndex;
      if (typeof rowIndex !== 'number') return;
      const colId = event.column.getColId();
      const key = `${rowIndex}:${colId}`;
      // If something is already in edit mode, just record the tapped cell.
      if (event.api.getEditingCells().length > 0) {
        lastTappedCellKeyRef.current = key;
        return;
      }
      if (lastTappedCellKeyRef.current === key) {
        // Second tap on the already-focused cell — open the editor.
        event.api.startEditingCell({ rowIndex, colKey: colId });
        lastTappedCellKeyRef.current = null;
        // iOS Safari requires focus() to follow a user gesture for the
        // keyboard to appear. AG Grid's default text editor focuses inside a
        // useEffect that often misses that window. Nudge focus on the next
        // frame — still within the tap's gesture grace period.
        requestAnimationFrame(() => {
          const input = document.querySelector<HTMLElement>(
            '.ag-cell-edit-wrapper input, .ag-cell-edit-input, .ag-input-field-input',
          );
          input?.focus();
        });
      } else {
        lastTappedCellKeyRef.current = key;
      }
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
      () =>
        enableRowSelection
          ? {
              mode: 'multiRow' as const,
              headerCheckbox: true,
              // Suppress AG Grid's built-in checkbox — `selectionColumnDef`
              // below provides Arda canary Checkbox renderers (body + header)
              // and we don't want the default rendered alongside.
              checkboxes: false,
            }
          : undefined,
      [enableRowSelection],
    );

    // Narrow the row-selection column and render the Arda canary `Checkbox`
    // atom in body cells so the selection control matches the Figma spec
    // instead of AG Grid's default theme-driven checkbox.
    //
    // Header: we leave AG Grid's default select-all in place. In AG Grid v34
    // the combination of `rowSelection.headerCheckbox: true` and a custom
    // `headerComponent` renders both — and disabling `headerCheckbox` removes
    // the column entirely. Until that's resolved we accept the small visual
    // mismatch between header and body checkbox. Custom header lives in
    // ./selection-checkbox.tsx for when the AG Grid behaviour changes.
    const selectionColumnDef = useMemo<ColDef<T> | undefined>(
      () =>
        enableRowSelection
          ? {
              width: 40,
              minWidth: 40,
              maxWidth: 40,
              suppressSizeToFit: true,
              resizable: false,
              cellStyle: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 0,
              },
              headerClass: 'ag-selection-header-centered',
              cellRenderer: SelectionCheckboxCell,
              // Enter on a focused selection cell toggles the row. Returning
              // `true` from suppressKeyboardEvent tells AG Grid we handled it
              // so the default Enter behaviour (which would otherwise be a
              // no-op for non-editable cells) doesn't override ours.
              suppressKeyboardEvent: (params) => {
                if (params.editing) return false;
                if (params.event.key !== 'Enter') return false;
                const node = params.node;
                if (!node) return false;
                node.setSelected(!node.isSelected());
                return true;
              },
            }
          : undefined,
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
        // No "..." button on column headers; the same column menu is still
        // available via right-click on the header. Consumers can re-enable
        // it per-column or via defaultColDef.
        suppressHeaderMenuButton: true,
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
          <div
            className={cn(
              'flex flex-wrap items-center gap-2 pb-4 sm:flex-nowrap sm:gap-3',
              toolbarClassName,
            )}
          >
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
            {...(dataTypeDefinitions ? { dataTypeDefinitions } : {})}
            {...(columnTypes ? { columnTypes } : {})}
            {...(selectionColumnDef ? { selectionColumnDef } : {})}
            {...(cellSelection ? { cellSelection } : {})}
            {...(clipboardPaste === 'off' ? { suppressClipboardPaste: true } : {})}
            {...(clipboardPaste === 'single'
              ? { processDataFromClipboard: clampPasteToSingleCell }
              : {})}
            {...(undoRedoLimit > 0
              ? { undoRedoCellEditing: true, undoRedoCellEditingLimit: Math.min(20, undoRedoLimit) }
              : {})}
            rowData={filteredRowData}
            loading={loading}
            onGridReady={handleGridReady}
            onCellClicked={handleCellClicked}
            onCellKeyDown={handleCellKeyDown as never}
            {...(rowSelection ? { rowSelection } : {})}
            {...(getRowClass ? { getRowClass } : {})}
            {...(enableRowSelection ? { onSelectionChanged: handleSelectionChanged } : {})}
            {...(onRowClick ? { onRowClicked: handleRowClicked } : {})}
            {...(onCellValueChanged ? { onCellValueChanged } : {})}
            {...(onPasteEnd ? { onPasteEnd } : {})}
            {...(onFillEnd ? { onFillEnd } : {})}
            {...(onCutEnd ? { onCutEnd } : {})}
            {...(onCellEditingStopped ? { onCellEditingStopped } : {})}
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
