'use client';

import React, { forwardRef, useImperativeHandle, useRef, useCallback, useMemo } from 'react';

import type { ColDef } from 'ag-grid-community';
import { DataGrid, type DataGridRef } from '@/components/canary/molecules/data-grid';
import type { PaginationData } from '@/types/canary/pagination';
import { useDirtyTracking, type DirtyTrackingResult } from './use-dirty-tracking';

// ============================================================================
// Types — Factory Config
// ============================================================================

/**
 * Factory configuration passed once at creation time.
 * Defines the data model binding and entity-specific behaviour.
 */
export interface EntityDataGridConfig<T extends Record<string, any>> {
  /** Display name for the entity type (e.g. "Items", "Suppliers") */
  displayName: string;
  /** Persistence key prefix (e.g. "arda-items-data-grid") */
  persistenceKeyPrefix: string;
  /** Column definitions for this entity type */
  columnDefs: ColDef<T>[];
  /** Default column configuration */
  defaultColDef: ColDef<T>;
  /** Function to extract entity ID from an entity instance */
  getEntityId: (entity: T) => string;
  /** Optional function to enhance column defs with editing capabilities */
  enhanceEditableColumnDefs?: (defs: ColDef<T>[], options: { enabled: boolean }) => ColDef<T>[];
}

// ============================================================================
// Types — Model / Data Binding Props
// ============================================================================

/**
 * Model/Data binding props passed at render time.
 */
export interface EntityDataGridModelProps<T> {
  /** Row data array */
  data: T[];
  /** Called when an entity is updated via cell edit */
  onEntityUpdated?: (entity: T) => void;
  /** Called when unsaved changes state changes */
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

// ============================================================================
// Types — View / Layout / Controller Props
// ============================================================================

/**
 * View/Layout/Controller props passed at render time.
 */
export interface EntityDataGridViewProps<T> {
  /** Column visibility map (colId -> boolean) */
  columnVisibility?: Record<string, boolean>;
  /** Column order (array of colIds in desired order) */
  columnOrder?: string[];
  /** Loading state */
  loading?: boolean;
  /** Enable cell editing */
  enableCellEditing?: boolean;
  /** Active tab (for persistence key scoping) */
  activeTab?: string;
  /** Called when a row is clicked */
  onRowClick?: (entity: T) => void;
  /** Called when selection changes */
  onSelectionChange?: (entities: T[]) => void;
  /** Pagination data */
  paginationData?: PaginationData;
  /** Called when next page button is clicked */
  onNextPage?: () => void;
  /** Called when previous page button is clicked */
  onPreviousPage?: () => void;
  /** Called when first page button is clicked */
  onFirstPage?: () => void;
  /** Empty state component */
  emptyStateComponent?: React.ReactNode;

  // ------------------------------------------------------------------
  // Tier 3a additions
  // ------------------------------------------------------------------

  /** Enable multi-column sorting */
  enableMultiSort?: boolean;
  /** Called when the sort model changes */
  onSortChanged?: (sortModel: any) => void;
  /** Enable column filtering */
  enableFiltering?: boolean;
  /** Called when the filter model changes */
  onFilterChanged?: (filterModel: any) => void;
  /** Called when a cell begins editing */
  onCellEditingStarted?: (event: any) => void;
  /** Called when a cell stops editing */
  onCellEditingStopped?: (event: any) => void;
  /** Called when a cell receives focus */
  onCellFocused?: (event: any) => void;
  /** Function to compute extra CSS classes for a row */
  getRowClass?: (params: any) => string | string[];
}

// ============================================================================
// Types — Combined & Ref API
// ============================================================================

/** Combined props interface */
export interface EntityDataGridProps<T>
  extends EntityDataGridModelProps<T>, EntityDataGridViewProps<T> {}

/** Ref API exposed by the entity data grid */
export interface EntityDataGridRef {
  /** Save all unsaved changes (optimistic — clears tracking state) */
  saveAllDrafts: () => void;
  /** Check if there are unsaved changes */
  getHasUnsavedChanges: () => boolean;
  /** Discard all unsaved changes and restore original cell values */
  discardAllDrafts: () => void;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a typed entity data grid component with dirty tracking and editing
 * support.  Encapsulates the shared column pipeline, visibility/order,
 * pagination, and selection logic for any entity type.
 *
 * The factory accepts an optional `dirtyTrackingHook` for dependency injection
 * (mainly used in tests).  When omitted the default `useDirtyTracking` hook is
 * used.
 *
 * @param config - Entity-specific configuration (column defs, ID accessor, …)
 * @param dirtyTrackingHook - Override for the dirty tracking hook (optional)
 * @returns Object with `Component` (forwardRef component)
 */
export function createEntityDataGrid<T extends Record<string, any>>(
  config: EntityDataGridConfig<T>,
  dirtyTrackingHook?: (options: {
    getEntityId: (e: T) => string;
    onUnsavedChangesChange?: (hasChanges: boolean) => void;
  }) => DirtyTrackingResult,
) {
  const useTracking = dirtyTrackingHook ?? useDirtyTracking;

  const Component = forwardRef<EntityDataGridRef, EntityDataGridProps<T>>(function EntityDataGrid(
    {
      // Model props
      data,
      onEntityUpdated,
      onUnsavedChangesChange,

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

      // Tier 3a — accepted props; some are reserved for future DataGrid passthrough
      enableMultiSort = false,
      onSortChanged: _onSortChanged,
      enableFiltering = false,
      onFilterChanged: _onFilterChanged,
      onCellEditingStarted: _onCellEditingStarted,
      onCellEditingStopped: _onCellEditingStopped,
      onCellFocused: _onCellFocused,
      getRowClass: _getRowClass,
    },
    ref,
  ) {
    const gridRef = useRef<DataGridRef<T>>(null);

    // ----------------------------------------------------------------
    // Dirty Tracking
    // ----------------------------------------------------------------

    const { hasUnsavedChanges, handleCellValueChanged, saveAllDrafts, discardAllDrafts } =
      useTracking({
        getEntityId: config.getEntityId,
        ...(onUnsavedChangesChange !== undefined ? { onUnsavedChangesChange } : {}),
      });

    // ----------------------------------------------------------------
    // Cell value changed — combine dirty tracking + parent notification
    // ----------------------------------------------------------------

    const handleCellChanged = useCallback(
      (event: any) => {
        handleCellValueChanged(event);
        const entity = event.data as T | undefined;
        if (entity) {
          onEntityUpdated?.(entity);
        }
      },
      [handleCellValueChanged, onEntityUpdated],
    );

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

      // Apply filtering toggle
      if (enableFiltering) {
        defs = defs.map((col) => ({ ...col, filter: true }));
      }

      return defs;
    }, [applyColumnVisibility, applyColumnOrder, enableCellEditing, enableFiltering]);

    // ----------------------------------------------------------------
    // Imperative Ref API
    // ----------------------------------------------------------------

    useImperativeHandle(
      ref,
      () => ({
        saveAllDrafts,
        getHasUnsavedChanges: () => hasUnsavedChanges,
        discardAllDrafts: () => {
          const api = gridRef.current?.getGridApi();
          discardAllDrafts(api ?? null);
        },
      }),
      [hasUnsavedChanges, saveAllDrafts, discardAllDrafts],
    );

    // ----------------------------------------------------------------
    // Render
    // ----------------------------------------------------------------

    return (
      <DataGrid<T>
        ref={gridRef}
        columnDefs={finalColumnDefs}
        defaultColDef={config.defaultColDef}
        persistenceKey={`${config.persistenceKeyPrefix}-${activeTab}`}
        rowData={data}
        loading={loading}
        enableCellEditing={enableCellEditing}
        onCellValueChanged={handleCellChanged}
        {...(onRowClick !== undefined
          ? {
              onRowClicked: (event: any) => {
                if (event.data) onRowClick(event.data as T);
              },
            }
          : {})}
        {...(onSelectionChange !== undefined ? { onSelectionChanged: onSelectionChange } : {})}
        {...(paginationData !== undefined ? { paginationData } : {})}
        {...(onNextPage !== undefined ? { onNextPage } : {})}
        {...(onPreviousPage !== undefined ? { onPreviousPage } : {})}
        {...(onFirstPage !== undefined ? { onFirstPage } : {})}
        {...(emptyStateComponent !== undefined ? { emptyStateComponent } : {})}
        {...(enableMultiSort ? { enableSorting: true } : {})}
        height="100%"
        className="h-full arda-hide-auto-selection"
      />
    );
  });

  Component.displayName = config.displayName;

  return { Component };
}
