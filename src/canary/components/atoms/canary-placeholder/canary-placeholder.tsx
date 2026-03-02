import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the canary atom placeholder. */
export interface CanaryAtomPlaceholderStaticConfig {
  /** Label text displayed inside the placeholder. */
  label?: string;
}

/** Combined props for CanaryAtomPlaceholder. */
export interface CanaryAtomPlaceholderProps
  extends CanaryAtomPlaceholderStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function CanaryAtomPlaceholder({
  label = 'Canary Atom Placeholder',
  className,
  ...props
}: CanaryAtomPlaceholderProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-dashed border-amber-400 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700',
        className,
      )}
      {...props}
    >
      <span className="text-base">🐤</span>
      {label}
    </div>
  );
}
