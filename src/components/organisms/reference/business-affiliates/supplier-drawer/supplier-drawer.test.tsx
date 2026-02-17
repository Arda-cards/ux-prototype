import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { sampleAffiliates } from '@/types/reference/business-affiliates/business-affiliate';

import { ArdaSupplierDrawer } from './supplier-drawer';

const affiliate = sampleAffiliates[0]!;

/** Helper: find the drawer header heading (the h2 inside the header bar). */
function getDrawerHeading() {
  const dialog = screen.getByRole('dialog');
  // The header is the first child div containing the h2
  const heading = dialog.querySelector('h2');
  return heading;
}

describe('ArdaSupplierDrawer', () => {
  it('renders supplier name in header in view mode', () => {
    render(<ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={() => {}} />);
    const heading = getDrawerHeading();
    expect(heading).toHaveTextContent('Fastenal Corp.');
  });

  it('renders "New Supplier" title in add mode', () => {
    render(<ArdaSupplierDrawer open mode="add" onClose={() => {}} />);
    const heading = getDrawerHeading();
    expect(heading).toHaveTextContent('New Supplier');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close drawer'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={onClose} />);
    const overlay = screen.getByRole('dialog').previousElementSibling as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders dialog with translate-x-full when closed', () => {
    render(
      <ArdaSupplierDrawer open={false} mode="view" affiliate={affiliate} onClose={() => {}} />,
    );
    expect(screen.getByRole('dialog')).toHaveClass('translate-x-full');
  });

  it('renders dialog with translate-x-0 when open', () => {
    render(
      <ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={() => {}} />,
    );
    expect(screen.getByRole('dialog')).toHaveClass('translate-x-0');
  });

  it('uses custom title when provided', () => {
    render(
      <ArdaSupplierDrawer
        open
        mode="view"
        affiliate={affiliate}
        title="Custom Title"
        onClose={() => {}}
      />,
    );
    const heading = getDrawerHeading();
    expect(heading).toHaveTextContent('Custom Title');
  });

  it('shows "Supplier Details" when no affiliate in view mode', () => {
    render(<ArdaSupplierDrawer open mode="view" onClose={() => {}} />);
    const heading = getDrawerHeading();
    expect(heading).toHaveTextContent('Supplier Details');
  });
});
