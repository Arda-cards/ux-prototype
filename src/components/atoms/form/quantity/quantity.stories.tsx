import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaQuantityFieldDisplay, type Quantity } from './quantity-field-display';
import { ArdaQuantityFieldEditor } from './quantity-field-editor';
import { ArdaQuantityFieldInteractive } from './quantity-field-interactive';

const weightUnits = { kg: 'Kilograms', lbs: 'Pounds', g: 'Grams', oz: 'Ounces' } as const;

const meta: Meta<typeof ArdaQuantityFieldInteractive> = {
  title: 'Components/Atoms/Form/Quantity',
  component: ArdaQuantityFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      description: 'Current quantity value.',
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
type Story = StoryObj<typeof ArdaQuantityFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With value</label>
        <ArdaQuantityFieldDisplay value={{ amount: 250, unit: 'kg' }} unitOptions={weightUnits} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaQuantityFieldDisplay unitOptions={weightUnits} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          With precision
        </label>
        <ArdaQuantityFieldDisplay
          value={{ amount: 12.5, unit: 'lbs' }}
          unitOptions={weightUnits}
          precision={2}
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
    const [value, setValue] = useState<Quantity>({ amount: 250, unit: 'kg' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Weight</label>
          <ArdaQuantityFieldEditor
            value={value}
            unitOptions={weightUnits}
            onChange={(_original, current) => setValue(current)}
            onComplete={fn()}
            placeholder="Enter amount…"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value:{' '}
          <span className="font-medium">
            {value.amount} {value.unit}
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
      <ArdaQuantityFieldInteractive
        value={{ amount: 250, unit: 'kg' }}
        mode="display"
        onChange={fn()}
        unitOptions={weightUnits}
        label="Weight"
      />
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState<Quantity>({ amount: 250, unit: 'kg' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaQuantityFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          onComplete={fn()}
          unitOptions={weightUnits}
          label="Weight"
          placeholder="Enter amount…"
        />
        <div className="text-sm text-muted-foreground">
          Value:{' '}
          <span className="font-medium">
            {value.amount} {value.unit}
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
    const [value, setValue] = useState<Quantity>({ amount: 0, unit: 'kg' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaQuantityFieldInteractive
          value={value}
          mode="error"
          onChange={(_original, current) => setValue(current)}
          errors={['Amount is required', 'Must be greater than zero']}
          unitOptions={weightUnits}
          label="Weight"
          placeholder="Enter amount…"
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
      <ArdaQuantityFieldInteractive
        value={{ amount: 250, unit: 'kg' }}
        mode="edit"
        editable={false}
        onChange={fn()}
        unitOptions={weightUnits}
        label="Weight"
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
      <ArdaQuantityFieldInteractive
        value={{ amount: 250, unit: 'kg' }}
        mode="display"
        onChange={fn()}
        unitOptions={weightUnits}
        label="Weight"
        labelPosition="left"
      />
      <ArdaQuantityFieldInteractive
        value={{ amount: 250, unit: 'kg' }}
        mode="edit"
        onChange={fn()}
        unitOptions={weightUnits}
        label="Weight"
        labelPosition="left"
      />
      <ArdaQuantityFieldInteractive
        value={{ amount: 250, unit: 'kg' }}
        mode="error"
        onChange={fn()}
        errors={['Required']}
        unitOptions={weightUnits}
        label="Weight"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaQuantityFieldInteractive
        value={{ amount: 250, unit: 'kg' }}
        mode="display"
        onChange={fn()}
        unitOptions={weightUnits}
        label="Weight"
        labelPosition="top"
      />
      <ArdaQuantityFieldInteractive
        value={{ amount: 250, unit: 'kg' }}
        mode="edit"
        onChange={fn()}
        unitOptions={weightUnits}
        label="Weight"
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
    value: { amount: 250, unit: 'kg' },
    mode: 'display',
    editable: true,
    label: 'Weight',
    labelPosition: 'left',
    unitOptions: weightUnits,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('250 kg')).toBeInTheDocument();
  },
};
