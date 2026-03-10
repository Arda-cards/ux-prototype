import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Boxes } from 'lucide-react';

import { ArdaSidebarNavGroup } from './sidebar-nav-group';
import { ArdaSidebar } from './sidebar';

function renderInSidebar(ui: React.ReactElement) {
  return render(<ArdaSidebar defaultOpen>{ui}</ArdaSidebar>);
}

/** Mock component with active prop for auto-expand testing. */
function MockActiveChild({ active: _active = true }: { active?: boolean }) {
  return <li data-testid="active-child">Active item</li>;
}

describe('ArdaSidebarNavGroup', () => {
  it('renders the group label', () => {
    renderInSidebar(
      <ArdaSidebarNavGroup label="Inventory" icon={Boxes}>
        <li>Item</li>
      </ArdaSidebarNavGroup>,
    );
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('is collapsed by default (children hidden)', () => {
    renderInSidebar(
      <ArdaSidebarNavGroup label="Inventory">
        <li>Hidden child</li>
      </ArdaSidebarNavGroup>,
    );
    expect(screen.queryByText('Hidden child')).not.toBeInTheDocument();
  });

  it('expands when defaultExpanded is true', () => {
    renderInSidebar(
      <ArdaSidebarNavGroup label="Inventory" defaultExpanded>
        <li>Visible child</li>
      </ArdaSidebarNavGroup>,
    );
    expect(screen.getByText('Visible child')).toBeVisible();
  });

  it('toggles open/closed on click', async () => {
    const user = userEvent.setup();
    renderInSidebar(
      <ArdaSidebarNavGroup label="Inventory">
        <li>Child</li>
      </ArdaSidebarNavGroup>,
    );
    const trigger = screen.getByText('Inventory');
    await user.click(trigger);
    expect(screen.getByText('Child')).toBeVisible();
    await user.click(trigger);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });

  it('auto-expands when a child has active=true', () => {
    renderInSidebar(
      <ArdaSidebarNavGroup label="Analytics">
        <li data-testid="child">Sales</li>
        <MockActiveChild active />
      </ArdaSidebarNavGroup>,
    );
    expect(screen.getByTestId('active-child')).toBeVisible();
  });

  it('applies className', () => {
    const { container } = renderInSidebar(
      <ArdaSidebarNavGroup label="Inventory" className="test-group">
        <li>Item</li>
      </ArdaSidebarNavGroup>,
    );
    expect(container.querySelector('.test-group')).toBeInTheDocument();
  });
});
