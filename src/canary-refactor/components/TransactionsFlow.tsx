'use client';

/**
 * TransactionsFlow — Mini router for the Canary Refactor transactions flow.
 *
 * Wraps OrderQueuePage, ReceivingPage, and ItemsPage with a NavigationContext
 * that actually responds to sidebar clicks, allowing navigation between pages
 * within a single Storybook story.
 */

import { useState, useCallback, useMemo } from 'react';
import { NavigationContext, type NavigationContextValue } from '../../shims/next-navigation';
import OrderQueuePage from './OrderQueuePage';
import ReceivingPage from './ReceivingPage';
import ItemsPage from './ItemsPage';

interface TransactionsFlowProps {
  /** The initial pathname to render (e.g. '/order-queue', '/receiving', '/items') */
  startingPage?: string;
}

export default function TransactionsFlow({
  startingPage = '/order-queue',
}: TransactionsFlowProps) {
  const [pathname, setPathname] = useState(startingPage);
  const [searchParams] = useState(() => new URLSearchParams());

  const push = useCallback((href: string) => {
    console.log('[TransactionsFlow] navigating to:', href);
    setPathname(href);
  }, []);

  const replace = useCallback((href: string) => {
    console.log('[TransactionsFlow] replacing with:', href);
    setPathname(href);
  }, []);

  const back = useCallback(() => {
    console.log('[TransactionsFlow] back (no-op in flow)');
  }, []);

  const navigationValue: NavigationContextValue = useMemo(
    () => ({
      pathname,
      searchParams,
      params: {},
      push,
      replace,
      back,
    }),
    [pathname, searchParams, push, replace, back],
  );

  return (
    <NavigationContext.Provider value={navigationValue}>
      {pathname === '/order-queue' && <OrderQueuePage />}
      {pathname === '/receiving' && <ReceivingPage />}
      {pathname === '/items' && <ItemsPage />}
      {!['/order-queue', '/receiving', '/items'].includes(pathname) && (
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
          <p>Page not found: <code>{pathname}</code></p>
          <p>This flow supports: /order-queue, /receiving, /items</p>
        </div>
      )}
    </NavigationContext.Provider>
  );
}
