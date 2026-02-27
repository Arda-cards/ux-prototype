'use client';

import React, { useContext, useState, useEffect, useLayoutEffect, useCallback, useMemo, ReactNode } from 'react';
import { User } from '@frontend/types';
import { AuthContext } from '@frontend/contexts/AuthContext';
import { MOCK_USER, generateMockTokens } from './data/mockUser';
import { useAppDispatch } from '@frontend/store/hooks';
import { setLoading as setReduxLoading, setUser as setReduxUser, setTokens as setReduxTokens } from '@frontend/store/slices/authSlice';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggingOut: boolean;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
}

interface TokenInfo {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthContextType extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<{ requiresNewPassword?: boolean; session?: string } | void>;
  respondToNewPasswordChallenge: (session: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmNewPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  changePassword: (credentials: ChangePasswordCredentials) => Promise<void>;
  refreshTokens: () => Promise<TokenInfo | null>;
  ensureValidTokens: () => Promise<boolean>;
  handleSessionExpiry: () => Promise<void>;
}

interface MockAuthProviderProps {
  children: ReactNode;
  autoLogin?: boolean;
}

/**
 * MockAuthProvider - Provides mock authentication for local development
 * Implements the same interface as the real AuthProvider
 */
export function MockAuthProvider({ children, autoLogin = true }: MockAuthProviderProps) {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isLoggingOut: false,
  });

  // Synchronously tell Redux that auth is loading before the first paint.
  // This prevents useAuthValidation (which reads Redux, not AuthContext) from
  // seeing { loading: false, user: null } and redirecting to /signin before
  // the auto-login useEffect below has a chance to run.
  useLayoutEffect(() => {
    dispatch(setReduxLoading(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize mock authentication
  useEffect(() => {
    console.log('[MOCK AUTH] Initializing mock authentication');

    // Helper: finalize auth state in both AuthContext and Redux
    const finalize = (user: User | null, tokens?: { accessToken: string; idToken: string; refreshToken: string }) => {
      setState({
        user,
        loading: false,
        error: null,
        isLoggingOut: false,
      });
      // Mirror to Redux so useAuthValidation sees the correct state
      dispatch(setReduxUser(user));
      if (tokens) {
        dispatch(setReduxTokens({
          accessToken: tokens.accessToken,
          idToken: tokens.idToken,
          refreshToken: tokens.refreshToken,
          expiresAt: Date.now() + 86400000,
        }));
      }
      dispatch(setReduxLoading(false));
    };

    // On the signin page, skip auto-login so users (and tests) can interact
    // with the login form. signIn() will set tokens when the form is submitted.
    const isSigninPage = typeof window !== 'undefined' && window.location.pathname === '/signin';

    // After an explicit signOut, a sessionStorage flag prevents auto-login on
    // subsequent page loads (simulates real auth where there is no valid session
    // after logout). The flag is cleared only when the user explicitly signs in.
    const wasSignedOut = typeof window !== 'undefined' && sessionStorage.getItem('mock-auth-signed-out') === '1';
    // Note: do NOT clear the flag here. It is cleared only when the user
    // explicitly signs in (see signIn below). This ensures that navigating
    // to a protected route after logout still skips auto-login.

    if (isSigninPage) {
      console.log('[MOCK AUTH] Skipping auto-login (signin page)');
      finalize(null);
      return;
    }

    if (wasSignedOut) {
      console.log('[MOCK AUTH] Skipping auto-login (was signed out)');
      finalize(null);
      return;
    }

    // Restore from existing localStorage tokens (survives full page reload)
    const existingToken = typeof window !== 'undefined' && localStorage.getItem('idToken');
    if (existingToken) {
      console.log('[MOCK AUTH] Restoring session from existing localStorage tokens');
      const email = localStorage.getItem('userEmail') || MOCK_USER.email;
      const user = { ...MOCK_USER, email, name: email.split('@')[0] || MOCK_USER.name };
      finalize(user, {
        accessToken: localStorage.getItem('accessToken') || '',
        idToken: existingToken,
        refreshToken: localStorage.getItem('refreshToken') || '',
      });
      return;
    }

    if (autoLogin) {
      // No existing tokens — generate fresh mock session
      console.log('[MOCK AUTH] Auto-login: generating fresh mock tokens');
      const tokens = generateMockTokens();
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('idToken', tokens.idToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userEmail', MOCK_USER.email);
      finalize(MOCK_USER, tokens);
    } else {
      finalize(null);
    }
  }, [autoLogin, dispatch]);

  // Mock sign in - always succeeds with mock user
  const signIn = useCallback(async ({ email, password: _password }: SignInCredentials): Promise<{ requiresNewPassword?: boolean; session?: string } | void> => {
    console.log(`[MOCK AUTH] Sign in attempt for: ${email}`);
    setState((prev) => ({ ...prev, loading: true, error: null }));
    dispatch(setReduxLoading(true));

    // Short delay to simulate network (kept minimal for test speed)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clear the signed-out flag so auto-login works again on future loads
    sessionStorage.removeItem('mock-auth-signed-out');

    // Generate fresh tokens
    const tokens = generateMockTokens();
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('idToken', tokens.idToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('userEmail', email);

    // Use email as the user's name if different from mock user
    const user: User = {
      ...MOCK_USER,
      email: email,
      name: email.split('@')[0] || MOCK_USER.name,
    };

    console.log('[MOCK AUTH] Sign in successful');
    setState({ user, loading: false, error: null, isLoggingOut: false });
    dispatch(setReduxUser(user));
    dispatch(setReduxTokens({
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + 86400000,
    }));
    dispatch(setReduxLoading(false));
  }, [dispatch]);

  // Mock sign out
  const signOut = useCallback(async () => {
    console.log('[MOCK AUTH] Signing out');
    setState((prev) => ({ ...prev, isLoggingOut: true, error: null }));

    // Short delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('userEmail');

    // Set flag so the init effect skips auto-login on subsequent page loads
    // (survives page reload via sessionStorage, cleared on next init)
    sessionStorage.setItem('mock-auth-signed-out', '1');

    console.log('[MOCK AUTH] Sign out complete');
    setState({ user: null, loading: false, error: null, isLoggingOut: false });
    dispatch(setReduxUser(null));
    dispatch(setReduxTokens({ accessToken: null, idToken: null, refreshToken: null, expiresAt: null }));
    dispatch(setReduxLoading(false));
  }, [dispatch]);

  // Mock check auth - syncs React state with localStorage token presence
  const checkAuth = useCallback(async () => {
    console.log('[MOCK AUTH] Checking authentication');

    const hasToken = localStorage.getItem('accessToken');
    if (hasToken && state.user === null) {
      setState((prev) => ({ ...prev, user: MOCK_USER, loading: false }));
    } else if (!hasToken && state.user !== null) {
      // Tokens were cleared externally (e.g. session expiry) — clear user state
      console.log('[MOCK AUTH] Tokens missing, clearing user state');
      setState({ user: null, loading: false, error: null, isLoggingOut: false });
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.user]);

  // Mock forgot password
  const forgotPassword = useCallback(async (email: string) => {
    console.log(`[MOCK AUTH] Forgot password request for: ${email}`);
    setState((prev) => ({ ...prev, loading: true, error: null }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('[MOCK AUTH] Password reset email "sent" (mock)');
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  // Mock confirm new password
  const confirmNewPassword = useCallback(async (email: string, code: string, _newPassword: string) => {
    console.log(`[MOCK AUTH] Confirm new password for: ${email} with code: ${code}`);
    setState((prev) => ({ ...prev, loading: true, error: null }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('[MOCK AUTH] Password reset confirmed (mock)');
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  // Mock change password
  const changePassword = useCallback(async ({ currentPassword: _currentPassword, newPassword: _newPassword }: ChangePasswordCredentials) => {
    console.log('[MOCK AUTH] Change password request');
    setState((prev) => ({ ...prev, loading: true, error: null }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('[MOCK AUTH] Password changed (mock)');
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  // Mock respond to new password challenge
  const respondToNewPasswordChallenge = useCallback(async (_session: string, _newPassword: string) => {
    console.log('[MOCK AUTH] Responding to new password challenge');
    setState((prev) => ({ ...prev, loading: true, error: null }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    const tokens = generateMockTokens();
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('idToken', tokens.idToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    console.log('[MOCK AUTH] New password set successfully');
    setState({ user: MOCK_USER, loading: false, error: null, isLoggingOut: false });
  }, []);

  // Mock refresh tokens - generates new mock tokens
  const refreshTokensMock = useCallback(async (): Promise<TokenInfo | null> => {
    console.log('[MOCK AUTH] Refreshing tokens');

    const tokens = generateMockTokens();
    const now = Date.now();

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('idToken', tokens.idToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
      refreshToken: tokens.refreshToken,
      expiresAt: now + 86400000, // 24 hours from now
    };
  }, []);

  // Mock ensure valid tokens - always returns true
  const ensureValidTokensMock = useCallback(async (): Promise<boolean> => {
    console.log('[MOCK AUTH] Ensuring valid tokens');
    return true;
  }, []);

  // Mock handle session expiry
  const handleSessionExpiry = useCallback(async () => {
    console.log('[MOCK AUTH] Handling session expiry');
    await signOut();
  }, [signOut]);

  const contextValue = useMemo<AuthContextType>(() => ({
    ...state,
    signIn,
    respondToNewPasswordChallenge,
    signOut,
    checkAuth,
    forgotPassword,
    confirmNewPassword,
    changePassword,
    refreshTokens: refreshTokensMock,
    ensureValidTokens: ensureValidTokensMock,
    handleSessionExpiry,
  }), [
    state,
    signIn,
    respondToNewPasswordChallenge,
    signOut,
    checkAuth,
    forgotPassword,
    confirmNewPassword,
    changePassword,
    refreshTokensMock,
    ensureValidTokensMock,
    handleSessionExpiry,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useMockAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};
