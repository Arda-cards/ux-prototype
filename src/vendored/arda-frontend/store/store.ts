import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import rootReducer from './rootReducer';
import { loggerMiddleware } from './middleware/logger';
import { tokenRefreshMiddleware } from './middleware/tokenRefreshMiddleware';

// Note: Persistence is configured at the slice level in rootReducer.ts
// This allows fine-grained control over what gets persisted

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(loggerMiddleware)
      .concat(tokenRefreshMiddleware),
  devTools: process.env.NODE_ENV === 'development',
});

export const persistor = persistStore(store);

// Define RootState from rootReducer (not store.getState) to avoid circular reference
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// ---------------------------------------------------------------------------
// Test-only helpers (used via the manual mock at src/store/__mocks__/store.ts)
// These stubs exist solely to satisfy TypeScript imports in test files that
// call `jest.mock('@/store/store')` and then import these symbols. At runtime
// the Jest manual mock provides the real implementations; these stubs are
// never executed in production or test code.
// ---------------------------------------------------------------------------
/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function __setMockState(_partialState: Record<string, any>): void {
  throw new Error('__setMockState is only available in tests via jest.mock("@/store/store")');
}
/* istanbul ignore next */
export function __resetMockState(): void {
  throw new Error('__resetMockState is only available in tests via jest.mock("@/store/store")');
}
