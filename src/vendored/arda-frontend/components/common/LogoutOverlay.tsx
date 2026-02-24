'use client';

import { useAuth } from '@frontend/store/hooks/useAuth';
import { Loader } from '@frontend/components/ui/loader';

/**
 * LogoutOverlay component
 * 
 * Displays a smooth overlay during logout transition to prevent jarring UI changes.
 * This component addresses the "flashing screens" issue by providing a consistent
 * visual state during the logout process.
 */
export function LogoutOverlay() {
  const { isLoggingOut } = useAuth();

  if (!isLoggingOut) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Logging out"
    >
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border border-border">
        <Loader size="default" aria-label="Logging out" />
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Signing out...
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
}
