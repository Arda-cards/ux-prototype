/**
 * next/navigation shim for Storybook
 *
 * Provides the same export surface as next/navigation backed by a React context.
 * The context is configurable per-story via the withFullAppProviders decorator.
 */

import { createContext, useContext } from 'react';

export interface NavigationContextValue {
  pathname: string;
  searchParams: URLSearchParams;
  params: Record<string, string>;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
}

const defaultValue: NavigationContextValue = {
  pathname: '/',
  searchParams: new URLSearchParams(),
  params: {},
  push: (href: string) => console.log('[next/navigation shim] push:', href),
  replace: (href: string) => console.log('[next/navigation shim] replace:', href),
  back: () => console.log('[next/navigation shim] back'),
};

export const NavigationContext = createContext<NavigationContextValue>(defaultValue);

export function useRouter() {
  const ctx = useContext(NavigationContext);
  return {
    push: ctx.push,
    replace: ctx.replace,
    back: ctx.back,
    forward: () => console.log('[next/navigation shim] forward'),
    refresh: () => console.log('[next/navigation shim] refresh'),
    prefetch: (_href: string) => {
      /* no-op */
    },
  };
}

export function usePathname(): string {
  const ctx = useContext(NavigationContext);
  return ctx.pathname;
}

export function useSearchParams(): URLSearchParams {
  const ctx = useContext(NavigationContext);
  return ctx.searchParams;
}

export function useParams(): Record<string, string> {
  const ctx = useContext(NavigationContext);
  return ctx.params;
}

export function redirect(url: string): never {
  console.warn('[next/navigation shim] redirect called:', url);
  throw new Error(`NEXT_REDIRECT: ${url}`);
}

export function notFound(): never {
  console.warn('[next/navigation shim] notFound called');
  throw new Error('NEXT_NOT_FOUND');
}
