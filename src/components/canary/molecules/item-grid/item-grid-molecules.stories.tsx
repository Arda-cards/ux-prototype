import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TypeaheadCellEditor } from './typeahead-cell-editor';
import { SelectCellEditor } from '../../atoms/grid/select/select-cell-editor';
import { DragHeader } from './drag-header';

// --- TypeaheadCellEditor ---

const typeaheadMeta = {
  title: 'Components/Canary/Molecules/ItemGrid/TypeaheadCellEditor',
  component: TypeaheadCellEditor,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TypeaheadCellEditor>;

export default typeaheadMeta;
type TypeaheadStory = StoryObj<typeof TypeaheadCellEditor>;

const mockSuppliers = [
  'Medline Industries',
  'Cardinal Health',
  'Fisher Scientific',
  'VWR International',
  'Eppendorf',
  '3M Healthcare',
];

/** Typeahead with async lookup. Type to search. */
export const Typeahead: TypeaheadStory = {
  render: () => {
    const [value, setValue] = useState<string | null>('Medline Industries');
    return (
      <div className="w-60 rounded-md border">
        <TypeaheadCellEditor
          value={value}
          onValueChange={setValue}
          stopEditing={() => console.log('stopEditing')}
          lookup={async (search) => {
            await new Promise((r) => setTimeout(r, 100));
            return mockSuppliers
              .filter((s) => s.toLowerCase().includes(search.toLowerCase()))
              .map((s) => ({ label: s, value: s }));
          }}
          allowCreate
          placeholder="Search suppliers\u2026"
        />
      </div>
    );
  },
};

/** Typeahead with no results. */
export const TypeaheadEmpty: TypeaheadStory = {
  render: () => (
    <div className="w-60 rounded-md border">
      <TypeaheadCellEditor
        value=""
        onValueChange={() => {}}
        stopEditing={() => {}}
        lookup={async () => []}
        placeholder="Search (no results)\u2026"
      />
    </div>
  ),
};

// --- SelectCellEditor ---

/** Select dropdown with options. */
export const Select: StoryObj<typeof SelectCellEditor> = {
  render: () => {
    const [value, setValue] = useState<string | null>('EMAIL');
    return (
      <div className="w-60 rounded-md border">
        <SelectCellEditor
          value={value}
          onValueChange={setValue}
          stopEditing={() => console.log('stopEditing')}
          options={[
            { label: 'Purchase Order', value: 'PURCHASE_ORDER' },
            { label: 'Email', value: 'EMAIL' },
            { label: 'Phone', value: 'PHONE' },
            { label: 'In Store', value: 'IN_STORE' },
            { label: 'Online', value: 'ONLINE' },
          ]}
        />
      </div>
    );
  },
};

// --- DragHeader ---

/** Column header with drag grip icon. */
export const Header: StoryObj<typeof DragHeader> = {
  render: () => (
    <div className="flex h-9 items-center rounded-md border bg-muted px-3">
      <DragHeader displayName="Column Name" />
    </div>
  ),
};
