'use client';

import { useCallback } from 'react';
import { handleAuthError as globalHandleAuthError } from '@frontend/lib/authErrorHandler';

/**
 * Hook to handle authentication errors consistently across the app
 * Uses the global auth error handler to ensure consistent behavior
 * and prevent double redirects
 */
export function useAuthErrorHandler() {
  const handleAuthError = useCallback(
    (error: unknown): boolean => {
      // Use the global handler which already handles redirects and token clearing
      return globalHandleAuthError(error);
    },
    []
  );

  return { handleAuthError };
}

