import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AutoFillField } from './auto-fill-field';
import { Input } from '@/components/canary/primitives/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/canary/primitives/select';

const meta = {
  title: 'Components/Canary/Molecules/AutoFillField',
  component: AutoFillField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Wraps any form field (label + input) to show an auto-fill badge indicator. ' +
          'On hover, the sparkle badge expands to show "Filled by {source}". ' +
          'Supports three dismiss modes: `input` (default), `change`, and `manual`.',
      },
    },
  },
  argTypes: {
    source: {
      control: 'select',
      options: ['Amazon', 'Claude', 'CSV Import'],
    },
    iconColor: {
      control: 'select',
      options: ['text-primary', 'text-muted-foreground', 'text-purple-500', 'text-blue-500'],
    },
    dismissOn: {
      control: 'radio',
      options: ['input', 'change', 'manual'],
    },
  },
} satisfies Meta<typeof AutoFillField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default behavior — badge clears when the user types in the text input.
 * Hover over the sparkle icon to see the source label expand.
 * The wrapper includes both the label and the input.
 */
export const TextInput: Story = {
  args: {
    source: 'Amazon',
    dismissOn: 'input',
    children: null,
  },
  render: function TextInputStory(args) {
    const [source, setSource] = React.useState<string | undefined>('Amazon');
    const [value, setValue] = React.useState('B08N5WRWNW');
    React.useEffect(() => {
      setSource(args.source);
    }, [args.source]);
    return (
      <div className="w-72">
        <AutoFillField
          {...(source ? { source } : {})}
          {...(args.iconColor ? { iconColor: args.iconColor } : {})}
          onClear={() => setSource(undefined)}
        >
          <label className="text-sm font-medium mb-1 block">SKU</label>
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter SKU" />
        </AutoFillField>
      </div>
    );
  },
};

/**
 * `dismissOn="change"` — badge clears when a native select or checkbox changes.
 */
export const NativeSelect: Story = {
  args: {
    source: 'Amazon',
    dismissOn: 'change',
    children: null,
  },
  render: function NativeSelectStory(args) {
    const [source, setSource] = React.useState<string | undefined>('Amazon');
    const [value, setValue] = React.useState('ONLINE');
    React.useEffect(() => {
      setSource(args.source);
    }, [args.source]);
    return (
      <div className="w-72">
        <AutoFillField
          {...(source ? { source } : {})}
          {...(args.iconColor ? { iconColor: args.iconColor } : {})}
          dismissOn="change"
          onClear={() => setSource(undefined)}
        >
          <label className="text-sm font-medium mb-1 block">Order method</label>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="ONLINE">Online</option>
            <option value="PHONE">Phone</option>
            <option value="EMAIL">Email</option>
          </select>
        </AutoFillField>
      </div>
    );
  },
};

/**
 * `dismissOn="manual"` — no auto-dismiss. The consumer clears `source`
 * from their own callback. Use this for custom components that don't
 * fire native DOM events.
 */
export const ManualDismiss: Story = {
  args: {
    source: 'Amazon',
    dismissOn: 'manual',
    children: null,
  },
  render: function ManualDismissStory(args) {
    const [source, setSource] = React.useState<string | undefined>('Amazon');
    const [value, setValue] = React.useState('ONLINE');
    React.useEffect(() => {
      setSource(args.source);
    }, [args.source]);
    return (
      <div className="w-72">
        <AutoFillField
          {...(source ? { source } : {})}
          {...(args.iconColor ? { iconColor: args.iconColor } : {})}
          dismissOn="manual"
        >
          <label className="text-sm font-medium mb-1 block">Order method (Radix Select)</label>
          <Select
            value={value}
            onValueChange={(v) => {
              setValue(v);
              setSource(undefined);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ONLINE">Online</SelectItem>
              <SelectItem value="PHONE">Phone</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
            </SelectContent>
          </Select>
        </AutoFillField>
      </div>
    );
  },
};
