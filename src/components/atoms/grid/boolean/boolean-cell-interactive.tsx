import {
  createInteractive,
  type InteractiveEditorProps,
} from '@/lib/data-types/create-interactive';
import { ArdaBooleanCellDisplay } from './boolean-cell-display';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Inline boolean editor adapted for the createInteractive pattern.
 * Unlike the AG Grid cell editor, this uses onChange/onComplete/onCancel callbacks.
 */
function BooleanCellInlineEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
}: InteractiveEditorProps<boolean>) {
  const [localValue, setLocalValue] = useState(value ?? false);
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      checkboxRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
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
    <div className="flex items-center h-full">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={cn(
          'h-4 w-4 rounded border-border text-primary',
          'focus:ring-2 focus:ring-ring focus:ring-offset-0',
        )}
      />
    </div>
  );
}

/**
 * Interactive boolean cell: displays checkbox/text by default, switches to inline editor
 * on double-click, commits on blur/Enter, cancels on Escape.
 */
export const ArdaBooleanCellInteractive = createInteractive<boolean>({
  DisplayComponent: ArdaBooleanCellDisplay,
  EditorComponent: BooleanCellInlineEditor,
  displayName: 'ArdaBooleanCellInteractive',
});
