import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaUrlFieldDisplay, type ArdaUrlFieldDisplayProps } from './url-field-display';
import { ArdaUrlFieldEditor, type ArdaUrlFieldEditorProps } from './url-field-editor';

export interface UrlFieldStaticConfig {
  placeholder?: string;
  displayFormat?: 'link' | 'button';
  buttonLabel?: string;
  openInNewTab?: boolean;
}

export interface ArdaUrlFieldInteractiveProps extends AtomProps<string>, UrlFieldStaticConfig {}

export function ArdaUrlFieldInteractive({
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
  displayFormat,
  buttonLabel,
  openInNewTab,
}: ArdaUrlFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaUrlFieldDisplayProps = { value };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (displayFormat !== undefined) displayProps.displayFormat = displayFormat;
  if (buttonLabel !== undefined) displayProps.buttonLabel = buttonLabel;
  if (openInNewTab !== undefined) displayProps.openInNewTab = openInNewTab;

  if (effectiveMode === 'display') {
    return <ArdaUrlFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaUrlFieldEditorProps = {
    value,
    onChange,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (placeholder !== undefined) editorProps.placeholder = placeholder;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaUrlFieldEditor {...editorProps} />;
}
