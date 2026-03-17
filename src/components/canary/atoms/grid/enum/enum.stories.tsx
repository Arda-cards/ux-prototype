import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { EnumCellDisplay } from './enum-cell-display';
import { EnumCellEditor } from './enum-cell-editor';

const orderMechanisms = {
  MARKETPLACE: 'Marketplace',
  DIRECT: 'Direct Sales',
  DISTRIBUTOR: 'Distributor',
  CONSIGNMENT: 'Consignment',
} as const;

type OrderMechanism = keyof typeof orderMechanisms;

const meta: Meta<typeof EnumCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Enum',
  component: EnumCellDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Enum value',
      table: { category: 'Runtime' },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof EnumCellDisplay>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <EnumCellDisplay value="MARKETPLACE" options={orderMechanisms} />
      </div>
      <div className="border border-border p-2 bg-white">
        <EnumCellDisplay options={orderMechanisms} />
      </div>
      <div className="border border-border p-2 bg-white">
        <EnumCellDisplay value={'UNKNOWN' as OrderMechanism} options={orderMechanisms} />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor (AG Grid)
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value] = useState<OrderMechanism>('MARKETPLACE');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <EnumCellEditor value={value} options={orderMechanisms} stopEditing={fn()} />
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
    value: 'MARKETPLACE' as string,
    options: orderMechanisms,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Marketplace')).toBeInTheDocument();
  },
};

void fn;
