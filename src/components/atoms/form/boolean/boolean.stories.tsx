import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from '@storybook/test';
import { useState } from 'react';

import { ArdaBooleanFieldDisplay } from './boolean-field-display';
import { ArdaBooleanFieldEditor } from './boolean-field-editor';
import { ArdaBooleanFieldInteractive } from './boolean-field-interactive';

const meta: Meta<typeof ArdaBooleanFieldInteractive> = {
  title: 'Components/Atoms/Form/Boolean',
  component: ArdaBooleanFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'boolean',
      description: 'Current boolean value.',
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
type Story = StoryObj<typeof ArdaBooleanFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Checkbox format (true)
        </label>
        <ArdaBooleanFieldDisplay value={true} displayFormat="checkbox" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Checkbox format (false)
        </label>
        <ArdaBooleanFieldDisplay value={false} displayFormat="checkbox" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Checkbox format (empty)
        </label>
        <ArdaBooleanFieldDisplay displayFormat="checkbox" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Yes-No format (true)
        </label>
        <ArdaBooleanFieldDisplay value={true} displayFormat="yes-no" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Yes-No format (false)
        </label>
        <ArdaBooleanFieldDisplay value={false} displayFormat="yes-no" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Yes-No format (empty)
        </label>
        <ArdaBooleanFieldDisplay displayFormat="yes-no" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [checkboxValue, setCheckboxValue] = useState(true);
    const [yesNoValue, setYesNoValue] = useState(false);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Active (checkbox)
          </label>
          <ArdaBooleanFieldEditor
            value={checkboxValue}
            onChange={(_original, current) => setCheckboxValue(current)}
            onComplete={(v) => console.log('Completed:', v)}
            displayFormat="checkbox"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{checkboxValue.toString()}</span>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Approved (yes-no)
          </label>
          <ArdaBooleanFieldEditor
            value={yesNoValue}
            onChange={(_original, current) => setYesNoValue(current)}
            onComplete={(v) => console.log('Completed:', v)}
            displayFormat="yes-no"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{yesNoValue.toString()}</span>
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
      <ArdaBooleanFieldInteractive value={true} mode="display" onChange={fn()} label="Active" />
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState(true);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaBooleanFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          label="Active"
          displayFormat="checkbox"
        />
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value.toString()}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive — Error Mode
// ============================================================================

export const InteractiveError: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <ArdaBooleanFieldInteractive
        value={false}
        mode="error"
        onChange={fn()}
        errors={['This field is required']}
        label="Active"
        displayFormat="checkbox"
      />
    </div>
  ),
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
      <ArdaBooleanFieldInteractive
        value={true}
        mode="edit"
        editable={false}
        onChange={fn()}
        label="Active"
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
      <ArdaBooleanFieldInteractive
        value={true}
        mode="display"
        onChange={fn()}
        label="Active"
        labelPosition="left"
      />
      <ArdaBooleanFieldInteractive
        value={true}
        mode="edit"
        onChange={fn()}
        label="Active"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaBooleanFieldInteractive
        value={true}
        mode="display"
        onChange={fn()}
        label="Active"
        labelPosition="top"
      />
      <ArdaBooleanFieldInteractive
        value={true}
        mode="edit"
        onChange={fn()}
        label="Active"
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
    value: true,
    mode: 'display',
    editable: true,
    label: 'Active',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeInTheDocument();
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toBeTruthy();
  },
};
