import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ArdaSidebar } from './sidebar';
import { ArdaSidebarHeader } from '../../molecules/sidebar/sidebar-header';

describe('ArdaSidebar', () => {
  it('renders children inside the sidebar provider', () => {
    render(
      <ArdaSidebar>
        <div data-testid="child">Hello</div>
      </ArdaSidebar>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies className to the sidebar', () => {
    const { container } = render(
      <ArdaSidebar className="test-sidebar">
        <div>Content</div>
      </ArdaSidebar>,
    );
    const sidebar = container.querySelector('[data-slot="sidebar-container"]');
    expect(sidebar?.className).toContain('test-sidebar');
  });

  it('renders expanded by default', () => {
    const { container } = render(
      <ArdaSidebar>
        <div>Content</div>
      </ArdaSidebar>,
    );
    const wrapper = container.querySelector('[data-state]');
    expect(wrapper).toHaveAttribute('data-state', 'expanded');
  });

  it('renders collapsed when defaultOpen is false', () => {
    const { container } = render(
      <ArdaSidebar defaultOpen={false}>
        <div>Content</div>
      </ArdaSidebar>,
    );
    const wrapper = container.querySelector('[data-state]');
    expect(wrapper).toHaveAttribute('data-state', 'collapsed');
  });
});

describe('ArdaSidebarHeader', () => {
  it('renders team name alongside logo', () => {
    render(
      <ArdaSidebar>
        <ArdaSidebarHeader teamName="Arda Cards" />
      </ArdaSidebar>,
    );
    expect(screen.getByText('Arda Cards')).toBeInTheDocument();
    expect(screen.getByAltText('Arda')).toBeInTheDocument();
  });

  it('renders custom children instead of default header', () => {
    render(
      <ArdaSidebar>
        <ArdaSidebarHeader>
          <span>Custom</span>
        </ArdaSidebarHeader>
      </ArdaSidebar>,
    );
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});
