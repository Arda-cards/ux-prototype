import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaTimeCellDisplay } from './time-cell-display';
import { ArdaTimeCellEditor } from './time-cell-editor';
import { ArdaTimeCellInteractive, createTimeCellInteractive } from './time-cell-interactive';

const meta: Meta<typeof ArdaTimeCellInteractive> = {
  title: 'Components/Atoms/Grid/Time',
  component: ArdaTimeCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Time string value (HH:mm format)',
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
type Story = StoryObj<typeof ArdaTimeCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaTimeCellDisplay value="14:30" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaTimeCellDisplay value={undefined} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaTimeCellDisplay value="09:15:30" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState<string | undefined>('14:30');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaTimeCellEditor value={value} stopEditing={() => console.log('stopEditing called')} />
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
    const [value, setValue] = useState('14:30');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the cell below to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaTimeCellInteractive value={value} onValueChange={setValue} />
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

const TimeCellUTC = createTimeCellInteractive({ timezone: 'Etc/UTC' });
const TimeCellNY = createTimeCellInteractive({ timezone: 'America/New_York' });
const TimeCellTokyo = createTimeCellInteractive({ timezone: 'Asia/Tokyo' });

export const WithTimezone: Story = {
  render: () => {
    const [utcValue, setUtcValue] = useState('14:30');
    const [nyValue, setNyValue] = useState('14:30');
    const [tokyoValue, setTokyoValue] = useState('14:30');

    return (
      <div className="flex flex-col gap-6 p-4" style={{ width: 300 }}>
        {/* UTC */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">UTC — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaTimeCellDisplay value="14:30" timezone="Etc/UTC" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">UTC — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaTimeCellEditor value="14:30" timezone="Etc/UTC" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">UTC — Interactive</div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <TimeCellUTC value={utcValue} onValueChange={setUtcValue} />
          </div>
        </div>

        {/* New York */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaTimeCellDisplay value="14:30" timezone="America/New_York" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaTimeCellEditor value="14:30" timezone="America/New_York" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            New York (EST) — Interactive
          </div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <TimeCellNY value={nyValue} onValueChange={setNyValue} />
          </div>
        </div>

        {/* Tokyo */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaTimeCellDisplay value="14:30" timezone="Asia/Tokyo" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaTimeCellEditor value="14:30" timezone="Asia/Tokyo" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Interactive</div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <TimeCellTokyo value={tokyoValue} onValueChange={setTokyoValue} />
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
    value: '14:30',
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('2:30 PM')).toBeInTheDocument();
  },
};
