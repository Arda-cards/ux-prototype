/**
 * BA::0001::0005 — Select Multiple
 *
 * Tests multi-row selection via individual checkboxes and the
 * select-all header checkbox. Verifies the Actions dropdown
 * becomes enabled when rows are selected.
 *
 * 2 variants: Default, SelectAll.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SelectMultiplePage } from './select-multiple-page';
import { businessAffiliateHandlers } from '../_shared/msw-handlers';

const meta: Meta<typeof SelectMultiplePage> = {
  title: 'Use Cases/Reference/Business Affiliates/Browse and Search/Select Multiple',
  component: SelectMultiplePage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: {
      handlers: businessAffiliateHandlers,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectMultiplePage>;

/**
 * Default state — renders with full mock data.
 * Tests individual row selection and Actions dropdown enablement.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 5000 });

    // 2. Verify Actions button is disabled (no selection)
    const actionsButton = canvas.getByRole('button', { name: 'Actions' });
    expect(actionsButton).toBeDisabled();

    // 3. Click checkbox on row 1
    const checkboxes = canvas.getAllByRole('checkbox');
    // checkboxes[0] = header select-all, checkboxes[1] = row 1, checkboxes[2] = row 2, etc.
    await userEvent.click(checkboxes[1]);

    // 4. Verify row 1 is selected
    await waitFor(() => {
      expect(checkboxes[1]).toBeChecked();
    });

    // 5. Verify Actions button is enabled
    await waitFor(() => {
      expect(actionsButton).toBeEnabled();
    });

    // 6. Click checkbox on row 3
    await userEvent.click(checkboxes[3]);

    // 7. Verify both rows 1 and 3 are selected
    await waitFor(() => {
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[3]).toBeChecked();
    });

    // 8. Open the Actions dropdown
    await userEvent.click(actionsButton);

    // 9. Verify "Delete" action is available
    const deleteItem = await canvas.findByRole('menuitem', { name: /delete/i });
    expect(deleteItem).toBeVisible();
  },
};

/**
 * Select All — tests the header checkbox for select-all and deselect-all behavior.
 */
export const SelectAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to load
    await canvas.findByText('Apex Medical Distributors', {}, { timeout: 5000 });

    // 2. Click the header checkbox (select all)
    const checkboxes = canvas.getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0];
    await userEvent.click(headerCheckbox);

    // 3. Verify all visible row checkboxes are checked (page size 10 = 10 data rows)
    await waitFor(() => {
      // Re-query to get fresh state — AG Grid may re-render checkboxes
      const allCheckboxes = canvas.getAllByRole('checkbox');
      // allCheckboxes[0] = header, allCheckboxes[1..10] = data rows
      for (let i = 1; i < allCheckboxes.length; i++) {
        expect(allCheckboxes[i]).toBeChecked();
      }
    });

    // 4. Verify header checkbox is checked (not indeterminate)
    await waitFor(() => {
      const allCheckboxes = canvas.getAllByRole('checkbox');
      expect(allCheckboxes[0]).toBeChecked();
    });

    // 5. Click the header checkbox again (deselect all)
    const freshCheckboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(freshCheckboxes[0]);

    // 6. Verify all visible row checkboxes are unchecked
    await waitFor(() => {
      const allCheckboxes = canvas.getAllByRole('checkbox');
      for (let i = 1; i < allCheckboxes.length; i++) {
        expect(allCheckboxes[i]).not.toBeChecked();
      }
    });
  },
};
