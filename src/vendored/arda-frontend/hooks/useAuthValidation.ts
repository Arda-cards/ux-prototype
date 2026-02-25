import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@frontend/store/hooks/useAuth';

interface UseAuthValidationOptions {
  intervalMs?: number; // Interval in milliseconds to validate (default: 15 minutes)
  redirectTo?: string; // Route to redirect to if not authenticated
}

/**
 * useAuthValidation hook
 * 
 * Single source of truth for authentication validation and redirects.
 * - Increased default interval from 5 minutes to 15 minutes (reduced from 24 hours)
 * - Uses router.replace() instead of router.push() to avoid history pollution
 * - Prevents redirect loops by checking current path
 * - Handles isLoggingOut state to prevent flashing during logout
 */
export const useAuthValidation = (options: UseAuthValidationOptions = {}) => {
  const { intervalMs = 15 * 60 * 1000, redirectTo = '/signin' } = options; // 15 minutes
  const { user, loading, checkAuth, ensureValidTokens, isLoggingOut } = useAuth();
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirectedRef = useRef(false); // Prevent multiple redirects

  useEffect(() => {
    // Function to validate authentication with token refresh only
    const validateAuth = async () => {
      try {
        console.log('[AUTH_VALIDATION] Running periodic validation');
        
        // Only ensure tokens are valid (this will refresh if needed with retry logic)
        const tokensValid = await ensureValidTokens();
        
        if (!tokensValid) {
          console.log('[AUTH_VALIDATION] Tokens invalid after validation');
          
          // Don't redirect if already redirecting or on signin page
          if (hasRedirectedRef.current) {
            console.log('[AUTH_VALIDATION] Already redirected, skipping');
            return;
          }
          
          hasRedirectedRef.current = true;
          console.log('[AUTH_VALIDATION] Redirecting to login');
          router.replace(redirectTo); // Use replace instead of push
          return;
        }

        // Tokens are valid, update auth state
        await checkAuth();
        console.log('[AUTH_VALIDATION] Validation successful');
      } catch (error) {
        console.error('[AUTH_VALIDATION] Auth validation failed:', error);
        
        // Don't redirect if already redirecting
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          router.replace(redirectTo);
        }
      }
    };

    // Only start interval if there's an authenticated user and not logging out
    if (user && !loading && !isLoggingOut) {
      // Set up interval for periodic validations (now 15 minutes)
      console.log('[AUTH_VALIDATION] Starting validation interval:', intervalMs, 'ms');
      intervalRef.current = setInterval(validateAuth, intervalMs);
    }

    // Cleanup: clear interval when component unmounts or when user/loading changes
    return () => {
      if (intervalRef.current) {
        console.log('[AUTH_VALIDATION] Clearing validation interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, loading, isLoggingOut, checkAuth, ensureValidTokens, router, redirectTo, intervalMs]);

  // Additional effect to check when user gets deauthenticated
  useEffect(() => {
    // Reset redirect flag when component mounts or user changes
    hasRedirectedRef.current = false;
    
    // Don't redirect if we're logging out (LogoutOverlay handles the transition)
    if (isLoggingOut) {
      console.log('[AUTH_VALIDATION] Logging out, skipping redirect');
      return;
    }
    
    // Don't redirect if we're already on the signin page (prevent loops)
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === redirectTo || currentPath.startsWith(`${redirectTo}/`)) {
        console.log('[AUTH_VALIDATION] Already on signin page, skipping redirect');
        return;
      }
    }
    
    // If there's no user and not loading, redirect to login
    if (!loading && !user && !hasRedirectedRef.current) {
      console.log('[AUTH_VALIDATION] No user detected, redirecting');
      hasRedirectedRef.current = true;
      // Use replace instead of push to avoid adding to history
      router.replace(redirectTo);
    }
  }, [user, loading, isLoggingOut, router, redirectTo]);

  // Function to manually stop validation
  const stopValidation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Function to restart validation
  const restartValidation = () => {
    stopValidation();
    if (user && !loading) {
      intervalRef.current = setInterval(async () => {
        try {
          const tokensValid = await ensureValidTokens();
          if (!tokensValid) {
            router.push(redirectTo);
            return;
          }
          await checkAuth();
        } catch (error) {
          console.error('[AUTH_VALIDATION] Auth validation failed:', error);
          router.push(redirectTo);
        }
      }, intervalMs);
    }
  };

  return {
    stopValidation,
    restartValidation,
    isValidationActive: intervalRef.current !== null,
  };
};
