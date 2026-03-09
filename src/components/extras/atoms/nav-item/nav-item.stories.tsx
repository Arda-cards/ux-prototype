import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { LayoutDashboard, Package, ShoppingCart, Building2, Settings } from 'lucide-react';

import { ArdaNavItem } from './nav-item';

const meta: Meta<typeof ArdaNavItem> = {
  title: 'Components/Extras/Atoms/Nav Item',
  component: ArdaNavItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A general-purpose navigation link with icon, label, optional badge, and tooltip support. ' +
          'Usable in sidebars, toolbars, bottom nav, and mobile drawers. ' +
          'Built on shadcn Tooltip for accessible collapsed-mode tooltips.',
      },
    },
  },
  argTypes: {
    href: { control: 'text', table: { category: 'Model' } },
    active: { control: 'boolean', table: { category: 'Model' } },
    badge: { control: 'text', table: { category: 'Model' } },
    icon: { table: { category: 'View' } },
    label: { control: 'text', table: { category: 'View' } },
    collapsed: { control: 'boolean', table: { category: 'View' } },
    variant: {
      control: 'select',
      options: ['dark', 'light'],
      table: { category: 'View' },
    },
  },
  args: {
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <ul role="list" className="w-[240px] space-y-1 list-none p-2">
        <Story />
      </ul>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArdaNavItem>;

/** Default dark variant, inactive state. */
export const Default: Story = {
  args: {
    href: '/items',
    icon: Package,
    label: 'Items',
    variant: 'dark',
  },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg">
        <ul role="list" className="w-[240px] space-y-1 list-none">
          <Story />
        </ul>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /items/i });
    await expect(link).toBeInTheDocument();
    await expect(link).not.toHaveAttribute('aria-current');
  },
};

/** Active state with aria-current and indicator. */
export const Active: Story = {
  args: {
    href: '/items',
    icon: Package,
    label: 'Items',
    active: true,
    variant: 'dark',
  },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg">
        <ul role="list" className="w-[240px] space-y-1 list-none">
          <Story />
        </ul>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /items/i });
    await expect(link).toHaveAttribute('aria-current', 'page');
  },
};

/** With a notification badge. */
export const WithBadge: Story = {
  args: {
    href: '/orders',
    icon: ShoppingCart,
    label: 'Order Queue',
    badge: 3,
    variant: 'dark',
  },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg">
        <ul role="list" className="w-[240px] space-y-1 list-none">
          <Story />
        </ul>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3')).toBeVisible();
  },
};

/** Collapsed mode — icon only with tooltip. */
export const Collapsed: Story = {
  args: {
    href: '/items',
    icon: Package,
    label: 'Items',
    collapsed: true,
    variant: 'dark',
  },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg">
        <ul role="list" className="w-[56px] space-y-1 list-none">
          <Story />
        </ul>
      </div>
    ),
  ],
};

/** Light variant for use in toolbars or light-bg contexts. */
export const LightVariant: Story = {
  args: {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
    variant: 'light',
    active: true,
  },
};

/** Multiple nav items composed together — typical sidebar navigation. */
export const Composition: Story = {
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg">
        <ul role="list" className="w-[240px] space-y-1 list-none">
          <Story />
        </ul>
      </div>
    ),
  ],
  render: () => (
    <>
      <ArdaNavItem href="/" icon={LayoutDashboard} label="Dashboard" active variant="dark" />
      <ArdaNavItem href="/items" icon={Package} label="Items" variant="dark" />
      <ArdaNavItem
        href="/orders"
        icon={ShoppingCart}
        label="Order Queue"
        badge={5}
        variant="dark"
      />
      <ArdaNavItem href="/suppliers" icon={Building2} label="Suppliers" variant="dark" />
      <ArdaNavItem href="/settings" icon={Settings} label="Settings" variant="dark" />
    </>
  ),
};

/** Playground — use Controls panel to experiment. */
export const Playground: Story = {
  args: {
    href: '/playground',
    icon: Package,
    label: 'Playground Item',
    variant: 'dark',
  },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg">
        <ul role="list" className="w-[240px] space-y-1 list-none">
          <Story />
        </ul>
      </div>
    ),
  ],
};
