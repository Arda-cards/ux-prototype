import { forwardRef } from 'react';

import {
  createArdaEntityDataGrid,
  type EntityDataGridRef,
  type EntityDataGridProps,
} from '@/components/organisms/shared/entity-data-grid';
import {
  suppliersColumnDefs,
  suppliersDefaultColDef,
  enhanceEditableSupplierColumnDefs,
} from '@/components/molecules/data-grid/presets/suppliers/suppliers-column-presets';
import type { BusinessAffiliate } from '@/types/reference/business-affiliates/business-affiliate';

// ============================================================================
// Factory Instance
// ============================================================================

const { Component: BaseSupplierDataGrid } = createArdaEntityDataGrid<BusinessAffiliate>({
  displayName: 'ArdaSupplierDataGrid',
  persistenceKeyPrefix: 'arda-suppliers-data-grid',
  columnDefs: suppliersColumnDefs,
  defaultColDef: suppliersDefaultColDef,
  getEntityId: (supplier) => supplier.eId,
  enhanceEditableColumnDefs: enhanceEditableSupplierColumnDefs,
});

// ============================================================================
// Entity-Specific Types
// ============================================================================

/**
 * Supplier-specific props with entity-specific naming.
 * Maps "suppliers" to generic "data" and "onSupplierUpdated" to "onEntityUpdated".
 */
export interface ArdaSupplierDataGridProps extends Omit<
  EntityDataGridProps<BusinessAffiliate>,
  'data' | 'onEntityUpdated'
> {
  /** Suppliers to display in the grid */
  suppliers: BusinessAffiliate[];
  /** Called when a supplier is updated (cell edit complete) */
  onSupplierUpdated?: (supplier: BusinessAffiliate) => void;
}

/**
 * Ref API for Supplier data grid.
 * Re-exports the generic EntityDataGridRef.
 */
export interface ArdaSupplierDataGridRef extends EntityDataGridRef {}

// ============================================================================
// Component Wrapper
// ============================================================================

/**
 * Supplier data grid organism.
 * Thin wrapper around the entity data grid factory with supplier-specific prop names.
 */
export const ArdaSupplierDataGrid = forwardRef<ArdaSupplierDataGridRef, ArdaSupplierDataGridProps>(
  function ArdaSupplierDataGrid({ suppliers, onSupplierUpdated, ...otherProps }, ref) {
    return (
      <BaseSupplierDataGrid
        ref={ref}
        data={suppliers}
        {...(onSupplierUpdated !== undefined ? { onEntityUpdated: onSupplierUpdated } : {})}
        {...otherProps}
      />
    );
  },
);

ArdaSupplierDataGrid.displayName = 'ArdaSupplierDataGrid';
