// MSW handlers for kanban card CRUD and print operations
import { http, HttpResponse } from 'msw';
import { generateMockKanbanCard } from '../data/mockKanbanCards';
import { KanbanCardResult } from '@frontend/types/kanban';
import { cardsStore } from './kanban-store';

// Notes storage (MOCK-025)
const notesStore = new Map<string, string>();

// Initialize notes for first 5 cards
cardsStore.slice(0, 5).forEach((card, i) => {
  notesStore.set(card.payload.eId, `Sample notes for card ${i + 1}. This card is in ${card.payload.status} state.`);
});

export const kanbanMutationHandlers = [
  // Create kanban card
  http.post('/api/arda/kanban/kanban-card', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card - Create card');

    const body = await request.json() as { item: { eId: string }; quantity: { amount: number; unit: string } };
    const newCard = generateMockKanbanCard();

    // Update the card with request data
    newCard.payload.item.eId = body.item.eId;
    newCard.payload.cardQuantity = body.quantity;
    cardsStore.unshift(newCard);

    console.log('[MSW] Created kanban card:', newCard.payload.eId);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: newCard,
    });
  }),

  // Get single kanban card
  http.get('/api/arda/kanban/kanban-card/:cardId', ({ params }) => {
    const { cardId } = params;
    console.log(`[MSW] GET /api/arda/kanban/kanban-card/${cardId}`);

    const card = cardsStore.find((c) => c.payload.eId === cardId || c.rId === cardId);

    if (!card) {
      console.log(`[MSW] Kanban card ${cardId} not found`);
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Kanban card not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: card,
    });
  }),

  // Update kanban card
  http.put('/api/arda/kanban/kanban-card/:cardId', async ({ params, request }) => {
    const { cardId } = params;
    console.log(`[MSW] PUT /api/arda/kanban/kanban-card/${cardId}`);

    const body = await request.json() as Partial<KanbanCardResult['payload']>;
    const cardIndex = cardsStore.findIndex((c) => c.payload.eId === cardId || c.rId === cardId);

    if (cardIndex === -1) {
      console.log(`[MSW] Kanban card ${cardId} not found for update`);
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Kanban card not found' },
        { status: 404 }
      );
    }

    const updatedCard = {
      ...cardsStore[cardIndex],
      payload: { ...cardsStore[cardIndex].payload, ...body },
      asOf: {
        effective: Date.now(),
        recorded: Date.now(),
      },
    };
    cardsStore[cardIndex] = updatedCard;

    console.log('[MSW] Updated kanban card:', cardId);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: updatedCard,
    });
  }),

  // Print card operation (MOCK-007)
  http.post('/api/arda/kanban/kanban-card/print-card', async ({ request }) => {
    console.log('[MSW] POST /api/arda/kanban/kanban-card/print-card');

    const body = await request.json() as { ids?: string[] };
    const { ids: cardIds = [] } = body;

    // Validate: empty ids array
    if (cardIds.length === 0) {
      return HttpResponse.json(
        { ok: false, status: 400, error: 'No card IDs provided' },
        { status: 400 }
      );
    }

    // Mark cards as printed in-store (existing mutation behavior)
    const updatedCards: KanbanCardResult[] = [];
    for (const cardId of cardIds) {
      const cardIndex = cardsStore.findIndex((c) => c.payload.eId === cardId || c.rId === cardId);
      if (cardIndex !== -1) {
        cardsStore[cardIndex] = {
          ...cardsStore[cardIndex],
          payload: {
            ...cardsStore[cardIndex].payload,
            printStatus: 'PRINTED',
          },
        };
        updatedCards.push(cardsStore[cardIndex]);
      }
    }

    // No cards found for the given IDs
    if (updatedCards.length === 0) {
      return HttpResponse.json(
        { ok: false, status: 404, error: 'No cards found for the provided IDs' },
        { status: 404 }
      );
    }

    console.log(`[MSW] Printed ${updatedCards.length} cards`);

    // Return print-job response with data.url (MOCK-007)
    return HttpResponse.json({
      ok: true,
      status: 200,
      data: {
        url: `https://mock-documint.local/documents/mock-pdf-${crypto.randomUUID()}.pdf`,
        job: crypto.randomUUID(),
        asOF: { effective: Date.now(), recorded: Date.now() },
        templateId: 'mock-template-001',
      },
    });
  }),

  // Card history (MOCK-024)
  http.get('/api/arda/kanban/kanban-card/:eId/history', ({ params }) => {
    const { eId } = params;
    console.log(`[MSW] GET /api/arda/kanban/kanban-card/${eId}/history`);

    const card = cardsStore.find((c) => c.payload.eId === eId || c.rId === eId);

    if (!card) {
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Kanban card not found' },
        { status: 404 }
      );
    }

    // Generate history based on card's current status
    const statusHistory: Record<string, string[]> = {
      AVAILABLE: ['CREATE'],
      REQUESTING: ['CREATE', 'REQUEST'],
      REQUESTED: ['CREATE', 'REQUEST', 'ACCEPT'],
      IN_PROCESS: ['CREATE', 'REQUEST', 'ACCEPT', 'START_PROCESSING'],
      FULFILLED: ['CREATE', 'REQUEST', 'ACCEPT', 'START_PROCESSING', 'COMPLETE_PROCESSING', 'FULFILL', 'RECEIVE'],
    };

    const events = statusHistory[card.payload.status] || ['CREATE'];
    const baseTime = card.asOf.effective - events.length * 50000;

    const history = events.map((eventType, index) => ({
      type: eventType,
      when: {
        effective: baseTime + index * 50000,
        recorded: baseTime + index * 50000,
      },
      author: 'developer@arda.cards',
    }));

    console.log(`[MSW] Returning ${history.length} history events for card ${eId}`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: history,
    });
  }),

  // Card notes GET (MOCK-025)
  http.get('/api/arda/kanban/kanban-card/:eId/notes', ({ params }) => {
    const { eId } = params;
    console.log(`[MSW] GET /api/arda/kanban/kanban-card/${eId}/notes`);

    const card = cardsStore.find((c) => c.payload.eId === eId || c.rId === eId);

    if (!card) {
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Kanban card not found' },
        { status: 404 }
      );
    }

    const notes = notesStore.get(card.payload.eId) || '';

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: { notes, updatedAt: card.asOf.effective },
    });
  }),

  // Card notes PUT (MOCK-025)
  http.put('/api/arda/kanban/kanban-card/:eId/notes', async ({ params, request }) => {
    const { eId } = params;
    console.log(`[MSW] PUT /api/arda/kanban/kanban-card/${eId}/notes`);

    const card = cardsStore.find((c) => c.payload.eId === eId || c.rId === eId);

    if (!card) {
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Kanban card not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as { notes: string };
    notesStore.set(card.payload.eId, body.notes);

    const now = Date.now();
    console.log(`[MSW] Updated notes for card ${eId}`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: { notes: body.notes, updatedAt: now },
    });
  }),
];
