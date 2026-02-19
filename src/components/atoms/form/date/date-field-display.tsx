import { formatDate, getBrowserTimezone } from '@/lib/data-types/formatters';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for date field display. */
export interface DateFieldDisplayStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
}

/** Runtime configuration for date field display. */
export interface DateFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The date value to display (ISO date string). */
  value?: string;
  /** IANA timezone for display formatting. Defaults to browser timezone. */
  timezone?: string;
}

export interface ArdaDateFieldDisplayProps
  extends DateFieldDisplayStaticConfig, DateFieldDisplayRuntimeConfig {}

/** Read-only date display for form fields. */
export function ArdaDateFieldDisplay({
  value,
  timezone,
  label,
  labelPosition,
}: ArdaDateFieldDisplayProps) {
  const tz = timezone ?? getBrowserTimezone();
  const display = formatDate(value, tz);
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {display}
      </div>
    </FieldLabel>
  );
}
