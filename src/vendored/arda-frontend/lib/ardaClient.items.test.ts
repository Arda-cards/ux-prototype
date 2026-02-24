/**
 * Unit tests for ardaClient.ts — item-related operations
 */

// Mock dependencies before imports
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
  mapItemToArdaCreateRequest: jest.fn().mockReturnValue({ name: 'mapped-create' }),
  mapItemToArdaUpdateRequest: jest.fn().mockReturnValue({ name: 'mapped-update' }),
  mapArdaItemToItem: jest.fn().mockImplementation((ardaItem) => ({
    entityId: ardaItem.payload?.eId || ardaItem.eId || 'mapped-id',
    name: ardaItem.payload?.name || ardaItem.name || 'mapped-name',
  })),
}));
jest.mock('@/store/store');

import { handleAuthError } from './authErrorHandler';
import { isAuthenticationError } from './utils';
import { ensureValidTokens } from './tokenRefresh';
import {
  mapArdaItemToItem,
} from './mappers/ardaMappers';
import {
  createItem,
  queryItems,
  getItemById,
  createDraftItem,
  updateItem,
  lookupSuppliers,
} from './ardaClient';
import { __setMockState, __resetMockState } from '@frontend/store/store';

// ── global mocks ──

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ── helpers ──

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

function mockFetchResponse(
  data: unknown,
  ok = true,
  status = 200,
  headers?: Record<string, string>
) {
  const responseHeaders = new Headers({
    'content-type': 'application/json',
    ...headers,
  });
  const response = {
    ok,
    status,
    headers: responseHeaders,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    clone: jest.fn(),
  };
  response.clone.mockReturnValue({
    ...response,
    clone: response.clone,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  });
  mockFetch.mockResolvedValue(response);
  return response;
}

// ── setup / teardown ──

beforeEach(() => {
  jest.clearAllMocks();
  __resetMockState();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  __resetMockState();
  jest.restoreAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
// Section 1: getAuthHeaders (tested indirectly via createItem)
// ══════════════════════════════════════════════════════════════════════════════

describe('getAuthHeaders (indirect)', () => {
  it('throws auth error when no access token in Redux store', async () => {
    // Default mock state has null tokens

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'No authentication token found'
    );
    expect(handleAuthError).toHaveBeenCalled();
  });

  it('throws auth error when no ID token in Redux store', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const validToken = `header.${payload}.signature`;
    __setMockState({
      auth: {
        tokens: { accessToken: validToken },
      },
    });

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'No ID token found'
    );
    expect(handleAuthError).toHaveBeenCalled();
  });

  it('throws auth error when access token has invalid format', async () => {
    __setMockState({
      auth: {
        tokens: { accessToken: 'invalid', idToken: 'a.b.c' },
      },
    });

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'Invalid authentication token'
    );
    expect(handleAuthError).toHaveBeenCalled();
  });

  it('throws auth error when ID token has invalid format', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const validToken = `header.${payload}.signature`;
    __setMockState({
      auth: {
        tokens: { accessToken: validToken, idToken: 'invalid' },
      },
    });

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'Invalid ID token'
    );
    expect(handleAuthError).toHaveBeenCalled();
  });

  it('attempts token refresh when access token within 2 min of expiry', async () => {
    // Token expires in 60 seconds — within the 2-minute buffer
    const soonExp = Math.floor(Date.now() / 1000) + 60;
    const soonPayload = btoa(JSON.stringify({ exp: soonExp }));
    const soonToken = `header.${soonPayload}.signature`;

    // After refresh, return a fresh token
    const freshExp = Math.floor(Date.now() / 1000) + 3600;
    const freshPayload = btoa(JSON.stringify({ exp: freshExp }));
    const freshToken = `header.${freshPayload}.signature`;

    __setMockState({
      auth: {
        tokens: { accessToken: soonToken, idToken: soonToken },
      },
    });

    (ensureValidTokens as jest.Mock).mockImplementation(async () => {
      // Simulate refresh updating the store
      __setMockState({
        auth: {
          tokens: { accessToken: freshToken, idToken: freshToken },
        },
      });
      return true;
    });

    mockFetchResponse({ ok: true, data: { eId: '1', name: 'Test' } });

    await createItem({ name: 'test' });
    expect(ensureValidTokens).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalled();
  });

  it('throws when token expired and refresh fails', async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const payload = btoa(JSON.stringify({ exp: pastExp }));
    const expiredToken = `header.${payload}.signature`;

    __setMockState({
      auth: {
        tokens: { accessToken: expiredToken, idToken: expiredToken },
      },
    });
    (ensureValidTokens as jest.Mock).mockResolvedValue(false);
    // The "expired" error is thrown inside a try/catch. The catch block
    // checks isAuthenticationError — if true it re-throws the original error.
    (isAuthenticationError as unknown as jest.Mock).mockReturnValue(true);

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'Authentication token has expired'
    );
    expect(handleAuthError).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Section 2: handleApiResponse (tested indirectly via createItem)
// ══════════════════════════════════════════════════════════════════════════════

describe('handleApiResponse (indirect)', () => {
  beforeEach(() => {
    setValidTokens();
  });

  it('successful API response with ok:true returns data', async () => {
    mockFetchResponse({ ok: true, data: { eId: '1', name: 'Test' } });

    const result = await createItem({ name: 'test' });
    expect(mapArdaItemToItem).toHaveBeenCalledWith({ eId: '1', name: 'Test' });
    expect(result).toEqual({ entityId: '1', name: 'Test' });
  });

  it('response with ok:false throws error', async () => {
    mockFetchResponse({ ok: false, error: 'Bad request' });

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'Create item failed: Bad request'
    );
  });

  it('401 response with JWT-related error calls handleAuthError', async () => {
    mockFetchResponse({ error: 'JWT token expired' }, false, 401);

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'Authentication expired'
    );
    expect(handleAuthError).toHaveBeenCalled();
  });

  it('401 response without JWT-related error does NOT call handleAuthError', async () => {
    mockFetchResponse({ error: 'ARDA API key invalid' }, false, 401);

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'ARDA API key invalid'
    );
    expect(handleAuthError).not.toHaveBeenCalled();
  });

  it('non-OK response extracts responseMessage from nested data.details.cause', async () => {
    mockFetchResponse(
      {
        data: {
          details: {
            cause: { responseMessage: 'Detailed error' },
          },
        },
      },
      false,
      400
    );

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'Detailed error'
    );
  });

  it('non-OK response with non-JSON content-type attempts to parse as JSON', async () => {
    const errorBody = { error: 'Server error' };
    const responseHeaders = new Headers({ 'content-type': 'text/plain' });
    const response = {
      ok: false,
      status: 500,
      headers: responseHeaders,
      json: jest.fn().mockResolvedValue(errorBody),
      text: jest.fn().mockResolvedValue(JSON.stringify(errorBody)),
      clone: jest.fn(),
    };
    response.clone.mockReturnValue({
      ...response,
      clone: response.clone,
      json: jest.fn().mockResolvedValue(errorBody),
      text: jest.fn().mockResolvedValue(JSON.stringify(errorBody)),
    });
    mockFetch.mockResolvedValue(response);

    await expect(createItem({ name: 'test' })).rejects.toThrow('Server error');
  });

  it('non-OK response with non-parseable text uses text as error message', async () => {
    const responseHeaders = new Headers({ 'content-type': 'text/plain' });
    const response = {
      ok: false,
      status: 500,
      headers: responseHeaders,
      json: jest.fn().mockRejectedValue(new Error('not json')),
      text: jest.fn().mockResolvedValue('Internal Server Error'),
      clone: jest.fn(),
    };
    response.clone.mockReturnValue({
      ...response,
      clone: response.clone,
      json: jest.fn().mockRejectedValue(new Error('not json')),
      text: jest.fn().mockResolvedValue('Internal Server Error'),
    });
    mockFetch.mockResolvedValue(response);

    await expect(createItem({ name: 'test' })).rejects.toThrow(
      'Internal Server Error'
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Section 3: Item CRUD operations
// ══════════════════════════════════════════════════════════════════════════════

describe('Item CRUD', () => {
  beforeEach(() => {
    setValidTokens();
  });

  it('createItem sends POST to /api/arda/items with mapped payload', async () => {
    mockFetchResponse({ ok: true, data: { eId: '1', name: 'Test' } });

    await createItem({ name: 'test' });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/arda/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'mapped-create' }),
      })
    );
  });

  it('createItem returns mapped Item from response', async () => {
    mockFetchResponse({ ok: true, data: { eId: 'abc', name: 'Widget' } });

    const result = await createItem({ name: 'test' });

    expect(mapArdaItemToItem).toHaveBeenCalledWith({
      eId: 'abc',
      name: 'Widget',
    });
    expect(result).toEqual({ entityId: 'abc', name: 'Widget' });
  });

  it('createItem includes Authorization and X-ID-Token headers', async () => {
    mockFetchResponse({ ok: true, data: { eId: '1', name: 'Test' } });

    await createItem({ name: 'test' });

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders).toHaveProperty('Authorization');
    expect(callHeaders.Authorization).toMatch(/^Bearer /);
    expect(callHeaders).toHaveProperty('X-ID-Token');
  });

  it('queryItems sends POST to /api/arda/items/query', async () => {
    mockFetchResponse({
      ok: true,
      data: {
        results: [],
        thisPage: '0',
        nextPage: '1',
        previousPage: '',
      },
    });

    await queryItems({ filter: true, paginate: { index: 0, size: 10 } });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/arda/items/query',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('queryItems maps all results and returns items + pagination', async () => {
    mockFetchResponse({
      ok: true,
      data: {
        results: [
          { eId: '1', payload: { eId: '1', name: 'Item1' } },
          { eId: '2', payload: { eId: '2', name: 'Item2' } },
        ],
        thisPage: '0',
        nextPage: '1',
        previousPage: '',
      },
    });

    const result = await queryItems({
      filter: true,
      paginate: { index: 0, size: 10 },
    });

    expect(mapArdaItemToItem).toHaveBeenCalledTimes(2);
    expect(result.items).toHaveLength(2);
    expect(result.pagination).toEqual({
      thisPage: '0',
      nextPage: '1',
      previousPage: '',
    });
  });

  it('getItemById sends GET to /api/arda/items/<entityId>', async () => {
    mockFetchResponse({ ok: true, data: { eId: 'e-123', name: 'Test' } });

    await getItemById('e-123');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/arda/items/e-123',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('getItemById throws when entityId empty', async () => {
    await expect(getItemById('')).rejects.toThrow('Entity ID is required');
  });

  it('getItemById returns mapped Item', async () => {
    mockFetchResponse({ ok: true, data: { eId: 'e-123', name: 'Test' } });

    const result = await getItemById('e-123');

    expect(mapArdaItemToItem).toHaveBeenCalled();
    expect(result).toEqual({ entityId: 'e-123', name: 'Test' });
  });

  it('createDraftItem sends GET to /api/arda/items/<id>/draft', async () => {
    mockFetchResponse({ ok: true, data: { eId: 'draft-1', name: 'Draft' } });

    await createDraftItem('item-1');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/arda/items/item-1/draft',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('createDraftItem throws when createdItemId empty', async () => {
    await expect(createDraftItem('')).rejects.toThrow(
      'Created item ID is required'
    );
  });

  it('updateItem sends PUT to /api/arda/items/<entityId>', async () => {
    mockFetchResponse({ ok: true, data: { eId: 'u-1', name: 'Updated' } });

    await updateItem('u-1', { name: 'Updated' });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/arda/items/u-1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('updateItem throws when entityId empty', async () => {
    await expect(updateItem('', { name: 'test' })).rejects.toThrow(
      'Entity ID is required'
    );
  });

  it('updateItem logs error details when response not OK', async () => {
    const errorBody = { error: 'Validation failed', details: 'bad field' };
    const errorText = JSON.stringify(errorBody);
    const responseHeaders = new Headers({
      'content-type': 'application/json',
    });

    // updateItem reads response.text() first, then passes to handleApiResponse
    // which calls response.clone(). We need both to work.
    const clonedResponse = {
      ok: false,
      status: 400,
      headers: responseHeaders,
      json: jest.fn().mockResolvedValue(errorBody),
      text: jest.fn().mockResolvedValue(errorText),
      clone: jest.fn(),
    };
    clonedResponse.clone.mockReturnValue(clonedResponse);

    const response = {
      ok: false,
      status: 400,
      headers: responseHeaders,
      json: jest.fn().mockResolvedValue(errorBody),
      text: jest.fn().mockResolvedValue(errorText),
      clone: jest.fn().mockReturnValue(clonedResponse),
    };
    mockFetch.mockResolvedValue(response);

    await expect(
      updateItem('u-1', { name: 'test' })
    ).rejects.toThrow('Validation failed');

    // Verify console.error was called with updateItem-specific messages
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[updateItem] Error response for entityId u-1'),
      errorText
    );
    expect(console.error).toHaveBeenCalledWith(
      '[updateItem] Parsed error data:',
      errorBody
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Section 4: Lookup functions
// ══════════════════════════════════════════════════════════════════════════════

describe('Lookup functions', () => {
  beforeEach(() => {
    setValidTokens();
  });

  it('lookupSuppliers sends GET with query parameters', async () => {
    mockFetchResponse({ data: ['Supplier A'] });

    await lookupSuppliers('test');

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/api/arda/items/lookup-suppliers');
    expect(url).toContain('name=test');
    expect(mockFetch.mock.calls[0][1].method).toBe('GET');
  });

  it('lookupSuppliers returns array of strings from direct array data', async () => {
    mockFetchResponse({ data: ['Supplier A', 'Supplier B'] });

    const result = await lookupSuppliers('test');
    expect(result).toEqual(['Supplier A', 'Supplier B']);
  });

  it('lookupSuppliers returns strings from domain-specific array', async () => {
    mockFetchResponse({ data: { suppliers: ['X', 'Y'] } });

    const result = await lookupSuppliers('test');
    expect(result).toEqual(['X', 'Y']);
  });

  it('lookupSuppliers returns names from data.results objects', async () => {
    mockFetchResponse({
      data: { results: [{ name: 'A' }, { name: 'B' }] },
    });

    const result = await lookupSuppliers('test');
    expect(result).toEqual(['A', 'B']);
  });

  it('lookupSuppliers returns empty array for unrecognized structure', async () => {
    mockFetchResponse({ data: { unknown: true } });

    const result = await lookupSuppliers('test');
    expect(result).toEqual([]);
  });

  it('lookupSuppliers throws on non-OK response', async () => {
    mockFetchResponse({ error: 'Bad request' }, false, 400);

    await expect(lookupSuppliers('test')).rejects.toThrow('Bad request');
  });

  it('lookupSuppliers filters out non-string values', async () => {
    mockFetchResponse({ data: [123, 'Valid', null, 'Also Valid'] });

    const result = await lookupSuppliers('test');
    expect(result).toEqual(['Valid', 'Also Valid']);
  });
});
