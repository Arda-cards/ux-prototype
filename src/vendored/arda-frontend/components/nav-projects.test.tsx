import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavProjects } from './nav-projects';
import { Folder } from 'lucide-react';

const mockUseSidebar = jest.fn();

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuButton: ({ children, className, asChild }: { children: React.ReactNode; className?: string; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button className={className}>{children}</button>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuAction: ({ children, showOnHover: _showOnHover, asChild }: { children: React.ReactNode; showOnHover?: boolean; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button>{children}</button>,
  useSidebar: () => mockUseSidebar(),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div role="menuitem">{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button>{children}</button>,
}));

const projects = [
  { name: 'Alpha', url: '/projects/alpha', icon: Folder },
  { name: 'Beta', url: '/projects/beta', icon: Folder },
];

describe('NavProjects', () => {
  beforeEach(() => {
    mockUseSidebar.mockReturnValue({ isMobile: false });
  });

  it('renders Projects label', () => {
    render(<NavProjects projects={projects} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders all project names', () => {
    render(<NavProjects projects={projects} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders More button at the end', () => {
    render(<NavProjects projects={projects} />);
    // Multiple "More" elements exist (sr-only in action buttons + the visible More button)
    expect(screen.getAllByText('More').length).toBeGreaterThan(0);
  });

  it('renders project links with correct href', () => {
    render(<NavProjects projects={projects} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/projects/alpha');
    expect(links[1]).toHaveAttribute('href', '/projects/beta');
  });

  it('renders dropdown menu items: View Project, Share Project, Delete Project', () => {
    render(<NavProjects projects={projects} />);
    expect(screen.getAllByText('View Project').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Share Project').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Delete Project').length).toBeGreaterThan(0);
  });

  it('renders with isMobile=true (changes dropdown side)', () => {
    mockUseSidebar.mockReturnValue({ isMobile: true });
    render(<NavProjects projects={projects} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('renders with empty projects list', () => {
    render(<NavProjects projects={[]} />);
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
