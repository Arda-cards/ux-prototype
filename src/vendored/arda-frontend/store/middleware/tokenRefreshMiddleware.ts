import { Middleware } from '@reduxjs/toolkit';
import { refreshTokensThunk } from '../thunks/authThunks';

/**
 * Token Refresh Middleware
 * Automatically refreshes tokens when they're about to expire (within 5 minutes)
 * Runs on every action to check token expiration
 */

// Minimum wait between refresh attempts after a transient failure
const REFRESH_COOLDOWN_MS = 60 * 1000; // 60 seconds

export const tokenRefreshMiddleware: Middleware =
  (store) => (next) => (action) => {
    // Pass the action through first so reducers run and update isRefreshing
    // before we decide whether to dispatch a refresh. Checking state BEFORE
    // next(action) means isRefreshing is still false when the
    // refreshTokens/pending action itself comes through the middleware,
    // which would cause an infinite dispatch loop.
    const result = next(action);

    const state = store.getState();
    const { tokens, isRefreshing, refreshFailedAt, sessionExpired } = state.auth;

    // Session is permanently expired (e.g. NotAuthorizedException from Cognito).
    // Tokens have already been cleared; AuthGuard will redirect to /signin.
    // Do not attempt any further refreshes.
    if (sessionExpired) return result;

    // Only check if we have tokens and aren't already refreshing
    if (tokens.accessToken && tokens.expiresAt && !isRefreshing) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes buffer

      // Cooldown: after a transient failure, wait before retrying.
      // This prevents flooding Cognito (and the network) with 400s on every action.
      if (refreshFailedAt && now - refreshFailedAt < REFRESH_COOLDOWN_MS) return result;

      // Check if token expires within 5 minutes
      if (tokens.expiresAt - now < fiveMinutes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (store.dispatch as any)(refreshTokensThunk());
      }
    }

    return result;
  };
