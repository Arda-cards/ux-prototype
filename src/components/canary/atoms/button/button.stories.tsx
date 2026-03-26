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
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Primary</span>
        <Button variant="primary">Add item</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Secondary</span>
        <Button variant="secondary">Cancel</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Ghost</span>
        <Button variant="ghost">View details</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Destructive</span>
        <Button variant="destructive">Delete item</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Outline</span>
        <Button variant="outline">Export</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Small</span>
        <Button size="sm">Small</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Large</span>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">With Icon</span>
        <Button>
          <Printer className="size-4" />
          Print card
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Icon Only</span>
        <Button size="icon" aria-label="Delete">
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Loading</span>
        <Button loading>Saving…</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Disabled</span>
        <Button disabled>Unavailable</Button>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Small</span>
        <Button size="sm">Small</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Medium</span>
        <Button size="md">Medium</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Large</span>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Icon</span>
        <Button size="icon" aria-label="Action">
          <Printer className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Icon Small</span>
        <Button size="icon-sm" aria-label="Action">
          <Printer className="size-4" />
        </Button>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon', 'icon-sm'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    asChild: { table: { disable: true } },
  },
  args: {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    children: 'Click me',
  },
};
