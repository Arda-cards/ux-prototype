import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { ArdaSidebarUserMenu } from './sidebar-user-menu';

const mockUser = {
  name: 'Callil Capuozzo',
  email: 'callil@arda.cards',
  avatar: '',
};

const meta: Meta<typeof ArdaSidebarUserMenu> = {
  title: 'Components/Canary/Molecules/Sidebar User Menu',
  component: ArdaSidebarUserMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'User profile menu with avatar, name, email, and dropdown actions. ' +
          'Built on shadcn Avatar and DropdownMenu. Shows avatar + name in expanded mode, avatar-only in collapsed mode.',
      },
    },
  },
  args: {
    onLogout: fn(),
    onSettings: fn(),
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

/** Default expanded view with name and email visible. */
export const Default: Story = {
  args: {
    user: mockUser,
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
  },
};

/** Without settings action. */
export const LogoutOnly: Story = {
  args: {
    user: mockUser,
    onSettings: undefined,
  },
};
