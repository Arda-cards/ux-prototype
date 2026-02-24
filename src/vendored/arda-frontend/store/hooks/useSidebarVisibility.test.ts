import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '@frontend/test-utils/test-store';
import { useSidebarVisibility } from './useSidebarVisibility';

function wrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store }, children);
  };
}

describe('useSidebarVisibility', () => {
  it('returns default visibility', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSidebarVisibility(), { wrapper: wrapper(store) });
    expect(result.current.visibility).toEqual({
      dashboard: true,
      items: true,
      orderQueue: true,
      receiving: true,
    });
  });

  it('toggleItem toggles a sidebar item', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSidebarVisibility(), { wrapper: wrapper(store) });

    act(() => {
      result.current.toggleItem('items');
    });

    expect(result.current.visibility.items).toBe(false);

    act(() => {
      result.current.toggleItem('items');
    });

    expect(result.current.visibility.items).toBe(true);
  });

  it('setItemVisibility sets visibility directly', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSidebarVisibility(), { wrapper: wrapper(store) });

    act(() => {
      result.current.setItemVisibility('orderQueue', false);
    });

    expect(result.current.visibility.orderQueue).toBe(false);
  });
});
