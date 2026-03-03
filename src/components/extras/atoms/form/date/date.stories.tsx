import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaDateFieldDisplay } from './date-field-display';
import { ArdaDateFieldEditor } from './date-field-editor';
import { ArdaDateFieldInteractive } from './date-field-interactive';
import { COMMON_TIMEZONES } from '@/extras/types/model/general/time/timezone';

const meta: Meta<typeof ArdaDateFieldInteractive> = {
  title: 'Components/Extras/Atoms/Form/Date',
  component: ArdaDateFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'ISO date string value.',
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
type Story = StoryObj<typeof ArdaDateFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With value</label>
        <ArdaDateFieldDisplay value="2024-03-15" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaDateFieldDisplay />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">ISO DateTime</label>
        <ArdaDateFieldDisplay value="2024-12-31T23:59:59Z" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, setValue] = useState('2024-03-15');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
          <ArdaDateFieldEditor
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
      <ArdaDateFieldInteractive value="2024-03-15" onChange={fn()} mode="display" />
    </div>
  ),
};

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('2024-03-15');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">Edit mode: editable input.</div>
        <ArdaDateFieldInteractive
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
    const [value, setValue] = useState('2024-03-15');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Error mode: editable input with error styling.
        </div>
        <ArdaDateFieldInteractive
          value={value}
          onChange={(_original, current) => setValue(current)}
          mode="error"
          errors={['Date must be in the future', 'Date is required']}
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
      <ArdaDateFieldInteractive value="2024-03-15" onChange={fn()} mode="edit" editable={false} />
    </div>
  ),
};

// ============================================================================
// Timezone
// ============================================================================

export const WithTimezone: Story = {
  render: () => {
    const [nyValue, setNyValue] = useState('2024-03-15');
    const [tokyoValue, setTokyoValue] = useState('2024-03-15');

    return (
      <div className="flex flex-col gap-6 p-4" style={{ width: 320 }}>
        {/* New York */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">New York (EST) -- Display</div>
          <ArdaDateFieldDisplay value="2024-03-15" timezone="America/New_York" />
          <div className="text-xs font-medium text-muted-foreground">New York (EST) -- Editor</div>
          <ArdaDateFieldEditor value="2024-03-15" timezone="America/New_York" />
          <div className="text-xs font-medium text-muted-foreground">
            New York (EST) -- Interactive
          </div>
          <ArdaDateFieldInteractive
            value={nyValue}
            onChange={(_original, current) => setNyValue(current)}
            mode="edit"
            timezone="America/New_York"
          />
        </div>

        {/* Tokyo */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) -- Display</div>
          <ArdaDateFieldDisplay value="2024-03-15" timezone="Asia/Tokyo" />
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) -- Editor</div>
          <ArdaDateFieldEditor value="2024-03-15" timezone="Asia/Tokyo" />
          <div className="text-xs font-medium text-muted-foreground">
            Tokyo (JST) -- Interactive
          </div>
          <ArdaDateFieldInteractive
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
      <ArdaDateFieldDisplay value="2024-03-15" label="Start Date" labelPosition="left" />
      <ArdaDateFieldEditor value="2024-03-15" label="Start Date" labelPosition="left" />
      <ArdaDateFieldInteractive
        value="2024-03-15"
        onChange={fn()}
        mode="edit"
        label="Start Date"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaDateFieldDisplay value="2024-03-15" label="Start Date" labelPosition="top" />
      <ArdaDateFieldEditor value="2024-03-15" label="Start Date" labelPosition="top" />
      <ArdaDateFieldInteractive
        value="2024-03-15"
        onChange={fn()}
        mode="edit"
        label="Start Date"
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
    value: '2024-03-15',
    mode: 'display',
    label: 'Start Date',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('03/15/2024')).toBeInTheDocument();
  },
};
