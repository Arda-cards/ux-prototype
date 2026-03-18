import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ArdaSidebarHeader, type TeamOption } from './sidebar-header';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';

/** Wrap in ArdaSidebar to provide SidebarProvider context. */
function renderInSidebar(ui: React.ReactElement) {
  return render(<ArdaSidebar defaultOpen>{ui}</ArdaSidebar>);
}

describe('ArdaSidebarHeader', () => {
  it('renders team name', () => {
    renderInSidebar(<ArdaSidebarHeader teamName="Arda Cards" />);
    expect(screen.getByText('Arda Cards')).toBeInTheDocument();
  });

  it('renders default "Arda" when no teamName provided', () => {
    renderInSidebar(<ArdaSidebarHeader />);
    expect(screen.getByText('Arda')).toBeInTheDocument();
  });

  it('renders custom children', () => {
    renderInSidebar(
      <ArdaSidebarHeader>
        <span>Custom Content</span>
      </ArdaSidebarHeader>,
    );
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('renders team switcher dropdown when teams provided', () => {
    const teams: TeamOption[] = [
      { key: 'arda', name: 'Arda Cards', onSelect: vi.fn() },
      { key: 'acme', name: 'Acme Corp', onSelect: vi.fn() },
    ];
    renderInSidebar(<ArdaSidebarHeader teamName="Arda Cards" teams={teams} />);
    // When teams are provided, the header renders a dropdown trigger button
    const button = screen.getByRole('button', { name: /arda cards/i });
    expect(button).toBeInTheDocument();
  });
});
