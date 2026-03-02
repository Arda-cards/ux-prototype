import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaCustomCellDisplay } from './custom-cell-display';

/** Props for the interactive custom grid cell. */
export interface ArdaCustomCellInteractiveProps extends AtomProps<unknown> {
  /** Render function that receives field-level context only (R1.09 isolation). */
  render: (
    value: unknown,
    mode: AtomMode,
    onChange: (original: unknown, current: unknown) => void,
    errors?: string[],
  ) => React.ReactNode;
}

/**
 * Interactive custom grid cell that delegates ALL rendering to a parent-provided
 * `render` prop. The atom itself has no display logic.
 *
 * When `editable` is `false`, always renders in display mode regardless of `mode`.
 */
export function ArdaCustomCellInteractive({
  value,
  onChange,
  mode,
  errors,
  editable,
  render: renderFn,
}: ArdaCustomCellInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  if (effectiveMode === 'display') {
    return <ArdaCustomCellDisplay value={value} render={renderFn} onChange={onChange} />;
  }

  const hasErrors = effectiveMode === 'error' && errors && errors.length > 0;

  return <div>{renderFn(value, effectiveMode, onChange, hasErrors ? errors : undefined)}</div>;
}
