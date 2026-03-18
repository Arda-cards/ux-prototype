'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGridCellEditor } from 'ag-grid-react';
import { Check } from 'lucide-react';

// --- Types ---

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectCellEditorProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  stopEditing: (cancel?: boolean) => void;
  values: SelectOption[];
}

// --- Component ---
// Used with cellEditorPopup: true — AG Grid handles popup positioning.

export function SelectCellEditor({
  value,
  onValueChange,
  stopEditing,
  values,
}: SelectCellEditorProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    Math.max(
      values.findIndex((v) => v.value === value),
      0,
    ),
  );

  const listRef = useRef<HTMLDivElement>(null);
  const wasCancelledRef = useRef(false);

  useGridCellEditor({
    isCancelAfterEnd: () => wasCancelledRef.current,
  });

  // Focus + scroll on mount
  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.focus());
  }, []);

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const selectAndClose = useCallback(
    (val: string) => {
      onValueChange(val);
      requestAnimationFrame(() => stopEditing());
    },
    [onValueChange, stopEditing],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.stopPropagation();
          e.preventDefault();
          setHighlightedIndex((i) => (i + 1) % values.length);
          break;
        case 'ArrowUp':
          e.stopPropagation();
          e.preventDefault();
          setHighlightedIndex((i) => (i - 1 + values.length) % values.length);
          break;
        case 'Enter':
          e.stopPropagation();
          e.preventDefault();
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          selectAndClose(values[highlightedIndex]!.value);
          break;
        case 'Escape':
          e.stopPropagation();
          wasCancelledRef.current = true;
          stopEditing(true);
          break;
      }
    },
    [values, highlightedIndex, selectAndClose, stopEditing],
  );

  return (
    <div
      ref={listRef}
      className="flex w-60 flex-col overflow-y-auto bg-popover py-1 focus:outline-none"
      style={{ maxHeight: 240 }}
      tabIndex={0}
      role="listbox"
      aria-label="Select a value"
      onKeyDownCapture={handleKeyDown}
    >
      {values.map((option, index) => (
        <div
          key={option.value}
          role="option"
          aria-selected={option.value === value}
          onMouseDown={(e) => {
            e.preventDefault();
            selectAndClose(option.value);
          }}
          onMouseEnter={() => setHighlightedIndex(index)}
          className={`flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm transition-colors ${
            index === highlightedIndex ? 'bg-accent text-accent-foreground' : 'text-foreground'
          }`}
        >
          {option.label}
          {option.value === value && (
            <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}
