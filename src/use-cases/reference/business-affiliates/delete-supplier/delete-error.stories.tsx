/**
 * BA::0005::0001 — Delete Error
 *
 * Story-level MSW override returns 500 for DELETE requests.
 * Verifies error toast appears and the row is preserved.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { DeletableSuppliersPage } from './deletable-suppliers-page';
import { businessAffiliateHandlers, resetAffiliateStore } from '../_shared/msw-handlers';
import { storyStepDelay } from '../_shared/story-step-delay';

// Build handlers with the DELETE override — replace the default DELETE handler
// with one that always returns 500. Keep all other handlers intact.
const errorHandlers = [
  // Override DELETE to always fail
  http.delete('/api/arda/business-affiliate/:entityId', async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return HttpResponse.json(
      { ok: false, status: 500, error: 'Internal server error' },
      { status: 500 },
    );
  }),
  // Spread all default handlers (POST /query, GET /lookup, GET /:entityId, POST /create, DELETE)
  // The override above takes precedence due to first-match-wins
  ...businessAffiliateHandlers,
];

const meta: Meta<typeof DeletableSuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0005 Delete Supplier/0003 Delete Error',
  component: DeletableSuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: {
      handlers: errorHandlers,
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

/**
 * Server returns 500 on delete — error toast shown, row preserved.
 */
export const NetworkError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });
    await storyStepDelay();

    // 2. Select a row
    const checkboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    await storyStepDelay();

    // 3. Open Actions → Delete → Confirm
    const actionsButton = canvas.getByRole('button', { name: 'Actions' });
    await userEvent.click(actionsButton);
    // Radix DropdownMenuContent portals to document.body — use screen (not canvas)
    const deleteItem = await screen.findByRole('menuitem', { name: /delete/i }, { timeout: 10000 });
    await userEvent.click(deleteItem);

    const dialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    // Dialog uses animate-in fade-in — wait for visibility before interacting
    await waitFor(
      () => {
        expect(dialog).toBeVisible();
      },
      { timeout: 10000 },
    );
    const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
    await storyStepDelay();
    await userEvent.click(confirmButton);

    // 4. Verify dialog closes
    await waitFor(
      () => {
        expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );
    await storyStepDelay();

    // 5. Verify error toast (Sonner portal — use screen)
    const errorToast = await screen.findByText(/failed to delete/i, {}, { timeout: 10000 });
    await waitFor(
      () => {
        expect(errorToast).toBeVisible();
      },
      { timeout: 10000 },
    );

    // 6. Verify the row is still present (not removed after failed delete)
    // Grid may re-render after the failed delete response — wait for the row to reappear
    await waitFor(
      () => {
        expect(canvas.getByText('Apex Medical Distributors')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  },
};
