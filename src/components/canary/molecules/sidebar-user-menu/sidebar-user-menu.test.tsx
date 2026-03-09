import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Settings, ShieldCheck, LogOut } from 'lucide-react';

import { ArdaSidebarUserMenu, type UserMenuAction } from './sidebar-user-menu';

const mockUser = {
  name: 'Callil Capuozzo',
  email: 'callil@arda.cards',
};

const mockActions: UserMenuAction[] = [
  { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: vi.fn() },
  { key: 'settings', label: 'Settings', icon: Settings, onClick: vi.fn() },
  { key: 'logout', label: 'Log out', icon: LogOut, onClick: vi.fn(), destructive: true },
];

describe('ArdaSidebarUserMenu', () => {
  it('renders user name and email in expanded mode', () => {
    render(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    expect(screen.getByText('Callil Capuozzo')).toBeVisible();
    expect(screen.getByText('callil@arda.cards')).toBeVisible();
  });

  it('renders initials as avatar fallback', () => {
    render(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    expect(screen.getByText('CC')).toBeInTheDocument();
  });

  it('hides name/email visually in collapsed mode (sr-only)', () => {
    render(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} collapsed />);
    const nameEl = screen.getByText('Callil Capuozzo');
    expect(nameEl.closest('div')).toHaveClass('sr-only');
  });

  it('opens dropdown on click and shows all actions', async () => {
    const user = userEvent.setup();
    render(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Admin')).toBeVisible();
    expect(screen.getByText('Settings')).toBeVisible();
    expect(screen.getByText('Log out')).toBeVisible();
  });

  it('calls action onClick when clicked', async () => {
    const user = userEvent.setup();
    const onAdmin = vi.fn();
    const actions: UserMenuAction[] = [
      { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: onAdmin },
    ];
    render(<ArdaSidebarUserMenu user={mockUser} actions={actions} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Admin'));
    expect(onAdmin).toHaveBeenCalledOnce();
  });

  it('calls destructive action onClick when clicked', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    const actions: UserMenuAction[] = [
      { key: 'logout', label: 'Log out', icon: LogOut, onClick: onLogout, destructive: true },
    ];
    render(<ArdaSidebarUserMenu user={mockUser} actions={actions} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Log out'));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('renders both standard and destructive actions in correct order', async () => {
    const user = userEvent.setup();
    render(<ArdaSidebarUserMenu user={mockUser} actions={mockActions} />);
    await user.click(screen.getByRole('button'));
    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveTextContent('Admin');
    expect(items[1]).toHaveTextContent('Settings');
    expect(items[2]).toHaveTextContent('Log out');
  });

  it('renders empty dropdown when no actions provided', async () => {
    const user = userEvent.setup();
    render(<ArdaSidebarUserMenu user={mockUser} actions={[]} />);
    await user.click(screen.getByRole('button'));
    // Dropdown opens but has no menu items
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});
