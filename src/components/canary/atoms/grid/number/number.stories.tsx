import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { useState } from 'react';

import { NumberCellDisplay } from './number-cell-display';
import { NumberCellEditor } from './number-cell-editor';

const meta: Meta<typeof NumberCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Number',
  component: NumberCellDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Numeric value',
      table: { category: 'Runtime' },
    },
    precision: {
      control: 'number',
      description: 'Number of decimal places',
      table: { category: 'Static' },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof NumberCellDisplay>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-xs font-medium text-muted-foreground mb-2">Integer (precision: 0)</div>
      <div className="border border-border p-2 bg-white">
        <NumberCellDisplay value={42} precision={0} />
      </div>
      <div className="border border-border p-2 bg-white">
        <NumberCellDisplay precision={0} />
      </div>

      <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">
        Decimal (precision: 2)
      </div>
      <div className="border border-border p-2 bg-white">
        <NumberCellDisplay value={3.14159} precision={2} />
      </div>
      <div className="border border-border p-2 bg-white">
        <NumberCellDisplay value={99.5} precision={2} />
      </div>

      <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">
        High precision (precision: 4)
      </div>
      <div className="border border-border p-2 bg-white">
        <NumberCellDisplay value={3.14159265} precision={4} />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor (AG Grid)
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [intValue, _setIntValue] = useState(42);
    const [decimalValue, _setDecimalValue] = useState(3.14);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-xs font-medium text-muted-foreground">Integer editor</div>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{intValue ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <NumberCellEditor
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
          <NumberCellEditor
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
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: 42,
    precision: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('42')).toBeInTheDocument();
  },
};
