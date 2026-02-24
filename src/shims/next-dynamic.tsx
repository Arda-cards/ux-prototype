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

type DynamicImportFn<P> = () => Promise<{ default: React.ComponentType<P> }>;

function dynamic<P extends Record<string, unknown> = Record<string, unknown>>(
  importFn: DynamicImportFn<P>,
  options?: DynamicOptions,
): React.ComponentType<P> {
  const LazyComponent = lazy(importFn);

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
