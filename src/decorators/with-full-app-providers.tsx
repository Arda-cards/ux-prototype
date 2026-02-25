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
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import rootReducer from '@frontend/store/rootReducer';
import { store as singletonStore } from '@frontend/store/store';
import { setUser, setTokens, setIsTokenValid } from '@frontend/store/slices/authSlice';
import { MockAuthProvider } from '@frontend/mocks/MockAuthProvider';
import {
  MOCK_USER,
  MOCK_TENANT_ID,
  generateMockTokens,
  createMockIdTokenPayload,
} from '@frontend/mocks/data/mockUser';
import { JWTProvider } from '@frontend/contexts/JWTContext';
import { SidebarVisibilityProvider } from '@frontend/contexts/SidebarVisibilityContext';
import { OrderQueueProvider } from '@frontend/contexts/OrderQueueContext';
import { NavigationContext, type NavigationContextValue } from '../shims/next-navigation';

/**
 * Build mock auth preloaded state for the Redux store.
 * This ensures that:
 * - Components using useAuth() (via Redux selectors) see a logged-in user
 * - AuthGuard / useAuthValidation don't redirect to /signin
 * - API calls via ardaClient.getAuthHeaders() find valid tokens
 */
function buildMockAuthState() {
  const tokens = generateMockTokens();
  const idPayload = createMockIdTokenPayload();
  return {
    user: MOCK_USER,
    userContext: {
      userId: MOCK_USER.id,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      tenantId: MOCK_TENANT_ID,
      role: 'Admin',
      author: `user/${MOCK_USER.id}`,
    },
    tokens: {
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + 86400000, // 24 hours
    },
    jwtPayload: idPayload as unknown as null, // shape compatible enough for mock
    isTokenValid: true,
    loading: false,
    error: null,
    isLoggingOut: false,
    isRefreshing: false,
    lastRefreshAttempt: null,
  };
}

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
  // If the story provides a custom auth state (e.g. to show error UI),
  // respect it instead of overwriting with the default mock auth.
  const authState = preloadedState?.auth ?? buildMockAuthState();
  const mergedState = {
    ...preloadedState,
    auth: authState,
  };

  return configureStore({
    reducer: rootReducer,
    preloadedState: mergedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: false,
  });
}

/**
 * Populate the singleton store (imported directly by ardaClient.ts)
 * with mock auth tokens. ardaClient.getAuthHeaders() reads tokens
 * from the singleton store, not from the React-provided store.
 */
function ensureSingletonStoreHasAuth() {
  const state = singletonStore.getState();
  if (!state.auth.tokens.accessToken) {
    const tokens = generateMockTokens();
    singletonStore.dispatch(setUser(MOCK_USER));
    singletonStore.dispatch(
      setTokens({
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + 86400000,
      }),
    );
    singletonStore.dispatch(setIsTokenValid(true));
  }
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

  // Ensure the singleton store also has auth tokens so that ardaClient.ts
  // API calls (which import the singleton directly) can read valid tokens.
  ensureSingletonStoreHasAuth();

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
