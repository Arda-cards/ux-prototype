import { useState, useEffect, useRef, useCallback, type ComponentType } from 'react';
import type { AtomMode, AtomProps } from './atom-types';

/**
 * Configuration for createInteractive.
 */
export interface CreateInteractiveConfig<
  V,
  ExtraProps extends Record<string, unknown> = Record<string, never>,
> {
  /** The single atom component that accepts AtomProps<V>. */
  Component: ComponentType<AtomProps<V> & ExtraProps>;
  /** Display name for the resulting component. */
  displayName?: string;
}

/**
 * Props for the resulting Interactive component.
 */
export interface InteractiveProps<V> {
  /** Current value. */
  value: V;
  /** Called when value changes via editing. */
  onValueChange?: (value: V) => void;
  /** Whether editing is disabled. */
  disabled?: boolean;
  /** Additional CSS class for the wrapper. */
  className?: string;
}

/**
 * Generic HOC that wraps a single AtomProps-based component and manages
 * mode state internally for standalone usage outside the entity viewer.
 *
 * Behavior:
 * - Renders in display mode by default
 * - Switches to edit mode on double-click
 * - Switches back to display mode with the latest value on blur or Enter
 * - Cancels editing (restores original value) on Escape
 *
 * The optional ExtraProps generic allows passing additional props (e.g. timezone)
 * through to the wrapped component at runtime.
 */
export function createInteractive<
  V,
  ExtraProps extends Record<string, unknown> = Record<string, never>,
>({ Component, displayName }: CreateInteractiveConfig<V, ExtraProps>) {
  function Interactive({
    value,
    onValueChange,
    disabled = false,
    className,
    ...extraProps
  }: InteractiveProps<V> & ExtraProps) {
    const [mode, setMode] = useState<AtomMode>('display');
    const [localValue, setLocalValue] = useState<V>(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleDoubleClick = useCallback(() => {
      if (!disabled && mode === 'display') {
        setMode('edit');
      }
    }, [disabled, mode]);

    const handleChange = useCallback((_original: V, current: V) => {
      setLocalValue(current);
    }, []);

    const handleComplete = useCallback(
      (newValue: V) => {
        setLocalValue(newValue);
        setMode('display');
        onValueChange?.(newValue);
      },
      [onValueChange],
    );

    const handleCancel = useCallback(() => {
      setLocalValue(value);
      setMode('display');
    }, [value]);

    const extra = extraProps as ExtraProps;

    if (mode === 'display') {
      return (
        <div
          ref={wrapperRef}
          onDoubleClick={handleDoubleClick}
          className={className}
          style={{ cursor: disabled ? 'default' : 'pointer' }}
        >
          <Component
            value={localValue}
            onChange={handleChange}
            mode="display"
            editable={!disabled}
            {...extra}
          />
        </div>
      );
    }

    return (
      <div ref={wrapperRef} className={className}>
        <Component
          value={localValue}
          onChange={handleChange}
          onComplete={handleComplete}
          onCancel={handleCancel}
          mode={mode}
          editable={!disabled}
          {...extra}
        />
      </div>
    );
  }

  Interactive.displayName = displayName ?? 'Interactive';

  return Interactive;
}
