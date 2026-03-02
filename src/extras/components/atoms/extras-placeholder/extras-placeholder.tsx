import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the extras atom placeholder. */
export interface ExtrasAtomPlaceholderStaticConfig {
  /** Label text displayed inside the placeholder. */
  label?: string;
}

/** Combined props for ExtrasAtomPlaceholder. */
export interface ExtrasAtomPlaceholderProps
  extends ExtrasAtomPlaceholderStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function ExtrasAtomPlaceholder({
  label = 'Extras Atom Placeholder',
  className,
  ...props
}: ExtrasAtomPlaceholderProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-dashed border-violet-400 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700',
        className,
      )}
      {...props}
    >
      <span className="text-base">🧩</span>
      {label}
    </div>
  );
}
