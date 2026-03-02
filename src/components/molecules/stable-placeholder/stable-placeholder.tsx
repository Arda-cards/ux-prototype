import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the stable molecule placeholder. */
export interface StableMoleculePlaceholderStaticConfig {
  /** Title text displayed in the card header. */
  title?: string;
  /** Description text displayed below the title. */
  description?: string;
}

/** Combined props for StableMoleculePlaceholder. */
export interface StableMoleculePlaceholderProps
  extends StableMoleculePlaceholderStaticConfig,
    React.HTMLAttributes<HTMLDivElement> {}

export function StableMoleculePlaceholder({
  title = 'Stable Molecule Placeholder',
  description = 'This is a placeholder molecule in the stable export path.',
  className,
  ...props
}: StableMoleculePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-dashed border-blue-400 bg-blue-50 p-4',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">&#9679;</span>
        <h3 className="text-sm font-semibold text-blue-800">{title}</h3>
      </div>
      <p className="text-sm text-blue-600">{description}</p>
    </div>
  );
}
