import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import {
  ArdaDateTimeFieldDisplay,
  type ArdaDateTimeFieldDisplayProps,
} from './date-time-field-display';
import {
  ArdaDateTimeFieldEditor,
  type ArdaDateTimeFieldEditorProps,
} from './date-time-field-editor';

export interface DateTimeFieldStaticConfig {
  placeholder?: string;
  timezone?: string;
}

export interface ArdaDateTimeFieldInteractiveProps
  extends AtomProps<string>, DateTimeFieldStaticConfig {}

export function ArdaDateTimeFieldInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  label,
  labelPosition,
  placeholder,
  timezone,
}: ArdaDateTimeFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaDateTimeFieldDisplayProps = { value };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (timezone !== undefined) displayProps.timezone = timezone;

  if (effectiveMode === 'display') {
    return <ArdaDateTimeFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaDateTimeFieldEditorProps = {
    value,
    onChange,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (placeholder !== undefined) editorProps.placeholder = placeholder;
  if (timezone !== undefined) editorProps.timezone = timezone;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaDateTimeFieldEditor {...editorProps} />;
}
