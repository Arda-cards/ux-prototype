import { formatDate } from '@/lib/data-types/formatters';

/** Design-time configuration for date field display. */
export interface DateFieldDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** IANA timezone for display formatting (design-time config). */
  timezone?: string;
}

/** Runtime configuration for date field display. */
export interface DateFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The date value to display (ISO date string). */
  value?: string;
}

export interface ArdaDateFieldDisplayProps
  extends DateFieldDisplayStaticConfig, DateFieldDisplayRuntimeConfig {}

/** Read-only date display for form fields. */
export function ArdaDateFieldDisplay({ value, timezone }: ArdaDateFieldDisplayProps) {
  const display = formatDate(value, timezone);
  return (
    <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
      {display}
    </div>
  );
}
