import {
  createInteractive,
  type InteractiveEditorProps,
} from '@/lib/data-types/create-interactive';
import { ArdaTextCellDisplay } from './text-cell-display';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Inline text editor adapted for the createInteractive pattern.
 * Unlike the AG Grid cell editor, this uses onChange/onComplete/onCancel callbacks.
 */
function TextCellInlineEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
}: InteractiveEditorProps<string>) {
  const [localValue, setLocalValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onComplete?.(localValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  const handleBlur = () => {
    onComplete?.(localValue);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn(
        'w-full h-full px-2 py-1 text-sm border-0 outline-none',
        'focus:ring-2 focus:ring-ring',
        'bg-white',
      )}
    />
  );
}

/**
 * Interactive text cell: displays text by default, switches to inline editor
 * on double-click, commits on blur/Enter, cancels on Escape.
 */
export const ArdaTextCellInteractive = createInteractive<string>({
  DisplayComponent: ArdaTextCellDisplay,
  EditorComponent: TextCellInlineEditor,
  displayName: 'ArdaTextCellInteractive',
});
