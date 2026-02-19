import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaNumberFieldDisplay } from './number-field-display';
import { ArdaNumberFieldEditor } from './number-field-editor';
import { ArdaNumberFieldInteractive } from './number-field-interactive';

const meta: Meta<typeof ArdaNumberFieldInteractive> = {
  title: 'Components/Atoms/Form/Number',
  component: ArdaNumberFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Current numeric value.',
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
type Story = StoryObj<typeof ArdaNumberFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Integer (precision: 0)
        </label>
        <ArdaNumberFieldDisplay value={42} precision={0} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaNumberFieldDisplay precision={0} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Decimal (precision: 2)
        </label>
        <ArdaNumberFieldDisplay value={3.14159} precision={2} />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [intValue, setIntValue] = useState(42);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Quantity (integer)
          </label>
          <ArdaNumberFieldEditor
            value={intValue}
            onChange={(_original, current) => setIntValue(current)}
            onComplete={(v) => console.log('Completed:', v)}
            precision={0}
            min={0}
            placeholder="Enter quantity…"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{intValue}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive — All Modes
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <ArdaNumberFieldInteractive value={42} mode="display" onChange={fn()} label="Quantity" />
    </div>
  ),
};

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState(42);
    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaNumberFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          label="Quantity"
          precision={0}
        />
      </div>
    );
  },
};

export const InteractiveError: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <ArdaNumberFieldInteractive
        value={0}
        mode="error"
        onChange={fn()}
        errors={['Value must be greater than zero']}
        label="Quantity"
      />
    </div>
  ),
};

export const EditableOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <ArdaNumberFieldInteractive
        value={42}
        mode="edit"
        editable={false}
        onChange={fn()}
        label="Quantity"
      />
    </div>
  ),
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: 42,
    mode: 'display',
    editable: true,
    label: 'Quantity',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('42')).toBeInTheDocument();
  },
};
