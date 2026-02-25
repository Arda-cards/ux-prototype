// MSW handlers for kanban query/detail list endpoints
import { http, HttpResponse } from 'msw';
import { KanbanCardResponse } from '@frontend/types/kanban';
import { cardsStore, buildPaginationResponse, enrichCardWithItemDetails } from './kanban-store';

export const kanbanQueryHandlers = [
  // Query kanban cards by item (with details)
  http.post('/api/arda/kanban/kanban-card/query-details-by-item', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/query-details-by-item');

    const body = await request.json() as { filter?: { eq: string }; paginate?: { index: number; size: number } };
    const itemId = body.filter?.eq;
    const { paginate = { index: 0, size: 20 } } = body;

    let filteredCards = cardsStore;
    if (itemId) {
      filteredCards = cardsStore.filter((c) => c.payload.item.eId === itemId);
    }

    const page = buildPaginationResponse(filteredCards, paginate.index, paginate.size);

    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} cards for item ${itemId || 'all'}`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: response,
    });
  }),

  // Query kanban cards by item (simple)
  http.post('/api/arda/kanban/kanban-card/query-by-item', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/query-by-item');

    const body = await request.json() as { filter?: { eq: string }; paginate?: { index: number; size: number } };
    const itemId = body.filter?.eq;
    const { paginate = { index: 0, size: 20 } } = body;

    let filteredCards = cardsStore;
    if (itemId) {
      filteredCards = cardsStore.filter((c) => c.payload.item.eId === itemId);
    }

    const page = buildPaginationResponse(filteredCards, paginate.index, paginate.size);

    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} cards for query-by-item ${itemId || 'all'}`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: response,
    });
  }),

  // Query kanban card details - requesting (REQUESTING cards)
  http.post('/api/arda/kanban/kanban-card/details/requesting', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/details/requesting');

    // E2E: When __msw_error_orders flag is set, return 500 error
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_error_orders) {
      console.log('[MSW] __msw_error_orders flag set — returning 500 error');
      return HttpResponse.json({ ok: false, status: 500, message: 'Internal Server Error' }, { status: 500 });
    }

    // E2E: When __msw_empty_orders flag is set, return empty results
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_empty_orders) {
      console.log('[MSW] __msw_empty_orders flag set — returning empty results');
      return HttpResponse.json({
        ok: true,
        status: 200,
        data: { thisPage: '0', nextPage: '0', previousPage: '0', results: [] },
      });
    }

    const body = await request.json() as { paginate?: { index: number; size: number } };
    const { paginate = { index: 0, size: 200 } } = body;

    const filteredCards = cardsStore.filter((c) => c.payload.status === 'REQUESTING');

    const page = buildPaginationResponse(filteredCards, paginate.index, paginate.size);

    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} requesting cards`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: response,
    });
  }),

  // Query kanban card details - requested (REQUESTED cards)
  http.post('/api/arda/kanban/kanban-card/details/requested', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/details/requested');

    // E2E: When __msw_error_orders flag is set, return 500 error
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_error_orders) {
      console.log('[MSW] __msw_error_orders flag set — returning 500 error');
      return HttpResponse.json({ ok: false, status: 500, message: 'Internal Server Error' }, { status: 500 });
    }

    // E2E: When __msw_empty_orders flag is set, return empty results
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_empty_orders) {
      console.log('[MSW] __msw_empty_orders flag set — returning empty results');
      return HttpResponse.json({
        ok: true,
        status: 200,
        data: { thisPage: '0', nextPage: '0', previousPage: '0', results: [] },
      });
    }

    const body = await request.json() as { paginate?: { index: number; size: number } };
    const { paginate = { index: 0, size: 200 } } = body;

    const filteredCards = cardsStore.filter((c) => c.payload.status === 'REQUESTED');

    const page = buildPaginationResponse(filteredCards, paginate.index, paginate.size);

    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} requested cards`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: response,
    });
  }),

  // Query kanban card details - in-process (IN_PROCESS cards)
  http.post('/api/arda/kanban/kanban-card/details/in-process', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/details/in-process');

    // E2E: When __msw_error_receiving flag is set, return 500 error
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_error_receiving) {
      console.log('[MSW] __msw_error_receiving flag set — returning 500 error');
      return HttpResponse.json({ ok: false, status: 500, message: 'Internal Server Error' }, { status: 500 });
    }

    // E2E: When __msw_empty_receiving flag is set, return empty results
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_empty_receiving) {
      console.log('[MSW] __msw_empty_receiving flag set — returning empty results');
      return HttpResponse.json({
        ok: true,
        status: 200,
        data: { thisPage: '0', nextPage: '0', previousPage: '0', results: [] },
      });
    }

    const body = await request.json() as { paginate?: { index: number; size: number } };
    const { paginate = { index: 0, size: 200 } } = body;

    const filteredCards = cardsStore.filter((c) => c.payload.status === 'IN_PROCESS');

    const page = buildPaginationResponse(filteredCards, paginate.index, paginate.size);

    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} in-process cards`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: response,
    });
  }),

  // Card query (MOCK-008)
  // TODO: frontend queries both query-details-by-item AND query per item. See https://github.com/Arda-cards/management/issues/760
  http.post('/api/arda/kanban/kanban-card/query', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/query');
    const body = await request.json() as { filter?: unknown; index?: number; size?: number; field?: string; order?: string; itemEId?: string };
    const { index = 0, size = 20, itemEId } = body;

    let filtered = [...cardsStore];
    if (itemEId) {
      filtered = filtered.filter((c) => c.payload.item.eId === itemEId);
    }
    // Sort by asOf.effective descending
    filtered.sort((a, b) => b.asOf.effective - a.asOf.effective);

    const page = buildPaginationResponse(filtered, index, size);
    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} cards for query`);
    return HttpResponse.json({ ok: true, status: 200, data: response });
  }),

  // Query kanban card details - fulfilled (MOCK-012)
  http.post('/api/arda/kanban/kanban-card/details/fulfilled', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/details/fulfilled');

    // E2E: When __msw_error_receiving flag is set, return 500 error
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_error_receiving) {
      console.log('[MSW] __msw_error_receiving flag set — returning 500 error');
      return HttpResponse.json({ ok: false, status: 500, message: 'Internal Server Error' }, { status: 500 });
    }

    // E2E: When __msw_empty_receiving flag is set, return empty results
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__msw_empty_receiving) {
      console.log('[MSW] __msw_empty_receiving flag set — returning empty results');
      return HttpResponse.json({
        ok: true,
        status: 200,
        data: { thisPage: '0', nextPage: '0', previousPage: '0', results: [] },
      });
    }

    const body = await request.json() as { paginate?: { index: number; size: number } };
    const { paginate = { index: 0, size: 200 } } = body;

    const filteredCards = cardsStore
      .filter((c) => c.payload.status === 'FULFILLED')
      .map(enrichCardWithItemDetails);

    const page = buildPaginationResponse(filteredCards, paginate.index, paginate.size);
    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} fulfilled cards`);
    return HttpResponse.json({ ok: true, status: 200, data: response });
  }),

  // Query all kanban cards (MOCK-027)
  http.post('/api/arda/kanban/kanban-card/query-all', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/query-all');
    const body = await request.json() as { paginate?: { index: number; size: number } };
    const { paginate = { index: 0, size: 20 } } = body;

    const page = buildPaginationResponse(cardsStore, paginate.index, paginate.size);
    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} cards for query-all`);
    return HttpResponse.json({ ok: true, status: 200, data: response });
  }),

  // GET query-by-item (MOCK-029)
  http.get('/api/arda/kanban/kanban-card/query-by-item', ({ request }) => {
    console.log('[MSW] GET /api/arda/kanban/kanban-card/query-by-item');
    const url = new URL(request.url);
    const itemEId = url.searchParams.get('itemEId') || '';
    const index = parseInt(url.searchParams.get('index') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '20', 10);

    let filtered = cardsStore;
    if (itemEId) {
      filtered = cardsStore.filter((c) => c.payload.item.eId === itemEId);
    }

    const page = buildPaginationResponse(filtered, index, size);
    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} cards for GET query-by-item`);
    return HttpResponse.json({ ok: true, status: 200, data: response });
  }),

  // Query all kanban card details (MOCK-028) — must come AFTER more-specific details/* routes
  http.post('/api/arda/kanban/kanban-card/details', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/details');
    const body = await request.json() as { paginate?: { index: number; size: number } };
    const { paginate = { index: 0, size: 200 } } = body;

    const enrichedCards = cardsStore.map(enrichCardWithItemDetails);
    const page = buildPaginationResponse(enrichedCards, paginate.index, paginate.size);
    const response: KanbanCardResponse = {
      thisPage: page.thisPage,
      nextPage: page.nextPage,
      previousPage: page.previousPage,
      results: page.results,
    };

    console.log(`[MSW] Returning ${page.results.length} detail cards`);
    return HttpResponse.json({ ok: true, status: 200, data: response });
  }),
];
