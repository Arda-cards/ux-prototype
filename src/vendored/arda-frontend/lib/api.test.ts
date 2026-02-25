/**
 * Unit tests for src/lib/api.ts
 *
 * Covers: axios instance creation, request interceptor (pass-through and error),
 * response interceptor (401 handling, auth error detection, non-auth pass-through).
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('./authErrorHandler', () => ({
  handleAuthError: jest.fn(),
}));

jest.mock('./utils', () => ({
  isAuthenticationError: jest.fn(),
}));

import MockAdapter from 'axios-mock-adapter';
import api from './api';
import { handleAuthError } from './authErrorHandler';
import { isAuthenticationError } from './utils';

const mockHandleAuthError = handleAuthError as jest.Mock;
const mockIsAuthenticationError = isAuthenticationError as jest.Mock;

// ---------------------------------------------------------------------------
// Axios mock adapter
// ---------------------------------------------------------------------------

let mock: MockAdapter;

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAuthenticationError.mockReturnValue(false);
  mock = new MockAdapter(api);
});

afterEach(() => {
  mock.restore();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('api axios instance', () => {
  it('has baseURL set to NEXT_PUBLIC_API_URL or /api', () => {
    expect(api.defaults.baseURL).toBe(
      process.env.NEXT_PUBLIC_API_URL || '/api'
    );
  });

  it('has Content-Type application/json default header', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('request interceptor', () => {
  it('passes through requests unchanged', async () => {
    mock.onGet('/test').reply(200, { ok: true });
    const response = await api.get('/test');
    expect(response.data).toEqual({ ok: true });
  });

  it('rejects when request interceptor receives an error', async () => {
    mock.onGet('/fail').networkError();
    await expect(api.get('/fail')).rejects.toThrow();
  });
});

describe('response interceptor — 401 handling', () => {
  it('calls handleAuthError for 401 from /api/arda/ endpoint', async () => {
    mock.onGet('/api/arda/items').reply(401, { error: 'Not authenticated' });
    await expect(api.get('/api/arda/items')).rejects.toThrow();
    expect(mockHandleAuthError).toHaveBeenCalled();
  });

  it('calls handleAuthError for 401 with JWT-related error message from non-arda endpoint', async () => {
    mock.onGet('/other').reply(401, { error: 'No JWT token provided' });
    await expect(api.get('/other')).rejects.toThrow();
    expect(mockHandleAuthError).toHaveBeenCalled();
  });

  it('calls handleAuthError for 401 with "authentication required" message', async () => {
    mock.onGet('/other').reply(401, { error: 'Authentication required' });
    await expect(api.get('/other')).rejects.toThrow();
    expect(mockHandleAuthError).toHaveBeenCalled();
  });

  it('calls handleAuthError for 401 with "invalid or expired" message', async () => {
    mock.onGet('/other').reply(401, { error: 'Invalid or expired token' });
    await expect(api.get('/other')).rejects.toThrow();
    expect(mockHandleAuthError).toHaveBeenCalled();
  });

  it('does NOT call handleAuthError for 401 from non-arda endpoint with non-auth message', async () => {
    mock.onGet('/api/hubspot/contact').reply(401, {
      error: 'Missing HubSpot access token',
    });
    await expect(api.get('/api/hubspot/contact')).rejects.toThrow();
    expect(mockHandleAuthError).not.toHaveBeenCalled();
  });

  it('calls handleAuthError when non-401 error message matches isAuthenticationError', async () => {
    mockIsAuthenticationError.mockReturnValueOnce(true);
    mock.onGet('/api/arda/items').reply(403, { error: 'Session expired' });
    await expect(api.get('/api/arda/items')).rejects.toThrow();
    expect(mockHandleAuthError).toHaveBeenCalled();
  });

  it('calls handleAuthError when the AxiosError itself matches isAuthenticationError', async () => {
    // First call for errorMessage string check returns false,
    // second call for the error object check returns true
    mockIsAuthenticationError
      .mockReturnValueOnce(false)  // for errorMessage check
      .mockReturnValueOnce(true);  // for error object check
    mock.onGet('/test').reply(500, { error: 'Server error' });
    await expect(api.get('/test')).rejects.toThrow();
    expect(mockHandleAuthError).toHaveBeenCalled();
  });

  it('does NOT call handleAuthError for standard server errors', async () => {
    mockIsAuthenticationError.mockReturnValue(false);
    mock.onGet('/test').reply(500, { error: 'Internal server error' });
    await expect(api.get('/test')).rejects.toThrow();
    expect(mockHandleAuthError).not.toHaveBeenCalled();
  });

  it('passes through successful responses unchanged', async () => {
    mock.onGet('/test').reply(200, { ok: true, data: [1, 2, 3] });
    const response = await api.get('/test');
    expect(response.data).toEqual({ ok: true, data: [1, 2, 3] });
  });

  it('uses error.message as fallback when response data has no error field', async () => {
    mock.onGet('/api/arda/items').reply(401, 'Unauthorized');
    await expect(api.get('/api/arda/items')).rejects.toThrow();
    // Should still call handleAuthError because it's an arda endpoint 401
    expect(mockHandleAuthError).toHaveBeenCalled();
  });
});
