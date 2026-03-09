import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Boxes } from 'lucide-react';

import { ArdaSidebarNavGroup } from './sidebar-nav-group';

describe('ArdaSidebarNavGroup', () => {
  it('renders the group label', () => {
    render(
      <ArdaSidebarNavGroup label="Inventory" icon={Boxes}>
        <li>Item</li>
      </ArdaSidebarNavGroup>,
    );
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('is collapsed by default (children hidden)', () => {
    render(
      <ArdaSidebarNavGroup label="Inventory">
        <li>Hidden child</li>
      </ArdaSidebarNavGroup>,
    );
    expect(screen.queryByText('Hidden child')).not.toBeInTheDocument();
  });

  it('expands when defaultExpanded is true', () => {
    render(
      <ArdaSidebarNavGroup label="Inventory" defaultExpanded>
        <li>Visible child</li>
      </ArdaSidebarNavGroup>,
    );
    expect(screen.getByText('Visible child')).toBeVisible();
  });

  it('toggles open/closed on click', async () => {
    const user = userEvent.setup();
    render(
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

  it('renders only children when collapsed (sidebar collapsed mode)', () => {
    render(
      <ArdaSidebarNavGroup label="Inventory" collapsed>
        <li>Direct child</li>
      </ArdaSidebarNavGroup>,
    );
    expect(screen.getByText('Direct child')).toBeVisible();
    expect(screen.queryByText('Inventory')).not.toBeInTheDocument();
  });

  it('applies className to the wrapper li', () => {
    const { container } = render(
      <ArdaSidebarNavGroup label="Inventory" className="test-group">
        <li>Item</li>
      </ArdaSidebarNavGroup>,
    );
    expect(container.querySelector('.test-group')).toBeInTheDocument();
  });
});
