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
  suppliersColumnDefs,
  suppliersDefaultColDef,
  enhanceEditableSupplierColumnDefs,
} from '@/components/molecules/data-grid/presets/suppliers/suppliers-column-presets';
import type { BusinessAffiliate } from '@/types/reference/business-affiliates/business-affiliate';
import type { PaginationData } from '@/types/model';

// ============================================================================
// Types
// ============================================================================

export interface ArdaSupplierDataGridStaticConfig {
  /** Column visibility map (colId -> boolean) */
  columnVisibility?: Record<string, boolean>;
  /** Column order (array of colIds in desired order) */
  columnOrder?: string[];
}

export interface ArdaSupplierDataGridRuntimeConfig {
  /** Suppliers to display in the grid */
  suppliers: BusinessAffiliate[];
  /** Loading state */
  loading?: boolean;
  /** Enable cell editing */
  enableCellEditing?: boolean;
  /** Active tab (for persistence key) */
  activeTab?: string;
  /** Called when a row is clicked */
  onRowClick?: (supplier: BusinessAffiliate) => void;
  /** Called when selection changes */
  onSelectionChange?: (suppliers: BusinessAffiliate[]) => void;
  /** Called when a supplier is updated (cell edit complete) */
  onSupplierUpdated?: (supplier: BusinessAffiliate) => void;
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

export interface ArdaSupplierDataGridProps
  extends ArdaSupplierDataGridStaticConfig, ArdaSupplierDataGridRuntimeConfig {}

export interface ArdaSupplierDataGridRef {
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

export const ArdaSupplierDataGrid = forwardRef<ArdaSupplierDataGridRef, ArdaSupplierDataGridProps>(
  function ArdaSupplierDataGrid(
    {
      // Static config
      columnVisibility = {},
      columnOrder,

      // Runtime config
      suppliers,
      loading = false,
      enableCellEditing = false,
      activeTab = 'default',
      onRowClick,
      onSelectionChange,
      onSupplierUpdated,
      onUnsavedChangesChange,
      paginationData,
      onNextPage,
      onPreviousPage,
      onFirstPage,
      emptyStateComponent,
    },
    ref,
  ) {
    const gridRef = useRef<ArdaDataGridRef<BusinessAffiliate>>(null);

    // Track unsaved changes (edited suppliers that haven't been saved)
    const [dirtyItems, setDirtyItems] = useState<Set<string>>(new Set());
    const dirtyItemDataRef = useRef<Map<string, BusinessAffiliate>>(new Map());

    // Apply column visibility filtering to columnDefs
    const applyColumnVisibility = useCallback(
      (defs: typeof suppliersColumnDefs) => {
        if (Object.keys(columnVisibility).length === 0) return defs;

        return defs.map((col) => {
          const colId = (col.colId as string) || (col.field as string);
          if (!colId) return col;

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
      (defs: typeof suppliersColumnDefs) => {
        if (!columnOrder || columnOrder.length === 0) return defs;

        const colMap = new Map(
          defs.map((col) => {
            const colId = (col.colId as string) || (col.field as string);
            return [colId, col];
          }),
        );

        const ordered = columnOrder
          .map((colId) => colMap.get(colId))
          .filter((col): col is (typeof defs)[number] => col !== undefined);

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
      let defs = [...suppliersColumnDefs];

      // Apply visibility
      defs = applyColumnVisibility(defs);

      // Apply order
      defs = applyColumnOrder(defs);

      // Apply editing enhancements if enabled
      if (enableCellEditing) {
        defs = enhanceEditableSupplierColumnDefs(defs, { enabled: true });
      }

      return defs;
    }, [applyColumnVisibility, applyColumnOrder, enableCellEditing]);

    // Handle cell value changes
    const handleCellValueChanged = useCallback(
      (event: any) => {
        const supplier = event.data as BusinessAffiliate;
        if (!supplier?.eId) return;

        // Mark this supplier as dirty
        setDirtyItems((prev) => new Set(prev).add(supplier.eId));
        dirtyItemDataRef.current.set(supplier.eId, supplier);

        // Notify parent
        onUnsavedChangesChange?.(true);
        onSupplierUpdated?.(supplier);
      },
      [onSupplierUpdated, onUnsavedChangesChange],
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
          setDirtyItems(new Set());
          dirtyItemDataRef.current.clear();
          onUnsavedChangesChange?.(false);
        },
        getHasUnsavedChanges: () => dirtyItems.size > 0,
        discardAllDrafts: () => {
          setDirtyItems(new Set());
          dirtyItemDataRef.current.clear();
          onUnsavedChangesChange?.(false);

          const api = gridRef.current?.getGridApi();
          if (api) {
            api.refreshCells({ force: true });
          }
        },
      }),
      [dirtyItems.size, onUnsavedChangesChange],
    );

    return (
      <ArdaDataGrid<BusinessAffiliate>
        ref={gridRef}
        columnDefs={finalColumnDefs}
        defaultColDef={suppliersDefaultColDef}
        persistenceKey={`arda-suppliers-data-grid-${activeTab}`}
        rowData={suppliers}
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

ArdaSupplierDataGrid.displayName = 'ArdaSupplierDataGrid';
