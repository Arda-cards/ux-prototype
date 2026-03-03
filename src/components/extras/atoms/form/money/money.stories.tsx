import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaMoneyFieldDisplay, type Money } from './money-field-display';
import { ArdaMoneyFieldEditor } from './money-field-editor';
import { ArdaMoneyFieldInteractive } from './money-field-interactive';

const currencies = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
} as const;

const meta: Meta<typeof ArdaMoneyFieldInteractive> = {
  title: 'Components/Extras/Atoms/Form/Money',
  component: ArdaMoneyFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      description: 'Current money value.',
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
type Story = StoryObj<typeof ArdaMoneyFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With value</label>
        <ArdaMoneyFieldDisplay
          value={{ amount: 1500, currency: 'USD' }}
          currencyOptions={currencies}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaMoneyFieldDisplay currencyOptions={currencies} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          JPY (0 decimals)
        </label>
        <ArdaMoneyFieldDisplay
          value={{ amount: 150000, currency: 'JPY' }}
          currencyOptions={currencies}
          precision={0}
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
    const [value, setValue] = useState<Money>({ amount: 1500, currency: 'USD' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Price</label>
          <ArdaMoneyFieldEditor
            value={value}
            currencyOptions={currencies}
            onChange={(_original, current) => setValue(current)}
            onComplete={fn()}
            placeholder="Enter amount…"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value:{' '}
          <span className="font-medium">
            {value.amount} {value.currency}
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
      <ArdaMoneyFieldInteractive
        value={{ amount: 1500, currency: 'USD' }}
        mode="display"
        onChange={fn()}
        currencyOptions={currencies}
        label="Price"
      />
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState<Money>({ amount: 1500, currency: 'USD' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaMoneyFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          onComplete={fn()}
          currencyOptions={currencies}
          label="Price"
          placeholder="Enter amount…"
        />
        <div className="text-sm text-muted-foreground">
          Value:{' '}
          <span className="font-medium">
            {value.amount} {value.currency}
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
    const [value, setValue] = useState<Money>({ amount: 0, currency: 'USD' });

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaMoneyFieldInteractive
          value={value}
          mode="error"
          onChange={(_original, current) => setValue(current)}
          errors={['Amount is required', 'Must be greater than zero']}
          currencyOptions={currencies}
          label="Price"
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
      <ArdaMoneyFieldInteractive
        value={{ amount: 1500, currency: 'USD' }}
        mode="edit"
        editable={false}
        onChange={fn()}
        currencyOptions={currencies}
        label="Price"
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
      <ArdaMoneyFieldInteractive
        value={{ amount: 1500, currency: 'USD' }}
        mode="display"
        onChange={fn()}
        currencyOptions={currencies}
        label="Price"
        labelPosition="left"
      />
      <ArdaMoneyFieldInteractive
        value={{ amount: 1500, currency: 'USD' }}
        mode="edit"
        onChange={fn()}
        currencyOptions={currencies}
        label="Price"
        labelPosition="left"
      />
      <ArdaMoneyFieldInteractive
        value={{ amount: 1500, currency: 'USD' }}
        mode="error"
        onChange={fn()}
        errors={['Required']}
        currencyOptions={currencies}
        label="Price"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaMoneyFieldInteractive
        value={{ amount: 1500, currency: 'USD' }}
        mode="display"
        onChange={fn()}
        currencyOptions={currencies}
        label="Price"
        labelPosition="top"
      />
      <ArdaMoneyFieldInteractive
        value={{ amount: 1500, currency: 'USD' }}
        mode="edit"
        onChange={fn()}
        currencyOptions={currencies}
        label="Price"
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
    value: { amount: 1500, currency: 'USD' },
    mode: 'display',
    editable: true,
    label: 'Price',
    labelPosition: 'left',
    currencyOptions: currencies,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/1,500/)).toBeInTheDocument();
  },
};
