import type { AtomMode } from '@/lib/data-types/atom-types';

/** Design-time configuration for custom cell display. */
export interface CustomCellDisplayStaticConfig {
  /** Render function that receives field-level context only. */
  render: (
    value: unknown,
    mode: AtomMode,
    onChange: (original: unknown, current: unknown) => void,
    errors?: string[],
  ) => React.ReactNode;
}

/** Runtime configuration for custom cell display. */
export interface CustomCellDisplayRuntimeConfig {
  /** The value to display. */
  value?: unknown;
  /** Called when the value changes. */
  onChange?: (original: unknown, current: unknown) => void;
}

export interface ArdaCustomCellDisplayProps
  extends CustomCellDisplayStaticConfig, CustomCellDisplayRuntimeConfig {}

const noop = () => {};

/** Compact read-only custom renderer for AG Grid cells. */
export function ArdaCustomCellDisplay({
  value,
  render: renderFn,
  onChange,
}: ArdaCustomCellDisplayProps) {
  return (
    <span className="truncate text-sm leading-normal">
      {renderFn(value, 'display', onChange ?? noop)}
    </span>
  );
}
