import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Sidebar } from './sidebar';
import { SidebarHeader } from '../../molecules/sidebar/sidebar-header';

describe('Sidebar', () => {
  it('renders children inside the sidebar provider', () => {
    render(
      <Sidebar>
        <div data-testid="child">Hello</div>
      </Sidebar>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies className to the sidebar', () => {
    const { container } = render(
      <Sidebar className="test-sidebar">
        <div>Content</div>
      </Sidebar>,
    );
    const sidebar = container.querySelector('[data-slot="sidebar-container"]');
    expect(sidebar?.className).toContain('test-sidebar');
  });

  it('renders expanded by default', () => {
    const { container } = render(
      <Sidebar>
        <div>Content</div>
      </Sidebar>,
    );
    const wrapper = container.querySelector('[data-state]');
    expect(wrapper).toHaveAttribute('data-state', 'expanded');
  });

  it('renders collapsed when defaultOpen is false', () => {
    const { container } = render(
      <Sidebar defaultOpen={false}>
        <div>Content</div>
      </Sidebar>,
    );
    const wrapper = container.querySelector('[data-state]');
    expect(wrapper).toHaveAttribute('data-state', 'collapsed');
  });
});

describe('SidebarHeader', () => {
  it('renders team name alongside logo', () => {
    render(
      <Sidebar>
        <SidebarHeader teamName="Arda Cards" />
      </Sidebar>,
    );
    expect(screen.getByText('Arda Cards')).toBeInTheDocument();
    expect(screen.getByAltText('Arda')).toBeInTheDocument();
  });

  it('renders custom children instead of default header', () => {
    render(
      <Sidebar>
        <SidebarHeader>
          <span>Custom</span>
        </SidebarHeader>
      </Sidebar>,
    );
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});
