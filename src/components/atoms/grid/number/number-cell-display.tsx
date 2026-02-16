import { formatNumber } from '@/lib/data-types/formatters';

/** Design-time configuration for number cell display. */
export interface NumberCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Number of decimal places to display. */
  precision?: number;
}

/** Runtime configuration for number cell display. */
export interface NumberCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The numeric value to display. */
  value?: number;
}

export interface ArdaNumberCellDisplayProps
  extends NumberCellDisplayStaticConfig, NumberCellDisplayRuntimeConfig {}

/** Compact read-only number renderer for AG Grid cells. */
export function ArdaNumberCellDisplay({ value, precision = 0 }: ArdaNumberCellDisplayProps) {
  const display = formatNumber(value, precision);
  return <span className="truncate text-sm leading-normal">{display}</span>;
}
