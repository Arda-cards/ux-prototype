import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaNumberFieldDisplay, type ArdaNumberFieldDisplayProps } from './number-field-display';
import { ArdaNumberFieldEditor, type ArdaNumberFieldEditorProps } from './number-field-editor';

/** Static configuration props specific to the number field. */
export interface NumberFieldStaticConfig {
  /** Number of decimal places. */
  precision?: number;
  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Placeholder text for the input. */
  placeholder?: string;
}

/** Props for the interactive number form field. */
export interface ArdaNumberFieldInteractiveProps
  extends AtomProps<number>, NumberFieldStaticConfig {}

/**
 * Interactive number form field that renders in display, edit, or error mode
 * based on the `mode` prop. When `editable` is `false`, always renders
 * in display mode regardless of `mode`.
 */
export function ArdaNumberFieldInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  label,
  labelPosition,
  precision,
  min,
  max,
  placeholder,
}: ArdaNumberFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaNumberFieldDisplayProps = { value };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (precision !== undefined) displayProps.precision = precision;

  if (effectiveMode === 'display') {
    return <ArdaNumberFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaNumberFieldEditorProps = {
    value,
    onChange,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (precision !== undefined) editorProps.precision = precision;
  if (min !== undefined) editorProps.min = min;
  if (max !== undefined) editorProps.max = max;
  if (placeholder !== undefined) editorProps.placeholder = placeholder;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaNumberFieldEditor {...editorProps} />;
}
