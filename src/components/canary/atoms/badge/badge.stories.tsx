import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './badge';

const meta = {
  title: 'Components/Canary/Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Thin Arda wrapper around shadcn Badge. Rounded-md shape, tight padding, text-2xs (11px) semibold. ' +
          'Use className for context-specific overrides.',
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { children: '3' },
};

/** Secondary variant. */
export const Secondary: Story = {
  args: { children: '42', variant: 'secondary' },
};

/** Outline variant. */
export const Outline: Story = {
  args: { children: 'New', variant: 'outline' },
};

/** Numeric count — auto-caps at 99+. */
export const Count: Story = {
  args: { count: 42 },
};

/** High count — displays as 99+. */
export const HighCount: Story = {
  args: { count: 150 },
};

/** Custom max threshold. */
export const CustomMax: Story = {
  args: { count: 10, max: 9 },
};

/** All variants with labels. */
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-xs">
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Default</span>
        <Badge>Default</Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Secondary</span>
        <Badge variant="secondary">Secondary</Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Outline</span>
        <Badge variant="outline">Outline</Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Destructive</span>
        <Badge variant="destructive">Destructive</Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Count</span>
        <Badge count={42} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">High count</span>
        <Badge count={150} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Error overlay</span>
        <div className="relative bg-muted size-16 rounded">
          <Badge variant="error-overlay">!</Badge>
        </div>
      </div>
    </div>
  ),
};

/** Error overlay badge positioned over a thumbnail container. */
export const ErrorOverlay: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div className="relative bg-muted size-16 rounded">
      <Badge variant="error-overlay">!</Badge>
    </div>
  ),
};

/** Side-by-side comparison — normal thumbnail vs one with error badge. */
export const ErrorOverlayInContext: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div className="flex gap-6 items-end">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">Normal</span>
        <div className="relative bg-muted size-16 rounded" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">With error</span>
        <div className="relative bg-muted size-16 rounded">
          <Badge variant="error-overlay">!</Badge>
        </div>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link', 'error-overlay'],
    },
    count: { control: 'number' },
    max: { control: 'number' },
    children: { control: 'text' },
  },
  args: {
    variant: 'default',
    children: '42',
  },
};

/** Default — uses primary color (Arda orange). */
