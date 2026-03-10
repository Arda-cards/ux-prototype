import React from 'react';
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
  Users,
  FileText,
  Tag,
} from 'lucide-react';

import { ArdaSidebar } from './sidebar';
import { ArdaSidebarHeader } from './sidebar-header';
import { ArdaSidebarNav } from './sidebar-nav';
import { ArdaSidebarNavGroup } from './sidebar-nav-group';
import { ArdaSidebarUserMenu, type UserMenuAction } from './sidebar-user-menu';
import { ArdaSidebarNavItem } from './sidebar-nav-item';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const mockUser = {
  name: 'Callil Capuozzo',
  email: 'callil@arda.cards',
  role: 'Account Admin',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CC',
};

const mockActions: UserMenuAction[] = [
  { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: () => {} },
  { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
  { key: 'logout', label: 'Log out', icon: LogOut, onClick: () => {}, destructive: true },
];

const meta = {
  title: 'Components/Canary/Organisms/Sidebar',
  component: ArdaSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Arda sidebar organism built on shadcn/ui Sidebar primitives. ' +
          'Provides mobile Sheet drawer, Cmd+B keyboard shortcut, cookie persistence, ' +
          'and icon-only collapsed mode with tooltips — all from shadcn. ' +
          'Arda adds dark theme tokens, brand header, and user menu.',
      },
    },
  },
} satisfies Meta<typeof ArdaSidebar>;

export default meta;
type Story = StoryObj<typeof ArdaSidebar>;

/** Default sidebar — toggle `open` in the controls panel, or use Cmd+B / the sidebar rail. */
export const Default: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <ArdaSidebar open={args.open} onOpenChange={args.onOpenChange}>
      <ArdaSidebarHeader teamName="Arda Cards" />

      <ArdaSidebarNav>
        <ArdaSidebarNavItem icon={LayoutDashboard} label="Dashboard" active />
        <ArdaSidebarNavItem icon={Package} label="Items" />
        <ArdaSidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} />
        <ArdaSidebarNavItem icon={Building2} label="Suppliers" />

        <ArdaSidebarNavGroup label="Analytics" icon={BarChart3} defaultExpanded>
          <ArdaSidebarNavItem icon={BarChart3} label="Sales" />
          <ArdaSidebarNavItem icon={Boxes} label="Inventory" />
        </ArdaSidebarNavGroup>

        <ArdaSidebarNavItem icon={Settings} label="Settings" />
      </ArdaSidebarNav>

      <ArdaSidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Arda Cards')).toBeInTheDocument();
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();
  },
};

/** Nav items with notification badges. */
export const WithBadges: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarHeader teamName="Arda Cards" />

      <ArdaSidebarNav>
        <ArdaSidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <ArdaSidebarNavItem icon={Package} label="Items" badge={42} />
        <ArdaSidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} active />
        <ArdaSidebarNavItem icon={Building2} label="Suppliers" badge={true} />
        <ArdaSidebarNavItem icon={Settings} label="Settings" badge={true} active />
      </ArdaSidebarNav>

      <ArdaSidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
};

/** Nested nav groups with auto-expand on active child. */
export const WithGroups: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarHeader teamName="Arda Cards" />

      <ArdaSidebarNav>
        <ArdaSidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <ArdaSidebarNavItem icon={Package} label="Items" />

        <ArdaSidebarNavGroup label="Analytics" icon={BarChart3}>
          <ArdaSidebarNavItem icon={BarChart3} label="Sales" />
          <ArdaSidebarNavItem icon={Boxes} label="Inventory" active />
        </ArdaSidebarNavGroup>

        <ArdaSidebarNavGroup label="People" icon={Users}>
          <ArdaSidebarNavItem icon={Users} label="Team" />
          <ArdaSidebarNavItem icon={ShieldCheck} label="Roles" />
        </ArdaSidebarNavGroup>

        <ArdaSidebarNavGroup label="Content" icon={FileText}>
          <ArdaSidebarNavItem icon={FileText} label="Pages" />
          <ArdaSidebarNavItem icon={Tag} label="Tags" />
        </ArdaSidebarNavGroup>
      </ArdaSidebarNav>

      <ArdaSidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
};

/** Full page layout — sidebar + content area with SidebarInset. Press Cmd+B to toggle. */
export const Composition: Story = {
  render: () => (
    <ArdaSidebar
      defaultOpen
      page={
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </header>
          <main className="p-8">
            <p className="text-muted-foreground mb-4">
              Press <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">⌘B</kbd> to
              toggle the sidebar. On mobile, it opens as a sheet drawer.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {['Items', 'Orders', 'Suppliers'].map((label) => (
                <div key={label} className="rounded-lg border p-6 bg-card text-card-foreground">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-1">{Math.floor(Math.random() * 500)}</p>
                </div>
              ))}
            </div>
          </main>
        </SidebarInset>
      }
    >
      <ArdaSidebarHeader teamName="Arda Cards" />

      <ArdaSidebarNav>
        <ArdaSidebarNavItem icon={LayoutDashboard} label="Dashboard" active />
        <ArdaSidebarNavItem icon={Package} label="Items" />
        <ArdaSidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} />
      </ArdaSidebarNav>

      <ArdaSidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
};
