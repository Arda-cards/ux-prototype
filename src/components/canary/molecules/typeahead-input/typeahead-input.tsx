import * as React from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { Input } from '@/components/canary/primitives/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/canary/primitives/popover';

// --- Types ---

export interface TypeaheadOption {
  label: string;
  value: string;
}

/**
 * Source of typeahead options. Either:
 * - an async function that receives the search text and returns matches, or
 * - a static list (of `TypeaheadOption`s or plain strings) that is filtered
 *   client-side by label.
 */
export type TypeaheadSource =
  | ((search: string) => Promise<TypeaheadOption[]>)
  | TypeaheadOption[]
  | string[];

/** Normalize a TypeaheadSource into an async lookup function. */
function normalizeLookup(source: TypeaheadSource): (search: string) => Promise<TypeaheadOption[]> {
  if (typeof source === 'function') return source;
  const options: TypeaheadOption[] = source.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o,
  );
  return async (search: string) => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  };
}

export interface TypeaheadInputProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  /** Current value. */
  value: string;
  /** Called when the user selects or creates a value. */
  onValueChange: (value: string) => void;
  /**
   * Options source — an async lookup function, or a static list of options
   * (`TypeaheadOption[]` or `string[]`) filtered client-side by label.
   */
  lookup: TypeaheadSource;
  /** Allow creating new values not in the lookup results. */
  allowCreate?: boolean;
  /** Input placeholder text. */
  placeholder?: string;
  /** Accessible label for the input. */
  'aria-label'?: string;
  /** Disable the input. */
  disabled?: boolean;
  /**
   * Cell editor mode — for use inside AG Grid or similar overflow-clipped containers.
   * When true: blur accepts typed value (instead of reverting) and the dropdown
   * is portaled via Radix Popover to escape overflow clipping.
   */
  cellEditorMode?: boolean;
  /** Maximum number of dropdown results to show. Defaults to 8. */
  maxResults?: number;
  /**
   * When true, clears the input on focus to show an unfiltered list of results.
   * The original value is restored if the user exits without picking (Escape or
   * blur). Pressing Delete/Backspace while the input is empty clears the value
   * (calls `onValueChange('')`) and blurs.
   */
  clearOnFocus?: boolean;
}

const DEFAULT_MAX_RESULTS = 8;
const DEBOUNCE_MS = 250;
// LISTBOX_ID generated per instance via useId() — see component body

// Hoisted static JSX — avoids recreation on every render
const loadingIndicator = (
  <div className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground">
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
    Searching&hellip;
  </div>
);

const noResults = <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>;

// --- Component ---

/**
 * TypeaheadInput — async search input with filtered dropdown.
 *
 * Debounces search, shows up to 8 results, supports keyboard navigation
 * and optional creation of new values. Standalone — no AG Grid dependency.
 */
export function TypeaheadInput({
  value,
  onValueChange,
  lookup,
  allowCreate = false,
  placeholder = 'Search\u2026',
  'aria-label': ariaLabel,
  disabled = false,
  cellEditorMode = false,
  maxResults = DEFAULT_MAX_RESULTS,
  clearOnFocus = false,
  className,
  ...rest
}: TypeaheadInputProps) {
  // Normalize the lookup source (function | options[] | string[]) into a
  // single async lookup function.
  const lookupFn = React.useMemo(() => normalizeLookup(lookup), [lookup]);

  const [inputValue, setInputValue] = React.useState(value);
  const [options, setOptions] = React.useState<TypeaheadOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const instanceId = React.useId();
  const listboxId = `typeahead-listbox-${instanceId}`;
  const optionId = (index: number) => `typeahead-opt-${instanceId}-${index}`;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = React.useRef<AbortController>(undefined);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Refs for values used in stable callbacks
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const inputValueRef = React.useRef(inputValue);
  inputValueRef.current = inputValue;
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const highlightedRef = React.useRef(highlightedIndex);
  highlightedRef.current = highlightedIndex;

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
        const results = await lookupFn(search);
        if (controller.signal.aborted) return;
        const sliced = results.slice(0, maxResults);
        setOptions(sliced);
        setHighlightedIndex(sliced.length > 0 ? 0 : -1);
        setLoading(false);
      } catch {
        if (controller.signal.aborted) return;
        setError(true);
        setLoading(false);
        setOptions([]);
      }
    },
    [lookupFn, maxResults],
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
      onValueChange(opt.value);
      setOpen(false);
      setOptions([]);
    },
    [onValueChange],
  );

  const createValue = React.useCallback(
    (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return;
      setInputValue(trimmed);
      onValueChange(trimmed);
      setOpen(false);
      setOptions([]);
    },
    [onValueChange],
  );

  // --- Derived state ---
  const trimmedInput = inputValue.trim();
  const exactMatch = options.some((o) => o.value.toLowerCase() === trimmedInput.toLowerCase());
  const showCreate = allowCreate && trimmedInput.length > 0 && !exactMatch;

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
    if (clearOnFocus) {
      setInputValue('');
      doSearch('');
    } else {
      doSearch(inputValueRef.current);
    }
  }, [doSearch, clearOnFocus]);

  // Clicking the input reopens the dropdown when it's already focused (focus
  // alone won't re-fire, e.g. after selecting an option closed it).
  const handleInputClick = React.useCallback(() => {
    if (!open) {
      setOpen(true);
      doSearch(clearOnFocus ? '' : inputValueRef.current);
      if (clearOnFocus) setInputValue('');
    }
  }, [open, doSearch, clearOnFocus]);

  // Close on outside click — deps narrowed to [open, cellEditorMode] via refs
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check both the wrapper and the portaled Radix popover content.
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
        if (clearOnFocus) {
          // clearOnFocus: blur without selecting → restore the original value
          setInputValue(valueRef.current);
        } else if (cellEditorMode) {
          // Cell editor: accept typed value on blur
          const trimmed = inputValueRef.current.trim();
          if (trimmed && trimmed !== valueRef.current) {
            onValueChange(trimmed);
          }
        } else {
          // Form mode: revert to confirmed value
          if (inputValueRef.current.trim() !== valueRef.current) {
            setInputValue(valueRef.current);
          }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, cellEditorMode, clearOnFocus, onValueChange]);

  // --- Keyboard — uses refs for stable callback ---
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      // clearOnFocus: Delete/Backspace with empty input clears the value and blurs
      if (
        clearOnFocus &&
        (e.key === 'Delete' || e.key === 'Backspace') &&
        inputValueRef.current === ''
      ) {
        e.preventDefault();
        if (valueRef.current !== '') {
          onValueChange('');
        }
        setOpen(false);
        inputRef.current?.blur();
        return;
      }

      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          setOpen(true);
          doSearch(inputValueRef.current);
        }
        return;
      }

      const opts = optionsRef.current;
      const hi = highlightedRef.current;
      const total =
        opts.length +
        (allowCreate &&
        inputValueRef.current.trim().length > 0 &&
        !opts.some((o) => o.value.toLowerCase() === inputValueRef.current.trim().toLowerCase())
          ? 1
          : 0);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % total);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + total) % total);
          break;
        case 'Enter':
          e.preventDefault();
          if (hi >= 0 && hi < opts.length) {
            selectOption(opts[hi] as TypeaheadOption);
          } else if (hi === opts.length && total > opts.length) {
            createValue(inputValueRef.current.trim());
          } else if (total > opts.length) {
            createValue(inputValueRef.current.trim());
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setInputValue(valueRef.current);
          break;
        case 'Tab':
          if (hi >= 0 && hi < opts.length) {
            selectOption(opts[hi] as TypeaheadOption);
          } else if (inputValueRef.current.trim() && allowCreate) {
            createValue(inputValueRef.current.trim());
          } else if (cellEditorMode && inputValueRef.current.trim()) {
            onValueChange(inputValueRef.current.trim());
          }
          setOpen(false);
          break;
      }
    },
    [
      open,
      allowCreate,
      cellEditorMode,
      clearOnFocus,
      doSearch,
      selectOption,
      createValue,
      onValueChange,
    ],
  );

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const showDropdown = open && (loading || error || options.length > 0 || showCreate);

  // Live region announcement
  const statusMessage = loading
    ? 'Searching'
    : error
      ? 'Failed to load results'
      : options.length > 0
        ? `${options.length} result${options.length === 1 ? '' : 's'} available`
        : open && trimmedInput
          ? 'No results'
          : '';

  // --- Dropdown list content (shared between inline and portaled) ---
  const dropdownList = (
    <div ref={listRef} id={listboxId} role="listbox">
      {loading && loadingIndicator}

      {error && (
        <button
          type="button"
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent cursor-pointer"
          onClick={() => doSearch(inputValue)}
        >
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          Failed to load. Click to retry.
        </button>
      )}

      {!loading &&
        !error &&
        options.map((opt, i) => (
          <div
            key={opt.value}
            id={optionId(i)}
            role="option"
            aria-selected={i === highlightedIndex}
            className={cn(
              'px-3 py-2 text-sm cursor-pointer',
              i === highlightedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
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

      {!loading && !error && showCreate && (
        <div
          id={optionId(options.length)}
          role="option"
          aria-selected={highlightedIndex === options.length}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-primary',
            highlightedIndex === options.length ? 'bg-accent text-primary' : 'hover:bg-accent/50',
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            createValue(trimmedInput);
          }}
          onMouseEnter={() => setHighlightedIndex(options.length)}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {trimmedInput}
        </div>
      )}

      {!loading && !error && options.length === 0 && !showCreate && noResults}
    </div>
  );

  // --- Input element (shared) ---
  const inputElement = (
    <Input
      ref={inputRef}
      value={inputValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onClick={handleInputClick}
      onKeyDownCapture={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      aria-controls={showDropdown ? listboxId : undefined}
      aria-activedescendant={highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
      aria-label={ariaLabel ?? placeholder}
      autoComplete="off"
      className={
        cellEditorMode
          ? 'h-full py-0 rounded-none border-0 bg-background shadow-none focus-visible:border-transparent focus-visible:ring-0'
          : undefined
      }
    />
  );

  return (
    <div
      ref={wrapperRef}
      className={cn('relative', cellEditorMode && 'h-full', className)}
      data-slot="typeahead-input"
      data-state={open ? 'open' : 'closed'}
      data-loading={loading || undefined}
      data-disabled={disabled || undefined}
      data-cell-editor={cellEditorMode || undefined}
      {...rest}
    >
      {/* Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      <Popover open={showDropdown}>
        <PopoverAnchor asChild>{inputElement}</PopoverAnchor>
        <PopoverContent
          ref={popoverRef}
          align="start"
          sideOffset={4}
          className="w-(--radix-popover-trigger-width) p-0 max-h-52 overflow-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {dropdownList}
        </PopoverContent>
      </Popover>
    </div>
  );
}
