/**
 * BA::0005::0002 — Delete from Detail Panel
 *
 * Storybook stories for the delete flow triggered from the drawer's Delete button
 * (view mode). Two variants:
 *  - ConfirmDelete: full happy path — open drawer, click Delete, confirm, verify toast
 *    and row removal.
 *  - CancelDelete: open drawer, click Delete, cancel, verify drawer stays open.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { PanelDeletableSuppliersPage } from './panel-deletable-suppliers-page';
import { businessAffiliateHandlers, resetAffiliateStore } from '../_shared/msw-handlers';

const meta: Meta<typeof PanelDeletableSuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0005 Delete Supplier/0002 Delete from Detail Panel',
  component: PanelDeletableSuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: {
      handlers: businessAffiliateHandlers,
    },
  },
  beforeEach: () => {
    resetAffiliateStore();
  },
};

export default meta;
type Story = StoryObj<typeof PanelDeletableSuppliersPage>;

// ---------------------------------------------------------------------------
// ConfirmDelete — happy path
// ---------------------------------------------------------------------------

export const ConfirmDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    const firstRow = await canvas.findByText(
      'Apex Medical Distributors',
      {},
      { timeout: 5000 },
    );
    expect(firstRow).toBeVisible();

    // 2. Click the first row to open the drawer
    await userEvent.click(firstRow);

    // 3. Verify drawer is open
    const drawer = await canvas.findByRole('dialog');
    expect(drawer).toBeVisible();
    const drawerScope = within(drawer);

    // 4. Click Delete button in the drawer footer
    const deleteButton = drawerScope.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // 5. Verify confirm dialog appears (inline rendering — within canvasElement)
    const dialog = await canvas.findByRole('alertdialog');
    expect(dialog).toBeVisible();

    // 6. Verify dialog title
    const dialogScope = within(dialog);
    expect(dialogScope.getByText('Delete Supplier')).toBeVisible();

    // 7. Verify dialog message contains the affiliate name
    expect(
      dialogScope.getByText(
        /are you sure you want to delete Apex Medical Distributors\?/i,
      ),
    ).toBeVisible();

    // 8. Click the "Delete" confirm button
    const confirmButton = dialogScope.getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    // 9. Verify dialog closes
    await waitFor(() => {
      expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    // 10. Verify success toast (Sonner renders via portal to document.body)
    const toastText = await screen.findByText(/supplier deleted successfully/i);
    expect(toastText).toBeVisible();

    // 11. Verify the drawer is closed (key remount resets SuppliersPage state)
    await waitFor(() => {
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // 12. Verify the deleted row is gone from the grid
    await waitFor(() => {
      expect(
        canvas.queryByText('Apex Medical Distributors'),
      ).not.toBeInTheDocument();
    });
  },
};

// ---------------------------------------------------------------------------
// CancelDelete — cancel cancels the dialog, drawer stays open
// ---------------------------------------------------------------------------

export const CancelDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    const firstRow = await canvas.findByText(
      'Apex Medical Distributors',
      {},
      { timeout: 5000 },
    );
    expect(firstRow).toBeVisible();

    // 2. Click the first row to open the drawer
    await userEvent.click(firstRow);

    // 3. Verify drawer is open
    const drawer = await canvas.findByRole('dialog');
    expect(drawer).toBeVisible();
    const drawerScope = within(drawer);

    // 4. Click Delete button in the drawer footer
    const deleteButton = drawerScope.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // 5. Verify confirm dialog appears
    const dialog = await canvas.findByRole('alertdialog');
    expect(dialog).toBeVisible();

    // 6. Click "Cancel"
    const cancelButton = within(dialog).getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // 7. Verify dialog closes
    await waitFor(() => {
      expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    // 8. Verify drawer is still open with affiliate data
    expect(canvas.getByRole('dialog')).toBeVisible();
    expect(drawerScope.getByText('Apex Medical Distributors')).toBeVisible();

    // 9. Verify the row is still present in the grid
    // (The grid row behind the drawer is still in the DOM)
    expect(canvas.getAllByText('Apex Medical Distributors').length).toBeGreaterThanOrEqual(1);
  },
};
