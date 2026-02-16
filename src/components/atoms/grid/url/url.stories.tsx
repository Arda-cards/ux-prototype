import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaUrlCellDisplay } from './url-cell-display';
import { ArdaUrlCellEditor } from './url-cell-editor';
import { ArdaUrlCellInteractive } from './url-cell-interactive';

const meta: Meta<typeof ArdaUrlCellInteractive> = {
  title: 'Components/Atoms/Grid/URL',
  component: ArdaUrlCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'URL string value',
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
type Story = StoryObj<typeof ArdaUrlCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay value="https://example.com/page" displayFormat="link" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay value="https://example.com/page" displayFormat="button" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay
          value="https://example.com/page"
          displayFormat="button"
          buttonLabel="Visit"
        />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay value={undefined} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay
          value="https://example.com/very-long-url-that-should-be-truncated"
          displayFormat="link"
          maxLength={25}
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
    const [value, _setValue] = useState<string | undefined>('https://example.com/page');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaUrlCellEditor
            value={value}
            placeholder="Enter URL…"
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
    const [value, setValue] = useState('https://example.com/page');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the cell below to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaUrlCellInteractive value={value} onValueChange={setValue} />
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
    value: 'https://example.com/page',
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('https://example.com/page')).toBeInTheDocument();
  },
};
