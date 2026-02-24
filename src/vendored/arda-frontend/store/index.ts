// Store exports
export { store, persistor } from './store';
export type { RootState, AppDispatch } from './store';

// Hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Redux Provider
export { ReduxProvider } from './ReduxProvider';

// Auth selectors & actions (re-exported individually to avoid name clashes)
export * from './selectors/authSelectors';
export * from './selectors/uiSelectors';

// Slice actions — import directly from individual slice files to avoid name collisions:
//   import { setError } from '@frontend/store/slices/authSlice'
//   import { setError } from '@frontend/store/slices/itemsSlice'
//   etc.

// Thunks
export * from './thunks/authThunks';
