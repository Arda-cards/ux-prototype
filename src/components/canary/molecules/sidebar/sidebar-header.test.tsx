import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { SidebarHeader, type TeamOption } from './sidebar-header';
import { Sidebar } from '../../organisms/sidebar/sidebar';

/** Wrap in Sidebar to provide SidebarProvider context. */
function renderInSidebar(ui: React.ReactElement) {
  return render(<Sidebar defaultOpen>{ui}</Sidebar>);
}

describe('SidebarHeader', () => {
  it('renders team name', () => {
    renderInSidebar(<SidebarHeader teamName="Arda Cards" />);
    expect(screen.getByText('Arda Cards')).toBeInTheDocument();
  });

  it('renders default "Arda" when no teamName provided', () => {
    renderInSidebar(<SidebarHeader />);
    expect(screen.getByText('Arda')).toBeInTheDocument();
  });

  it('renders custom children', () => {
    renderInSidebar(
      <SidebarHeader>
        <span>Custom Content</span>
      </SidebarHeader>,
    );
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('renders team switcher dropdown when teams provided', () => {
    const teams: TeamOption[] = [
      { key: 'arda', name: 'Arda Cards', onSelect: vi.fn() },
      { key: 'acme', name: 'Acme Corp', onSelect: vi.fn() },
    ];
    renderInSidebar(<SidebarHeader teamName="Arda Cards" teams={teams} />);
    // When teams are provided, the header renders a dropdown trigger button
    const button = screen.getByRole('button', { name: /arda cards/i });
    expect(button).toBeInTheDocument();
  });
});
