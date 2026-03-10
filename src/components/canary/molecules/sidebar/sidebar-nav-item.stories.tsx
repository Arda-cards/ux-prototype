import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { LayoutDashboard, Package, ShoppingCart, Building2, Settings } from 'lucide-react';

import { ArdaSidebarNavItem } from './sidebar-nav-item';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';
import { ArdaSidebarNav } from './sidebar-nav';

const meta = {
  title: 'Components/Canary/Molecules/Sidebar/NavItem',
  component: ArdaSidebarNavItem,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A navigation button wrapping shadcn SidebarMenuItem + SidebarMenuButton. ' +
          'Supports icon, label, badge, active state, and automatic tooltips in collapsed mode. ' +
          'Consumers handle navigation via onClick (e.g. router.push). ' +
          'Must be rendered inside an ArdaSidebar (provides SidebarProvider context).',
      },
    },
  },
  argTypes: {
    active: { control: 'boolean', table: { category: 'Model' } },
    badge: { control: 'text', table: { category: 'Model' } },
    icon: { table: { category: 'View' } },
    label: { control: 'text', table: { category: 'View' } },
  },
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof ArdaSidebarNavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default inactive state inside a sidebar. */
export const Default: Story = {
  args: {
    icon: Package,
    label: 'Items',
  },
  render: (args) => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavItem {...args} />
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /items/i });
    await expect(button).toBeInTheDocument();
  },
};

/** Active state with visual indicator. */
export const Active: Story = {
  args: {
    icon: Package,
    label: 'Items',
    active: true,
  },
  render: (args) => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavItem {...args} />
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
};

/** With a notification badge. */
export const WithBadge: Story = {
  args: {
    icon: ShoppingCart,
    label: 'Order Queue',
    badge: 3,
  },
  render: (args) => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavItem {...args} />
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3')).toBeVisible();
  },
};

/** Dot badge — signals new activity without a count. */
export const WithDotBadge: Story = {
  args: {
    icon: Building2,
    label: 'Suppliers',
    badge: true,
  },
  render: (args) => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavItem {...args} />
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
};

/** Multiple nav items composed together — count badges, dot badges, and active states. */
export const Composition: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavItem icon={LayoutDashboard} label="Dashboard" active />
        <ArdaSidebarNavItem icon={Package} label="Items" badge={true} />
        <ArdaSidebarNavItem icon={ShoppingCart} label="Order Queue" badge={5} />
        <ArdaSidebarNavItem icon={Building2} label="Suppliers" badge={true} active />
        <ArdaSidebarNavItem icon={Settings} label="Settings" />
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
};
