'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { cn } from '@frontend/lib/utils';
import { lookupSubtypes } from '@frontend/lib/ardaClient';

const MAX_RESULTS = 8;
const DEBOUNCE_MS = 250;
const NEW_SUBTYPE_OPTION = '__new_subtype__';

interface SubTypeTypeaheadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  cellEditorMode?: boolean;
}

export function SubTypeTypeahead({
  value,
  onChange,
  placeholder = 'Search for sub-type',
  className,
  disabled = false,
  cellEditorMode = false,
}: SubTypeTypeaheadProps) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  const [wasValueSelected, setWasValueSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const displayOptions = useMemo(() => {
    const list = options.slice(0, MAX_RESULTS).map((s) => ({ value: s, isNew: false }));
    const trimmed = inputValue.trim();
    if (trimmed && !options.some((o) => o.toLowerCase() === trimmed.toLowerCase())) {
      list.push({ value: NEW_SUBTYPE_OPTION, isNew: true });
    }
    return list;
  }, [options, inputValue]);

  const fetchSubtypes = useCallback(async (search: string) => {
    if (!search.trim()) {
      setOptions([]);
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const results = await lookupSubtypes(search.trim());
      setOptions(results);
    } catch {
      setOptions([]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, []);

  const handleFocus = useCallback(() => {
    setPreviousValue(inputValue);
    setWasValueSelected(false);
    if (inputValue.trim()) {
      fetchSubtypes(inputValue);
    }
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, [inputValue, fetchSubtypes]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInputValue(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (v.trim()) {
        debounceRef.current = setTimeout(() => {
          fetchSubtypes(v);
          debounceRef.current = null;
        }, DEBOUNCE_MS);
      } else {
        setOptions([]);
      }
      setIsOpen(true);
      setHighlightedIndex(-1);
    },
    [fetchSubtypes]
  );

  const selectValue = useCallback(
    (val: string) => {
      const final = val === NEW_SUBTYPE_OPTION ? inputValue.trim() : val;
      setWasValueSelected(true);
      onChange(final);
      setInputValue(final);
      if (inputRef.current) inputRef.current.value = final;
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [inputValue, onChange]
  );

  const handleBlur = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        if (cellEditorMode) {
          const final = inputValue.trim();
          onChange(final);
        } else {
          if (!wasValueSelected) {
            setInputValue(previousValue);
            onChange(previousValue);
          }
        }
        setWasValueSelected(false);
      }
    }, 150);
  }, [previousValue, onChange, wasValueSelected, cellEditorMode, inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isOpen && displayOptions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((i) =>
            i < displayOptions.length - 1 ? i + 1 : i
          );
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((i) => (i > 0 ? i - 1 : -1));
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
            selectValue(displayOptions[highlightedIndex].value);
          } else if (inputValue.trim()) {
            selectValue(NEW_SUBTYPE_OPTION);
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setInputValue(previousValue);
          onChange(previousValue);
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          return;
        }
        if (e.key === 'Tab') {
          if (cellEditorMode) {
            if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
              const selected = displayOptions[highlightedIndex].value;
              const final = selected === NEW_SUBTYPE_OPTION ? inputValue.trim() : selected;
              if (final) {
                onChange(final);
                setInputValue(final);
              }
            } else {
              const final = inputValue.trim();
              if (final) {
                onChange(final);
                setInputValue(final);
              }
            }
            setIsOpen(false);
            setHighlightedIndex(-1);
          } else {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
              selectValue(displayOptions[highlightedIndex].value);
            } else {
              const final = inputValue.trim();
              if (final) {
                setWasValueSelected(true);
                onChange(final);
                setInputValue(final);
              }
            }
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          return;
        }
      }

      if (!isOpen || displayOptions.length === 0) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setInputValue(previousValue);
          onChange(previousValue);
          setIsOpen(false);
          inputRef.current?.blur();
          return;
        }
        if (e.key === 'Tab') {
          const final = inputValue.trim();
          if (final) {
            if (cellEditorMode) {
              onChange(final);
              setInputValue(final);
            } else {
              setWasValueSelected(true);
              onChange(final);
              setInputValue(final);
            }
          }
          setIsOpen(false);
          if (!cellEditorMode) {
            e.preventDefault();
          }
          return;
        }
        if (cellEditorMode && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          const final = inputValue.trim();
          if (final) {
            onChange(final);
          }
          return;
        }
        if (cellEditorMode && e.key === 'Enter') {
          const final = inputValue.trim();
          if (final) {
            onChange(final);
            setInputValue(final);
          }
          return;
        }
      }
    },
    [
      isOpen,
      displayOptions,
      highlightedIndex,
      inputValue,
      previousValue,
      onChange,
      selectValue,
      cellEditorMode,
    ]
  );

  useEffect(() => {
    setInputValue(value);
    setPreviousValue(value);
  }, [value]);

  useLayoutEffect(() => {
    if (!cellEditorMode || !isOpen) {
      setDropdownPosition(null);
      return;
    }
    const updatePosition = () => {
      const input = inputRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 200),
      });
    };
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(raf);
  }, [cellEditorMode, isOpen, inputValue, options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inContainer = containerRef.current?.contains(target);
      const inDropdown = cellEditorMode && dropdownRef.current?.contains(target);
      if (containerRef.current && !inContainer && !inDropdown) {
        setIsOpen(false);
        if (cellEditorMode) {
          const final = inputValue.trim();
          onChange(final);
        } else {
          if (!wasValueSelected) {
            setInputValue(previousValue);
            onChange(previousValue);
          }
        }
        setWasValueSelected(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [previousValue, onChange, wasValueSelected, cellEditorMode, inputValue]);

  return (
    <div
      className={cn(
        'relative',
        cellEditorMode ? 'h-full w-full' : '',
        className
      )}
      ref={containerRef}
    >
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
          cellEditorMode
            ? 'h-full px-2 border-none bg-transparent'
            : 'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        )}
      />
      {isOpen && (inputValue.trim() || options.length > 0) && (() => {
        const dropdownContent = (
          <div
            ref={cellEditorMode ? dropdownRef : undefined}
            className="w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-[10000]"
            style={
              cellEditorMode && dropdownPosition
                ? {
                    position: 'fixed' as const,
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    zIndex: 10000,
                  }
                : undefined
            }
          >
            {isLoading ? (
              <div className="px-3 py-4 text-sm text-gray-500">
                Loading...
              </div>
            ) : displayOptions.length === 0 ? (
              inputValue.trim() && (
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100',
                    highlightedIndex === 0 && 'bg-gray-100'
                  )}
                  onMouseEnter={() => setHighlightedIndex(0)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectValue(NEW_SUBTYPE_OPTION);
                  }}
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    New sub-type: &quot;{inputValue.trim()}&quot;
                  </span>
                </div>
              )
            ) : (
              <div className="p-1">
                {displayOptions.map((opt, idx) => (
                  <div
                    key={opt.value}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer',
                      idx === highlightedIndex && 'bg-gray-100'
                    )}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectValue(opt.value);
                    }}
                  >
                    {opt.isNew ? (
                      <>
                        <Plus className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">
                          New sub-type: &quot;{inputValue.trim()}&quot;
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-900">{opt.value}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        if (cellEditorMode && dropdownPosition) {
          return createPortal(dropdownContent, document.body);
        }
        return (
          <div className="absolute z-50 w-full mt-1">{dropdownContent}</div>
        );
      })()}
    </div>
  );
}
