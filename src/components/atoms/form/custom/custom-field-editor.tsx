import type { AtomMode } from '@/lib/data-types/atom-types';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for custom field editor. */
export interface CustomFieldEditorStaticConfig extends FieldLabelProps {
  /** Render function that receives field-level context only. */
  render: (
    value: unknown,
    mode: AtomMode,
    onChange: (original: unknown, current: unknown) => void,
    errors?: string[],
  ) => React.ReactNode;
}

/** Runtime configuration for custom field editor. */
export interface CustomFieldEditorRuntimeConfig {
  /** Current value. */
  value?: unknown;
  /** Called when value changes. Receives both original and current values. */
  onChange?: (original: unknown, current: unknown) => void;
  /** Validation error messages. */
  errors?: string[];
  /** Whether to show error styling and messages. */
  showErrors?: boolean;
}

export interface ArdaCustomFieldEditorProps
  extends CustomFieldEditorStaticConfig, CustomFieldEditorRuntimeConfig {}

const noop = () => {};

/** Editable custom field for forms. Delegates rendering to the `render` prop. */
export function ArdaCustomFieldEditor({
  value,
  render: renderFn,
  onChange,
  errors,
  showErrors = false,
  label,
  labelPosition,
}: ArdaCustomFieldEditorProps) {
  const mode: AtomMode = showErrors ? 'error' : 'edit';
  const hasErrors = showErrors && errors && errors.length > 0;

  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div>{renderFn(value, mode, onChange ?? noop, hasErrors ? errors : undefined)}</div>
    </FieldLabel>
  );
}
