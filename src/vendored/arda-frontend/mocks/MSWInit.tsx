'use client';

import { useEffect, useState } from 'react';

/**
 * MSWInit - Initializes Mock Service Worker for browser-based API mocking
 * This component should be placed high in the component tree in mock mode.
 * It initializes MSW only when NEXT_PUBLIC_MOCK_MODE is 'true'.
 */
export function MSWInit() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only initialize if mock mode is enabled
    if (process.env.NEXT_PUBLIC_MOCK_MODE !== 'true') {
      setIsReady(true);
      return;
    }

    async function initMSW() {
      try {
        console.log('[MSW] Initializing Mock Service Worker...');

        // Dynamic import to avoid SSR issues
        const { worker } = await import('./browser');

        await worker.start({
          onUnhandledRequest: 'bypass', // Don't warn for unhandled requests
          serviceWorker: {
            url: '/mockServiceWorker.js',
          },
        });

        console.log('[MSW] Mock Service Worker started successfully');
        setIsReady(true);
      } catch (error) {
        console.error('[MSW] Failed to initialize Mock Service Worker:', error);
        setIsReady(true); // Proceed anyway to avoid blocking the app
      }
    }

    initMSW();
  }, []);

  // Don't render anything, just initialize MSW
  // Return null to avoid any visual impact
  if (!isReady && process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    // Optionally show a loading indicator while MSW initializes
    return null;
  }

  return null;
}
