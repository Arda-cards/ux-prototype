import { formatDateTime, getBrowserTimezone } from '@/lib/data-types/formatters';

/** Design-time configuration for date-time cell display. */
export interface DateTimeCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
}

/** Runtime configuration for date-time cell display. */
export interface DateTimeCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The datetime value to display (ISO datetime string). */
  value?: string;
  /** IANA timezone for display formatting (e.g. "America/New_York"). Defaults to browser timezone. */
  timezone?: string;
}

export interface ArdaDateTimeCellDisplayProps
  extends DateTimeCellDisplayStaticConfig, DateTimeCellDisplayRuntimeConfig {}

/** Compact read-only datetime renderer for AG Grid cells. */
export function ArdaDateTimeCellDisplay({ value, timezone }: ArdaDateTimeCellDisplayProps) {
  const tz = timezone ?? getBrowserTimezone();
  const display = formatDateTime(value, tz);
  return <span className="truncate text-sm leading-normal">{display}</span>;
}
