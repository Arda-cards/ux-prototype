import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { ItemGrid } from './item-grid';
import { itemGridFixtures } from '../../molecules/item-grid/item-grid-fixtures';

// AG Grid does not render cell content in JSDOM — cell text and row click
// interactions are verified via Storybook play functions instead.

describe('ItemGrid', () => {
  it('renders search input', () => {
    render(<ItemGrid items={itemGridFixtures} />);
    expect(screen.getByPlaceholderText('Search items…')).toBeInTheDocument();
  });

  it('displays item count for fixture data', () => {
    render(<ItemGrid items={itemGridFixtures} />);
    expect(screen.getByText('12 items')).toBeInTheDocument();
  });

  it('displays correct count for empty items', () => {
    render(<ItemGrid items={[]} />);
    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  it('filters count by search on name', async () => {
    const user = userEvent.setup();
    render(<ItemGrid items={itemGridFixtures} />);

    const input = screen.getByPlaceholderText('Search items…');
    await user.type(input, 'glove');
    await waitFor(() => expect(screen.getByText('1 item')).toBeInTheDocument());
  });

  it('filters count by search on SKU', async () => {
    const user = userEvent.setup();
    render(<ItemGrid items={itemGridFixtures} />);

    const input = screen.getByPlaceholderText('Search items…');
    await user.type(input, 'GLV-NIT');
    await waitFor(() => expect(screen.getByText('1 item')).toBeInTheDocument());
  });

  it('shows plural for multiple items, singular for one', async () => {
    const user = userEvent.setup();
    render(<ItemGrid items={itemGridFixtures} />);

    expect(screen.getByText('12 items')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Search items…');
    await user.type(input, 'autoclave');
    await waitFor(() => expect(screen.getByText('1 item')).toBeInTheDocument());
  });
});
