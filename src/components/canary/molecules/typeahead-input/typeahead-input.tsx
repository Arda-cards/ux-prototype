import * as React from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { Input } from '@/components/canary/primitives/input';

// --- Types ---

export interface TypeaheadOption {
  label: string;
  value: string;
}

export interface TypeaheadInputProps {
  /** Current value. */
  value: string;
  /** Called when the user selects or creates a value. */
  onChange: (value: string) => void;
  /** Async lookup function — receives search text, returns matching options. */
  lookup: (search: string) => Promise<TypeaheadOption[]>;
  /** Allow creating new values not in the lookup results. */
  allowCreate?: boolean;
  /** Input placeholder text. */
  placeholder?: string;
  /** Disable the input. */
  disabled?: boolean;
  /** Additional class names for the wrapper. */
  className?: string;
}

const MAX_RESULTS = 8;
const DEBOUNCE_MS = 150;

// --- Component ---

/**
 * TypeaheadInput — async search input with filtered dropdown.
 *
 * Debounces search, shows up to 8 results, supports keyboard navigation
 * and optional creation of new values. Standalone — no AG Grid dependency.
 */
export function TypeaheadInput({
  value,
  onChange,
  lookup,
  allowCreate = false,
  placeholder = 'Search\u2026',
  disabled = false,
  className,
}: TypeaheadInputProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [options, setOptions] = React.useState<TypeaheadOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = React.useRef<AbortController>(undefined);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Sync external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  // --- Search ---
  const doSearch = React.useCallback(
    async (search: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(false);

      try {
        const results = await lookup(search);
        if (controller.signal.aborted) return;
        setOptions(results.slice(0, MAX_RESULTS));
        setHighlightedIndex(-1);
        setLoading(false);
      } catch {
        if (controller.signal.aborted) return;
        setError(true);
        setLoading(false);
        setOptions([]);
      }
    },
    [lookup],
  );

  const debouncedSearch = React.useCallback(
    (search: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(search), DEBOUNCE_MS);
    },
    [doSearch],
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  // --- Selection ---
  const selectOption = React.useCallback(
    (opt: TypeaheadOption) => {
      setInputValue(opt.value);
      onChange(opt.value);
      setOpen(false);
      setOptions([]);
    },
    [onChange],
  );

  const createValue = React.useCallback(
    (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return;
      setInputValue(trimmed);
      onChange(trimmed);
      setOpen(false);
      setOptions([]);
    },
    [onChange],
  );

  // --- Show "create" option? ---
  const trimmedInput = inputValue.trim();
  const exactMatch = options.some((o) => o.value.toLowerCase() === trimmedInput.toLowerCase());
  const showCreate = allowCreate && trimmedInput.length > 0 && !exactMatch;
  const totalItems = options.length + (showCreate ? 1 : 0);

  // --- Input handlers ---
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      setOpen(true);
      debouncedSearch(val);
    },
    [debouncedSearch],
  );

  const handleFocus = React.useCallback(() => {
    setOpen(true);
    doSearch(inputValue);
  }, [doSearch, inputValue]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Revert to last confirmed value if input changed
        if (inputValue.trim() !== value) {
          setInputValue(value);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, inputValue, value]);

  // --- Keyboard ---
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          setOpen(true);
          doSearch(inputValue);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            selectOption(options[highlightedIndex] as TypeaheadOption);
          } else if (showCreate && highlightedIndex === options.length) {
            createValue(trimmedInput);
          } else if (showCreate) {
            createValue(trimmedInput);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setInputValue(value);
          break;
        case 'Tab':
          // Accept current selection or typed value on Tab
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            selectOption(options[highlightedIndex] as TypeaheadOption);
          } else if (trimmedInput && allowCreate) {
            createValue(trimmedInput);
          }
          setOpen(false);
          break;
      }
    },
    [
      open,
      totalItems,
      highlightedIndex,
      options,
      showCreate,
      trimmedInput,
      selectOption,
      createValue,
      value,
      doSearch,
      inputValue,
      allowCreate,
    ],
  );

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const showDropdown = open && (loading || error || options.length > 0 || showCreate);

  return (
    <div ref={wrapperRef} className={cn('relative', className)} data-slot="typeahead-input">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDownCapture={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-activedescendant={
          highlightedIndex >= 0 ? `typeahead-opt-${highlightedIndex}` : undefined
        }
        autoComplete="off"
      />

      {showDropdown && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-1 max-h-52 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md"
        >
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching\u2026
            </div>
          )}

          {/* Error */}
          {error && (
            <button
              type="button"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent cursor-pointer"
              onClick={() => doSearch(inputValue)}
            >
              <AlertCircle className="w-4 h-4" />
              Failed to load. Click to retry.
            </button>
          )}

          {/* Options */}
          {!loading &&
            !error &&
            options.map((opt, i) => (
              <div
                key={opt.value}
                id={`typeahead-opt-${i}`}
                role="option"
                aria-selected={i === highlightedIndex}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer',
                  i === highlightedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50',
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(opt);
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
              >
                {opt.label}
              </div>
            ))}

          {/* Create new */}
          {!loading && !error && showCreate && (
            <div
              id={`typeahead-opt-${options.length}`}
              role="option"
              aria-selected={highlightedIndex === options.length}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                highlightedIndex === options.length
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                createValue(trimmedInput);
              }}
              onMouseEnter={() => setHighlightedIndex(options.length)}
            >
              <Plus className="w-4 h-4" />
              New: {trimmedInput}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && options.length === 0 && !showCreate && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
