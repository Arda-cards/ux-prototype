import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Settings, ShieldCheck, LogOut } from 'lucide-react';

import { SidebarUserMenu, type UserMenuAction } from './sidebar-user-menu';
import { withSidebarContext } from './sidebar-story-decorator';
import { SidebarProvider } from '@/components/canary/primitives/sidebar';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';

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

const meta = {
  title: 'Components/Canary/Molecules/Sidebar/UserMenu',
  component: SidebarUserMenu,
  decorators: [withSidebarContext],
  parameters: {
    layout: 'centered',
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
} satisfies Meta<typeof SidebarUserMenu>;

export default meta;
type Story = StoryObj<typeof SidebarUserMenu>;
export const Default: Story = {
  render: () => <SidebarUserMenu user={mockUser} actions={defaultActions} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Callil Capuozzo')).toBeVisible();
  },
};

/** With avatar image. */
export const WithAvatar: Story = {
  render: () => (
    <SidebarUserMenu
      user={{
        name: 'Uriel Eisen',
        email: 'uriel@arda.cards',
        avatar: '/canary/images/avatar-placeholder.jpg',
      }}
      actions={defaultActions}
    />
  ),
};

/**
 * Collapsed sidebar — avatar only, no text.
 * Uses a story-level decorator override to pass `defaultOpen={false}` to SidebarProvider.
 */
export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <TooltipProvider>
        <SidebarProvider defaultOpen={false}>
          <div
            className="dark flex w-64 flex-col bg-sidebar text-sidebar-foreground"
            data-slot="sidebar"
          >
            <Story />
          </div>
        </SidebarProvider>
      </TooltipProvider>
    ),
  ],
  render: () => <SidebarUserMenu user={mockUser} actions={defaultActions} />,
};

/** With user role displayed below name. */
export const WithRole: Story = {
  render: () => (
    <SidebarUserMenu
      user={{
        name: 'Callil Capuozzo',
        email: 'callil@arda.cards',
        avatar: '',
        role: 'Account Admin',
      }}
      actions={defaultActions}
    />
  ),
};

/** Flyout open — shows the dropdown menu with all actions. */
export const FlyoutOpen: Story = {
  render: () => (
    <SidebarUserMenu
      user={{
        name: 'Callil Capuozzo',
        email: 'callil@arda.cards',
        avatar: '',
        role: 'Account Admin',
      }}
      actions={defaultActions}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /callil/i });
    await userEvent.click(trigger);
  },
};

/** Minimal — logout only. */
export const LogoutOnly: Story = {
  render: () => (
    <SidebarUserMenu
      user={mockUser}
      actions={[
        { key: 'logout', label: 'Log out', icon: LogOut, onClick: fn(), destructive: true },
      ]}
    />
  ),
};

/**
 * Interactive Controls playground — `user` and `actions` are complex objects.
 * This story pre-populates a typical configuration with all standard actions.
 */
export const Playground: Story = {
  render: () => <SidebarUserMenu user={mockUser} actions={defaultActions} />,
};

/** Default expanded view with admin, settings, and logout. */
