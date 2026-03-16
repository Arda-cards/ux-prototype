/**
 * MSW handlers for business-affiliate API endpoints.
 *
 * Append-only pattern: each story adds only the handlers it needs.
 * This story provides:
 *   POST /api/arda/business-affiliate/query  — with filter.name, sort, pagination
 *   GET  /api/arda/business-affiliate/:entityId  — with UUID validation
 *
 * Candidate 2 (BR::0002::0002) adds:
 *   GET  /api/arda/business-affiliate/lookup  — name lookup with role filter
 *   POST /api/arda/business-affiliate          — create with silent VENDOR assignment
 *
 * Candidate 3 (BA::0005::0001) adds:
 *   DELETE /api/arda/business-affiliate/:entityId — delete with 200ms latency
 *
 * BA::0004::0001 (Edit Happy Path) adds:
 *   PUT  /api/arda/business-affiliate/:entityId — update with 300ms latency, deep-merge
 */
import { http, HttpResponse, passthrough } from 'msw';
import type { ArdaQueryResponse, ArdaResult } from '@frontend/types/arda-api';
import type { BusinessAffiliateWithRoles } from './types';
import { mockBusinessAffiliates, wrapAsResult } from './mock-data';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// In-memory store for the session — mutable so later stories can add/remove entries
export const affiliateStore: ArdaResult<BusinessAffiliateWithRoles>[] = [...mockBusinessAffiliates];

/** Reset store to initial state (used between stories). */
export function resetAffiliateStore(): void {
  affiliateStore.length = 0;
  affiliateStore.push(...mockBusinessAffiliates);
}

export const businessAffiliateHandlers = [
  // Query business affiliates with pagination, filter.name, and sort
  http.post('/api/arda/business-affiliate/query', async ({ request }) => {
    console.log('[MSW] POST /api/arda/business-affiliate/query');

    const body = (await request.json()) as {
      paginate?: { index: number; size: number };
      filter?: { role?: string; name?: string };
      sort?: { field: string; direction: 'asc' | 'desc' };
    };
    const { paginate = { index: 0, size: 10 }, filter, sort } = body;

    // Apply filters
    let filtered = [...affiliateStore];
    if (filter?.role) {
      filtered = filtered.filter((r) =>
        r.payload.roles.includes(filter.role as BusinessAffiliateWithRoles['roles'][number]),
      );
    }
    if (filter?.name) {
      const term = filter.name.toLowerCase();
      filtered = filtered.filter((r) => r.payload.name.toLowerCase().includes(term));
    }

    // Sort (default: name asc)
    const sortField = sort?.field ?? 'name';
    const sortDir = sort?.direction ?? 'asc';
    filtered.sort((a, b) => {
      const aVal = String((a.payload as Record<string, unknown>)[sortField] ?? '');
      const bVal = String((b.payload as Record<string, unknown>)[sortField] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    // Paginate
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
      `[MSW] Returning ${page.length} of ${filtered.length} business affiliates (page ${paginate.index})`,
    );

    return HttpResponse.json({ ok: true, status: 200, data: response });
  }),

  // Lookup business affiliates by name (with optional role filter)
  // IMPORTANT: Must be registered BEFORE the /:entityId handler — MSW uses
  // first-match-wins and passthrough() sends to the real server, not the next handler.
  http.get('/api/arda/business-affiliate/lookup', async ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') ?? '';
    const role = url.searchParams.get('role');
    const limit = Number(url.searchParams.get('limit') ?? '10');

    console.log(`[MSW] GET /api/arda/business-affiliate/lookup?name=${name}&role=${role ?? ''}`);

    // Simulate 150ms latency (validates debounce behavior in play functions)
    await new Promise((resolve) => setTimeout(resolve, 150));

    let filtered = [...affiliateStore];

    // Case-insensitive name filter
    if (name) {
      const term = name.toLowerCase();
      filtered = filtered.filter((r) => r.payload.name.toLowerCase().includes(term));
    }

    // Optional role filter
    if (role) {
      filtered = filtered.filter((r) =>
        r.payload.roles.includes(role as BusinessAffiliateWithRoles['roles'][number]),
      );
    }

    // Map to lookup shape and limit results
    const data = filtered.slice(0, limit).map((r) => ({
      eId: r.payload.eId,
      name: r.payload.name,
      roles: r.payload.roles,
    }));

    return HttpResponse.json({ ok: true, status: 200, data });
  }),

  // Get single business affiliate by entity ID
  // UUID validation prevents collision with named routes like /lookup
  http.get('/api/arda/business-affiliate/:entityId', ({ params }) => {
    const { entityId } = params;

    // Non-UUID values (e.g., "lookup") pass through to other handlers
    if (typeof entityId !== 'string' || !UUID_REGEX.test(entityId)) {
      return passthrough();
    }

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

  // Create a new business affiliate
  // Accepts full SupplierFormData shape (contact, address, legal, notes) so the
  // new affiliate appears in the grid with accurate data after creation.
  // Backward-compatible: callers that POST only { name } still work.
  http.post('/api/arda/business-affiliate', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      contact?: {
        salutation?: string;
        firstName?: string;
        lastName?: string;
        jobTitle?: string;
        email?: string;
        phone?: string;
      };
      address?: {
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
      legal?: {
        name?: string;
        taxId?: string;
        registrationId?: string;
        naicsCode?: string;
      };
      notes?: string;
    };

    console.log(`[MSW] POST /api/arda/business-affiliate — name: ${body.name ?? '(empty)'}`);

    // Simulate 300ms latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!body.name?.trim()) {
      return HttpResponse.json(
        { ok: false, status: 400, error: 'Name is required' },
        { status: 400 },
      );
    }

    // Generate new UUID
    const eId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    // Build contact.name from name parts if provided
    const contactName = body.contact
      ? [body.contact.salutation, body.contact.firstName, body.contact.lastName]
          .filter(Boolean)
          .join(' ') ||
        body.contact.firstName ||
        ''
      : undefined;

    // Create affiliate with silent VENDOR role assignment (per SD-3)
    const newAffiliate = wrapAsResult({
      eId,
      name: body.name.trim(),
      roles: ['VENDOR'],
      ...(body.contact && {
        contact: {
          name: contactName ?? '',
          salutation: body.contact.salutation,
          firstName: body.contact.firstName,
          lastName: body.contact.lastName,
          jobTitle: body.contact.jobTitle,
          email: body.contact.email,
          phone: body.contact.phone,
        },
      }),
      ...(body.address && {
        mainAddress: {
          addressLine1: body.address.addressLine1 ?? '',
          ...(body.address.addressLine2 && { addressLine2: body.address.addressLine2 }),
          city: body.address.city ?? '',
          state: body.address.state ?? '',
          postalCode: body.address.postalCode ?? '',
          ...(body.address.country && {
            country: { symbol: body.address.country, name: body.address.country },
          }),
        },
      }),
      ...(body.legal && {
        legal: {
          name: body.legal.name ?? '',
          ...(body.legal.taxId && { taxId: body.legal.taxId }),
          ...(body.legal.registrationId && { registrationId: body.legal.registrationId }),
          ...(body.legal.naicsCode && { naicsCode: body.legal.naicsCode }),
        },
      }),
      ...(body.notes && { notes: body.notes }),
    });

    affiliateStore.push(newAffiliate);

    return HttpResponse.json({ ok: true, status: 200, data: newAffiliate });
  }),

  // Delete a business affiliate by entity ID
  http.delete('/api/arda/business-affiliate/:entityId', async ({ params }) => {
    const { entityId } = params;

    // Non-UUID values pass through
    if (typeof entityId !== 'string' || !UUID_REGEX.test(entityId)) {
      return passthrough();
    }

    console.log(`[MSW] DELETE /api/arda/business-affiliate/${entityId}`);

    // Simulate 200ms latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = affiliateStore.findIndex((r) => r.payload.eId === entityId);

    if (index === -1) {
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Business affiliate not found' },
        { status: 404 },
      );
    }

    affiliateStore.splice(index, 1);
    return HttpResponse.json({ ok: true, status: 200 });
  }),

  // Update a business affiliate by entity ID
  http.put('/api/arda/business-affiliate/:entityId', async ({ params, request }) => {
    const { entityId } = params;

    // Non-UUID values pass through
    if (typeof entityId !== 'string' || !UUID_REGEX.test(entityId)) {
      return passthrough();
    }

    console.log(`[MSW] PUT /api/arda/business-affiliate/${entityId}`);

    // Simulate 300ms latency (validates loading state on Save button)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const body = (await request.json()) as Partial<BusinessAffiliateWithRoles>;

    const index = affiliateStore.findIndex((r) => r.payload.eId === entityId);

    if (index === -1) {
      return HttpResponse.json(
        { ok: false, status: 404, error: 'Business affiliate not found' },
        { status: 404 },
      );
    }

    // Merge updated fields into existing payload
    const existing = affiliateStore[index];
    const updatedPayload: BusinessAffiliateWithRoles = {
      ...existing.payload,
      ...body,
      // Deep-merge contact if provided
      contact: body.contact
        ? { ...existing.payload.contact, ...body.contact }
        : existing.payload.contact,
      // Deep-merge mainAddress if provided
      mainAddress: body.mainAddress
        ? { ...existing.payload.mainAddress, ...body.mainAddress }
        : existing.payload.mainAddress,
    };

    const updatedRecord = {
      ...existing,
      payload: updatedPayload,
    };

    affiliateStore[index] = updatedRecord;

    return HttpResponse.json({ ok: true, status: 200, data: updatedRecord });
  }),
];
