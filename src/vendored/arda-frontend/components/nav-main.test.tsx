import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavMain } from './nav-main';
import { Home } from 'lucide-react';

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuButton: ({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) => (
    <button data-tooltip={tooltip}>{children}</button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuSub: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuSubButton: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button>{children}</button>,
  SidebarMenuSubItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}));

jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button>{children}</button>,
}));

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    isActive: true,
    items: [
      { title: 'Overview', url: '/dashboard/overview' },
      { title: 'Analytics', url: '/dashboard/analytics' },
    ],
  },
  {
    title: 'Settings',
    url: '/settings',
    items: [],
  },
];

describe('NavMain', () => {
  it('renders the Platform label', () => {
    render(<NavMain items={items} />);
    expect(screen.getByText('Platform')).toBeInTheDocument();
  });

  it('renders all top-level item titles', () => {
    render(<NavMain items={items} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders sub-items', () => {
    render(<NavMain items={items} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders item with icon', () => {
    render(<NavMain items={items} />);
    // Dashboard has an icon - just make sure it renders without error
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders item without icon (no icon prop)', () => {
    render(<NavMain items={[{ title: 'NoIcon', url: '/no-icon' }]} />);
    expect(screen.getByText('NoIcon')).toBeInTheDocument();
  });

  it('renders empty items list without error', () => {
    const { container } = render(<NavMain items={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('renders sub-item links with correct href', () => {
    render(<NavMain items={items} />);
    const link = screen.getByRole('link', { name: 'Overview' });
    expect(link).toHaveAttribute('href', '/dashboard/overview');
  });
});
