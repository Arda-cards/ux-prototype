import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaBooleanCellDisplay } from './boolean-cell-display';
import { ArdaBooleanCellEditor } from './boolean-cell-editor';
import { ArdaBooleanCellInteractive } from './boolean-cell-interactive';

const meta: Meta<typeof ArdaBooleanCellInteractive> = {
  title: 'Components/Atoms/Grid/Boolean',
  component: ArdaBooleanCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'boolean',
      description: 'Boolean value',
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
type Story = StoryObj<typeof ArdaBooleanCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-xs font-medium text-muted-foreground mb-2">Checkbox format</div>
      <div className="border border-border p-2 bg-white flex items-center">
        <ArdaBooleanCellDisplay value={true} displayFormat="checkbox" />
      </div>
      <div className="border border-border p-2 bg-white flex items-center">
        <ArdaBooleanCellDisplay value={false} displayFormat="checkbox" />
      </div>
      <div className="border border-border p-2 bg-white flex items-center">
        <ArdaBooleanCellDisplay displayFormat="checkbox" />
      </div>

      <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">Yes-No format</div>
      <div className="border border-border p-2 bg-white">
        <ArdaBooleanCellDisplay value={true} displayFormat="yes-no" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaBooleanCellDisplay value={false} displayFormat="yes-no" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaBooleanCellDisplay displayFormat="yes-no" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor (AG Grid)
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [checkboxValue, _setCheckboxValue] = useState(true);
    const [yesNoValue, _setYesNoValue] = useState(false);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-xs font-medium text-muted-foreground">Checkbox editor</div>
        <div className="text-sm text-muted-foreground">
          Current value:{' '}
          <span className="font-medium">{checkboxValue?.toString() ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaBooleanCellEditor
            value={checkboxValue}
            displayFormat="checkbox"
            stopEditing={() => console.log('stopEditing called')}
          />
        </div>

        <div className="text-xs font-medium text-muted-foreground mt-4">Yes-No editor</div>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{yesNoValue?.toString() ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaBooleanCellEditor
            value={yesNoValue}
            displayFormat="yes-no"
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
        mode=&quot;display&quot; renders as read-only display.
      </div>
      <div
        className="border border-border p-2 bg-white flex items-center"
        style={{ minHeight: 32 }}
      >
        <ArdaBooleanCellInteractive
          value={true}
          mode="display"
          onChange={() => {}}
          displayFormat="checkbox"
        />
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaBooleanCellInteractive
          value={false}
          mode="display"
          onChange={() => {}}
          displayFormat="yes-no"
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
    const [value, setValue] = useState(true);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;edit&quot; renders the inline checkbox editor.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaBooleanCellInteractive
            value={value}
            mode="edit"
            onChange={(_orig, current) => setValue(current)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value.toString()}</span>
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
    const [value, setValue] = useState(false);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;error&quot; renders the checkbox with error styling.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaBooleanCellInteractive
            value={value}
            mode="error"
            errors={['This field is required']}
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
      <div
        className="border border-border p-2 bg-white flex items-center"
        style={{ minHeight: 32 }}
      >
        <ArdaBooleanCellInteractive value={true} mode="edit" editable={false} onChange={() => {}} />
      </div>
    </div>
  ),
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: true,
    mode: 'edit',
    editable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox')).toBeInTheDocument();
  },
};
