import { formatText } from '@/lib/data-types/formatters';

/** Design-time configuration for text field display. */
export interface TextFieldDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Maximum characters before truncation. */
  maxLength?: number;
}

/** Runtime configuration for text field display. */
export interface TextFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The text value to display. */
  value?: string;
}

export interface ArdaTextFieldDisplayProps
  extends TextFieldDisplayStaticConfig, TextFieldDisplayRuntimeConfig {}

/** Read-only text display for form fields. */
export function ArdaTextFieldDisplay({ value, maxLength }: ArdaTextFieldDisplayProps) {
  let display = formatText(value);
  if (maxLength && display !== '—' && display.length > maxLength) {
    display = display.slice(0, maxLength) + '…';
  }
  return (
    <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
      {display}
    </div>
  );
}
