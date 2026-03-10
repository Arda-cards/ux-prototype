import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { Settings, ShieldCheck, LogOut } from 'lucide-react';

import { ArdaSidebarUserMenu, type UserMenuAction } from './sidebar-user-menu';
import { ArdaSidebar } from './sidebar';

const mockUser = {
  name: 'Callil Capuozzo',
  email: 'callil@arda.cards',
  avatar: '',
};

const defaultActions: UserMenuAction[] = [
  { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: fn() },
  { key: 'settings', label: 'Settings', icon: Settings, onClick: fn() },
  { key: 'logout', label: 'Log out', icon: LogOut, onClick: fn(), destructive: true },
];

const meta: Meta<typeof ArdaSidebarUserMenu> = {
  title: 'Components/Canary/Organisms/Sidebar/User Menu',
  component: ArdaSidebarUserMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'User profile menu with avatar, name, email, and configurable dropdown actions. ' +
          'Built on shadcn SidebarFooter + DropdownMenu. Actions are data-driven — pass an array ' +
          'of {key, label, icon, onClick, destructive?} objects. Destructive actions render ' +
          'after a separator in red. ChevronsUpDown affordance icon indicates clickability.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaSidebarUserMenu>;

/** Default expanded view with admin, settings, and logout. */
export const Default: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarUserMenu user={mockUser} actions={defaultActions} />
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Callil Capuozzo')).toBeVisible();
    await expect(canvas.getByText('callil@arda.cards')).toBeVisible();
    await expect(canvas.getByText('CC')).toBeVisible();
  },
};

/** With avatar image. */
export const WithAvatar: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarUserMenu
        user={{
          name: 'Miguel Torres',
          email: 'miguel@arda.cards',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MT',
        }}
        actions={defaultActions}
      />
    </ArdaSidebar>
  ),
};

/** Collapsed sidebar — avatar only, no text. */
export const Collapsed: Story = {
  render: () => (
    <ArdaSidebar defaultOpen={false}>
      <ArdaSidebarUserMenu user={mockUser} actions={defaultActions} />
    </ArdaSidebar>
  ),
};

/** With user role displayed below name. */
export const WithRole: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarUserMenu
        user={{
          name: 'Callil Capuozzo',
          email: 'callil@arda.cards',
          avatar: '',
          role: 'Account Admin',
        }}
        actions={defaultActions}
      />
    </ArdaSidebar>
  ),
};

/** Minimal — logout only. */
export const LogoutOnly: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarUserMenu
        user={mockUser}
        actions={[
          { key: 'logout', label: 'Log out', icon: LogOut, onClick: fn(), destructive: true },
        ]}
      />
    </ArdaSidebar>
  ),
};
