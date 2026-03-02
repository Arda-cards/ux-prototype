import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the stable organism placeholder. */
export interface StableOrganismPlaceholderStaticConfig {
  /** Title text displayed in the header. */
  title?: string;
  /** Description text displayed below the title. */
  description?: string;
  /** Number of placeholder rows to render. */
  rows?: number;
}

/** Combined props for StableOrganismPlaceholder. */
export interface StableOrganismPlaceholderProps
  extends StableOrganismPlaceholderStaticConfig,
    React.HTMLAttributes<HTMLDivElement> {}

export function StableOrganismPlaceholder({
  title = 'Stable Organism Placeholder',
  description = 'This is a placeholder organism in the stable export path.',
  rows = 3,
  className,
  ...props
}: StableOrganismPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-dashed border-blue-400 bg-blue-50',
        className,
      )}
      {...props}
    >
      <div className="border-b border-blue-300 p-4">
        <div className="flex items-center gap-2">
          <span className="text-base">&#9679;</span>
          <h2 className="text-base font-semibold text-blue-800">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-blue-600">{description}</p>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-8 rounded bg-blue-100" />
        ))}
      </div>
    </div>
  );
}
