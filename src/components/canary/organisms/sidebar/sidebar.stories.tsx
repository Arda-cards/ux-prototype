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
} from 'lucide-react';

import { ArdaSidebar } from './sidebar';
import { ArdaSidebarHeader } from './sidebar-header';
import { ArdaSidebarNav } from '../../molecules/sidebar-nav/sidebar-nav';
import { ArdaSidebarNavGroup } from '../../molecules/sidebar-nav-group/sidebar-nav-group';
import { ArdaSidebarUserMenu } from '../../molecules/sidebar-user-menu/sidebar-user-menu';
import { ArdaNavItem } from '../../atoms/nav-item/nav-item';
import { ArdaCollapseToggle } from '../../atoms/collapse-toggle/collapse-toggle';
import { ArdaLogo, ArdaLogoFull } from '../../../extras/organisms/sidebar/arda-logo';

const mockUser = {
  name: 'Callil Capuozzo',
  email: 'callil@arda.cards',
};

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
        <ArdaLogoFull height={24} />
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

      <ArdaSidebarUserMenu user={mockUser} onLogout={() => {}} onSettings={() => {}} />
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
        <ArdaLogo size={24} />
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

      <ArdaSidebarUserMenu user={mockUser} collapsed onLogout={() => {}} />
    </ArdaSidebar>
  ),
};

/** Interactive — toggle between expanded and collapsed. */
export const Interactive: Story = {
  render: function InteractiveSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
      <ArdaSidebar collapsed={collapsed}>
        <ArdaSidebarHeader>
          {collapsed ? <ArdaLogo size={24} /> : <ArdaLogoFull height={24} />}
          <ArdaCollapseToggle collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </ArdaSidebarHeader>

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

        <ArdaSidebarUserMenu
          user={mockUser}
          collapsed={collapsed}
          onLogout={() => {}}
          onSettings={() => {}}
        />
      </ArdaSidebar>
    );
  },
};
