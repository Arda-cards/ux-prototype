/**
 * BA::0004::0002 — Edit Supplier: Validation Errors
 *
 * Three standard stories exercising error and edge-case scenarios for the edit flow:
 *   ClearRequiredField — clear the Name field, verify Save is disabled, re-enter name, verify Save re-enables
 *   CancelDiscards     — modify email, click Cancel, verify original email is restored
 *   NetworkError       — PUT returns 500, verify error toast and drawer stays in edit mode
 *
 * All stories use EditableSuppliersPage from BA::0004::0001.
 * NetworkError uses the handler-prepend pattern to override the PUT handler at story level.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { EditableSuppliersPage } from './editable-suppliers-page';
import {
  businessAffiliateHandlers,
  resetAffiliateStore,
} from '../_shared/msw-handlers';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof EditableSuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0004 Edit Supplier/0002 Validation Errors',
  component: EditableSuppliersPage,
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
type Story = StoryObj<typeof EditableSuppliersPage>;

// ---------------------------------------------------------------------------
// Handler-prepend pattern: error override for NetworkError story
// The PUT error handler is prepended BEFORE businessAffiliateHandlers so
// MSW's first-match-wins dispatches the error handler for PUT requests.
// ---------------------------------------------------------------------------

const errorHandlers = [
  http.put('/api/arda/business-affiliate/:entityId', async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return HttpResponse.json(
      { ok: false, status: 500, error: 'Internal server error' },
      { status: 500 },
    );
  }),
  ...businessAffiliateHandlers,
];

// ---------------------------------------------------------------------------
// ClearRequiredField
// ---------------------------------------------------------------------------

/**
 * Opens Apex Medical Distributors, enters edit mode, clears the Name field,
 * verifies Save is disabled, then types a new name and verifies Save re-enables.
 */
export const ClearRequiredField: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Step 1: Wait for grid to load, click Apex Medical Distributors to open drawer
    const firstRow = await canvas.findByText('Apex Medical Distributors');
    await userEvent.click(firstRow);

    // Step 2: Verify drawer opens
    const drawer = await canvas.findByRole('dialog');
    const drawerScope = within(drawer);

    // Step 3: Click "Edit" to enter edit mode
    const editButton = await drawerScope.findByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Step 4: Verify edit mode — Save and Cancel buttons visible
    const saveButton = await drawerScope.findByRole('button', { name: /save/i });
    const cancelButton = drawerScope.getByRole('button', { name: /cancel/i });
    expect(saveButton).toBeVisible();
    expect(cancelButton).toBeVisible();

    // Step 5: Locate Name field and clear it
    // In edit mode the Name input has id="edit-name" and aria-label="Name"
    const nameInput = drawerScope.getByLabelText(/^name$/i) as HTMLInputElement;
    await userEvent.clear(nameInput);

    // Step 6: Verify Save is disabled (isSaveDisabled = !nameValue.trim())
    await waitFor(() => {
      const saveBtn = drawerScope.getByRole('button', { name: /save/i });
      const isDisabled =
        saveBtn.hasAttribute('disabled') ||
        saveBtn.getAttribute('aria-disabled') === 'true';
      const hasError =
        drawerScope.queryByText(/name is required/i) !== null ||
        drawerScope.queryByText(/required/i) !== null;
      expect(isDisabled || hasError).toBe(true);
    });

    // Step 7: Type a new name
    await userEvent.type(nameInput, 'Updated Supplier Name');

    // Step 8: Verify Save is enabled and any validation error is cleared
    await waitFor(() => {
      const saveBtn = drawerScope.getByRole('button', { name: /save/i });
      expect(saveBtn).toBeEnabled();
    });
    // No field-level error should remain
    await waitFor(() => {
      expect(drawerScope.queryByText(/name is required/i)).not.toBeInTheDocument();
    });
  },
};

// ---------------------------------------------------------------------------
// CancelDiscards
// ---------------------------------------------------------------------------

/**
 * Opens Apex Medical Distributors, enters edit mode, changes the contact email,
 * clicks Cancel, and verifies the drawer returns to view mode with the original
 * email (msantos@apexmedical.com) restored — confirming the change was discarded.
 */
export const CancelDiscards: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Step 1: Open drawer for Apex Medical Distributors
    const firstRow = await canvas.findByText('Apex Medical Distributors');
    await userEvent.click(firstRow);

    // Step 2: Verify drawer opens in view mode with original email
    const drawer = await canvas.findByRole('dialog');
    const drawerScope = within(drawer);
    expect(await drawerScope.findByText('msantos@apexmedical.com')).toBeVisible();

    // Step 3: Click "Edit"
    const editButton = await drawerScope.findByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Step 4: Verify edit mode, locate email input
    await drawerScope.findByRole('button', { name: /save/i });
    // In edit mode, the contact email input has id="contact-email" and aria-label="Email"
    const emailInput = drawerScope.getByLabelText(/^email$/i) as HTMLInputElement;

    // Step 5: Clear email and type new value
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'changed@example.com');

    // Confirm the new value is in the input
    expect(emailInput.value).toBe('changed@example.com');

    // Step 6: Click "Cancel"
    const cancelButton = drawerScope.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Step 7: Verify drawer returns to view mode (Save removed, Edit reappears)
    await waitFor(() => {
      expect(drawerScope.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
    const editButtonAfterCancel = await drawerScope.findByRole('button', { name: /edit/i });
    expect(editButtonAfterCancel).toBeVisible();

    // Step 8: Verify original email is restored (change discarded)
    expect(drawerScope.getByText('msantos@apexmedical.com')).toBeVisible();
    expect(drawerScope.queryByText('changed@example.com')).not.toBeInTheDocument();
  },
};

// ---------------------------------------------------------------------------
// NetworkError
// ---------------------------------------------------------------------------

/**
 * Uses a story-level MSW override (handler-prepend pattern) to make PUT return 500.
 * Opens Apex Medical Distributors, enters edit mode, modifies the Name field,
 * clicks Save, verifies the error toast appears (via screen.findByText — Sonner portal),
 * and verifies the drawer stays in edit mode with the modified value preserved.
 */
export const NetworkError: Story = {
  parameters: {
    msw: {
      handlers: errorHandlers,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Step 1: Open drawer for Apex Medical Distributors
    const firstRow = await canvas.findByText('Apex Medical Distributors');
    await userEvent.click(firstRow);

    const drawer = await canvas.findByRole('dialog');
    const drawerScope = within(drawer);

    // Step 2: Click "Edit"
    const editButton = await drawerScope.findByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Step 3: Modify the Name field
    const nameInput = await waitFor(
      () => drawerScope.getByLabelText(/^name$/i) as HTMLInputElement,
    );
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Modified Supplier Name');

    // Step 4: Click "Save"
    const saveButton = drawerScope.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Step 5: Verify error toast (Sonner renders via portal to document.body — use screen)
    // EditableSuppliersPage calls toast.error(json.error ?? 'Failed to update supplier')
    // The error handler returns { error: 'Internal server error' } so json.error = 'Internal server error'
    const toastText = await screen.findByText(
      /internal server error|failed to save|update failed/i,
      {},
      { timeout: 5000 },
    );
    expect(toastText).toBeVisible();

    // Step 6: Verify drawer stays in edit mode
    await waitFor(() => {
      expect(drawerScope.getByRole('button', { name: /save/i })).toBeVisible();
      expect(drawerScope.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    // Step 7: Verify modified value is preserved in the Name input
    const nameInputAfterError = drawerScope.getByLabelText(/^name$/i) as HTMLInputElement;
    expect(nameInputAfterError.value).toBe('Modified Supplier Name');
  },
};
