import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaNumberCellDisplay } from './number-cell-display';
import { ArdaNumberCellEditor } from './number-cell-editor';
import { ArdaNumberCellInteractive } from './number-cell-interactive';

const meta: Meta<typeof ArdaNumberCellInteractive> = {
  title: 'Components/Atoms/Grid/Number',
  component: ArdaNumberCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Numeric value',
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
type Story = StoryObj<typeof ArdaNumberCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-xs font-medium text-muted-foreground mb-2">Integer (precision: 0)</div>
      <div className="border border-border p-2 bg-white">
        <ArdaNumberCellDisplay value={42} precision={0} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaNumberCellDisplay value={undefined} precision={0} />
      </div>

      <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">
        Decimal (precision: 2)
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaNumberCellDisplay value={3.14159} precision={2} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaNumberCellDisplay value={99.5} precision={2} />
      </div>

      <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">
        High precision (precision: 4)
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaNumberCellDisplay value={3.14159265} precision={4} />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [intValue, _setIntValue] = useState<number | undefined>(42);
    const [decimalValue, _setDecimalValue] = useState<number | undefined>(3.14);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-xs font-medium text-muted-foreground">Integer editor</div>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{intValue ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaNumberCellEditor
            value={intValue}
            precision={0}
            stopEditing={() => console.log('stopEditing called')}
          />
        </div>

        <div className="text-xs font-medium text-muted-foreground mt-4">
          Decimal editor (precision: 2)
        </div>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{decimalValue ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaNumberCellEditor
            value={decimalValue}
            precision={2}
            min={0}
            max={100}
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
    const [value, setValue] = useState(42.5);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the cell below to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaNumberCellInteractive value={value} onValueChange={setValue} />
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
    await expect(canvas.getByText('42')).toBeInTheDocument();
  },
};
