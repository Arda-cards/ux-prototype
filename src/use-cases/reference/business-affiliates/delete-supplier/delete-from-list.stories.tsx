/**
 * BA::0005::0001 — Delete from List
 *
 * Multi-step interaction story: row selection → Actions dropdown →
 * confirm dialog → DELETE API → toast feedback → grid re-fetch.
 *
 * 3 variants: SingleDelete, BulkDelete, CancelDelete.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { DeletableSuppliersPage } from './deletable-suppliers-page';
import { businessAffiliateHandlers, resetAffiliateStore } from '../_shared/msw-handlers';
import { storyStepDelay } from '../_shared/story-step-delay';

const meta: Meta<typeof DeletableSuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0005 Delete Supplier/0001 Delete from List',
  component: DeletableSuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: {
      handlers: businessAffiliateHandlers,
    },
  },
  args: {
    pathname: '/suppliers',
  },
  beforeEach: () => {
    resetAffiliateStore();
  },
};

export default meta;
type Story = StoryObj<typeof DeletableSuppliersPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Select one row, open Actions → Delete, confirm, verify toast and row removal.
 */
export const SingleDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    const firstRow = await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });
    expect(firstRow).toBeVisible();
    await storyStepDelay();

    // 2. Select the first data row
    const checkboxes = canvas.getAllByRole('checkbox');
    // checkboxes[0] = header "select all", checkboxes[1] = first data row
    await userEvent.click(checkboxes[1]);
    await storyStepDelay();

    // 3. Open the Actions dropdown
    const actionsButton = canvas.getByRole('button', { name: 'Actions' });
    expect(actionsButton).toBeEnabled();
    await userEvent.click(actionsButton);

    // 4. Click "Delete" menu item
    // Radix DropdownMenuContent portals to document.body — use screen (not canvas)
    const deleteItem = await screen.findByRole('menuitem', { name: /delete/i }, { timeout: 10000 });
    await userEvent.click(deleteItem);
    await storyStepDelay();

    // 5. Verify confirm dialog opens
    const dialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    expect(dialog).toBeVisible();
    expect(within(dialog).getByText('Delete Supplier')).toBeVisible();
    expect(
      within(dialog).getByText(/are you sure you want to delete this supplier/i),
    ).toBeVisible();
    await storyStepDelay();

    // 6. Click "Delete" confirm button
    const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    // 7. Verify dialog closes
    await waitFor(
      () => {
        expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );
    await storyStepDelay();

    // 8. Verify success toast (Sonner renders via portal to document.body)
    const toastText = await screen.findByText(
      /supplier deleted successfully/i,
      {},
      { timeout: 10000 },
    );
    await waitFor(
      () => {
        expect(toastText).toBeVisible();
      },
      { timeout: 10000 },
    );

    // 9. Verify the deleted row is gone — "Apex Medical Distributors" should no longer appear
    await waitFor(
      () => {
        expect(canvas.queryByText('Apex Medical Distributors')).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  },
};

/**
 * Select 3 rows, open Actions → Delete, confirm bulk delete, verify toast and row removal.
 */
export const BulkDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });
    await storyStepDelay();

    // 2. Select 3 rows
    const checkboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]); // row 1
    await userEvent.click(checkboxes[2]); // row 2
    await userEvent.click(checkboxes[3]); // row 3
    await storyStepDelay();

    // 3. Open Actions dropdown, click "Delete"
    const actionsButton = canvas.getByRole('button', { name: 'Actions' });
    await userEvent.click(actionsButton);
    // Radix DropdownMenuContent portals to document.body — use screen (not canvas)
    const deleteItem = await screen.findByRole('menuitem', { name: /delete/i }, { timeout: 10000 });
    await userEvent.click(deleteItem);
    await storyStepDelay();

    // 4. Verify confirm dialog with bulk message
    const dialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    expect(within(dialog).getByText('Delete Suppliers')).toBeVisible();
    expect(within(dialog).getByText(/delete 3 suppliers/i)).toBeVisible();
    await storyStepDelay();

    // 5. Click "Delete"
    const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    // 6. Verify dialog closes
    await waitFor(
      () => {
        expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // 7. Verify success toast (Sonner portal — use screen)
    const toastText = await screen.findByText(
      /suppliers deleted successfully/i,
      {},
      { timeout: 10000 },
    );
    await waitFor(
      () => {
        expect(toastText).toBeVisible();
      },
      { timeout: 10000 },
    );
  },
};

/**
 * Select a row, open confirm dialog, click "Cancel" — row preserved, still selected.
 */
export const CancelDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });
    await storyStepDelay();

    // 2. Select the first data row
    const checkboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    await storyStepDelay();

    // 3. Open Actions → Delete
    const actionsButton = canvas.getByRole('button', { name: 'Actions' });
    await userEvent.click(actionsButton);
    // Radix DropdownMenuContent portals to document.body — use screen (not canvas)
    const deleteItem = await screen.findByRole('menuitem', { name: /delete/i }, { timeout: 10000 });
    await userEvent.click(deleteItem);
    await storyStepDelay();

    // 4. Verify confirm dialog opens
    const dialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    expect(dialog).toBeVisible();
    await storyStepDelay();

    // 5. Click "Cancel"
    const cancelButton = within(dialog).getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // 6. Verify dialog closes
    await waitFor(
      () => {
        expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // 7. Verify the row is still present
    expect(canvas.getByText('Apex Medical Distributors')).toBeVisible();

    // 8. Verify the row checkbox is still checked
    expect(checkboxes[1]).toBeChecked();
  },
};
