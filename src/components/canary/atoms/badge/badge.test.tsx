import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ArdaBadge } from './badge';

describe('ArdaBadge', () => {
  it('renders children', () => {
    render(<ArdaBadge>3</ArdaBadge>);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders string content', () => {
    render(<ArdaBadge>New</ArdaBadge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<ArdaBadge>5</ArdaBadge>);
    expect(screen.getByText('5')).toHaveAttribute('data-variant', 'default');
  });

  it('renders secondary variant', () => {
    render(<ArdaBadge variant="secondary">12</ArdaBadge>);
    expect(screen.getByText('12')).toHaveAttribute('data-variant', 'secondary');
  });

  it('renders outline variant', () => {
    render(<ArdaBadge variant="outline">7</ArdaBadge>);
    expect(screen.getByText('7')).toHaveAttribute('data-variant', 'outline');
  });

  it('applies custom className', () => {
    render(<ArdaBadge className="custom">5</ArdaBadge>);
    expect(screen.getByText('5')).toHaveClass('custom');
  });
});
