/**
 * BA::0001::0007 — Deep Link
 *
 * Verifies that SuppliersPage correctly handles the `initialAffiliateId` prop
 * by automatically opening the detail drawer for the specified affiliate and
 * displaying the target entity's details.
 *
 * 1 variant: Default.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor } from 'storybook/test';
import { SuppliersPage } from '../_shared/suppliers-page';
import { businessAffiliateHandlers } from '../_shared/msw-handlers';
import { mockBusinessAffiliates } from '../_shared/mock-data';

// The first affiliate alphabetically is "Apex Medical Distributors"
const firstAffiliate = mockBusinessAffiliates[0].payload;

const meta: Meta<typeof SuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/0007 Deep Link',
  component: SuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: {
      handlers: businessAffiliateHandlers,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SuppliersPage>;

/**
 * Default — renders SuppliersPage with `initialAffiliateId` set to the eId of
 * the first mock affiliate (Apex Medical Distributors). The detail drawer
 * should open automatically, showing the affiliate name and entity ID.
 */
export const Default: Story = {
  args: {
    initialAffiliateId: firstAffiliate.eId,
    pathname: `/supplier/${firstAffiliate.eId}`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for the grid to render with data
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });

    // 2. Verify the real drawer is automatically open (has role="dialog")
    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    expect(drawer).toBeVisible();

    // 3. Verify the drawer shows the correct affiliate name in its heading
    const drawerScope = within(drawer);
    expect(drawerScope.getByText('Apex Medical Distributors')).toBeVisible();

    // 4. Verify the drawer shows the affiliate's entity ID (in Identity section)
    expect(drawerScope.getByText(firstAffiliate.eId)).toBeVisible();

    // 5. Verify the drawer is scoped within canvasElement (not a portal)
    await waitFor(() => {
      expect(drawer).toBeVisible();
    }, { timeout: 10000 });
  },
};
