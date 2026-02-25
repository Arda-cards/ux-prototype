/**
 * Unit tests for src/hooks/useAuthValidation.ts
 *
 * Covers: periodic token validation, redirect logic, stop/restart
 */

import { renderHook, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

const mockCheckAuth = jest.fn().mockResolvedValue(undefined);
const mockEnsureValidTokens = jest.fn().mockResolvedValue(true);

const mockUseAuth = jest.fn();
jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { useAuthValidation } from './useAuthValidation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultAuthReturn(overrides = {}) {
  return {
    user: { id: '1', email: 'test@test.com', name: 'Test' },
    loading: false,
    checkAuth: mockCheckAuth,
    ensureValidTokens: mockEnsureValidTokens,
    isLoggingOut: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAuthValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockCheckAuth.mockResolvedValue(undefined);
    mockEnsureValidTokens.mockResolvedValue(true);
    mockUseAuth.mockReturnValue(defaultAuthReturn());

    // Default: not on signin page
    window.history.pushState({}, '', '/dashboard');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('starts periodic interval when user authenticated and not loading', async () => {
    renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    // Advance past one interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for the async validateAuth to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockEnsureValidTokens).toHaveBeenCalled();
  });

  it('does not start interval when isLoggingOut is true', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn({ isLoggingOut: true }));

    renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockEnsureValidTokens).not.toHaveBeenCalled();
  });

  it('redirects to /signin when ensureValidTokens returns false', async () => {
    mockEnsureValidTokens.mockResolvedValue(false);

    renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockReplace).toHaveBeenCalledWith('/signin');
  });

  it('calls checkAuth after successful token validation', async () => {
    mockEnsureValidTokens.mockResolvedValue(true);

    renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCheckAuth).toHaveBeenCalled();
  });

  it('redirects when no user and loading is false', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn({ user: null }));

    renderHook(() => useAuthValidation());

    expect(mockReplace).toHaveBeenCalledWith('/signin');
  });

  it('does NOT redirect when already on /signin page', () => {
    window.history.pushState({}, '', '/signin');
    mockUseAuth.mockReturnValue(defaultAuthReturn({ user: null }));

    renderHook(() => useAuthValidation());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('uses router.replace (not router.push) for redirect', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn({ user: null }));

    renderHook(() => useAuthValidation());

    expect(mockReplace).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('prevents double redirects via hasRedirectedRef', async () => {
    mockEnsureValidTokens.mockResolvedValue(false);

    renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    // First interval tick
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Second interval tick
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // replace should only be called once (from the first tick)
    // The second effect also resets hasRedirectedRef on user change, but
    // since user hasn't changed, it should still be true
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('respects custom intervalMs and redirectTo options', async () => {
    mockEnsureValidTokens.mockResolvedValue(false);

    renderHook(() =>
      useAuthValidation({ intervalMs: 5000, redirectTo: '/login' })
    );

    // Should not fire at 1s
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockEnsureValidTokens).not.toHaveBeenCalled();

    // Should fire at 5s
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockEnsureValidTokens).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('stopValidation clears interval', async () => {
    const { result } = renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    // Stop validation before any interval fires
    act(() => {
      result.current.stopValidation();
    });

    mockEnsureValidTokens.mockClear();

    // Advance time - no calls should happen since we stopped
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockEnsureValidTokens).not.toHaveBeenCalled();
  });

  it('restartValidation creates new interval', async () => {
    const { result } = renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    // Stop validation
    act(() => {
      result.current.stopValidation();
    });

    mockEnsureValidTokens.mockClear();

    // Restart validation
    act(() => {
      result.current.restartValidation();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockEnsureValidTokens).toHaveBeenCalled();
  });

  it('interval cleaned up on unmount', async () => {
    const { unmount } = renderHook(() =>
      useAuthValidation({ intervalMs: 1000 })
    );

    unmount();
    mockEnsureValidTokens.mockClear();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockEnsureValidTokens).not.toHaveBeenCalled();
  });

  // ── Additional branch-coverage tests ─────────────────────────────────────

  it('redirects via router.replace when validateAuth throws (catch branch)', async () => {
    // ensureValidTokens throws an error
    mockEnsureValidTokens.mockRejectedValue(new Error('Token fetch failed'));

    renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockReplace).toHaveBeenCalledWith('/signin');
  });

  it('restartValidation: redirects with router.push when tokens invalid', async () => {
    mockEnsureValidTokens.mockResolvedValue(false);

    const { result } = renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    // Stop first, then restart
    act(() => {
      result.current.stopValidation();
    });

    mockEnsureValidTokens.mockClear();

    act(() => {
      result.current.restartValidation();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('restartValidation: redirects with router.push when interval callback throws', async () => {
    mockEnsureValidTokens.mockRejectedValue(new Error('Error in restarted interval'));

    const { result } = renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    act(() => {
      result.current.stopValidation();
    });

    mockEnsureValidTokens.mockClear();

    act(() => {
      result.current.restartValidation();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('does not redirect when already on a path starting with redirectTo', () => {
    window.history.pushState({}, '', '/signin/sso');
    mockUseAuth.mockReturnValue(defaultAuthReturn({ user: null }));

    renderHook(() => useAuthValidation());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not start interval when user is loading', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn({ loading: true }));

    renderHook(() => useAuthValidation({ intervalMs: 1000 }));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockEnsureValidTokens).not.toHaveBeenCalled();
  });

  it('skips redirect when isLoggingOut even with no user', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn({ user: null, isLoggingOut: true }));

    renderHook(() => useAuthValidation());

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
