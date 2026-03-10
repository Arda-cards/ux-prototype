import { render, screen } from '@testing-library/react';
import { Package } from 'lucide-react';
import { describe, it, expect } from 'vitest';

import { ArdaIconLabel } from './icon-label';

describe('ArdaIconLabel', () => {
  it('renders icon and label text', () => {
    render(<ArdaIconLabel icon={Package} label="Items" />);
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  it('renders the icon element', () => {
    const { container } = render(<ArdaIconLabel icon={Package} label="Items" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ArdaIconLabel icon={Package} label="Items" className="custom" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('custom');
  });

  it('truncates long labels', () => {
    render(
      <ArdaIconLabel icon={Package} label="A very long label that should be truncated by CSS" />,
    );
    const labelSpan = screen.getByText('A very long label that should be truncated by CSS');
    expect(labelSpan).toHaveClass('truncate');
  });
});
