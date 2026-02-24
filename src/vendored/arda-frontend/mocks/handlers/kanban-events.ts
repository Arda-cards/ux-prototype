// MSW handlers for kanban event endpoints
import { http, HttpResponse } from 'msw';
import { cardsStore } from './kanban-store';

/**
 * Factory for creating card event handlers that transition between states.
 * Validates the card exists and is in the expected fromStatus before transitioning.
 */
function createEventHandler(
  eventName: string,
  fromStatus: string,
  toStatus: string,
  eventType: string
) {
  return http.post(
    `/api/arda/kanban/kanban-card/:eId/event/${eventName}`,
    ({ params }) => {
      const { eId } = params;
      console.log(`[MSW] POST /api/arda/kanban/kanban-card/${eId}/event/${eventName}`);

      const cardIndex = cardsStore.findIndex(
        (c) => c.payload.eId === eId || c.rId === eId
      );

      if (cardIndex === -1) {
        console.log(`[MSW] Kanban card ${eId} not found for ${eventName}`);
        return HttpResponse.json(
          { ok: false, status: 404, error: 'Kanban card not found' },
          { status: 404 }
        );
      }

      if (cardsStore[cardIndex].payload.status !== fromStatus) {
        console.log(`[MSW] Card ${eId} is not in ${fromStatus} state (current: ${cardsStore[cardIndex].payload.status})`);
        return HttpResponse.json(
          {
            ok: false,
            status: 400,
            error: `Card is not in ${fromStatus} state. Current state: ${cardsStore[cardIndex].payload.status}`,
          },
          { status: 400 }
        );
      }

      const now = Date.now();
      const updatedCard = {
        ...cardsStore[cardIndex],
        payload: {
          ...cardsStore[cardIndex].payload,
          status: toStatus,
          lastEvent: {
            when: { effective: now, recorded: now },
            type: eventType,
            author: 'developer@arda.cards',
          },
        },
        asOf: { effective: now, recorded: now },
      };
      cardsStore[cardIndex] = updatedCard;

      console.log(`[MSW] ${eventName}: Card ${eId} transitioned ${fromStatus} -> ${toStatus}`);

      return HttpResponse.json({
        ok: true,
        status: 200,
        data: updatedCard,
      });
    }
  );
}

export const kanbanEventHandlers = [
  // MOCK-009: Request card (AVAILABLE -> REQUESTING)
  createEventHandler('request', 'AVAILABLE', 'REQUESTING', 'REQUEST'),

  // MOCK-010: Accept card (REQUESTING -> REQUESTED)
  createEventHandler('accept', 'REQUESTING', 'REQUESTED', 'ACCEPT'),

  // MOCK-011: Start processing (REQUESTED -> IN_PROCESS)
  createEventHandler('start-processing', 'REQUESTED', 'IN_PROCESS', 'START_PROCESSING'),

  // Fulfill kanban card (existing handler - keeps original behavior of fulfilling from any state)
  http.post('/api/arda/kanban/kanban-card/:cardId/event/fulfill', ({ params }) => {
    const { cardId } = params;
    console.log(`[MSW] POST /api/arda/kanban/kanban-card/${cardId}/event/fulfill`);

    const cardIndex = cardsStore.findIndex((c) => c.payload.eId === cardId || c.rId === cardId);

    if (cardIndex === -1) {
      console.log(`[MSW] Kanban card ${cardId} not found for fulfillment`);
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Kanban card not found' },
        { status: 404 }
      );
    }

    const now = Date.now();
    const updatedCard = {
      ...cardsStore[cardIndex],
      payload: {
        ...cardsStore[cardIndex].payload,
        status: 'FULFILLED',
        lastEvent: {
          when: { effective: now, recorded: now },
          type: 'FULFILLED',
          author: 'developer@arda.cards',
        },
      },
      asOf: { effective: now, recorded: now },
    };
    cardsStore[cardIndex] = updatedCard;

    console.log('[MSW] Fulfilled kanban card:', cardId);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: updatedCard,
    });
  }),
];
