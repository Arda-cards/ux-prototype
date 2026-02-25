import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SidebarVisibilityProvider, useSidebarVisibility } from './SidebarVisibilityContext';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn(),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
);

describe('SidebarVisibilityContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // 1
  it('useSidebarVisibility throws outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useSidebarVisibility());
    }).toThrow('useSidebarVisibility must be used within a SidebarVisibilityProvider');
    consoleSpy.mockRestore();
  });

  // 2
  it('initializes with all items visible', () => {
    const { result } = renderHook(() => useSidebarVisibility(), { wrapper });

    expect(result.current.visibility).toEqual({
      dashboard: true,
      items: true,
      orderQueue: true,
      receiving: true,
    });
  });

  // 3
  it('loads from localStorage on mount', async () => {
    const stored = { dashboard: false, items: true, orderQueue: false, receiving: true };
    localStorageMock.setItem('sidebarVisibility', JSON.stringify(stored));

    const { result } = renderHook(() => useSidebarVisibility(), { wrapper });

    await waitFor(() => {
      expect(result.current.visibility).toEqual(stored);
    });
  });

  // 4
  it('uses defaults when localStorage is corrupt (invalid JSON)', () => {
    localStorageMock.setItem('sidebarVisibility', 'not-valid-json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useSidebarVisibility(), { wrapper });

    // Should fall back to defaults
    expect(result.current.visibility).toEqual({
      dashboard: true,
      items: true,
      orderQueue: true,
      receiving: true,
    });
    consoleSpy.mockRestore();
  });

  // 5
  it('saves to localStorage on change', async () => {
    const { result } = renderHook(() => useSidebarVisibility(), { wrapper });

    act(() => {
      result.current.toggleItem('dashboard');
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sidebarVisibility',
        JSON.stringify({
          dashboard: false,
          items: true,
          orderQueue: true,
          receiving: true,
        })
      );
    });
  });

  // 6
  it('toggleItem toggles true to false', () => {
    const { result } = renderHook(() => useSidebarVisibility(), { wrapper });

    expect(result.current.visibility.dashboard).toBe(true);

    act(() => {
      result.current.toggleItem('dashboard');
    });

    expect(result.current.visibility.dashboard).toBe(false);
  });

  // 7
  it('toggleItem toggles false to true', () => {
    const { result } = renderHook(() => useSidebarVisibility(), { wrapper });

    // First toggle to false
    act(() => {
      result.current.toggleItem('items');
    });
    expect(result.current.visibility.items).toBe(false);

    // Toggle back to true
    act(() => {
      result.current.toggleItem('items');
    });
    expect(result.current.visibility.items).toBe(true);
  });

  // 8
  it('setItemVisibility sets specific value', () => {
    const { result } = renderHook(() => useSidebarVisibility(), { wrapper });

    act(() => {
      result.current.setItemVisibility('orderQueue', false);
    });

    expect(result.current.visibility.orderQueue).toBe(false);

    act(() => {
      result.current.setItemVisibility('orderQueue', true);
    });

    expect(result.current.visibility.orderQueue).toBe(true);
  });
});
