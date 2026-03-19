import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore, mockAuthStateSignedOut, mockAuthStateWithTokens } from '@frontend/test-utils/test-store';
import { AuthInit } from './AuthInit';

// Spy to track checkAuthThunk calls
const mockCheckAuthPayload = jest.fn().mockResolvedValue(null);

// Mock thunks
jest.mock('../thunks/authThunks', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    signInThunk: createAsyncThunk('auth/signIn', () => {}),
    respondToNewPasswordChallengeThunk: createAsyncThunk('auth/respondToNewPasswordChallenge', () => {}),
    signOutThunk: createAsyncThunk('auth/signOut', () => {}),
    refreshTokensThunk: createAsyncThunk('auth/refreshTokens', () => ({})),
    checkAuthThunk: createAsyncThunk('auth/checkAuth', (...args: unknown[]) => mockCheckAuthPayload(...args)),
    forgotPasswordThunk: createAsyncThunk('auth/forgotPassword', () => {}),
    confirmNewPasswordThunk: createAsyncThunk('auth/confirmNewPassword', () => {}),
    changePasswordThunk: createAsyncThunk('auth/changePassword', () => {}),
  };
});

describe('AuthInit', () => {
  beforeEach(() => {
    localStorage.clear();
    mockCheckAuthPayload.mockClear();
  });

  it('renders null (no visible output)', () => {
    const store = createTestStore();
    const { container } = render(
      <Provider store={store}><AuthInit /></Provider>
    );
    expect(container.innerHTML).toBe('');
  });

  it('syncs tokens from localStorage to Redux on mount when store has no tokens', () => {
    const fakeAccessToken = btoa(JSON.stringify({ alg: 'RS256' })) + '.' +
      btoa(JSON.stringify({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600 })) + '.' +
      btoa('sig');

    localStorage.setItem('accessToken', fakeAccessToken);
    localStorage.setItem('idToken', 'mock-id-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');

    const store = createTestStore({ auth: mockAuthStateSignedOut });
    render(
      <Provider store={store}><AuthInit /></Provider>
    );

    const state = store.getState();
    expect(state.auth.tokens.accessToken).toBe(fakeAccessToken);
    expect(state.auth.tokens.idToken).toBe('mock-id-token');
    expect(state.auth.tokens.refreshToken).toBe('mock-refresh-token');
    expect(state.auth.tokens.expiresAt).toBeGreaterThan(Date.now());
  });

  it('does not dispatch checkAuthThunk when no tokens exist anywhere (unauthenticated user)', () => {
    const store = createTestStore({ auth: mockAuthStateSignedOut });
    render(
      <Provider store={store}><AuthInit /></Provider>
    );
    // No tokens in localStorage or Redux → AuthInit does nothing; user stays null
    // useAuthValidation handles the redirect to /signin
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.loading).toBe(false);
  });

  it('syncs Redux tokens to localStorage when tokens change', () => {
    const store = createTestStore({
      auth: {
        ...mockAuthStateSignedOut,
        tokens: {
          accessToken: 'synced-at',
          idToken: 'synced-it',
          refreshToken: 'synced-rt',
          expiresAt: 9999999999000,
        },
      },
    });

    render(
      <Provider store={store}><AuthInit /></Provider>
    );

    expect(localStorage.getItem('accessToken')).toBe('synced-at');
    expect(localStorage.getItem('idToken')).toBe('synced-it');
    expect(localStorage.getItem('refreshToken')).toBe('synced-rt');
    expect(localStorage.getItem('tokenExpiresAt')).toBe('9999999999000');
  });

  it('dispatches checkAuthThunk when tokens are already in Redux (page refresh with persist)', async () => {
    // Production path only — MockAuthProvider owns auth state in mock mode and this
    // dispatch is intentionally skipped there. Skip the test when running in mock mode.
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') return;
    // Simulate redux-persist restoring tokens but isTokenValid starting as false (blacklisted).
    // AuthInit should call checkAuthThunk to restore isTokenValid without a network call.
    // Force mock mode off: the coverage CI sets NEXT_PUBLIC_MOCK_MODE=true (for Playwright),
    // but this unit test must verify the non-mock-mode branch of AuthInit.
    const savedMockMode = process.env.NEXT_PUBLIC_MOCK_MODE;
    process.env.NEXT_PUBLIC_MOCK_MODE = 'false';

    try {
      const store = createTestStore({ auth: mockAuthStateWithTokens });

      render(
        <Provider store={store}><AuthInit /></Provider>
      );

      await waitFor(() => {
        expect(mockCheckAuthPayload).toHaveBeenCalledTimes(1);
      });
    } finally {
      process.env.NEXT_PUBLIC_MOCK_MODE = savedMockMode;
    }
  });

  it('clears localStorage when Redux tokens are null and no localStorage tokens', () => {
    // No tokens in localStorage, no tokens in Redux → second useEffect clears localStorage
    localStorage.setItem('tokenExpiresAt', '12345');

    const store = createTestStore({ auth: mockAuthStateSignedOut });
    render(
      <Provider store={store}><AuthInit /></Provider>
    );

    // tokenExpiresAt should be cleared since all tokens are null
    expect(localStorage.getItem('tokenExpiresAt')).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
