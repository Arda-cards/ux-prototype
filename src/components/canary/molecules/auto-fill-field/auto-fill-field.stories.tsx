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
          'Wraps any form field to show an auto-fill badge indicator. ' +
          'On hover, the sparkle badge expands to show "Filled by {source}". ' +
          'Supports three dismiss modes for different input types.\n\n' +
          '## Dismiss modes\n\n' +
          '| Mode | Event | Use for |\n' +
          '|------|-------|---------|\n' +
          '| `input` (default) | `onInput` | Text inputs, textareas, typeaheads |\n' +
          '| `change` | `onChange` | Native selects, checkboxes, toggles |\n' +
          '| `manual` | None — consumer calls `onClear` | Radix Select, image upload, custom components |\n\n' +
          '## Usage\n\n' +
          '```tsx\n' +
          '// Text input — auto-clears on typing (default)\n' +
          '<AutoFillField source="Amazon" onClear={() => clear("sku")}>\n' +
          '  <InputGroup>\n' +
          '    <InputGroupInput value={sku} onChange={...} />\n' +
          '  </InputGroup>\n' +
          '</AutoFillField>\n\n' +
          '// Radix Select — manual clear\n' +
          '<AutoFillField source="Amazon" dismissOn="manual">\n' +
          '  <ArdaSelect onValueChange={(v) => { setValue(v); clear("method"); }} />\n' +
          '</AutoFillField>\n' +
          '```\n\n' +
          '**Why `manual`?** Custom components like Radix Select and image dropzones ' +
          "don't fire native DOM events that bubble to the wrapper. In manual mode, " +
          'the consumer clears `source` from their own callback — just one extra line.',
      },
    },
  },
  argTypes: {
    source: {
      control: 'select',
      options: ['Amazon', 'Claude', 'CSV Import'],
    },
    iconColorClass: {
      control: 'select',
      options: ['text-muted-foreground', 'text-primary', 'text-purple-500'],
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
 */
export const TextInput: Story = {
  args: {
    source: 'Amazon',
    dismissOn: 'input',
    children: null,
  },
  render: function TextInputStory() {
    const [source, setSource] = React.useState<string | undefined>('Amazon');
    const [value, setValue] = React.useState('B08N5WRWNW');
    return (
      <div className="w-72 pt-4">
        <label className="text-sm font-medium mb-1 block">SKU</label>
        <AutoFillField {...(source ? { source } : {})} onClear={() => setSource(undefined)}>
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
  render: function NativeSelectStory() {
    const [source, setSource] = React.useState<string | undefined>('Amazon');
    const [value, setValue] = React.useState('ONLINE');
    return (
      <div className="w-72 pt-4">
        <label className="text-sm font-medium mb-1 block">Order method</label>
        <AutoFillField
          {...(source ? { source } : {})}
          dismissOn="change"
          onClear={() => setSource(undefined)}
        >
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
  render: function ManualDismissStory() {
    const [source, setSource] = React.useState<string | undefined>('Amazon');
    const [value, setValue] = React.useState('ONLINE');
    return (
      <div className="w-72 pt-4">
        <label className="text-sm font-medium mb-1 block">Order method (Radix Select)</label>
        <AutoFillField {...(source ? { source } : {})} dismissOn="manual">
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
