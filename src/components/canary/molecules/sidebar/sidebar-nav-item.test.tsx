import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Package, ShoppingCart } from 'lucide-react';

import { SidebarNavItem } from './sidebar-nav-item';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';

/** Wrap in ArdaSidebar to provide SidebarProvider context. */
function renderInSidebar(ui: React.ReactElement) {
  return render(<ArdaSidebar defaultOpen>{ui}</ArdaSidebar>);
}

describe('SidebarNavItem', () => {
  it('renders a button with label', () => {
    renderInSidebar(<SidebarNavItem icon={Package} label="Items" />);
    const button = screen.getByRole('button', { name: /items/i });
    expect(button).toBeInTheDocument();
  });

  it('sets data-active when active', () => {
    renderInSidebar(<SidebarNavItem icon={Package} label="Items" active />);
    const button = screen.getByRole('button', { name: /items/i });
    expect(button).toHaveAttribute('data-active', 'true');
  });

  it('does not set data-active when inactive', () => {
    renderInSidebar(<SidebarNavItem icon={Package} label="Items" />);
    const button = screen.getByRole('button', { name: /items/i });
    expect(button).toHaveAttribute('data-active', 'false');
  });

  it('renders badge when provided', () => {
    renderInSidebar(<SidebarNavItem icon={ShoppingCart} label="Orders" badge={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders string badge', () => {
    renderInSidebar(<SidebarNavItem icon={ShoppingCart} label="Orders" badge="New" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders dot badge when badge is true', () => {
    renderInSidebar(<SidebarNavItem icon={Package} label="Suppliers" badge={true} />);
    const dot = screen.getByLabelText('New activity');
    expect(dot).toBeInTheDocument();
    // Should not render a count badge
    expect(screen.queryByText('true')).not.toBeInTheDocument();
  });

  it('applies className prop', () => {
    renderInSidebar(<SidebarNavItem icon={Package} label="Items" className="my-custom" />);
    const button = screen.getByRole('button', { name: /items/i });
    expect(button.className).toContain('my-custom');
  });
});
