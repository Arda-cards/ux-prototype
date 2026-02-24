import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { shouldRefreshTokens } from '@frontend/lib/tokenRefresh';

/**
 * useActivityTracking hook
 * 
 * Tracks user activity and proactively refreshes tokens when:
 * 1. User is actively interacting with the app
 * 2. Tokens are approaching expiration
 * 
 * This prevents unexpected logouts during active use and improves UX.
 * 
 * Activity events tracked: mousemove, keydown, click, scroll, touchstart
 * 
 * @param inactivityThreshold - Time in ms after which user is considered inactive (default: 5 minutes)
 */
export function useActivityTracking(inactivityThreshold = 5 * 60 * 1000) {
  const { user, ensureValidTokens } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const activityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRefreshedRef = useRef(false);

  // Update last activity timestamp
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Check if user is active and refresh tokens if needed
  const checkActivityAndRefresh = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const isActive = timeSinceActivity < inactivityThreshold;

    // If user is active and tokens need refresh
    if (isActive && shouldRefreshTokens()) {
      // Only refresh once per activity period to avoid excessive calls
      if (!hasRefreshedRef.current) {
        console.log('[ACTIVITY_TRACKER] User is active, refreshing tokens proactively');
        hasRefreshedRef.current = true;
        
        try {
          await ensureValidTokens();
          console.log('[ACTIVITY_TRACKER] Proactive token refresh successful');
        } catch (error) {
          console.error('[ACTIVITY_TRACKER] Proactive token refresh failed:', error);
        }
        
        // Reset flag after 2 minutes to allow another refresh if needed
        setTimeout(() => {
          hasRefreshedRef.current = false;
        }, 2 * 60 * 1000);
      }
    }
  }, [user, ensureValidTokens, inactivityThreshold]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    // Activity events to track
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Throttle activity handler to avoid excessive calls
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        handleActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000); // Throttle to once per second
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledHandler, { passive: true });
    });

    // Check activity and refresh tokens every minute
    activityCheckIntervalRef.current = setInterval(checkActivityAndRefresh, 60 * 1000);

    // Initial activity check
    checkActivityAndRefresh();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledHandler);
      });

      if (activityCheckIntervalRef.current) {
        clearInterval(activityCheckIntervalRef.current);
        activityCheckIntervalRef.current = null;
      }

      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [user, handleActivity, checkActivityAndRefresh]);

  // Return the last activity timestamp for external use if needed
  return {
    lastActivity: lastActivityRef.current,
    isActive: Date.now() - lastActivityRef.current < inactivityThreshold,
  };
}
