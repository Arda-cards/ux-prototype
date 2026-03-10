/**
 * BA::0002::0001 — Supplier Details Panel
 *
 * The CRITICAL UNLOCK story — builds and exercises the real SupplierDrawer
 * component in view mode. Subsequent Create, Edit, and Delete-from-Panel
 * stories all depend on this drawer component.
 *
 * 4 variants:
 *  Default       — fully-populated affiliate (Apex Medical Distributors)
 *  MinimalData   — minimal affiliate (ColdChain Direct — name + roles only)
 *  CloseDrawer   — verify X button closes the drawer
 *  SectionCollapse — verify each collapsible section can be collapsed and expanded
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, waitFor, userEvent } from 'storybook/test';
import { SuppliersPage } from '../_shared/suppliers-page';
import { businessAffiliateHandlers } from '../_shared/msw-handlers';

const meta: Meta<typeof SuppliersPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0002 View Details/0001 Supplier Details Panel',
  component: SuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: { handlers: businessAffiliateHandlers },
  },
  args: {
    pathname: '/suppliers',
  },
};

export default meta;
type Story = StoryObj<typeof SuppliersPage>;

/**
 * Default — opens the drawer for Apex Medical Distributors (first alphabetically,
 * all fields populated including full contact details, expanded legal, and notes).
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for grid to load, then click first row to open drawer.
    // Use selector '[role="gridcell"]' to target the AG Grid cell element directly,
    // avoiding ambiguous matches and ensuring the click triggers onRowClicked.
    const firstRow = await canvas.findByText(
      'Apex Medical Distributors',
      { selector: '[role="gridcell"]' },
      { timeout: 10000 },
    );
    await userEvent.click(firstRow);

    // 1. Verify the drawer is open (has role="dialog")
    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    expect(drawer).toBeVisible();

    const drawerScope = within(drawer);

    // 2. Verify the drawer header shows the affiliate name and Building2 icon.
    // Use findByRole('heading') to target the <h2> specifically — the drawer also
    // renders the affiliate name in a ReadOnlyField <p>, so findByText would match
    // multiple elements and throw "Found multiple elements".
    expect(
      await drawerScope.findByRole('heading', { name: 'Apex Medical Distributors' }, { timeout: 10000 }),
    ).toBeVisible();
    const header = drawer.querySelector('[data-slot="drawer-header"]');
    expect(header).toBeTruthy();
    expect(header!.querySelector('svg')).toBeTruthy();

    // 3. Verify close button (X) is present
    expect(drawerScope.getByRole('button', { name: /close drawer/i })).toBeVisible();

    // 4. Identity section (expanded by default)
    expect(drawerScope.getByText('Identity')).toBeVisible();
    // eId is displayed as a UUID-format string
    const eIdField = drawerScope.getByText(/^[0-9a-f]{8}-/i);
    expect(eIdField).toBeVisible();

    // 5. Contact section (expanded because data exists)
    expect(drawerScope.getByText('Contact')).toBeVisible();
    expect(drawerScope.getByText('Dr. Maria Santos')).toBeVisible();
    expect(drawerScope.getByText('msantos@apexmedical.com')).toBeVisible();
    expect(drawerScope.getByText('(555) 123-4567')).toBeVisible();

    // 6. Address section
    expect(drawerScope.getByText('Address')).toBeVisible();
    expect(drawerScope.getByText('10 Summit Rd')).toBeVisible();
    expect(drawerScope.getByText('Denver')).toBeVisible();
    expect(drawerScope.getByText('CO')).toBeVisible();
    expect(drawerScope.getByText('80201')).toBeVisible();
    expect(drawerScope.getByText('United States')).toBeVisible();

    // 7. Legal section
    expect(drawerScope.getByText('Legal')).toBeVisible();
    expect(drawerScope.getByText('Apex Medical Distributors Inc.')).toBeVisible();
    expect(drawerScope.getByText('11-2233445')).toBeVisible();

    // 8. Notes field (not in a collapsible, at the bottom)
    expect(drawerScope.getByText('Notes')).toBeVisible();
    expect(
      drawerScope.getByText(/Preferred vendor for surgical instruments/),
    ).toBeVisible();

    // 9. Action buttons in footer
    expect(drawerScope.getByRole('button', { name: /edit/i })).toBeVisible();
    expect(drawerScope.getByRole('button', { name: /delete/i })).toBeVisible();
  },
};

/**
 * MinimalData — opens the drawer for ColdChain Direct (minimal affiliate —
 * name and roles only, no contact, no address, no legal, no notes).
 * Verifies empty-state messages appear in each collapsed section.
 */
export const MinimalData: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ColdChain Direct sorts between CleanRoom Solutions and Delta Pharma Group
    // on page 1 (first 10 of 29 sorted A-Z).
    // Use selector '[role="gridcell"]' to target the AG Grid cell element directly.
    const row = await canvas.findByText(
      'ColdChain Direct',
      { selector: '[role="gridcell"]' },
      { timeout: 10000 },
    );
    await userEvent.click(row);

    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    const drawerScope = within(drawer);

    // 1. Identity section shows the name (Identity is always expanded)
    expect(drawerScope.getByText('Identity')).toBeVisible();
    expect(drawerScope.getAllByText('ColdChain Direct')[0]).toBeVisible();

    // 2. Contact section — collapsed (no data), click to expand
    expect(drawerScope.getByText('Contact')).toBeVisible();
    await userEvent.click(drawerScope.getByText('Contact'));
    await waitFor(() => {
      expect(drawerScope.getByText(/no contact information/i)).toBeVisible();
    }, { timeout: 10000 });

    // 3. Address section — collapsed (no data), click to expand
    expect(drawerScope.getByText('Address')).toBeVisible();
    await userEvent.click(drawerScope.getByText('Address'));
    await waitFor(() => {
      expect(drawerScope.getByText(/no address information/i)).toBeVisible();
    }, { timeout: 10000 });

    // 4. Legal section — collapsed (no data), click to expand
    expect(drawerScope.getByText('Legal')).toBeVisible();
    await userEvent.click(drawerScope.getByText('Legal'));
    await waitFor(() => {
      expect(drawerScope.getByText(/no legal information/i)).toBeVisible();
    }, { timeout: 10000 });

    // 5. Notes field — always visible, shows empty state
    expect(drawerScope.getByText('Notes')).toBeVisible();
    expect(drawerScope.getByText(/no notes/i)).toBeVisible();
  },
};

/**
 * CloseDrawer — opens the drawer, then clicks the X button to verify the
 * drawer closes and the grid becomes fully visible again.
 */
export const CloseDrawer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Open drawer by clicking first row.
    // Use selector '[role="gridcell"]' to target the AG Grid cell element directly.
    const firstRow = await canvas.findByText(
      'Apex Medical Distributors',
      { selector: '[role="gridcell"]' },
      { timeout: 10000 },
    );
    await userEvent.click(firstRow);

    // Verify drawer is open
    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    expect(drawer).toBeVisible();

    // 2. Click the close button (X)
    const closeButton = within(drawer).getByRole('button', { name: /close drawer/i });
    await userEvent.click(closeButton);

    // 3. Verify drawer is closed (not in the document)
    await waitFor(() => {
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // 4. Verify the grid is still visible
    expect(canvas.getByText('Apex Medical Distributors')).toBeVisible();
  },
};

/**
 * SectionCollapse — opens the drawer for Apex Medical Distributors (all sections
 * populated) and verifies each section can be independently collapsed and expanded.
 */
export const SectionCollapse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open drawer for fully-populated affiliate.
    // Use selector '[role="gridcell"]' to target the AG Grid cell element directly.
    const firstRow = await canvas.findByText(
      'Apex Medical Distributors',
      { selector: '[role="gridcell"]' },
      { timeout: 10000 },
    );
    await userEvent.click(firstRow);

    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    const drawerScope = within(drawer);

    // Verify all section headers are visible
    expect(drawerScope.getByText('Identity')).toBeVisible();
    expect(drawerScope.getByText('Contact')).toBeVisible();
    expect(drawerScope.getByText('Address')).toBeVisible();
    expect(drawerScope.getByText('Legal')).toBeVisible();

    // --- Identity section: collapse then expand ---
    await userEvent.click(drawerScope.getByText('Identity'));
    await waitFor(() => {
      // Radix Collapsible removes children from DOM when closed (children: isOpen && children)
      expect(drawerScope.queryByText(/^[0-9a-f]{8}-/i)).not.toBeInTheDocument();
    }, { timeout: 10000 });

    await userEvent.click(drawerScope.getByText('Identity'));
    await waitFor(() => {
      expect(drawerScope.getByText(/^[0-9a-f]{8}-/i)).toBeVisible();
    }, { timeout: 10000 });

    // --- Contact section: collapse then expand ---
    await userEvent.click(drawerScope.getByText('Contact'));
    await waitFor(() => {
      expect(drawerScope.queryByText('msantos@apexmedical.com')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    await userEvent.click(drawerScope.getByText('Contact'));
    await waitFor(() => {
      expect(drawerScope.getByText('msantos@apexmedical.com')).toBeVisible();
    }, { timeout: 10000 });

    // --- Address section: collapse then expand ---
    await userEvent.click(drawerScope.getByText('Address'));
    await waitFor(() => {
      expect(drawerScope.queryByText('10 Summit Rd')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    await userEvent.click(drawerScope.getByText('Address'));
    await waitFor(() => {
      expect(drawerScope.getByText('10 Summit Rd')).toBeVisible();
    }, { timeout: 10000 });

    // --- Legal section: collapse then expand ---
    await userEvent.click(drawerScope.getByText('Legal'));
    await waitFor(() => {
      expect(drawerScope.queryByText('11-2233445')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    await userEvent.click(drawerScope.getByText('Legal'));
    await waitFor(() => {
      expect(drawerScope.getByText('11-2233445')).toBeVisible();
    }, { timeout: 10000 });
  },
};
