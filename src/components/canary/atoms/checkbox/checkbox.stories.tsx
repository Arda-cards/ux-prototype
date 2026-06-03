import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Canary/Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arda checkbox atom matching the Figma spec (node 46:112). Wraps the canary primitive ' +
          'with `shadow-sm` and an optional label + description + required layout. ' +
          'Use the bare form for grid selection cells, table headers, and other tight surfaces; ' +
          'use the labelled form in forms and dialogs.',
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Bare: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'No label / description — for grid cells and toolbar uses.',
      },
    },
  },
};

export const Indeterminate: Story = {
  args: { checked: 'indeterminate' },
};

export const WithLabel: Story = {
  args: { label: 'Checkbox Text' },
};

export const WithLabelAndDescription: Story = {
  args: {
    label: 'Checkbox Text',
    description: 'This is a checkbox description.',
  },
};

export const Required: Story = {
  args: {
    label: 'Checkbox Text',
    description: 'This is a checkbox description.',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Checkbox Text',
    description: 'This is a checkbox description.',
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    function Demo() {
      const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);
      return (
        <div className="flex flex-col gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
            label="Toggle me"
            description="State above the input is the React state of the parent."
          />
          <div className="text-xs text-muted-foreground">state = {String(checked)}</div>
        </div>
      );
    }
    return <Demo />;
  },
};
