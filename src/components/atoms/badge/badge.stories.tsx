import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import { ArdaBadge } from './badge';

const meta: Meta<typeof ArdaBadge> = {
  title: 'Components/Atoms/Display and Layout/Badge',
  component: ArdaBadge,
  parameters: {
    docs: {
      description: {
        component:
          'A small status label with color-coded variants. Use badges to indicate item status (In Stock, Low Stock, Out of Stock), workflow state, or categorical tags. Supports an optional leading dot indicator.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'info', 'destructive', 'outline'],
      description: 'Visual style variant determining colors and border.',
      table: { category: 'Static' },
    },
    dot: {
      control: 'boolean',
      description: 'Show a small colored dot indicator before the text.',
      table: { category: 'Static' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaBadge>;

export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Default')).toBeInTheDocument();
  },
};

export const Success: Story = {
  args: {
    children: 'In Stock',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Low Stock',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    children: 'Processing',
    variant: 'info',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Out of Stock',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Draft',
    variant: 'outline',
  },
};

export const WithDot: Story = {
  args: {
    children: 'Active',
    variant: 'success',
    dot: true,
  },
};

export const LongText: Story = {
  args: {
    children: 'Pending Supplier Approval — Estimated Delivery Q3 2025',
    variant: 'info',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ArdaBadge variant="default">Default</ArdaBadge>
      <ArdaBadge variant="success">Success</ArdaBadge>
      <ArdaBadge variant="warning">Warning</ArdaBadge>
      <ArdaBadge variant="info">Info</ArdaBadge>
      <ArdaBadge variant="destructive">Destructive</ArdaBadge>
      <ArdaBadge variant="outline">Outline</ArdaBadge>
    </div>
  ),
};
