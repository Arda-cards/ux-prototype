import { Middleware } from '@reduxjs/toolkit';

/**
 * Development-only logger middleware
 * Logs all actions and state changes to console
 * Only runs in development mode
 */
export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    const typedAction = action as { type: string };
    console.group(`[Redux] ${typedAction.type}`);
    console.log('Action:', action);
    const result = next(action);
    console.log('Next State:', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};
