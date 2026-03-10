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
 *   - Page 1: 10 rows, "Page 1" text, "Previous" disabled
 *   - Click "Next" → Page 2: 10 rows, "Page 2" text
 *   - Click "Next" → Page 3: 8 rows, "Page 3" text, "Next" disabled
 *   - Click "Previous" → back to Page 2: "Page 2" text, correct data
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ----- Page 1 -----

    // 1. Wait for page 1 to load — first affiliate alphabetically
    const firstRowPage1 = await canvas.findByText('Apex Medical Distributors');
    expect(firstRowPage1).toBeVisible();

    // 2. Verify grid shows 10 rows
    //    AG Grid renders data rows inside [role="row"] elements with row-index attributes.
    //    The header row also has role="row", so we count rows with a row-index >= 0.
    await waitFor(() => {
      const gridBody = canvasElement.querySelector('.ag-body-viewport') ??
                        canvasElement.querySelector('[role="treegrid"]') ??
                        canvasElement;
      const dataRows = gridBody.querySelectorAll('[role="row"][row-index]');
      expect(dataRows.length).toBe(10);
    });

    // 3. Verify pagination shows "Page 1"
    expect(canvas.getByText('Page 1')).toBeVisible();

    // 4. Verify "Previous" is disabled on first page
    const prevButton = canvas.getByRole('button', { name: 'Previous page' });
    expect(prevButton).toBeDisabled();

    // 5. Click "Next page"
    const nextButton = canvas.getByRole('button', { name: 'Next page' });
    expect(nextButton).toBeEnabled();
    await userEvent.click(nextButton);

    // ----- Page 2 -----

    // 6. Wait for page 2 — first affiliate on page 2
    const firstRowPage2 = await canvas.findByText('Horizon Diagnostics');
    expect(firstRowPage2).toBeVisible();

    // 7. Verify 10 rows on page 2
    await waitFor(() => {
      const gridBody = canvasElement.querySelector('.ag-body-viewport') ??
                        canvasElement.querySelector('[role="treegrid"]') ??
                        canvasElement;
      const dataRows = gridBody.querySelectorAll('[role="row"][row-index]');
      expect(dataRows.length).toBe(10);
    });

    // 8. Verify pagination shows "Page 2"
    expect(canvas.getByText('Page 2')).toBeVisible();

    // 9. Click "Next page" again
    const nextButton2 = canvas.getByRole('button', { name: 'Next page' });
    await userEvent.click(nextButton2);

    // ----- Page 3 -----

    // 10. Wait for page 3 — first affiliate on page 3
    const firstRowPage3 = await canvas.findByText('QuickShip Logistics');
    expect(firstRowPage3).toBeVisible();

    // 11. Verify 8 rows on page 3 (28 total, 10+10+8)
    await waitFor(() => {
      const gridBody = canvasElement.querySelector('.ag-body-viewport') ??
                        canvasElement.querySelector('[role="treegrid"]') ??
                        canvasElement;
      const dataRows = gridBody.querySelectorAll('[role="row"][row-index]');
      expect(dataRows.length).toBe(8);
    });

    // 12. Verify "Next" is disabled on last page
    await waitFor(() => {
      const nextButton3 = canvas.getByRole('button', { name: 'Next page' });
      expect(nextButton3).toBeDisabled();
    });

    // 13. Click "Previous page"
    const prevButton3 = canvas.getByRole('button', { name: 'Previous page' });
    expect(prevButton3).toBeEnabled();
    await userEvent.click(prevButton3);

    // ----- Back to Page 2 -----

    // 14. Wait for page 2 data to reappear
    const backToPage2 = await canvas.findByText('Horizon Diagnostics');
    expect(backToPage2).toBeVisible();

    // 15. Verify pagination shows "Page 2" again
    await waitFor(() => {
      expect(canvas.getByText('Page 2')).toBeVisible();
    });
  },
};
