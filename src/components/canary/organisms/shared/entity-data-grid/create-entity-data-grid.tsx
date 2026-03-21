'use client';

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

import { Search } from 'lucide-react';
import type { ColDef, GridApi } from 'ag-grid-community';
import { DataGrid, type DataGridRef } from '@/components/canary/molecules/data-grid';
import type { PaginationData } from '@/types/canary/pagination';
import {
  useRowAutoPublish,
  type RowAutoPublishHandle,
  type PendingChanges,
} from './use-row-auto-publish';

// ============================================================================
// CSS — Row visual state styles
// ============================================================================

/** Injected once inside the grid container; scoped by AG Grid's class hierarchy. */
const ROW_STATE_STYLES = `
  .ag-row-saving { background-color: color-mix(in srgb, var(--primary) 6%, var(--background)) !important; }
  .ag-row-error  { background-color: color-mix(in srgb, var(--destructive) 8%, var(--background)) !important; }
`;

// ============================================================================
// Types — Factory Config (design-time + mount-time)
// ============================================================================

/**
 * Pagination mode.
 * - `'server'`: Use the `PaginationData` + next/prev/first callbacks (existing behaviour).
 * - `'client'`: Use AG Grid's built-in pagination with `pageSize` rows per page.
 * Omit `paginationMode` entirely to disable pagination.
 *
 * Mutually exclusive — the choice is made at factory creation time and cannot
 * be changed at runtime.
 */
export type PaginationMode = 'server' | 'client';

/**
 * Factory configuration passed once at creation time (design-time + mount-time).
 * Defines the data model binding and entity-specific behaviour.
 */
export interface EntityDataGridConfig<T extends Record<string, any>> {
  // --- Design-time (StaticConfig) ---

  /** Display name for the entity type (e.g. "Items", "Suppliers"). */
  displayName: string;
  /** Persistence key prefix (e.g. "arda-items-data-grid"). */
  persistenceKeyPrefix: string;
  /** Column definitions for this entity type. */
  columnDefs: ColDef<T>[];
  /** Default column configuration. */
  defaultColDef: ColDef<T>;
  /** Function to extract entity ID from an entity instance. */
  getEntityId: (entity: T) => string;
  /** Optional function to enhance column defs with editing capabilities. */
  enhanceEditableColumnDefs?: (defs: ColDef<T>[], options: { enabled: boolean }) => ColDef<T>[];
  /**
   * Pagination mode. Omit to disable pagination.
   * - `'server'`: external pagination via `PaginationData` + nav callbacks.
   * - `'client'`: AG Grid built-in; requires `pageSize` in config.
   */
  paginationMode?: PaginationMode;
  /** Page size for client-side pagination. Only used when `paginationMode: 'client'`. */
  pageSize?: number;
  /** Grid grows to fit content (passes `domLayout: 'autoHeight'` to AG Grid). */
  autoHeight?: boolean;
  /** Enable horizontal drag-to-scroll on the grid body. */
  enableDragToScroll?: boolean;
  // --- Mount-time (InitConfig) ---

  /**
   * Optional search configuration. When provided, a search bar renders above
   * the grid and filters rows client-side on the configured fields.
   */
  searchConfig?: {
    /** Entity field names to search across. */
    fields: string[];
    /** Placeholder text for the search input. */
    placeholder?: string;
  };

  /**
   * Pinned-right actions column definition.
   * Treated as mount-time — value is read once during factory creation.
   * Pass `actionCount` to auto-calculate width (28px per button + 4px gap + 16px padding).
   */
  actionsColumn?: ColDef<T> & { actionCount?: number };
}

// ============================================================================
// Types — Model / Data Binding Props
// ============================================================================

/**
 * Model/Data binding props passed at render time.
 */
export interface EntityDataGridModelProps<T> {
  /** Row data array. */
  data: T[];
  /**
   * Called when a row is ready to publish (user moved away from a row while
   * changes were pending). Receives the batched field changes for that row.
   * `entity` is the current row snapshot; `undefined` when called from `saveAll()`.
   */
  onRowPublish?: (rowId: string, changes: PendingChanges, entity?: T) => Promise<void>;
  /** Called when the dirty state (has any unpublished rows) changes. */
  onDirtyChange?: (dirty: boolean) => void;
}

// ============================================================================
// Types — View / Layout / Controller Props
// ============================================================================

/**
 * View/Layout/Controller props passed at render time.
 */
export interface EntityDataGridViewProps<T> {
  /** Column visibility map (colId -> boolean). */
  columnVisibility?: Record<string, boolean>;
  /** Column order (array of colIds in desired order). */
  columnOrder?: string[];
  /** Loading state. */
  loading?: boolean;
  /** Enable cell editing. */
  enableCellEditing?: boolean;
  /** Active tab (for persistence key scoping). */
  activeTab?: string;
  /** Called when a row is clicked. */
  onRowClick?: (entity: T) => void;
  /** Called when selection changes. */
  onSelectionChange?: (entities: T[]) => void;
  /** Pagination data (used when `paginationMode: 'server'`). */
  paginationData?: PaginationData;
  /** Called when next page button is clicked (server pagination only). */
  onNextPage?: () => void;
  /** Called when previous page button is clicked (server pagination only). */
  onPreviousPage?: () => void;
  /** Called when first page button is clicked (server pagination only). */
  onFirstPage?: () => void;
  /** Empty state component. */
  emptyStateComponent?: ReactNode;
  /**
   * Optional toolbar rendered in the same row as the search bar (or at the
   * top if no search is configured). Right-aligned via `ml-auto`.
   */
  toolbar?: ReactNode;

  // ------------------------------------------------------------------
  // Tier 3a additions
  // ------------------------------------------------------------------

  /** Enable multi-column sorting. */
  enableMultiSort?: boolean;
  /** Called when the sort model changes. */
  onSortChanged?: (sortModel: any) => void;
  /** Enable column filtering. */
  enableFiltering?: boolean;
  /** Called when the filter model changes. */
  onFilterChanged?: (filterModel: any) => void;
  /** Called when a cell begins editing. */
  onCellEditingStarted?: (event: any) => void;
  /** Called when a cell stops editing (proxied through to onCellEditingStopped). */
  onCellEditingStopped?: (event: any) => void;
  /** Called when a cell receives focus. */
  onCellFocused?: (event: any) => void;
  /** Function to compute extra CSS classes for a row. */
  getRowClass?: (params: any) => string | string[];
}

// ============================================================================
// Types — Combined & Ref API
// ============================================================================

/** Combined props interface. */
export interface EntityDataGridProps<T>
  extends EntityDataGridModelProps<T>, EntityDataGridViewProps<T> {}

/** Ref API exposed by the entity data grid. */
export interface EntityDataGridRef {
  /** Publish all dirty rows sequentially. */
  saveAll: () => Promise<void>;
  /** Discard all pending changes and reset rows to idle state. */
  discardAll: () => void;
  /** Return the IDs of rows with pending (unpublished) changes. */
  getDirtyRowIds: () => string[];
  /**
   * Returns the raw AG Grid API for advanced operations (column visibility,
   * selection, etc.). Returns null if the grid has not mounted yet.
   */
  getGridApi: () => GridApi | null;

  // Legacy aliases kept for smooth migration of any existing callers.
  /** @deprecated Use `saveAll()` instead. */
  saveAllDrafts: () => void;
  /** @deprecated Use `getDirtyRowIds().length > 0` instead. */
  getHasUnsavedChanges: () => boolean;
  /** @deprecated Use `discardAll()` instead. */
  discardAllDrafts: () => void;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a typed entity data grid component with row-level auto-publish,
 * optional search/filter UI, actions column, client/server pagination,
 * toolbar slot, auto-height, and drag-to-scroll.
 *
 * @param config - Entity-specific configuration (column defs, ID accessor, …)
 * @returns Object with `Component` (forwardRef component)
 */
export function createEntityDataGrid<T extends Record<string, any>>(
  config: EntityDataGridConfig<T>,
) {
  // -------------------------------------------------------------------------
  // Hoist computed values that don't depend on props
  // -------------------------------------------------------------------------

  // Actions column — computed once at factory creation (InitConfig).
  const actionsColDef: ColDef<T> | null = config.actionsColumn
    ? (() => {
        const { actionCount, width: actionsWidth, ...rest } = config.actionsColumn;
        const computedWidth =
          actionsWidth ?? (actionCount ? actionCount * 28 + (actionCount - 1) * 4 + 16 : 200);
        return {
          ...rest,
          headerName: rest.headerName ?? '',
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
            borderLeft: '1px solid var(--border)',
            borderTop: 'none',
            borderBottom: 'none',
            borderRight: 'none',
            padding: '0 4px',
          },
        };
      })()
    : null;

  // -------------------------------------------------------------------------
  // Component
  // -------------------------------------------------------------------------

  const Component = forwardRef<EntityDataGridRef, EntityDataGridProps<T>>(function EntityDataGrid(
    {
      // Model props
      data,
      onRowPublish,
      onDirtyChange,

      // View props
      columnVisibility = {},
      columnOrder,
      loading = false,
      enableCellEditing = false,
      activeTab = 'default',
      onRowClick,
      onSelectionChange,
      paginationData,
      onNextPage,
      onPreviousPage,
      onFirstPage,
      emptyStateComponent,
      toolbar,

      // Tier 3a
      enableMultiSort = false,
      onSortChanged: _onSortChanged,
      enableFiltering = false,
      onFilterChanged: _onFilterChanged,
      onCellEditingStarted: _onCellEditingStarted,
      onCellEditingStopped: _onCellEditingStoppedTier3,
      onCellFocused: _onCellFocused,
      getRowClass: _getRowClass,
    },
    ref,
  ) {
    const gridRef = useRef<DataGridRef<T>>(null);
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const publishHandleRef = useRef<RowAutoPublishHandle>(null);

    // ----------------------------------------------------------------
    // Row auto-publish
    // ----------------------------------------------------------------

    const { handleCellValueChanged, handleCellEditingStopped, getRowClass } = useRowAutoPublish<T>({
      getEntityId: config.getEntityId,
      ...(onRowPublish !== undefined ? { onRowPublish } : {}),
      ...(onDirtyChange !== undefined ? { onDirtyChange } : {}),
      handleRef: publishHandleRef,
    });

    // ----------------------------------------------------------------
    // Imperative Ref API
    // ----------------------------------------------------------------

    useImperativeHandle(
      ref,
      () => ({
        saveAll: async () => {
          await publishHandleRef.current?.saveAll();
        },
        discardAll: () => {
          publishHandleRef.current?.discardAll();
        },
        getDirtyRowIds: () => publishHandleRef.current?.getDirtyRowIds() ?? [],
        getGridApi: () => gridRef.current?.getGridApi() ?? null,
        // Legacy aliases
        saveAllDrafts: () => {
          void publishHandleRef.current?.saveAll();
        },
        getHasUnsavedChanges: () => (publishHandleRef.current?.getDirtyRowIds().length ?? 0) > 0,
        discardAllDrafts: () => {
          publishHandleRef.current?.discardAll();
        },
      }),
      [],
    );

    // ----------------------------------------------------------------
    // Search / Filter
    // ----------------------------------------------------------------

    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCount, setSelectedCount] = useState(0);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleSearchChange = useCallback((value: string) => {
      setSearchInput(value);
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => setSearchQuery(value), 150);
    }, []);

    useEffect(() => {
      return () => clearTimeout(searchDebounceRef.current);
    }, []);

    const filteredData = useMemo(() => {
      if (!config.searchConfig || !searchQuery) return data;
      const q = searchQuery.toLowerCase();
      const fields = config.searchConfig.fields;
      return data.filter((entity) =>
        fields.some((field) => {
          const value = entity[field];
          return typeof value === 'string' && value.toLowerCase().includes(q);
        }),
      );
    }, [data, searchQuery]);

    // ----------------------------------------------------------------
    // Grid context (merged: static config + runtime override)
    // ----------------------------------------------------------------

    // ----------------------------------------------------------------
    // Drag-to-scroll
    // ----------------------------------------------------------------

    useEffect(() => {
      if (!config.enableDragToScroll) return;
      const el = gridContainerRef.current;
      if (!el) return;

      let isDown = false;
      let hasDragged = false;
      let startX = 0;
      let scrollLeft = 0;
      let viewport: HTMLElement | null = null;
      const dragThreshold = 5;

      const getViewport = () => {
        if (!viewport) viewport = el.querySelector('.ag-center-cols-viewport');
        return viewport;
      };

      const onMouseDown = (e: MouseEvent) => {
        const vp = getViewport();
        if (!vp) return;
        const target = e.target as HTMLElement;
        if (
          target.closest('.ag-header') ||
          target.closest('.ag-popup') ||
          target.closest('input') ||
          target.closest('button')
        )
          return;
        isDown = true;
        hasDragged = false;
        startX = e.pageX;
        scrollLeft = vp.scrollLeft;
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        const dx = e.pageX - startX;
        if (!hasDragged && Math.abs(dx) > dragThreshold) {
          hasDragged = true;
          el.style.cursor = 'grabbing';
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
        const vp = getViewport();
        if (!vp || !hasDragged) return;
        vp.scrollLeft = scrollLeft - dx;
      };

      const onMouseUp = () => {
        if (!isDown) return;
        isDown = false;
        el.style.cursor = '';
        if (hasDragged) {
          const suppressClick = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
          };
          el.addEventListener('click', suppressClick, { capture: true, once: true });
          setTimeout(() => el.removeEventListener('click', suppressClick, { capture: true }), 100);
        }
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

    // ----------------------------------------------------------------
    // Column Pipeline
    // ----------------------------------------------------------------

    const applyColumnVisibility = useCallback(
      (defs: ColDef<T>[]) => {
        if (Object.keys(columnVisibility).length === 0) return defs;
        return defs.map((col) => {
          const colId = (col.colId as string) || (col.field as string);
          if (!colId) return col;
          const isVisible = columnVisibility[colId] !== false;
          return { ...col, hide: !isVisible };
        });
      },
      [columnVisibility],
    );

    const applyColumnOrder = useCallback(
      (defs: ColDef<T>[]) => {
        if (!columnOrder || columnOrder.length === 0) return defs;

        const colMap = new Map(
          defs.map((col) => {
            const colId = (col.colId as string) || (col.field as string);
            return [colId, col];
          }),
        );

        const ordered = columnOrder
          .map((colId) => colMap.get(colId))
          .filter((col): col is ColDef<T> => col !== undefined);

        const orderedSet = new Set(columnOrder);
        const remaining = defs.filter((col) => {
          const colId = (col.colId as string) || (col.field as string);
          return !orderedSet.has(colId);
        });

        return [...ordered, ...remaining];
      },
      [columnOrder],
    );

    const finalColumnDefs = useMemo(() => {
      let defs = [...config.columnDefs];
      defs = applyColumnVisibility(defs);
      defs = applyColumnOrder(defs);

      if (enableCellEditing && config.enhanceEditableColumnDefs) {
        defs = config.enhanceEditableColumnDefs(defs, { enabled: true });
      }

      if (enableFiltering) {
        defs = defs.map((col) => ({ ...col, filter: true }));
      }

      // Inject actions column last (pinned right).
      if (actionsColDef) {
        defs = [...defs, actionsColDef];
      }

      return defs;
    }, [applyColumnVisibility, applyColumnOrder, enableCellEditing, enableFiltering]);

    // ----------------------------------------------------------------
    // Selection count (used for count display in search bar)
    // ----------------------------------------------------------------

    const handleSelectionChange = useCallback(
      (entities: T[]) => {
        setSelectedCount(entities.length);
        onSelectionChange?.(entities);
      },
      [onSelectionChange],
    );

    // ----------------------------------------------------------------
    // Count label
    // ----------------------------------------------------------------

    const countLabel = useMemo(() => {
      const total = data.length;
      const filtered = filteredData.length;
      if (selectedCount > 0) {
        return `${selectedCount} of ${filtered} selected`;
      }
      if (searchQuery) {
        return `${filtered} of ${total} item${total !== 1 ? 's' : ''}`;
      }
      return `${total} item${total !== 1 ? 's' : ''}`;
    }, [data.length, filteredData.length, selectedCount, searchQuery]);

    // ----------------------------------------------------------------
    // Render
    // ----------------------------------------------------------------

    const hasSearchOrToolbar = !!(config.searchConfig || toolbar);

    return (
      <div className="flex flex-col h-full">
        <style dangerouslySetInnerHTML={{ __html: ROW_STATE_STYLES }} />

        {/* Search bar + toolbar row */}
        {hasSearchOrToolbar && (
          <div className="flex flex-wrap items-center gap-2 pb-4 sm:flex-nowrap sm:gap-3">
            {config.searchConfig && (
              <>
                <div className="relative w-full sm:w-auto sm:min-w-40 sm:max-w-72 sm:flex-1 lg:flex-none">
                  <Search
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder={config.searchConfig.placeholder ?? 'Search\u2026'}
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 shadow-none flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={config.searchConfig.placeholder ?? 'Search'}
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {countLabel}
                </span>
              </>
            )}
            {toolbar && (
              <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
                {toolbar}
              </div>
            )}
          </div>
        )}

        {/* Grid container */}
        <div
          ref={gridContainerRef}
          className={config.autoHeight ? undefined : 'flex-1 min-h-0'}
          style={config.autoHeight ? undefined : { height: '100%' }}
        >
          <DataGrid<T>
            ref={gridRef}
            columnDefs={finalColumnDefs}
            defaultColDef={config.defaultColDef}
            persistenceKey={`${config.persistenceKeyPrefix}-${activeTab}`}
            rowData={filteredData}
            loading={loading}
            enableCellEditing={enableCellEditing}
            onCellValueChanged={handleCellValueChanged}
            {...(enableCellEditing
              ? {
                  onCellEditingStopped: handleCellEditingStopped,
                  getRowClass,
                }
              : {})}
            {...(onRowClick !== undefined
              ? {
                  onRowClicked: (event: any) => {
                    if (event.data) onRowClick(event.data as T);
                  },
                }
              : {})}
            {...(onSelectionChange !== undefined
              ? { onSelectionChanged: handleSelectionChange }
              : {})}
            {...((config.paginationMode === 'server' || config.paginationMode === undefined) &&
            paginationData !== undefined
              ? { paginationData }
              : {})}
            {...((config.paginationMode === 'server' || config.paginationMode === undefined) &&
            onNextPage !== undefined
              ? { onNextPage }
              : {})}
            {...((config.paginationMode === 'server' || config.paginationMode === undefined) &&
            onPreviousPage !== undefined
              ? { onPreviousPage }
              : {})}
            {...((config.paginationMode === 'server' || config.paginationMode === undefined) &&
            onFirstPage !== undefined
              ? { onFirstPage }
              : {})}
            {...(emptyStateComponent !== undefined ? { emptyStateComponent } : {})}
            {...(enableMultiSort ? { enableSorting: true } : {})}
            {...(config.paginationMode === 'client' && config.pageSize !== undefined
              ? {
                  pagination: true,
                  paginationPageSize: config.pageSize,
                  paginationPageSizeSelector: false,
                }
              : {})}
            {...(config.autoHeight ? { domLayout: 'autoHeight' as const } : {})}
            height="100%"
            className="h-full arda-hide-auto-selection"
          />
        </div>
      </div>
    );
  });

  Component.displayName = config.displayName;

  return { Component };
}
