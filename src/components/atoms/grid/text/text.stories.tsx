import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaTextCellDisplay } from './text-cell-display';
import { ArdaTextCellEditor } from './text-cell-editor';
import { ArdaTextCellInteractive } from './text-cell-interactive';

const meta: Meta<typeof ArdaTextCellInteractive> = {
  title: 'Components/Atoms/Grid/Text',
  component: ArdaTextCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Text string value',
      table: { category: 'Runtime' },
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Called when value changes via editing',
      table: { category: 'Events' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether editing is disabled',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaTextCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaTextCellDisplay value="Widget Alpha" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaTextCellDisplay value={undefined} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaTextCellDisplay
          value="A very long text value that should be truncated"
          maxLength={20}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState<string | undefined>('Widget Alpha');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaTextCellEditor
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
// Interactive
// ============================================================================

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('Double-click to edit');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the cell below to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaTextCellInteractive value={value} onValueChange={setValue} />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
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
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Hello, World!')).toBeInTheDocument();
  },
};
