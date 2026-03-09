import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ArdaSidebarNav } from './sidebar-nav';

describe('ArdaSidebarNav', () => {
  it('renders a nav landmark with default aria-label', () => {
    render(
      <ArdaSidebarNav>
        <li>Item</li>
      </ArdaSidebarNav>,
    );
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
  });

  it('renders a list for children', () => {
    render(
      <ArdaSidebarNav>
        <li>Item</li>
      </ArdaSidebarNav>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('accepts a custom aria-label', () => {
    render(
      <ArdaSidebarNav aria-label="Secondary">
        <li>Item</li>
      </ArdaSidebarNav>,
    );
    expect(screen.getByRole('navigation', { name: /secondary/i })).toBeInTheDocument();
  });

  it('renders children inside the list', () => {
    render(
      <ArdaSidebarNav>
        <li data-testid="child">Hello</li>
      </ArdaSidebarNav>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies className to the nav element', () => {
    render(
      <ArdaSidebarNav className="test-class">
        <li>Item</li>
      </ArdaSidebarNav>,
    );
    expect(screen.getByRole('navigation')).toHaveClass('test-class');
  });
});
