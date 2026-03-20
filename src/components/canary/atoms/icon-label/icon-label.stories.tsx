import type { Meta, StoryObj } from '@storybook/react-vite';
import { Package, ShoppingCart, Building2, Settings, BarChart3 } from 'lucide-react';

import { IconLabel } from './icon-label';

const meta = {
  title: 'Components/Canary/Atoms/IconLabel',
  component: IconLabel,
  parameters: {
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

/** Default — icon and label inline. */
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
    label: 'Very Long Supplier Name That Should Truncate',
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
