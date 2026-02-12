import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { ArdaButton } from './button';

const meta: Meta<typeof ArdaButton> = {
  title: 'Components/Atoms/Button',
  component: ArdaButton,
  parameters: {
    docs: {
      description: {
        component:
          'A themed button with four visual variants and three sizes. Supports a loading state that displays a spinner and disables interaction. Extends native HTML button attributes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual style variant.',
      table: { category: 'Static' },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size affecting height and font size.',
      table: { category: 'Static' },
    },
    loading: {
      control: 'boolean',
      description: 'Show a loading spinner and disable the button.',
      table: { category: 'Runtime' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button (inherited from HTML button).',
      table: { category: 'Runtime' },
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler.',
      table: { category: 'Events' },
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaButton>;

export const Primary: Story = {
  args: {
    children: 'Add Item',
    variant: 'primary',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Add Item' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'View Details',
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Item',
    variant: 'destructive',
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    children: 'Saving...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Unavailable',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <ArdaButton variant="primary">Primary</ArdaButton>
      <ArdaButton variant="secondary">Secondary</ArdaButton>
      <ArdaButton variant="ghost">Ghost</ArdaButton>
      <ArdaButton variant="destructive">Destructive</ArdaButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <ArdaButton size="sm">Small</ArdaButton>
      <ArdaButton size="md">Medium</ArdaButton>
      <ArdaButton size="lg">Large</ArdaButton>
    </div>
  ),
};
