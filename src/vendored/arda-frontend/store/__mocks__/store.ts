/**
 * Manual Jest mock for @/store/store.
 *
 * This mock is activated when a test file calls:
 *   jest.mock('@/store/store');
 *
 * It provides a configurable mock store that modules like ardaClient.ts and
 * tokenRefresh.ts (which import `store` directly) can use in tests.
 *
 * Usage in tests:
 *   jest.mock('@/store/store');
 *   import { __setMockState } from '@frontend/store/store';
 *
 *   beforeEach(() => {
 *     __setMockState({
 *       auth: {
 *         tokens: { accessToken: 'test-token', idToken: 'test-id', ... },
 *         ...
 *       }
 *     });
 *   });
 */

// Default auth state matching the shape of AuthState from authSlice
const defaultAuthState = {
  user: null,
  userContext: null,
  tokens: {
    accessToken: null,
    idToken: null,
    refreshToken: null,
    expiresAt: null,
  },
  jwtPayload: null,
  isTokenValid: false,
  loading: false,
  error: null,
  isLoggingOut: false,
  isRefreshing: false,
  lastRefreshAttempt: null,
};

const defaultState = {
  auth: { ...defaultAuthState },
  ui: {
    sidebarVisibility: { dashboard: true, items: true, orderQueue: true, receiving: true },
    theme: 'light' as const,
    performanceLoggingEnabled: false,
    preferences: {},
  },
  items: {},
  orderQueue: {},
  scan: {},
  receiving: {},
};

let mockState = { ...defaultState };

/**
 * Configure the mock store state for a test. Call in beforeEach.
 * Deep-merges with the default state.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function __setMockState(partialState: Record<string, any>) {
  mockState = {
    ...defaultState,
    ...partialState,
    auth: {
      ...defaultAuthState,
      ...(partialState.auth || {}),
      tokens: {
        ...defaultAuthState.tokens,
        ...(partialState.auth?.tokens || {}),
      },
    },
  };
}

/** Reset mock state to defaults. Call in afterEach if needed. */
export function __resetMockState() {
  mockState = { ...defaultState };
}

export const store = {
  getState: jest.fn(() => mockState),
  dispatch: jest.fn().mockResolvedValue({ type: 'mock/action' }),
  subscribe: jest.fn(() => jest.fn()),
  replaceReducer: jest.fn(),
  [Symbol.observable]: jest.fn(),
};

export const persistor = {
  persist: jest.fn(),
  purge: jest.fn().mockResolvedValue(undefined),
  flush: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
  getState: jest.fn(() => ({ bootstrapped: true })),
};

// Re-export types that importing modules may need
export type RootState = typeof mockState;
export type AppDispatch = typeof store.dispatch;
