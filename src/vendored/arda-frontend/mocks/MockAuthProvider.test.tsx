/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost/items"}
 */

import React from 'react';
import { render, act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '@frontend/test-utils/test-store';
import { MockAuthProvider } from './MockAuthProvider';
import { AuthContext } from '@frontend/contexts/AuthContext';
import { MOCK_USER } from './data/mockUser';

// Mock thunks so Redux reducers for async actions don't fire unexpectedly.
// MockAuthProvider dispatches synchronous slice actions (setLoading, setUser,
// setTokens) — those still work because they bypass the thunk middleware.
jest.mock('@/store/thunks/authThunks', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    signInThunk: createAsyncThunk('auth/signIn', () => {}),
    respondToNewPasswordChallengeThunk: createAsyncThunk('auth/respondToNewPasswordChallenge', () => {}),
    signOutThunk: createAsyncThunk('auth/signOut', () => {}),
    refreshTokensThunk: createAsyncThunk('auth/refreshTokens', () => ({})),
    checkAuthThunk: createAsyncThunk('auth/checkAuth', () => null),
    forgotPasswordThunk: createAsyncThunk('auth/forgotPassword', () => {}),
    confirmNewPasswordThunk: createAsyncThunk('auth/confirmNewPassword', () => {}),
    changePasswordThunk: createAsyncThunk('auth/changePassword', () => {}),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a wrapper that nests <Provider store> around <MockAuthProvider>. */
function createWrapper(store: ReturnType<typeof createTestStore>, autoLogin = true) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MockAuthProvider autoLogin={autoLogin}>{children}</MockAuthProvider>
      </Provider>
    );
  };
}

/** A trivial hook that reads the legacy AuthContext. */
function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext not available');
  return ctx;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

// Helper: jsdom's location is non-configurable, but history.pushState works.
function setPathname(path: string) {
  window.history.pushState({}, '', path);
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  setPathname('/items');
});

// ===========================================================================
// Category 1 — Race condition prevention
// ===========================================================================

describe('Race condition prevention (Redux loading gate)', () => {
  it('1. dispatches setLoading(true) before setLoading(false)', () => {
    const store = createTestStore();
    // Sanity: initial Redux state has loading=false
    expect(store.getState().auth.loading).toBe(false);

    // Spy on dispatch to capture the order of loading state transitions.
    // The useLayoutEffect (setLoading(true)) must fire before the useEffect
    // (finalize → setLoading(false)) so that sibling hooks like
    // useAuthValidation never see { loading: false, user: null }.
    const loadingValues: boolean[] = [];
    const originalDispatch = store.dispatch.bind(store);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.dispatch = ((action: any) => {
      const result = originalDispatch(action);
      if (action?.type === 'auth/setLoading') {
        loadingValues.push(action.payload as boolean);
      }
      return result;
    }) as typeof store.dispatch;

    render(
      <Provider store={store}>
        <MockAuthProvider>{null}</MockAuthProvider>
      </Provider>,
    );

    // The useLayoutEffect fires setLoading(true), then useEffect fires
    // finalize which dispatches setLoading(false).
    expect(loadingValues).toEqual([true, false]);
  });

  it('2. sets Redux user and tokens after auto-login completes', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MockAuthProvider autoLogin>{null}</MockAuthProvider>
      </Provider>,
    );

    // After effects flush, auto-login should have synced to Redux
    await waitFor(() => {
      const auth = store.getState().auth;
      expect(auth.loading).toBe(false);
      expect(auth.user).toEqual(MOCK_USER);
      expect(auth.tokens.accessToken).toBeTruthy();
      expect(auth.tokens.idToken).toBeTruthy();
      expect(auth.tokens.refreshToken).toBeTruthy();
      expect(auth.tokens.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  it('3. on /signin page: Redux settles to loading=false, user=null', async () => {
    setPathname('/signin');

    const store = createTestStore();
    render(
      <Provider store={store}>
        <MockAuthProvider autoLogin>{null}</MockAuthProvider>
      </Provider>,
    );

    await waitFor(() => {
      const auth = store.getState().auth;
      expect(auth.loading).toBe(false);
      expect(auth.user).toBeNull();
    });
  });

  it('4. signed-out flag: Redux settles to loading=false, user=null', async () => {
    sessionStorage.setItem('mock-auth-signed-out', '1');

    const store = createTestStore();
    render(
      <Provider store={store}>
        <MockAuthProvider autoLogin>{null}</MockAuthProvider>
      </Provider>,
    );

    await waitFor(() => {
      const auth = store.getState().auth;
      expect(auth.loading).toBe(false);
      expect(auth.user).toBeNull();
    });
  });
});

// ===========================================================================
// Category 2 — Redux sync on signIn / signOut
// ===========================================================================

describe('Redux sync on signIn / signOut', () => {
  it('5. signIn() syncs user and tokens to Redux', async () => {
    // Start on /signin so auto-login is skipped
    setPathname('/signin');

    const store = createTestStore();
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: createWrapper(store, true),
    });

    // Wait for init to settle (loading=false, user=null on signin page)
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Now call signIn through the context
    await act(async () => {
      await result.current.signIn({ email: 'test@example.com', password: 'pass' });
    });

    const auth = store.getState().auth;
    expect(auth.user).not.toBeNull();
    expect(auth.user?.email).toBe('test@example.com');
    expect(auth.tokens.accessToken).toBeTruthy();
    expect(auth.tokens.idToken).toBeTruthy();
    expect(auth.tokens.refreshToken).toBeTruthy();
    expect(auth.loading).toBe(false);
  });

  it('6. signOut() clears Redux user and tokens', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: createWrapper(store, true),
    });

    // Wait for auto-login to complete
    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    // Now sign out
    await act(async () => {
      await result.current.signOut();
    });

    const auth = store.getState().auth;
    expect(auth.user).toBeNull();
    expect(auth.tokens.accessToken).toBeNull();
    expect(auth.tokens.idToken).toBeNull();
    expect(auth.tokens.refreshToken).toBeNull();
    expect(auth.loading).toBe(false);
  });
});

// ===========================================================================
// Category 3 — Existing behavior preserved (non-interference)
// ===========================================================================

describe('Existing behavior preserved', () => {
  it('7. AuthContext receives correct user and loading values', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: createWrapper(store, true),
    });

    // After auto-login completes, AuthContext should reflect the mock user
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(MOCK_USER);
      expect(result.current.error).toBeNull();
    });
  });

  it('8. localStorage tokens are set during auto-login', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MockAuthProvider autoLogin>{null}</MockAuthProvider>
      </Provider>,
    );

    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBeTruthy();
      expect(localStorage.getItem('idToken')).toBeTruthy();
      expect(localStorage.getItem('refreshToken')).toBeTruthy();
      expect(localStorage.getItem('userEmail')).toBe(MOCK_USER.email);
    });
  });

  it('9. existing localStorage tokens are restored (not regenerated)', async () => {
    // Pre-set tokens in localStorage
    localStorage.setItem('accessToken', 'pre-existing-access');
    localStorage.setItem('idToken', 'pre-existing-id');
    localStorage.setItem('refreshToken', 'pre-existing-refresh');
    localStorage.setItem('userEmail', 'restored@example.com');

    const store = createTestStore();
    render(
      <Provider store={store}>
        <MockAuthProvider autoLogin>{null}</MockAuthProvider>
      </Provider>,
    );

    await waitFor(() => {
      const auth = store.getState().auth;
      expect(auth.user?.email).toBe('restored@example.com');
      expect(auth.loading).toBe(false);
    });

    // Tokens in localStorage should still be the original values (not regenerated)
    expect(localStorage.getItem('accessToken')).toBe('pre-existing-access');
    expect(localStorage.getItem('idToken')).toBe('pre-existing-id');
    expect(localStorage.getItem('refreshToken')).toBe('pre-existing-refresh');
  });

  it('10. autoLogin=false: no tokens generated, Redux settles correctly', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: createWrapper(store, false),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // AuthContext: no user
    expect(result.current.user).toBeNull();

    // Redux: no user, no tokens
    const auth = store.getState().auth;
    expect(auth.user).toBeNull();
    expect(auth.tokens.accessToken).toBeNull();
    expect(auth.loading).toBe(false);

    // localStorage: untouched
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
