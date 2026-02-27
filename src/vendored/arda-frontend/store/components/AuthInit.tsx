'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { checkAuthThunk } from '../thunks/authThunks';
import { setTokens } from '../slices/authSlice';
import { selectTokens, selectSessionExpired } from '../selectors/authSelectors';

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

  useEffect(() => {
    // On mount, check if we have tokens in localStorage and sync to Redux
    // This handles the case where user refreshes page and tokens are in localStorage
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const idToken = localStorage.getItem('idToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // If we have tokens in localStorage but not in Redux, sync them
      if (accessToken && idToken && refreshToken && !tokens.accessToken) {
        let expiresAt: number | null = null;
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          expiresAt = payload.exp ? payload.exp * 1000 : null;
        } catch {
          console.warn('[AUTH_INIT] Failed to decode token expiration');
        }

        dispatch(setTokens({
          accessToken,
          idToken,
          refreshToken,
          expiresAt,
        }));

        dispatch(checkAuthThunk());
      }
      // If no tokens exist in either localStorage or Redux, the user is unauthenticated.
      // useAuthValidation will handle the redirect — no need to trigger a loading cycle here.
    }
  }, [dispatch]); // Only run on mount

  // Sync Redux tokens to localStorage when they change (for backward compatibility during migration)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (tokens.accessToken && tokens.idToken && tokens.refreshToken) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('idToken', tokens.idToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      if (tokens.expiresAt) {
        localStorage.setItem('tokenExpiresAt', tokens.expiresAt.toString());
      }
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('userEmail');
    }
  }, [tokens]);

  // When the session is permanently expired (e.g. refresh token rejected by Cognito),
  // Redux has already cleared tokens and user. Clear remaining localStorage remnants
  // so AuthInit doesn't re-hydrate stale tokens on the next render cycle.
  // AuthGuard will then detect user === null and redirect to /signin.
  useEffect(() => {
    if (sessionExpired && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('userEmail');
    }
  }, [sessionExpired]);

  return null; // This component doesn't render anything
}
