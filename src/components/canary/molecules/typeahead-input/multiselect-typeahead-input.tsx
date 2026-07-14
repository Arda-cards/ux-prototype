import * as React from 'react';
import { Check, Loader2, AlertCircle, Plus, X } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { useDebouncedCallback } from '@/types/canary/utilities/use-debounced-callback';
import { TokenChip } from '@/components/canary/atoms/token-chip';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/canary/primitives/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/canary/primitives/tooltip';

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

/**
 * Optional per-token action rendered inside each token badge (revealed on
 * hover / token focus). Example: a direct-send composer marks one recipient
 * as the vendor's default.
 */
export interface MultiSelectTokenAction {
  /** Accessible label + tooltip for the action on a given token. */
  label: (value: string) => string;
  /** Icon rendered inside the action button (sized by the caller). */
  icon: React.ReactNode;
  onAction: (value: string) => void;
  /** Whether the action shows for this token. Defaults to always visible. */
  isVisible?: (value: string) => boolean;
}

/**
 * Optional per-option destroy affordance rendered at the far right of each
 * dropdown row, revealed while the row is hovered/highlighted. Example:
 * removing a stale address from the lookup source. Destructive by design —
 * hence the name: firing it does NOT select the option, and the option is
 * dropped from the current result list optimistically (the caller owns
 * removing it from the lookup source for future searches). Non-destructive
 * per-option actions would need a separate (plural) API.
 */
export interface MultiSelectOptionDestroy {
  /** Accessible label + tooltip for the destroy button on a given option. */
  label: (value: string) => string;
  /** Icon for the destroy button. Defaults to an ×. */
  icon?: React.ReactNode;
  onDestroy: (value: string) => void;
  /** Whether the destroy button shows for this option. Defaults to always visible. */
  isVisible?: (value: string) => boolean;
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
  /**
   * Allow creating values not in the lookup results. When the typed text has
   * no exact option match and isn't already selected, the dropdown offers a
   * create row (mirrors `TypeaheadInput`'s `allowCreate`).
   */
  allowCreate?: boolean;
  /** Per-token hover action (e.g. "set as default"). */
  tokenAction?: MultiSelectTokenAction;
  /** Per-option hover destroy button in the dropdown (e.g. "forget stale entry"). */
  optionDestroy?: MultiSelectOptionDestroy;
  /**
   * Chromeless variant — no border, background, padding, or focus ring, and
   * tokens always wrap inline (no "+N more" collapse or editing overlay).
   * For composed rows that own their own field styling, e.g. the labelled
   * recipient rows of an email composer. Standalone only (not for
   * `cellEditorMode`).
   */
  bare?: boolean;
  /**
   * Double-clicking a token removes it and puts its text back into the
   * input for editing (Gmail-style recipient chips). Best with
   * `allowCreate`, so the edited text can be re-committed even when it
   * matches no lookup option.
   */
  editOnDoubleClick?: boolean;
  /**
   * Cell geometry for `cellEditorMode` (popup). The editor matches the cell's
   * pixel width and uses the row height as its minimum height, so a single-line
   * popup aligns with the cell and grows taller as tokens wrap onto more lines.
   */
  cellWidth?: number;
  cellMinHeight?: number;
}

const DEFAULT_MAX_RESULTS = 8;
const DEBOUNCE_MS = 250;
// Two presses on the same token within this window count as a double-click
// (matches typical OS double-click thresholds).
const DOUBLE_PRESS_MS = 500;

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
 * Shows selected values as Badge tokens in the input area. Tokens are
 * keyboard-removable (Backspace / Delete with the token focused, or
 * Backspace at the start of an empty input removes the last token).
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
  allowCreate = false,
  tokenAction,
  optionDestroy,
  bare = false,
  editOnDoubleClick = false,
  cellWidth,
  cellMinHeight,
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
  // readOnly-until-focus: Chrome's saved-address autofill previews into every
  // email-shaped input in a form-like constellation at once and ignores
  // autocomplete="off" — but it never touches read-only inputs. The field
  // becomes editable in its own focus event, before any keystroke.
  const [interactive, setInteractive] = React.useState(false);
  const instanceId = React.useId();
  const listboxId = `multiselect-listbox-${instanceId}`;
  const optionId = (index: number) => `multiselect-opt-${instanceId}-${index}`;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const tokenRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  // Last pointerdown on a token — for editOnDoubleClick double-press detection.
  const lastTokenPress = React.useRef<{ token: string; time: number } | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Monotonic token so only the latest search may apply its results. The
  // lookup itself is not cancellable (MultiSelectSource takes no AbortSignal);
  // a superseded request simply has its result ignored. No unmount cleanup is
  // needed either: the debounce hook cancels its own timer, and a setState
  // after unmount is a safe no-op in React 18+.
  const searchSeqRef = React.useRef(0);
  // The search string that produced the current `options` — lets blur-time
  // resolution tell whether the visible results match what the user typed.
  const optionsQueryRef = React.useRef<string | null>(null);

  // --- Search ---
  // Handlers here and below are plain functions, not useCallback: nothing
  // consumes their identity (no memoized children, no external subscriptions
  // holding a reference), so they can simply close over the current render's
  // state.
  const doSearch = async (search: string) => {
    const seq = ++searchSeqRef.current;

    setLoading(true);
    setError(false);

    try {
      const results = await lookupFn(search);
      if (seq !== searchSeqRef.current) return; // superseded by a newer search
      const sliced = results.slice(0, maxResults);
      setOptions(sliced);
      optionsQueryRef.current = search;
      setHighlightedIndex(sliced.length > 0 ? 0 : -1);
      setLoading(false);
    } catch {
      if (seq !== searchSeqRef.current) return;
      setError(true);
      setLoading(false);
      setOptions([]);
    }
  };

  const debouncedSearch = useDebouncedCallback(doSearch, DEBOUNCE_MS);

  // Auto-focus input on mount in cell editor mode so the dropdown opens
  // immediately and all tokens are visible for keyboard navigation.
  React.useEffect(() => {
    if (cellEditorMode) {
      inputRef.current?.focus();
    }
  }, [cellEditorMode]);

  // --- Selection ---
  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onValueChange(value.filter((v) => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
    // Keep dropdown open, clear search, refocus input
    setInputValue('');
    inputRef.current?.focus();
  };

  // Choosing an option — from Enter or a click. With defaultOne, selecting
  // (never unselecting) commits and closes; otherwise it toggles and stays open.
  const chooseOption = (optionValue: string) => {
    if (defaultOne) {
      if (!value.includes(optionValue)) {
        onValueChange([...value, optionValue]);
      }
      setOpen(false);
      setInputValue('');
      onCommit?.();
    } else {
      toggleOption(optionValue);
    }
  };

  // Creating a typed value (allowCreate) — same close semantics as choosing.
  const createValue = (raw: string) => {
    const created = raw.trim();
    if (!created) return;
    if (!value.some((v) => v.toLowerCase() === created.toLowerCase())) {
      onValueChange([...value, created]);
    }
    if (defaultOne) {
      setOpen(false);
      setInputValue('');
      onCommit?.();
    } else {
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  // --- Input handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setOpen(true);
    debouncedSearch(val);
  };

  const handleFocus = () => {
    setInteractive(true);
    setOpen(true);
    doSearch(inputValue);
  };

  // Clicking the input reopens the dropdown when it's already focused (focus
  // alone won't re-fire, e.g. after a defaultOne selection closed it).
  const handleInputClick = () => {
    if (!open) {
      setOpen(true);
      doSearch(inputValue);
    }
  };

  // Clicking out with typed text must not silently discard it (mirrors
  // TypeaheadInput's form-mode blur resolution):
  //   perfect match (label or value) → add it, even when create is on
  //   else, create allowed           → add the exact typed text
  //   else, options present          → add the highlighted row (falls back
  //                                    to the first result)
  //   else                           → discard the text
  const commitOnOutsideClick = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      const addToken = (v: string) => {
        if (!value.some((x) => x.toLowerCase() === v.toLowerCase())) {
          onValueChange([...value, v]);
        }
        // Outside click ends the interaction — same commit signal as
        // Enter-with-defaultOne / Tab. Grids stop editing on their own.
        if (!cellEditorMode) onCommit?.();
      };
      const perfect = options.find(
        (o) =>
          o.value.toLowerCase() === trimmed.toLowerCase() ||
          o.label.toLowerCase() === trimmed.toLowerCase(),
      );
      // The highlighted/first pick is only trustworthy when the visible
      // results were produced by the current text — not mid-debounce or
      // mid-fetch, when they still reflect an older query. (A perfect match
      // is exact against the typed text, so staleness can't mislead it.)
      const resultsAreCurrent = !loading && optionsQueryRef.current === trimmed;
      if (perfect) {
        addToken(perfect.value);
      } else if (allowCreate) {
        addToken(trimmed);
      } else if (resultsAreCurrent && options.length > 0) {
        const pick =
          highlightedIndex >= 0 && highlightedIndex < options.length
            ? options[highlightedIndex]
            : options[0];
        if (pick) addToken(pick.value);
      }
    }
    setOpen(false);
    setInputValue('');
  };

  // Close on outside click. Attach the listener once on mount and read `open`
  // via a ref so the listener isn't torn down + re-added on every open/close
  // cycle — the previous `[open]` dep created a one-frame window during the
  // transition where no listener was active, and a fast click in that window
  // would slip through and leave the dropdown open. The commit logic needs
  // current state, so the once-attached listener dispatches through a
  // latest-callback ref.
  const openRef = React.useRef(open);
  openRef.current = open;
  const commitOnOutsideClickRef = React.useRef(commitOnOutsideClick);
  commitOnOutsideClickRef.current = commitOnOutsideClick;
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!openRef.current) return;
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        commitOnOutsideClickRef.current();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Focus helpers ---
  const focusToken = (index: number) => {
    setFocusedTokenIndex(index);
    setHighlightedIndex(-1);
    tokenRefs.current[index]?.focus();
  };

  const focusInput = () => {
    setFocusedTokenIndex(-1);
    inputRef.current?.focus();
  };

  // --- Token keyboard handler ---
  const handleTokenKeyDown = (e: React.KeyboardEvent, tokenIndex: number) => {
    const tokens = value;
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
        doSearch(inputValue);
        break;
      case 'Backspace':
      case 'Delete':
      case 'Enter':
      case ' ':
        // Enter / Space are the standard activation keys for a role="button"
        // element; activating a token removes it, matching Backspace/Delete.
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
  };

  // --- Input keyboard handler ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Left arrow at cursor position 0 with empty input → focus last token
    if (e.key === 'ArrowLeft' && inputValue === '' && value.length > 0) {
      e.preventDefault();
      focusToken(value.length - 1);
      return;
    }

    // Backspace with empty input removes last token
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onValueChange(value.slice(0, -1));
      return;
    }

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
        doSearch(inputValue);
      }
      return;
    }

    const opts = options;
    const hi = highlightedIndex;
    // The create row (allowCreate) occupies index opts.length when active.
    const trimmed = inputValue.trim();
    const canCreate =
      allowCreate &&
      trimmed.length > 0 &&
      !opts.some((o) => o.value.toLowerCase() === trimmed.toLowerCase()) &&
      !value.some((v) => v.toLowerCase() === trimmed.toLowerCase());
    const total = opts.length + (canCreate ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // Guard against total === 0 (possible while loading/error):
        // the modulo would produce NaN and break the highlight state.
        if (total === 0) break;
        setHighlightedIndex((prev) => (prev + 1) % total);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (hi <= 0 && value.length > 0) {
          // At top of dropdown → focus last token
          focusToken(value.length - 1);
        } else if (total > 0) {
          setHighlightedIndex((prev) => (prev - 1 + total) % total);
        }
        break;
      case 'Enter':
        e.preventDefault();
        {
          const opt = opts[hi];
          if (hi >= 0 && opt) {
            chooseOption(opt.value);
          } else if (canCreate) {
            // Highlight on the create row, or plain Enter on typed text.
            createValue(inputValue);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setInputValue('');
        break;
      case 'Tab':
        // In a grid, let AG Grid handle Tab (commit + move to the next
        // editable cell). Just close the dropdown; do NOT stopEditing here or
        // focus escapes to the next row.
        if (!cellEditorMode) {
          if (canCreate) {
            // Tab with un-committed typed text keeps it (mirrors TypeaheadInput).
            createValue(inputValue);
          }
          // createValue already commits when defaultOne — don't double-fire.
          if (!(canCreate && defaultOne)) onCommit?.();
        }
        setOpen(false);
        setInputValue('');
        break;
    }
  };

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  // Create row visibility (the keyboard handler recomputes this inline).
  const trimmedInput = inputValue.trim();
  const showCreate =
    allowCreate &&
    trimmedInput.length > 0 &&
    !options.some((o) => o.value.toLowerCase() === trimmedInput.toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === trimmedInput.toLowerCase());

  const showDropdown = open && (loading || error || options.length > 0 || showCreate);

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
    if (bare || isEditing) {
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
  }, [value, isEditing, bare]);

  const visibleTokens = bare || isEditing ? value : value.slice(0, visibleCount);
  const overflowCount = bare || isEditing ? 0 : value.length - visibleCount;

  const fireOptionDestroy = (optionValue: string) => {
    if (!optionDestroy) return;
    optionDestroy.onDestroy(optionValue);
    // Optimistically drop the row; the caller owns removing it from the
    // lookup source for future searches.
    setOptions((prev) => prev.filter((o) => o.value !== optionValue));
    setHighlightedIndex(-1);
  };

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
                'group/option flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
                i === highlightedIndex && 'bg-accent text-accent-foreground',
              )}
              onPointerDown={(e) => {
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
              <span className="min-w-0 flex-1 truncate">{opt.label}</span>
              {optionDestroy && (optionDestroy.isVisible?.(opt.value) ?? true) && (
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={optionDestroy.label(opt.value)}
                      className={cn(
                        'ml-auto inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                        'text-muted-foreground transition-opacity hover:bg-border hover:text-destructive',
                        // Revealed while the row is hovered or keyboard-highlighted.
                        'opacity-0 group-hover/option:opacity-100',
                        i === highlightedIndex && 'opacity-100',
                      )}
                      onPointerDown={(e) => {
                        // Don't let the row's pointerdown select the option.
                        e.preventDefault();
                        e.stopPropagation();
                        fireOptionDestroy(opt.value);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Keyboard / assistive-tech activation (no pointerdown).
                        if (e.detail === 0) fireOptionDestroy(opt.value);
                      }}
                    >
                      {optionDestroy.icon ?? <X className="h-3 w-3" aria-hidden="true" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{optionDestroy.label(opt.value)}</TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        })}

      {!loading && !error && showCreate && (
        <div
          id={optionId(options.length)}
          role="option"
          aria-selected={highlightedIndex === options.length}
          className={cn(
            'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary',
            highlightedIndex === options.length && 'bg-accent text-primary',
          )}
          onPointerDown={(e) => {
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

  // --- Input area with tokens ---
  const inputArea = (
    <div
      className={cn(
        'flex items-center gap-1 text-sm',
        // Bare: chromeless, always wrapping — the composed row owns the field
        // styling. Default: input chrome with a soft :focus-within ring
        // (matches form inputs; a container, so not :focus). Cell editor mode
        // bumps the ring to full opacity.
        bare
          ? 'flex-wrap bg-transparent'
          : 'rounded-md border border-input bg-background px-2 py-1 ' +
              'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        disabled && 'opacity-50 cursor-not-allowed',
        // Collapsed: single line, clip overflow so the field never grows tall.
        // Editing: wrap tokens onto multiple lines.
        !bare && (isEditing ? 'flex-wrap' : 'flex-nowrap overflow-hidden'),
        // Cell editor mode renders in an AG Grid popup ('over' the cell). Keep
        // the normal input chrome (rounded border + focus ring from the base) —
        // a popup floats, so AG Grid does not draw a cell edit border around it.
        // Width + min-height come from the cell via inline style, so the popup
        // aligns with the cell on one line and grows downward as tokens wrap.
        // `min-w-60` keeps the editor usable on narrow columns (extends past the
        // cell edge; AG Grid keeps the popup in bounds). px-3 matches cell padding.
        // 2px full-opacity accent ring in edit mode (3px reads too bold).
        cellEditorMode && 'min-w-60 px-3 py-1.5 focus-within:ring-2 focus-within:ring-ring',
        // Standalone editing: expand as an absolute overlay so wrapped tokens
        // don't push surrounding layout. Bare mode always wraps inline instead
        // (pushing layout, like any chip row).
        !cellEditorMode &&
          !bare &&
          isEditing &&
          'absolute inset-x-0 top-0 z-10 bg-background border border-input rounded-md',
      )}
      style={cellEditorMode ? { width: cellWidth, minHeight: cellMinHeight } : undefined}
      onClick={() => inputRef.current?.focus()}
    >
      {visibleTokens.map((tokenValue, i) => (
        <span
          key={tokenValue}
          ref={(el) => {
            tokenRefs.current[i] = el;
          }}
          data-token
          role="button"
          aria-label={`${tokenValue}, remove`}
          aria-keyshortcuts="Delete Backspace Enter Space"
          tabIndex={-1}
          onPointerDown={(e) => {
            // Select the token (focus it for keyboard nav) and open the
            // dropdown. Stop the wrapper onClick from stealing focus to the input.
            // Pointer events (vs mouse) ensure iOS Safari fires the handler
            // before the document outside-click closes the dropdown.
            e.preventDefault();
            e.stopPropagation();
            // Double-press detection lives here rather than onDoubleClick:
            // preventDefault on pointerdown suppresses the compatibility
            // mouse-event sequence (click/dblclick) in browsers that follow
            // the Pointer Events spec.
            const now = Date.now();
            const prev = lastTokenPress.current;
            lastTokenPress.current = { token: tokenValue, time: now };
            if (
              editOnDoubleClick &&
              prev &&
              prev.token === tokenValue &&
              now - prev.time < DOUBLE_PRESS_MS
            ) {
              // Put the token back into the input for editing.
              lastTokenPress.current = null;
              onValueChange(value.filter((v) => v !== tokenValue));
              setInputValue(tokenValue);
              setFocusedTokenIndex(-1);
              inputRef.current?.focus();
              setOpen(true);
              doSearch(tokenValue);
              return;
            }
            focusToken(i);
            setOpen(true);
            doSearch(inputValue);
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => handleTokenKeyDown(e, i)}
          onFocus={() => setFocusedTokenIndex(i)}
          onBlur={() => setFocusedTokenIndex(-1)}
          className={cn(
            'group/token shrink-0 rounded-md outline-none',
            focusedTokenIndex === i && 'ring-2 ring-ring',
          )}
        >
          {/* The shared recipient pill. TokenChip's internal buttons shield
              pointerdown, so they don't focus the token / open the dropdown /
              count toward double-press editing. */}
          <TokenChip
            value={tokenValue}
            actionVisible={focusedTokenIndex === i}
            {...(editOnDoubleClick ? { tooltip: 'Double-click to edit' } : {})}
            action={
              tokenAction && (tokenAction.isVisible?.(tokenValue) ?? true)
                ? {
                    label: tokenAction.label(tokenValue),
                    icon: tokenAction.icon,
                    onAction: () => tokenAction.onAction(tokenValue),
                  }
                : null
            }
            onRemove={() => {
              onValueChange(value.filter((v) => v !== tokenValue));
              if (value.length <= 1) focusInput();
            }}
          />
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
        onBlur={() => setInteractive(false)}
        onClick={handleInputClick}
        readOnly={!interactive}
        onKeyDownCapture={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled}
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-controls={showDropdown ? listboxId : undefined}
        aria-activedescendant={highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
        aria-label={ariaLabel ?? placeholder}
        // Suppress browser + password-manager autofill. autoComplete="off"
        // alone is not enough: Chrome's saved-address heuristics match
        // email-shaped inputs (by label/content) and keep suggesting saved
        // contacts even on the focused field. "one-time-code" is a valid
        // token Chrome respects and never address-fills; readOnly-until-focus
        // (below) stops the multi-field ghost preview. The data-* attributes
        // opt out of 1Password/LastPass.
        autoComplete="one-time-code"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        name="typeahead-search"
        data-1p-ignore
        data-lpignore="true"
        className="flex-1 min-w-[60px] bg-transparent outline-none placeholder:text-muted-foreground h-7"
      />
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className={cn('relative', cellEditorMode ? 'w-fit' : bare ? 'min-h-7' : 'min-h-9', className)}
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

      {/* Hidden measurer — renders all tokens off-screen to measure widths.
          Bare mode never collapses, so it needs no measurement. */}
      {!bare && (
        <div
          ref={measurerRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-[-9999px] top-0 flex items-center gap-1"
          style={{ visibility: 'hidden' }}
        >
          {value.map((tokenValue) => (
            // Mirrors the rest-state chip (× only — the token action is
            // zero-width at rest, so it doesn't count toward overflow math).
            <TokenChip key={tokenValue} value={tokenValue} onRemove={() => {}} />
          ))}
        </div>
      )}

      <Popover open={showDropdown}>
        <PopoverAnchor asChild>{inputArea}</PopoverAnchor>
        <PopoverContent
          ref={popoverRef}
          align="start"
          sideOffset={4}
          className="w-(--radix-popover-trigger-width) p-1 max-h-52 overflow-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {dropdownList}
        </PopoverContent>
      </Popover>
    </div>
  );
}
