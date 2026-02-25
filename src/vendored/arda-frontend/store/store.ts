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
