import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Download, Printer, Trash2 } from 'lucide-react';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';
import { Button } from './button';

const meta = {
  title: 'Components/Canary/Atoms/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { onClick: fn() },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-lg">
      <h3 className="text-sm font-semibold text-muted-foreground">Variants</h3>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Primary</span>
        <Button variant="primary">Add item</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Secondary</span>
        <Button variant="secondary">Cancel</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Ghost</span>
        <Button variant="ghost">View details</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Destructive</span>
        <Button variant="destructive">Delete item</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Outline</span>
        <Button variant="outline">Export</Button>
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground mt-4">Sizes</h3>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Extra Small</span>
        <Button size="xs">Tiny</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Small</span>
        <Button size="sm">Small</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Medium</span>
        <Button size="md">Medium</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Large</span>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Icon</span>
        <Button size="icon" aria-label="Delete">
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Icon Small</span>
        <Button size="icon-sm" aria-label="Delete">
          <Trash2 className="size-4" />
        </Button>
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground mt-4">Features</h3>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">With Icon</span>
        <Button>
          <Printer className="size-4" />
          Print card
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Loading</span>
        <Button loading>Saving&#8230;</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Loading (text)</span>
        <Button loading="Downloading&#8230;">Download</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Loading (end)</span>
        <Button loading loadingPosition="end">
          Saving&#8230;
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">With Tooltip</span>
        <Button tooltip="Keyboard shortcut: Ctrl+S">Save</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Disabled + Tooltip</span>
        <Button disabled tooltip="Configure a supplier URL first">
          Place Order
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-32 text-sm text-muted-foreground">Disabled</span>
        <Button disabled>Unavailable</Button>
      </div>
    </div>
  ),
};

export const AsyncActionPattern: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const [downloading, setDownloading] = React.useState(false);
    const handleClick = () => {
      setDownloading(true);
      setTimeout(() => setDownloading(false), 2000);
    };
    return (
      <Button
        variant="outline"
        loading={downloading ? 'Downloading&#8230;' : false}
        onClick={handleClick}
      >
        <Download className="size-4" />
        Download CSV
      </Button>
    );
  },
};

export const Playground: Story = {
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'outline'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'icon', 'icon-sm', 'icon-xs', 'icon-lg'],
    },
    loading: { control: 'text' },
    loadingPosition: { control: 'select', options: ['start', 'end'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    tooltip: { control: 'text' },
    tooltipSide: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    asChild: { table: { disable: true } },
  },
  args: {
    variant: 'primary',
    size: 'md',
    loading: false,
    loadingPosition: 'start',
    disabled: false,
    children: 'Click me',
    tooltip: '',
  },
  render: ({ children, ...args }) => {
    const iconPosition = (args as Record<string, unknown>)['iconPosition'] as string;
    const isIconOnly = args.size?.toString().startsWith('icon');
    return (
      <Button {...args}>
        {!isIconOnly && iconPosition === 'left' && <Printer className="size-4" />}
        {isIconOnly ? <Printer className="size-4" /> : children}
        {!isIconOnly && iconPosition === 'right' && <Printer className="size-4" />}
      </Button>
    );
  },
};

// Add iconPosition to Playground's argTypes after the fact so it doesn't
// conflict with ButtonProps typing.
(Playground.argTypes as Record<string, unknown>)['iconPosition'] = {
  control: 'select',
  options: ['none', 'left', 'right'],
  description: 'Add an icon to the left or right of the label text.',
};
(Playground.args as Record<string, unknown>)['iconPosition'] = 'none';
