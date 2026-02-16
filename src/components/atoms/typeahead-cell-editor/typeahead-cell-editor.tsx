import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { ArdaTypeahead, TypeaheadOption } from '@/components/atoms/typeahead/typeahead';

export interface TypeaheadCellEditorStaticConfig {
  /** Data source for typeahead options. Can be a static array or async function. */
  dataSource: TypeaheadOption[] | ((query: string) => Promise<TypeaheadOption[]>);
  /** Placeholder text for the input field. */
  placeholder?: string;
}

export interface ArdaTypeaheadCellEditorProps extends TypeaheadCellEditorStaticConfig {
  /** Initial value passed by AG Grid. */
  value?: string;
  /** Callback invoked when editing stops. */
  stopEditing?: (cancel?: boolean) => void;
}

export interface TypeaheadCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor component that wraps the `ArdaTypeahead` component.
 *
 * This editor provides searchable, filterable selection with support for both
 * static and async data sources.
 *
 * Usage in AG Grid column definition:
 * ```typescript
 * const colDef = {
 *   cellEditor: createTypeaheadCellEditor({
 *     dataSource: [
 *       { value: 'user-1', label: 'John Doe' },
 *       { value: 'user-2', label: 'Jane Smith' }
 *     ]
 *   })
 * };
 * ```
 */
export const ArdaTypeaheadCellEditor = forwardRef<
  TypeaheadCellEditorHandle,
  ArdaTypeaheadCellEditorProps
>(({ dataSource, placeholder = 'Search...', value: initialValue, stopEditing }, ref) => {
  const [currentValue, setCurrentValue] = useState<string>(initialValue ?? '');
  const [selectedValue, setSelectedValue] = useState<string | undefined>(initialValue);
  const [options, setOptions] = useState<TypeaheadOption[]>([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    getValue: () => selectedValue,
  }));

  // Initialize options if dataSource is an array
  useEffect(() => {
    if (Array.isArray(dataSource)) {
      setOptions(dataSource);
      // Find initial option label if value exists
      const initialOption = dataSource.find((opt) => opt.value === initialValue);
      if (initialOption) {
        setCurrentValue(initialOption.label);
      }
    }
  }, [dataSource, initialValue]);

  const handleInputChange = useCallback(
    async (query: string) => {
      setCurrentValue(query);

      if (Array.isArray(dataSource)) {
        // Local filtering for static data source
        if (query.trim() === '') {
          setOptions(dataSource);
        } else {
          const filtered = dataSource.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase()),
          );
          setOptions(filtered);
        }
      } else {
        // Async data source
        setLoading(true);
        try {
          const results = await dataSource(query);
          setOptions(results);
        } catch (error) {
          console.error('Failed to fetch typeahead options:', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }
    },
    [dataSource],
  );

  const handleSelect = useCallback(
    (option: TypeaheadOption) => {
      setSelectedValue(option.value);
      setCurrentValue(option.label);

      // Commit the value immediately
      if (stopEditing) {
        setTimeout(() => stopEditing(false), 0);
      }
    },
    [stopEditing],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (stopEditing) {
          stopEditing(true);
        }
      }
    },
    [stopEditing],
  );

  return (
    <div onKeyDown={handleKeyDown} className="w-full h-full">
      <ArdaTypeahead
        value={currentValue}
        options={options}
        onInputChange={handleInputChange}
        onSelect={handleSelect}
        loading={loading}
        placeholder={placeholder}
      />
    </div>
  );
});

ArdaTypeaheadCellEditor.displayName = 'ArdaTypeaheadCellEditor';

/**
 * Factory helper for creating a typeahead cell editor with static configuration.
 *
 * @param config - Static configuration including dataSource and placeholder
 * @returns A component function suitable for AG Grid's cellEditor property
 *
 * @example
 * ```typescript
 * // Static data source
 * const colDef = {
 *   field: 'assignee',
 *   cellEditor: createTypeaheadCellEditor({
 *     dataSource: [
 *       { value: 'user-1', label: 'John Doe', meta: 'Engineering' },
 *       { value: 'user-2', label: 'Jane Smith', meta: 'Product' }
 *     ],
 *     placeholder: 'Search assignee...'
 *   })
 * };
 *
 * // Async data source
 * const colDef = {
 *   field: 'customer',
 *   cellEditor: createTypeaheadCellEditor({
 *     dataSource: async (query) => {
 *       const response = await fetch(`/api/customers?q=${query}`);
 *       return response.json();
 *     }
 *   })
 * };
 * ```
 */
export function createTypeaheadCellEditor(config: TypeaheadCellEditorStaticConfig) {
  return (props: Omit<ArdaTypeaheadCellEditorProps, keyof TypeaheadCellEditorStaticConfig>) => (
    <ArdaTypeaheadCellEditor {...config} {...props} />
  );
}
