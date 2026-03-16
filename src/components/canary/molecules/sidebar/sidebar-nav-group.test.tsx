import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Boxes } from 'lucide-react';

import { SidebarNavGroup } from './sidebar-nav-group';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';

function renderInSidebar(ui: React.ReactElement) {
  return render(<ArdaSidebar defaultOpen>{ui}</ArdaSidebar>);
}

/** Mock component with active prop for auto-expand testing. */
function MockActiveChild({ active: _active = true }: { active?: boolean }) {
  return <li data-testid="active-child">Active item</li>;
}

describe('SidebarNavGroup', () => {
  it('renders the group label', () => {
    renderInSidebar(
      <SidebarNavGroup label="Inventory" icon={Boxes}>
        <li>Item</li>
      </SidebarNavGroup>,
    );
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('is collapsed by default (children hidden)', () => {
    renderInSidebar(
      <SidebarNavGroup label="Inventory">
        <li>Hidden child</li>
      </SidebarNavGroup>,
    );
    expect(screen.queryByText('Hidden child')).not.toBeInTheDocument();
  });

  it('expands when defaultExpanded is true', () => {
    renderInSidebar(
      <SidebarNavGroup label="Inventory" defaultExpanded>
        <li>Visible child</li>
      </SidebarNavGroup>,
    );
    expect(screen.getByText('Visible child')).toBeVisible();
  });

  it('toggles open/closed on click', async () => {
    const user = userEvent.setup();
    renderInSidebar(
      <SidebarNavGroup label="Inventory">
        <li>Child</li>
      </SidebarNavGroup>,
    );
    const trigger = screen.getByText('Inventory');
    await user.click(trigger);
    expect(screen.getByText('Child')).toBeVisible();
    await user.click(trigger);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });

  it('auto-expands when a child has active=true', () => {
    renderInSidebar(
      <SidebarNavGroup label="Analytics">
        <li data-testid="child">Sales</li>
        <MockActiveChild active />
      </SidebarNavGroup>,
    );
    expect(screen.getByTestId('active-child')).toBeVisible();
  });

  it('applies className', () => {
    const { container } = renderInSidebar(
      <SidebarNavGroup label="Inventory" className="test-group">
        <li>Item</li>
      </SidebarNavGroup>,
    );
    expect(container.querySelector('.test-group')).toBeInTheDocument();
  });
});
