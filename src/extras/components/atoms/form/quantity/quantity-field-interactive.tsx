import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import {
  ArdaQuantityFieldDisplay,
  type ArdaQuantityFieldDisplayProps,
  type Quantity,
} from './quantity-field-display';
import {
  ArdaQuantityFieldEditor,
  type ArdaQuantityFieldEditorProps,
} from './quantity-field-editor';

/** Static configuration props specific to the quantity field. */
export interface QuantityFieldStaticConfig {
  /** Unit options: key = unit code, value = display name. */
  unitOptions: Readonly<Record<string, string>>;
  /** Number of decimal places (default: 0). */
  precision?: number;
  /** Placeholder text for the amount input. */
  placeholder?: string;
}

/** Props for the interactive quantity form field. */
export interface ArdaQuantityFieldInteractiveProps
  extends AtomProps<Quantity>, QuantityFieldStaticConfig {}

/**
 * Interactive quantity form field that renders in display, edit, or error mode
 * based on the `mode` prop. When `editable` is `false`, always renders
 * in display mode regardless of `mode`.
 */
export function ArdaQuantityFieldInteractive({
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
}: ArdaQuantityFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaQuantityFieldDisplayProps = { value, unitOptions };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (precision !== undefined) displayProps.precision = precision;

  if (effectiveMode === 'display') {
    return <ArdaQuantityFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaQuantityFieldEditorProps = {
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

  return <ArdaQuantityFieldEditor {...editorProps} />;
}
