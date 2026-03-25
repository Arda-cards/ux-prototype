import type { Meta, StoryObj } from '@storybook/react-vite';
import { Package, ShoppingCart, Building2, Settings, BarChart3 } from 'lucide-react';

import { IconLabel } from './icon-label';

const meta = {
  title: 'Components/Canary/Atoms/IconLabel',
  component: IconLabel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Icon + text label pair. Renders a Lucide icon at 16px alongside truncated text. ' +
          'Context-free atom — used in nav items, menus, and anywhere an icon-label pairing is needed.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    icon: { table: { disable: true } },
  },
} satisfies Meta<typeof IconLabel>;

export default meta;
type Story = StoryObj<typeof IconLabel>;
export const Default: Story = {
  args: {
    icon: Package,
    label: 'Items',
  },
};

/** Long label — truncates with ellipsis when constrained. */
export const Truncated: Story = {
  args: {
    icon: Building2,
    label: 'Very Long Supplier Name That Should Truncate When Constrained',
    className: 'max-w-[160px]',
  },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
};

/** Multiple icon-labels stacked — common in nav and settings. */
export const Composition: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <IconLabel icon={Package} label="Items" />
      <IconLabel icon={ShoppingCart} label="Order Queue" />
      <IconLabel icon={Building2} label="Suppliers" />
      <IconLabel icon={BarChart3} label="Analytics" />
      <IconLabel icon={Settings} label="Settings" />
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-xs">
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Items</span>
        <IconLabel icon={Package} label="Items" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Order Queue</span>
        <IconLabel icon={ShoppingCart} label="Order Queue" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Suppliers</span>
        <IconLabel icon={Building2} label="Suppliers" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Analytics</span>
        <IconLabel icon={BarChart3} label="Analytics" />
      </div>
      <div className="flex items-center gap-3 w-40">
        <span className="w-28 text-sm text-muted-foreground shrink-0">Truncated</span>
        <div className="w-24 overflow-hidden">
          <IconLabel icon={Building2} label="Very Long Supplier Name That Truncates" />
        </div>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    label: { control: 'text' },
    icon: { table: { disable: true } },
  },
  args: {
    icon: Package,
    label: 'Items',
  },
};

/** Default — icon and label inline. */
