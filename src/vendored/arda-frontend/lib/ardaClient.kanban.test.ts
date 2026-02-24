/**
 * Unit tests for ardaClient.ts kanban operations:
 * - createKanbanCard
 * - getKanbanCard
 * - queryKanbanCardDetailsByItem
 */

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
  mapArdaItemToItem: jest.fn(),
}));
jest.mock('@/store/store');

import { handleAuthError } from './authErrorHandler';
import { isAuthenticationError } from './utils';
import {
  createKanbanCard,
  getKanbanCard,
  queryKanbanCardDetailsByItem,
} from './ardaClient';
import { __setMockState, __resetMockState } from '@frontend/store/store';

// --- Mock fetch ---

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

function mockFetchResponse(data: unknown, ok = true, status = 200) {
  const response = {
    ok,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    clone: jest.fn(),
  };
  response.clone.mockReturnValue(response);
  mockFetch.mockResolvedValue(response);
  return response;
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
  __resetMockState();
});

afterEach(() => {
  __resetMockState();
});

describe('createKanbanCard', () => {
  it('sends POST to /api/arda/kanban/kanban-card', async () => {
    setValidTokens();
    const responseData = {
      ok: true,
      data: { rId: 'card-1', asOf: { effective: 1, recorded: 1 } },
    };
    mockFetchResponse(responseData);

    const request = {
      item: { eId: 'item-123' },
      quantity: { amount: 5, unit: 'each' },
    };
    await createKanbanCard(request);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/arda/kanban/kanban-card');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(request);
  });

  it('returns kanban card response', async () => {
    setValidTokens();
    const cardData = {
      rId: 'card-1',
      asOf: { effective: 100, recorded: 200 },
      payload: { eId: 'e1' },
    };
    mockFetchResponse({ ok: true, data: cardData });

    const result = await createKanbanCard({
      item: { eId: 'item-123' },
      quantity: { amount: 1, unit: 'each' },
    });

    expect(result).toEqual(cardData);
  });
});

describe('getKanbanCard', () => {
  it('sends GET to /api/arda/kanban/kanban-card/<cardId>', async () => {
    setValidTokens();
    mockFetchResponse({ ok: true, data: { rId: 'card-42' } });

    await getKanbanCard('card-42');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/arda/kanban/kanban-card/card-42');
    expect(options.method).toBe('GET');
  });

  it('returns first record from data.records', async () => {
    setValidTokens();
    mockFetchResponse({
      ok: true,
      data: {
        records: [{ rId: 'first' }, { rId: 'second' }],
      },
    });

    const result = await getKanbanCard('card-1');
    expect(result).toEqual({ rId: 'first' });
  });

  it('returns result.data directly when no records array', async () => {
    setValidTokens();
    const directData = { rId: 'direct', payload: { eId: 'e1' } };
    mockFetchResponse({ ok: true, data: directData });

    const result = await getKanbanCard('card-1');
    expect(result).toEqual(directData);
  });

  it('throws on non-OK response with auth error handling', async () => {
    setValidTokens();
    (isAuthenticationError as jest.Mock).mockReturnValueOnce(true);
    mockFetchResponse(
      { ok: false, error: 'Unauthorized' },
      false,
      401
    );

    await expect(getKanbanCard('card-1')).rejects.toThrow('Unauthorized');
    expect(handleAuthError).toHaveBeenCalled();
  });

  it('throws on !result.ok even if HTTP 200', async () => {
    setValidTokens();
    mockFetchResponse({ ok: false, error: 'Not found' }, true, 200);

    await expect(getKanbanCard('card-1')).rejects.toThrow('Not found');
  });
});

describe('queryKanbanCardDetailsByItem', () => {
  it('sends POST to correct URL', async () => {
    setValidTokens();
    mockFetchResponse({
      ok: true,
      data: { thisPage: '0', nextPage: '', previousPage: '', results: [] },
    });

    const request = {
      filter: { eq: 'item-1', locator: 'ITEM_REFERENCE_entity_id' },
      paginate: { index: 0, size: 10 },
    };
    await queryKanbanCardDetailsByItem(request);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/arda/kanban/kanban-card/query-details-by-item');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(request);
  });

  it('returns result.data on success', async () => {
    setValidTokens();
    const data = {
      thisPage: '0',
      nextPage: '1',
      previousPage: '',
      results: [],
    };
    mockFetchResponse({ ok: true, data });

    const result = await queryKanbanCardDetailsByItem({
      filter: { eq: 'item-1', locator: 'ITEM_REFERENCE_entity_id' },
      paginate: { index: 0, size: 10 },
    });

    expect(result).toEqual(data);
  });

  it('throws on auth error', async () => {
    setValidTokens();
    (isAuthenticationError as jest.Mock).mockReturnValueOnce(true);
    mockFetchResponse(
      { ok: false, error: 'Auth failed' },
      false,
      401
    );

    await expect(
      queryKanbanCardDetailsByItem({
        filter: { eq: 'item-1', locator: 'ITEM_REFERENCE_entity_id' },
        paginate: { index: 0, size: 10 },
      })
    ).rejects.toThrow('Auth failed');
    expect(handleAuthError).toHaveBeenCalled();
  });
});
