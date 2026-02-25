'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectIsLoggingOut,
} from '../selectors/authSelectors';
import {
  signInThunk,
  respondToNewPasswordChallengeThunk,
  signOutThunk,
  refreshTokensThunk,
  checkAuthThunk,
  forgotPasswordThunk,
  confirmNewPasswordThunk,
  changePasswordThunk,
} from '../thunks/authThunks';
import { clearAuth } from '../slices/authSlice';

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

/**
 * useAuth hook - Redux-based authentication hook
 * Replaces the Context-based useAuth hook
 *
 * This hook provides the same interface as the Context version for backward compatibility
 * during migration. Eventually, components will be updated to use Redux directly.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isLoggingOut = useAppSelector(selectIsLoggingOut);
  // Auth is checked once on app mount by AuthInit — do not repeat it here.
  // With ~20 components using useAuth(), dispatching checkAuthThunk() from
  // every one of them on mount causes a burst of redundant dispatches that
  // saturates the middleware chain and can freeze the page.

  const signIn = useCallback(
    async (credentials: SignInCredentials): Promise<{ requiresNewPassword?: boolean; session?: string } | void> => {
      const result = await dispatch(signInThunk(credentials));

      if (signInThunk.rejected.match(result)) {
        const payload = result.payload as unknown;
        // Check if it's a new password challenge
        if (payload && typeof payload === 'object' && 'requiresNewPassword' in payload) {
          const challenge = payload as { requiresNewPassword: boolean; session?: string };
          return {
            requiresNewPassword: true,
            session: challenge.session || '',
          };
        }
        return;
      }

      return;
    },
    [dispatch]
  );

  const respondToNewPasswordChallenge = useCallback(
    async (session: string, newPassword: string) => {
      const email = typeof window !== 'undefined'
        ? localStorage.getItem('userEmail') || ''
        : '';

      if (!email) {
        throw new Error('User email not found. Please sign in again.');
      }

      await dispatch(respondToNewPasswordChallengeThunk({ session, newPassword, email }));
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    await dispatch(signOutThunk());
    dispatch(clearAuth());
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    await dispatch(checkAuthThunk());
  }, [dispatch]);

  const refreshTokens = useCallback(async (): Promise<TokenInfo | null> => {
    const result = await dispatch(refreshTokensThunk());

    if (refreshTokensThunk.fulfilled.match(result)) {
      return {
        accessToken: result.payload.accessToken,
        idToken: result.payload.idToken,
        refreshToken: result.payload.refreshToken,
        expiresAt: result.payload.expiresAt,
      };
    }

    return null;
  }, [dispatch]);

  const ensureValidTokens = useCallback(async (): Promise<boolean> => {
    const { store } = await import('../store');
    const state = store.getState();

    const expiresAt = state.auth.tokens.expiresAt;
    if (!expiresAt) return false;

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt - now < fiveMinutes) {
      const result = await dispatch(refreshTokensThunk());
      if (refreshTokensThunk.fulfilled.match(result)) {
        return true;
      }

      // Graceful degradation: check if current token is still valid
      const updatedState = store.getState();
      const updatedExpiresAt = updatedState.auth.tokens.expiresAt;
      if (updatedExpiresAt && updatedExpiresAt > now) {
        return true;
      }

      return false;
    }

    return true;
  }, [dispatch]);

  const handleSessionExpiry = useCallback(async () => {
    dispatch(clearAuth());
  }, [dispatch]);

  const forgotPassword = useCallback(
    async (email: string) => {
      await dispatch(forgotPasswordThunk(email));
    },
    [dispatch]
  );

  const confirmNewPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      await dispatch(confirmNewPasswordThunk({ email, code, newPassword }));
    },
    [dispatch]
  );

  const changePassword = useCallback(
    async (credentials: ChangePasswordCredentials) => {
      await dispatch(changePasswordThunk(credentials));
    },
    [dispatch]
  );

  return {
    user,
    loading,
    error,
    isLoggingOut,
    signIn,
    respondToNewPasswordChallenge,
    signOut,
    checkAuth,
    forgotPassword,
    confirmNewPassword,
    changePassword,
    refreshTokens,
    ensureValidTokens,
    handleSessionExpiry,
  };
}
