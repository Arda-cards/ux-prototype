import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// --- CVA variant definition ---

const detailFieldVariants = cva('flex flex-col gap-1', {
  variants: {
    variant: {
      /** Standard gap between label and value. */
      default: '',
      /** Reduced gap for compact layouts. */
      compact: 'gap-0.5',
    },
  },
  defaultVariants: { variant: 'default' },
});

// --- Interfaces ---

/** Static configuration for DetailField. */
export interface DetailFieldStaticConfig extends VariantProps<typeof detailFieldVariants> {
  /* --- View / Layout / Controller --- */
  /** The field label displayed above the value. */
  label: string;
  /** Text shown when value is undefined or empty. Defaults to an em dash.
   *  Has no effect when `children` is provided — children always take precedence. */
  fallback?: string;
}

/** Runtime configuration for DetailField. */
export interface DetailFieldRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The field value to display as plain text. */
  value?: string;
  /** Custom value rendering. When provided, overrides value and fallback. */
  children?: React.ReactNode;
}

/** Combined props for DetailField. */
export interface DetailFieldProps
  extends DetailFieldStaticConfig, DetailFieldRuntimeConfig, React.HTMLAttributes<HTMLDivElement> {}

// --- Component ---

/**
 * DetailField — a read-only label/value pair for entity detail views.
 *
 * Built from scratch (no shadcn/ui or AG Grid analog).
 * Extracted from `vendored/arda-frontend/components/items/ItemDetailsPanel.tsx` lines 1161-1204.
 */
export function DetailField({
  label,
  value,
  fallback = '\u2014',
  variant,
  children,
  className,
  ...props
}: DetailFieldProps) {
  const displayValue = children ?? (value !== undefined && value !== '' ? value : fallback);

  return (
    <div className={cn(detailFieldVariants({ variant }), className)} {...props}>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className="text-base text-foreground font-semibold break-words">{displayValue}</span>
    </div>
  );
}

export { detailFieldVariants };
