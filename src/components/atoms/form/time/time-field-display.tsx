import { formatTime } from '@/lib/data-types/formatters';

/** Design-time configuration for time field display. */
export interface TimeFieldDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** IANA timezone for display formatting (design-time config). */
  timezone?: string;
}

/** Runtime configuration for time field display. */
export interface TimeFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The time value to display (HH:mm format). */
  value?: string;
}

export interface ArdaTimeFieldDisplayProps
  extends TimeFieldDisplayStaticConfig, TimeFieldDisplayRuntimeConfig {}

/** Read-only time display for form fields. */
export function ArdaTimeFieldDisplay({ value, timezone }: ArdaTimeFieldDisplayProps) {
  const display = formatTime(value, timezone);
  return (
    <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
      {display}
    </div>
  );
}
