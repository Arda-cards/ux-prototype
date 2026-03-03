import type { ReactNode } from 'react';

/** Props for adding a static label to any form field atom. */
export type FieldLabelProps = {
  /** The field name shown to the user (design-time). */
  label?: string | undefined;
  /** Label position relative to the field (design-time). */
  labelPosition?: 'left' | 'top' | undefined;
};

/** Wraps a form field with an optional label. */
export function FieldLabel({
  label,
  labelPosition = 'left',
  children,
}: FieldLabelProps & { children: ReactNode }) {
  if (!label) return <>{children}</>;

  if (labelPosition === 'top') {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {children}
      </label>
    );
  }

  // left (default)
  return (
    <label className="flex items-start gap-2">
      <span className="w-[120px] shrink-0 pt-2 text-sm font-medium text-foreground truncate">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </label>
  );
}
