import { formatBoolean } from '@/lib/data-types/formatters';
import { Check, X } from 'lucide-react';

/** Design-time configuration for boolean field display. */
export interface BooleanFieldDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Display format: checkbox (icon) or yes-no (text). */
  displayFormat?: 'checkbox' | 'yes-no';
}

/** Runtime configuration for boolean field display. */
export interface BooleanFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The boolean value to display. */
  value?: boolean;
}

export interface ArdaBooleanFieldDisplayProps
  extends BooleanFieldDisplayStaticConfig, BooleanFieldDisplayRuntimeConfig {}

/** Read-only boolean display for form fields. */
export function ArdaBooleanFieldDisplay({
  value,
  displayFormat = 'checkbox',
}: ArdaBooleanFieldDisplayProps) {
  if (displayFormat === 'checkbox') {
    return (
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {value === undefined || value === null ? (
          <span className="text-muted-foreground">—</span>
        ) : value ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        )}
      </div>
    );
  }

  // yes-no format
  const display = formatBoolean(value, 'yes-no');
  return (
    <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
      {display}
    </div>
  );
}
