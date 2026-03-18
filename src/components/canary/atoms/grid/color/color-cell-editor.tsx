import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/utils';
import { type ColorOption, DEFAULT_COLOR_MAP } from './color-cell-display';

/** Design-time configuration for color cell editor. */
export interface ColorCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Configurable color palette. Defaults to the vendored 10-color set. */
  colors?: ColorOption[];
}

/** Props for ColorCellEditor. */
export interface ColorCellEditorProps extends ColorCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid (color enum value). */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface ColorCellEditorHandle {
  getValue: () => string | undefined;
}

/** Default colors derived from DEFAULT_COLOR_MAP. */
const DEFAULT_COLORS: ColorOption[] = Object.entries(DEFAULT_COLOR_MAP).map(
  ([value, { hex, name }]) => ({ value, label: name, hex }),
);

/**
 * AG Grid cell editor for color values with swatch display.
 *
 * Renders a select dropdown with color swatches. Replaces the vendored
 * class-based raw-DOM ColorCellEditor with a React forwardRef component.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'color', cellEditor: createColorCellEditor() }
 * ```
 */
export const ColorCellEditor = forwardRef<ColorCellEditorHandle, ColorCellEditorProps>(
  ({ value: initialValue, stopEditing, colors = DEFAULT_COLORS }, ref) => {
    const [currentValue, setCurrentValue] = useState(initialValue ?? '');
    const selectRef = useRef<HTMLSelectElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue || undefined,
    }));

    useEffect(() => {
      selectRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentValue(e.target.value);
      // Auto-commit on selection like the vendored editor
      setTimeout(() => stopEditing?.(false), 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        stopEditing?.(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopEditing?.(true);
      }
    };

    return (
      <select
        ref={selectRef}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full h-full px-2 py-1 text-sm border-0 outline-none',
          'focus:ring-2 focus:ring-ring',
          'bg-white cursor-pointer',
        )}
      >
        <option value="">—</option>
        {colors.map((color) => (
          <option key={color.value} value={color.value}>
            {color.label}
          </option>
        ))}
      </select>
    );
  },
);

ColorCellEditor.displayName = 'ColorCellEditor';

/**
 * Factory helper for creating a color cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'color', cellEditor: createColorCellEditor() };
 * ```
 */
export function createColorCellEditor(config: ColorCellEditorStaticConfig = {}) {
  return (props: Omit<ColorCellEditorProps, keyof ColorCellEditorStaticConfig>) => (
    <ColorCellEditor {...config} {...props} />
  );
}
