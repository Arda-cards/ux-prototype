/**
 * Global authentication error handler
 * Automatically redirects to login when authentication errors are detected
 * This ensures consistent behavior across the entire application
 */

import { isAuthenticationError } from './utils';

let redirectHandler: ((path: string) => void) | null = null;

/**
 * Initialize the global auth error handler with a redirect function
 * Should be called once during app initialization
 */
export function initAuthErrorHandler(redirectFn: (path: string) => void) {
  redirectHandler = redirectFn;
}

/**
 * Handle authentication errors globally
 * Clears tokens and redirects to login if it's an auth error
 */
export function handleAuthError(error: unknown): boolean {
  if (!isAuthenticationError(error)) {
    return false;
  }

  // In mock/dev mode, suppress token clearing and redirect to avoid
  // breaking the mock auth flow (tokens are managed by MockAuthProvider).
  const isMockMode = process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION'
    && process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'STAGE';
  if (isMockMode) {
    console.warn('[MOCK AUTH] Suppressing auth error redirect in mock mode');
    return true;
  }

  // Don't redirect if we're already on the signin page
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath === '/signin' || currentPath.startsWith('/signin/')) {
      // Just clear tokens, don't redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('userEmail');
      return true;
    }
  }

  // Clear tokens if it's an auth error
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('userEmail');
  }

  // Redirect to login
  if (redirectHandler && typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const searchParams = window.location.search;
    const fullPath = searchParams ? `${currentPath}${searchParams}` : currentPath;
    redirectHandler(`/signin?next=${encodeURIComponent(fullPath)}`);
    return true;
  }

  // Fallback: use window.location if handler not initialized
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const searchParams = window.location.search;
    const fullPath = searchParams ? `${currentPath}${searchParams}` : currentPath;
    window.location.href = `/signin?next=${encodeURIComponent(fullPath)}`;
    return true;
  }

  return false;
}

/**
 * Wrap a promise to automatically handle auth errors
 */
export async function withAuthErrorHandling<T>(
  promise: Promise<T>
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (handleAuthError(error)) {
      // Return a rejected promise that won't be caught by normal error handlers
      // The redirect has already happened
      throw new Error('Authentication required');
    }
    throw error;
  }
}
