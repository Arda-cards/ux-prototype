import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import itemsReducer from './slices/itemsSlice';
import orderQueueReducer from './slices/orderQueueSlice';
import scanReducer from './slices/scanSlice';
import receivingReducer from './slices/receivingSlice';

// SSR-safe storage: lazy-require real localStorage only in the browser.
// A top-level `import storage from 'redux-persist/lib/storage'` runs at
// module evaluation time on the server and emits the "failed to create sync
// storage" warning even when the value is never used.
const createNoopStorage = () => ({
  getItem(_key: string) { return Promise.resolve(null); },
  setItem(_key: string, value: unknown) { return Promise.resolve(value); },
  removeItem(_key: string) { return Promise.resolve(); },
});

const persistStorage = typeof window !== 'undefined'
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? (require('redux-persist/lib/storage').default as typeof import('redux-persist/lib/storage').default)
  : createNoopStorage();

// Persist auth slice (tokens, user, userContext, jwtPayload)
const persistedAuthReducer = persistReducer(
  {
    key: 'auth',
    storage: persistStorage,
    whitelist: ['tokens', 'user', 'userContext', 'jwtPayload'],
    blacklist: ['loading', 'error', 'isLoggingOut', 'isRefreshing', 'lastRefreshAttempt', 'isTokenValid'],
  },
  authReducer
);

// Persist ui slice (only sidebarVisibility)
const persistedUiReducer = persistReducer(
  {
    key: 'ui',
    storage: persistStorage,
    whitelist: ['sidebarVisibility'],
    blacklist: ['theme', 'performanceLoggingEnabled', 'preferences'],
  },
  uiReducer
);

// Persist items slice (columnVisibility, drafts, activeTab)
const persistedItemsReducer = persistReducer(
  {
    key: 'items',
    storage: persistStorage,
    whitelist: ['columnVisibility', 'drafts', 'activeTab'],
    blacklist: ['items', 'itemCardsMap', 'selectedItems', 'selectedItem', 'itemToEdit', 'loading', 'loadingArdaItems', 'loadingCards', 'error', 'pagination', 'search', 'debouncedSearch', 'hasUnsavedChanges', 'maxItemsSeen'],
  },
  itemsReducer
);

// Persist scan slice (columnVisibility, selectedFilters)
const persistedScanReducer = persistReducer(
  {
    key: 'scan',
    storage: persistStorage,
    whitelist: ['columnVisibility', 'selectedFilters'],
    blacklist: ['scannedItems', 'selectedItems', 'currentView', 'scanning', 'cameraError', 'scanComplete', 'qrDetected', 'initialCardLoaded', 'activeCardId', 'itemToEdit', 'selectedItemForDetails', 'cardsCantAddCount', 'cardsCantReceiveCount', 'isAllSelected', 'isItemDetailsPanelOpen', 'isEditFormOpen', 'isClearItemsModalOpen', 'isCantAddCardsModalOpen', 'isCantReceiveCardsModalOpen'],
  },
  scanReducer
);

// Order queue and receiving slices are NOT persisted (ephemeral data)

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  ui: persistedUiReducer,
  items: persistedItemsReducer,
  orderQueue: orderQueueReducer,
  scan: persistedScanReducer,
  receiving: receivingReducer,
});

export default rootReducer;
