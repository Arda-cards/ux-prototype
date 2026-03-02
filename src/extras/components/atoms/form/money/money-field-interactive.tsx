import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import {
  ArdaMoneyFieldDisplay,
  type ArdaMoneyFieldDisplayProps,
  type Money,
} from './money-field-display';
import { ArdaMoneyFieldEditor, type ArdaMoneyFieldEditorProps } from './money-field-editor';

/** Static configuration props specific to the money field. */
export interface MoneyFieldStaticConfig {
  /** Currency options: key = currency code, value = display name. */
  currencyOptions: Readonly<Record<string, string>>;
  /** Number of decimal places (default: 2). */
  precision?: number;
  /** Placeholder text for the amount input. */
  placeholder?: string;
}

/** Props for the interactive money form field. */
export interface ArdaMoneyFieldInteractiveProps extends AtomProps<Money>, MoneyFieldStaticConfig {}

/**
 * Interactive money form field that renders in display, edit, or error mode
 * based on the `mode` prop. When `editable` is `false`, always renders
 * in display mode regardless of `mode`.
 */
export function ArdaMoneyFieldInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  label,
  labelPosition,
  currencyOptions,
  precision,
  placeholder,
}: ArdaMoneyFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaMoneyFieldDisplayProps = { value, currencyOptions };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (precision !== undefined) displayProps.precision = precision;

  if (effectiveMode === 'display') {
    return <ArdaMoneyFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaMoneyFieldEditorProps = {
    value,
    onChange,
    currencyOptions,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (precision !== undefined) editorProps.precision = precision;
  if (placeholder !== undefined) editorProps.placeholder = placeholder;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaMoneyFieldEditor {...editorProps} />;
}
