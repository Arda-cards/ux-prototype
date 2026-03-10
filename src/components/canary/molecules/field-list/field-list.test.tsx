import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ArdaFieldList } from './field-list';

describe('ArdaFieldList', () => {
  it('renders fields with labels and values', () => {
    render(
      <ArdaFieldList
        fields={[
          { key: 'sku', label: 'SKU', value: 'ITEM-001' },
          { key: 'price', label: 'Price', value: '$10.00' },
        ]}
      />,
    );
    expect(screen.getByText('SKU')).toBeVisible();
    expect(screen.getByText('ITEM-001')).toBeVisible();
    expect(screen.getByText('Price')).toBeVisible();
    expect(screen.getByText('$10.00')).toBeVisible();
  });

  it('renders em-dash fallback for missing values', () => {
    render(<ArdaFieldList fields={[{ key: 'gl', label: 'GL Code' }]} />);
    expect(screen.getByText('GL Code')).toBeVisible();
    expect(screen.getByText('\u2014')).toBeVisible();
  });

  it('renders custom children when provided', () => {
    render(
      <ArdaFieldList
        fields={[
          {
            key: 'link',
            label: 'Link',
            children: <a href="https://example.com">Example</a>,
          },
        ]}
      />,
    );
    expect(screen.getByText('Link')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Example' })).toBeVisible();
  });

  it('returns null when fields array is empty', () => {
    const { container } = render(<ArdaFieldList fields={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
