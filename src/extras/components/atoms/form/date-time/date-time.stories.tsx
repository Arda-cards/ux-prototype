import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaDateTimeFieldDisplay } from './date-time-field-display';
import { ArdaDateTimeFieldEditor } from './date-time-field-editor';
import { ArdaDateTimeFieldInteractive } from './date-time-field-interactive';
import { COMMON_TIMEZONES } from '@/extras/types/model/general/time/timezone';

const meta: Meta<typeof ArdaDateTimeFieldInteractive> = {
  title: 'Components/Extras/Atoms/Form/Date Time',
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
    onChange: {
      action: 'changed',
      description: 'Called when value changes with (original, current).',
      table: { category: 'Events' },
    },
    mode: {
      control: 'inline-radio',
      options: ['display', 'edit', 'error'],
      description: 'Rendering mode.',
      table: { category: 'Runtime' },
    },
    editable: {
      control: 'boolean',
      description: 'Per-field editability override.',
      table: { category: 'Runtime' },
    },
    errors: {
      control: 'object',
      description: 'Validation error messages (shown only in error mode).',
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
    onChange: fn(),
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
        <ArdaDateTimeFieldDisplay />
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
            onChange={(_original, current) => setValue(current)}
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
// Interactive — Mode-based
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div className="text-sm text-muted-foreground">Display mode: read-only presentation.</div>
      <ArdaDateTimeFieldInteractive value="2024-03-15T14:30:00Z" onChange={fn()} mode="display" />
    </div>
  ),
};

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">Edit mode: editable input.</div>
        <ArdaDateTimeFieldInteractive
          value={value}
          onChange={(_original, current) => setValue(current)}
          mode="edit"
        />
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

export const InteractiveError: Story = {
  render: () => {
    const [value, setValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Error mode: editable input with error styling.
        </div>
        <ArdaDateTimeFieldInteractive
          value={value}
          onChange={(_original, current) => setValue(current)}
          mode="error"
          errors={['Date/time must be in the future', 'Date/time is required']}
        />
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

export const EditableOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div className="text-sm text-muted-foreground">
        editable=false forces display mode even when mode=&quot;edit&quot;.
      </div>
      <ArdaDateTimeFieldInteractive
        value="2024-03-15T14:30:00Z"
        onChange={fn()}
        mode="edit"
        editable={false}
      />
    </div>
  ),
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
          <div className="text-xs font-medium text-muted-foreground">New York (EST) -- Display</div>
          <ArdaDateTimeFieldDisplay value="2024-03-15T14:30:00Z" timezone="America/New_York" />
          <div className="text-xs font-medium text-muted-foreground">New York (EST) -- Editor</div>
          <ArdaDateTimeFieldEditor value="2024-03-15T14:30:00Z" timezone="America/New_York" />
          <div className="text-xs font-medium text-muted-foreground">
            New York (EST) -- Interactive
          </div>
          <ArdaDateTimeFieldInteractive
            value={nyValue}
            onChange={(_original, current) => setNyValue(current)}
            mode="edit"
            timezone="America/New_York"
          />
        </div>

        {/* Tokyo */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) -- Display</div>
          <ArdaDateTimeFieldDisplay value="2024-03-15T14:30:00Z" timezone="Asia/Tokyo" />
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) -- Editor</div>
          <ArdaDateTimeFieldEditor value="2024-03-15T14:30:00Z" timezone="Asia/Tokyo" />
          <div className="text-xs font-medium text-muted-foreground">
            Tokyo (JST) -- Interactive
          </div>
          <ArdaDateTimeFieldInteractive
            value={tokyoValue}
            onChange={(_original, current) => setTokyoValue(current)}
            mode="edit"
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
      <ArdaDateTimeFieldDisplay
        value="2024-03-15T14:30:00Z"
        label="Created At"
        labelPosition="left"
      />
      <ArdaDateTimeFieldEditor
        value="2024-03-15T14:30:00Z"
        label="Created At"
        labelPosition="left"
      />
      <ArdaDateTimeFieldInteractive
        value="2024-03-15T14:30:00Z"
        onChange={fn()}
        mode="edit"
        label="Created At"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaDateTimeFieldDisplay
        value="2024-03-15T14:30:00Z"
        label="Created At"
        labelPosition="top"
      />
      <ArdaDateTimeFieldEditor
        value="2024-03-15T14:30:00Z"
        label="Created At"
        labelPosition="top"
      />
      <ArdaDateTimeFieldInteractive
        value="2024-03-15T14:30:00Z"
        onChange={fn()}
        mode="edit"
        label="Created At"
        labelPosition="top"
      />
    </div>
  ),
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: '2024-03-15T14:30:00Z',
    mode: 'display',
    label: 'Created At',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/03\/15\/2024/)).toBeInTheDocument();
  },
};
