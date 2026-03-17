'use client';

import { memo, useState, useMemo, useCallback, useRef, type Ref, type ReactNode } from 'react';
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
  '--ag-header-column-resize-handle-color': 'var(--base-border)',
  '--ag-row-border-color': 'var(--secondary)',
  '--ag-odd-row-background-color': 'var(--secondary)',
  '--ag-row-hover-color': 'var(--secondary)',
  '--ag-selected-row-background-color': 'var(--accent-light)',
  '--ag-checkbox-unchecked-border-color': 'var(--base-muted-foreground)',
  '--ag-checkbox-unchecked-background-color': 'var(--base-background)',
} as React.CSSProperties;

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

function EmptyOverlay({ message }: { message?: string }) {
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
  height?: string | number;
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
  /** Pinned right-side actions column. Pass a cell renderer component. */
  actionsColumn?: ColDef<Item>;
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
  /** Called when a row is ready to publish (user finished editing a row). */
  onPublishRow?: (rowId: string, changes: PendingChanges, item: Item) => Promise<void>;
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

  const [search, setSearch] = useState('');

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
      onSelectionChange?.(event.api.getSelectedRows());
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
      cols.push({
        headerName: '',
        sortable: false,
        resizable: false,
        editable: false,
        pinned: 'right',
        lockPinned: true,
        suppressHeaderMenuButton: true,
        suppressNavigable: true,
        cellStyle: {
          borderLeft: '1px solid var(--base-border)',
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
          paddingRight: 12,
        },
        ...actionsColumn,
      });
    }
    return cols;
  }, [lookups, actionsColumn]);

  const gridContext = useMemo(() => ({ onNotesClick }), [onNotesClick]);

  const defaultColDef = useMemo(
    () => (editable ? itemGridDefaultColDef : { ...itemGridDefaultColDef, editable: false }),
    [editable],
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-3 pb-4">
        <div className="relative w-full max-w-72">
          {searchIcon}
          <Input
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 shadow-none"
            aria-label="Search items by name or SKU"
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </span>
        {toolbar && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
      </div>

      <div
        style={{ height: typeof height === 'number' ? `${height}px` : height, ...gridColorVars }}
      >
        <AgGridMemo
          ref={gridRef}
          theme={gridTheme}
          gridOptions={staticGridOptions}
          context={gridContext}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={filteredItems}
          loading={loading}
          rowSelection={rowSelection}
          getRowClass={editable ? getRowClass : undefined}
          onSelectionChanged={enableRowSelection ? handleSelectionChanged : undefined}
          onRowClicked={onItemClick ? handleRowClicked : undefined}
          loadingOverlayComponent={LoadingOverlay}
          noRowsOverlayComponent={
            emptyContent ? () => emptyContent : () => <EmptyOverlay message={emptyMessage} />
          }
          pagination={!!pageSize}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={false}
          onCellValueChanged={editable ? handleCellValueChanged : undefined}
          onCellEditingStopped={editable ? handleCellEditingStopped : undefined}
        />
      </div>
    </div>
  );
}
