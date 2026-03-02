/**
 * MSW handlers for business-affiliate API endpoints.
 *
 * Follows the same query pattern as the items handlers:
 *   POST /api/arda/business-affiliate/query  →  ArdaQueryResponse<BusinessAffiliateWithRoles>
 *   GET  /api/arda/business-affiliate/:entityId  →  single record
 */
import { http, HttpResponse } from 'msw';
import type { ArdaQueryResponse, ArdaResult } from '@frontend/types/arda-api';
import type { BusinessAffiliateWithRoles } from './types';
import { mockBusinessAffiliates } from './mock-data';

// In-memory store for the session
const affiliateStore = [...mockBusinessAffiliates];

export const businessAffiliateHandlers = [
  // Query business affiliates with pagination
  http.post('/api/arda/business-affiliate/query', async ({ request }) => {
    console.log('[MSW] POST /api/arda/business-affiliate/query');

    const body = (await request.json()) as {
      paginate?: { index: number; size: number };
      filter?: { role?: string };
    };
    const { paginate = { index: 0, size: 20 }, filter } = body;

    // Optional role filter (e.g. { role: "VENDOR" })
    let filtered = affiliateStore;
    if (filter?.role) {
      filtered = affiliateStore.filter((r) =>
        r.payload.roles.includes(filter.role as BusinessAffiliateWithRoles['roles'][number]),
      );
    }

    const startIndex = paginate.index * paginate.size;
    const endIndex = startIndex + paginate.size;
    const page = filtered.slice(startIndex, endIndex);

    const response: ArdaQueryResponse<BusinessAffiliateWithRoles> = {
      thisPage: String(paginate.index),
      nextPage: endIndex < filtered.length ? String(paginate.index + 1) : String(paginate.index),
      previousPage: paginate.index > 0 ? String(paginate.index - 1) : String(paginate.index),
      results: page as ArdaResult<BusinessAffiliateWithRoles>[],
    };

    console.log(
      `[MSW] Returning ${page.length} business affiliates (page ${paginate.index})`,
    );

    return HttpResponse.json({ ok: true, status: 200, data: response });
  }),

  // Get single business affiliate by entity ID
  http.get('/api/arda/business-affiliate/:entityId', ({ params }) => {
    const { entityId } = params;
    console.log(`[MSW] GET /api/arda/business-affiliate/${entityId}`);

    const record = affiliateStore.find((r) => r.payload.eId === entityId);

    if (!record) {
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Business affiliate not found' },
        { status: 404 },
      );
    }

    return HttpResponse.json({ ok: true, status: 200, data: record });
  }),
];
