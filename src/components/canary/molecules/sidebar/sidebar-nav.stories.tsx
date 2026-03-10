import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { LayoutDashboard, Package, ShoppingCart, Building2, Settings } from 'lucide-react';

import { ArdaSidebarNav } from './sidebar-nav';
import { ArdaSidebarNavItem } from './sidebar-nav-item';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';

const meta = {
  title: 'Components/Canary/Molecules/Sidebar/Nav',
  component: ArdaSidebarNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Scrollable nav section wrapping shadcn SidebarContent > SidebarGroup > SidebarMenu. ' +
          'Must be rendered inside an ArdaSidebar (SidebarProvider context).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArdaSidebarNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default with a set of nav items. */
export const Default: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavItem icon={LayoutDashboard} label="Dashboard" active />
        <ArdaSidebarNavItem icon={Package} label="Items" />
        <ArdaSidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} />
        <ArdaSidebarNavItem icon={Building2} label="Suppliers" />
        <ArdaSidebarNavItem icon={Settings} label="Settings" />
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();
    const list = canvas.getByRole('list');
    await expect(list).toBeInTheDocument();
  },
};

/** With a group label above the nav items. */
export const WithLabel: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav label="Navigation">
        <ArdaSidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <ArdaSidebarNavItem icon={Settings} label="Settings" />
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Navigation')).toBeInTheDocument();
  },
};
