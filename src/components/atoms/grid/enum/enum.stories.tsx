import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaEnumCellDisplay } from './enum-cell-display';
import { ArdaEnumCellEditor } from './enum-cell-editor';
import { ArdaEnumCellInteractive } from './enum-cell-interactive';

const orderMechanisms = {
  MARKETPLACE: 'Marketplace',
  DIRECT: 'Direct Sales',
  DISTRIBUTOR: 'Distributor',
  CONSIGNMENT: 'Consignment',
} as const;

type OrderMechanism = keyof typeof orderMechanisms;

const meta: Meta<typeof ArdaEnumCellInteractive> = {
  title: 'Components/Atoms/Grid/Enum',
  component: ArdaEnumCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Enum value',
      table: { category: 'Runtime' },
    },
    mode: {
      control: 'select',
      options: ['display', 'edit', 'error'],
      description: 'Rendering mode',
      table: { category: 'Runtime' },
    },
    editable: {
      control: 'boolean',
      description: 'Per-field editability override',
      table: { category: 'Runtime' },
    },
    onChange: {
      action: 'changed',
      description: 'Called when value changes (original, current)',
      table: { category: 'Events' },
    },
  },
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaEnumCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaEnumCellDisplay value="MARKETPLACE" options={orderMechanisms} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaEnumCellDisplay options={orderMechanisms} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaEnumCellDisplay value={'UNKNOWN' as OrderMechanism} options={orderMechanisms} />
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
          <ArdaEnumCellEditor value={value} options={orderMechanisms} stopEditing={fn()} />
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive - Display Mode
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        mode=&quot;display&quot; renders the human-readable label.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaEnumCellInteractive
          value="DIRECT"
          mode="display"
          onChange={() => {}}
          options={orderMechanisms}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive - Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState<OrderMechanism>('MARKETPLACE');
    const [original, setOriginal] = useState<OrderMechanism>('MARKETPLACE');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;edit&quot; renders the inline select editor.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaEnumCellInteractive
            value={value}
            mode="edit"
            onChange={(orig, current) => {
              setOriginal(orig);
              setValue(current);
            }}
            options={orderMechanisms}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Original: <span className="font-medium">{original}</span>
          {' | '}
          Current: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive - Error Mode
// ============================================================================

export const InteractiveError: Story = {
  render: () => {
    const [value, setValue] = useState<OrderMechanism>('MARKETPLACE');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;error&quot; renders the inline select with error styling.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaEnumCellInteractive
            value={value}
            mode="error"
            errors={['This field is required', 'Invalid selection']}
            onChange={(_orig, current) => setValue(current)}
            options={orderMechanisms}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive - Editable Override
// ============================================================================

export const EditableOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        editable=false renders in display mode regardless of mode prop.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaEnumCellInteractive
          value="CONSIGNMENT"
          mode="edit"
          editable={false}
          onChange={() => {}}
          options={orderMechanisms}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: 'MARKETPLACE' as string,
    mode: 'display',
    editable: true,
    options: orderMechanisms,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Marketplace')).toBeInTheDocument();
  },
};
