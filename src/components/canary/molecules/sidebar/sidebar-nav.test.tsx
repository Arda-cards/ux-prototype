import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { SidebarNav } from './sidebar-nav';
import { Sidebar } from '../../organisms/sidebar/sidebar';

function renderInSidebar(ui: React.ReactElement) {
  return render(<Sidebar defaultOpen>{ui}</Sidebar>);
}

describe('SidebarNav', () => {
  it('renders children', () => {
    renderInSidebar(
      <SidebarNav>
        <li data-testid="child">Hello</li>
      </SidebarNav>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders a list (SidebarMenu) for children', () => {
    renderInSidebar(
      <SidebarNav>
        <li>Item</li>
      </SidebarNav>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders group label when provided', () => {
    renderInSidebar(
      <SidebarNav label="Navigation">
        <li>Item</li>
      </SidebarNav>,
    );
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});
