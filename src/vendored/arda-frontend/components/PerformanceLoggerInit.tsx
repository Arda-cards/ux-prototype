'use client';

import { useEffect } from 'react';
import { perfLogger } from '@frontend/utils/performanceLogger';

/**
 * Component to initialize performance logger globally
 * This ensures perfLogger is available in browser console
 */
export function PerformanceLoggerInit() {
  useEffect(() => {
    // Ensure perfLogger is available globally
    if (typeof window !== 'undefined') {
      (window as unknown as { perfLogger: typeof perfLogger }).perfLogger =
        perfLogger;
      
      // Log availability in development
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '✅ Performance Logger initialized. Use perfLogger.enable() in console to start logging.'
        );
      }
    }
  }, []);

  return null;
}

