import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamSwitcher } from './team-switcher';
import { Building2, Users } from 'lucide-react';

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
  DropdownMenuItem: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <div role="menuitem" onClick={onClick} className={className}>{children}</div>
  ),
  DropdownMenuLabel: ({ children, className: _className }: { children: React.ReactNode; className?: string }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button>{children}</button>,
}));

const teams = [
  { name: 'Acme Corp', logo: Building2, plan: 'Enterprise' },
  { name: 'Startup Inc', logo: Users, plan: 'Starter' },
];

describe('TeamSwitcher', () => {
  beforeEach(() => {
    mockUseSidebar.mockReturnValue({ isMobile: false });
  });

  it('renders the first team name as active team', () => {
    render(<TeamSwitcher teams={teams} />);
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
  });

  it('renders active team plan', () => {
    render(<TeamSwitcher teams={teams} />);
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('renders all teams in dropdown', () => {
    render(<TeamSwitcher teams={teams} />);
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
    expect(screen.getByText('Startup Inc')).toBeInTheDocument();
  });

  it('renders Teams label', () => {
    render(<TeamSwitcher teams={teams} />);
    expect(screen.getByText('Teams')).toBeInTheDocument();
  });

  it('renders Add team option', () => {
    render(<TeamSwitcher teams={teams} />);
    expect(screen.getByText('Add team')).toBeInTheDocument();
  });

  it('renders keyboard shortcuts for each team', () => {
    render(<TeamSwitcher teams={teams} />);
    expect(screen.getByText('⌘1')).toBeInTheDocument();
    expect(screen.getByText('⌘2')).toBeInTheDocument();
  });

  it('returns null when teams array is empty', () => {
    const { container } = render(<TeamSwitcher teams={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('switches active team when dropdown item clicked', () => {
    render(<TeamSwitcher teams={teams} />);
    const startupItem = screen.getByText('Startup Inc');
    fireEvent.click(startupItem);
    // After click, Startup Inc should be shown as active team name in the button
    expect(screen.getAllByText('Startup Inc').length).toBeGreaterThan(1);
  });

  it('renders with isMobile=true', () => {
    mockUseSidebar.mockReturnValue({ isMobile: true });
    render(<TeamSwitcher teams={teams} />);
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
  });
});
