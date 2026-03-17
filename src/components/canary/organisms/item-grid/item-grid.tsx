'use client';

import {
  memo,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type Ref,
  type ReactNode,
} from 'react';
import { Search, Loader2, Package } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GridOptions,
  type RowClickedEvent,
} from 'ag-grid-community';

import { Input } from '@/components/ui/input';
import type { Item } from '@/types/extras';
import {
  createItemGridColumnDefs,
  itemGridDefaultColDef,
  type ItemGridLookups,
} from '../../molecules/item-grid/item-grid-columns';
import {
  useItemGridEditing,
  type ItemGridEditingHandle,
  type PendingChanges,
} from './use-item-grid-editing';

ModuleRegistry.registerModules([AllCommunityModule]);

// --- Theme ---

// Structural params — sizes, booleans, layout. Colors come from CSS vars below.
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

// Color tokens — maps AG Grid CSS vars to our design system tokens from globals.css.
// Set on the grid container div so they cascade into AG Grid's internals.
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

// Row saving/error visual feedback (injected once, scoped by AG Grid class)
const rowStateStyles = `
  .ag-row-saving { background-color: color-mix(in srgb, var(--base-primary) 6%, var(--base-background)) !important; }
  .ag-row-error { background-color: color-mix(in srgb, var(--destructive) 8%, var(--base-background)) !important; }
`;

// --- Static config (hoisted outside component) ---

const staticGridOptions: GridOptions<Item> = {
  getRowId: (params) => params.data.entityId,
  stopEditingWhenCellsLoseFocus: true,

  // Tooltips — show on truncated text only
  tooltipShowDelay: 400,
  tooltipShowMode: 'whenTruncated',

  // Accessibility
  ensureDomOrder: true,
};

const AgGridMemo = memo(AgGridReact<Item>);

const searchIcon = (
  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
);

function LoadingOverlay() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Loading items…
    </div>
  );
}

function EmptyOverlay({ message }: { message?: string | undefined }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground">{message || 'No items yet'}</p>
    </div>
  );
}

// --- Interfaces ---

export interface ItemGridStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Fixed height for the grid. Ignored when `autoHeight` is true. */
  height?: string | number;
  /** Grid grows to fit content. Disables vertical scroll. */
  autoHeight?: boolean;
  enableRowSelection?: boolean;
  editable?: boolean;
  /** Typeahead lookup functions for supplier, classification, etc. */
  lookups?: ItemGridLookups;
  /** Enable pagination with page size. */
  pageSize?: number;
  /** Custom empty state message. */
  emptyMessage?: string;
  /** Custom empty state content — overrides emptyMessage. */
  emptyContent?: ReactNode;
  /** Pinned right-side actions column. Pass a cell renderer and actionCount (for auto-width). */
  actionsColumn?: ColDef<Item> & { actionCount?: number };
  /** Toolbar actions rendered to the right of the search bar. */
  toolbar?: ReactNode;
  className?: string;
}

export interface ItemGridRuntimeConfig {
  /* --- Model / Data Binding --- */
  items: Item[];
  loading?: boolean;
  onItemClick?: (item: Item) => void;
  onSelectionChange?: (items: Item[]) => void;
  /** Called when a row is ready to publish. `item` is undefined when called from saveAll. */
  onPublishRow?: (rowId: string, changes: PendingChanges, item?: Item) => Promise<void>;
  /** Called when dirty state changes. */
  onDirtyChange?: (dirty: boolean) => void;
  /** Called when the notes icon is clicked. */
  onNotesClick?: (item: Item) => void;
  /** Ref to expose saveAll/discardAll to parent. */
  editingRef?: Ref<ItemGridEditingHandle>;
  /** Ref to access AG Grid API (for column visibility, etc.). */
  gridRef?: React.RefObject<AgGridReact<Item> | null>;
}

export interface ItemGridProps extends ItemGridStaticConfig, ItemGridRuntimeConfig {}

// --- Component ---

export function ItemGrid({
  items,
  loading = false,
  height = 600,
  autoHeight = false,
  enableRowSelection = false,
  editable = false,
  lookups,
  pageSize,
  emptyMessage,
  emptyContent,
  actionsColumn,
  toolbar,
  className,
  onItemClick,
  onSelectionChange,
  onNotesClick,
  onPublishRow,
  onDirtyChange,
  editingRef,
  gridRef: externalGridRef,
}: ItemGridProps) {
  const internalGridRef = useRef<AgGridReact<Item>>(null);
  const gridRef = externalGridRef || internalGridRef;
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Mouse drag-to-scroll horizontally on the grid body
  useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let viewport: HTMLElement | null = null;

    const getViewport = () => {
      if (!viewport) viewport = el.querySelector('.ag-center-cols-viewport');
      return viewport;
    };

    const onMouseDown = (e: MouseEvent) => {
      const vp = getViewport();
      if (!vp) return;
      // Only activate on the grid body, not headers or editors
      const target = e.target as HTMLElement;
      if (
        target.closest('.ag-header') ||
        target.closest('.ag-popup') ||
        target.closest('input') ||
        target.closest('button')
      )
        return;
      isDown = true;
      startX = e.pageX;
      scrollLeft = vp.scrollLeft;
      el.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const vp = getViewport();
      if (!vp) return;
      const dx = e.pageX - startX;
      vp.scrollLeft = scrollLeft - dx;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search to prevent jank on large datasets
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setSearch(value), 150);
  }, []);

  useEffect(() => {
    return () => clearTimeout(searchDebounceRef.current);
  }, []);

  const { handleCellValueChanged, handleCellEditingStopped, getRowClass } = useItemGridEditing({
    onPublishRow,
    onDirtyChange,
    handleRef: editingRef,
  });

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.internalSKU && item.internalSKU.toLowerCase().includes(q)),
    );
  }, [items, search]);

  const handleRowClicked = useCallback(
    (event: RowClickedEvent<Item>) => {
      if (!onItemClick || !event.data) return;
      onItemClick(event.data);
    },
    [onItemClick],
  );

  const handleSelectionChanged = useCallback(
    (event: { api: { getSelectedRows: () => Item[] } }) => {
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

  const columnDefs = useMemo(() => {
    const cols = createItemGridColumnDefs(lookups);
    if (actionsColumn) {
      // 28px per button + 4px gap between + 16px container padding
      const { actionCount, width: actionsWidth, ...actionsRest } = actionsColumn;
      const computedWidth =
        actionsWidth ?? (actionCount ? actionCount * 28 + (actionCount - 1) * 4 + 16 : 200);
      cols.push({
        // Consumer overrides first, safety defaults after
        ...actionsRest,
        headerName: '',
        sortable: false,
        resizable: false,
        editable: false,
        pinned: 'right',
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
      });
    }
    return cols;
  }, [lookups, actionsColumn]);

  const gridContext = useMemo(() => ({ onNotesClick }), [onNotesClick]);

  const defaultColDef = useMemo(
    () => (editable ? itemGridDefaultColDef : { ...itemGridDefaultColDef, editable: false }),
    [editable],
  );

  const noRowsOverlay = useMemo(
    () => (emptyContent ? () => emptyContent : () => <EmptyOverlay message={emptyMessage} />),
    [emptyContent, emptyMessage],
  );

  return (
    <div className={className}>
      <style dangerouslySetInnerHTML={{ __html: rowStateStyles }} />
      <div className="flex flex-wrap items-center gap-2 pb-4 sm:flex-nowrap sm:gap-3">
        <div className="relative w-full sm:w-auto sm:min-w-40 sm:max-w-72 sm:flex-1 lg:flex-none">
          {searchIcon}
          <Input
            placeholder="Search items…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 shadow-none"
            style={{ height: 'var(--control-height)' }}
            type="search"
            aria-label="Search items by name or SKU"
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {selectedCount > 0
            ? `${selectedCount} of ${filteredItems.length} selected`
            : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`}
        </span>
        {toolbar && (
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            {toolbar}
          </div>
        )}
      </div>

      <div
        ref={gridContainerRef}
        style={{
          ...(!autoHeight && { height: typeof height === 'number' ? `${height}px` : height }),
          ...gridColorVars,
        }}
      >
        <AgGridMemo
          ref={gridRef}
          theme={gridTheme}
          gridOptions={staticGridOptions}
          domLayout={autoHeight ? 'autoHeight' : 'normal'}
          context={gridContext}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={filteredItems}
          loading={loading}
          {...(rowSelection ? { rowSelection } : {})}
          {...(editable ? { getRowClass } : {})}
          {...(enableRowSelection ? { onSelectionChanged: handleSelectionChanged } : {})}
          {...(onItemClick ? { onRowClicked: handleRowClicked } : {})}
          loadingOverlayComponent={LoadingOverlay}
          noRowsOverlayComponent={noRowsOverlay}
          pagination={!!pageSize}
          {...(pageSize ? { paginationPageSize: pageSize } : {})}
          paginationPageSizeSelector={false}
          {...(editable
            ? {
                onCellValueChanged: handleCellValueChanged,
                onCellEditingStopped: handleCellEditingStopped,
              }
            : {})}
        />
      </div>
    </div>
  );
}
