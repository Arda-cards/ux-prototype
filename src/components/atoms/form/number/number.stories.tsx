import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
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
  },
  args: {
    onValueChange: fn(),
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
        <ArdaNumberFieldDisplay value={undefined} precision={0} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Decimal (precision: 2)
        </label>
        <ArdaNumberFieldDisplay value={3.14159} precision={2} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Price (precision: 2)
        </label>
        <ArdaNumberFieldDisplay value={99.5} precision={2} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          High precision (precision: 4)
        </label>
        <ArdaNumberFieldDisplay value={3.14159265} precision={4} />
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
    const [priceValue, setPriceValue] = useState(99.99);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Quantity (integer)
          </label>
          <ArdaNumberFieldEditor
            value={intValue}
            onChange={setIntValue}
            onComplete={(v) => console.log('Completed:', v)}
            precision={0}
            min={0}
            placeholder="Enter quantity…"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{intValue}</span>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Price (precision: 2)
          </label>
          <ArdaNumberFieldEditor
            value={priceValue}
            onChange={setPriceValue}
            onComplete={(v) => console.log('Completed:', v)}
            precision={2}
            min={0}
            max={9999.99}
            placeholder="0.00"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{priceValue.toFixed(2)}</span>
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
    const [value, setValue] = useState(42.5);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the field to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Value</label>
          <ArdaNumberFieldInteractive value={value} onValueChange={setValue} />
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
    value: 42,
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Default precision=0 formats 42 as "42"
    await expect(canvas.getByText('42')).toBeInTheDocument();
  },
};
