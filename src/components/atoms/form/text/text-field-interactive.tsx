import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaTextFieldDisplay, type ArdaTextFieldDisplayProps } from './text-field-display';
import { ArdaTextFieldEditor, type ArdaTextFieldEditorProps } from './text-field-editor';

/** Static configuration props specific to the text field. */
export interface TextFieldStaticConfig {
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Maximum allowed length / truncation length. */
  maxLength?: number;
}

/** Props for the interactive text form field. */
export interface ArdaTextFieldInteractiveProps extends AtomProps<string>, TextFieldStaticConfig {}

/**
 * Interactive text form field that renders in display, edit, or error mode
 * based on the `mode` prop. When `editable` is `false`, always renders
 * in display mode regardless of `mode`.
 */
export function ArdaTextFieldInteractive({
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
  maxLength,
}: ArdaTextFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  // Build props conditionally for exactOptionalPropertyTypes compliance
  const displayProps: ArdaTextFieldDisplayProps = { value };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (maxLength !== undefined) displayProps.maxLength = maxLength;

  if (effectiveMode === 'display') {
    return <ArdaTextFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaTextFieldEditorProps = {
    value,
    onChange,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (placeholder !== undefined) editorProps.placeholder = placeholder;
  if (maxLength !== undefined) editorProps.maxLength = maxLength;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaTextFieldEditor {...editorProps} />;
}
