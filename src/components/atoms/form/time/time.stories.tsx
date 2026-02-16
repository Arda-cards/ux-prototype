import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaTimeFieldDisplay } from './time-field-display';
import { ArdaTimeFieldEditor } from './time-field-editor';
import { ArdaTimeFieldInteractive } from './time-field-interactive';
import { COMMON_TIMEZONES } from '@/types/model/general/time/timezone';

const meta: Meta<typeof ArdaTimeFieldInteractive> = {
  title: 'Components/Atoms/Form/Time',
  component: ArdaTimeFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Time string value (HH:mm or HH:mm:ss).',
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
    label: {
      control: 'text',
      description: 'Static label displayed next to the field.',
      table: { category: 'Static' },
    },
    labelPosition: {
      control: 'inline-radio',
      options: ['left', 'top'],
      description: 'Position of the label relative to the field.',
      table: { category: 'Static' },
    },
    timezone: {
      control: 'select',
      options: COMMON_TIMEZONES,
      description: 'IANA timezone for display formatting. Defaults to browser timezone.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaTimeFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With value</label>
        <ArdaTimeFieldDisplay value="14:30" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaTimeFieldDisplay value={undefined} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With seconds</label>
        <ArdaTimeFieldDisplay value="09:15:30" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, setValue] = useState('14:30');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Time</label>
          <ArdaTimeFieldEditor
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
    const [value, setValue] = useState('14:30');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the field to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Time</label>
          <ArdaTimeFieldInteractive value={value} onValueChange={setValue} />
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
    const [nyValue, setNyValue] = useState('14:30');
    const [tokyoValue, setTokyoValue] = useState('14:30');

    return (
      <div className="flex flex-col gap-6 p-4" style={{ width: 320 }}>
        {/* New York */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Display</div>
          <ArdaTimeFieldDisplay value="14:30" timezone="America/New_York" />
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Editor</div>
          <ArdaTimeFieldEditor value="14:30" timezone="America/New_York" />
          <div className="text-xs font-medium text-muted-foreground">
            New York (EST) — Interactive
          </div>
          <ArdaTimeFieldInteractive
            value={nyValue}
            onValueChange={setNyValue}
            timezone="America/New_York"
          />
        </div>

        {/* Tokyo */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Display</div>
          <ArdaTimeFieldDisplay value="14:30" timezone="Asia/Tokyo" />
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Editor</div>
          <ArdaTimeFieldEditor value="14:30" timezone="Asia/Tokyo" />
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Interactive</div>
          <ArdaTimeFieldInteractive
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
// With Label
// ============================================================================

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4" style={{ width: 480 }}>
      <div className="text-xs font-medium text-muted-foreground">Label left (default)</div>
      <ArdaTimeFieldDisplay value="14:30" label="Start Time" labelPosition="left" />
      <ArdaTimeFieldEditor value="14:30" label="Start Time" labelPosition="left" />
      <ArdaTimeFieldInteractive value="14:30" label="Start Time" labelPosition="left" />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaTimeFieldDisplay value="14:30" label="Start Time" labelPosition="top" />
      <ArdaTimeFieldEditor value="14:30" label="Start Time" labelPosition="top" />
      <ArdaTimeFieldInteractive value="14:30" label="Start Time" labelPosition="top" />
    </div>
  ),
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: '14:30',
    disabled: false,
    label: 'Start Time',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/2:30 PM/)).toBeInTheDocument();
  },
};
