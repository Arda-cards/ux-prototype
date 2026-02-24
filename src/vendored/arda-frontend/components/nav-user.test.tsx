import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavUser } from './nav-user';

const mockUseSidebar = jest.fn();

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuButton: ({ children, size: _size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <button className={className}>{children}</button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  useSidebar: () => mockUseSidebar(),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div role="menuitem">{children}</div>,
  DropdownMenuLabel: ({ children, className: _className }: { children: React.ReactNode; className?: string }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button>{children}</button>,
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
  AvatarImage: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/images/avatar.png',
};

describe('NavUser', () => {
  beforeEach(() => {
    mockUseSidebar.mockReturnValue({ isMobile: false });
    delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
  });

  it('renders user name', () => {
    render(<NavUser user={user} />);
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
  });

  it('renders user email', () => {
    render(<NavUser user={user} />);
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
  });

  it('renders avatar image', () => {
    render(<NavUser user={user} />);
    const img = screen.getAllByRole('img')[0];
    expect(img).toHaveAttribute('src', '/images/avatar.png');
  });

  it('renders dropdown menu items', () => {
    render(<NavUser user={user} />);
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('renders Notifications when not in PRODUCTION', () => {
    render(<NavUser user={user} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('hides Notifications in PRODUCTION env', () => {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
    render(<NavUser user={user} />);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('renders with isMobile=true', () => {
    mockUseSidebar.mockReturnValue({ isMobile: true });
    render(<NavUser user={user} />);
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
  });
});
