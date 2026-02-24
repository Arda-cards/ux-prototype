// Shared kanban store and utilities for kanban handlers
import { mockKanbanCards } from '../data/mockKanbanCards';
import { mockItems } from '../data/mockItems';
import { KanbanCardResult } from '@frontend/types/kanban';

// In-memory store that can be modified during the session
export const cardsStore: KanbanCardResult[] = [...mockKanbanCards];

// Re-export mockItems for use in enrichment
export { mockItems };

/**
 * Build a paginated response with non-null page tokens.
 * When at the first page, previousPage equals the current page index.
 * When at the last page, nextPage equals the current page index.
 */
export function buildPaginationResponse<T>(items: T[], index: number, size: number) {
  const startIndex = index * size;
  const endIndex = startIndex + size;
  const results = items.slice(startIndex, endIndex);
  return {
    thisPage: String(index),
    nextPage: endIndex < items.length ? String(index + 1) : String(index),
    previousPage: index > 0 ? String(index - 1) : String(index),
    results,
  };
}

/**
 * Enrich a card with full item details from the items store.
 * Used by query-details-by-item and details/* handlers.
 */
export function enrichCardWithItemDetails(card: KanbanCardResult): KanbanCardResult {
  const item = mockItems.find((i) => i.payload.eId === card.payload.item.eId);
  if (!item) return card;

  return {
    ...card,
    payload: {
      ...card.payload,
      itemDetails: {
        eId: item.payload.eId,
        name: item.payload.name,
        imageUrl: item.payload.imageUrl || '',
        classification: {
          type: item.payload.classification?.type || '',
          subType: item.payload.classification?.subType || '',
        },
        useCase: item.payload.useCase || '',
        locator: {
          facility: item.payload.locator?.facility || '',
          department: item.payload.locator?.department || '',
          location: item.payload.locator?.location || '',
        },
        internalSKU: item.payload.internalSKU || '',
        generalLedgerCode: item.payload.generalLedgerCode,
        notes: item.payload.notes || '',
        cardNotesDefault: item.payload.cardNotesDefault || '',
        taxable: item.payload.taxable ?? false,
        primarySupply: {
          supplier: item.payload.primarySupply?.supplier || '',
          sku: item.payload.primarySupply?.sku || '',
          orderMethod: item.payload.primarySupply?.orderMethod || '',
          url: item.payload.primarySupply?.url || '',
          orderQuantity: item.payload.primarySupply?.orderQuantity || { amount: 0, unit: '' },
          unitCost: item.payload.primarySupply?.unitCost || { value: 0, currency: '' },
          averageLeadTime: item.payload.primarySupply?.averageLeadTime || { length: 0, unit: '' },
        },
        defaultSupply: item.payload.defaultSupply || 'PRIMARY',
        cardSize: item.payload.cardSize || 'STANDARD',
        labelSize: item.payload.labelSize || 'SMALL',
        breadcrumbSize: item.payload.breadcrumbSize || 'SMALL',
        itemColor: item.payload.itemColor || '#808080',
      },
    },
  };
}
