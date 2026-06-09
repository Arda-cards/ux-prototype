import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { MultiSelectTypeaheadInput } from './multiselect-typeahead-input';
import { lookupRoles } from '@/components/canary/__mocks__/role-lookup';
import { roleLookupHandler } from '@/components/canary/__mocks__/handlers/role-lookup';

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function MultiSelectDemo({
  initialValue = [],
  ...props
}: Omit<React.ComponentProps<typeof MultiSelectTypeaheadInput>, 'value' | 'onValueChange'> & {
  initialValue?: string[];
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-80 p-8">
      <MultiSelectTypeaheadInput value={value} onValueChange={setValue} {...props} />
      <p className="mt-2 text-xs text-muted-foreground">
        Value: <code>{value.length > 0 ? value.join(', ') : '(empty)'}</code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/Canary/Molecules/TypeaheadInput/MultiSelect',
  parameters: {
    msw: { handlers: [roleLookupHandler] },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default empty multiselect. Click to open, select multiple roles. */
export const Default: StoryObj = {
  render: () => <MultiSelectDemo lookup={lookupRoles} placeholder="Select roles..." />,
};

/** Pre-populated with two roles. */
export const PrePopulated: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      initialValue={['Vendor', 'Carrier']}
      placeholder="Select roles..."
    />
  ),
};

/** Overflow — many selected, tokens that don't fit show "+N more". */
export const Overflow: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      initialValue={['Vendor', 'Customer', 'Carrier', 'Operator', 'Distributor']}
      placeholder="Select roles..."
    />
  ),
};

/** Disabled state. */
export const Disabled: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      initialValue={['Vendor', 'Carrier']}
      disabled
      placeholder="Select roles..."
    />
  ),
};

// Cell-editor behavior is demonstrated end-to-end by the `InGrid` story shipped
// with the DataGrid molecule — no standalone `CellEditorMode` story is needed
// here.
