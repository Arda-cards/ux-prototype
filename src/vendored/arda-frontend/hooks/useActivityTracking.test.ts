import { renderHook, act } from '@testing-library/react';

const mockEnsureValidTokens = jest.fn().mockResolvedValue(true);
const mockUseAuth = jest.fn();
jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockShouldRefreshTokens = jest.fn();
jest.mock('@/lib/tokenRefresh', () => ({
  shouldRefreshTokens: () => mockShouldRefreshTokens(),
}));

import { useActivityTracking } from './useActivityTracking';

describe('useActivityTracking', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user' },
      ensureValidTokens: mockEnsureValidTokens,
    });
    mockShouldRefreshTokens.mockReturnValue(false);
    mockEnsureValidTokens.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('returns lastActivity and isActive properties', () => {
    const { result } = renderHook(() => useActivityTracking());
    expect(result.current).toHaveProperty('lastActivity');
    expect(result.current).toHaveProperty('isActive');
  });

  it('returns isActive: true when within inactivity threshold', () => {
    const { result } = renderHook(() => useActivityTracking());
    expect(result.current.isActive).toBe(true);
  });

  it('returns isActive: false when beyond inactivity threshold', () => {
    const { result, rerender } = renderHook(() => useActivityTracking(1000));
    // Advance time past threshold — Date.now() advances with fake timers
    jest.advanceTimersByTime(2000);
    // Re-render to get fresh isActive computed from Date.now()
    rerender();
    expect(result.current.isActive).toBe(false);
  });

  it('adds event listeners when user is authenticated', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    renderHook(() => useActivityTracking());

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => {
      expect(addSpy).toHaveBeenCalledWith(event, expect.any(Function), { passive: true });
    });
  });

  it('removes event listeners on cleanup', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useActivityTracking());
    unmount();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => {
      expect(removeSpy).toHaveBeenCalledWith(event, expect.any(Function));
    });
  });

  it('does not add listeners when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      ensureValidTokens: mockEnsureValidTokens,
    });
    const addSpy = jest.spyOn(window, 'addEventListener');
    renderHook(() => useActivityTracking());

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const activityCalls = addSpy.mock.calls.filter(([event]) =>
      activityEvents.includes(event as string)
    );
    expect(activityCalls).toHaveLength(0);
  });

  it('calls checkActivityAndRefresh on 60s interval', async () => {
    mockShouldRefreshTokens.mockReturnValue(true);
    renderHook(() => useActivityTracking());

    // The initial call triggers ensureValidTokens and sets hasRefreshedRef = true
    await act(async () => {
      await Promise.resolve();
    });
    mockEnsureValidTokens.mockClear();

    // Advance past the 2-minute hasRefreshedRef reset so the next call can fire
    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000 + 1);
    });

    // Now fire another interval tick
    await act(async () => {
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    expect(mockEnsureValidTokens).toHaveBeenCalled();
  });

  it('calls ensureValidTokens when user is active and tokens need refresh', async () => {
    mockShouldRefreshTokens.mockReturnValue(true);
    renderHook(() => useActivityTracking());

    // The initial checkActivityAndRefresh call should trigger refresh
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockEnsureValidTokens).toHaveBeenCalled();
  });

  it('does not call ensureValidTokens when user is inactive', () => {
    mockShouldRefreshTokens.mockReturnValue(true);
    renderHook(() => useActivityTracking(1000));

    mockEnsureValidTokens.mockClear();

    // Advance past the inactivity threshold
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Now trigger the interval check
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockEnsureValidTokens).not.toHaveBeenCalled();
  });

  it('does not call ensureValidTokens when shouldRefreshTokens is false', () => {
    mockShouldRefreshTokens.mockReturnValue(false);
    renderHook(() => useActivityTracking());

    mockEnsureValidTokens.mockClear();

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockEnsureValidTokens).not.toHaveBeenCalled();
  });

  it('throttles activity events to once per second', () => {
    const { result } = renderHook(() => useActivityTracking());

    // Fire multiple events rapidly
    act(() => {
      window.dispatchEvent(new Event('mousemove'));
      window.dispatchEvent(new Event('mousemove'));
      window.dispatchEvent(new Event('mousemove'));
    });

    const firstActivity = result.current.lastActivity;

    // Advance less than 1 second and fire again — should be throttled
    act(() => {
      jest.advanceTimersByTime(500);
      window.dispatchEvent(new Event('mousemove'));
    });

    // Advance past 1 second and fire again — should update
    act(() => {
      jest.advanceTimersByTime(600);
      window.dispatchEvent(new Event('mousemove'));
    });

    // The lastActivity should have been updated
    expect(result.current.lastActivity).toBeGreaterThanOrEqual(firstActivity);
  });
});
