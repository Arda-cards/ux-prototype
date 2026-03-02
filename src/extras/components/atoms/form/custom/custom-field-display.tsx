import type { AtomMode } from '@/lib/data-types/atom-types';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for custom field display. */
export interface CustomFieldDisplayStaticConfig extends FieldLabelProps {
  /** Render function that receives field-level context only. */
  render: (
    value: unknown,
    mode: AtomMode,
    onChange: (original: unknown, current: unknown) => void,
    errors?: string[],
  ) => React.ReactNode;
}

/** Runtime configuration for custom field display. */
export interface CustomFieldDisplayRuntimeConfig {
  /** Current field value. */
  value?: unknown;
  /** Called when the value changes. */
  onChange?: (original: unknown, current: unknown) => void;
}

export interface ArdaCustomFieldDisplayProps
  extends CustomFieldDisplayStaticConfig, CustomFieldDisplayRuntimeConfig {}

const noop = () => {};

/** Read-only custom display for form fields. Delegates rendering to the `render` prop. */
export function ArdaCustomFieldDisplay({
  value,
  render: renderFn,
  onChange,
  label,
  labelPosition,
}: ArdaCustomFieldDisplayProps) {
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {renderFn(value, 'display', onChange ?? noop)}
      </div>
    </FieldLabel>
  );
}
