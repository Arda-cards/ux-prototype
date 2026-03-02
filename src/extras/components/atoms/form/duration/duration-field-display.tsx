import { FieldLabel, type FieldLabelProps } from '../field-label';

/** The Duration value type. */
export interface Duration {
  value: number;
  unit: string;
}

/** Design-time configuration for duration field display. */
export interface DurationFieldDisplayStaticConfig extends FieldLabelProps {
  /** Unit options for display lookup. */
  unitOptions: Readonly<Record<string, string>>;
  /** Number of decimal places. */
  precision?: number;
}

/** Runtime configuration for duration field display. */
export interface DurationFieldDisplayRuntimeConfig {
  /** The duration value to display. */
  value?: Duration;
}

export interface ArdaDurationFieldDisplayProps
  extends DurationFieldDisplayStaticConfig, DurationFieldDisplayRuntimeConfig {}

/** Read-only duration display for form fields. */
export function ArdaDurationFieldDisplay({
  value,
  unitOptions,
  precision = 0,
  label,
  labelPosition,
}: ArdaDurationFieldDisplayProps) {
  void unitOptions;
  let display = '\u2014';
  if (value) {
    const formatted = value.value.toFixed(precision);
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
