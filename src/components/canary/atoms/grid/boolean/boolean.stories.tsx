import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { useState } from 'react';

import { BooleanCellDisplay } from './boolean-cell-display';
import { BooleanCellEditor } from './boolean-cell-editor';

const meta: Meta<typeof BooleanCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Boolean',
  component: BooleanCellDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'boolean',
      description: 'Boolean value',
      table: { category: 'Runtime' },
    },
    displayFormat: {
      control: 'select',
      options: ['checkbox', 'yes-no'],
      description: 'Display format',
      table: { category: 'Static' },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof BooleanCellDisplay>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-xs font-medium text-muted-foreground mb-2">Checkbox format</div>
      <div className="border border-border p-2 bg-white flex items-center">
        <BooleanCellDisplay value={true} displayFormat="checkbox" />
      </div>
      <div className="border border-border p-2 bg-white flex items-center">
        <BooleanCellDisplay value={false} displayFormat="checkbox" />
      </div>
      <div className="border border-border p-2 bg-white flex items-center">
        <BooleanCellDisplay displayFormat="checkbox" />
      </div>

      <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">Yes-No format</div>
      <div className="border border-border p-2 bg-white">
        <BooleanCellDisplay value={true} displayFormat="yes-no" />
      </div>
      <div className="border border-border p-2 bg-white">
        <BooleanCellDisplay value={false} displayFormat="yes-no" />
      </div>
      <div className="border border-border p-2 bg-white">
        <BooleanCellDisplay displayFormat="yes-no" />
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
          <BooleanCellEditor
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
          <BooleanCellEditor
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
// Playground
// ============================================================================

export const Playground: Story = {
  argTypes: {
    mode: {
      control: 'radio',
      options: ['display', 'editor'],
      description: 'Toggle between Display and Editor mode',
    },
  },
  args: {
    value: true,
    displayFormat: 'checkbox',
    mode: 'display',
  },
  render: (args: Record<string, unknown>) => {
    const mode = (args.mode as string) ?? 'display';
    const value = args.value as boolean | undefined;
    const displayFormat = args.displayFormat as 'checkbox' | 'yes-no' | undefined;

    if (mode === 'editor') {
      return (
        <div className="border border-border bg-white p-2" style={{ width: 200, height: 32 }}>
          <BooleanCellEditor value={value} stopEditing={() => {}} />
        </div>
      );
    }

    return <BooleanCellDisplay value={value} displayFormat={displayFormat} />;
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')).toBeInTheDocument();
  },
};
