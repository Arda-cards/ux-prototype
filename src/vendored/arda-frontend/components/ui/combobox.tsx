'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { cn } from '@frontend/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  selected?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  allowMultiple?: boolean;
  allowAddNew?: boolean;
  onAddNew?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Search',
      allowMultiple = false,
      allowAddNew = true,
      onAddNew,
      className,
      disabled = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredOptions, setFilteredOptions] =
      useState<ComboboxOption[]>(options);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update filtered options based on search
    useEffect(() => {
      if (searchValue.trim()) {
        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredOptions(filtered);
      } else {
        setFilteredOptions(options);
      }
    }, [searchValue, options]);

    // Update input value when value prop changes (but not while user is typing)
    useEffect(() => {
      if (!isOpen) {
        // Find the label for the current value
        const selectedOption = options.find((option) => option.value === value);
        setSearchValue(
          selectedOption ? selectedOption.label : (value as string) || ''
        );
      }
    }, [value, isOpen, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }, [isOpen]);

    const handleInputChange = (newValue: string) => {
      setSearchValue(newValue);
      setIsOpen(true);
    };

    const handleOptionSelect = (option: ComboboxOption) => {
      if (allowMultiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const isSelected = currentValues.includes(option.value);

        if (isSelected) {
          // Remove from selection
          const newValues = currentValues.filter((v) => v !== option.value);
          onChange(newValues);
        } else {
          // Add to selection
          const newValues = [...currentValues, option.value];
          onChange(newValues);
        }
      } else {
        // Single selection
        onChange(option.value);
        setIsOpen(false);
        setSearchValue('');
      }
    };

    const handleSelectAll = () => {
      if (allowMultiple) {
        const allValues = options.map((option) => option.value);
        const currentValues = Array.isArray(value) ? value : [];
        const isAllSelected = allValues.every((val) =>
          currentValues.includes(val)
        );

        if (isAllSelected) {
          onChange([]);
        } else {
          onChange(allValues);
        }
      }
    };

    const handleAddNew = () => {
      if (searchValue.trim()) {
        const newValue = searchValue.trim();
        onChange(newValue);
        if (onAddNew) {
          onAddNew(newValue);
        }
        setSearchValue('');
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (allowAddNew && searchValue.trim()) {
          handleAddNew();
        }
      }
    };

    const isAllSelected =
      allowMultiple &&
      Array.isArray(value) &&
      options.length > 0 &&
      options.every((option) => value.includes(option.value));

    const hasMatches = filteredOptions.length > 0;
    const showAddNew = allowAddNew && searchValue.trim();

    return (
      <div className={cn('relative', className)} ref={ref || containerRef}>
        {/* Input Field */}
        <div
          className={cn(
            'flex items-center gap-2 p-2 h-9 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer',
            'hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <Search className='w-4 h-4 text-gray-500' />
          <input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className='flex-1 border-none outline-none bg-transparent text-sm text-gray-900 placeholder:text-gray-500'
            disabled={disabled}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto'>
            {/* Options List */}
            {hasMatches && (
              <div className='p-1'>
                {/* Select All Option (only for multiple selection) */}
                {allowMultiple && (
                  <div
                    className='flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100'
                    onClick={handleSelectAll}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 border border-gray-300 rounded flex items-center justify-center',
                        isAllSelected && 'bg-black border-black'
                      )}
                    >
                      {isAllSelected && (
                        <Check className='w-3 h-3 text-white' />
                      )}
                    </div>
                    <span className='text-sm text-gray-900'>(Select all)</span>
                  </div>
                )}

                {/* Individual Options */}
                {filteredOptions.map((option) => {
                  const isSelected = allowMultiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : value === option.value;

                  return (
                    <div
                      key={option.value}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-md cursor-pointer',
                        isSelected && 'bg-gray-100'
                      )}
                      onClick={() => handleOptionSelect(option)}
                    >
                      {allowMultiple && (
                        <div
                          className={cn(
                            'w-4 h-4 border border-gray-300 rounded flex items-center justify-center',
                            isSelected && 'bg-black border-black'
                          )}
                        >
                          {isSelected && (
                            <Check className='w-3 h-3 text-white' />
                          )}
                        </div>
                      )}
                      <span className='text-sm text-gray-900'>
                        {option.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No Matches or Empty Options */}
            {!hasMatches && searchValue.trim() && (
              <div className='p-4 text-center'>
                <div className='text-sm text-gray-500 mb-2'>No matches</div>
              </div>
            )}

            {/* Add New Option */}
            {showAddNew && (
              <div
                className={hasMatches ? 'border-t border-gray-200 p-1' : 'p-1'}
              >
                <div
                  className='flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100'
                  onClick={handleAddNew}
                >
                  <Plus className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-900'>Add new</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Combobox.displayName = 'Combobox';
