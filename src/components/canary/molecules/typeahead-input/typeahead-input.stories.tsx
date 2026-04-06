import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { TypeaheadInput } from './typeahead-input';
import { lookupUnits } from '@/components/canary/__mocks__/unit-lookup';
import { unitLookupHandler } from '@/components/canary/__mocks__/handlers/unit-lookup';

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function TypeaheadDemo({
  initialValue = '',
  ...props
}: Omit<React.ComponentProps<typeof TypeaheadInput>, 'value' | 'onChange'> & {
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-64 p-8">
      <TypeaheadInput value={value} onChange={setValue} {...props} />
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
    msw: { handlers: [unitLookupHandler] },
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
