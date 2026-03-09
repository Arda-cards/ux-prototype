import { render, screen } from '@testing-library/react';
import { Package, ShoppingCart } from 'lucide-react';

import { ArdaNavItem } from './nav-item';

function renderInList(ui: React.ReactElement) {
  return render(<ul>{ui}</ul>);
}

describe('ArdaNavItem', () => {
  it('renders a link with label and icon', () => {
    renderInList(<ArdaNavItem href="/items" icon={Package} label="Items" />);
    const link = screen.getByRole('link', { name: /items/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/items');
  });

  it('sets aria-current="page" when active', () => {
    renderInList(<ArdaNavItem href="/items" icon={Package} label="Items" active />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current when inactive', () => {
    renderInList(<ArdaNavItem href="/items" icon={Package} label="Items" />);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
  });

  it('renders badge when provided', () => {
    renderInList(<ArdaNavItem href="/orders" icon={ShoppingCart} label="Orders" badge={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('keeps label in DOM when collapsed (sr-only)', () => {
    renderInList(<ArdaNavItem href="/items" icon={Package} label="Items" collapsed />);
    // Label should still exist for screen readers
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Items')).toHaveClass('sr-only');
  });

  it('renders as a list item', () => {
    renderInList(<ArdaNavItem href="/items" icon={Package} label="Items" />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('applies className prop', () => {
    renderInList(<ArdaNavItem href="/items" icon={Package} label="Items" className="my-custom" />);
    expect(screen.getByRole('link')).toHaveClass('my-custom');
  });
});
