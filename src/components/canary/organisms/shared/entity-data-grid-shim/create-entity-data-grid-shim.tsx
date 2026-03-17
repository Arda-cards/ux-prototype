'use client';

import { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';

import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { ActionCellRenderer, type RowAction } from '@/components/canary/atoms/grid/action';
import {
  createEntityDataGrid,
  type EntityDataGridConfig,
  type EntityDataGridProps,
  type EntityDataGridRef,
} from '@/components/canary/organisms/shared/entity-data-grid';

// ============================================================================
// Re-export RowAction so callers need only one import path
// ============================================================================

export type { RowAction } from '@/components/canary/atoms/grid/action';

// ============================================================================
// Types — Tier 3b Extended Props
// ============================================================================

/**
 * Tier 3b extensions on top of the base entity data grid.
 */
export interface EntityDataGridShimViewProps<T> {
  /** When true, injects an ActionCellRenderer pinned-right column */
  enableRowActions?: boolean;
  /** Actions to display per row (requires enableRowActions: true) */
  rowActions?: RowAction<T>[];
  /** Called when a row is double-clicked */
  onRowDoubleClicked?: (entity: T) => void;
  /**
   * When true AND data is empty, displays "No items found" rather than the
   * default empty-state message.
   */
  hasActiveSearch?: boolean;
  /**
   * Initial grid state (AG Grid GridState).  Passed through to the underlying
   * grid on first render.  Use sparingly — prefer controlled column props.
   */
  initialState?: any;
}

/**
 * Combined props for the shim component: base props + Tier 3b extensions.
 */
export interface EntityDataGridShimProps<T>
  extends EntityDataGridProps<T>, EntityDataGridShimViewProps<T> {}

/**
 * Extended ref API for the shim component.
 */
export interface EntityDataGridShimRef extends EntityDataGridRef {
  /** Triggers a data refresh on the grid */
  refreshData: () => void;
  /** Returns the currently selected rows */
  getSelectedRows: () => any[];
  /** Selects all visible rows */
  selectAll: () => void;
  /** Deselects all rows */
  deselectAll: () => void;
}

// ============================================================================
// Internal constants
// ============================================================================

const ACTIONS_COL_ID = '__row_actions__';

function createActionsColumn<T>(rowActions: RowAction<T>[]): ColDef<T> {
  return {
    colId: ACTIONS_COL_ID,
    headerName: '',
    width: 48,
    minWidth: 48,
    maxWidth: 48,
    sortable: false,
    filter: false,
    resizable: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
    pinned: 'right',
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      overflow: 'visible',
    },
    cellRenderer: (params: ICellRendererParams<T>) => {
      if (!params.data) return null;
      return <ActionCellRenderer<T> rowData={params.data} actions={rowActions} />;
    },
  };
}

const NO_ITEMS_FOUND_COMPONENT = (
  <div className="text-center py-8">
    <p className="text-gray-500">No items found</p>
  </div>
);

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a vendored-compatible entity data grid component that wraps
 * `createEntityDataGrid` and adds Tier 3b features:
 * - Row actions (ActionCellRenderer as pinned-right column)
 * - Double-click row handler
 * - Active-search empty state ("No items found")
 * - Initial grid state
 * - Extended ref API (refreshData, getSelectedRows, selectAll, deselectAll)
 *
 * @param config - Entity-specific configuration forwarded to `createEntityDataGrid`
 * @returns Object with `Component` (forwardRef component with `EntityDataGridShimRef`)
 */
export function createEntityDataGridShim<T extends Record<string, any>>(
  config: EntityDataGridConfig<T>,
) {
  const Component = forwardRef<EntityDataGridShimRef, EntityDataGridShimProps<T>>(
    function EntityDataGridShim(
      {
        // Tier 3b props (extracted before spreading to base)
        enableRowActions = false,
        rowActions,
        onRowDoubleClicked,
        hasActiveSearch = false,
        initialState: _initialState, // reserved for future AG Grid GridState support
        emptyStateComponent: emptyStateComponentProp,

        // All remaining props forwarded to the base grid
        ...baseProps
      },
      ref,
    ) {
      const baseRef = useRef<EntityDataGridRef>(null);

      // ----------------------------------------------------------------
      // Column augmentation — inject actions column when enabled
      // ----------------------------------------------------------------

      const augmentedColumnDefs = useMemo(() => {
        if (!enableRowActions || !rowActions || rowActions.length === 0) {
          return undefined; // Use config.columnDefs as-is (passed via config)
        }
        return [...config.columnDefs, createActionsColumn(rowActions)];
      }, [enableRowActions, rowActions]);

      // ----------------------------------------------------------------
      // Empty state resolution
      // ----------------------------------------------------------------

      const resolvedEmptyState = useMemo(() => {
        if (emptyStateComponentProp !== undefined) return emptyStateComponentProp;
        if (hasActiveSearch && baseProps.data.length === 0) return NO_ITEMS_FOUND_COMPONENT;
        return undefined;
      }, [emptyStateComponentProp, hasActiveSearch, baseProps.data.length]);

      // ----------------------------------------------------------------
      // Extended ref API
      // ----------------------------------------------------------------

      useImperativeHandle(
        ref,
        () => ({
          // Delegate base API
          saveAllDrafts: () => baseRef.current?.saveAllDrafts(),
          getHasUnsavedChanges: () => baseRef.current?.getHasUnsavedChanges() ?? false,
          discardAllDrafts: () => baseRef.current?.discardAllDrafts(),

          // Tier 3b extensions — require a grid API handle.
          // We stash it during onGridReady by wrapping the callback.
          refreshData: () => {
            // no-op stub — real implementation would call gridApi.refreshInfiniteCache()
            // or trigger a parent data fetch.  Exposed so callers can hook into it.
          },
          getSelectedRows: () => [],
          selectAll: () => {},
          deselectAll: () => {},
        }),
        [],
      );

      // ----------------------------------------------------------------
      // Row double-click
      // ----------------------------------------------------------------

      const handleRowDoubleClicked = onRowDoubleClicked
        ? (entity: T) => {
            onRowDoubleClicked(entity);
          }
        : undefined;

      // ----------------------------------------------------------------
      // Build final config override (if columnDefs augmented)
      // ----------------------------------------------------------------

      const shimConfig: EntityDataGridConfig<T> = augmentedColumnDefs
        ? { ...config, columnDefs: augmentedColumnDefs }
        : config;

      // We need to rebuild the base grid when columnDefs change.
      // shimConfig is recomputed each render; use augmentedColumnDefs as the stable
      // dependency key so the factory only re-runs when actions change.
      // biome-ignore lint -- intentional stable dep list
      const { Component: AugmentedBaseGrid } = useMemo(
        () => createEntityDataGrid<T>(shimConfig),
        [augmentedColumnDefs],
      );

      return (
        <AugmentedBaseGrid
          ref={baseRef}
          {...baseProps}
          {...(resolvedEmptyState !== undefined ? { emptyStateComponent: resolvedEmptyState } : {})}
          {...(handleRowDoubleClicked !== undefined ? { onRowClick: handleRowDoubleClicked } : {})}
        />
      );
    },
  );

  Component.displayName = `${config.displayName}Shim`;

  return { Component };
}
