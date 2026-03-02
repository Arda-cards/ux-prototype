import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for URL cell editor. */
export interface UrlCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text. */
  placeholder?: string;
}

/** Props for ArdaUrlCellEditor. */
export interface ArdaUrlCellEditorProps extends UrlCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid. */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface UrlCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor for URL values.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'websiteUrl', cellEditor: createUrlCellEditor({ placeholder: 'Enter URL…' }) }
 * ```
 */
export const ArdaUrlCellEditor = forwardRef<UrlCellEditorHandle, ArdaUrlCellEditorProps>(
  ({ value: initialValue, stopEditing, placeholder = 'Enter URL…' }, ref) => {
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

ArdaUrlCellEditor.displayName = 'ArdaUrlCellEditor';

/**
 * Factory helper for creating a URL cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'websiteUrl', cellEditor: createUrlCellEditor() };
 * ```
 */
export function createUrlCellEditor(config: UrlCellEditorStaticConfig = {}) {
  return (props: Omit<ArdaUrlCellEditorProps, keyof UrlCellEditorStaticConfig>) => (
    <ArdaUrlCellEditor {...config} {...props} />
  );
}
