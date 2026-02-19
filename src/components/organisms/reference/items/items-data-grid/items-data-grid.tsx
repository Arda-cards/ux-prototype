import { forwardRef } from 'react';

import {
  createArdaEntityDataGrid,
  type EntityDataGridRef,
  type EntityDataGridProps,
} from '@/components/organisms/shared/entity-data-grid';
import {
  itemsColumnDefs,
  itemsDefaultColDef,
  enhanceEditableColumnDefs,
} from '@/components/molecules/data-grid/presets/items/items-column-presets';
import type { Item } from '@/types/reference/items/item-domain';

// ============================================================================
// Factory Instance
// ============================================================================

const { Component: BaseItemsDataGrid } = createArdaEntityDataGrid<Item>({
  displayName: 'ArdaItemsDataGrid',
  persistenceKeyPrefix: 'arda-items-data-grid',
  columnDefs: itemsColumnDefs,
  defaultColDef: itemsDefaultColDef,
  getEntityId: (item) => item.entityId,
  enhanceEditableColumnDefs,
});

// ============================================================================
// Entity-Specific Types
// ============================================================================

/**
 * Items-specific props with entity-specific naming.
 * Maps "items" to generic "data" and "onItemUpdated" to "onEntityUpdated".
 */
export interface ArdaItemsDataGridProps extends Omit<
  EntityDataGridProps<Item>,
  'data' | 'onEntityUpdated'
> {
  /** Items to display in the grid */
  items: Item[];
  /** Called when an item is updated (cell edit complete) */
  onItemUpdated?: (item: Item) => void;
}

/**
 * Ref API for Items data grid.
 * Re-exports the generic EntityDataGridRef.
 */
export interface ArdaItemsDataGridRef extends EntityDataGridRef {}

// ============================================================================
// Component Wrapper
// ============================================================================

/**
 * Items data grid organism.
 * Thin wrapper around the entity data grid factory with items-specific prop names.
 */
export const ArdaItemsDataGrid = forwardRef<ArdaItemsDataGridRef, ArdaItemsDataGridProps>(
  function ArdaItemsDataGrid({ items, onItemUpdated, ...otherProps }, ref) {
    return (
      <BaseItemsDataGrid
        ref={ref}
        data={items}
        {...(onItemUpdated !== undefined ? { onEntityUpdated: onItemUpdated } : {})}
        {...otherProps}
      />
    );
  },
);

ArdaItemsDataGrid.displayName = 'ArdaItemsDataGrid';
