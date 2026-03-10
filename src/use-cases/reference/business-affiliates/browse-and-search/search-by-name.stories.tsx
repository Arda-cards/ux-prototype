/**
 * BA::0001::0002 — Search by Name
 *
 * Tests the search input with debounced filtering.
 * Two variants: Default (search and clear), NoResults (empty state on no match).
 *
 * No new shared infrastructure — uses existing SuppliersPage and MSW query handler.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor, userEvent } from 'storybook/test';
import { SuppliersPage } from '../_shared/suppliers-page';
import { businessAffiliateHandlers } from '../_shared/msw-handlers';

const meta: Meta<typeof SuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/Browse and Search/Search by Name',
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
 * Default — types "Med" into the search input, verifies filtered results,
 * then clears the input and verifies the full list restores.
 *
 * Affiliates whose names contain "Med" (case-insensitive, 9 total):
 *   Apex Medical Distributors, Frontier Biomedical, GlobalMed,
 *   Keystone Medical Group, Medical Essentials, MedSupply Co.,
 *   National Freight Medical, Riverside Medical Equipment, SupplyChain Medical
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    // 1. Wait for initial grid load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 5000 });

    // 2. Locate search input
    const searchInput = canvas.getByPlaceholderText('Search suppliers...');
    expect(searchInput).toBeVisible();

    // 3. Type "Med" into the search input
    await user.type(searchInput, 'Med');

    // 4. Wait for debounce + verify filtered results
    await waitFor(
      () => {
        expect(canvas.getByText('MedSupply Co.')).toBeVisible();
        expect(canvas.queryByText('BioTech Instruments')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // 5. Verify additional matching affiliates are visible
    expect(canvas.getByText('Medical Essentials')).toBeVisible();
    expect(canvas.getByText('National Freight Medical')).toBeVisible();

    // 6. Clear the search input
    await user.clear(searchInput);

    // 7. Wait for debounce + verify full list restores (first page)
    await waitFor(
      () => {
        expect(canvas.getByText('Apex Medical Distributors')).toBeVisible();
        expect(canvas.getByText('BioTech Instruments')).toBeVisible();
      },
      { timeout: 3000 },
    );
  },
};

/**
 * NoResults — types a term that matches no affiliates and verifies the
 * empty state ("No suppliers yet") is displayed.
 */
export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    // 1. Wait for initial grid load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 5000 });

    // 2. Type a non-matching search term
    const searchInput = canvas.getByPlaceholderText('Search suppliers...');
    await user.type(searchInput, 'ZZZZZ');

    // 3. Wait for debounce + verify empty state
    await waitFor(
      () => {
        expect(canvas.getByText(/no suppliers yet/i)).toBeVisible();
      },
      { timeout: 3000 },
    );

    // 4. Verify no data rows are visible
    expect(canvas.queryByText('Apex Medical Distributors')).not.toBeInTheDocument();
    expect(canvas.queryByText('MedSupply Co.')).not.toBeInTheDocument();
  },
};
