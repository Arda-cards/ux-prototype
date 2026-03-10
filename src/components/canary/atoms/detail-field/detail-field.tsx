import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// --- CVA variant definition ---

const detailFieldVariants = cva('flex flex-col gap-0.5', {
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

/** Design-time configuration for ArdaDetailField. */
export interface ArdaDetailFieldStaticConfig extends VariantProps<typeof detailFieldVariants> {
  /* --- View / Layout / Controller --- */
  /** The field label displayed above the value. */
  label: string;
  /** Text shown when value is undefined or empty. Defaults to an em dash.
   *  Has no effect when `children` is provided — children always take precedence. */
  fallback?: string;
}

/** Runtime configuration for ArdaDetailField. */
export interface ArdaDetailFieldRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The field value to display as plain text. */
  value?: string;
  /** Custom value rendering. When provided, overrides value and fallback. */
  children?: React.ReactNode;
}

/** Combined props for ArdaDetailField. */
export interface ArdaDetailFieldProps
  extends
    ArdaDetailFieldStaticConfig,
    ArdaDetailFieldRuntimeConfig,
    React.HTMLAttributes<HTMLDivElement> {}

// --- Component ---

/**
 * ArdaDetailField — a read-only label/value pair for entity detail views.
 *
 * Built from scratch (no shadcn/ui or AG Grid analog).
 * Extracted from `vendored/arda-frontend/components/items/ItemDetailsPanel.tsx` lines 1161-1204.
 */
export function ArdaDetailField({
  label,
  value,
  fallback = '\u2014',
  variant,
  children,
  className,
  ...props
}: ArdaDetailFieldProps) {
  const displayValue = children ?? (value !== undefined && value !== '' ? value : fallback);

  return (
    <div className={cn(detailFieldVariants({ variant }), className)} {...props}>
      <span className="text-sm uppercase tracking-wide text-muted-foreground/60 font-medium">
        {label}
      </span>
      <span className="text-sm text-foreground break-words">{displayValue}</span>
    </div>
  );
}

export { detailFieldVariants };
