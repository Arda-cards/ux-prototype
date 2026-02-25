// Token refresh utility for client-side use
// MIGRATED TO REDUX: Now uses Redux store instead of localStorage
// This file is kept for backward compatibility but delegates to Redux

import { store } from '@frontend/store/store';
import { selectAccessToken, selectRefreshToken, selectTokens } from '@frontend/store/selectors/authSelectors';
import { refreshTokensThunk } from '@frontend/store/thunks/authThunks';
import { debugLog, debugError, debugWarn } from '@frontend/lib/utils';

interface TokenInfo {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Refreshes tokens using Redux store
 * MIGRATED TO REDUX: Now uses Redux thunk instead of direct Cognito calls
 *
 * @param currentRefreshToken - Optional refresh token (will use Redux store if not provided)
 * @param userEmail - Optional user email (will use Redux store if not provided)
 * @param retryCount - Number of retry attempts (default: 3) - Note: Retry logic handled by thunk
 * @returns Promise resolving to token info or null if refresh fails
 */
export async function refreshTokens(
  currentRefreshToken?: string,
  userEmail?: string,
  _retryCount: number = 3
): Promise<TokenInfo | null> {
  debugLog('[TOKEN_REFRESH] Refreshing tokens via Redux');

  const state = store.getState();
  const refreshToken = currentRefreshToken || selectRefreshToken(state);

  if (!refreshToken) {
    debugLog('[TOKEN_REFRESH] No refresh token available in Redux store');
    return null;
  }

  const result = await store.dispatch(refreshTokensThunk());

  if (refreshTokensThunk.fulfilled.match(result)) {
    const tokens = selectTokens(store.getState());
    debugLog('[TOKEN_REFRESH] ✓ Tokens refreshed successfully via Redux');
    debugLog('[TOKEN_REFRESH] New token expires at:', tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : 'unknown');

    return {
      accessToken: tokens.accessToken || '',
      idToken: tokens.idToken || '',
      refreshToken: tokens.refreshToken || '',
      expiresAt: tokens.expiresAt || 0,
    };
  }

  debugError('[TOKEN_REFRESH] Token refresh failed via Redux');
  return null;
}

/**
 * Checks if tokens need refresh (5 minutes before expiration)
 * MIGRATED TO REDUX: Now reads from Redux store
 * Optimized for 60-minute token expiration in Cognito
 * Provides adequate buffer to prevent token expiry during active use
 *
 * @param accessToken - Optional access token (will use Redux store if not provided)
 */
export function shouldRefreshTokens(accessToken?: string): boolean {
  let token = accessToken;

  if (!token) {
    const state = store.getState();
    token = selectAccessToken(state) || undefined;
  }

  // Fallback to localStorage for backward compatibility
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken') || undefined;
  }

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return expiresAt - now < fiveMinutes;
  } catch {
    return true; // If we can't decode, assume refresh needed
  }
}

/**
 * Ensures tokens are valid, refreshing if necessary with graceful degradation
 * MIGRATED TO REDUX: Now uses Redux store for token management
 *
 * Graceful degradation: If refresh fails but token is still technically valid,
 * we keep the user logged in rather than forcing immediate logout
 *
 * @param accessToken - Optional access token (will use Redux store if not provided)
 * @param refreshToken - Optional refresh token (will use Redux store if not provided)
 * @param userEmail - Optional user email (will use Redux store if not provided)
 */
export async function ensureValidTokens(
  accessToken?: string,
  refreshToken?: string,
  userEmail?: string
): Promise<boolean> {
  let token = accessToken;

  if (!token) {
    const state = store.getState();
    token = selectAccessToken(state) || undefined;
  }

  // Fallback to localStorage for backward compatibility
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken') || undefined;
  }

  if (!token) {
    debugLog('[ENSURE_VALID_TOKENS] No access token available');
    return false;
  }

  if (shouldRefreshTokens(token)) {
    debugLog('[ENSURE_VALID_TOKENS] Token needs refresh, attempting via Redux...');
    const newTokens = await refreshTokens(refreshToken, userEmail);

    if (newTokens) {
      debugLog('[ENSURE_VALID_TOKENS] ✓ Token refresh successful');
      return true;
    }

    // Graceful degradation: Check if current token is still technically valid
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();

      if (expiresAt > now) {
        debugWarn(
          '[ENSURE_VALID_TOKENS] Refresh failed but token still valid for',
          Math.round((expiresAt - now) / 1000),
          'seconds - keeping user logged in'
        );
        return true;
      }
    } catch (error) {
      debugError('[ENSURE_VALID_TOKENS] Error checking token validity:', error);
    }

    debugError('[ENSURE_VALID_TOKENS] Token expired and refresh failed');
    return false;
  }

  return true;
}
