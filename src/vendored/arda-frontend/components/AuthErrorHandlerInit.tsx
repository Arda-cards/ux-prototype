'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initAuthErrorHandler, handleAuthError } from '@frontend/lib/authErrorHandler';
import { isAuthenticationError } from '@frontend/lib/utils';
import { useActivityTracking } from '@frontend/hooks/useActivityTracking';

/**
 * Component that initializes the global authentication error handler
 * and sets up unhandled error listeners to catch auth errors anywhere in the app
 * Also initializes activity-based session tracking for proactive token refresh
 */
export function AuthErrorHandlerInit() {
  const router = useRouter();
  
  // Initialize activity-based session tracking
  useActivityTracking();

  useEffect(() => {
    // Initialize the global auth error handler with router.push
    initAuthErrorHandler((path: string) => {
      router.push(path);
    });

    // Set up global unhandled error listener for auth errors
    const handleUnhandledError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      if (error && isAuthenticationError(error)) {
        event.preventDefault(); // Prevent default error logging
        handleAuthError(error);
      }
    };

    // Set up unhandled promise rejection listener for auth errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error && isAuthenticationError(error)) {
        event.preventDefault(); // Prevent default error logging
        handleAuthError(error);
      }
    };

    // Add event listeners
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router]);

  return null; // This component doesn't render anything
}
