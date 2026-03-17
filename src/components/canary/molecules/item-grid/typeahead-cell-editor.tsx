'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGridCellEditor } from 'ag-grid-react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

// --- Types ---

export interface TypeaheadOption {
  label: string;
  value: string;
}

export interface TypeaheadCellEditorProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  stopEditing: (cancel?: boolean) => void;
  lookup: (search: string) => Promise<TypeaheadOption[]>;
  allowCreate?: boolean;
  placeholder?: string;
}

// --- Component ---
// Used with cellEditorPopup: true — AG Grid handles popup positioning.

export function TypeaheadCellEditor({
  value,
  onValueChange,
  stopEditing,
  lookup,
  allowCreate = false,
  placeholder = 'Search…',
}: TypeaheadCellEditorProps) {
  const [inputValue, setInputValue] = useState(value ?? '');
  const [options, setOptions] = useState<TypeaheadOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);
  const wasCancelledRef = useRef(false);

  useGridCellEditor({
    isCancelAfterEnd: () => wasCancelledRef.current,
  });

  // Focus + select on mount, trigger initial search
  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    doSearch(inputValue || '');
    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []); // intentionally run only on mount

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const doSearch = useCallback(
    (search: string) => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();

      setLoading(true);
      setError(false);
      debounceRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const results = await lookup(search);
          if (!controller.signal.aborted) {
            setOptions(results.slice(0, 8));
            setHighlightedIndex(results.length > 0 ? 0 : -1);
            setError(false);
          }
        } catch {
          if (!controller.signal.aborted) {
            setOptions([]);
            setError(true);
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }, 150);
    },
    [lookup],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onValueChange(val || null);
    doSearch(val);
  };

  const selectAndClose = useCallback(
    (label: string, val: string) => {
      setInputValue(label);
      onValueChange(val);
      requestAnimationFrame(() => stopEditing());
    },
    [onValueChange, stopEditing],
  );

  const showCreateOption =
    allowCreate && inputValue.trim() && !options.some((o) => o.value === inputValue);
  const totalOptions = options.length + (showCreateOption ? 1 : 0);
  const hasResults = options.length > 0 || showCreateOption;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.stopPropagation();
        e.preventDefault();
        if (totalOptions > 0) setHighlightedIndex((i) => (i + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.stopPropagation();
        e.preventDefault();
        if (totalOptions > 0) setHighlightedIndex((i) => (i - 1 + totalOptions) % totalOptions);
        break;
      case 'Enter':
        e.stopPropagation();
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
          if (opt) selectAndClose(opt.label, opt.value);
        } else if (highlightedIndex >= 0 && showCreateOption) {
          selectAndClose(inputValue, inputValue);
        } else {
          stopEditing();
        }
        break;
      case 'Escape':
        e.stopPropagation();
        wasCancelledRef.current = true;
        stopEditing(true);
        break;
      case 'Tab':
        break;
    }
  };

  return (
    <div className="flex w-60 flex-col bg-popover" role="combobox" aria-expanded={!!hasResults}>
      {/* Search input */}
      <div className="flex items-center px-3">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDownCapture={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          style={{ height: 'var(--control-height)' }}
          role="searchbox"
          aria-label={placeholder}
          aria-autocomplete="list"
        />
        {loading && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />}
      </div>

      {/* Results list */}
      {hasResults && (
        <div ref={listRef} className="max-h-48 overflow-y-auto py-1" role="listbox">
          {options.map((option, index) => (
            <div
              key={option.value}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                selectAndClose(option.label, option.value);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                index === highlightedIndex ? 'bg-accent text-accent-foreground' : 'text-foreground'
              }`}
            >
              {option.label}
            </div>
          ))}
          {showCreateOption && (
            <div
              role="option"
              aria-selected={highlightedIndex === options.length}
              onMouseDown={(e) => {
                e.preventDefault();
                selectAndClose(inputValue, inputValue);
              }}
              onMouseEnter={() => setHighlightedIndex(options.length)}
              className={`flex cursor-pointer items-center gap-1.5 border-t border-border px-3 py-1.5 text-sm font-medium transition-colors ${
                highlightedIndex === options.length
                  ? 'bg-accent text-accent-foreground'
                  : 'text-primary'
              }`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Create &ldquo;{inputValue}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
          Search failed — try again
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && inputValue.trim() && !hasResults && (
        <div className="px-3 py-2 text-xs text-muted-foreground">No results</div>
      )}
    </div>
  );
}
