import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the canary organism placeholder. */
export interface CanaryOrganismPlaceholderStaticConfig {
  /** Title text displayed in the header. */
  title?: string;
  /** Description text displayed below the title. */
  description?: string;
  /** Number of placeholder rows to render. */
  rows?: number;
}

/** Combined props for CanaryOrganismPlaceholder. */
export interface CanaryOrganismPlaceholderProps
  extends CanaryOrganismPlaceholderStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function CanaryOrganismPlaceholder({
  title = 'Canary Organism Placeholder',
  description = 'This is a placeholder organism in the canary export path.',
  rows = 3,
  className,
  ...props
}: CanaryOrganismPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-dashed border-amber-400 bg-amber-50',
        className,
      )}
      {...props}
    >
      <div className="border-b border-amber-300 p-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🐤</span>
          <h2 className="text-base font-semibold text-amber-800">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-amber-600">{description}</p>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-8 rounded bg-amber-100" />
        ))}
      </div>
    </div>
  );
}
