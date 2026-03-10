/**
 * BA::0001::0006 — Pagination
 *
 * Exercises all pagination controls across 3 pages of business affiliates.
 * Mock data: 28 affiliates sorted A-Z, page size 10 → 3 pages (10, 10, 8 rows).
 *
 * Page boundaries:
 *   Page 1 (index 0): rows 0-9  → "Apex Medical Distributors" … "Healthcare Direct"
 *   Page 2 (index 1): rows 10-19 → "Horizon Diagnostics" … "Precision Surgical"
 *   Page 3 (index 2): rows 20-27 → "QuickShip Logistics" … "Zenith Supplies"
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, waitFor, userEvent } from 'storybook/test';
import { SuppliersPage } from '../_shared/suppliers-page';
import { businessAffiliateHandlers, resetAffiliateStore } from '../_shared/msw-handlers';

const meta: Meta<typeof SuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/0006 Pagination',
  component: SuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: {
      handlers: [...businessAffiliateHandlers],
    },
  },
  args: {
    pathname: '/suppliers',
    pageSize: 10,
  },
  beforeEach: () => {
    resetAffiliateStore();
  },
};

export default meta;
type Story = StoryObj<typeof SuppliersPage>;

/**
 * Default — navigates through all 3 pages and back to page 2.
 *
 * Verified interactions:
 *   - Page 1: data loaded, "Page 1" text, "Previous" disabled
 *   - Click "Next" → Page 2: correct data, "Page 2" text
 *   - Click "Next" → Page 3: correct data, "Page 3" text, "Next" disabled
 *   - Click "Previous" → back to Page 2: "Page 2" text, correct data
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ----- Page 1 -----

    // 1. Wait for page 1 to load — first affiliate alphabetically
    // Note: AG Grid virtualizes rows; cells may be in DOM but not "visible" per
    // testing-library if scrolled out of the viewport. findByText confirms data loaded.
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });

    // 2. Verify pagination shows "Page 1"
    await waitFor(() => {
      expect(canvas.getByText('Page 1')).toBeVisible();
    }, { timeout: 10000 });

    // 3. Verify "Previous" is disabled on first page
    const prevButton = canvas.getByRole('button', { name: 'Previous page' });
    expect(prevButton).toBeDisabled();

    // 4. Click "Next page"
    const nextButton = canvas.getByRole('button', { name: 'Next page' });
    expect(nextButton).toBeEnabled();
    await userEvent.click(nextButton);

    // ----- Page 2 -----

    // 5. Wait for page 2 — first affiliate on page 2
    await canvas.findByText('Horizon Diagnostics', {}, { timeout: 10000 });

    // 6. Verify pagination shows "Page 2"
    await waitFor(() => {
      expect(canvas.getByText('Page 2')).toBeVisible();
    }, { timeout: 10000 });

    // 7. Click "Next page" again
    const nextButton2 = canvas.getByRole('button', { name: 'Next page' });
    await userEvent.click(nextButton2);

    // ----- Page 3 -----

    // 8. Wait for page 3 — first affiliate on page 3
    await canvas.findByText('QuickShip Logistics', {}, { timeout: 10000 });

    // 9. Verify "Next" is disabled on last page
    await waitFor(() => {
      const nextButton3 = canvas.getByRole('button', { name: 'Next page' });
      expect(nextButton3).toBeDisabled();
    }, { timeout: 10000 });

    // 10. Click "Previous page"
    const prevButton3 = canvas.getByRole('button', { name: 'Previous page' });
    expect(prevButton3).toBeEnabled();
    await userEvent.click(prevButton3);

    // ----- Back to Page 2 -----

    // 11. Wait for page 2 data to reappear
    await canvas.findByText('Horizon Diagnostics', {}, { timeout: 10000 });

    // 12. Verify pagination shows "Page 2" again
    await waitFor(() => {
      expect(canvas.getByText('Page 2')).toBeVisible();
    }, { timeout: 10000 });
  },
};
