import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaEnumFieldDisplay, type ArdaEnumFieldDisplayProps } from './enum-field-display';
import { ArdaEnumFieldEditor, type ArdaEnumFieldEditorProps } from './enum-field-editor';

/** Static configuration props specific to the enum field. */
export interface EnumFieldStaticConfig<V extends string> {
  /** Mapping from enum value to human-readable display label. */
  options: Readonly<Record<V, string>>;
}

/** Props for the interactive enum form field. */
export interface ArdaEnumFieldInteractiveProps<V extends string>
  extends AtomProps<V>, EnumFieldStaticConfig<V> {}

/**
 * Interactive enum form field that renders in display, edit, or error mode
 * based on the `mode` prop. When `editable` is `false`, always renders
 * in display mode regardless of `mode`.
 */
export function ArdaEnumFieldInteractive<V extends string>({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  label,
  labelPosition,
  options,
}: ArdaEnumFieldInteractiveProps<V>) {
  if (Object.keys(options).length > 100) {
    console.warn(
      'EnumFieldInteractive: options has >100 entries. Consider using a typeahead instead.',
    );
  }

  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  // Build props conditionally for exactOptionalPropertyTypes compliance
  const displayProps: ArdaEnumFieldDisplayProps<V> = { value, options };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;

  if (effectiveMode === 'display') {
    return <ArdaEnumFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaEnumFieldEditorProps<V> = {
    value,
    onChange,
    options,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaEnumFieldEditor {...editorProps} />;
}
