import { renderHook } from '@testing-library/react';

const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    dispatchEvent: jest.fn(),
  })),
});

import { useIsMobile } from './use-mobile';

function mockNavigator(platform: string, userAgent: string) {
  Object.defineProperty(window.navigator, 'platform', {
    value: platform,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
}

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    (window.matchMedia as jest.Mock).mockClear();
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
  });

  it('returns false for desktop with wide screen (MacIntel)', () => {
    mockNavigator('MacIntel', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns false for Windows desktop (Win32)', () => {
    mockNavigator('Win32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns false for Linux desktop (Linux x86_64)', () => {
    mockNavigator('Linux x86_64', 'Mozilla/5.0 (X11; Linux x86_64)');
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for iPhone', () => {
    mockNavigator('iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)');
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns true for Android phone', () => {
    // Android devices report platform as empty or 'armv7l' in some browsers;
    // use an empty string so it doesn't match the desktop regex
    mockNavigator('', 'Mozilla/5.0 (Linux; Android 13; Pixel 7)');
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns true for iPad', () => {
    mockNavigator('iPad', 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)');
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false for desktop even with narrow window', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    mockNavigator('MacIntel', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('listens for matchMedia changes', () => {
    mockNavigator('MacIntel', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    renderHook(() => useIsMobile());
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('cleans up event listeners on unmount', () => {
    mockNavigator('MacIntel', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
