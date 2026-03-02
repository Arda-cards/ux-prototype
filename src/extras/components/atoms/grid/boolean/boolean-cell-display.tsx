import { formatBoolean } from '@/lib/data-types/formatters';
import { Check, X } from 'lucide-react';

/** Design-time configuration for boolean cell display. */
export interface BooleanCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Display format: checkbox (icon) or yes-no (text). */
  displayFormat?: 'checkbox' | 'yes-no';
}

/** Runtime configuration for boolean cell display. */
export interface BooleanCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The boolean value to display. */
  value?: boolean;
}

export interface ArdaBooleanCellDisplayProps
  extends BooleanCellDisplayStaticConfig, BooleanCellDisplayRuntimeConfig {}

/** Compact read-only boolean renderer for AG Grid cells. */
export function ArdaBooleanCellDisplay({
  value,
  displayFormat = 'checkbox',
}: ArdaBooleanCellDisplayProps) {
  if (value === undefined || value === null) {
    return <span className="text-sm leading-normal text-muted-foreground">—</span>;
  }

  if (displayFormat === 'checkbox') {
    return value ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );
  }

  // yes-no format
  const display = formatBoolean(value, 'yes-no');
  return <span className="text-sm leading-normal">{display}</span>;
}
