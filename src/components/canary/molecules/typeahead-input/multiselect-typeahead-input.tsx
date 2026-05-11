import * as React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { Badge } from '@/components/canary/atoms/badge/badge';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/canary/primitives/popover';

// --- Types ---

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectTypeaheadInputProps extends Omit<
  React.ComponentProps<'div'>,
  'onChange'
> {
  /** Currently selected values. */
  value: string[];
  /** Called when the selection changes. */
  onValueChange: (value: string[]) => void;
  /** Async lookup function — receives search text, returns matching options. */
  lookup: (search: string) => Promise<MultiSelectOption[]>;
  /** Input placeholder text (shown when no tokens are selected). */
  placeholder?: string;
  /** Maximum visible tokens before showing "+N more". Defaults to 2. */
  maxVisible?: number;
  /** Accessible label for the input. */
  'aria-label'?: string;
  /** Disable the input. */
  disabled?: boolean;
  /**
   * Cell editor mode — for use inside AG Grid or similar overflow-clipped containers.
   * Dropdown is portaled via Radix Popover to escape overflow clipping.
   */
  cellEditorMode?: boolean;
}

const MAX_RESULTS = 8;
const DEBOUNCE_MS = 250;

// Hoisted static JSX
const loadingIndicator = (
  <div className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground">
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
    Searching&hellip;
  </div>
);

const noResults = <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>;

// --- Component ---

/**
 * MultiSelectTypeaheadInput — async search input with multiselect.
 *
 * Shows selected values as dismissible Badge tokens in the input area.
 * Overflows to "+N more" when tokens exceed `maxVisible`.
 * Dropdown items show a checkmark when already selected.
 */
export function MultiSelectTypeaheadInput({
  value,
  onValueChange,
  lookup,
  placeholder = 'Search\u2026',
  maxVisible = 2,
  'aria-label': ariaLabel,
  disabled = false,
  cellEditorMode = false,
  className,
  ...rest
}: MultiSelectTypeaheadInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<MultiSelectOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const instanceId = React.useId();
  const listboxId = `multiselect-listbox-${instanceId}`;
  const optionId = (index: number) => `multiselect-opt-${instanceId}-${index}`;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = React.useRef<AbortController>(undefined);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Refs for stable callbacks
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const inputValueRef = React.useRef(inputValue);
  inputValueRef.current = inputValue;
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const highlightedRef = React.useRef(highlightedIndex);
  highlightedRef.current = highlightedIndex;

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
  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const toggleOption = React.useCallback(
    (optionValue: string) => {
      const current = valueRef.current;
      if (current.includes(optionValue)) {
        onValueChange(current.filter((v) => v !== optionValue));
      } else {
        onValueChange([...current, optionValue]);
      }
      // Keep dropdown open, clear search, refocus input
      setInputValue('');
      inputRef.current?.focus();
    },
    [onValueChange],
  );

  const removeToken = React.useCallback(
    (tokenValue: string) => {
      onValueChange(valueRef.current.filter((v) => v !== tokenValue));
      inputRef.current?.focus();
    },
    [onValueChange],
  );

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
    doSearch(inputValueRef.current);
  }, [doSearch]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
        setInputValue('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // --- Keyboard ---
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      // Backspace with empty input removes last token
      if (e.key === 'Backspace' && inputValueRef.current === '' && valueRef.current.length > 0) {
        onValueChange(valueRef.current.slice(0, -1));
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

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % opts.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + opts.length) % opts.length);
          break;
        case 'Enter':
          e.preventDefault();
          {
            const opt = opts[hi];
            if (hi >= 0 && opt) {
              toggleOption(opt.value);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setInputValue('');
          break;
        case 'Tab':
          setOpen(false);
          setInputValue('');
          break;
      }
    },
    [open, doSearch, toggleOption, onValueChange],
  );

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const showDropdown = open && (loading || error || options.length > 0);

  // Live region announcement
  const statusMessage = loading
    ? 'Searching'
    : error
      ? 'Failed to load results'
      : options.length > 0
        ? `${options.length} result${options.length === 1 ? '' : 's'} available`
        : open && inputValue.trim()
          ? 'No results'
          : '';

  // --- Token display ---
  const visibleTokens = value.slice(0, maxVisible);
  const overflowCount = value.length - maxVisible;

  // --- Dropdown list content ---
  const dropdownList = (
    <div ref={listRef} id={listboxId} role="listbox" aria-multiselectable="true">
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
        options.map((opt, i) => {
          const isSelected = selectedSet.has(opt.value);
          return (
            <div
              key={opt.value}
              id={optionId(i)}
              role="option"
              aria-selected={isSelected}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                i === highlightedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleOption(opt.value);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              <div
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/40',
                )}
              >
                {isSelected && <Check className="h-3 w-3" aria-hidden="true" />}
              </div>
              {opt.label}
            </div>
          );
        })}

      {!loading && !error && options.length === 0 && noResults}
    </div>
  );

  // --- Input area with tokens ---
  const inputArea = (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-sm',
        'focus-within:ring-2 focus-within:ring-ring',
        disabled && 'opacity-50 cursor-not-allowed',
        cellEditorMode && 'border-0 shadow-none bg-transparent focus-within:ring-0 h-full',
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {visibleTokens.map((tokenValue) => (
        <Badge
          key={tokenValue}
          variant="secondary"
          {...(disabled ? {} : { onDismiss: () => removeToken(tokenValue) })}
          className="text-xs"
        >
          {tokenValue}
        </Badge>
      ))}
      {overflowCount > 0 && (
        <span className="text-xs text-muted-foreground font-medium px-1">
          +{overflowCount} more
        </span>
      )}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDownCapture={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled}
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-controls={showDropdown ? listboxId : undefined}
        aria-activedescendant={highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
        aria-label={ariaLabel ?? placeholder}
        autoComplete="off"
        className="flex-1 min-w-[60px] bg-transparent outline-none placeholder:text-muted-foreground h-7"
      />
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className={cn('relative', className)}
      data-slot="multiselect-typeahead-input"
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
        <PopoverAnchor asChild>{inputArea}</PopoverAnchor>
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
