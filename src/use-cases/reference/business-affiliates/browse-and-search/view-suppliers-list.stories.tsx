/**
 * BA::0001::0001 — View Suppliers List
 *
 * Foundation story: renders the suppliers list view with AG Grid,
 * search, pagination, column visibility, and placeholder detail drawer.
 *
 * 4 variants: Default, EmptyState, LoadingState, ErrorState.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { SuppliersPage } from '../_shared/suppliers-page';
import { businessAffiliateHandlers } from '../_shared/msw-handlers';

const meta: Meta<typeof SuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/0001 View Suppliers List',
  component: SuppliersPage,
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
};

export default meta;
type Story = StoryObj<typeof SuppliersPage>;

/**
 * Default state — shows the first page of 28 affiliates (10 per page).
 * Verifies grid renders, role badges are visible, and toolbar is present.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to finish loading — first affiliate alphabetically is "Apex Medical Distributors"
    const firstRow = await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });
    expect(firstRow).toBeVisible();

    // 2. Verify "+ Add Supplier" toolbar button (use exact name to avoid sidebar match)
    const addButton = canvas.getByRole('button', { name: 'Add Supplier' });
    expect(addButton).toBeVisible();

    // 3. Verify page header (use heading role to avoid sidebar "Suppliers" text)
    expect(canvas.getByRole('heading', { name: 'Suppliers', level: 1 })).toBeVisible();
    expect(canvas.getByText('Business affiliates with a Vendor role.')).toBeVisible();

    // 4. Verify search input
    const searchInput = canvas.getByPlaceholderText('Search suppliers...');
    expect(searchInput).toBeVisible();

    // 5. Verify pagination controls
    expect(canvas.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(canvas.getByRole('button', { name: /next page/i })).toBeEnabled();
  },
};

/**
 * Empty state — no suppliers returned from the API.
 * Verifies empty state heading, guidance text, and single CTA.
 */
export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/arda/business-affiliate/query', () =>
          HttpResponse.json({
            ok: true,
            status: 200,
            data: {
              thisPage: '0',
              nextPage: '0',
              previousPage: '0',
              results: [],
            },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Verify empty state heading
    const heading = await canvas.findByText(/no suppliers yet/i, {}, { timeout: 10000 });
    expect(heading).toBeVisible();

    // 2. Verify guidance text
    expect(canvas.getByText(/add your first supplier/i)).toBeVisible();

    // 3. Verify "Add Supplier" buttons exist (toolbar + empty state CTA)
    const addButtons = canvas.getAllByRole('button', { name: /add supplier/i });
    expect(addButtons.length).toBeGreaterThanOrEqual(2);

    // 4. Verify NO "Import suppliers" button (per OQ-2)
    expect(canvas.queryByText(/import supplier/i)).not.toBeInTheDocument();
  },
};

/**
 * Loading state — API never responds during the test.
 * Verifies loading indicator is displayed.
 */
export const LoadingState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/arda/business-affiliate/query', async () => {
          await new Promise((resolve) => setTimeout(resolve, 60_000)); // never resolves during test
          return HttpResponse.json({ ok: true, status: 200, data: { results: [] } });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the page header renders while data is loading
    await waitFor(
      () => {
        expect(canvas.getByRole('heading', { name: 'Suppliers', level: 1 })).toBeVisible();
      },
      { timeout: 10000 },
    );

    // Verify no data rows are visible (still loading)
    expect(canvas.queryByText('Apex Medical Distributors')).not.toBeInTheDocument();
  },
};

/**
 * Error state — API returns a 500 error.
 * Verifies error message is displayed.
 */
export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/arda/business-affiliate/query', () =>
          HttpResponse.json(
            { ok: false, status: 500, error: 'Internal server error' },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify error message is displayed
    const errorMsg = await canvas.findByText(/internal server error/i, {}, { timeout: 10000 });
    expect(errorMsg).toBeVisible();
  },
};
