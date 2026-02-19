import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for image cell editor. */
export interface ImageCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text. */
  placeholder?: string;
}

/** Props for ArdaImageCellEditor. */
export interface ArdaImageCellEditorProps extends ImageCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid. */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface ImageCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor for image URL values.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'imageUrl', cellEditor: createImageCellEditor({ placeholder: 'Enter URL…' }) }
 * ```
 */
export const ArdaImageCellEditor = forwardRef<ImageCellEditorHandle, ArdaImageCellEditorProps>(
  ({ value: initialValue, stopEditing, placeholder = 'Enter image URL…' }, ref) => {
    const [currentValue, setCurrentValue] = useState(initialValue ?? '');
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue || undefined,
    }));

    useEffect(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, []);

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
      <input
        ref={inputRef}
        type="url"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full h-full px-2 py-1 text-sm border-0 outline-none',
          'focus:ring-2 focus:ring-ring',
          'bg-white',
        )}
      />
    );
  },
);

ArdaImageCellEditor.displayName = 'ArdaImageCellEditor';

/**
 * Factory helper for creating an image cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'imageUrl', cellEditor: createImageCellEditor() };
 * ```
 */
export function createImageCellEditor(config: ImageCellEditorStaticConfig = {}) {
  return (props: Omit<ArdaImageCellEditorProps, keyof ImageCellEditorStaticConfig>) => (
    <ArdaImageCellEditor {...config} {...props} />
  );
}
