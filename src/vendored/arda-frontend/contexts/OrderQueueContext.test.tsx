import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { OrderQueueProvider, useOrderQueue } from './OrderQueueContext';

const mockUseAuth = jest.fn();
const mockUseJWT = jest.fn();
jest.mock('@/store/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));
jest.mock('@/store/hooks/useJWT', () => ({ useJWT: () => mockUseJWT() }));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OrderQueueProvider>{children}</OrderQueueProvider>
);

function setupAuthMocks(opts: { user?: object | null; token?: string | null; isTokenValid?: boolean } = {}) {
  mockUseAuth.mockReturnValue({ user: opts.user ?? null });
  mockUseJWT.mockReturnValue({
    token: opts.token ?? null,
    isTokenValid: opts.isTokenValid ?? false,
  });
}

function makeFetchResponse(data: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('OrderQueueContext', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    mockFetch.mockReset();
    setupAuthMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // 1
  it('useOrderQueue throws outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useOrderQueue());
    }).toThrow('useOrderQueue must be used within an OrderQueueProvider');
    consoleSpy.mockRestore();
  });

  // 2
  it('initializes with readyToOrderCount: 0, isLoading: false', () => {
    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    expect(result.current.readyToOrderCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  // 3
  it('updateOrderCounts sets readyToOrderCount', () => {
    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    act(() => {
      result.current.updateOrderCounts({ readyToOrder: 5 });
    });

    expect(result.current.readyToOrderCount).toBe(5);
  });

  // 4
  it('fetchOrderQueueData does not fetch when token missing/invalid', async () => {
    setupAuthMocks({ token: null, isTokenValid: false });

    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    await act(async () => {
      await result.current.fetchOrderQueueData();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  // 5
  it('fetchOrderQueueData fetches from 3 endpoints in parallel', async () => {
    setupAuthMocks({ user: { id: '1' }, token: 'valid-token', isTokenValid: true });

    mockFetch.mockImplementation(() => {
      return makeFetchResponse({ data: { results: [] } });
    });

    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    await act(async () => {
      await result.current.fetchOrderQueueData();
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/arda/kanban/kanban-card/details/requested',
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/arda/kanban/kanban-card/details/in-process',
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/arda/kanban/kanban-card/details/requesting',
      expect.any(Object)
    );
  });

  // 6
  it('fetchOrderQueueData calculates readyToOrderCount correctly with unique eIds logic', async () => {
    setupAuthMocks({ user: { id: '1' }, token: 'valid-token', isTokenValid: true });

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('requested')) {
        return makeFetchResponse({
          data: {
            results: [
              { payload: { eId: 'eId-1' } },
              { payload: { eId: 'eId-2' } },
            ],
          },
        });
      }
      if (url.includes('in-process')) {
        return makeFetchResponse({
          data: {
            results: [{ payload: { eId: 'eId-3' } }],
          },
        });
      }
      if (url.includes('requesting')) {
        return makeFetchResponse({
          data: {
            results: [
              { payload: { eId: 'eId-2' } },
              { payload: { eId: 'eId-3' } },
            ],
          },
        });
      }
      return makeFetchResponse({ data: { results: [] } });
    });

    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    await act(async () => {
      await result.current.fetchOrderQueueData();
    });

    expect(result.current.readyToOrderCount).toBe(2);
  });

  // 7
  it('fetchOrderQueueData throws on non-OK response', async () => {
    setupAuthMocks({ user: { id: '1' }, token: 'valid-token', isTokenValid: true });

    mockFetch.mockImplementation(() => {
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    await act(async () => {
      await result.current.fetchOrderQueueData();
    });

    expect(result.current.readyToOrderCount).toBe(0);
  });

  // 8
  it('fetchOrderQueueData preserves existing count on error', async () => {
    setupAuthMocks({ user: { id: '1' }, token: 'valid-token', isTokenValid: true });

    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    act(() => {
      result.current.updateOrderCounts({ readyToOrder: 10 });
    });
    expect(result.current.readyToOrderCount).toBe(10);

    mockFetch.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await result.current.fetchOrderQueueData();
    });

    expect(result.current.readyToOrderCount).toBe(10);
  });

  // 9
  it('fetchOrderQueueData sets isLoading true/false', async () => {
    setupAuthMocks({ user: { id: '1' }, token: 'valid-token', isTokenValid: true });

    const resolveFetches: Array<(value: unknown) => void> = [];
    mockFetch.mockImplementation(() => {
      return new Promise((resolve) => { resolveFetches.push(resolve); });
    });

    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    expect(result.current.isLoading).toBe(false);

    let fetchPromise: Promise<void>;
    act(() => {
      fetchPromise = result.current.fetchOrderQueueData();
    });

    // isLoading should be true while fetching
    expect(result.current.isLoading).toBe(true);

    // Resolve all 3 fetch calls
    await act(async () => {
      resolveFetches.forEach(resolve => resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      }));
      await fetchPromise!;
    });

    expect(result.current.isLoading).toBe(false);
  });

  // 10
  it('refreshOrderQueueData calls fetch when token valid', async () => {
    setupAuthMocks({ user: { id: '1' }, token: 'valid-token', isTokenValid: true });

    mockFetch.mockImplementation(() => makeFetchResponse({ data: { results: [] } }));

    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    await act(async () => {
      await result.current.refreshOrderQueueData();
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  // 11
  it('refreshOrderQueueData does nothing when token invalid', async () => {
    setupAuthMocks({ user: { id: '1' }, token: 'some-token', isTokenValid: false });

    const { result } = renderHook(() => useOrderQueue(), { wrapper });

    await act(async () => {
      await result.current.refreshOrderQueueData();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  // 12
  it('effect resets readyToOrderCount to 0 when user is null', async () => {
    setupAuthMocks({ user: { id: '1' }, token: 'valid-token', isTokenValid: true });

    mockFetch.mockImplementation(() => makeFetchResponse({ data: { results: [] } }));

    const { result, rerender } = renderHook(() => useOrderQueue(), { wrapper });

    act(() => {
      result.current.updateOrderCounts({ readyToOrder: 5 });
    });
    expect(result.current.readyToOrderCount).toBe(5);

    // Simulate user becoming null
    setupAuthMocks({ user: null, token: null, isTokenValid: false });
    rerender();

    await waitFor(() => {
      expect(result.current.readyToOrderCount).toBe(0);
    });
  });

  // 13
  it('effect debounces initial fetch with 300ms timer', async () => {
    jest.useFakeTimers();
    setupAuthMocks({ user: { id: '1' }, token: 'valid-token', isTokenValid: true });

    mockFetch.mockImplementation(() => makeFetchResponse({ data: { results: [] } }));

    renderHook(() => useOrderQueue(), { wrapper });

    // Fetch should not have been called yet (debounced)
    expect(mockFetch).not.toHaveBeenCalled();

    // Advance past the 300ms debounce - use async version to flush microtasks
    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });

    // Now the fetch should have been called
    expect(mockFetch).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
