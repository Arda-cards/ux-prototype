'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../hooks';
import { checkAuthThunk } from '../thunks/authThunks';
import { setTokens } from '../slices/authSlice';
import { selectTokens, selectSessionExpired } from '../selectors/authSelectors';
import { STORAGE_KEYS } from '../constants/storageKeys';

/**
 * AuthInit component
 * Initializes auth state from localStorage on mount (for migration compatibility)
 * and syncs Redux state with localStorage during transition period
 *
 * This component should be placed early in the component tree, inside ReduxProvider
 */
export function AuthInit() {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector(selectTokens);
  const sessionExpired = useAppSelector(selectSessionExpired);
  const prevSessionExpired = useRef(false);
  const initialReduxHasToken = useRef(!!tokens.accessToken);

  useEffect(() => {
    // On mount, check if we have tokens in localStorage and sync to Redux
    // This handles the case where user refreshes page and tokens are in localStorage
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const idToken = localStorage.getItem(STORAGE_KEYS.ID_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (accessToken && idToken && refreshToken && !initialReduxHasToken.current) {
        // Tokens in localStorage but not in Redux (first load, no persist) — sync then validate.
        let expiresAt: number | null = null;
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          expiresAt = payload.exp ? payload.exp * 1000 : null;
        } catch {
          console.warn('[AUTH_INIT] Failed to decode token expiration');
        }

        dispatch(setTokens({ accessToken, idToken, refreshToken, expiresAt }));
        dispatch(checkAuthThunk());
      } else if (initialReduxHasToken.current && process.env.NEXT_PUBLIC_MOCK_MODE !== 'true') {
        // Tokens already in Redux from redux-persist (page refresh) but isTokenValid resets
        // to false on every boot because it is blacklisted from persist. Re-run checkAuthThunk
        // to decode the JWT locally and restore isTokenValid — no network call needed.
        // Skip in mock mode: MockAuthProvider owns auth state there, and E2E tests rely on
        // isTokenValid staying false so pages show the expected empty/loading states.
        dispatch(checkAuthThunk());
      }
      // If no tokens exist anywhere, the user is unauthenticated.
      // useAuthValidation will handle the redirect — no need to trigger a loading cycle here.
    }
  }, [dispatch]); // Only run on mount

  // Sync Redux tokens to localStorage when they change (for backward compatibility during migration)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (tokens.accessToken && tokens.idToken && tokens.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.idToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

      if (tokens.expiresAt) {
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, tokens.expiresAt.toString());
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
      localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    }
  }, [tokens]);

  // When the session is permanently expired (e.g. refresh token rejected by Cognito),
  // show a toast and clear remaining localStorage remnants so AuthInit doesn't re-hydrate
  // stale tokens on the next render cycle.
  // AuthGuard will then detect user === null and redirect to /signin.
  useEffect(() => {
    if (sessionExpired && !prevSessionExpired.current) {
      toast.error('Your session has expired. Please sign in again.');
    }
    prevSessionExpired.current = sessionExpired;

    if (sessionExpired && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
      localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    }
  }, [sessionExpired]);

  return null; // This component doesn't render anything
}
