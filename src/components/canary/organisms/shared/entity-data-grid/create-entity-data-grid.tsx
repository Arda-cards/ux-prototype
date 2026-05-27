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
import type {
  ColDef,
  GridApi,
  PasteEndEvent,
  FillEndEvent,
  CutEndEvent,
  CellValueChangedEvent,
  CellEditingStoppedEvent,
  RowClassParams,
} from 'ag-grid-community';
import {
  DataGrid,
  type DataGridRef,
  type DataGridProps,
  type RowEditPayload,
} from '@/components/canary/molecules/data-grid';
import type { PaginationData } from '@/types/canary/utilities/pagination';
import {
  useRowAutoPublish,
  type RowAutoPublishHandle,
  type PendingChanges,
} from './use-row-auto-publish';
import {
  useCommitPipeline,
  type CommitPipelineHandle,
  type RowChange,
  type CommitResult,
} from './use-commit-pipeline';
import { useDraftPersistence } from './use-draft-persistence';

// ============================================================================
// CSS — Row visual state styles
// ============================================================================

/** Injected once inside the grid container; scoped by AG Grid's class hierarchy. */
const ROW_STATE_STYLES = `
  .ag-row-saving { background-color: color-mix(in srgb, var(--primary) 6%, var(--background)) !important; }
  .ag-row-error  { background-color: color-mix(in srgb, var(--destructive) 8%, var(--background)) !important; }
`;

// ============================================================================
// Types — Read model: discriminated data source (DQ-002)
// ============================================================================

/** A block of rows requested by the server-side row model. */
export interface BlockRequest {
  /** Index of the first row in the block (inclusive). */
  startRow: number;
  /** Index past the last row in the block (exclusive). */
  endRow: number;
  /** AG Grid sort model for the block, if any. */
  sortModel?: unknown;
  /** AG Grid filter model for the block, if any. */
  filterModel?: unknown;
}

/**
 * The read model, expressed as a discriminated union so invalid combinations
 * are unrepresentable (DQ-002):
 * - `client` — every row is held in memory; filter/sort/paginate happen in the
 *   browser. The idiomatic default for small/medium tables.
 * - `server` — the grid requests blocks via a datasource (SSRM). Required for
 *   large tables. **Wired in Phase 2** — supplying it in Phase 0 renders no rows.
 */
export type EntityDataSource<T> =
  | { mode: 'client'; data: T[] }
  | {
      mode: 'server';
      getRows: (block: BlockRequest) => Promise<{ rows: T[]; lastRow: number }>;
    };

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
export interface ConnectedDataGridConfig<T extends Record<string, any>> {
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

  // --- Add-row / create lifecycle (DQ-004/005/013) ---

  /**
   * Fields that must all be non-empty before an added (draft) row auto-creates
   * via `onCreate`. Empty/omitted → added rows never auto-create.
   */
  requiredFields?: (keyof T)[];
  /**
   * Seed values applied to a newly-added row (e.g. token defaults). Passed to
   * the molecule's `addRow(seed)`; merged under any per-call overrides.
   */
  newRowDefaults?: Partial<T> | (() => Partial<T>);
  /**
   * Read the server id off an entity (for PUT/DELETE URLs). Defaults to
   * `getEntityId`. The grid id (`getEntityId`) stays stable across draft→saved;
   * the server id rides separately (DQ-005).
   */
  getServerId?: (entity: T) => string | undefined;
}

// ============================================================================
// Types — Model / Data Binding Props
// ============================================================================

/**
 * Model/Data binding props passed at render time.
 */
export interface ConnectedDataGridModelProps<T> {
  /**
   * Row data array (implicit client read model).
   * @deprecated Prefer `dataSource={{ mode: 'client', data }}`. Still fully
   * supported; `dataSource` takes precedence when both are supplied.
   */
  data?: T[];
  /**
   * Discriminated read source (DQ-002). Takes precedence over `data`. The
   * `server` (SSRM) mode is wired in Phase 2; until then it renders no rows.
   */
  dataSource?: EntityDataSource<T>;
  /**
   * Called when a row is ready to publish (user moved away from a row while
   * changes were pending). Receives the batched field changes for that row.
   * `entity` is the current row snapshot; `undefined` when called from `saveAll()`.
   *
   * The per-row write seam. For spreadsheet-style bulk persistence (paste, fill,
   * undo) use `onCommit` instead.
   */
  onRowPublish?: (rowId: string, changes: PendingChanges, entity?: T) => Promise<void>;
  /**
   * Bulk write seam (DQ-003). When provided, the grid runs the commit pipeline:
   * single edits, range paste, fill-down, cut and undo all accumulate dirty rows
   * and flush as one batch to `onCommit`, which routes by size (single
   * `PUT …/{id}` vs atomic `PUT …/bulk`) and returns per-row results to reconcile.
   * Takes precedence over `onRowPublish` when both are supplied.
   */
  onCommit?: (changes: RowChange<T>[]) => Promise<CommitResult[]>;
  /**
   * Create seam (DQ-001). Called once an added (draft) row's `requiredFields`
   * are all non-empty — at row blur, paste/fill flush, or `saveAll`. Receives
   * the full row snapshot; resolves to the authoritative entity to reconcile
   * (which MUST keep the grid id, `getEntityId(returned) === rowId`). Throwing
   * leaves the row a draft in the `error` state. Without it, added rows stay
   * client-only.
   */
  onCreate?: (row: T) => Promise<T>;
  /** Called when the dirty state (has any unpublished rows) changes. */
  onDirtyChange?: (dirty: boolean) => void;
}

// ============================================================================
// Types — View / Layout / Controller Props
// ============================================================================

/**
 * View/Layout/Controller props passed at render time.
 */
export interface ConnectedDataGridViewProps<T> {
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
// Types — Prop forwarding (DQ-006)
// ============================================================================

/**
 * Props the container drives — removed from the forwarded `DataGrid` surface so
 * a consumer can't conflict with it (passing any of these is a compile error).
 * Everything the container does *not* own — `dataTypeDefinitions`, `columnTypes`,
 * `cellSelection`, `clipboardPaste`, `undoRedoLimit`, `onPasteEnd`/`onFillEnd`/
 * `onCutEnd`, … — flows through for free, so new molecule capability props need
 * no container edit.
 */
export type OwnedByContainer =
  // data + write lifecycle
  | 'rowData'
  | 'onCellEditingStopped'
  | 'getRowClass'
  // supplied by the factory config
  | 'columnDefs'
  | 'defaultColDef'
  | 'actionsColumn'
  | 'autoHeight'
  // the container reimplements / owns these
  | 'searchConfig'
  | 'pageSize'
  | 'toolbar'
  | 'emptyContent'
  | 'loading'
  | 'onRowClick'
  | 'onSelectionChange'
  | 'editable'
  | 'height'
  | 'className'
  | 'gridRef';

/** The `DataGrid` capability props the container forwards untouched. */
export type ForwardedDataGridProps<T> = Omit<DataGridProps<T>, OwnedByContainer>;

// ============================================================================
// Types — Combined & Ref API
// ============================================================================

/** Combined props interface. */
export interface ConnectedDataGridProps<T>
  extends
    ConnectedDataGridModelProps<T>,
    ConnectedDataGridViewProps<T>,
    ForwardedDataGridProps<T> {}

/** Ref API exposed by the connected data grid. */
export interface ConnectedDataGridRef {
  /** Publish/commit all dirty rows. */
  saveAll: () => Promise<void>;
  /** Discard all pending changes and reset rows to idle state. */
  discardAll: () => void;
  /** Return the IDs of rows with pending (unpublished) changes. */
  getDirtyRowIds: () => string[];
  /**
   * Insert a new (draft) row: merges `newRowDefaults` with `overrides`, delegates
   * to the molecule, and opens the first required field's editor. Returns the new
   * row's grid id.
   */
  addRow: (overrides?: Record<string, unknown>) => string;
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
 * Creates a typed connected data grid component — a stateful container that
 * wraps the presentational `DataGrid` molecule and adds the two things a
 * persistent grid needs: a read source (`data`/`dataSource`) and a write path
 * (per-row `onRowPublish` or bulk `onCommit`). Also provides optional
 * search/filter UI, an actions column, client/server pagination, a toolbar slot,
 * auto-height and drag-to-scroll.
 *
 * @param config - Entity-specific configuration (column defs, ID accessor, …)
 * @returns Object with `Component` (forwardRef component)
 */
export function createConnectedDataGrid<T extends Record<string, any>>(
  config: ConnectedDataGridConfig<T>,
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

  const Component = forwardRef<ConnectedDataGridRef, ConnectedDataGridProps<T>>(
    function ConnectedDataGrid(
      {
        // Model props
        data,
        dataSource,
        onRowPublish,
        onCommit,
        onCreate,
        onDirtyChange,

        // View props
        columnVisibility = {},
        columnOrder,
        loading = false,
        enableCellEditing = false,
        activeTab: _activeTab = 'default',
        onRowClick,
        onSelectionChange,
        paginationData: _paginationData,
        onNextPage: _onNextPage,
        onPreviousPage: _onPreviousPage,
        onFirstPage: _onFirstPage,
        emptyStateComponent,
        toolbar,

        // Tier 3a
        enableMultiSort: _enableMultiSort = false,
        onSortChanged: _onSortChanged,
        enableFiltering = false,
        onFilterChanged: _onFilterChanged,
        onCellEditingStarted: _onCellEditingStarted,
        onCellEditingStopped: _onCellEditingStoppedTier3,
        onCellFocused: _onCellFocused,
        getRowClass: _getRowClass,

        // Forwarded molecule capability props the container composes (flush points).
        onCellValueChanged: consumerOnCellValueChanged,
        onPasteEnd: consumerOnPasteEnd,
        onFillEnd: consumerOnFillEnd,
        onCutEnd: consumerOnCutEnd,
        onRowsAdded: consumerOnRowsAdded,

        // Remaining forwarded molecule capability props (passthrough — DQ-006):
        // dataTypeDefinitions, columnTypes, cellSelection, clipboardPaste,
        // undoRedoLimit, enableRowSelection, emptyMessage, …
        ...passthrough
      },
      ref,
    ) {
      const gridRef = useRef<DataGridRef<T>>(null);
      const gridContainerRef = useRef<HTMLDivElement>(null);
      const publishHandleRef = useRef<RowAutoPublishHandle>(null);
      const commitHandleRef = useRef<CommitPipelineHandle>(null);

      // ----------------------------------------------------------------
      // Read model — resolve the effective client rows (DQ-002)
      // ----------------------------------------------------------------

      const clientData = useMemo<T[]>(() => {
        if (dataSource) {
          if (dataSource.mode === 'client') return dataSource.data;
          // SSRM lands in Phase 2; render no rows until then.
          if (import.meta.env.DEV) {
            console.warn(
              '[ConnectedDataGrid] dataSource.mode="server" (SSRM) is not implemented ' +
                'until Phase 2; rendering no rows.',
            );
          }
          return [];
        }
        return data ?? [];
      }, [dataSource, data]);

      // ----------------------------------------------------------------
      // Write path — pick the bulk commit pipeline (onCommit) or the
      // per-row auto-publish path (onRowPublish). DQ-003.
      // ----------------------------------------------------------------

      const useCommit = onCommit !== undefined;
      // Whether an *update* write seam exists at all. With neither, editing an
      // existing row must stay purely in-memory — no save lifecycle, no
      // `saving`/`idle` row-class churn (which would repaint the row, steal cell
      // focus and break native Ctrl+Z undo). Draft *creates* (onCreate) are separate.
      const hasUpdateSeam = onCommit !== undefined || onRowPublish !== undefined;

      // Create lifecycle for added (draft) rows. Defined first so its `isDraft`
      // predicate suppresses the PUT write path for unsaved rows (DQ-003).
      const requiredFields = config.requiredFields ?? [];
      const {
        isDraft,
        markAdded: draftMarkAdded,
        handleCellValueChanged: draftHandleCellValueChanged,
        handleCellEditingStopped: draftHandleCellEditingStopped,
        handlePasteEnd: draftHandlePasteEnd,
        handleFillEnd: draftHandleFillEnd,
      } = useDraftPersistence<T>({
        getEntityId: config.getEntityId,
        getApi: () => gridRef.current?.getGridApi() ?? null,
        requiredFields,
        ...(onCreate !== undefined ? { onCreate } : {}),
      });

      const {
        handleCellValueChanged: publishHandleCellValueChanged,
        handleCellEditingStopped: publishHandleCellEditingStopped,
        getRowClass: publishGetRowClass,
      } = useRowAutoPublish<T>({
        getEntityId: config.getEntityId,
        ...(onRowPublish !== undefined ? { onRowPublish } : {}),
        ...(onDirtyChange !== undefined ? { onDirtyChange } : {}),
        isDraft,
        handleRef: publishHandleRef,
      });

      const {
        handleCellValueChanged: commitHandleCellValueChanged,
        handleCellEditingStopped: commitHandleCellEditingStopped,
        handlePasteEnd: commitHandlePasteEnd,
        handleFillEnd: commitHandleFillEnd,
        handleCutEnd: commitHandleCutEnd,
        getRowClass: commitGetRowClass,
      } = useCommitPipeline<T>({
        getEntityId: config.getEntityId,
        ...(onCommit !== undefined ? { onCommit } : {}),
        ...(onDirtyChange !== undefined ? { onDirtyChange } : {}),
        isDraft,
        handleRef: commitHandleRef,
      });

      // The active update-path handlers (bulk commit or per-row auto-publish);
      // both skip draft rows internally. The draft handlers run alongside them.
      const updateCellValueChanged = useCommit
        ? commitHandleCellValueChanged
        : publishHandleCellValueChanged;
      const updateCellEditingStopped = useCommit
        ? commitHandleCellEditingStopped
        : publishHandleCellEditingStopped;
      const updateGetRowClass = useCommit ? commitGetRowClass : publishGetRowClass;

      const handleCellValueChanged = useCallback(
        (event: CellValueChangedEvent<T>) => {
          if (hasUpdateSeam) updateCellValueChanged(event);
          draftHandleCellValueChanged(event);
          consumerOnCellValueChanged?.(event);
        },
        [
          hasUpdateSeam,
          updateCellValueChanged,
          draftHandleCellValueChanged,
          consumerOnCellValueChanged,
        ],
      );
      const handleCellEditingStopped = useCallback(
        (event: CellEditingStoppedEvent<T>) => {
          if (hasUpdateSeam) updateCellEditingStopped(event);
          draftHandleCellEditingStopped(event);
        },
        [hasUpdateSeam, updateCellEditingStopped, draftHandleCellEditingStopped],
      );
      // Update-path visuals (saving/error) only when an update seam is wired;
      // otherwise edits are in-memory with no row-class churn. Drafts never tint.
      const getRowClass = useCallback(
        (params: RowClassParams<T>) => (hasUpdateSeam ? updateGetRowClass(params) : undefined),
        [hasUpdateSeam, updateGetRowClass],
      );

      // Compose the bulk flush points: update pipeline + draft create + consumer.
      const handlePasteEnd = useCallback(
        (event: PasteEndEvent<T>) => {
          if (useCommit) commitHandlePasteEnd(event);
          draftHandlePasteEnd();
          consumerOnPasteEnd?.(event);
        },
        [useCommit, commitHandlePasteEnd, draftHandlePasteEnd, consumerOnPasteEnd],
      );
      const handleFillEnd = useCallback(
        (event: FillEndEvent<T>) => {
          if (useCommit) commitHandleFillEnd(event);
          draftHandleFillEnd();
          consumerOnFillEnd?.(event);
        },
        [useCommit, commitHandleFillEnd, draftHandleFillEnd, consumerOnFillEnd],
      );
      const handleCutEnd = useCallback(
        (event: CutEndEvent<T>) => {
          if (useCommit) commitHandleCutEnd(event);
          consumerOnCutEnd?.(event);
        },
        [useCommit, commitHandleCutEnd, consumerOnCutEnd],
      );

      // Mark freshly-added rows as drafts, then forward any consumer handler.
      const handleRowsAdded = useCallback(
        (payload: RowEditPayload<T>) => {
          draftMarkAdded(payload);
          consumerOnRowsAdded?.(payload);
        },
        [draftMarkAdded, consumerOnRowsAdded],
      );

      const wirePasteEnd = useCommit || consumerOnPasteEnd !== undefined || onCreate !== undefined;
      const wireFillEnd = useCommit || consumerOnFillEnd !== undefined || onCreate !== undefined;
      const wireCutEnd = useCommit || consumerOnCutEnd !== undefined;
      const wireRowsAdded = onCreate !== undefined || consumerOnRowsAdded !== undefined;

      // ----------------------------------------------------------------
      // Imperative Ref API
      // ----------------------------------------------------------------

      useImperativeHandle(ref, () => {
        const activeHandle = () => (useCommit ? commitHandleRef.current : publishHandleRef.current);
        return {
          saveAll: async () => {
            await activeHandle()?.saveAll();
          },
          discardAll: () => {
            activeHandle()?.discardAll();
          },
          getDirtyRowIds: () => activeHandle()?.getDirtyRowIds() ?? [],
          addRow: (overrides?: Record<string, unknown>) => {
            const defaults =
              typeof config.newRowDefaults === 'function'
                ? config.newRowDefaults()
                : (config.newRowDefaults ?? {});
            const seed = { ...defaults, ...(overrides ?? {}) } as Partial<T>;
            const startField = requiredFields[0] as (keyof T & string) | undefined;
            return (
              gridRef.current?.addRow(
                seed,
                startField !== undefined ? { startEditingField: startField } : undefined,
              ) ?? ''
            );
          },
          getGridApi: () => gridRef.current?.getGridApi() ?? null,
          // Legacy aliases
          saveAllDrafts: () => {
            void activeHandle()?.saveAll();
          },
          getHasUnsavedChanges: () => (activeHandle()?.getDirtyRowIds().length ?? 0) > 0,
          discardAllDrafts: () => {
            activeHandle()?.discardAll();
          },
        };
      }, [useCommit]);

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
        if (!config.searchConfig || !searchQuery) return clientData;
        const q = searchQuery.toLowerCase();
        const fields = config.searchConfig.fields;
        return clientData.filter((entity) =>
          fields.some((field) => {
            const value = entity[field];
            return typeof value === 'string' && value.toLowerCase().includes(q);
          }),
        );
      }, [clientData, searchQuery]);

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
            setTimeout(
              () => el.removeEventListener('click', suppressClick, { capture: true }),
              100,
            );
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
        const total = clientData.length;
        const filtered = filteredData.length;
        if (selectedCount > 0) {
          return `${selectedCount} of ${filtered} selected`;
        }
        if (searchQuery) {
          return `${filtered} of ${total} item${total !== 1 ? 's' : ''}`;
        }
        return `${total} item${total !== 1 ? 's' : ''}`;
      }, [clientData.length, filteredData.length, selectedCount, searchQuery]);

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
                      placeholder={config.searchConfig.placeholder ?? 'Search…'}
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
            <DataGrid
              ref={gridRef}
              {...passthrough}
              columnDefs={finalColumnDefs}
              defaultColDef={config.defaultColDef}
              rowData={filteredData}
              loading={loading}
              editable={enableCellEditing}
              onCellValueChanged={handleCellValueChanged}
              {...(enableCellEditing
                ? {
                    onCellEditingStopped: handleCellEditingStopped,
                    getRowClass,
                  }
                : {})}
              {...(wirePasteEnd ? { onPasteEnd: handlePasteEnd } : {})}
              {...(wireFillEnd ? { onFillEnd: handleFillEnd } : {})}
              {...(wireCutEnd ? { onCutEnd: handleCutEnd } : {})}
              {...(wireRowsAdded ? { onRowsAdded: handleRowsAdded } : {})}
              {...(onRowClick !== undefined
                ? {
                    onRowClick: (entity: T) => onRowClick(entity),
                  }
                : {})}
              {...(onSelectionChange !== undefined
                ? { onSelectionChange: handleSelectionChange }
                : {})}
              {...(emptyStateComponent !== undefined ? { emptyContent: emptyStateComponent } : {})}
              {...(config.paginationMode === 'client' && config.pageSize !== undefined
                ? { pageSize: config.pageSize }
                : {})}
              {...(config.autoHeight ? { autoHeight: true } : {})}
              height="100%"
              className="h-full arda-hide-auto-selection"
            />
          </div>
        </div>
      );
    },
  );

  Component.displayName = config.displayName;

  return { Component };
}

// ============================================================================
// Deprecated aliases — EntityDataGrid → ConnectedDataGrid (DQ-008)
// ----------------------------------------------------------------------------
// The container was renamed when it gained the read-source + commit roles.
// These keep existing callers (item-grid, the shim, ~30 use-case stories)
// compiling untouched; migrate to the `ConnectedDataGrid*` names over time.
// ============================================================================

/** @deprecated Renamed to {@link createConnectedDataGrid} (DQ-008). */
export const createEntityDataGrid = createConnectedDataGrid;

/** @deprecated Renamed to {@link ConnectedDataGridConfig} (DQ-008). */
export type EntityDataGridConfig<T extends Record<string, any>> = ConnectedDataGridConfig<T>;
/** @deprecated Renamed to {@link ConnectedDataGridModelProps} (DQ-008). */
export type EntityDataGridModelProps<T> = ConnectedDataGridModelProps<T>;
/** @deprecated Renamed to {@link ConnectedDataGridViewProps} (DQ-008). */
export type EntityDataGridViewProps<T> = ConnectedDataGridViewProps<T>;
/** @deprecated Renamed to {@link ConnectedDataGridProps} (DQ-008). */
export type EntityDataGridProps<T> = ConnectedDataGridProps<T>;
/** @deprecated Renamed to {@link ConnectedDataGridRef} (DQ-008). */
export type EntityDataGridRef = ConnectedDataGridRef;
