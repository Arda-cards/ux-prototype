// MSW handlers for items API endpoints
import { http, HttpResponse } from 'msw';
import { mockItems, generateMockItem } from '../data/mockItems';
import { ArdaItem, ArdaQueryResponse } from '@frontend/types/arda-api';

// In-memory store that can be modified during the session
const itemsStore = [...mockItems];

export const itemHandlers = [
  // Query items with pagination
  http.post('/api/arda/items/query', async ({ request }) => {
    console.log('[MSW] POST /api/arda/items/query');

    // E2E: When __msw_empty_items flag is set on window, return empty results
    // This supports the dedicated-mock strategy for empty state testing
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_empty_items) {
      console.log('[MSW] __msw_empty_items flag set — returning empty results');
      return HttpResponse.json({
        ok: true,
        status: 200,
        data: {
          thisPage: '0',
          nextPage: '0',
          previousPage: '0',
          results: [],
        },
      });
    }

    const body = await request.json() as { paginate?: { index: number; size: number } };
    const { paginate = { index: 0, size: 20 } } = body;

    const startIndex = paginate.index * paginate.size;
    const endIndex = startIndex + paginate.size;
    const paginatedItems = itemsStore.slice(startIndex, endIndex);

    const response: ArdaQueryResponse<ArdaItem['payload']> = {
      thisPage: String(paginate.index),
      nextPage: endIndex < itemsStore.length ? String(paginate.index + 1) : String(paginate.index),
      previousPage: paginate.index > 0 ? String(paginate.index - 1) : String(paginate.index),
      results: paginatedItems,
    };

    console.log(`[MSW] Returning ${paginatedItems.length} items (page ${paginate.index})`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: response,
    });
  }),

  // Create new item
  http.post('/api/arda/items', async ({ request }) => {
    console.log('[MSW] POST /api/arda/items - Create item');

    const body = await request.json() as Partial<ArdaItem['payload']>;
    const newItem = generateMockItem();

    // Merge the request body with the generated item
    newItem.payload = { ...newItem.payload, ...body };
    itemsStore.unshift(newItem);

    console.log('[MSW] Created item:', newItem.payload.eId);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: newItem,
    });
  }),

  // Get single item by entity ID
  http.get('/api/arda/items/:entityId', ({ params }) => {
    const { entityId } = params;
    console.log(`[MSW] GET /api/arda/items/${entityId}`);

    const item = itemsStore.find((i) => i.payload.eId === entityId);

    if (!item) {
      console.log(`[MSW] Item ${entityId} not found`);
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Item not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: item,
    });
  }),

  // Update item
  http.put('/api/arda/items/:entityId', async ({ params, request }) => {
    const { entityId } = params;
    console.log(`[MSW] PUT /api/arda/items/${entityId}`);

    const body = await request.json() as Partial<ArdaItem['payload']>;
    const itemIndex = itemsStore.findIndex((i) => i.payload.eId === entityId);

    if (itemIndex === -1) {
      console.log(`[MSW] Item ${entityId} not found for update`);
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Update the item
    const updatedItem = {
      ...itemsStore[itemIndex],
      payload: { ...itemsStore[itemIndex].payload, ...body },
      asOf: {
        effective: Date.now(),
        recorded: Date.now(),
      },
    };
    itemsStore[itemIndex] = updatedItem;

    console.log('[MSW] Updated item:', entityId);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: updatedItem,
    });
  }),

  // Delete item
  http.delete('/api/arda/items/:entityId', ({ params }) => {
    const { entityId } = params;
    console.log(`[MSW] DELETE /api/arda/items/${entityId}`);

    const itemIndex = itemsStore.findIndex((i) => i.payload.eId === entityId);

    if (itemIndex === -1) {
      console.log(`[MSW] Item ${entityId} not found for deletion`);
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Mark as retired instead of deleting
    itemsStore[itemIndex] = { ...itemsStore[itemIndex], retired: true };

    console.log('[MSW] Deleted (retired) item:', entityId);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: { message: 'Item deleted successfully' },
    });
  }),

  // Get draft of item
  http.get('/api/arda/items/:entityId/draft', ({ params }) => {
    const { entityId } = params;
    console.log(`[MSW] GET /api/arda/items/${entityId}/draft`);

    const item = itemsStore.find((i) => i.payload.eId === entityId);

    if (!item) {
      // If item doesn't exist, create a new draft
      const newDraft = generateMockItem();
      console.log('[MSW] Created new draft for non-existent item');
      return HttpResponse.json({
        ok: true,
        status: 200,
        data: {
          author: 'developer@arda.cards',
          entityId: entityId,
          metadata: { tenantId: newDraft.metadata.tenantId },
          tenantId: newDraft.metadata.tenantId,
          value: newDraft.payload,
        },
      });
    }

    // Return as draft format
    return HttpResponse.json({
      ok: true,
      status: 200,
      data: {
        author: item.author,
        entityId: item.payload.eId,
        metadata: item.metadata,
        tenantId: item.metadata.tenantId,
        value: item.payload,
      },
    });
  }),

  // Print label (MOCK-022)
  http.post('/api/arda/item/item/print-label', async ({ request }) => {
    console.log('[MSW] POST /api/arda/item/item/print-label');

    const body = await request.json() as { ids?: string[] };
    const { ids = [] } = body;

    if (ids.length === 0) {
      return HttpResponse.json(
        { ok: false, status: 400, error: 'No item IDs provided' },
        { status: 400 }
      );
    }

    console.log(`[MSW] Printing labels for ${ids.length} items`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: {
        url: `https://mock-documint.local/documents/mock-label-${crypto.randomUUID()}.pdf`,
        job: crypto.randomUUID(),
        asOF: { effective: Date.now(), recorded: Date.now() },
        templateId: 'mock-label-template-001',
      },
    });
  }),

  // Print breadcrumb (MOCK-023)
  http.post('/api/arda/item/item/print-breadcrumb', async ({ request }) => {
    console.log('[MSW] POST /api/arda/item/item/print-breadcrumb');

    const body = await request.json() as { ids?: string[] };
    const { ids = [] } = body;

    if (ids.length === 0) {
      return HttpResponse.json(
        { ok: false, status: 400, error: 'No item IDs provided' },
        { status: 400 }
      );
    }

    console.log(`[MSW] Printing breadcrumbs for ${ids.length} items`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: {
        url: `https://mock-documint.local/documents/mock-breadcrumb-${crypto.randomUUID()}.pdf`,
        job: crypto.randomUUID(),
        asOF: { effective: Date.now(), recorded: Date.now() },
        templateId: 'mock-breadcrumb-template-001',
      },
    });
  }),
];
