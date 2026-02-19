import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaCustomFieldDisplay, type ArdaCustomFieldDisplayProps } from './custom-field-display';
import { ArdaCustomFieldEditor, type ArdaCustomFieldEditorProps } from './custom-field-editor';

/** Props for the interactive custom form field. */
export interface ArdaCustomFieldInteractiveProps extends AtomProps<unknown> {
  /** Render function that receives field-level context only (R1.09 isolation). */
  render: (
    value: unknown,
    mode: AtomMode,
    onChange: (original: unknown, current: unknown) => void,
    errors?: string[],
  ) => React.ReactNode;
}

/**
 * Interactive custom form field that delegates ALL rendering to a parent-provided
 * `render` prop. The atom itself has no display logic.
 *
 * When `editable` is `false`, always renders in display mode regardless of `mode`.
 */
export function ArdaCustomFieldInteractive({
  value,
  onChange,
  mode,
  errors,
  editable,
  label,
  labelPosition,
  render: renderFn,
}: ArdaCustomFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  // Build props conditionally for exactOptionalPropertyTypes compliance
  const displayProps: ArdaCustomFieldDisplayProps = { value, render: renderFn, onChange };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;

  if (effectiveMode === 'display') {
    return <ArdaCustomFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaCustomFieldEditorProps = {
    value,
    onChange,
    render: renderFn,
    showErrors: effectiveMode === 'error',
  };
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaCustomFieldEditor {...editorProps} />;
}
