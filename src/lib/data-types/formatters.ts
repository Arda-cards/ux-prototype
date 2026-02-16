/**
 * Pure formatting functions for data type display components.
 * Used by both Grid (cell) and Form (field) display components.
 */

/** Format a text value for display. Returns '—' for empty/undefined. */
export function formatText(value: string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—';
  return value;
}

/** Format a date string (ISO or YYYY-MM-DD) for display. Optionally formats in a specific timezone. */
export function formatDate(value: string | undefined | null, timezone?: string): string {
  if (!value) return '—';
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  if (timezone) opts.timeZone = timezone;

  // Parse YYYY-MM-DD as local date (avoid UTC→local timezone shift) when no timezone specified
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    if (timezone) {
      // When timezone is specified, use UTC date and let Intl format in target timezone
      const date = new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00Z`);
      if (!isNaN(date.getTime())) return date.toLocaleDateString('en-US', opts);
    } else {
      const date = new Date(parseInt(match[1]!), parseInt(match[2]!) - 1, parseInt(match[3]!));
      if (!isNaN(date.getTime())) return date.toLocaleDateString('en-US', opts);
    }
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', opts);
}

/** Format a time string (HH:mm or HH:mm:ss) for display. Optionally appends timezone abbreviation. */
export function formatTime(value: string | undefined | null, timezone?: string): string {
  if (!value) return '—';
  // Parse HH:mm or HH:mm:ss
  const parts = value.split(':');
  if (parts.length < 2) return '—';
  const hours = parseInt(parts[0]!, 10);
  const minutes = parseInt(parts[1]!, 10);
  if (isNaN(hours) || isNaN(minutes)) return '—';
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const formatted = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  if (timezone) {
    const abbr = getTimezoneAbbreviation(timezone);
    return abbr ? `${formatted} ${abbr}` : formatted;
  }
  return formatted;
}

/** Format a datetime string (ISO) for display. Optionally formats in a specific timezone. */
export function formatDateTime(value: string | undefined | null, timezone?: string): string {
  if (!value) return '—';
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  if (timezone) {
    opts.timeZone = timezone;
    opts.timeZoneName = 'short';
  }

  // Parse datetime-local format (no Z suffix) as local time when no timezone specified
  const localMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (localMatch && !value.endsWith('Z') && !value.includes('+')) {
    if (timezone) {
      // With timezone, interpret as UTC and let Intl format in target timezone
      const date = new Date(`${value}Z`);
      if (!isNaN(date.getTime())) return date.toLocaleString('en-US', opts);
    } else {
      const date = new Date(
        parseInt(localMatch[1]!),
        parseInt(localMatch[2]!) - 1,
        parseInt(localMatch[3]!),
        parseInt(localMatch[4]!),
        parseInt(localMatch[5]!),
      );
      if (!isNaN(date.getTime())) return date.toLocaleString('en-US', opts);
    }
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', opts);
}

/** Format a boolean value for display. */
export function formatBoolean(
  value: boolean | undefined | null,
  format: 'checkbox' | 'yes-no' = 'checkbox',
): string {
  if (value === undefined || value === null) return '—';
  if (format === 'yes-no') return value ? 'Yes' : 'No';
  return value ? '✓' : '✗';
}

/** Format a number value for display with configurable decimal precision. */
export function formatNumber(value: number | undefined | null, precision: number = 0): string {
  if (value === undefined || value === null) return '—';
  return value.toFixed(precision);
}

/** Format an image URL for display (returns the URL or placeholder). */
export function formatImageUrl(value: string | undefined | null): string {
  if (!value) return '—';
  return value;
}

/** Format a URL for display. */
export function formatUrl(value: string | undefined | null): string {
  if (!value) return '—';
  return value;
}

/** Convert a date string to YYYY-MM-DD for date input elements. Preserves YYYY-MM-DD as-is. */
export function toDateInputValue(value: string | undefined | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1]!;
  return value;
}

/** Convert a datetime string to datetime-local input value. Preserves local datetime format. */
export function toDateTimeInputValue(value: string | undefined | null): string {
  if (!value) return '';
  // Already in datetime-local format
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  if (match) return match[1]!;
  return value;
}

/** Get the short timezone abbreviation for an IANA timezone name. */
function getTimezoneAbbreviation(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart?.value ?? '';
  } catch {
    return '';
  }
}
