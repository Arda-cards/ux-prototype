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

/**
 * Source of multiselect options. Either an async function (receives search
 * text, returns matches) or a static list (`MultiSelectOption[]` or `string[]`)
 * filtered client-side by label.
 */
export type MultiSelectSource =
  | ((search: string) => Promise<MultiSelectOption[]>)
  | MultiSelectOption[]
  | string[];

/** Normalize a MultiSelectSource into an async lookup function. */
function normalizeLookup(
  source: MultiSelectSource,
): (search: string) => Promise<MultiSelectOption[]> {
  if (typeof source === 'function') return source;
  const options: MultiSelectOption[] = source.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o,
  );
  return async (search: string) => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  };
}

export interface MultiSelectTypeaheadInputProps extends Omit<
  React.ComponentProps<'div'>,
  'onChange'
> {
  /** Currently selected values. */
  value: string[];
  /** Called when the selection changes. */
  onValueChange: (value: string[]) => void;
  /**
   * Options source — an async lookup function, or a static list of options
   * (`MultiSelectOption[]` or `string[]`) filtered client-side by label.
   */
  lookup: MultiSelectSource;
  /** Input placeholder text (shown when no tokens are selected). */
  placeholder?: string;
  /** Accessible label for the input. */
  'aria-label'?: string;
  /** Disable the input. */
  disabled?: boolean;
  /**
   * Cell editor mode — for use inside AG Grid or similar overflow-clipped containers.
   * Dropdown is portaled via Radix Popover to escape overflow clipping.
   */
  cellEditorMode?: boolean;
  /**
   * When true (default), Enter selects the highlighted item and signals commit
   * (exit edit mode in grid context). Enter never unchecks a selected item.
   * When false, Enter adds the highlighted item without exiting — the dropdown
   * stays open for continued selection.
   */
  defaultOne?: boolean;
  /**
   * Called when the user commits the selection (Enter with defaultOne, or Tab).
   * In cell editor context, this signals "stop editing".
   */
  onCommit?: () => void;
  /** Maximum number of dropdown results to show. Defaults to 8. */
  maxResults?: number;
}

const DEFAULT_MAX_RESULTS = 8;
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
 * Overflows to "+N more" when tokens exceed the container width.
 * Dropdown items show a checkmark when already selected.
 */
export function MultiSelectTypeaheadInput({
  value,
  onValueChange,
  lookup,
  placeholder = 'Search\u2026',
  'aria-label': ariaLabel,
  disabled = false,
  cellEditorMode = false,
  defaultOne = true,
  onCommit,
  maxResults = DEFAULT_MAX_RESULTS,
  className,
  ...rest
}: MultiSelectTypeaheadInputProps) {
  // Normalize the lookup source (function | options[] | string[]) into a
  // single async lookup function.
  const lookupFn = React.useMemo(() => normalizeLookup(lookup), [lookup]);

  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<MultiSelectOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [focusedTokenIndex, setFocusedTokenIndex] = React.useState(-1);
  const instanceId = React.useId();
  const listboxId = `multiselect-listbox-${instanceId}`;
  const optionId = (index: number) => `multiselect-opt-${instanceId}-${index}`;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const tokenRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
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

  // Auto-focus input on mount in cell editor mode so the dropdown opens
  // immediately and all tokens are visible for keyboard navigation.
  React.useEffect(() => {
    if (cellEditorMode) {
      inputRef.current?.focus();
    }
  }, [cellEditorMode]);

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

  // Choosing an option — from Enter or a click. With defaultOne, selecting
  // (never unselecting) commits and closes; otherwise it toggles and stays open.
  const chooseOption = React.useCallback(
    (optionValue: string) => {
      if (defaultOne) {
        if (!valueRef.current.includes(optionValue)) {
          onValueChange([...valueRef.current, optionValue]);
        }
        setOpen(false);
        setInputValue('');
        onCommit?.();
      } else {
        toggleOption(optionValue);
      }
    },
    [defaultOne, onValueChange, onCommit, toggleOption],
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

  // Clicking the input reopens the dropdown when it's already focused (focus
  // alone won't re-fire, e.g. after a defaultOne selection closed it).
  const handleInputClick = React.useCallback(() => {
    if (!open) {
      setOpen(true);
      doSearch(inputValueRef.current);
    }
  }, [open, doSearch]);

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

  // --- Focus helpers ---
  const focusToken = React.useCallback((index: number) => {
    setFocusedTokenIndex(index);
    setHighlightedIndex(-1);
    tokenRefs.current[index]?.focus();
  }, []);

  const focusInput = React.useCallback(() => {
    setFocusedTokenIndex(-1);
    inputRef.current?.focus();
  }, []);

  // --- Token keyboard handler ---
  const handleTokenKeyDown = React.useCallback(
    (e: React.KeyboardEvent, tokenIndex: number) => {
      const tokens = valueRef.current;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (tokenIndex > 0) {
            focusToken(tokenIndex - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (tokenIndex < tokens.length - 1) {
            focusToken(tokenIndex + 1);
          } else {
            focusInput();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          focusInput();
          setOpen(true);
          doSearch(inputValueRef.current);
          break;
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          {
            const removedValue = tokens[tokenIndex];
            if (removedValue) {
              onValueChange(tokens.filter((v) => v !== removedValue));
            }
            // Focus neighbor or input
            if (tokens.length <= 1) {
              focusInput();
            } else if (tokenIndex > 0) {
              // Will shift, so focus same index - 1
              setTimeout(() => focusToken(tokenIndex - 1), 0);
            } else {
              setTimeout(() => focusToken(0), 0);
            }
          }
          break;
        default:
          // Any printable character → focus input and let it handle the key
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            focusInput();
            // Don't prevent default — let the character reach the input
          }
          break;
      }
    },
    [focusToken, focusInput, doSearch, onValueChange],
  );

  // --- Input keyboard handler ---
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      // Left arrow at cursor position 0 with empty input → focus last token
      if (e.key === 'ArrowLeft' && inputValueRef.current === '' && valueRef.current.length > 0) {
        e.preventDefault();
        focusToken(valueRef.current.length - 1);
        return;
      }

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
          if (hi <= 0 && valueRef.current.length > 0) {
            // At top of dropdown → focus last token
            focusToken(valueRef.current.length - 1);
          } else {
            setHighlightedIndex((prev) => (prev - 1 + opts.length) % opts.length);
          }
          break;
        case 'Enter':
          e.preventDefault();
          {
            const opt = opts[hi];
            if (hi >= 0 && opt) {
              chooseOption(opt.value);
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
          onCommit?.();
          break;
      }
    },
    [open, doSearch, focusToken, chooseOption, onValueChange, onCommit],
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
  const isEditing = open || focusedTokenIndex >= 0;

  // Dynamic overflow: measure how many tokens fit in one line.
  // Uses the same hidden-measurer + ResizeObserver pattern as OverflowToolbar.
  const measurerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(value.length);
  const TOKEN_GAP = 4; // gap-1 = 0.25rem = 4px
  const OVERFLOW_LABEL_WIDTH = 56; // "+N more" text approximate width

  React.useEffect(() => {
    if (isEditing) {
      setVisibleCount(value.length);
      return;
    }
    const measurer = measurerRef.current;
    const container = wrapperRef.current;
    if (!measurer || !container) return;

    const measure = () => {
      const containerWidth = container.offsetWidth - 16; // px-2 padding both sides
      const items = Array.from(measurer.children) as HTMLElement[];
      let usedWidth = 0;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) break;
        const itemWidth = item.offsetWidth + (i > 0 ? TOKEN_GAP : 0);
        const needsOverflow = i < items.length - 1;
        const reserve = needsOverflow ? OVERFLOW_LABEL_WIDTH + TOKEN_GAP : 0;
        if (usedWidth + itemWidth + reserve <= containerWidth) {
          usedWidth += itemWidth;
          count++;
        } else {
          break;
        }
      }
      setVisibleCount(count === items.length ? items.length : count);
    };

    const observer = new ResizeObserver(() => requestAnimationFrame(measure));
    observer.observe(container);
    requestAnimationFrame(measure);
    return () => observer.disconnect();
  }, [value, isEditing]);

  const visibleTokens = isEditing ? value : value.slice(0, visibleCount);
  const overflowCount = isEditing ? 0 : value.length - visibleCount;

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
                chooseOption(opt.value);
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
        'flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-sm',
        'focus-within:ring-2 focus-within:ring-ring',
        disabled && 'opacity-50 cursor-not-allowed',
        // Collapsed: single line, clip overflow so the field never grows tall.
        // Editing: wrap tokens onto multiple lines.
        isEditing ? 'flex-wrap' : 'flex-nowrap overflow-hidden',
        // In cell editor mode the AG Grid cell supplies the edit border, so drop
        // our own border / radius / focus ring. Fill the cell exactly and remove
        // vertical padding so content centers at the same height as the read cell.
        cellEditorMode && 'h-full py-0 rounded-none border-0 shadow-none focus-within:ring-0',
        // Expand as overlay when editing (standalone mode only) — absolute
        // position so tokens wrap without pushing layout. In cellEditorMode,
        // AG Grid's popup editor handles expansion, so we just show all tokens.
        !cellEditorMode &&
          isEditing &&
          'absolute inset-x-0 top-0 z-10 bg-background border border-input rounded-md',
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {visibleTokens.map((tokenValue, i) => (
        <span
          key={tokenValue}
          ref={(el) => {
            tokenRefs.current[i] = el;
          }}
          data-token
          tabIndex={-1}
          onMouseDown={(e) => {
            // Select the token (focus it for keyboard nav) and open the
            // dropdown. Stop the wrapper onClick from stealing focus to the input.
            e.preventDefault();
            e.stopPropagation();
            focusToken(i);
            setOpen(true);
            doSearch(inputValueRef.current);
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => handleTokenKeyDown(e, i)}
          onFocus={() => setFocusedTokenIndex(i)}
          onBlur={() => setFocusedTokenIndex(-1)}
          className={cn(
            'shrink-0 rounded-md outline-none',
            focusedTokenIndex === i && 'ring-2 ring-ring',
          )}
        >
          <Badge variant="secondary" className="text-xs">
            {tokenValue}
          </Badge>
        </span>
      ))}
      {overflowCount > 0 && (
        <span className="shrink-0 whitespace-nowrap px-1 text-xs font-medium text-muted-foreground">
          +{overflowCount} more
        </span>
      )}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onClick={handleInputClick}
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
      className={cn('relative min-h-9', cellEditorMode && 'h-full', className)}
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

      {/* Hidden measurer — renders all tokens off-screen to measure widths */}
      <div
        ref={measurerRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-[-9999px] top-0 flex items-center gap-1"
        style={{ visibility: 'hidden' }}
      >
        {value.map((tokenValue) => (
          <Badge key={tokenValue} variant="secondary" className="text-xs">
            {tokenValue}
          </Badge>
        ))}
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
