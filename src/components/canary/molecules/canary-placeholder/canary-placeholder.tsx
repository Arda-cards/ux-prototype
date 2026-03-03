import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the canary molecule placeholder. */
export interface CanaryMoleculePlaceholderStaticConfig {
  /** Title text displayed in the card header. */
  title?: string;
  /** Description text displayed below the title. */
  description?: string;
}

/** Combined props for CanaryMoleculePlaceholder. */
export interface CanaryMoleculePlaceholderProps
  extends CanaryMoleculePlaceholderStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function CanaryMoleculePlaceholder({
  title = 'Canary Molecule Placeholder',
  description = 'This is a placeholder molecule in the canary export path.',
  className,
  ...props
}: CanaryMoleculePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">🐤</span>
        <h3 className="text-sm font-semibold text-amber-800">{title}</h3>
      </div>
      <p className="text-sm text-amber-600">{description}</p>
    </div>
  );
}
