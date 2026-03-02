import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { ArdaSidebar, type NavItem } from './sidebar';

const navItems: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/items', icon: Package, label: 'Items' },
  { href: '/orders', icon: ShoppingCart, label: 'Order Queue' },
];

const user = {
  name: 'Alex Rivera',
  email: 'alex@arda.cards',
};

describe('ArdaSidebar', () => {
  it('renders nav items when expanded', () => {
    render(<ArdaSidebar navItems={navItems} collapsed={false} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Order Queue')).toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    render(<ArdaSidebar navItems={navItems} collapsed={true} />);
    // Labels should not be visible (rendered as tooltip-style elements)
    expect(screen.queryByText('Dashboard')).toBeInTheDocument(); // still in DOM, just in tooltip
  });

  it('shows user info when expanded with user prop', () => {
    render(<ArdaSidebar navItems={navItems} collapsed={false} user={user} />);
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('alex@arda.cards')).toBeInTheDocument();
  });

  it('hides user details when collapsed', () => {
    render(<ArdaSidebar navItems={navItems} collapsed={true} user={user} />);
    // Name and email are conditionally rendered when collapsed
    expect(screen.queryByText('Alex Rivera')).not.toBeInTheDocument();
    expect(screen.queryByText('alex@arda.cards')).not.toBeInTheDocument();
  });

  it('highlights active nav item based on currentPath', () => {
    const { container } = render(
      <ArdaSidebar navItems={navItems} collapsed={false} currentPath="/items" />,
    );
    // The active indicator is an orange bar
    const activeIndicator = container.querySelector('.bg-sidebar-active-indicator');
    expect(activeIndicator).toBeInTheDocument();
  });

  it('calls onNavigate when a nav item is clicked', async () => {
    const userSetup = userEvent.setup();
    const handleNavigate = vi.fn();
    render(<ArdaSidebar navItems={navItems} collapsed={false} onNavigate={handleNavigate} />);

    await userSetup.click(screen.getByText('Items'));
    expect(handleNavigate).toHaveBeenCalledWith('/items');
  });

  it('calls onLogout when logout button is clicked', async () => {
    const userSetup = userEvent.setup();
    const handleLogout = vi.fn();
    render(
      <ArdaSidebar navItems={navItems} collapsed={false} user={user} onLogout={handleLogout} />,
    );

    await userSetup.click(screen.getByLabelText('Log out'));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('applies collapsed width class', () => {
    const { container } = render(<ArdaSidebar navItems={navItems} collapsed={true} />);
    const aside = container.querySelector('aside');
    expect(aside?.className).toContain('w-[56px]');
  });

  it('applies expanded width class', () => {
    const { container } = render(<ArdaSidebar navItems={navItems} collapsed={false} />);
    const aside = container.querySelector('aside');
    expect(aside?.className).toContain('w-[240px]');
  });
});
