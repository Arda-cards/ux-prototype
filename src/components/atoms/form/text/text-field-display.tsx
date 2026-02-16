import { formatText } from '@/lib/data-types/formatters';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for text field display. */
export interface TextFieldDisplayStaticConfig extends FieldLabelProps {
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
export function ArdaTextFieldDisplay({
  value,
  maxLength,
  label,
  labelPosition,
}: ArdaTextFieldDisplayProps) {
  let display = formatText(value);
  if (maxLength && display !== '—' && display.length > maxLength) {
    display = display.slice(0, maxLength) + '…';
  }
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {display}
      </div>
    </FieldLabel>
  );
}
