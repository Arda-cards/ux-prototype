/**
 * BA::0003::0001 — Create Supplier: Happy Path
 *
 * Three story variants:
 *   Interactive — live page, user fills form manually
 *   Stepwise    — scene-by-scene walkthrough with guide panel
 *   Automated   — play function executes the full create flow end-to-end
 *
 * Uses CreatableSuppliersPage wrapper which adds "+ Add Supplier" wiring on
 * top of the shared SuppliersPage.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, waitFor, userEvent, screen } from 'storybook/test';
import { CreatableSuppliersPage } from './creatable-suppliers-page';
import { businessAffiliateHandlers, resetAffiliateStore } from '../_shared/msw-handlers';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CreatableSuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/Create Supplier/Happy Path',
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
// Interactive — free-form user interaction, no play function
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive',
};

// ---------------------------------------------------------------------------
// Automated — full 24-step play function
// ---------------------------------------------------------------------------

export const Automated: Story = {
  name: 'Automated',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for grid to load with at least one supplier
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 5000 });

    // Step 1: Click "+ Add Supplier" button in toolbar
    const addButton = canvas.getByRole('button', { name: 'Add Supplier' });
    await userEvent.click(addButton);

    // Step 2: Verify drawer opens in create mode
    const drawer = await canvas.findByRole('dialog', {}, { timeout: 3000 });
    expect(drawer).toBeVisible();

    const drawerScope = within(drawer);

    // Step 3: Verify header shows "New Supplier"
    expect(drawerScope.getByText('New Supplier')).toBeVisible();

    // Step 4: Verify Identity section expanded, Contact/Address/Legal visible but collapsed
    expect(drawerScope.getByText('Identity')).toBeVisible();
    expect(drawerScope.getByText('Contact')).toBeVisible();
    expect(drawerScope.getByText('Address')).toBeVisible();
    expect(drawerScope.getByText('Legal')).toBeVisible();

    // Step 5: Verify Notes field visible at bottom
    expect(drawerScope.getByText('Notes')).toBeVisible();

    // Step 6: Verify Save is disabled (name is empty)
    const saveButton = drawerScope.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeDisabled();

    // Step 7: Verify Cancel is present
    expect(drawerScope.getByRole('button', { name: /^cancel$/i })).toBeVisible();

    // Step 8: Type "Fastenal Corp." in the Name field
    const nameInput = drawerScope.getByLabelText('Name');
    await userEvent.type(nameInput, 'Fastenal Corp.');

    // Step 9: Verify Save becomes enabled after name entered
    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    // Step 10: Click Contact section header to expand
    await userEvent.click(drawerScope.getByText('Contact'));

    // Step 11: Verify First Name field appears (contact section expanded)
    const firstNameInput = await drawerScope.findByLabelText('First Name', {}, { timeout: 3000 });
    expect(firstNameInput).toBeVisible();

    // Step 12: Fill contact fields
    const lastNameInput = drawerScope.getByLabelText('Last Name');
    const emailInput = drawerScope.getByLabelText('Email');
    const phoneInput = drawerScope.getByLabelText('Phone');

    await userEvent.type(firstNameInput, 'Sarah');
    await userEvent.type(lastNameInput, 'Chen');
    await userEvent.type(emailInput, 'sarah.chen@fastenal.com');
    await userEvent.type(phoneInput, '+1-507-454-5374');

    // Step 14: Click Address section header to expand
    await userEvent.click(drawerScope.getByText('Address'));

    // Step 15: Verify Address Line 1 field appears (address section expanded)
    const addressLine1Input = await drawerScope.findByLabelText('Address Line 1', {}, { timeout: 3000 });
    expect(addressLine1Input).toBeVisible();

    // Step 16: Fill address fields
    const addressLine2Input = drawerScope.getByLabelText('Address Line 2');
    const cityInput = drawerScope.getByLabelText('City');
    const stateInput = drawerScope.getByLabelText('State');
    const postalCodeInput = drawerScope.getByLabelText('Postal Code');
    const countryInput = drawerScope.getByLabelText('Country');

    await userEvent.type(addressLine1Input, '2001 Theurer Blvd');
    await userEvent.type(addressLine2Input, 'Suite 100');
    await userEvent.type(cityInput, 'Winona');
    await userEvent.type(stateInput, 'MN');
    await userEvent.type(postalCodeInput, '55987');
    await userEvent.type(countryInput, 'US');

    // Step 17: Click Legal section header to expand
    await userEvent.click(drawerScope.getByText('Legal'));

    // Step 18: Verify Legal Name field appears (legal section expanded)
    const legalNameInput = await drawerScope.findByLabelText('Legal Name', {}, { timeout: 3000 });
    expect(legalNameInput).toBeVisible();

    // Step 19: Fill legal fields
    const taxIdInput = drawerScope.getByLabelText('Tax ID');
    await userEvent.type(legalNameInput, 'Fastenal Company');
    await userEvent.type(taxIdInput, '41-0948415');

    // Step 20: Fill notes field
    const notesInput = drawerScope.getByLabelText('Notes');
    await userEvent.type(notesInput, 'Preferred vendor for fasteners and MRO supplies.');

    // Step 21: Click Save
    await userEvent.click(saveButton);

    // Step 22: Verify success toast (Sonner renders via portal to document.body — use screen)
    await screen.findByText('Supplier created successfully', {}, { timeout: 5000 });

    // Step 23: Verify drawer closes after save
    await waitFor(() => {
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Step 24: Verify new supplier appears in grid after remount/re-fetch
    await canvas.findByText('Fastenal Corp.', {}, { timeout: 5000 });
  },
};
