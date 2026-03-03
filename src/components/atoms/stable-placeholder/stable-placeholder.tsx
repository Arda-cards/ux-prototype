import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the stable atom placeholder. */
export interface StableAtomPlaceholderStaticConfig {
  /** Label text displayed inside the placeholder. */
  label?: string;
}

/** Combined props for StableAtomPlaceholder. */
export interface StableAtomPlaceholderProps
  extends StableAtomPlaceholderStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function StableAtomPlaceholder({
  label = 'Stable Atom Placeholder',
  className,
  ...props
}: StableAtomPlaceholderProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-dashed border-blue-400 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700',
        className,
      )}
      {...props}
    >
      <span className="text-base">&#9679;</span>
      {label}
    </div>
  );
}
