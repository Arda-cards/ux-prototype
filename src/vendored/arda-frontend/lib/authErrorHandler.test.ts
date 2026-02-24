/**
 * Unit tests for src/lib/authErrorHandler.ts
 *
 * Covers: initAuthErrorHandler, handleAuthError, withAuthErrorHandling.
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('./utils', () => ({
  isAuthenticationError: jest.fn(),
}));

import { isAuthenticationError } from './utils';
import {
  initAuthErrorHandler,
  handleAuthError,
  withAuthErrorHandling,
} from './authErrorHandler';

const mockIsAuthenticationError = isAuthenticationError as jest.Mock;

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const removeItemMock = jest.fn();
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: removeItemMock,
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ---------------------------------------------------------------------------
// window.location helpers
// jsdom's window.location is non-configurable, so we use history.pushState
// to change the URL, which updates pathname and search as read by source code.
// For the href setter fallback test we suppress jsdom's navigation error and
// verify the return value instead.
// ---------------------------------------------------------------------------

function navigateTo(path: string) {
  window.history.pushState({}, '', path);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('authErrorHandler', () => {
  let redirectHandler: jest.Mock;
  const savedDeployEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to PRODUCTION so existing tests exercise the real code paths.
    // Mock-mode tests override this in their own beforeEach/afterEach.
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
    redirectHandler = jest.fn();
    initAuthErrorHandler(redirectHandler);
    mockIsAuthenticationError.mockReturnValue(false);
    navigateTo('/dashboard');
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (savedDeployEnv === undefined) {
      delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
    } else {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = savedDeployEnv;
    }
  });

  // -----------------------------------------------------------------------
  // initAuthErrorHandler
  // -----------------------------------------------------------------------

  describe('initAuthErrorHandler', () => {
    it('sets the redirect handler function', () => {
      const customHandler = jest.fn();
      initAuthErrorHandler(customHandler);
      mockIsAuthenticationError.mockReturnValue(true);
      handleAuthError(new Error('auth error'));
      expect(customHandler).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // handleAuthError
  // -----------------------------------------------------------------------

  describe('handleAuthError', () => {
    it('returns false for non-auth error', () => {
      mockIsAuthenticationError.mockReturnValue(false);
      const result = handleAuthError(new Error('some error'));
      expect(result).toBe(false);
    });

    it('returns true and clears localStorage tokens for auth error when on signin page', () => {
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/signin');
      const result = handleAuthError(new Error('auth'));
      expect(result).toBe(true);
      expect(removeItemMock).toHaveBeenCalledWith('accessToken');
      expect(removeItemMock).toHaveBeenCalledWith('refreshToken');
      expect(removeItemMock).toHaveBeenCalledWith('idToken');
      expect(removeItemMock).toHaveBeenCalledWith('userEmail');
    });

    it('does not redirect when already on /signin', () => {
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/signin');
      handleAuthError(new Error('auth'));
      expect(redirectHandler).not.toHaveBeenCalled();
    });

    it('does not redirect when already on /signin/... sub-path', () => {
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/signin/callback');
      handleAuthError(new Error('auth'));
      expect(redirectHandler).not.toHaveBeenCalled();
    });

    it('clears all four localStorage keys on auth error', () => {
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/items');
      handleAuthError(new Error('auth'));
      expect(removeItemMock).toHaveBeenCalledWith('accessToken');
      expect(removeItemMock).toHaveBeenCalledWith('refreshToken');
      expect(removeItemMock).toHaveBeenCalledWith('idToken');
      expect(removeItemMock).toHaveBeenCalledWith('userEmail');
    });

    it('calls redirect handler with /signin?next=<encoded-current-path> when handler registered', () => {
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/items');
      handleAuthError(new Error('auth'));
      expect(redirectHandler).toHaveBeenCalledWith(
        `/signin?next=${encodeURIComponent('/items')}`
      );
    });

    it('includes search params in redirect URL', () => {
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/items?page=2&sort=name');
      handleAuthError(new Error('auth'));
      expect(redirectHandler).toHaveBeenCalledWith(
        `/signin?next=${encodeURIComponent('/items?page=2&sort=name')}`
      );
    });

    it('falls back to window.location.href redirect when no handler registered', () => {
      navigateTo('/dashboard');
      // Re-import module fresh to clear the handler (no initAuthErrorHandler called)
      jest.resetModules();
      jest.doMock('./utils', () => ({
        isAuthenticationError: jest.fn().mockReturnValue(true),
      }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const freshModule = require('./authErrorHandler');
      // In jsdom, setting window.location.href triggers a "not implemented"
      // navigation error but the function still returns true indicating it
      // attempted the redirect.
      const result = freshModule.handleAuthError(new Error('auth'));
      expect(result).toBe(true);
    });

    // Note: "returns false when window is undefined (server-side)" is not testable
    // in jsdom because window is non-configurable on the global scope. That code
    // path (typeof window === 'undefined') only runs on actual server-side Node.js
    // environments and is covered by integration / SSR tests, not unit tests.
  });

  // -----------------------------------------------------------------------
  // handleAuthError – mock/dev mode suppression
  // -----------------------------------------------------------------------

  describe('handleAuthError – mock mode', () => {
    const originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
      } else {
        process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
      }
    });

    it('suppresses token clearing and redirect when NEXT_PUBLIC_DEPLOY_ENV is undefined (mock mode)', () => {
      delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
      mockIsAuthenticationError.mockReturnValue(true);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = handleAuthError(new Error('auth'));

      expect(result).toBe(true);
      expect(removeItemMock).not.toHaveBeenCalled();
      expect(redirectHandler).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith('[MOCK AUTH] Suppressing auth error redirect in mock mode');
    });

    it('suppresses token clearing and redirect when NEXT_PUBLIC_DEPLOY_ENV is "LOCAL"', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'LOCAL';
      mockIsAuthenticationError.mockReturnValue(true);
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = handleAuthError(new Error('auth'));

      expect(result).toBe(true);
      expect(removeItemMock).not.toHaveBeenCalled();
      expect(redirectHandler).not.toHaveBeenCalled();
    });

    it('does NOT suppress when NEXT_PUBLIC_DEPLOY_ENV is "PRODUCTION"', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/items');

      handleAuthError(new Error('auth'));

      expect(removeItemMock).toHaveBeenCalledWith('accessToken');
      expect(redirectHandler).toHaveBeenCalled();
    });

    it('does NOT suppress when NEXT_PUBLIC_DEPLOY_ENV is "STAGE"', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGE';
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/items');

      handleAuthError(new Error('auth'));

      expect(removeItemMock).toHaveBeenCalledWith('accessToken');
      expect(redirectHandler).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // withAuthErrorHandling
  // -----------------------------------------------------------------------

  describe('withAuthErrorHandling', () => {
    it('resolves with promise result when no error', async () => {
      const result = await withAuthErrorHandling(Promise.resolve('success'));
      expect(result).toBe('success');
    });

    it('calls handleAuthError and throws "Authentication required" for auth error', async () => {
      mockIsAuthenticationError.mockReturnValue(true);
      navigateTo('/items');

      await expect(
        withAuthErrorHandling(Promise.reject(new Error('auth error')))
      ).rejects.toThrow('Authentication required');
    });

    it('re-throws original error for non-auth error', async () => {
      mockIsAuthenticationError.mockReturnValue(false);
      const originalError = new Error('network error');

      await expect(
        withAuthErrorHandling(Promise.reject(originalError))
      ).rejects.toThrow('network error');
    });
  });
});
