import { Middleware } from '@reduxjs/toolkit';
import { refreshTokensThunk } from '../thunks/authThunks';

/**
 * Token Refresh Middleware
 * Automatically refreshes tokens when they're about to expire (within 5 minutes)
 * Runs on every action to check token expiration
 */
export const tokenRefreshMiddleware: Middleware =
  (store) => (next) => (action) => {
    // Pass the action through first so reducers run and update isRefreshing
    // before we decide whether to dispatch a refresh. Checking state BEFORE
    // next(action) means isRefreshing is still false when the
    // refreshTokens/pending action itself comes through the middleware,
    // which would cause an infinite dispatch loop.
    const result = next(action);

    const state = store.getState();
    const { tokens, isRefreshing } = state.auth;

    // Only check if we have tokens and aren't already refreshing
    if (tokens.accessToken && tokens.expiresAt && !isRefreshing) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes buffer

      // Check if token expires within 5 minutes
      if (tokens.expiresAt - now < fiveMinutes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (store.dispatch as any)(refreshTokensThunk());
      }
    }

    return result;
  };
