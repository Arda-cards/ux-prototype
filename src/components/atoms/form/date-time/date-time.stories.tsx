import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaDateTimeFieldDisplay } from './date-time-field-display';
import { ArdaDateTimeFieldEditor } from './date-time-field-editor';
import { ArdaDateTimeFieldInteractive } from './date-time-field-interactive';

const meta: Meta<typeof ArdaDateTimeFieldInteractive> = {
  title: 'Components/Atoms/Form/Date Time',
  component: ArdaDateTimeFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'ISO datetime string value.',
      table: { category: 'Runtime' },
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Called when value changes via editing.',
      table: { category: 'Events' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether editing is disabled.',
      table: { category: 'Runtime' },
    },
    timezone: {
      control: 'select',
      options: [
        'Etc/UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
      ],
      description: 'IANA timezone for display formatting.',
      table: { category: 'Static' },
    },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaDateTimeFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With value</label>
        <ArdaDateTimeFieldDisplay value="2024-03-15T14:30:00Z" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaDateTimeFieldDisplay value={undefined} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">New Year</label>
        <ArdaDateTimeFieldDisplay value="2024-12-31T23:59:59Z" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, setValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Created At</label>
          <ArdaDateTimeFieldEditor
            value={value}
            onChange={setValue}
            onComplete={(v) => console.log('Completed:', v)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
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
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the field to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Created At</label>
          <ArdaDateTimeFieldInteractive value={value} onValueChange={setValue} />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Timezone
// ============================================================================

export const WithTimezone: Story = {
  render: () => {
    const [nyValue, setNyValue] = useState('2024-03-15T14:30:00Z');
    const [tokyoValue, setTokyoValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-6 p-4" style={{ width: 320 }}>
        {/* New York */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Display</div>
          <ArdaDateTimeFieldDisplay value="2024-03-15T14:30:00Z" timezone="America/New_York" />
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Editor</div>
          <ArdaDateTimeFieldEditor value="2024-03-15T14:30:00Z" timezone="America/New_York" />
          <div className="text-xs font-medium text-muted-foreground">
            New York (EST) — Interactive
          </div>
          <ArdaDateTimeFieldInteractive
            value={nyValue}
            onValueChange={setNyValue}
            timezone="America/New_York"
          />
        </div>

        {/* Tokyo */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Display</div>
          <ArdaDateTimeFieldDisplay value="2024-03-15T14:30:00Z" timezone="Asia/Tokyo" />
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Editor</div>
          <ArdaDateTimeFieldEditor value="2024-03-15T14:30:00Z" timezone="Asia/Tokyo" />
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Interactive</div>
          <ArdaDateTimeFieldInteractive
            value={tokyoValue}
            onValueChange={setTokyoValue}
            timezone="Asia/Tokyo"
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
    value: '2024-03-15T14:30:00Z',
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Mar 15, 2024/)).toBeInTheDocument();
  },
};
