import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import {
  ArdaDurationFieldDisplay,
  type ArdaDurationFieldDisplayProps,
  type Duration,
} from './duration-field-display';
import {
  ArdaDurationFieldEditor,
  type ArdaDurationFieldEditorProps,
} from './duration-field-editor';

/** Static configuration props specific to the duration field. */
export interface DurationFieldStaticConfig {
  /** Unit options: key = unit code, value = display name. */
  unitOptions: Readonly<Record<string, string>>;
  /** Number of decimal places (default: 0). */
  precision?: number;
  /** Placeholder text for the value input. */
  placeholder?: string;
}

/** Props for the interactive duration form field. */
export interface ArdaDurationFieldInteractiveProps
  extends AtomProps<Duration>, DurationFieldStaticConfig {}

/**
 * Interactive duration form field that renders in display, edit, or error mode
 * based on the `mode` prop. When `editable` is `false`, always renders
 * in display mode regardless of `mode`.
 */
export function ArdaDurationFieldInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  label,
  labelPosition,
  unitOptions,
  precision,
  placeholder,
}: ArdaDurationFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaDurationFieldDisplayProps = { value, unitOptions };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (precision !== undefined) displayProps.precision = precision;

  if (effectiveMode === 'display') {
    return <ArdaDurationFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaDurationFieldEditorProps = {
    value,
    onChange,
    unitOptions,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (precision !== undefined) editorProps.precision = precision;
  if (placeholder !== undefined) editorProps.placeholder = placeholder;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaDurationFieldEditor {...editorProps} />;
}
