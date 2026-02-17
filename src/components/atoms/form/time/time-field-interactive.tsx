import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaTimeFieldDisplay, type ArdaTimeFieldDisplayProps } from './time-field-display';
import { ArdaTimeFieldEditor, type ArdaTimeFieldEditorProps } from './time-field-editor';

export interface TimeFieldStaticConfig {
  placeholder?: string;
  timezone?: string;
}

export interface ArdaTimeFieldInteractiveProps extends AtomProps<string>, TimeFieldStaticConfig {}

export function ArdaTimeFieldInteractive({
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
}: ArdaTimeFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaTimeFieldDisplayProps = { value };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (timezone !== undefined) displayProps.timezone = timezone;

  if (effectiveMode === 'display') {
    return <ArdaTimeFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaTimeFieldEditorProps = {
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

  return <ArdaTimeFieldEditor {...editorProps} />;
}
