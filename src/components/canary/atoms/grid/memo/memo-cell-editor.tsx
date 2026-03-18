import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/utils';

/** Design-time configuration for memo cell editor. */
export interface MemoCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text. */
  placeholder?: string;
}

/** Props for MemoCellEditor. */
export interface MemoCellEditorProps extends MemoCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid. */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface MemoCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor for multi-line text (notes, descriptions).
 *
 * Enter submits (Shift+Enter for newline), Escape cancels.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'notes', cellEditor: createMemoCellEditor({ placeholder: 'Add a note…' }) }
 * ```
 */
export const MemoCellEditor = forwardRef<MemoCellEditorHandle, MemoCellEditorProps>(
  ({ value: initialValue, stopEditing, placeholder = 'Add a note...' }, ref) => {
    const [currentValue, setCurrentValue] = useState(initialValue ?? '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue || undefined,
    }));

    useEffect(() => {
      textareaRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        stopEditing?.(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopEditing?.(true);
      }
    };

    return (
      <textarea
        ref={textareaRef}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full min-h-[100px] px-2 py-1 text-sm border-0 outline-none resize-y',
          'focus:ring-2 focus:ring-ring',
          'bg-white',
        )}
      />
    );
  },
);

MemoCellEditor.displayName = 'MemoCellEditor';

/**
 * Factory helper for creating a memo cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'notes', cellEditor: createMemoCellEditor() };
 * ```
 */
export function createMemoCellEditor(config: MemoCellEditorStaticConfig = {}) {
  return (props: Omit<MemoCellEditorProps, keyof MemoCellEditorStaticConfig>) => (
    <MemoCellEditor {...config} {...props} />
  );
}
