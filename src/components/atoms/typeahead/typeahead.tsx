import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export interface TypeaheadOption {
  label: string;
  value: string;
  meta?: string;
}

/** Design-time configuration — properties chosen at composition time. */
export interface ArdaTypeaheadStaticConfig {
  /* --- Model / Data Binding --- */
  /** Whether to allow creating new entries when no matches exist. */
  allowCreate?: boolean;

  /* --- View / Layout / Controller --- */
  /** Placeholder text for the input field. */
  placeholder?: string;
  /** Label shown in the create-new option (e.g. "Create new"). Default: "Create new". */
  createNewLabel?: string;
}

/** Runtime configuration — dynamic state and callbacks. */
export interface ArdaTypeaheadRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Current input value. */
  value: string;
  /** Options to display in the dropdown. */
  options: TypeaheadOption[];
  /** Called when the debounced input value changes. */
  onInputChange: (value: string) => void;
  /** Called when an option is selected. */
  onSelect: (option: TypeaheadOption) => void;
  /** Called when the user chooses to create a new entry. */
  onCreate?: (value: string) => void;

  /* --- View / Layout / Controller --- */
  /** Whether options are currently loading. */
  loading?: boolean;
}

export interface ArdaTypeaheadProps extends ArdaTypeaheadStaticConfig, ArdaTypeaheadRuntimeConfig {}

export function ArdaTypeahead({
  placeholder = 'Search...',
  createNewLabel = 'Create new',
  allowCreate = false,
  value,
  options,
  onInputChange,
  onSelect,
  onCreate,
  loading = false,
}: ArdaTypeaheadProps) {
  const inputId = useId();
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync external value to internal state
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const showCreateOption =
    allowCreate && !loading && options.length === 0 && internalValue.trim().length > 0;
  const totalOptions = options.length + (showCreateOption ? 1 : 0);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      setIsOpen(true);
      setActiveIndex(-1);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onInputChange(newValue);
      }, 250);
    },
    [onInputChange],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSelect = useCallback(
    (option: TypeaheadOption) => {
      onSelect(option);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onSelect],
  );

  const handleCreate = useCallback(() => {
    if (onCreate && internalValue.trim()) {
      onCreate(internalValue.trim());
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }, [onCreate, internalValue]);

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
            if (selected) handleSelect(selected);
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
    [isOpen, activeIndex, totalOptions, options, handleSelect, handleCreate, showCreateOption],
  );

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined;
      activeEl?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleFocus = useCallback(() => {
    if (internalValue.trim().length > 0 || options.length > 0) {
      setIsOpen(true);
    }
  }, [internalValue, options.length]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't close if focus moves within the component
    const relatedTarget = e.relatedTarget as Node | null;
    if (listRef.current?.contains(relatedTarget)) {
      return;
    }
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

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

      {loading && (
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
              key={option.value}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm',
                index === activeIndex ? 'bg-secondary' : 'hover:bg-secondary',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(option);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span>{option.label}</span>
              {option.meta && (
                <span className="ml-2 text-xs text-muted-foreground">{option.meta}</span>
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
              [+] {createNewLabel}: &ldquo;{internalValue.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
