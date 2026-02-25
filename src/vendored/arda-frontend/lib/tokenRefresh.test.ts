/**
 * Unit tests for src/lib/tokenRefresh.ts
 *
 * MIGRATED TO REDUX: Tests now mock @/store/store (manual mock) and
 * @/store/thunks/authThunks instead of direct Cognito SDK calls.
 *
 * Covers: shouldRefreshTokens, refreshTokens, ensureValidTokens.
 */

// ---------------------------------------------------------------------------
// Mocks — must be declared before imports
// ---------------------------------------------------------------------------

jest.mock('@/store/store');
jest.mock('@/store/thunks/authThunks', () => ({
  refreshTokensThunk: Object.assign(jest.fn(), {
    fulfilled: { match: jest.fn() },
    rejected: { match: jest.fn() },
    pending: { match: jest.fn() },
  }),
}));
jest.mock('@/lib/utils', () => ({
  generateSecretHash: jest.fn().mockResolvedValue('mock-secret-hash'),
  debugLog: jest.fn(),
  debugError: jest.fn(),
  debugWarn: jest.fn(),
}));

import { store, __setMockState, __resetMockState } from '@frontend/store/store';
import { refreshTokensThunk } from '@frontend/store/thunks/authThunks';
import {
  shouldRefreshTokens,
  refreshTokens,
  ensureValidTokens,
} from '@frontend/lib/tokenRefresh';

// ---------------------------------------------------------------------------
// Helper: create a token with specific expiry
// ---------------------------------------------------------------------------

function createTokenWithExp(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'RS256' }));
  const payload = btoa(JSON.stringify({ sub: 'user-1', exp: expSeconds, iss: 'https://cognito' }));
  const sig = btoa('mock-sig');
  return `${header}.${payload}.${sig}`;
}

// ---------------------------------------------------------------------------
// localStorage mock (for backward-compatibility fallback paths)
// ---------------------------------------------------------------------------

const localStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => localStorageData[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageData[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageData[key];
  }),
  clear: jest.fn(() => {
    Object.keys(localStorageData).forEach(k => delete localStorageData[k]);
  }),
  get length() {
    return Object.keys(localStorageData).length;
  },
  key: jest.fn((i: number) => Object.keys(localStorageData)[i] ?? null),
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

// ---------------------------------------------------------------------------
// shouldRefreshTokens
// ---------------------------------------------------------------------------

describe('shouldRefreshTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMockState();
    Object.keys(localStorageData).forEach(k => delete localStorageData[k]);
  });

  it('returns false when no token provided and Redux store has no accessToken', () => {
    expect(shouldRefreshTokens()).toBe(false);
  });

  it('returns false when token expires more than 5 minutes from now', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600; // 10 min from now
    const token = createTokenWithExp(futureExp);
    expect(shouldRefreshTokens(token)).toBe(false);
  });

  it('returns true when token expires within 5 minutes', () => {
    const nearExp = Math.floor(Date.now() / 1000) + 120; // 2 min from now
    const token = createTokenWithExp(nearExp);
    expect(shouldRefreshTokens(token)).toBe(true);
  });

  it('returns true when token already expired', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const token = createTokenWithExp(pastExp);
    expect(shouldRefreshTokens(token)).toBe(true);
  });

  it('returns true when token cannot be decoded (malformed)', () => {
    expect(shouldRefreshTokens('not-a-jwt')).toBe(true);
  });

  it('falls back to Redux store accessToken when no parameter provided', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    const token = createTokenWithExp(futureExp);
    __setMockState({
      auth: { tokens: { accessToken: token } },
    });
    expect(shouldRefreshTokens()).toBe(false);
  });

  it('falls back to localStorage accessToken when no parameter and no Redux token', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    const token = createTokenWithExp(futureExp);
    localStorageData['accessToken'] = token;
    expect(shouldRefreshTokens()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// refreshTokens
// ---------------------------------------------------------------------------

describe('refreshTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMockState();
    Object.keys(localStorageData).forEach(k => delete localStorageData[k]);
  });

  it('returns null when no refresh token available (neither param nor Redux store)', async () => {
    const result = await refreshTokens();
    expect(result).toBeNull();
  });

  it('returns null when no refresh token in param but store has one and thunk rejects', async () => {
    __setMockState({
      auth: { tokens: { refreshToken: 'store-refresh-token' } },
    });

    const dispatchResult = { type: 'auth/refreshTokens/rejected' };
    (store.dispatch as jest.Mock).mockResolvedValue(dispatchResult);
    (refreshTokensThunk.fulfilled.match as unknown as jest.Mock).mockReturnValue(false);

    const result = await refreshTokens();
    expect(result).toBeNull();
  });

  it('dispatches refreshTokensThunk and returns TokenInfo on success', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const accessTokenStr = createTokenWithExp(futureExp);
    const idTokenStr = createTokenWithExp(futureExp);

    __setMockState({
      auth: {
        tokens: {
          refreshToken: 'mock-refresh',
          accessToken: accessTokenStr,
          idToken: idTokenStr,
          expiresAt: futureExp * 1000,
        },
      },
    });

    const dispatchResult = { type: 'auth/refreshTokens/fulfilled', payload: {} };
    (store.dispatch as jest.Mock).mockResolvedValue(dispatchResult);
    (refreshTokensThunk.fulfilled.match as unknown as jest.Mock).mockReturnValue(true);

    const result = await refreshTokens('mock-refresh');
    expect(result).not.toBeNull();
    expect(result!.accessToken).toBe(accessTokenStr);
    expect(result!.idToken).toBe(idTokenStr);
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('uses provided refresh token param over Redux store', async () => {
    // Store has no refresh token, but param provides one
    const dispatchResult = { type: 'auth/refreshTokens/rejected' };
    (store.dispatch as jest.Mock).mockResolvedValue(dispatchResult);
    (refreshTokensThunk.fulfilled.match as unknown as jest.Mock).mockReturnValue(false);

    const result = await refreshTokens('param-refresh-token');
    // Should have dispatched since param provides a refresh token
    expect(store.dispatch).toHaveBeenCalled();
    expect(result).toBeNull(); // rejected
  });

  it('returns null when thunk dispatch fails', async () => {
    __setMockState({
      auth: { tokens: { refreshToken: 'mock-refresh' } },
    });

    const dispatchResult = { type: 'auth/refreshTokens/rejected', error: { message: 'failed' } };
    (store.dispatch as jest.Mock).mockResolvedValue(dispatchResult);
    (refreshTokensThunk.fulfilled.match as unknown as jest.Mock).mockReturnValue(false);

    const result = await refreshTokens('mock-refresh');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ensureValidTokens
// ---------------------------------------------------------------------------

describe('ensureValidTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMockState();
    Object.keys(localStorageData).forEach(k => delete localStorageData[k]);
  });

  it('returns true when token does not need refresh', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600; // 10 min
    const token = createTokenWithExp(futureExp);
    const result = await ensureValidTokens(token);
    expect(result).toBe(true);
  });

  it('returns false when no access token available', async () => {
    const result = await ensureValidTokens();
    expect(result).toBe(false);
  });

  it('reads token from Redux store when no param provided', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    const token = createTokenWithExp(futureExp);
    __setMockState({
      auth: { tokens: { accessToken: token } },
    });

    const result = await ensureValidTokens();
    expect(result).toBe(true);
  });

  it('calls refreshTokens and returns true when refresh succeeds', async () => {
    // Token that needs refresh (expires within 5 min)
    const nearExp = Math.floor(Date.now() / 1000) + 60;
    const token = createTokenWithExp(nearExp);

    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const freshToken = createTokenWithExp(futureExp);

    __setMockState({
      auth: {
        tokens: {
          accessToken: freshToken,
          idToken: freshToken,
          refreshToken: 'valid-refresh',
          expiresAt: futureExp * 1000,
        },
      },
    });

    const dispatchResult = { type: 'auth/refreshTokens/fulfilled', payload: {} };
    (store.dispatch as jest.Mock).mockResolvedValue(dispatchResult);
    (refreshTokensThunk.fulfilled.match as unknown as jest.Mock).mockReturnValue(true);

    const result = await ensureValidTokens(token, 'valid-refresh', 'user@test.com');
    expect(result).toBe(true);
  });

  it('returns true (graceful degradation) when refresh fails but token still technically valid', async () => {
    // Token that needs refresh (within 5 min buffer) but hasn't actually expired
    const nearExp = Math.floor(Date.now() / 1000) + 120; // 2 min from now
    const token = createTokenWithExp(nearExp);

    // Make refresh fail - no refresh token in store
    const result = await ensureValidTokens(token);
    // Token is still valid (exp > now), so graceful degradation returns true
    expect(result).toBe(true);
  });

  it('returns false when refresh fails and token has actually expired', async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60; // expired 1 min ago
    const token = createTokenWithExp(pastExp);

    const result = await ensureValidTokens(token);
    expect(result).toBe(false);
  });

  it('returns false when token is malformed and refresh fails', async () => {
    const result = await ensureValidTokens('malformed-token');
    expect(result).toBe(false);
  });

  it('falls back to localStorage when no param and no Redux token', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    const token = createTokenWithExp(futureExp);
    localStorageData['accessToken'] = token;

    const result = await ensureValidTokens();
    expect(result).toBe(true);
  });
});
