import { formatText } from '@/components/canary/atoms/shared/formatters';

/** Design-time configuration for text cell display. */
export interface TextCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Maximum characters before truncation. */
  maxLength?: number;
}

/** Runtime configuration for text cell display. */
export interface TextCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The text value to display. */
  value?: string;
}

export interface TextCellDisplayProps
  extends TextCellDisplayStaticConfig, TextCellDisplayRuntimeConfig {}

/** Compact read-only text renderer for AG Grid cells. */
export function TextCellDisplay({ value, maxLength }: TextCellDisplayProps) {
  let display = formatText(value);
  if (maxLength && display !== '—' && display.length > maxLength) {
    display = display.slice(0, maxLength) + '…';
  }
  return <span className="truncate text-sm leading-normal">{display}</span>;
}
