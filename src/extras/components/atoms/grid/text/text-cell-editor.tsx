import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for text cell editor. */
export interface TextCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text. */
  placeholder?: string;
  /** Maximum allowed length. */
  maxLength?: number;
}

/** Props for ArdaTextCellEditor. */
export interface ArdaTextCellEditorProps extends TextCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid. */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface TextCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor for single-line text values.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'name', cellEditor: createTextCellEditor({ placeholder: 'Enter name…' }) }
 * ```
 */
export const ArdaTextCellEditor = forwardRef<TextCellEditorHandle, ArdaTextCellEditorProps>(
  ({ value: initialValue, stopEditing, placeholder, maxLength }, ref) => {
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
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          'w-full h-full px-2 py-1 text-sm border-0 outline-none',
          'focus:ring-2 focus:ring-ring',
          'bg-white',
        )}
      />
    );
  },
);

ArdaTextCellEditor.displayName = 'ArdaTextCellEditor';

/**
 * Factory helper for creating a text cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'name', cellEditor: createTextCellEditor({ maxLength: 100 }) };
 * ```
 */
export function createTextCellEditor(config: TextCellEditorStaticConfig = {}) {
  return (props: Omit<ArdaTextCellEditorProps, keyof TextCellEditorStaticConfig>) => (
    <ArdaTextCellEditor {...config} {...props} />
  );
}
