import '@testing-library/jest-dom/vitest';

// Radix UI's PopperContent (used by Tooltip, DropdownMenu, etc.) calls ResizeObserver
// which is not available in jsdom. Provide a no-op mock so tests can render these components.
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// The useIsMobile hook (used by ArdaSidebar / SidebarProvider) calls window.matchMedia,
// which is not implemented in jsdom. Provide a minimal stub so sidebar tests can mount.
if (typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
