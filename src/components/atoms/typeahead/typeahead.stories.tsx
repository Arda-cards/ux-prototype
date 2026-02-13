import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { ArdaTypeahead, type TypeaheadOption } from './typeahead';

const sampleOptions: TypeaheadOption[] = [
  { label: 'Acme Corp', value: 'acme', meta: 'Supplier' },
  { label: 'Beta Industries', value: 'beta', meta: 'Supplier' },
  { label: 'Gamma LLC', value: 'gamma', meta: 'Vendor' },
  { label: 'Delta Partners', value: 'delta' },
  { label: 'Epsilon Holdings', value: 'epsilon', meta: 'Distributor' },
];

const meta: Meta<typeof ArdaTypeahead> = {
  title: 'Components/Atoms/Typeahead',
  component: ArdaTypeahead,
  parameters: {
    docs: {
      description: {
        component:
          'A generic typeahead/autocomplete input with search, select, and create-new capabilities. Supports keyboard navigation, debounced input, and loading state.',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input.',
      table: { category: 'Static' },
    },
    createNewLabel: {
      control: 'text',
      description: 'Label for the create-new option.',
      table: { category: 'Static' },
    },
    allowCreate: {
      control: 'boolean',
      description: 'Whether to show a create-new option when there are no matches.',
      table: { category: 'Static' },
    },
    value: {
      control: 'text',
      description: 'Current input value.',
      table: { category: 'Runtime' },
    },
    loading: {
      control: 'boolean',
      description: 'Whether options are currently loading.',
      table: { category: 'Runtime' },
    },
    onInputChange: {
      action: 'inputChanged',
      table: { category: 'Events' },
    },
    onSelect: {
      action: 'selected',
      table: { category: 'Events' },
    },
    onCreate: {
      action: 'created',
      table: { category: 'Events' },
    },
  },
  args: {
    value: '',
    options: [],
    placeholder: 'Search...',
    onInputChange: fn(),
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaTypeahead>;

export const Default: Story = {};

export const WithOptions: Story = {
  args: {
    value: 'a',
    options: sampleOptions,
  },
};

export const NoMatches: Story = {
  args: {
    value: 'xyz',
    options: [],
    allowCreate: true,
    onCreate: fn(),
  },
};

export const Loading: Story = {
  args: {
    value: 'searching',
    options: [],
    loading: true,
  },
};

export const Interactive: Story = {
  render: function InteractiveTypeahead() {
    const [value, setValue] = useState('');
    const [options, setOptions] = useState<TypeaheadOption[]>([]);
    const [selected, setSelected] = useState<TypeaheadOption | null>(null);

    const handleInputChange = (input: string) => {
      setValue(input);
      if (input.trim()) {
        setOptions(
          sampleOptions.filter((o) => o.label.toLowerCase().includes(input.toLowerCase())),
        );
      } else {
        setOptions([]);
      }
    };

    const handleSelect = (option: TypeaheadOption) => {
      setSelected(option);
      setValue(option.label);
      setOptions([]);
    };

    return (
      <div className="w-80 space-y-2">
        <ArdaTypeahead
          value={value}
          options={options}
          placeholder="Type to search suppliers..."
          allowCreate
          onInputChange={handleInputChange}
          onSelect={handleSelect}
          onCreate={(v) => {
            setSelected({ label: v, value: v });
            setValue(v);
          }}
        />
        {selected && (
          <p className="text-sm text-gray-500">
            Selected: {selected.label} ({selected.value})
          </p>
        )}
      </div>
    );
  },
};
