import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaDateFieldDisplay, type ArdaDateFieldDisplayProps } from './date-field-display';
import { ArdaDateFieldEditor, type ArdaDateFieldEditorProps } from './date-field-editor';

export interface DateFieldStaticConfig {
  placeholder?: string;
  timezone?: string;
}

export interface ArdaDateFieldInteractiveProps extends AtomProps<string>, DateFieldStaticConfig {}

export function ArdaDateFieldInteractive({
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
}: ArdaDateFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaDateFieldDisplayProps = { value };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (timezone !== undefined) displayProps.timezone = timezone;

  if (effectiveMode === 'display') {
    return <ArdaDateFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaDateFieldEditorProps = {
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

  return <ArdaDateFieldEditor {...editorProps} />;
}
