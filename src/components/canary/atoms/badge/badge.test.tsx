import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Badge } from './badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>3</Badge>);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders string content', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Badge>5</Badge>);
    expect(screen.getByText('5')).toHaveAttribute('data-variant', 'default');
  });

  it('renders secondary variant', () => {
    render(<Badge variant="secondary">12</Badge>);
    expect(screen.getByText('12')).toHaveAttribute('data-variant', 'secondary');
  });

  it('renders outline variant', () => {
    render(<Badge variant="outline">7</Badge>);
    expect(screen.getByText('7')).toHaveAttribute('data-variant', 'outline');
  });

  it('applies custom className', () => {
    render(<Badge className="custom">5</Badge>);
    expect(screen.getByText('5')).toHaveClass('custom');
  });

  // --- count prop ---

  it('renders count as text', () => {
    render(<Badge count={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('caps count at 99+', () => {
    render(<Badge count={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('shows exact count at boundary', () => {
    render(<Badge count={99} />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('supports custom max', () => {
    render(<Badge count={10} max={9} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('adds role="status" when count is provided', () => {
    render(<Badge count={5} />);
    expect(screen.getByRole('status')).toHaveTextContent('5');
  });

  it('does not add role="status" for children', () => {
    render(<Badge>New</Badge>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('count takes precedence over children', () => {
    render(<Badge count={7}>ignored</Badge>);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  // --- error-overlay variant ---

  it('renders error-overlay variant with correct data-variant attribute', () => {
    render(<Badge variant="error-overlay">!</Badge>);
    expect(screen.getByText('!')).toHaveAttribute('data-variant', 'error-overlay');
  });

  it('error-overlay variant has absolute positioning class', () => {
    render(<Badge variant="error-overlay">!</Badge>);
    expect(screen.getByText('!')).toHaveClass('absolute');
  });

  it('error-overlay variant uses destructive background color', () => {
    render(<Badge variant="error-overlay">!</Badge>);
    expect(screen.getByText('!')).toHaveClass('bg-destructive');
  });

  // --- regression: existing variants unchanged ---

  it('default variant still renders with data-variant="default"', () => {
    render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText('Default')).toHaveAttribute('data-variant', 'default');
  });

  it('secondary variant still renders with data-variant="secondary"', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveAttribute('data-variant', 'secondary');
  });
});
