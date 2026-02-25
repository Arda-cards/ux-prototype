/**
 * next/dynamic shim for Storybook
 *
 * Implements a simplified version of next/dynamic using React.lazy.
 * Supports the loading option for fallback UI.
 */

import React, { Suspense, lazy } from 'react';

interface DynamicOptions {
  loading?: () => React.ReactNode;
  ssr?: boolean;
}

type DynamicImportFn<P> =
  | (() => Promise<{ default: React.ComponentType<P> }>)
  | (() => Promise<React.ComponentType<P>>);

function dynamic<P extends Record<string, unknown> = Record<string, unknown>>(
  importFn: DynamicImportFn<P>,
  options?: DynamicOptions,
): React.ComponentType<P> {
  // Next.js dynamic() supports both `() => import('./Foo')` (returns { default })
  // and `() => import('./Foo').then(mod => mod.Bar)` (returns bare component).
  // React.lazy requires { default }, so wrap bare components.
  const wrappedImport = () =>
    (importFn as () => Promise<unknown>)().then((mod) => {
      if (mod && typeof mod === 'object' && 'default' in (mod as Record<string, unknown>)) {
        return mod as { default: React.ComponentType<P> };
      }
      // Bare component — wrap in { default }
      return { default: mod as React.ComponentType<P> };
    });
  const LazyComponent = lazy(wrappedImport);

  const DynamicComponent = (props: P) => {
    const fallback = options?.loading ? options.loading() : null;
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  DynamicComponent.displayName = 'DynamicComponent';

  return DynamicComponent;
}

export default dynamic;
