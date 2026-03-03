import { FieldLabel, type FieldLabelProps } from '../field-label';

/** The Quantity value type. */
export interface Quantity {
  amount: number;
  unit: string;
}

/** Design-time configuration for quantity field display. */
export interface QuantityFieldDisplayStaticConfig extends FieldLabelProps {
  /** Unit options for display lookup. */
  unitOptions: Readonly<Record<string, string>>;
  /** Number of decimal places. */
  precision?: number;
}

/** Runtime configuration for quantity field display. */
export interface QuantityFieldDisplayRuntimeConfig {
  /** The quantity value to display. */
  value?: Quantity;
}

export interface ArdaQuantityFieldDisplayProps
  extends QuantityFieldDisplayStaticConfig, QuantityFieldDisplayRuntimeConfig {}

/** Read-only quantity display for form fields. */
export function ArdaQuantityFieldDisplay({
  value,
  unitOptions,
  precision = 0,
  label,
  labelPosition,
}: ArdaQuantityFieldDisplayProps) {
  void unitOptions;
  let display = '\u2014';
  if (value) {
    const formatted = value.amount.toFixed(precision);
    display = `${formatted} ${value.unit}`;
  }
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {display}
      </div>
    </FieldLabel>
  );
}
