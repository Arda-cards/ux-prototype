import { tokenRefreshMiddleware } from './tokenRefreshMiddleware';

// Mock the thunks module so we can detect dispatch calls
jest.mock('../thunks/authThunks', () => ({
  refreshTokensThunk: jest.fn(() => ({ type: 'auth/refreshTokens/pending' })),
}));

import { refreshTokensThunk } from '../thunks/authThunks';

describe('tokenRefreshMiddleware', () => {
  const next = jest.fn((action) => action);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes action through without dispatching refresh when no tokens', () => {
    const store = {
      getState: () => ({
        auth: {
          tokens: { accessToken: null, expiresAt: null },
          isRefreshing: false,
        },
      }),
      dispatch: jest.fn(),
    };

    const action = { type: 'some/action' };
    tokenRefreshMiddleware(store)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch refresh when tokens are fresh (far from expiry)', () => {
    const store = {
      getState: () => ({
        auth: {
          tokens: {
            accessToken: 'at',
            expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour from now
          },
          isRefreshing: false,
        },
      }),
      dispatch: jest.fn(),
    };

    tokenRefreshMiddleware(store)(next)({ type: 'any' });
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches refreshTokensThunk when token expires within 5 minutes', () => {
    const store = {
      getState: () => ({
        auth: {
          tokens: {
            accessToken: 'at',
            expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes from now (< 5 min)
          },
          isRefreshing: false,
        },
      }),
      dispatch: jest.fn(),
    };

    tokenRefreshMiddleware(store)(next)({ type: 'trigger' });

    expect(refreshTokensThunk).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('does not dispatch refresh when already refreshing', () => {
    const store = {
      getState: () => ({
        auth: {
          tokens: {
            accessToken: 'at',
            expiresAt: Date.now() + 1000, // about to expire
          },
          isRefreshing: true,
        },
      }),
      dispatch: jest.fn(),
    };

    tokenRefreshMiddleware(store)(next)({ type: 'any' });
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('always calls next with the action', () => {
    const store = {
      getState: () => ({
        auth: {
          tokens: { accessToken: 'at', expiresAt: Date.now() + 1000 },
          isRefreshing: false,
        },
      }),
      dispatch: jest.fn(),
    };

    const action = { type: 'test/passthrough' };
    const result = tokenRefreshMiddleware(store)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(result).toEqual(action);
  });
});
