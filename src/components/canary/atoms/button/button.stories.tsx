import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Printer, Trash2 } from 'lucide-react';
import { ArdaButton } from './button';

const meta = {
  title: 'Components/Canary/Atoms/Button',
  component: ArdaButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof ArdaButton>;

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
    <ArdaButton {...args}>
      <Printer className="size-4" />
      Print card
    </ArdaButton>
  ),
};

export const IconOnly: Story = {
  args: { size: 'icon', 'aria-label': 'Delete' },
  render: (args) => (
    <ArdaButton {...args}>
      <Trash2 className="size-4" />
    </ArdaButton>
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
      <ArdaButton variant="primary">Primary</ArdaButton>
      <ArdaButton variant="secondary">Secondary</ArdaButton>
      <ArdaButton variant="outline">Outline</ArdaButton>
      <ArdaButton variant="ghost">Ghost</ArdaButton>
      <ArdaButton variant="destructive">Destructive</ArdaButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ArdaButton size="sm">Small</ArdaButton>
      <ArdaButton size="md">Medium</ArdaButton>
      <ArdaButton size="lg">Large</ArdaButton>
    </div>
  ),
};
