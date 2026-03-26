import { formatDate } from '@/components/canary/atoms/shared/formatters';
import { getBrowserTimezone } from '@/types/canary/utilities/date-time';

/** Design-time configuration for date cell display. */
export interface DateCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
}

/** Runtime configuration for date cell display. */
export interface DateCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The date value to display (ISO date string). */
  value?: string;
  /** IANA timezone for display formatting (e.g. "America/New_York"). Defaults to browser timezone. */
  timezone?: string;
}

export interface DateCellDisplayProps
  extends DateCellDisplayStaticConfig, DateCellDisplayRuntimeConfig {}

/** Compact read-only date renderer for AG Grid cells. */
export function DateCellDisplay({ value, timezone }: DateCellDisplayProps) {
  const tz = timezone ?? getBrowserTimezone();
  const display = formatDate(value, tz);
  return <span className="truncate text-sm leading-normal">{display}</span>;
}
