'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { ReactNode } from 'react';
import { AuthInit } from './components/AuthInit';
import { Loader } from '@frontend/components/ui/loader';

interface ReduxProviderProps {
  children: ReactNode;
}

/**
 * Redux Provider component for Next.js
 * Wraps the app with Redux store and redux-persist
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <Loader size="default" aria-label="Loading application" />
          </div>
        }
        persistor={persistor}
      >
        <AuthInit />
        {children}
      </PersistGate>
    </Provider>
  );
}
