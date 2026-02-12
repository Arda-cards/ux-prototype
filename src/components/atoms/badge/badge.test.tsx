import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ArdaBadge } from './badge';

describe('ArdaBadge', () => {
  it('renders with default variant', () => {
    render(<ArdaBadge>Active</ArdaBadge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(<ArdaBadge variant="success">In Stock</ArdaBadge>);
    const badge = screen.getByText('In Stock');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-[#DCFCE7]');
  });

  it('renders with warning variant', () => {
    render(<ArdaBadge variant="warning">Low Stock</ArdaBadge>);
    const badge = screen.getByText('Low Stock');
    expect(badge.className).toContain('bg-[#FEF3C7]');
  });

  it('renders with info variant', () => {
    render(<ArdaBadge variant="info">Processing</ArdaBadge>);
    const badge = screen.getByText('Processing');
    expect(badge.className).toContain('bg-[#DBEAFE]');
  });

  it('renders with destructive variant', () => {
    render(<ArdaBadge variant="destructive">Error</ArdaBadge>);
    const badge = screen.getByText('Error');
    expect(badge.className).toContain('bg-[#FEE2E2]');
  });

  it('renders with outline variant', () => {
    render(<ArdaBadge variant="outline">Draft</ArdaBadge>);
    const badge = screen.getByText('Draft');
    expect(badge.className).toContain('bg-transparent');
  });

  it('shows dot when dot prop is true', () => {
    const { container } = render(
      <ArdaBadge variant="success" dot>
        Active
      </ArdaBadge>,
    );
    const dot = container.querySelector('.rounded-full.w-1\\.5');
    expect(dot).toBeInTheDocument();
  });

  it('does not show dot by default', () => {
    const { container } = render(<ArdaBadge>No Dot</ArdaBadge>);
    const dot = container.querySelector('.w-1\\.5.h-1\\.5');
    expect(dot).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ArdaBadge className="custom-class">Custom</ArdaBadge>);
    const badge = screen.getByText('Custom');
    expect(badge.className).toContain('custom-class');
  });
});
