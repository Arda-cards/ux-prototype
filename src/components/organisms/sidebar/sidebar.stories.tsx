import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  BarChart3,
  Settings,
} from 'lucide-react';

import { ArdaSidebar, type NavItem } from './sidebar';

const sampleNavItems: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/items', icon: Package, label: 'Items' },
  { href: '/orders', icon: ShoppingCart, label: 'Order Queue' },
  { href: '/suppliers', icon: Building2, label: 'Suppliers' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const sampleUser = {
  name: 'Alex Rivera',
  email: 'alex.rivera@arda.cards',
};

const meta: Meta<typeof ArdaSidebar> = {
  title: 'Components/Organisms/Sidebar',
  component: ArdaSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A fixed-position sidebar with collapsible navigation, active-item highlighting, and an optional user footer. Supports both expanded (240px) and collapsed (56px, icon-only with hover tooltips) modes.',
      },
    },
  },
  argTypes: {
    navItems: {
      description: 'Navigation items defining the sidebar menu structure.',
      table: { category: 'Static' },
    },
    user: {
      description: 'User information displayed in the sidebar footer.',
      table: { category: 'Static' },
    },
    collapsed: {
      description: 'Whether the sidebar is in collapsed (icon-only) mode.',
      table: { category: 'Runtime' },
    },
    currentPath: {
      description: 'Current route path used for active item highlighting.',
      table: { category: 'Runtime' },
    },
    onNavigate: {
      action: 'navigate',
      description: 'Called when a navigation item is clicked.',
      table: { category: 'Events' },
    },
    onLogout: {
      action: 'logout',
      description: 'Called when the logout button is clicked.',
      table: { category: 'Events' },
    },
  },
  args: {
    onNavigate: fn(),
    onLogout: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArdaSidebar>;

export const Expanded: Story = {
  args: {
    navItems: sampleNavItems,
    collapsed: false,
    currentPath: '/',
    user: sampleUser,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();
    await expect(canvas.getByText('Alex Rivera')).toBeInTheDocument();
  },
};

export const Collapsed: Story = {
  args: {
    navItems: sampleNavItems,
    collapsed: true,
    currentPath: '/',
    user: sampleUser,
  },
};

export const ItemsActive: Story = {
  args: {
    navItems: sampleNavItems,
    collapsed: false,
    currentPath: '/items',
    user: sampleUser,
  },
};

export const OrdersActive: Story = {
  args: {
    navItems: sampleNavItems,
    collapsed: false,
    currentPath: '/orders',
    user: sampleUser,
  },
};

function ToggleDemo() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ArdaSidebar
        navItems={sampleNavItems}
        collapsed={collapsed}
        currentPath="/"
        user={sampleUser}
      />
      <div style={{ marginLeft: collapsed ? 56 : 240, padding: 24, transition: 'margin 0.2s' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: '8px 16px',
            border: '1px solid var(--base-border)',
            borderRadius: 8,
            cursor: 'pointer',
            background: 'white',
          }}
          data-testid="toggle-sidebar"
        >
          {collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        </button>
      </div>
    </div>
  );
}

export const WithToggle: Story = {
  render: () => <ToggleDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByTestId('toggle-sidebar');

    // Start expanded -- sidebar should show labels
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();

    // Click to collapse
    await userEvent.click(toggleButton);
    await expect(toggleButton).toHaveTextContent('Expand Sidebar');

    // Click to expand again
    await userEvent.click(toggleButton);
    await expect(toggleButton).toHaveTextContent('Collapse Sidebar');
  },
};
