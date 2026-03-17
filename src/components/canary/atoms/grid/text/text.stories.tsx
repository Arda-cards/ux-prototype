import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { TextCellDisplay } from './text-cell-display';
import { TextCellEditor } from './text-cell-editor';

const meta: Meta<typeof TextCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Text',
  component: TextCellDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Text string value',
      table: { category: 'Runtime' },
    },
    maxLength: {
      control: 'number',
      description: 'Maximum characters before truncation',
      table: { category: 'Static' },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof TextCellDisplay>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <TextCellDisplay value="Widget Alpha" />
      </div>
      <div className="border border-border p-2 bg-white">
        <TextCellDisplay />
      </div>
      <div className="border border-border p-2 bg-white">
        <TextCellDisplay value="A very long text value that should be truncated" maxLength={20} />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor (AG Grid)
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState('Widget Alpha');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <TextCellEditor
            value={value}
            placeholder="Enter text…"
            stopEditing={() => console.log('stopEditing called')}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: 'Hello, World!',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Hello, World!')).toBeInTheDocument();
  },
};

void fn;
