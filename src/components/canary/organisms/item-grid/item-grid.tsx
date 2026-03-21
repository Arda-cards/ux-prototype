'use client';

import { forwardRef, useMemo, type ReactNode, type Ref, type MutableRefObject } from 'react';
import { Package } from 'lucide-react';
import type { ColDef, GridApi } from 'ag-grid-community';

import type { Item } from '@/types/extras';
import {
  createEntityDataGrid,
  type EntityDataGridRef,
  type PendingChanges,
} from '../shared/entity-data-grid';
import {
  createItemGridColumnDefs,
  itemGridDefaultColDef,
  type ItemGridLookups,
} from '../../molecules/item-grid/item-grid-columns';

// Re-export PendingChanges so callers keep working without importing from entity-data-grid directly.
export type { PendingChanges };

// ---------------------------------------------------------------------------
// Empty state component
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Public handle types
// ---------------------------------------------------------------------------

/**
 * Imperative handle for programmatic save/discard/dirty operations.
 * Matches the shape of the old `ItemGridEditingHandle` for backward compatibility.
 */
export interface ItemGridEditingHandle {
  saveAll: () => Promise<void>;
  discardAll: () => void;
  getDirtyRowIds: () => string[];
}

/**
 * Full handle exposed via `gridRef`. Superset of ItemGridEditingHandle.
 */
export interface ItemGridHandle extends ItemGridEditingHandle {
  /**
   * Returns the raw AG Grid API. Useful for imperative column visibility changes,
   * deselectAll, etc. Returns null if the grid has not yet mounted.
   */
  getGridApi: () => GridApi | null;
}

// ---------------------------------------------------------------------------
// Interfaces — preserving the original item-grid public API
// ---------------------------------------------------------------------------

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
  /** Ref to expose saveAll/discardAll to parent. Kept for backward compat. */
  editingRef?: Ref<ItemGridEditingHandle>;
  /** Ref to access the full ItemGridHandle (saveAll + getGridApi). */
  gridRef?: Ref<ItemGridHandle>;
}

export interface ItemGridProps extends ItemGridStaticConfig, ItemGridRuntimeConfig {}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build a string key from structural (factory-time) props.
 * When this key changes, the entity-data-grid factory is rebuilt.
 */
function makeFactoryKey(
  lookups: ItemGridLookups | undefined,
  onNotesClick: ((item: Item) => void) | undefined,
  pageSize: number | undefined,
  hasActions: boolean,
  autoHeight: boolean,
): string {
  const lookupKeys = lookups ? Object.keys(lookups).sort().join(',') : '';
  const notesKey = onNotesClick ? '1' : '0';
  return `${lookupKeys}|${notesKey}|${pageSize ?? ''}|${hasActions ? '1' : '0'}|${autoHeight ? '1' : '0'}`;
}

function assignHandle(
  r: Ref<ItemGridHandle> | Ref<ItemGridEditingHandle> | undefined,
  handle: ItemGridHandle | null,
): void {
  if (!r) return;
  if (typeof r === 'function') {
    (r as (h: ItemGridHandle | null) => void)(handle);
  } else {
    (r as MutableRefObject<ItemGridHandle | null>).current = handle;
  }
}

// ---------------------------------------------------------------------------
// ItemGrid component — thin wrapper over entity-data-grid
// ---------------------------------------------------------------------------

/**
 * Item inventory grid built on entity-data-grid.
 *
 * General-purpose capabilities (search, drag-to-scroll, auto-publish,
 * pagination, toolbar, actions column, auto-height) are delegated to
 * entity-data-grid. Only item-domain code lives here: curated columns,
 * typeahead lookups, nested value getters/setters, custom renderers, and
 * the `onNotesClick` callback (passed via `cellRendererParams` at factory creation time).
 */
export const ItemGrid = forwardRef<ItemGridHandle, ItemGridProps>(function ItemGrid(
  {
    items,
    loading = false,
    autoHeight = false,
    enableRowSelection: _enableRowSelection = false,
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
    gridRef,
  },
  ref,
) {
  // ----------------------------------------------------------------
  // Build (or reuse) the entity-data-grid component.
  //
  // `autoHeight`, `pageSize`, `actionsColumn`, and lookup presence are
  // all design-time props that entity-data-grid bakes into its factory
  // config. They trigger a full rebuild when they change.
  // ----------------------------------------------------------------
  const factoryKey = makeFactoryKey(lookups, onNotesClick, pageSize, !!actionsColumn, autoHeight);

  const { Component: EntityGrid } = useMemo(() => {
    const columnDefs = createItemGridColumnDefs(lookups, {
      ...(onNotesClick !== undefined ? { onNotesClick } : {}),
    });
    return createEntityDataGrid<Item>({
      displayName: 'ItemGrid',
      persistenceKeyPrefix: 'item-grid',
      columnDefs,
      defaultColDef: itemGridDefaultColDef,
      getEntityId: (item) => item.entityId,
      searchConfig: {
        fields: ['name', 'internalSKU'],
        placeholder: 'Search items\u2026',
      },
      enableDragToScroll: true,
      ...(autoHeight ? { autoHeight: true } : {}),
      ...(pageSize !== undefined ? { paginationMode: 'client' as const, pageSize } : {}),
      ...(actionsColumn !== undefined ? { actionsColumn } : {}),
    });
  }, [factoryKey]);

  // ----------------------------------------------------------------
  // Empty state
  // ----------------------------------------------------------------
  const emptyStateComponent = useMemo(
    () => emptyContent ?? <EmptyOverlay message={emptyMessage} />,
    [emptyContent, emptyMessage],
  );

  // ----------------------------------------------------------------
  // Ref forwarding — maps EntityDataGridRef → ItemGridHandle
  //
  // combinedRef is intentionally stable (no deps) — the ref callbacks
  // (ref, editingRef, gridRef) are captured via closure and are expected
  // to be stable object refs from callers.
  // ----------------------------------------------------------------
  const combinedRef = useMemo(
    () =>
      (instance: EntityDataGridRef | null): void => {
        const handle: ItemGridHandle | null = instance
          ? {
              saveAll: () => instance.saveAll(),
              discardAll: () => instance.discardAll(),
              getDirtyRowIds: () => instance.getDirtyRowIds(),
              getGridApi: () => instance.getGridApi(),
            }
          : null;

        if (typeof ref === 'function') ref(handle);
        else if (ref) (ref as MutableRefObject<ItemGridHandle | null>).current = handle;

        assignHandle(editingRef, handle);
        assignHandle(gridRef, handle);
      },
    [],
  );

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <div className={className}>
      <EntityGrid
        ref={combinedRef}
        data={items}
        loading={loading}
        enableCellEditing={editable}
        emptyStateComponent={emptyStateComponent}
        {...(toolbar !== undefined ? { toolbar } : {})}
        {...(onItemClick !== undefined ? { onRowClick: onItemClick } : {})}
        {...(onSelectionChange !== undefined ? { onSelectionChange } : {})}
        {...(onPublishRow !== undefined ? { onRowPublish: onPublishRow } : {})}
        {...(onDirtyChange !== undefined ? { onDirtyChange } : {})}
      />
    </div>
  );
});

ItemGrid.displayName = 'ItemGrid';
