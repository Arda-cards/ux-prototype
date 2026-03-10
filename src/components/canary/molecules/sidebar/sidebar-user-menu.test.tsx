import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Settings, ShieldCheck, LogOut } from 'lucide-react';

import { ArdaSidebarUserMenu, type UserMenuAction } from './sidebar-user-menu';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';

const mockUser = {
  name: 'Callil Capuozzo',
  email: 'callil@arda.cards',
};

const mockActions: UserMenuAction[] = [
  { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: vi.fn() },
  { key: 'settings', label: 'Settings', icon: Settings, onClick: vi.fn() },
  { key: 'logout', label: 'Log out', icon: LogOut, onClick: vi.fn(), destructive: true },
];

function renderInSidebar(ui: React.ReactElement) {
  return render(<ArdaSidebar defaultOpen>{ui}</ArdaSidebar>);
}

/** Get the user menu trigger button (contains the user's name). */
function getUserMenuButton() {
  return screen.getByText('Callil Capuozzo').closest('button')!;
}

describe('ArdaSidebarUserMenu', () => {
  it('renders user name in trigger', () => {
    renderInSidebar(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    expect(screen.getByText('Callil Capuozzo')).toBeInTheDocument();
  });

  it('shows email in dropdown', async () => {
    const user = userEvent.setup();
    renderInSidebar(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    await user.click(getUserMenuButton());
    expect(screen.getByText('callil@arda.cards')).toBeInTheDocument();
  });

  it('renders initials as avatar fallback', () => {
    renderInSidebar(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    expect(screen.getByText('CC')).toBeInTheDocument();
  });

  it('opens dropdown on click and shows all actions', async () => {
    const user = userEvent.setup();
    renderInSidebar(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    await user.click(getUserMenuButton());
    expect(screen.getByRole('menuitem', { name: /admin/i })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeVisible();
  });

  it('calls action onClick when clicked', async () => {
    const user = userEvent.setup();
    const onAdmin = vi.fn();
    const actions: UserMenuAction[] = [
      { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: onAdmin },
    ];
    renderInSidebar(<ArdaSidebarUserMenu user={mockUser} actions={actions} />);
    await user.click(getUserMenuButton());
    await user.click(screen.getByRole('menuitem', { name: /admin/i }));
    expect(onAdmin).toHaveBeenCalledOnce();
  });

  it('renders actions in correct order: standard then destructive', async () => {
    const user = userEvent.setup();
    renderInSidebar(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    await user.click(getUserMenuButton());
    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveTextContent('Admin');
    expect(items[1]).toHaveTextContent('Settings');
    expect(items[2]).toHaveTextContent('Log out');
  });

  it('renders ChevronsUpDown affordance icon in trigger', () => {
    renderInSidebar(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    const button = getUserMenuButton();
    const svgs = button.querySelectorAll('svg');
    // Should have at least the ChevronsUpDown icon
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });
});
