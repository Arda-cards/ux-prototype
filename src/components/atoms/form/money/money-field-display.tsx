import { FieldLabel, type FieldLabelProps } from '../field-label';

/** The Money value type. */
export interface Money {
  amount: number;
  currency: string;
}

/** Design-time configuration for money field display. */
export interface MoneyFieldDisplayStaticConfig extends FieldLabelProps {
  /** Currency options for display lookup. */
  currencyOptions: Readonly<Record<string, string>>;
  /** Number of decimal places. */
  precision?: number;
}

/** Runtime configuration for money field display. */
export interface MoneyFieldDisplayRuntimeConfig {
  /** The money value to display. */
  value?: Money;
}

export interface ArdaMoneyFieldDisplayProps
  extends MoneyFieldDisplayStaticConfig, MoneyFieldDisplayRuntimeConfig {}

/** Read-only money display for form fields. */
export function ArdaMoneyFieldDisplay({
  value,
  currencyOptions,
  precision = 2,
  label,
  labelPosition,
}: ArdaMoneyFieldDisplayProps) {
  void currencyOptions;
  let display = '\u2014';
  if (value) {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: value.currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value.amount);
    display = `${formatted} ${value.currency}`;
  }
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {display}
      </div>
    </FieldLabel>
  );
}
