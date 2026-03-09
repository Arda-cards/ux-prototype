import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ArdaSidebar } from './sidebar';
import { ArdaSidebarHeader } from './sidebar-header';

describe('ArdaSidebar', () => {
  it('renders as a complementary landmark (aside)', () => {
    render(
      <ArdaSidebar>
        <div>Content</div>
      </ArdaSidebar>,
    );
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('applies expanded width by default', () => {
    render(
      <ArdaSidebar>
        <div>Content</div>
      </ArdaSidebar>,
    );
    const aside = screen.getByRole('complementary');
    expect(aside.className).toContain('w-[var(--sidebar-width-expanded)]');
  });

  it('applies collapsed width when collapsed', () => {
    render(
      <ArdaSidebar collapsed>
        <div>Content</div>
      </ArdaSidebar>,
    );
    const aside = screen.getByRole('complementary');
    expect(aside.className).toContain('w-[var(--sidebar-width-collapsed)]');
  });

  it('renders children', () => {
    render(
      <ArdaSidebar>
        <div data-testid="child">Hello</div>
      </ArdaSidebar>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies className to the aside element', () => {
    render(
      <ArdaSidebar className="test-sidebar">
        <div>Content</div>
      </ArdaSidebar>,
    );
    expect(screen.getByRole('complementary')).toHaveClass('test-sidebar');
  });

  it('sets data-collapsed attribute', () => {
    const { rerender } = render(
      <ArdaSidebar>
        <div>Content</div>
      </ArdaSidebar>,
    );
    const aside = screen.getByRole('complementary');
    expect(aside).toHaveAttribute('data-collapsed', 'false');

    rerender(
      <ArdaSidebar collapsed>
        <div>Content</div>
      </ArdaSidebar>,
    );
    expect(aside).toHaveAttribute('data-collapsed', 'true');
  });

  it('has contain layout style for paint isolation', () => {
    render(
      <ArdaSidebar>
        <div>Content</div>
      </ArdaSidebar>,
    );
    const aside = screen.getByRole('complementary');
    expect(aside.className).toContain('[contain:layout_style]');
  });

  it('has motion-reduce class for prefers-reduced-motion', () => {
    render(
      <ArdaSidebar>
        <div>Content</div>
      </ArdaSidebar>,
    );
    const aside = screen.getByRole('complementary');
    expect(aside.className).toContain('motion-reduce:transition-none');
  });

  it('includes the background gradient element', () => {
    render(
      <ArdaSidebar>
        <div>Content</div>
      </ArdaSidebar>,
    );
    const aside = screen.getByRole('complementary');
    const gradient = aside.querySelector('.pointer-events-none');
    expect(gradient).toBeInTheDocument();
  });
});

describe('ArdaSidebarHeader', () => {
  it('renders children in a bordered header region', () => {
    render(
      <ArdaSidebarHeader>
        <span>Logo</span>
      </ArdaSidebarHeader>,
    );
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <ArdaSidebarHeader className="test-header">
        <span>Logo</span>
      </ArdaSidebarHeader>,
    );
    expect(container.firstChild).toHaveClass('test-header');
  });
});
