import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaEnumFieldDisplay } from './enum-field-display';
import { ArdaEnumFieldEditor } from './enum-field-editor';
import { ArdaEnumFieldInteractive } from './enum-field-interactive';

const orderMechanisms = {
  MARKETPLACE: 'Marketplace',
  DIRECT: 'Direct Sales',
  DISTRIBUTOR: 'Distributor',
  CONSIGNMENT: 'Consignment',
} as const;

type OrderMechanism = keyof typeof orderMechanisms;

const meta: Meta<typeof ArdaEnumFieldInteractive> = {
  title: 'Components/Extras/Atoms/Form/Enum',
  component: ArdaEnumFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Current enum value.',
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
type Story = StoryObj<typeof ArdaEnumFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With value</label>
        <ArdaEnumFieldDisplay value="MARKETPLACE" options={orderMechanisms} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaEnumFieldDisplay options={orderMechanisms} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Invalid value
        </label>
        <ArdaEnumFieldDisplay value={'UNKNOWN' as OrderMechanism} options={orderMechanisms} />
      </div>
    </div>
  ),
};

// ============================================================================
// Edit
// ============================================================================

export const Edit: Story = {
  render: () => {
    const [value, setValue] = useState<OrderMechanism>('MARKETPLACE');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Order Mechanism
          </label>
          <ArdaEnumFieldEditor
            value={value}
            options={orderMechanisms}
            onChange={(_original, current) => setValue(current)}
            onComplete={fn()}
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
// Error
// ============================================================================

export const Error: Story = {
  render: () => {
    const [value, setValue] = useState<OrderMechanism>('MARKETPLACE');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaEnumFieldInteractive
          value={value}
          mode="error"
          onChange={(_original, current) => setValue(current)}
          errors={['Order mechanism is not available in this region']}
          options={orderMechanisms}
          label="Order Mechanism"
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
      <ArdaEnumFieldInteractive
        value="DIRECT"
        mode="edit"
        editable={false}
        onChange={fn()}
        options={orderMechanisms}
        label="Order Mechanism"
      />
    </div>
  ),
};

// ============================================================================
// ManyOptions
// ============================================================================

export const ManyOptions: Story = {
  render: () => {
    const manyOptions: Record<string, string> = {};
    for (let i = 1; i <= 50; i++) {
      manyOptions[`OPT_${i}`] = `Option ${i}`;
    }
    const [value, setValue] = useState('OPT_1');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaEnumFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          options={manyOptions}
          label="Many Options"
        />
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
    value: 'MARKETPLACE' as string,
    mode: 'display',
    editable: true,
    label: 'Order Mechanism',
    labelPosition: 'left',
    options: orderMechanisms,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Marketplace')).toBeInTheDocument();
  },
};
