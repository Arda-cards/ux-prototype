import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
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
        <ArdaBooleanCellDisplay value={undefined} displayFormat="checkbox" />
      </div>

      <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">Yes-No format</div>
      <div className="border border-border p-2 bg-white">
        <ArdaBooleanCellDisplay value={true} displayFormat="yes-no" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaBooleanCellDisplay value={false} displayFormat="yes-no" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaBooleanCellDisplay value={undefined} displayFormat="yes-no" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [checkboxValue, _setCheckboxValue] = useState<boolean | undefined>(true);
    const [yesNoValue, _setYesNoValue] = useState<boolean | undefined>(false);

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
// Interactive
// ============================================================================

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(true);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the cell below to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaBooleanCellInteractive value={value} onValueChange={setValue} />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value.toString()}</span>
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
    value: true,
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox')).toBeInTheDocument();
  },
};
