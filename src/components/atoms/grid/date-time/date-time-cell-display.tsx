import { formatDateTime } from '@/lib/data-types/formatters';

/** Design-time configuration for date-time cell display. */
export interface DateTimeCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** IANA timezone for display formatting (e.g. "America/New_York"). */
  timezone?: string;
}

/** Runtime configuration for date-time cell display. */
export interface DateTimeCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The datetime value to display (ISO datetime string). */
  value?: string;
}

export interface ArdaDateTimeCellDisplayProps
  extends DateTimeCellDisplayStaticConfig, DateTimeCellDisplayRuntimeConfig {}

/** Compact read-only datetime renderer for AG Grid cells. */
export function ArdaDateTimeCellDisplay({ value, timezone }: ArdaDateTimeCellDisplayProps) {
  const display = formatDateTime(value, timezone);
  return <span className="truncate text-sm leading-normal">{display}</span>;
}
