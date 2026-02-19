import { formatDateTime, getBrowserTimezone } from '@/lib/data-types/formatters';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for date-time field display. */
export interface DateTimeFieldDisplayStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
}

/** Runtime configuration for date-time field display. */
export interface DateTimeFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The datetime value to display (ISO datetime string). */
  value?: string;
  /** IANA timezone for display formatting. Defaults to browser timezone. */
  timezone?: string;
}

export interface ArdaDateTimeFieldDisplayProps
  extends DateTimeFieldDisplayStaticConfig, DateTimeFieldDisplayRuntimeConfig {}

/** Read-only datetime display for form fields. */
export function ArdaDateTimeFieldDisplay({
  value,
  timezone,
  label,
  labelPosition,
}: ArdaDateTimeFieldDisplayProps) {
  const tz = timezone ?? getBrowserTimezone();
  const display = formatDateTime(value, tz);
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {display}
      </div>
    </FieldLabel>
  );
}
