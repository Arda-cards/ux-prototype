import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/types/canary/utils';

// --- CVA variant definition ---

const readOnlyFieldVariants = cva('flex flex-col gap-0.5', {
  variants: {
    variant: {
      /** Standard gap between label and value. */
      default: '',
      /** Reduced gap for compact layouts. */
      compact: 'gap-px',
    },
  },
  defaultVariants: { variant: 'default' },
});

// --- Interfaces ---

/** Design-time configuration for ReadOnlyField. */
export interface ReadOnlyFieldStaticConfig extends VariantProps<typeof readOnlyFieldVariants> {
  /* --- View / Layout / Controller --- */
  /** The field label displayed above the value. */
  label: string;
  /** Text shown when value is undefined or empty. Defaults to an em dash.
   *  Has no effect when `children` is provided — children always take precedence. */
  fallback?: string;
}

/** Runtime configuration for ReadOnlyField. */
export interface ReadOnlyFieldRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The field value to display as plain text. */
  value?: string | undefined;
  /** Custom value rendering. When provided, overrides value and fallback. */
  children?: React.ReactNode | undefined;
}

/** Combined props for ReadOnlyField. */
export interface ReadOnlyFieldProps
  extends
    ReadOnlyFieldStaticConfig,
    ReadOnlyFieldRuntimeConfig,
    React.HTMLAttributes<HTMLDivElement> {}

// --- Component ---

/**
 * ReadOnlyField — a read-only label/value pair for entity detail views.
 *
 * Built from scratch (no shadcn/ui or AG Grid analog).
 * Extracted from `vendored/arda-frontend/components/items/ItemDetailsPanel.tsx` lines 1161-1204.
 */
export function ReadOnlyField({
  label,
  value,
  fallback = '\u2014',
  variant,
  children,
  className,
  ...props
}: ReadOnlyFieldProps) {
  const displayValue = children ?? (value !== undefined && value !== '' ? value : fallback);

  return (
    <div className={cn(readOnlyFieldVariants({ variant }), 'cursor-default', className)} {...props}>
      <span className="text-sm uppercase tracking-[0.06em] text-muted-foreground font-medium">
        {label}
      </span>
      <span className="text-sm text-foreground break-words font-mono">{displayValue}</span>
    </div>
  );
}

export { readOnlyFieldVariants };
