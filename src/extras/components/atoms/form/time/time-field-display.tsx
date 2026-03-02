import { formatTime, getBrowserTimezone } from '@/lib/data-types/formatters';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for time field display. */
export interface TimeFieldDisplayStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
}

/** Runtime configuration for time field display. */
export interface TimeFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The time value to display (HH:mm format). */
  value?: string;
  /** IANA timezone for display formatting. Defaults to browser timezone. */
  timezone?: string;
}

export interface ArdaTimeFieldDisplayProps
  extends TimeFieldDisplayStaticConfig, TimeFieldDisplayRuntimeConfig {}

/** Read-only time display for form fields. */
export function ArdaTimeFieldDisplay({
  value,
  timezone,
  label,
  labelPosition,
}: ArdaTimeFieldDisplayProps) {
  const tz = timezone ?? getBrowserTimezone();
  const display = formatTime(value, tz);
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {display}
      </div>
    </FieldLabel>
  );
}
