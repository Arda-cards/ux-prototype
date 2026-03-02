import React from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for the extras molecule placeholder. */
export interface ExtrasMoleculePlaceholderStaticConfig {
  /** Title text displayed in the card header. */
  title?: string;
  /** Description text displayed below the title. */
  description?: string;
}

/** Combined props for ExtrasMoleculePlaceholder. */
export interface ExtrasMoleculePlaceholderProps
  extends ExtrasMoleculePlaceholderStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function ExtrasMoleculePlaceholder({
  title = 'Extras Molecule Placeholder',
  description = 'This is a placeholder molecule in the extras export path.',
  className,
  ...props
}: ExtrasMoleculePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-dashed border-violet-400 bg-violet-50 p-4',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">🧩</span>
        <h3 className="text-sm font-semibold text-violet-800">{title}</h3>
      </div>
      <p className="text-sm text-violet-600">{description}</p>
    </div>
  );
}
