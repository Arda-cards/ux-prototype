import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ArdaSidebarNav } from './sidebar-nav';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';

function renderInSidebar(ui: React.ReactElement) {
  return render(<ArdaSidebar defaultOpen>{ui}</ArdaSidebar>);
}

describe('ArdaSidebarNav', () => {
  it('renders children', () => {
    renderInSidebar(
      <ArdaSidebarNav>
        <li data-testid="child">Hello</li>
      </ArdaSidebarNav>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders a list (SidebarMenu) for children', () => {
    renderInSidebar(
      <ArdaSidebarNav>
        <li>Item</li>
      </ArdaSidebarNav>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders group label when provided', () => {
    renderInSidebar(
      <ArdaSidebarNav label="Navigation">
        <li>Item</li>
      </ArdaSidebarNav>,
    );
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});
