/**
 * Unit tests for src/hooks/useAuthErrorHandler.ts
 *
 * Covers: useAuthErrorHandler hook delegation to global handleAuthError
 */

import { renderHook } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGlobalHandleAuthError = jest.fn();
jest.mock('@/lib/authErrorHandler', () => ({
  handleAuthError: (...args: unknown[]) => mockGlobalHandleAuthError(...args),
}));

import { useAuthErrorHandler } from './useAuthErrorHandler';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAuthErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns handleAuthError function that delegates to global handleAuthError', () => {
    const { result } = renderHook(() => useAuthErrorHandler());
    const error = new Error('test error');

    result.current.handleAuthError(error);

    expect(mockGlobalHandleAuthError).toHaveBeenCalledTimes(1);
    expect(mockGlobalHandleAuthError).toHaveBeenCalledWith(error);
  });

  it('returned handleAuthError returns true for auth error', () => {
    mockGlobalHandleAuthError.mockReturnValue(true);
    const { result } = renderHook(() => useAuthErrorHandler());

    const returnValue = result.current.handleAuthError(new Error('auth error'));

    expect(returnValue).toBe(true);
  });

  it('returned handleAuthError returns false for non-auth error', () => {
    mockGlobalHandleAuthError.mockReturnValue(false);
    const { result } = renderHook(() => useAuthErrorHandler());

    const returnValue = result.current.handleAuthError(new Error('network error'));

    expect(returnValue).toBe(false);
  });
});
