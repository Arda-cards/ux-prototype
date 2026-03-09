import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { ArdaSidebarUserMenu } from './sidebar-user-menu';

const mockUser = {
  name: 'Callil Capuozzo',
  email: 'callil@arda.cards',
};

describe('ArdaSidebarUserMenu', () => {
  it('renders user name and email in expanded mode', () => {
    render(<ArdaSidebarUserMenu user={mockUser} />);
    expect(screen.getByText('Callil Capuozzo')).toBeVisible();
    expect(screen.getByText('callil@arda.cards')).toBeVisible();
  });

  it('renders initials as avatar fallback', () => {
    render(<ArdaSidebarUserMenu user={mockUser} />);
    expect(screen.getByText('CC')).toBeInTheDocument();
  });

  it('hides name/email visually in collapsed mode (sr-only)', () => {
    render(<ArdaSidebarUserMenu user={mockUser} collapsed />);
    const nameEl = screen.getByText('Callil Capuozzo');
    expect(nameEl.closest('div')).toHaveClass('sr-only');
  });

  it('opens dropdown on click and shows actions', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    const onSettings = vi.fn();
    render(<ArdaSidebarUserMenu user={mockUser} onLogout={onLogout} onSettings={onSettings} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Settings')).toBeVisible();
    expect(screen.getByText('Log out')).toBeVisible();
  });

  it('calls onLogout when logout is clicked', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(<ArdaSidebarUserMenu user={mockUser} onLogout={onLogout} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Log out'));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('calls onSettings when settings is clicked', async () => {
    const user = userEvent.setup();
    const onSettings = vi.fn();
    render(<ArdaSidebarUserMenu user={mockUser} onSettings={onSettings} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Settings'));
    expect(onSettings).toHaveBeenCalledOnce();
  });

  it('hides settings option when onSettings is not provided', async () => {
    const user = userEvent.setup();
    render(<ArdaSidebarUserMenu user={mockUser} onLogout={vi.fn()} />);
    await user.click(screen.getByRole('button'));
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });
});
