import { formatTime, getBrowserTimezone } from '@/lib/data-types/formatters';

/** Design-time configuration for time cell display. */
export interface TimeCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
}

/** Runtime configuration for time cell display. */
export interface TimeCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The time value to display (HH:mm format). */
  value?: string;
  /** IANA timezone for display formatting (e.g. "America/New_York"). Defaults to browser timezone. */
  timezone?: string;
}

export interface ArdaTimeCellDisplayProps
  extends TimeCellDisplayStaticConfig, TimeCellDisplayRuntimeConfig {}

/** Compact read-only time renderer for AG Grid cells. */
export function ArdaTimeCellDisplay({ value, timezone }: ArdaTimeCellDisplayProps) {
  const tz = timezone ?? getBrowserTimezone();
  const display = formatTime(value, tz);
  return <span className="truncate text-sm leading-normal">{display}</span>;
}
