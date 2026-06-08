import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { TypeaheadInput, type TypeaheadSource } from './typeahead-input';
import { MultiSelectTypeaheadInput } from './multiselect-typeahead-input';
import { lookupUnits } from '@/components/canary/__mocks__/unit-lookup';
import { lookupRoles } from '@/components/canary/__mocks__/role-lookup';
import { unitLookupHandler } from '@/components/canary/__mocks__/handlers/unit-lookup';
import { roleLookupHandler } from '@/components/canary/__mocks__/handlers/role-lookup';

// ---------------------------------------------------------------------------
// Playground data sources — async lookup functions + a static array
// ---------------------------------------------------------------------------

const STATIC_UNITS = ['each', 'case', 'box', 'pallet', 'pair', 'kg', 'lb', 'liter', 'gallon'];

const DATA_SOURCES: Record<string, TypeaheadSource> = {
  'Units (async fn)': lookupUnits,
  'Roles (async fn)': lookupRoles,
  'Static array': STATIC_UNITS,
};

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function TypeaheadDemo({
  initialValue = '',
  ...props
}: Omit<React.ComponentProps<typeof TypeaheadInput>, 'value' | 'onValueChange'> & {
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-64 p-8">
      <TypeaheadInput value={value} onValueChange={setValue} {...props} />
      <p className="mt-2 text-xs text-muted-foreground">
        Value: <code>{value || '(empty)'}</code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/Canary/Molecules/TypeaheadInput',
  parameters: {
    msw: { handlers: [unitLookupHandler, roleLookupHandler] },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  render: () => <TypeaheadDemo lookup={lookupUnits} placeholder="Select unit..." />,
};

export const AllowCreate: StoryObj = {
  render: () => (
    <TypeaheadDemo lookup={lookupUnits} allowCreate placeholder="Type or create unit..." />
  ),
};

/** Static list — pass a plain `string[]` (or `TypeaheadOption[]`) instead of a lookup function. */
export const StaticList: StoryObj = {
  render: () => (
    <TypeaheadDemo
      lookup={['each', 'case', 'box', 'pallet', 'pair', 'kg', 'lb', 'liter', 'gallon']}
      placeholder="Select unit..."
    />
  ),
};

export const PrePopulated: StoryObj = {
  render: () => (
    <TypeaheadDemo lookup={lookupUnits} initialValue="each" placeholder="Select unit..." />
  ),
};

export const Disabled: StoryObj = {
  render: () => (
    <TypeaheadDemo lookup={lookupUnits} initialValue="kg" disabled placeholder="Select unit..." />
  ),
};

/** Cell editor mode — blur accepts typed value, dropdown portaled via Popover. */
export const CellEditorMode: StoryObj = {
  render: () => (
    <div className="p-8">
      <p className="text-sm text-muted-foreground mb-4">
        Cell editor mode: blur accepts typed value instead of reverting. Dropdown is portaled.
      </p>
      <div className="w-64 overflow-hidden border border-border rounded-md p-2">
        <TypeaheadDemo
          lookup={lookupUnits}
          allowCreate
          cellEditorMode
          placeholder="Search units (cell editor)..."
        />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

interface PlaygroundArgs {
  dataSource: string;
  multiselect: boolean;
  placeholder: string;
  allowCreate: boolean;
  defaultOne: boolean;
  disabled: boolean;
  cellEditorMode: boolean;
  clearOnFocus: boolean;
  maxResults: number;
}

function PlaygroundDemo(args: PlaygroundArgs) {
  const source = DATA_SOURCES[args.dataSource] ?? lookupUnits;
  const [single, setSingle] = useState('');
  const [multi, setMulti] = useState<string[]>([]);

  return (
    <div className="w-80 p-8">
      {args.multiselect ? (
        <MultiSelectTypeaheadInput
          value={multi}
          onValueChange={setMulti}
          lookup={source}
          placeholder={args.placeholder}
          defaultOne={args.defaultOne}
          disabled={args.disabled}
          cellEditorMode={args.cellEditorMode}
          maxResults={args.maxResults}
        />
      ) : (
        <TypeaheadInput
          value={single}
          onValueChange={setSingle}
          lookup={source}
          placeholder={args.placeholder}
          allowCreate={args.allowCreate}
          disabled={args.disabled}
          cellEditorMode={args.cellEditorMode}
          clearOnFocus={args.clearOnFocus}
          maxResults={args.maxResults}
        />
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Value:{' '}
        <code>
          {args.multiselect
            ? multi.length > 0
              ? multi.join(', ')
              : '(empty)'
            : single || '(empty)'}
        </code>
      </p>
    </div>
  );
}

/**
 * Playground — toggle every prop via the controls panel. Pick a data source
 * (two async lookups or a static array), switch between single and multiselect,
 * and try `clearOnFocus`, `allowCreate`, `defaultOne`, `maxResults`, etc.
 */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    dataSource: 'Units (async fn)',
    multiselect: false,
    placeholder: 'Select…',
    allowCreate: false,
    defaultOne: true,
    disabled: false,
    cellEditorMode: false,
    clearOnFocus: false,
    maxResults: 8,
  },
  argTypes: {
    dataSource: { control: 'select', options: Object.keys(DATA_SOURCES) },
    multiselect: { control: 'boolean', description: 'Render MultiSelectTypeaheadInput' },
    placeholder: { control: 'text' },
    allowCreate: { control: 'boolean', description: 'Single-select only' },
    defaultOne: { control: 'boolean', description: 'Multiselect only' },
    disabled: { control: 'boolean' },
    cellEditorMode: { control: 'boolean' },
    clearOnFocus: { control: 'boolean', description: 'Single-select only' },
    maxResults: { control: { type: 'number', min: 1, max: 20, step: 1 } },
  },
  render: (args) => <PlaygroundDemo {...args} />,
};
