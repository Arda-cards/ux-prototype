import type { Meta, StoryObj } from '@storybook/react-vite';
import { Package, ShoppingCart, Building2, Settings, BarChart3 } from 'lucide-react';

import { ArdaIconLabel } from './icon-label';

const meta = {
  title: 'Components/Canary/Atoms/IconLabel',
  component: ArdaIconLabel,
  parameters: {
    docs: {
      description: {
        component:
          'Icon + text label pair. Renders a Lucide icon at 16px alongside truncated text. ' +
          'Context-free atom — used in nav items, menus, and anywhere an icon–label pairing is needed.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    icon: { table: { disable: true } },
  },
} satisfies Meta<typeof ArdaIconLabel>;

export default meta;
type Story = StoryObj<typeof ArdaIconLabel>;

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
      <ArdaIconLabel icon={Package} label="Items" />
      <ArdaIconLabel icon={ShoppingCart} label="Order Queue" />
      <ArdaIconLabel icon={Building2} label="Suppliers" />
      <ArdaIconLabel icon={BarChart3} label="Analytics" />
      <ArdaIconLabel icon={Settings} label="Settings" />
    </div>
  ),
};
