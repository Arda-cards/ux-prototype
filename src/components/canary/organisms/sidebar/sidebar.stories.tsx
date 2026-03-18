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
import { ArdaSidebarHeader } from '../../molecules/sidebar/sidebar-header';
import { SidebarNav } from '../../molecules/sidebar/sidebar-nav';
import { SidebarNavGroup } from '../../molecules/sidebar/sidebar-nav-group';
import { SidebarUserMenu, type UserMenuAction } from '../../molecules/sidebar/sidebar-user-menu';
import { SidebarNavItem } from '../../molecules/sidebar/sidebar-nav-item';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const mockUser = {
  name: 'Uriel Eisen',
  email: 'uriel@arda.cards',
  role: 'Account Admin',
  avatar: '/canary/images/avatar-placeholder.jpg',
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
          'Arda sidebar organism — dark by default, built on shadcn/ui Sidebar primitives. ' +
          'Compound component: compose with SidebarHeader, SidebarNav, ' +
          'SidebarNavItem, SidebarNavGroup, and SidebarUserMenu. ' +
          'Provides mobile Sheet drawer (< 768px), Cmd+B toggle, cookie persistence, ' +
          'and icon-only collapsed mode with tooltips.',
      },
    },
  },
} satisfies Meta<typeof ArdaSidebar>;

export default meta;
type Story = StoryObj<typeof ArdaSidebar>;

/** Default sidebar. Toggle `open` and `dark` in the controls panel. */
export const Default: Story = {
  args: {
    open: true,
    dark: true,
  },
  argTypes: {
    open: { control: 'boolean' },
    dark: { control: 'boolean' },
  },
  render: (args) => (
    <ArdaSidebar {...args}>
      <ArdaSidebarHeader teamName="Arda Cards" />

      <SidebarNav>
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" active />
        <SidebarNavItem icon={Package} label="Items" />
        <SidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} />
        <SidebarNavItem icon={Building2} label="Suppliers" />

        <SidebarNavGroup label="Analytics" icon={BarChart3} defaultExpanded>
          <SidebarNavItem icon={BarChart3} label="Sales" />
          <SidebarNavItem icon={Boxes} label="Inventory" />
        </SidebarNavGroup>

        <SidebarNavItem icon={Settings} label="Settings" />
      </SidebarNav>

      <SidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Arda Cards')).toBeInTheDocument();
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();
  },
};

/** Nav items with notification badges — count, dot, and active combinations. */
export const WithBadges: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarHeader teamName="Arda Cards" />

      <SidebarNav>
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <SidebarNavItem icon={Package} label="Items" badge={42} />
        <SidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} active />
        <SidebarNavItem icon={Building2} label="Suppliers" badge={true} />
        <SidebarNavItem icon={Settings} label="Settings" badge={true} active />
      </SidebarNav>

      <SidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
};

/** Nested nav groups with auto-expand on active child. */
export const WithGroups: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarHeader teamName="Arda Cards" />

      <SidebarNav>
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <SidebarNavItem icon={Package} label="Items" />

        <SidebarNavGroup label="Analytics" icon={BarChart3}>
          <SidebarNavItem icon={BarChart3} label="Sales" />
          <SidebarNavItem icon={Boxes} label="Inventory" active />
        </SidebarNavGroup>

        <SidebarNavGroup label="People" icon={Users}>
          <SidebarNavItem icon={Users} label="Team" />
          <SidebarNavItem icon={ShieldCheck} label="Roles" />
        </SidebarNavGroup>

        <SidebarNavGroup label="Content" icon={FileText}>
          <SidebarNavItem icon={FileText} label="Pages" />
          <SidebarNavItem icon={Tag} label="Tags" />
        </SidebarNavGroup>
      </SidebarNav>

      <SidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
};

/** Full page layout — sidebar + content area with SidebarInset. Press Cmd+B to toggle. */
export const Composition: Story = {
  render: () => (
    <ArdaSidebar
      defaultOpen
      content={
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </header>
          <main className="p-8">
            <p className="text-muted-foreground mb-4">
              Press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">⌘B</kbd> to
              toggle the sidebar. On mobile, it opens as a sheet drawer.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Items', value: 142 },
                { label: 'Orders', value: 38 },
                { label: 'Suppliers', value: 12 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border bg-card p-6 text-card-foreground">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </main>
        </SidebarInset>
      }
    >
      <ArdaSidebarHeader teamName="Arda Cards" />

      <SidebarNav>
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" active />
        <SidebarNavItem icon={Package} label="Items" />
        <SidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} />
      </SidebarNav>

      <SidebarUserMenu user={mockUser} actions={mockActions} />
    </ArdaSidebar>
  ),
};
