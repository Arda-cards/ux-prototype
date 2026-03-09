import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { Settings, ShieldCheck, LogOut } from 'lucide-react';

import { ArdaSidebarUserMenu, type UserMenuAction } from './sidebar-user-menu';

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
  title: 'Components/Canary/Molecules/Sidebar User Menu',
  component: ArdaSidebarUserMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'User profile menu with avatar, name, email, and configurable dropdown actions. ' +
          'Built on shadcn Avatar and DropdownMenu. Actions are data-driven — pass an array ' +
          'of {key, label, icon, onClick, destructive?} objects. Destructive actions render ' +
          'after a separator in red.',
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
type Story = StoryObj<typeof ArdaSidebarUserMenu>;

/** Default expanded view with admin, settings, and logout. */
export const Default: Story = {
  args: {
    user: mockUser,
    actions: defaultActions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Callil Capuozzo')).toBeVisible();
    await expect(canvas.getByText('callil@arda.cards')).toBeVisible();
    await expect(canvas.getByText('CC')).toBeVisible();
  },
};

/** Collapsed mode — avatar only, name in sr-only. */
export const Collapsed: Story = {
  args: {
    user: mockUser,
    actions: defaultActions,
    collapsed: true,
  },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg w-[80px]">
        <Story />
      </div>
    ),
  ],
};

/** With avatar image. */
export const WithAvatar: Story = {
  args: {
    user: {
      name: 'Miguel Torres',
      email: 'miguel@arda.cards',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MT',
    },
    actions: defaultActions,
  },
};

/** Minimal — logout only. */
export const LogoutOnly: Story = {
  args: {
    user: mockUser,
    actions: [{ key: 'logout', label: 'Log out', icon: LogOut, onClick: fn(), destructive: true }],
  },
};
