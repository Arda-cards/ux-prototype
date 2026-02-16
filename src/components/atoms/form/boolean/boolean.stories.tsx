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
    onValueChange: fn(),
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
          Checkbox format (undefined)
        </label>
        <ArdaBooleanFieldDisplay value={undefined} displayFormat="checkbox" />
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
          Yes-No format (undefined)
        </label>
        <ArdaBooleanFieldDisplay value={undefined} displayFormat="yes-no" />
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
            onChange={setCheckboxValue}
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
            onChange={setYesNoValue}
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
// Interactive
// ============================================================================

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(true);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the field to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Active</label>
          <ArdaBooleanFieldInteractive value={value} onValueChange={setValue} />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value.toString()}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// With Label
// ============================================================================

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4" style={{ width: 480 }}>
      <div className="text-xs font-medium text-muted-foreground">Label left (default)</div>
      <ArdaBooleanFieldDisplay value={true} label="Active" labelPosition="left" />
      <ArdaBooleanFieldEditor value={true} label="Active" labelPosition="left" />
      <ArdaBooleanFieldInteractive value={true} label="Active" labelPosition="left" />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaBooleanFieldDisplay value={true} label="Active" labelPosition="top" />
      <ArdaBooleanFieldEditor value={true} label="Active" labelPosition="top" />
      <ArdaBooleanFieldInteractive value={true} label="Active" labelPosition="top" />
    </div>
  ),
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: true,
    disabled: false,
    label: 'Active',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeInTheDocument();
    // Boolean with value=true renders a check icon (SVG) in checkbox display mode
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toBeTruthy();
  },
};
