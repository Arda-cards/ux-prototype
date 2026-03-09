import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { LayoutDashboard, Package, ShoppingCart, Building2, Settings } from 'lucide-react';

import { ArdaSidebarNav } from './sidebar-nav';
import { ArdaNavItem } from '../../atoms/nav-item/nav-item';

const meta: Meta<typeof ArdaSidebarNav> = {
  title: 'Components/Canary/Molecules/Sidebar Nav',
  component: ArdaSidebarNav,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Semantic nav wrapper that provides landmark navigation and list semantics. ' +
          'Composes ArdaNavItem and ArdaSidebarNavGroup children.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg w-[260px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArdaSidebarNav>;

/** Default with a set of nav items. */
export const Default: Story = {
  render: () => (
    <ArdaSidebarNav>
      <ArdaNavItem href="/" icon={LayoutDashboard} label="Dashboard" active variant="dark" />
      <ArdaNavItem href="/items" icon={Package} label="Items" variant="dark" />
      <ArdaNavItem
        href="/orders"
        icon={ShoppingCart}
        label="Order Queue"
        badge={3}
        variant="dark"
      />
      <ArdaNavItem href="/suppliers" icon={Building2} label="Suppliers" variant="dark" />
      <ArdaNavItem href="/settings" icon={Settings} label="Settings" variant="dark" />
    </ArdaSidebarNav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: /primary/i });
    await expect(nav).toBeInTheDocument();
    const list = canvas.getByRole('list');
    await expect(list).toBeInTheDocument();
  },
};

/** Custom aria-label for secondary navigation. */
export const SecondaryNav: Story = {
  render: () => (
    <ArdaSidebarNav aria-label="Secondary">
      <ArdaNavItem href="/settings" icon={Settings} label="Settings" variant="dark" />
    </ArdaSidebarNav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: /secondary/i });
    await expect(nav).toBeInTheDocument();
  },
};
