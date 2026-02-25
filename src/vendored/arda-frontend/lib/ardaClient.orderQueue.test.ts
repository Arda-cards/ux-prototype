/**
 * Unit tests for ardaClient.ts order queue operations:
 * - getOrderQueue (exported)
 * - mapOrderMechanismToOrderMethod (internal, tested indirectly)
 * - formatQuantity (internal, tested indirectly)
 */

// --- Mocks ---

jest.mock('./authErrorHandler', () => ({
  handleAuthError: jest.fn(),
}));
jest.mock('./utils', () => ({
  isAuthenticationError: jest.fn().mockReturnValue(false),
}));
jest.mock('./tokenRefresh', () => ({
  ensureValidTokens: jest.fn().mockResolvedValue(true),
}));
jest.mock('./mappers/ardaMappers', () => ({
  mapItemToArdaCreateRequest: jest.fn(),
  mapItemToArdaUpdateRequest: jest.fn(),
  mapArdaItemToItem: jest.fn().mockImplementation((ardaItem) => ({
    entityId: ardaItem.payload?.eId || 'mapped-id',
    name: ardaItem.payload?.name || 'mapped-name',
    primarySupply: ardaItem.payload?.primarySupply
      ? {
          supplier: ardaItem.payload.primarySupply.supplier,
          orderMechanism:
            ardaItem.payload.primarySupply.orderMethod || 'ONLINE',
          orderQuantity: ardaItem.payload.primarySupply.orderQuantity,
        }
      : undefined,
  })),
}));
jest.mock('@/store/store');

import { getOrderQueue } from './ardaClient';
import { __setMockState, __resetMockState } from '@frontend/store/store';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function setValidTokens() {
  const futureExp = Math.floor(Date.now() / 1000) + 3600;
  const payload = btoa(JSON.stringify({ exp: futureExp }));
  const token = `header.${payload}.signature`;
  __setMockState({
    auth: {
      tokens: {
        accessToken: token,
        idToken: token,
        refreshToken: 'refresh-token',
      },
    },
  });
}

function mockQueryItemsResponse(
  items: Array<{
    eId: string;
    name: string;
    supplier?: string;
    orderMechanism?: string;
    orderQuantity?: { amount: number; unit: string };
  }>
) {
  const results = items.map((item) => ({
    rId: `r-${item.eId}`,
    asOf: { effective: 1700000000, recorded: 1700000000 },
    payload: {
      eId: item.eId,
      name: item.name,
      primarySupply: item.supplier
        ? {
            supplier: item.supplier,
            orderMethod: item.orderMechanism || 'ONLINE',
            orderQuantity: item.orderQuantity || {
              amount: 100,
              unit: 'Each',
            },
          }
        : undefined,
    },
    metadata: { tenantId: 't1' },
    author: 'test@test.com',
    retired: false,
  }));

  const responseBody = {
    ok: true,
    data: {
      thisPage: '0',
      nextPage: '',
      previousPage: '',
      results,
    },
  };

  const response = {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: jest.fn().mockResolvedValue(responseBody),
    text: jest.fn().mockResolvedValue(JSON.stringify(responseBody)),
    clone: jest.fn(),
  };
  response.clone.mockReturnValue(response);
  mockFetch.mockResolvedValue(response);
}

// --- Tests ---

describe('getOrderQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMockState();
    setValidTokens();
  });

  afterEach(() => {
    __resetMockState();
  });

  it('each order mechanism maps to correct display string', async () => {
    const mechanisms: Array<{ code: string; display: string }> = [
      { code: 'ONLINE', display: 'Online' },
      { code: 'PURCHASE_ORDER', display: 'Purchase order' },
      { code: 'PHONE', display: 'Phone' },
      { code: 'EMAIL', display: 'Email' },
      { code: 'IN_STORE', display: 'In store' },
      { code: 'RFQ', display: 'Request for quotation (RFQ)' },
      { code: 'PRODUCTION', display: 'Production' },
      { code: 'THIRD_PARTY', display: '3rd party' },
    ];

    mockQueryItemsResponse(
      mechanisms.map((m, i) => ({
        eId: `item-${i}`,
        name: `Item ${i}`,
        supplier: `Supplier-${m.code}`,
        orderMechanism: m.code,
      }))
    );

    const result = await getOrderQueue();
    expect(result.groups).toHaveLength(mechanisms.length);

    for (const m of mechanisms) {
      const group = result.groups.find((g) => g.name === `Supplier-${m.code}`);
      expect(group).toBeDefined();
      expect(group!.orderMethod).toBe(m.display);
    }
  });

  it('unknown mechanism defaults to "Online"', async () => {
    mockQueryItemsResponse([
      {
        eId: 'item-unknown',
        name: 'Unknown Item',
        supplier: 'SupplierX',
        orderMechanism: 'UNKNOWN',
      },
    ]);

    const result = await getOrderQueue();
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].orderMethod).toBe('Online');
  });

  it('formatQuantity returns "1 each" when quantity undefined', async () => {
    mockQueryItemsResponse([
      {
        eId: 'item-noqty',
        name: 'No Qty Item',
        supplier: 'SupplierA',
        orderMechanism: 'ONLINE',
        // no orderQuantity - but our helper defaults it; override the mock
      },
    ]);

    // Override mapArdaItemToItem to return item without orderQuantity
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mapArdaItemToItem } = require('./mappers/ardaMappers');
    (mapArdaItemToItem as jest.Mock).mockImplementationOnce((ardaItem: Record<string, unknown>) => {
      const p = ardaItem.payload as Record<string, unknown> | undefined;
      const ps = p?.primarySupply as Record<string, unknown> | undefined;
      return {
        entityId: (p?.eId as string) || 'mapped-id',
        name: (p?.name as string) || 'mapped-name',
        primarySupply: ps
          ? {
              supplier: ps.supplier,
              orderMechanism: ps.orderMethod || 'ONLINE',
              orderQuantity: undefined, // no quantity
            }
          : undefined,
      };
    });

    const result = await getOrderQueue();
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].items[0].quantity).toBe('1 each');
  });

  it('formatQuantity returns "<amount> <unit>" when quantity defined', async () => {
    mockQueryItemsResponse([
      {
        eId: 'item-qty',
        name: 'Qty Item',
        supplier: 'SupplierB',
        orderMechanism: 'ONLINE',
        orderQuantity: { amount: 50, unit: 'Box' },
      },
    ]);

    const result = await getOrderQueue();
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].items[0].quantity).toBe('50 Box');
  });

  it('queries items and groups by supplier name', async () => {
    mockQueryItemsResponse([
      {
        eId: 'item-1',
        name: 'Item A',
        supplier: 'MedSupply',
        orderMechanism: 'ONLINE',
      },
      {
        eId: 'item-2',
        name: 'Item B',
        supplier: 'MedSupply',
        orderMechanism: 'ONLINE',
      },
      {
        eId: 'item-3',
        name: 'Item C',
        supplier: 'OtherSupplier',
        orderMechanism: 'PHONE',
      },
    ]);

    const result = await getOrderQueue();
    expect(result.groups).toHaveLength(2);

    const medGroup = result.groups.find((g) => g.name === 'MedSupply');
    const otherGroup = result.groups.find((g) => g.name === 'OtherSupplier');
    expect(medGroup!.items).toHaveLength(2);
    expect(otherGroup!.items).toHaveLength(1);
  });

  it('uses "Unknown Supplier" when supplier missing', async () => {
    mockQueryItemsResponse([
      {
        eId: 'item-nosupplier',
        name: 'No Supplier Item',
        // no supplier -> primarySupply will be undefined
      },
    ]);

    const result = await getOrderQueue();
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].name).toBe('Unknown Supplier');
  });

  it('maps order mechanism to display string', async () => {
    mockQueryItemsResponse([
      {
        eId: 'item-po',
        name: 'PO Item',
        supplier: 'POSupplier',
        orderMechanism: 'PURCHASE_ORDER',
      },
    ]);

    const result = await getOrderQueue();
    expect(result.groups[0].orderMethod).toBe('Purchase order');
    expect(result.groups[0].items[0].orderMethod).toBe('Purchase order');
  });

  it('sets all items with status "Ready to order" and expanded true', async () => {
    mockQueryItemsResponse([
      {
        eId: 'item-s1',
        name: 'Status Item 1',
        supplier: 'S1',
        orderMechanism: 'ONLINE',
      },
      {
        eId: 'item-s2',
        name: 'Status Item 2',
        supplier: 'S2',
        orderMechanism: 'EMAIL',
      },
    ]);

    const result = await getOrderQueue();

    for (const group of result.groups) {
      expect(group.expanded).toBe(true);
      for (const item of group.items) {
        expect(item.status).toBe('Ready to order');
      }
    }
  });

  it('throws "Failed to fetch order queue data" when queryItems fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(getOrderQueue()).rejects.toThrow(
      'Failed to fetch order queue data'
    );
  });
});
