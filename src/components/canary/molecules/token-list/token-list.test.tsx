import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { TokenList } from './token-list';

describe('TokenList', () => {
  it('renders one badge per value', () => {
    render(<TokenList values={['Vendor', 'Carrier']} />);
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('Carrier')).toBeInTheDocument();
  });

  it('shows the em-dash placeholder when empty', () => {
    render(<TokenList values={[]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows a custom empty placeholder', () => {
    render(<TokenList values={[]} emptyText="None" />);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('defaults to the secondary variant and honors an explicit variant', () => {
    const { rerender } = render(<TokenList values={['Vendor']} />);
    expect(screen.getByText('Vendor')).toHaveAttribute('data-variant', 'secondary');

    rerender(<TokenList values={['Online']} variant="outline" />);
    expect(screen.getByText('Online')).toHaveAttribute('data-variant', 'outline');
  });

  it('applies a custom className to the container', () => {
    const { container } = render(<TokenList values={['Vendor']} className="test-cls" />);
    expect(container.querySelector('.test-cls')).not.toBeNull();
  });
});
