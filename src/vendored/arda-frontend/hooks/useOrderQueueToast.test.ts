import { renderHook, act } from '@testing-library/react';
import { useOrderQueueToast } from './useOrderQueueToast';

describe('useOrderQueueToast', () => {
  it('initializes with isToastVisible: false', () => {
    const { result } = renderHook(() => useOrderQueueToast());
    expect(result.current.isToastVisible).toBe(false);
  });

  it('showToast sets isToastVisible to true', () => {
    const { result } = renderHook(() => useOrderQueueToast());
    act(() => {
      result.current.showToast();
    });
    expect(result.current.isToastVisible).toBe(true);
  });

  it('hideToast sets isToastVisible to false', () => {
    const { result } = renderHook(() => useOrderQueueToast());
    act(() => {
      result.current.showToast();
    });
    expect(result.current.isToastVisible).toBe(true);

    act(() => {
      result.current.hideToast();
    });
    expect(result.current.isToastVisible).toBe(false);
  });

  it('handleUndo hides toast', () => {
    const { result } = renderHook(() => useOrderQueueToast());
    act(() => {
      result.current.showToast();
    });
    expect(result.current.isToastVisible).toBe(true);

    act(() => {
      result.current.handleUndo();
    });
    expect(result.current.isToastVisible).toBe(false);
  });
});
