import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { ArdaDataGrid, ArdaDataGridRef } from '@/components/molecules/data-grid/data-grid';
import {
  itemsColumnDefs,
  itemsDefaultColDef,
  enhanceEditableColumnDefs,
} from '@/components/molecules/data-grid/presets/items/items-column-presets';
import type { Item } from '@/types/reference/items/item-domain';
import type { PaginationData } from '@/types/model';

// ============================================================================
// Types
// ============================================================================

export interface ArdaItemsDataGridStaticConfig {
  /** Column visibility map (colId -> boolean) */
  columnVisibility?: Record<string, boolean>;
  /** Column order (array of colIds in desired order) */
  columnOrder?: string[];
}

export interface ArdaItemsDataGridRuntimeConfig {
  /** Items to display in the grid */
  items: Item[];
  /** Loading state */
  loading?: boolean;
  /** Enable cell editing */
  enableCellEditing?: boolean;
  /** Active tab (for persistence key) */
  activeTab?: string;
  /** Called when a row is clicked */
  onRowClick?: (item: Item) => void;
  /** Called when selection changes */
  onSelectionChange?: (items: Item[]) => void;
  /** Called when an item is updated (cell edit complete) */
  onItemUpdated?: (item: Item) => void;
  /** Called when unsaved changes state changes */
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
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
}

export interface ArdaItemsDataGridProps
  extends ArdaItemsDataGridStaticConfig, ArdaItemsDataGridRuntimeConfig {}

export interface ArdaItemsDataGridRef {
  /** Save all unsaved changes */
  saveAllDrafts: () => void;
  /** Check if there are unsaved changes */
  getHasUnsavedChanges: () => boolean;
  /** Discard all unsaved changes */
  discardAllDrafts: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const ArdaItemsDataGrid = forwardRef<ArdaItemsDataGridRef, ArdaItemsDataGridProps>(
  function ArdaItemsDataGrid(
    {
      // Static config
      columnVisibility = {},
      columnOrder,

      // Runtime config
      items,
      loading = false,
      enableCellEditing = false,
      activeTab = 'default',
      onRowClick,
      onSelectionChange,
      onItemUpdated,
      onUnsavedChangesChange,
      paginationData,
      onNextPage,
      onPreviousPage,
      onFirstPage,
      emptyStateComponent,
    },
    ref,
  ) {
    const gridRef = useRef<ArdaDataGridRef<Item>>(null);

    // Track unsaved changes (edited items that haven't been saved)
    const [dirtyItems, setDirtyItems] = useState<Set<string>>(new Set());
    const dirtyItemDataRef = useRef<Map<string, Item>>(new Map());

    // Apply column visibility filtering to columnDefs
    const applyColumnVisibility = useCallback(
      (defs: typeof itemsColumnDefs) => {
        if (Object.keys(columnVisibility).length === 0) return defs;

        return defs.map((col) => {
          const colId = (col.colId as string) || (col.field as string);
          if (!colId) return col;

          // Check if this column should be visible
          const isVisible = columnVisibility[colId] !== false;

          return {
            ...col,
            hide: !isVisible,
          };
        });
      },
      [columnVisibility],
    );

    // Apply column order to columnDefs
    const applyColumnOrder = useCallback(
      (defs: typeof itemsColumnDefs) => {
        if (!columnOrder || columnOrder.length === 0) return defs;

        // Create a map of colId -> columnDef
        const colMap = new Map(
          defs.map((col) => {
            const colId = (col.colId as string) || (col.field as string);
            return [colId, col];
          }),
        );

        // Build ordered array
        const ordered = columnOrder
          .map((colId) => colMap.get(colId))
          .filter((col): col is (typeof defs)[number] => col !== undefined);

        // Add any columns not in the order array at the end
        const orderedSet = new Set(columnOrder);
        const remaining = defs.filter((col) => {
          const colId = (col.colId as string) || (col.field as string);
          return !orderedSet.has(colId);
        });

        return [...ordered, ...remaining];
      },
      [columnOrder],
    );

    // Build final column definitions
    const finalColumnDefs = React.useMemo(() => {
      let defs = [...itemsColumnDefs];

      // Apply visibility
      defs = applyColumnVisibility(defs);

      // Apply order
      defs = applyColumnOrder(defs);

      // Apply editing enhancements if enabled
      if (enableCellEditing) {
        defs = enhanceEditableColumnDefs(defs, { enabled: true });
      }

      return defs;
    }, [applyColumnVisibility, applyColumnOrder, enableCellEditing]);

    // Handle cell value changes
    const handleCellValueChanged = useCallback(
      (event: any) => {
        const item = event.data as Item;
        if (!item?.entityId) return;

        // Mark this item as dirty
        setDirtyItems((prev) => new Set(prev).add(item.entityId));
        dirtyItemDataRef.current.set(item.entityId, item);

        // Notify parent
        onUnsavedChangesChange?.(true);
        onItemUpdated?.(item);
      },
      [onItemUpdated, onUnsavedChangesChange],
    );

    // Update unsaved changes notification when dirty set changes
    useEffect(() => {
      onUnsavedChangesChange?.(dirtyItems.size > 0);
    }, [dirtyItems.size, onUnsavedChangesChange]);

    // Expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        saveAllDrafts: () => {
          // Clear all dirty state (optimistic save)
          setDirtyItems(new Set());
          dirtyItemDataRef.current.clear();
          onUnsavedChangesChange?.(false);
        },
        getHasUnsavedChanges: () => dirtyItems.size > 0,
        discardAllDrafts: () => {
          // Clear all dirty state and revert data
          setDirtyItems(new Set());
          dirtyItemDataRef.current.clear();
          onUnsavedChangesChange?.(false);

          // Refresh grid to revert visual changes
          const api = gridRef.current?.getGridApi();
          if (api) {
            api.refreshCells({ force: true });
          }
        },
      }),
      [dirtyItems.size, onUnsavedChangesChange],
    );

    return (
      <ArdaDataGrid<Item>
        ref={gridRef}
        columnDefs={finalColumnDefs}
        defaultColDef={itemsDefaultColDef}
        persistenceKey={`arda-items-data-grid-${activeTab}`}
        rowData={items}
        loading={loading}
        enableCellEditing={enableCellEditing}
        onCellValueChanged={handleCellValueChanged}
        onRowClicked={onRowClick ? (event) => onRowClick(event.data!) : undefined}
        onSelectionChanged={onSelectionChange}
        paginationData={paginationData}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        onFirstPage={onFirstPage}
        emptyStateComponent={emptyStateComponent}
        height="100%"
        className="h-full arda-hide-auto-selection"
      />
    );
  },
);

ArdaItemsDataGrid.displayName = 'ArdaItemsDataGrid';
