/**
 * BA::0003::0002 — Create Supplier: Validation Errors
 *
 * Three stories covering error paths during the create flow:
 *   EmptyNameBlocked  — client-side validation: Save disabled when Name empty, error on blur
 *   NetworkError      — server returns 500, error toast, drawer stays open with data preserved
 *   DuplicateNameError — server returns 409, duplicate message toast, drawer stays open
 *
 * NetworkError and DuplicateNameError use the handler-prepend pattern: error
 * handlers spread BEFORE ...businessAffiliateHandlers so MSW first-match-wins
 * catches the POST while all other handlers (query, lookup, etc.) still work.
 *
 * Toast assertions use screen.findByText() — Sonner portals to document.body,
 * outside canvasElement scope. See Lesson 5.8 in application-to-ba-stories.md.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, waitFor, userEvent, screen } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { CreatableSuppliersPage } from './creatable-suppliers-page';
import {
  businessAffiliateHandlers,
  resetAffiliateStore,
} from '../_shared/msw-handlers';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CreatableSuppliersPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0003 Create Supplier/0002 Validation Errors',
  component: CreatableSuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: { handlers: businessAffiliateHandlers },
  },
  beforeEach: () => {
    resetAffiliateStore();
  },
};
export default meta;
type Story = StoryObj<typeof CreatableSuppliersPage>;

// ---------------------------------------------------------------------------
// EmptyNameBlocked — client-side validation, no API calls
// ---------------------------------------------------------------------------

/**
 * Verifies that the Save button is disabled when the Name field is empty, and
 * that a "Name is required" field-level error appears when the field is blurred
 * without text. No API call is made in this story.
 */
export const EmptyNameBlocked: Story = {
  name: 'Empty Name Blocked',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load (confirms page rendering)
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });

    // 2. Click "+ Add Supplier" to open the create drawer
    const addButton = canvas.getByRole('button', { name: 'Add Supplier' });
    await userEvent.click(addButton);

    // 3. Verify drawer opens in create mode
    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    expect(drawer).toBeVisible();
    const drawerScope = within(drawer);
    expect(drawerScope.getByText('New Supplier')).toBeVisible();

    // 4. Verify Save is disabled (Name is empty on open)
    const saveButton = drawerScope.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeDisabled();

    // 5. Click into the Name field to focus it
    const nameInput = drawerScope.getByLabelText(/^name$/i);
    await userEvent.click(nameInput);

    // 6. Tab away (blur) without typing anything
    await userEvent.tab();

    // 7. Verify field-level error "Name is required" appears
    await waitFor(() => {
      expect(drawerScope.getByText(/name is required/i)).toBeVisible();
    }, { timeout: 10000 });

    // 8. Verify Save remains disabled
    expect(saveButton).toBeDisabled();
  },
};

// ---------------------------------------------------------------------------
// NetworkError — server returns 500, drawer stays open, form preserved
// ---------------------------------------------------------------------------

/**
 * Verifies that when the POST /create endpoint returns a 500 error, an error
 * toast is shown (via Sonner portal), the drawer remains open, and the typed
 * name is preserved in the form so the user can retry.
 *
 * Uses the handler-prepend pattern: the 500 error handler is spread BEFORE
 * businessAffiliateHandlers so MSW's first-match-wins catches the POST while
 * the query/lookup/get handlers still serve the grid and other requests.
 */
export const NetworkError: Story = {
  name: 'Network Error',
  parameters: {
    msw: {
      handlers: [
        // Override: POST /create returns 500 Internal Server Error
        http.post('/api/arda/business-affiliate', async () => {
          return HttpResponse.json(
            { ok: false, status: 500, error: 'Internal server error' },
            { status: 500 },
          );
        }),
        // Spread shared handlers — POST /query, GET /lookup, GET /:entityId, DELETE still work
        ...businessAffiliateHandlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });

    // 2. Open create drawer
    const addButton = canvas.getByRole('button', { name: 'Add Supplier' });
    await userEvent.click(addButton);

    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    expect(drawer).toBeVisible();
    const drawerScope = within(drawer);

    // 3. Type a supplier name
    const nameInput = drawerScope.getByLabelText(/^name$/i);
    await userEvent.type(nameInput, 'Test Supplier Inc.');

    // 4. Verify Save becomes enabled once name is entered
    const saveButton = drawerScope.getByRole('button', { name: /^save$/i });
    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    }, { timeout: 10000 });

    // 5. Click Save (triggers POST → 500 response)
    await userEvent.click(saveButton);

    // 6. Verify error toast appears (Sonner portals to document.body, use screen).
    // Sonner animates toasts in — wait for the text to be in the document, then
    // wait for visibility separately so the animation-in opacity has completed.
    await screen.findByText(
      /internal server error|failed to create supplier/i,
      {},
      { timeout: 10000 },
    );
    await waitFor(
      () => expect(screen.getByText(/internal server error|failed to create supplier/i)).toBeVisible(),
      { timeout: 10000 },
    );

    // 7. Verify the drawer remains open
    await waitFor(
      () => expect(canvas.getByRole('dialog')).toBeVisible(),
      { timeout: 10000 },
    );

    // 8. Verify form data is preserved (user can retry)
    expect(nameInput).toHaveValue('Test Supplier Inc.');
  },
};

// ---------------------------------------------------------------------------
// DuplicateNameError — server returns 409, duplicate message toast
// ---------------------------------------------------------------------------

/**
 * Verifies that when the POST /create endpoint returns a 409 conflict (duplicate
 * name), a domain-specific error toast is shown, the drawer remains open, and
 * the entered name is preserved so the user can rename and retry.
 *
 * Uses the same handler-prepend pattern as NetworkError with a 409 status and
 * a domain-specific error message.
 */
export const DuplicateNameError: Story = {
  name: 'Duplicate Name Error',
  parameters: {
    msw: {
      handlers: [
        // Override: POST /create returns 409 Conflict (duplicate name)
        http.post('/api/arda/business-affiliate', async () => {
          return HttpResponse.json(
            {
              ok: false,
              status: 409,
              error: 'A supplier with this name already exists',
            },
            { status: 409 },
          );
        }),
        // Spread shared handlers for grid loading and other routes
        ...businessAffiliateHandlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });

    // 2. Open create drawer
    const addButton = canvas.getByRole('button', { name: 'Add Supplier' });
    await userEvent.click(addButton);

    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    expect(drawer).toBeVisible();
    const drawerScope = within(drawer);

    // 3. Type a name that intentionally duplicates an existing supplier
    const nameInput = drawerScope.getByLabelText(/^name$/i);
    await userEvent.type(nameInput, 'Apex Medical Distributors');

    // 4. Verify Save becomes enabled
    const saveButton = drawerScope.getByRole('button', { name: /^save$/i });
    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    }, { timeout: 10000 });

    // 5. Click Save (triggers POST → 409 response)
    await userEvent.click(saveButton);

    // 6. Verify error toast with duplicate-name message (Sonner portal).
    // Sonner animates toasts in — wait for the text to be in the document, then
    // wait for visibility separately so the animation-in opacity has completed.
    await screen.findByText(
      /a supplier with this name already exists/i,
      {},
      { timeout: 10000 },
    );
    await waitFor(
      () => expect(screen.getByText(/a supplier with this name already exists/i)).toBeVisible(),
      { timeout: 10000 },
    );

    // 7. Verify the drawer remains open
    await waitFor(
      () => expect(canvas.getByRole('dialog')).toBeVisible(),
      { timeout: 10000 },
    );

    // 8. Verify form data is preserved (user can rename and retry)
    expect(nameInput).toHaveValue('Apex Medical Distributors');
  },
};
