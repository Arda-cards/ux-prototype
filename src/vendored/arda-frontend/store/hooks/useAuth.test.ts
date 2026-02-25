import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore, mockAuthStateWithTokens, mockAuthStateSignedOut } from '@frontend/test-utils/test-store';
import { useAuth } from './useAuth';

// Create controllable thunk mocks
const mockSignIn = jest.fn();
const mockRespondChallenge = jest.fn();
const mockSignOut = jest.fn();
const mockRefreshTokens = jest.fn();
const mockCheckAuth = jest.fn();
const mockForgotPassword = jest.fn();
const mockConfirmNewPassword = jest.fn();
const mockChangePassword = jest.fn();

// Mock the store module for ensureValidTokens dynamic import
let mockStoreForEnsure: ReturnType<typeof createTestStore> | null = null;
jest.mock('../store', () => ({
  get store() {
    return mockStoreForEnsure;
  },
}));

jest.mock('../thunks/authThunks', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');

  const signInThunk = createAsyncThunk('auth/signIn', (...args: unknown[]) => mockSignIn(...args));
  const respondToNewPasswordChallengeThunk = createAsyncThunk(
    'auth/respondToNewPasswordChallenge',
    (...args: unknown[]) => mockRespondChallenge(...args),
  );
  const signOutThunk = createAsyncThunk('auth/signOut', (...args: unknown[]) => mockSignOut(...args));
  const refreshTokensThunk = createAsyncThunk('auth/refreshTokens', (...args: unknown[]) => mockRefreshTokens(...args));
  const checkAuthThunk = createAsyncThunk('auth/checkAuth', (...args: unknown[]) => mockCheckAuth(...args));
  const forgotPasswordThunk = createAsyncThunk('auth/forgotPassword', (...args: unknown[]) => mockForgotPassword(...args));
  const confirmNewPasswordThunk = createAsyncThunk('auth/confirmNewPassword', (...args: unknown[]) => mockConfirmNewPassword(...args));
  const changePasswordThunk = createAsyncThunk('auth/changePassword', (...args: unknown[]) => mockChangePassword(...args));

  return {
    signInThunk,
    respondToNewPasswordChallengeThunk,
    signOutThunk,
    refreshTokensThunk,
    checkAuthThunk,
    forgotPasswordThunk,
    confirmNewPasswordThunk,
    changePasswordThunk,
  };
});

function wrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    // @ts-expect-error React.createElement passes children as 3rd arg at runtime; ProviderProps type mismatch is harmless
    return React.createElement(Provider, { store }, children);
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckAuth.mockResolvedValue(null);
  mockSignIn.mockResolvedValue({
    user: { id: 'u1', email: 'test@test.com', name: 'Test' },
    jwtPayload: { sub: 'u1', email: 'test@test.com', 'custom:tenant': 't1', 'custom:role': 'Admin', iss: 'x', aud: 'x', exp: 9999999999, iat: 1, token_use: 'id' },
    tokens: { accessToken: 'at', idToken: 'it', refreshToken: 'rt', expiresAt: 9999999999000 },
  });
  mockSignOut.mockResolvedValue(undefined);
  mockRefreshTokens.mockResolvedValue({
    accessToken: 'new-at', idToken: 'new-it', refreshToken: 'new-rt', expiresAt: 9999999999000,
  });
  mockForgotPassword.mockResolvedValue(undefined);
  mockConfirmNewPassword.mockResolvedValue(undefined);
  mockChangePassword.mockResolvedValue(undefined);
  mockRespondChallenge.mockResolvedValue({
    user: { id: 'u1', email: 'test@test.com', name: 'Test' },
    jwtPayload: { sub: 'u1', email: 'test@test.com', 'custom:tenant': 't1', 'custom:role': 'Admin', iss: 'x', aud: 'x', exp: 9999999999, iat: 1, token_use: 'id' },
    tokens: { accessToken: 'at', idToken: 'it', refreshToken: 'rt', expiresAt: 9999999999000 },
  });
  localStorage.clear();
});

describe('useAuth', () => {
  it('returns user from store', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    expect(result.current.user).toEqual(mockAuthStateWithTokens.user);
  });

  it('returns loading and error state', () => {
    const store = createTestStore({ auth: { ...mockAuthStateSignedOut, loading: true, error: 'fail' } });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('fail');
  });

  it('does not dispatch checkAuthThunk on mount (AuthInit handles initial auth check)', () => {
    const store = createTestStore();
    renderHook(() => useAuth(), { wrapper: wrapper(store) });
    expect(mockCheckAuth).not.toHaveBeenCalled();
  });

  it('signIn dispatches signInThunk and returns void on success', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    let signInResult: unknown;
    await act(async () => {
      signInResult = await result.current.signIn({ email: 'a@b.com', password: 'p' });
    });
    expect(mockSignIn).toHaveBeenCalled();
    expect(signInResult).toBeUndefined();
  });

  it('signIn returns requiresNewPassword when thunk rejects with challenge', async () => {
    // Use rejectWithValue to simulate the requiresNewPassword challenge
    mockSignIn.mockImplementation(
      (_: unknown, { rejectWithValue }: { rejectWithValue: (v: unknown) => unknown }) => {
        return rejectWithValue({ requiresNewPassword: true, session: 'sess-123' });
      },
    );

    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    let signInResult: unknown;
    await act(async () => {
      signInResult = await result.current.signIn({ email: 'a@b.com', password: 'p' });
    });
    expect(signInResult).toEqual({
      requiresNewPassword: true,
      session: 'sess-123',
    });
  });

  it('signIn returns void when thunk rejects with non-challenge error', async () => {
    mockSignIn.mockImplementation(
      (_: unknown, { rejectWithValue }: { rejectWithValue: (v: unknown) => unknown }) => {
        return rejectWithValue('Invalid credentials');
      },
    );

    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    let signInResult: unknown;
    await act(async () => {
      signInResult = await result.current.signIn({ email: 'a@b.com', password: 'bad' });
    });
    expect(signInResult).toBeUndefined();
  });

  it('signOut dispatches signOutThunk and clearAuth', async () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    await act(async () => {
      await result.current.signOut();
    });
    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it('checkAuth dispatches checkAuthThunk', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    mockCheckAuth.mockClear();
    await act(async () => {
      await result.current.checkAuth();
    });
    expect(mockCheckAuth).toHaveBeenCalled();
  });

  it('refreshTokens returns token info on success', async () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    let tokenResult: unknown;
    await act(async () => {
      tokenResult = await result.current.refreshTokens();
    });
    expect(tokenResult).toEqual({
      accessToken: 'new-at',
      idToken: 'new-it',
      refreshToken: 'new-rt',
      expiresAt: 9999999999000,
    });
  });

  it('refreshTokens returns null on failure', async () => {
    mockRefreshTokens.mockRejectedValue(new Error('fail'));
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    let tokenResult: unknown;
    await act(async () => {
      tokenResult = await result.current.refreshTokens();
    });
    expect(tokenResult).toBeNull();
  });

  it('respondToNewPasswordChallenge dispatches thunk with email from localStorage', async () => {
    localStorage.setItem('userEmail', 'stored@test.com');
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    await act(async () => {
      await result.current.respondToNewPasswordChallenge('session-1', 'NewPass!23');
    });
    expect(mockRespondChallenge).toHaveBeenCalled();
  });

  it('respondToNewPasswordChallenge throws when no email in localStorage', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    await act(async () => {
      await expect(
        result.current.respondToNewPasswordChallenge('session-1', 'NewPass!23'),
      ).rejects.toThrow('User email not found');
    });
  });

  it('forgotPassword dispatches forgotPasswordThunk', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    await act(async () => {
      await result.current.forgotPassword('test@test.com');
    });
    expect(mockForgotPassword).toHaveBeenCalled();
  });

  it('confirmNewPassword dispatches confirmNewPasswordThunk', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    await act(async () => {
      await result.current.confirmNewPassword('e@e.com', '123456', 'NewP!1');
    });
    expect(mockConfirmNewPassword).toHaveBeenCalled();
  });

  it('changePassword dispatches changePasswordThunk', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    await act(async () => {
      await result.current.changePassword({ currentPassword: 'old', newPassword: 'new' });
    });
    expect(mockChangePassword).toHaveBeenCalled();
  });

  it('handleSessionExpiry clears auth', async () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    await act(async () => {
      await result.current.handleSessionExpiry();
    });
    expect(result.current.user).toBeNull();
  });

  it('ensureValidTokens returns true when token is fresh', async () => {
    const store = createTestStore({
      auth: {
        ...mockAuthStateWithTokens,
        tokens: {
          ...mockAuthStateWithTokens.tokens,
          expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour from now
        },
      },
    });
    mockStoreForEnsure = store;
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    let valid: boolean | undefined;
    await act(async () => {
      valid = await result.current.ensureValidTokens();
    });
    expect(valid).toBe(true);
  });

  it('ensureValidTokens returns false when no expiresAt', async () => {
    const store = createTestStore({
      auth: {
        ...mockAuthStateSignedOut,
        tokens: { accessToken: null, idToken: null, refreshToken: null, expiresAt: null },
      },
    });
    mockStoreForEnsure = store;
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    let valid: boolean | undefined;
    await act(async () => {
      valid = await result.current.ensureValidTokens();
    });
    expect(valid).toBe(false);
  });

  it('ensureValidTokens refreshes when token expires within 5 minutes', async () => {
    const store = createTestStore({
      auth: {
        ...mockAuthStateWithTokens,
        tokens: {
          ...mockAuthStateWithTokens.tokens,
          expiresAt: Date.now() + 2 * 60 * 1000, // 2 min from now (< 5 min)
        },
      },
    });
    mockStoreForEnsure = store;
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    let valid: boolean | undefined;
    await act(async () => {
      valid = await result.current.ensureValidTokens();
    });
    // refreshTokensThunk succeeds → returns true
    expect(valid).toBe(true);
  });

  it('ensureValidTokens returns true on graceful degradation (refresh fails, token still valid)', async () => {
    mockRefreshTokens.mockRejectedValue(new Error('refresh failed'));
    const store = createTestStore({
      auth: {
        ...mockAuthStateWithTokens,
        tokens: {
          ...mockAuthStateWithTokens.tokens,
          // Token expires in 3 minutes (within 5 min window), but still in the future
          expiresAt: Date.now() + 3 * 60 * 1000,
        },
      },
    });
    mockStoreForEnsure = store;
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    let valid: boolean | undefined;
    await act(async () => {
      valid = await result.current.ensureValidTokens();
    });
    // Refresh failed, but token is still valid (expiresAt > now), graceful degradation
    expect(valid).toBe(true);
  });

  it('ensureValidTokens returns false when refresh fails and token expired', async () => {
    mockRefreshTokens.mockRejectedValue(new Error('refresh failed'));
    const store = createTestStore({
      auth: {
        ...mockAuthStateWithTokens,
        tokens: {
          ...mockAuthStateWithTokens.tokens,
          expiresAt: Date.now() - 1000, // already expired
        },
      },
    });
    mockStoreForEnsure = store;
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    let valid: boolean | undefined;
    await act(async () => {
      valid = await result.current.ensureValidTokens();
    });
    expect(valid).toBe(false);
  });

  it('isLoggingOut reflects store state', () => {
    const store = createTestStore({
      auth: { ...mockAuthStateSignedOut, isLoggingOut: true },
    });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    expect(result.current.isLoggingOut).toBe(true);
  });
});
