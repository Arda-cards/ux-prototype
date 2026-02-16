import { formatDateTime } from '@/lib/data-types/formatters';

/** Design-time configuration for date-time field display. */
export interface DateTimeFieldDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** IANA timezone for display formatting (design-time config). */
  timezone?: string;
}

/** Runtime configuration for date-time field display. */
export interface DateTimeFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The datetime value to display (ISO datetime string). */
  value?: string;
}

export interface ArdaDateTimeFieldDisplayProps
  extends DateTimeFieldDisplayStaticConfig, DateTimeFieldDisplayRuntimeConfig {}

/** Read-only datetime display for form fields. */
export function ArdaDateTimeFieldDisplay({ value, timezone }: ArdaDateTimeFieldDisplayProps) {
  const display = formatDateTime(value, timezone);
  return (
    <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
      {display}
    </div>
  );
}
