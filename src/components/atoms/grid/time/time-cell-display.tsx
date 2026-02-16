import { formatTime } from '@/lib/data-types/formatters';

/** Design-time configuration for time cell display. */
export interface TimeCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** IANA timezone for display formatting (e.g. "America/New_York"). */
  timezone?: string;
}

/** Runtime configuration for time cell display. */
export interface TimeCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The time value to display (HH:mm format). */
  value?: string;
}

export interface ArdaTimeCellDisplayProps
  extends TimeCellDisplayStaticConfig, TimeCellDisplayRuntimeConfig {}

/** Compact read-only time renderer for AG Grid cells. */
export function ArdaTimeCellDisplay({ value, timezone }: ArdaTimeCellDisplayProps) {
  const display = formatTime(value, timezone);
  return <span className="truncate text-sm leading-normal">{display}</span>;
}
