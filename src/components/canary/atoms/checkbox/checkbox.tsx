'use client';

import * as React from 'react';
import { Checkbox as PrimitiveCheckbox } from '@/components/canary/primitives/checkbox';
import { cn } from '@/types/canary/utilities/utils';

type PrimitiveProps = React.ComponentProps<typeof PrimitiveCheckbox>;

export interface CheckboxProps extends Omit<PrimitiveProps, 'children'> {
  /** Optional label rendered next to the checkbox. */
  label?: React.ReactNode;
  /** Optional helper/description rendered beneath the label. */
  description?: React.ReactNode;
  /** Render a `*` after the label in destructive color. */
  required?: boolean;
  /** Extra classes for the outer wrapper when label/description are rendered. */
  wrapperClassName?: string;
}

/**
 * Arda Checkbox — wraps the canary primitive (vanilla shadcn) with the Figma
 * spec (shadow-sm, optional label + description, required asterisk). Supports
 * the same controlled API as the primitive (`checked`, `onCheckedChange`),
 * including `'indeterminate'`.
 *
 * Use the bare form for grid cells and other tight surfaces. Pass `label` /
 * `description` to render the form layout (8px gap; 6px between label and
 * description; muted-foreground description).
 *
 * Per the canary architecture rule, this atom is the only place to apply Arda
 * styling — never modify `canary/primitives/checkbox.tsx`.
 */
function Checkbox({
  className,
  label,
  description,
  required,
  wrapperClassName,
  id,
  ...props
}: CheckboxProps) {
  // Stable id for label association when one isn't supplied.
  const reactId = React.useId();
  const checkboxId = id ?? `checkbox-${reactId}`;

  const checkbox = (
    <PrimitiveCheckbox
      id={checkboxId}
      className={cn('shadow-sm [&_svg]:size-4', className)}
      {...props}
    />
  );

  if (!label && !description) return checkbox;

  return (
    <div className={cn('flex items-start gap-2', wrapperClassName)}>
      {checkbox}
      <div className="flex flex-col items-start gap-1.5">
        {label && (
          <label
            htmlFor={checkboxId}
            className="flex items-start text-sm font-medium leading-none text-foreground cursor-pointer select-none"
          >
            {label}
            {required && (
              <span className="pl-0.5 text-sm font-medium leading-none text-destructive">*</span>
            )}
          </label>
        )}
        {description && (
          <span className="text-sm leading-5 text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );
}

export { Checkbox };
