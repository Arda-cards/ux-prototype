import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Settings,
  Boxes,
  BarChart3,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

import { ArdaSidebar } from './sidebar';
import { ArdaSidebarHeader } from './sidebar-header';
import { ArdaSidebarNav } from '../../molecules/sidebar-nav/sidebar-nav';
import { ArdaSidebarNavGroup } from '../../molecules/sidebar-nav-group/sidebar-nav-group';
import {
  ArdaSidebarUserMenu,
  type UserMenuAction,
} from '../../molecules/sidebar-user-menu/sidebar-user-menu';
import { ArdaNavItem } from '../../atoms/nav-item/nav-item';
import { ArdaCollapseToggle } from '../../atoms/collapse-toggle/collapse-toggle';
import { ArdaBrandLogo, ArdaBrandIcon } from '../../atoms/brand-logo/brand-logo';

const mockUser = {
  name: 'Callil Capuozzo',
  email: 'callil@arda.cards',
};

const mockActions: UserMenuAction[] = [
  { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: () => {} },
  { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
  { key: 'logout', label: 'Log out', icon: LogOut, onClick: () => {}, destructive: true },
];

const meta: Meta<typeof ArdaSidebar> = {
  title: 'Components/Canary/Organisms/Sidebar',
  component: ArdaSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full sidebar organism composed from atoms and molecules. ' +
          'Uses compound component pattern — children composition, not config arrays. ' +
          'Supports expanded/collapsed modes with smooth transitions.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaSidebar>;

/** Full sidebar in expanded mode. */
export const Expanded: Story = {
  render: () => (
    <ArdaSidebar>
      <ArdaSidebarHeader>
        <ArdaBrandLogo />
      </ArdaSidebarHeader>

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

        <ArdaSidebarNavGroup label="Analytics" icon={BarChart3} defaultExpanded>
          <ArdaNavItem href="/analytics/sales" icon={BarChart3} label="Sales" variant="dark" />
          <ArdaNavItem href="/analytics/inventory" icon={Boxes} label="Inventory" variant="dark" />
        </ArdaSidebarNavGroup>

        <ArdaNavItem href="/settings" icon={Settings} label="Settings" variant="dark" />
      </ArdaSidebarNav>

      <ArdaSidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('complementary')).toBeInTheDocument();
    await expect(canvas.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
  },
};

/** Collapsed sidebar — icon-only with tooltips. */
export const Collapsed: Story = {
  render: () => (
    <ArdaSidebar collapsed>
      <ArdaSidebarHeader>
        <ArdaBrandIcon />
      </ArdaSidebarHeader>

      <ArdaSidebarNav>
        <ArdaNavItem
          href="/"
          icon={LayoutDashboard}
          label="Dashboard"
          active
          collapsed
          variant="dark"
        />
        <ArdaNavItem href="/items" icon={Package} label="Items" collapsed variant="dark" />
        <ArdaNavItem
          href="/orders"
          icon={ShoppingCart}
          label="Order Queue"
          badge={3}
          collapsed
          variant="dark"
        />
        <ArdaNavItem
          href="/suppliers"
          icon={Building2}
          label="Suppliers"
          collapsed
          variant="dark"
        />

        <ArdaSidebarNavGroup label="Analytics" icon={BarChart3} collapsed>
          <ArdaNavItem
            href="/analytics/sales"
            icon={BarChart3}
            label="Sales"
            collapsed
            variant="dark"
          />
          <ArdaNavItem
            href="/analytics/inventory"
            icon={Boxes}
            label="Inventory"
            collapsed
            variant="dark"
          />
        </ArdaSidebarNavGroup>

        <ArdaNavItem href="/settings" icon={Settings} label="Settings" collapsed variant="dark" />
      </ArdaSidebarNav>

      <ArdaSidebarUserMenu user={mockUser} actions={mockActions} collapsed />
    </ArdaSidebar>
  ),
};

/** Interactive — toggle between expanded and collapsed. */
export const Interactive: Story = {
  render: function InteractiveSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
      <ArdaSidebar collapsed={collapsed}>
        <ArdaSidebarHeader>{collapsed ? <ArdaBrandIcon /> : <ArdaBrandLogo />}</ArdaSidebarHeader>

        <ArdaSidebarNav>
          <ArdaNavItem
            href="/"
            icon={LayoutDashboard}
            label="Dashboard"
            active
            collapsed={collapsed}
            variant="dark"
          />
          <ArdaNavItem
            href="/items"
            icon={Package}
            label="Items"
            collapsed={collapsed}
            variant="dark"
          />
          <ArdaNavItem
            href="/orders"
            icon={ShoppingCart}
            label="Order Queue"
            badge={3}
            collapsed={collapsed}
            variant="dark"
          />
          <ArdaNavItem
            href="/suppliers"
            icon={Building2}
            label="Suppliers"
            collapsed={collapsed}
            variant="dark"
          />

          <ArdaSidebarNavGroup
            label="Analytics"
            icon={BarChart3}
            defaultExpanded
            collapsed={collapsed}
          >
            <ArdaNavItem
              href="/analytics/sales"
              icon={BarChart3}
              label="Sales"
              collapsed={collapsed}
              variant="dark"
            />
            <ArdaNavItem
              href="/analytics/inventory"
              icon={Boxes}
              label="Inventory"
              collapsed={collapsed}
              variant="dark"
            />
          </ArdaSidebarNavGroup>

          <ArdaNavItem
            href="/settings"
            icon={Settings}
            label="Settings"
            collapsed={collapsed}
            variant="dark"
          />
        </ArdaSidebarNav>

        {/* Toggle lives at the bottom, pinned above user menu — same position in both states */}
        <div className="relative z-10 px-2 py-1 flex justify-center">
          <ArdaCollapseToggle collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>

        <ArdaSidebarUserMenu user={mockUser} actions={mockActions} collapsed={collapsed} />
      </ArdaSidebar>
    );
  },
};
