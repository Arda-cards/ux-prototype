/**
 * AffiliateTypeahead — consolidated typeahead for Business Affiliate lookup
 * with create-on-the-fly support.
 *
 * Combines generic typeahead UI (input, dropdown, keyboard nav) with
 * BA-specific data fetching (GET /lookup, POST /create).
 *
 * Based on ArdaTypeahead from @/components/extras/atoms/typeahead/typeahead.tsx,
 * consolidated into a single component for use-case story simplicity.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/utils';
import type { BusinessRoleType } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LookupResult {
  eId: string;
  name: string;
  roles: string[];
}

export interface AffiliateTypeaheadProps {
  /** Currently selected affiliate eId. */
  value?: string;

  /** Called when an existing affiliate is selected from the dropdown. */
  onSelect: (eId: string, name: string) => void;

  /**
   * Called when the user selects "[+] New supplier".
   * Should POST to the create endpoint and return the new eId.
   * If provided, the create-on-the-fly option is shown in the dropdown.
   */
  onCreate?: (name: string) => Promise<{ eId: string }>;

  /** Filter lookup results by role (default: no filter). */
  roleFilter?: BusinessRoleType;

  /** Input placeholder text. */
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AffiliateTypeahead({
  value: _value,
  onSelect,
  onCreate,
  roleFilter,
  placeholder = 'Search...',
}: AffiliateTypeaheadProps) {
  const inputId = useId();
  const listboxId = useId();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState('');

  // Data state
  const [options, setOptions] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Show create option when onCreate is provided and input has text,
  // regardless of whether there are existing matches.
  const showCreateOption = !!onCreate && !loading && internalValue.trim().length > 0;
  const totalOptions = options.length + (showCreateOption ? 1 : 0);

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const doLookup = useCallback(
    async (searchText: string) => {
      if (!searchText.trim()) {
        setOptions([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ name: searchText, limit: '10' });
        if (roleFilter) {
          params.set('role', roleFilter);
        }
        const res = await fetch(`/api/arda/business-affiliate/lookup?${params.toString()}`);
        const json = await res.json();
        if (json.ok) {
          setOptions(json.data as LookupResult[]);
        } else {
          setOptions([]);
          setError(json.error ?? 'Lookup failed');
        }
      } catch {
        setOptions([]);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    },
    [roleFilter],
  );

  // -------------------------------------------------------------------------
  // Input handling (with 250ms debounce)
  // -------------------------------------------------------------------------

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      setIsOpen(true);
      setActiveIndex(-1);
      setError(null);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        doLookup(newValue);
      }, 250);
    },
    [doLookup],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // Selection handlers
  // -------------------------------------------------------------------------

  const handleSelectOption = useCallback(
    (result: LookupResult) => {
      onSelect(result.eId, result.name);
      setInternalValue(result.name);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onSelect],
  );

  const handleCreate = useCallback(async () => {
    if (!onCreate || !internalValue.trim()) return;

    const name = internalValue.trim();
    setCreating(true);
    setError(null);
    try {
      const { eId } = await onCreate(name);
      onSelect(eId, name);
      setInternalValue(name);
      setIsOpen(false);
      setActiveIndex(-1);
    } catch {
      setError('Failed to create supplier');
    } finally {
      setCreating(false);
    }
  }, [onCreate, internalValue, onSelect]);

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen && e.key !== 'Escape') {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          setIsOpen(true);
          setActiveIndex(0);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < options.length) {
            const selected = options[activeIndex];
            if (selected) handleSelectOption(selected);
          } else if (activeIndex === options.length && showCreateOption) {
            handleCreate();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [
      isOpen,
      activeIndex,
      totalOptions,
      options,
      handleSelectOption,
      handleCreate,
      showCreateOption,
    ],
  );

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined;
      activeEl?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeIndex]);

  // -------------------------------------------------------------------------
  // Focus / blur
  // -------------------------------------------------------------------------

  const handleFocus = useCallback(() => {
    if (internalValue.trim().length > 0 || options.length > 0) {
      setIsOpen(true);
    }
  }, [internalValue, options.length]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as Node | null;
    if (listRef.current?.contains(relatedTarget)) {
      return;
    }
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const activeDescendantId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className="relative w-full" onBlur={handleBlur}>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendantId}
        aria-autocomplete="list"
        className={cn(
          'w-full px-3 py-2 text-sm border border-border rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
        )}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />

      {(loading || creating) && (
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2"
          role="status"
          aria-label="Loading"
        >
          <svg
            className="h-4 w-4 animate-spin text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      )}

      {isOpen && (totalOptions > 0 || loading) && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Options"
          className={cn(
            'absolute z-10 mt-1 w-full overflow-auto rounded-lg border border-border bg-white shadow-lg',
            'max-h-[320px]',
          )}
        >
          {options.map((option, index) => (
            <li
              key={option.eId}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm',
                index === activeIndex ? 'bg-secondary' : 'hover:bg-secondary',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectOption(option);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span>{option.name}</span>
              {option.roles.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {option.roles.join(', ')}
                </span>
              )}
            </li>
          ))}

          {showCreateOption && (
            <li
              id={`${listboxId}-option-${options.length}`}
              role="option"
              aria-selected={activeIndex === options.length}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm',
                activeIndex === options.length ? 'bg-secondary' : 'hover:bg-secondary',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              onMouseEnter={() => setActiveIndex(options.length)}
            >
              [+] New supplier: {'\u201C'}
              {internalValue.trim()}
              {'\u201D'}
            </li>
          )}

          {error && (
            <li className="px-3 py-2 text-sm text-red-600" role="alert">
              {error}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
