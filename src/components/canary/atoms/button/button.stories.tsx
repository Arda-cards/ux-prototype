import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Printer, Trash2 } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'Components/Canary/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Add item' },
};

export const Secondary: Story = {
  args: { children: 'Cancel', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { children: 'View details', variant: 'ghost' },
};

export const Destructive: Story = {
  args: { children: 'Delete item', variant: 'destructive' },
};

export const Outline: Story = {
  args: { children: 'Export', variant: 'outline' },
};

export const Small: Story = {
  args: { children: 'Small', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Large', size: 'lg' },
};

export const WithIcon: Story = {
  args: { children: 'Print card' },
  render: (args) => (
    <Button {...args}>
      <Printer className="size-4" />
      Print card
    </Button>
  ),
};

export const IconOnly: Story = {
  args: { size: 'icon', 'aria-label': 'Delete' },
  render: (args) => (
    <Button {...args}>
      <Trash2 className="size-4" />
    </Button>
  ),
};

export const Loading: Story = {
  args: { children: 'Saving…', loading: true },
};

export const Disabled: Story = {
  args: { children: 'Unavailable', disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
