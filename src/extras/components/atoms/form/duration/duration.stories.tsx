import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaDurationFieldDisplay, type Duration } from './duration-field-display';
import { ArdaDurationFieldEditor } from './duration-field-editor';
import { ArdaDurationFieldInteractive } from './duration-field-interactive';

const timeUnits = { days: 'Days', hours: 'Hours', weeks: 'Weeks', months: 'Months' } as const;

const meta: Meta<typeof ArdaDurationFieldInteractive> = {
  title: 'Components/Extras/Atoms/Form/Duration',
  component: ArdaDurationFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      description: 'Current duration value.',
      table: { category: 'Runtime' },
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
  },
  args: {
    onChange: fn(),
    onComplete: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaDurationFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With value</label>
        <ArdaDurationFieldDisplay value={{ value: 90, unit: 'days' }} unitOptions={timeUnits} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaDurationFieldDisplay unitOptions={timeUnits} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          With precision
        </label>
        <ArdaDurationFieldDisplay
          value={{ value: 2.5, unit: 'hours' }}
          unitOptions={timeUnits}
          precision={1}
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
    const [value, setValue] = useState<Duration>({ value: 90, unit: 'days' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Lead Time</label>
          <ArdaDurationFieldEditor
            value={value}
            unitOptions={timeUnits}
            onChange={(_original, current) => setValue(current)}
            onComplete={fn()}
            placeholder="Enter duration…"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value:{' '}
          <span className="font-medium">
            {value.value} {value.unit}
          </span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive — Display Mode
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <ArdaDurationFieldInteractive
        value={{ value: 90, unit: 'days' }}
        mode="display"
        onChange={fn()}
        unitOptions={timeUnits}
        label="Lead Time"
      />
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState<Duration>({ value: 90, unit: 'days' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaDurationFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          onComplete={fn()}
          unitOptions={timeUnits}
          label="Lead Time"
          placeholder="Enter duration…"
        />
        <div className="text-sm text-muted-foreground">
          Value:{' '}
          <span className="font-medium">
            {value.value} {value.unit}
          </span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive — Error Mode
// ============================================================================

export const InteractiveError: Story = {
  render: () => {
    const [value, setValue] = useState<Duration>({ value: 0, unit: 'days' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaDurationFieldInteractive
          value={value}
          mode="error"
          onChange={(_original, current) => setValue(current)}
          errors={['Duration is required', 'Must be greater than zero']}
          unitOptions={timeUnits}
          label="Lead Time"
          placeholder="Enter duration…"
        />
      </div>
    );
  },
};

// ============================================================================
// Editable Override
// ============================================================================

export const EditableOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div className="text-sm text-muted-foreground">
        Even though mode is &quot;edit&quot;, editable=false forces display mode.
      </div>
      <ArdaDurationFieldInteractive
        value={{ value: 90, unit: 'days' }}
        mode="edit"
        editable={false}
        onChange={fn()}
        unitOptions={timeUnits}
        label="Lead Time"
      />
    </div>
  ),
};

// ============================================================================
// With Label
// ============================================================================

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4" style={{ width: 480 }}>
      <div className="text-xs font-medium text-muted-foreground">Label left (default)</div>
      <ArdaDurationFieldInteractive
        value={{ value: 90, unit: 'days' }}
        mode="display"
        onChange={fn()}
        unitOptions={timeUnits}
        label="Lead Time"
        labelPosition="left"
      />
      <ArdaDurationFieldInteractive
        value={{ value: 90, unit: 'days' }}
        mode="edit"
        onChange={fn()}
        unitOptions={timeUnits}
        label="Lead Time"
        labelPosition="left"
      />
      <ArdaDurationFieldInteractive
        value={{ value: 90, unit: 'days' }}
        mode="error"
        onChange={fn()}
        errors={['Required']}
        unitOptions={timeUnits}
        label="Lead Time"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaDurationFieldInteractive
        value={{ value: 90, unit: 'days' }}
        mode="display"
        onChange={fn()}
        unitOptions={timeUnits}
        label="Lead Time"
        labelPosition="top"
      />
      <ArdaDurationFieldInteractive
        value={{ value: 90, unit: 'days' }}
        mode="edit"
        onChange={fn()}
        unitOptions={timeUnits}
        label="Lead Time"
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
    value: { value: 90, unit: 'days' },
    mode: 'display',
    editable: true,
    label: 'Lead Time',
    labelPosition: 'left',
    unitOptions: timeUnits,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('90 days')).toBeInTheDocument();
  },
};
