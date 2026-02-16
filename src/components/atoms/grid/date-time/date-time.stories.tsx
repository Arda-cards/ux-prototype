import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaDateTimeCellDisplay } from './date-time-cell-display';
import { ArdaDateTimeCellEditor } from './date-time-cell-editor';
import {
  ArdaDateTimeCellInteractive,
  createDateTimeCellInteractive,
} from './date-time-cell-interactive';

const meta: Meta<typeof ArdaDateTimeCellInteractive> = {
  title: 'Components/Atoms/Grid/Date Time',
  component: ArdaDateTimeCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'ISO datetime string value',
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
type Story = StoryObj<typeof ArdaDateTimeCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaDateTimeCellDisplay value={undefined} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaDateTimeCellDisplay value="2024-12-31T23:59:59Z" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState<string | undefined>('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaDateTimeCellEditor
            value={value}
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
    const [value, setValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the cell below to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaDateTimeCellInteractive value={value} onValueChange={setValue} />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// With Timezone
// ============================================================================

const DateTimeCellUTC = createDateTimeCellInteractive({ timezone: 'Etc/UTC' });
const DateTimeCellNY = createDateTimeCellInteractive({ timezone: 'America/New_York' });
const DateTimeCellTokyo = createDateTimeCellInteractive({ timezone: 'Asia/Tokyo' });

export const WithTimezone: Story = {
  render: () => {
    const [utcValue, setUtcValue] = useState('2024-03-15T14:30:00Z');
    const [nyValue, setNyValue] = useState('2024-03-15T14:30:00Z');
    const [tokyoValue, setTokyoValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-6 p-4" style={{ width: 300 }}>
        {/* UTC */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">UTC — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" timezone="Etc/UTC" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">UTC — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaDateTimeCellEditor value="2024-03-15T14:30:00Z" timezone="Etc/UTC" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">UTC — Interactive</div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <DateTimeCellUTC value={utcValue} onValueChange={setUtcValue} />
          </div>
        </div>

        {/* New York */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" timezone="America/New_York" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaDateTimeCellEditor value="2024-03-15T14:30:00Z" timezone="America/New_York" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            New York (EST) — Interactive
          </div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <DateTimeCellNY value={nyValue} onValueChange={setNyValue} />
          </div>
        </div>

        {/* Tokyo */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" timezone="Asia/Tokyo" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaDateTimeCellEditor value="2024-03-15T14:30:00Z" timezone="Asia/Tokyo" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Interactive</div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <DateTimeCellTokyo value={tokyoValue} onValueChange={setTokyoValue} />
          </div>
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
    value: '2024-03-15T14:30:00Z',
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Mar 15, 2024/)).toBeInTheDocument();
  },
};
