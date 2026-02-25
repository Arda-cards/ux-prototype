'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * MSWInit - Initializes Mock Service Worker for browser-based API mocking.
 *
 * Wraps the application tree so that children are NOT rendered until
 * `worker.start()` has resolved.  This prevents data-fetching hooks from
 * firing before MSW is intercepting, which causes flaky failures on slow
 * CI runners.
 *
 * In non-mock mode the component is a transparent pass-through (children
 * render immediately with zero overhead).
 */
export function MSWInit({ children }: { children: ReactNode }) {
  // In non-mock mode start ready immediately — zero overhead.
  const [isReady, setIsReady] = useState(
    process.env.NEXT_PUBLIC_MOCK_MODE !== 'true',
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE !== 'true') return;

    async function initMSW() {
      try {
        console.log('[MSW] Initializing Mock Service Worker...');

        const { worker } = await import('./browser');

        await worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: { url: '/mockServiceWorker.js' },
        });

        console.log('[MSW] Mock Service Worker started successfully');

        // Expose a flag so E2E tests can verify MSW readiness.
        if (typeof window !== 'undefined') {
          (window as unknown as Record<string, unknown>).__MSW_READY__ = true;
        }
      } catch (error) {
        console.error('[MSW] Failed to initialize Mock Service Worker:', error);
      }
      setIsReady(true);
    }

    initMSW();
  }, []);

  // Block rendering until MSW is ready so data fetches never race.
  if (!isReady) return null;
  return <>{children}</>;
}
