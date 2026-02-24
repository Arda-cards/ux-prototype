import { renderHook } from '@testing-library/react';

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const MockMutationObserver = jest.fn().mockImplementation((_callback: MutationCallback) => {
  return {
    observe: mockObserve,
    disconnect: mockDisconnect,
  };
});
Object.defineProperty(window, 'MutationObserver', { value: MockMutationObserver, writable: true });

import { useSidebarState } from './useSidebarState';

describe('useSidebarState', () => {
  let mockSetProperty: jest.Mock;

  beforeEach(() => {
    MockMutationObserver.mockClear();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockSetProperty = jest.fn();
    document.documentElement.style.setProperty = mockSetProperty;
    // Clear any existing sidebar elements
    document.body.innerHTML = '';
  });

  it('returns isCollapsed: false initially when no sidebar element', () => {
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.isCollapsed).toBe(false);
  });

  it('returns isCollapsed: false when sidebar has no data-collapsible attribute', () => {
    document.body.innerHTML = '<div data-slot="sidebar"></div>';
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.isCollapsed).toBe(false);
  });

  it('returns isCollapsed: true when data-collapsible="icon"', () => {
    document.body.innerHTML = '<div data-slot="sidebar" data-collapsible="icon"></div>';
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.isCollapsed).toBe(true);
  });

  it('sets CSS variable --header-margin-left to 3rem when collapsed', () => {
    document.body.innerHTML = '<div data-slot="sidebar" data-collapsible="icon"></div>';
    renderHook(() => useSidebarState());
    expect(mockSetProperty).toHaveBeenCalledWith('--header-margin-left', '3rem');
  });

  it('sets CSS variable --header-margin-left to 16rem when not collapsed', () => {
    document.body.innerHTML = '<div data-slot="sidebar"></div>';
    renderHook(() => useSidebarState());
    expect(mockSetProperty).toHaveBeenCalledWith('--header-margin-left', '16rem');
  });

  it('disconnects MutationObserver on unmount', () => {
    document.body.innerHTML = '<div data-slot="sidebar"></div>';
    const { unmount } = renderHook(() => useSidebarState());
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
