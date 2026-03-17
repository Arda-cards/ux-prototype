/**
 * Story: BA::0001::0003 — Toggle Column Visibility
 *
 * Tests the deferred-commit column visibility dropdown: open the panel,
 * toggle columns, and verify Save/Cancel semantics and grid column rendering.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor, userEvent } from 'storybook/test';
import { businessAffiliateHandlers } from '../_shared/msw-handlers';
import { ToggleColumnsSuppliersPage } from './toggle-columns-page';
import { storyStepDelay } from '../_shared/story-step-delay';

const meta: Meta<typeof ToggleColumnsSuppliersPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/0003 Toggle Column Visibility',
  component: ToggleColumnsSuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: {
      handlers: businessAffiliateHandlers,
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleColumnsSuppliersPage>;

// ---------------------------------------------------------------------------
// Helper: query AG Grid column header by colId using DOM selector.
// AG Grid renders column headers with [col-id="<colId>"] on the header cell.
// The SortMenuHeader component adds a sort button (⋮) inside each header,
// so getByRole('columnheader', { name: 'Name' }) fails because the accessible
// name includes both the column text and the sort-button text.
// ---------------------------------------------------------------------------
function getColumnHeader(canvasElement: HTMLElement, colId: string): HTMLElement | null {
  return canvasElement.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`);
}

// ---------------------------------------------------------------------------
// Default — open dropdown, uncheck Phone, save, verify Phone hidden
// ---------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });

    // 2. Verify all default column headers are visible using DOM selectors
    //    (avoids accessible-name conflicts from the SortMenuHeader sort button)
    await waitFor(
      () => {
        expect(getColumnHeader(canvasElement, 'name')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'contact')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'phone')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'city')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'state')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'roles')).toBeTruthy();
      },
      { timeout: 10000 },
    );

    await storyStepDelay();

    // 3. Click the "View" dropdown button
    const viewButton = canvas.getByRole('button', {
      name: /toggle column visibility/i,
    });
    await userEvent.click(viewButton);

    // 4. Verify checkbox panel opens — find checkboxes by their label text
    await waitFor(
      () => {
        expect(canvas.getByLabelText('Name')).toBeInTheDocument();
        expect(canvas.getByLabelText('Contact')).toBeInTheDocument();
        expect(canvas.getByLabelText('Phone')).toBeInTheDocument();
        expect(canvas.getByLabelText('City')).toBeInTheDocument();
        expect(canvas.getByLabelText('State')).toBeInTheDocument();
        expect(canvas.getByLabelText('Roles')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // 5. Verify "Show All" and "Hide All" buttons
    expect(canvas.getByRole('button', { name: 'Show All' })).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Hide All' })).toBeVisible();

    // 6. Verify "Save" and "Cancel" buttons
    expect(canvas.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Cancel' })).toBeVisible();

    await storyStepDelay();

    // 7. Uncheck the "Phone" column checkbox
    const phoneCheckbox = canvas.getByLabelText('Phone');
    await userEvent.click(phoneCheckbox);
    expect(phoneCheckbox).not.toBeChecked();

    // 8. Click "Save"
    const saveButton = canvas.getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);

    // 9. Verify "Phone" column header is no longer visible
    await waitFor(
      () => {
        expect(getColumnHeader(canvasElement, 'phone')).toBeFalsy();
      },
      { timeout: 10000 },
    );

    // 10. Verify all other columns remain visible
    expect(getColumnHeader(canvasElement, 'name')).toBeTruthy();
    expect(getColumnHeader(canvasElement, 'contact')).toBeTruthy();
    expect(getColumnHeader(canvasElement, 'city')).toBeTruthy();
    expect(getColumnHeader(canvasElement, 'state')).toBeTruthy();
    expect(getColumnHeader(canvasElement, 'roles')).toBeTruthy();
  },
};

// ---------------------------------------------------------------------------
// HideAll — open dropdown, click Hide All, save, verify only Name remains
// ---------------------------------------------------------------------------

export const HideAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 10000 });

    await storyStepDelay();

    // 2. Click the "View" dropdown button
    const viewButton = canvas.getByRole('button', {
      name: /toggle column visibility/i,
    });
    await userEvent.click(viewButton);

    // 3. Click "Hide All"
    await waitFor(
      () => {
        expect(canvas.getByRole('button', { name: 'Hide All' })).toBeVisible();
      },
      { timeout: 10000 },
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Hide All' }));

    await storyStepDelay();

    // 4. Click "Save"
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));

    // 5. Verify only Name column header remains (checkbox column has no headerName)
    await waitFor(
      () => {
        expect(getColumnHeader(canvasElement, 'name')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'contact')).toBeFalsy();
        expect(getColumnHeader(canvasElement, 'phone')).toBeFalsy();
        expect(getColumnHeader(canvasElement, 'city')).toBeFalsy();
        expect(getColumnHeader(canvasElement, 'state')).toBeFalsy();
        expect(getColumnHeader(canvasElement, 'roles')).toBeFalsy();
      },
      { timeout: 10000 },
    );
  },
};
