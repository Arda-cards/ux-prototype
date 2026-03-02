import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import {
  ArdaBooleanFieldDisplay,
  type ArdaBooleanFieldDisplayProps,
} from './boolean-field-display';
import { ArdaBooleanFieldEditor, type ArdaBooleanFieldEditorProps } from './boolean-field-editor';

/** Static configuration props specific to the boolean field. */
export interface BooleanFieldStaticConfig {
  /** Display format: checkbox (icon) or yes-no (text/toggle). */
  displayFormat?: 'checkbox' | 'yes-no';
}

/** Props for the interactive boolean form field. */
export interface ArdaBooleanFieldInteractiveProps
  extends AtomProps<boolean>, BooleanFieldStaticConfig {}

/**
 * Interactive boolean form field that renders in display, edit, or error mode
 * based on the `mode` prop. When `editable` is `false`, always renders
 * in display mode regardless of `mode`.
 */
export function ArdaBooleanFieldInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  label,
  labelPosition,
  displayFormat,
}: ArdaBooleanFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  // Build props conditionally for exactOptionalPropertyTypes compliance
  const displayProps: ArdaBooleanFieldDisplayProps = { value };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (displayFormat !== undefined) displayProps.displayFormat = displayFormat;

  if (effectiveMode === 'display') {
    return <ArdaBooleanFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaBooleanFieldEditorProps = {
    value,
    onChange,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (displayFormat !== undefined) editorProps.displayFormat = displayFormat;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaBooleanFieldEditor {...editorProps} />;
}
