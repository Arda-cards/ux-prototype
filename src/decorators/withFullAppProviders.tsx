/**
 * withFullAppProviders — Storybook decorator that wraps Full App stories
 * with the complete provider stack from the vendored arda-frontend-app.
 *
 * Applied conditionally: only stories whose title starts with 'Full App'
 * are wrapped. All other stories pass through unchanged.
 */

import React from 'react';
import type { Decorator } from '@storybook/react-vite';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import rootReducer from '@frontend/store/rootReducer';
import { MockAuthProvider } from '@frontend/mocks/MockAuthProvider';
import { JWTProvider } from '@frontend/contexts/JWTContext';
import { SidebarVisibilityProvider } from '@frontend/contexts/SidebarVisibilityContext';
import { OrderQueueProvider } from '@frontend/contexts/OrderQueueContext';
import { NavigationContext, type NavigationContextValue } from '../shims/next-navigation';

/**
 * Creates a fresh Redux store for each story.
 * Uses the same rootReducer as the app but without triggering
 * redux-persist rehydration from localStorage (the persisted
 * slices use a no-op storage when window is undefined, but in
 * Storybook window IS defined, so they rehydrate from localStorage).
 *
 * To avoid cross-story contamination, we create a brand-new store
 * instance for each story render.
 */
function createStoryStore(preloadedState?: Record<string, unknown>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: false,
  });
}

export const withFullAppProviders: Decorator = (Story, context) => {
  // Only wrap Full App stories
  if (!context.title.startsWith('Full App')) {
    return <Story />;
  }

  const pathname = (context.args.pathname as string) ?? '/';
  const searchParamsInit = (context.args.searchParams as Record<string, string>) ?? {};
  const params = (context.args.params as Record<string, string>) ?? {};

  const navigationValue: NavigationContextValue = {
    pathname,
    searchParams: new URLSearchParams(searchParamsInit),
    params,
    push: (href: string) => {
      console.log('[Storybook] router.push:', href);
    },
    replace: (href: string) => {
      console.log('[Storybook] router.replace:', href);
    },
    back: () => {
      console.log('[Storybook] router.back');
    },
  };

  const store = createStoryStore(context.args.initialState as Record<string, unknown> | undefined);

  return (
    <NavigationContext.Provider value={navigationValue}>
      <ReduxProvider store={store}>
        <MockAuthProvider>
          <JWTProvider>
            <SidebarVisibilityProvider>
              <OrderQueueProvider>
                <Story />
              </OrderQueueProvider>
            </SidebarVisibilityProvider>
          </JWTProvider>
        </MockAuthProvider>
      </ReduxProvider>
    </NavigationContext.Provider>
  );
};
