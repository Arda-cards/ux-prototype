import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ArdaItemDrawer, sampleItem } from './item-drawer';

const baseProps = {
  open: true,
  mode: 'view' as const,
  item: sampleItem,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  onEdit: vi.fn(),
};

describe('ArdaItemDrawer', () => {
  // 1. Renders item data in view mode
  it('renders item data in view mode (name, SKU, supplier visible)', () => {
    render(<ArdaItemDrawer {...baseProps} />);
    // Item name appears in both header and content; verify at least one
    const nameElements = screen.getAllByText('Hydraulic Cylinder HC-500');
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('HYD-CYL-HC500')).toBeInTheDocument();
    expect(screen.getByText('Fastenal Corp.')).toBeInTheDocument();
  });

  // 2. Renders empty form in add mode
  it('renders empty form in add mode', () => {
    const { item: _, ...addProps } = baseProps;
    render(<ArdaItemDrawer {...addProps} mode="add" />);
    expect(screen.getByText('Add New Item')).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveValue('');
  });

  // 3. Pre-populates form in edit mode from item prop
  it('pre-populates form in edit mode from item prop', () => {
    render(<ArdaItemDrawer {...baseProps} mode="edit" />);
    expect(screen.getByText('Edit Item')).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveValue('Hydraulic Cylinder HC-500');
    const skuInput = screen.getByLabelText('Internal SKU');
    expect(skuInput).toHaveValue('HYD-CYL-HC500');
  });

  // 4. Calls onClose when overlay clicked
  it('calls onClose when overlay clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<ArdaItemDrawer {...baseProps} onClose={onClose} />);
    const overlay = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(overlay).toBeInTheDocument();
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // 5. Calls onClose when X button clicked
  it('calls onClose when X button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ArdaItemDrawer {...baseProps} onClose={onClose} />);
    await user.click(screen.getByLabelText('Close drawer'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // 6. Calls onClose on Escape key (view mode, no unsaved changes)
  it('calls onClose on Escape key when no unsaved changes', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ArdaItemDrawer {...baseProps} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // 7. Calls onSubmit with form data when form submitted
  it('calls onSubmit with form data when form submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ArdaItemDrawer {...baseProps} mode="edit" onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Hydraulic Cylinder HC-500' }),
    );
  });

  // 8. Calls onEdit when edit button clicked in view mode
  it('calls onEdit when edit button clicked in view mode', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ArdaItemDrawer {...baseProps} onEdit={onEdit} />);
    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  // 9. Shows confirm dialog when cancelling edit with unsaved changes
  it('shows confirm dialog when cancelling edit with unsaved changes', async () => {
    const user = userEvent.setup();
    render(<ArdaItemDrawer {...baseProps} mode="edit" />);
    // Make a change to trigger dirty detection
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed');
    // Click Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    // Confirm dialog should appear
    expect(screen.getByText('Discard changes?')).toBeInTheDocument();
    expect(screen.getByText('You have unsaved changes that will be lost.')).toBeInTheDocument();
  });

  // 10. Discards changes and returns to view mode on confirm
  it('discards changes and returns to view mode on confirm', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ArdaItemDrawer {...baseProps} mode="edit" onEdit={onEdit} />);
    // Make a change
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed');
    // Click Cancel to trigger dialog
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    // Click Discard in the confirm dialog
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    // Should call onEdit to return to view mode
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  // 11. Stays in edit mode on cancel of confirm dialog
  it('stays in edit mode on cancel of confirm dialog', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ArdaItemDrawer {...baseProps} mode="edit" onEdit={onEdit} />);
    // Make a change to trigger dirty state
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'X');
    // Click Cancel to trigger dialog
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    // Confirm dialog should appear
    expect(screen.getByText('Discard changes?')).toBeInTheDocument();
    // Click Keep editing
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    // Dialog should close, onEdit should not have been called
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
    expect(onEdit).not.toHaveBeenCalled();
    // Form should still be visible (Name input still accessible = still in edit mode)
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  // 12. Not rendered / invisible when open={false}
  it('is invisible when open is false', () => {
    const { container } = render(<ArdaItemDrawer {...baseProps} open={false} />);
    const panel = screen.getByRole('dialog', { hidden: true });
    expect(panel.className).toContain('translate-x-full');
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay?.className).toContain('invisible');
  });

  // 13. Has role="dialog" and aria-modal="true"
  it('has role="dialog" and aria-modal="true"', () => {
    render(<ArdaItemDrawer {...baseProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  // 14. Drawer has correct width class
  it('has correct width classes on the panel', () => {
    render(<ArdaItemDrawer {...baseProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('sm:w-[420px]');
    expect(dialog.className).toContain('lg:w-[460px]');
  });
});
