import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { LayoutDashboard, Package, ShoppingCart, Building2, Settings } from 'lucide-react';

import { SidebarNav } from './sidebar-nav';
import { SidebarNavItem } from './sidebar-nav-item';
import { Sidebar } from '../../organisms/sidebar/sidebar';

const meta = {
  title: 'Components/Canary/Molecules/Sidebar/Nav',
  component: SidebarNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Scrollable nav section wrapping shadcn SidebarContent > SidebarGroup > SidebarMenu. ' +
          'Must be rendered inside an Sidebar (SidebarProvider context).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SidebarNav>;

export default meta;
type Story = StoryObj<typeof SidebarNav>;

/** Default with a set of nav items. */
export const Default: Story = {
  render: () => (
    <Sidebar defaultOpen>
      <SidebarNav>
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" active />
        <SidebarNavItem icon={Package} label="Items" />
        <SidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} />
        <SidebarNavItem icon={Building2} label="Suppliers" />
        <SidebarNavItem icon={Settings} label="Settings" />
      </SidebarNav>
    </Sidebar>
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
    <Sidebar defaultOpen>
      <SidebarNav label="Navigation">
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <SidebarNavItem icon={Settings} label="Settings" />
      </SidebarNav>
    </Sidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Navigation')).toBeInTheDocument();
  },
};
