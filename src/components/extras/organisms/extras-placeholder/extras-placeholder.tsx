import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the extras organism placeholder. */
export interface ExtrasOrganismPlaceholderStaticConfig {
  /** Title text displayed in the header. */
  title?: string;
  /** Description text displayed below the title. */
  description?: string;
  /** Number of placeholder rows to render. */
  rows?: number;
}

/** Combined props for ExtrasOrganismPlaceholder. */
export interface ExtrasOrganismPlaceholderProps
  extends ExtrasOrganismPlaceholderStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function ExtrasOrganismPlaceholder({
  title = 'Extras Organism Placeholder',
  description = 'This is a placeholder organism in the extras export path.',
  rows = 3,
  className,
  ...props
}: ExtrasOrganismPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-dashed border-violet-400 bg-violet-50',
        className,
      )}
      {...props}
    >
      <div className="border-b border-violet-300 p-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🧩</span>
          <h2 className="text-base font-semibold text-violet-800">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-violet-600">{description}</p>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-8 rounded bg-violet-100" />
        ))}
      </div>
    </div>
  );
}
