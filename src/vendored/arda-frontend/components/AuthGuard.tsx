'use client';

import { ReactNode } from 'react';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useAuthValidation } from '@frontend/hooks/useAuthValidation';
import { Loader } from '@frontend/components/ui/loader';

interface AuthGuardProps {
  children: ReactNode;
  intervalMs?: number; // Interval in milliseconds to validate (default: 15 minutes)
  redirectTo?: string; // Route to redirect to if not authenticated
}

/**
 * AuthGuard component
 * 
 * Protects routes from unauthenticated access with improved UX:
 * - Increased validation interval from 5 to 15 minutes (reduces unnecessary checks)
 * - Handles logout transition state to prevent UI flashing
 * - Single responsibility: only handles authentication, redirects handled by useAuthValidation
 */
export function AuthGuard({
  children,
  intervalMs = 15 * 60 * 1000, // 15 minutes by default (increased from 5)
  redirectTo = '/signin',
}: AuthGuardProps) {
  const { user, loading, isLoggingOut } = useAuth();

  // Use the authentication validation hook (this handles redirects)
  useAuthValidation({ intervalMs, redirectTo });

  // Show loading while verifying authentication or logging out
  // The isLoggingOut check prevents flashing when session expires
  if (loading || isLoggingOut) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Loader size="default" aria-label="Verifying authentication" />
          <p className='text-gray-600 mt-4'>
            {isLoggingOut ? 'Signing out...' : 'Verifying authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // If no user and not loading, don't show anything (useAuthValidation will redirect)
  if (!user) {
    return null;
  }

  // If there's a user, show protected content
  return <>{children}</>;
}
