import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaNumberCellDisplay } from './number-cell-display';
import { ArdaNumberCellEditor } from './number-cell-editor';
import { ArdaNumberCellInteractive } from './number-cell-interactive';

const meta: Meta<typeof ArdaNumberCellInteractive> = {
  title: 'Components/Extras/Atoms/Grid/Number',
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
        <ArdaNumberCellDisplay precision={0} />
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
// Interactive - Display Mode
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        mode=&quot;display&quot; renders as read-only number.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaNumberCellInteractive value={42.5} mode="display" precision={2} onChange={() => {}} />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive - Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState(42.5);
    const [original, setOriginal] = useState(42.5);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;edit&quot; renders the inline number editor.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaNumberCellInteractive
            value={value}
            mode="edit"
            precision={2}
            min={0}
            max={1000}
            onChange={(orig, current) => {
              setOriginal(orig);
              setValue(current);
            }}
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
    const [value, setValue] = useState(0);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;error&quot; renders the inline editor with error styling.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaNumberCellInteractive
            value={value}
            mode="error"
            errors={['Value must be greater than 0', 'Required field']}
            onChange={(_orig, current) => setValue(current)}
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
        <ArdaNumberCellInteractive value={42} mode="edit" editable={false} onChange={() => {}} />
      </div>
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
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('42')).toBeInTheDocument();
  },
};
