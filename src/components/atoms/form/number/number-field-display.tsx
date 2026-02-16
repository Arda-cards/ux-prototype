import { formatNumber } from '@/lib/data-types/formatters';

/** Design-time configuration for number field display. */
export interface NumberFieldDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Number of decimal places to display. */
  precision?: number;
}

/** Runtime configuration for number field display. */
export interface NumberFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The numeric value to display. */
  value?: number;
}

export interface ArdaNumberFieldDisplayProps
  extends NumberFieldDisplayStaticConfig, NumberFieldDisplayRuntimeConfig {}

/** Read-only number display for form fields. */
export function ArdaNumberFieldDisplay({ value, precision = 0 }: ArdaNumberFieldDisplayProps) {
  const display = formatNumber(value, precision);
  return (
    <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
      {display}
    </div>
  );
}
