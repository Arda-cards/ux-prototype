import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebouncedCallback } from './use-debounced-callback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes the callback once after the delay, with the last arguments', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 250));

    result.current('a');
    result.current('b');
    result.current('c');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(fn).toHaveBeenCalledExactlyOnceWith('c');
  });

  it('resets the timer on each call', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 250));

    result.current('a');
    vi.advanceTimersByTime(200);
    result.current('b');
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledExactlyOnceWith('b');
  });

  it('keeps a stable identity across renders but invokes the latest callback', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ fn }) => useDebouncedCallback(fn, 250), {
      initialProps: { fn: first },
    });
    const initial = result.current;

    rerender({ fn: second });
    expect(result.current).toBe(initial);

    result.current('x');
    vi.advanceTimersByTime(250);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith('x');
  });

  it('cancel() drops the pending invocation', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 250));

    result.current('a');
    result.current.cancel();
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('cancels the pending invocation on unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 250));

    result.current('a');
    unmount();
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('a call after the delay elapses starts a fresh cycle', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 250));

    result.current('a');
    vi.advanceTimersByTime(250);
    result.current('b');
    vi.advanceTimersByTime(250);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'a');
    expect(fn).toHaveBeenNthCalledWith(2, 'b');
  });
});
