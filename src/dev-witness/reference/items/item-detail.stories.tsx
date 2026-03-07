import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent } from 'storybook/test';
import ItemDetailPage from '@frontend/app/item/[itemId]/page';
import '@/styles/vendored/globals.css';

const meta: Meta<typeof ItemDetailPage> = {
  title: 'App/Current/Reference/Items/Item Detail',
  component: ItemDetailPage,
  tags: ['app-route:/item/[itemId]'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/item/[itemId]',
    appComponent: 'app/item/[itemId]/page.tsx',
  },
  args: {
    pathname: '/item/item-001',
    params: { itemId: 'item-001' },
  },
};

export default meta;
type Story = StoryObj<typeof ItemDetailPage>;

/**
 * Default Item Detail view.
 * Exercises UC-ITEM-003: View item detail panel.
 * The ItemDetailPage renders ItemsPage which auto-detects the itemId
 * from the pathname and opens the details panel.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // UC-ITEM-003: Verify the items page renders (detail panel opens based on URL)
    const heading = await canvas.findByRole('heading', { name: /Items/i }, { timeout: 10000 });
    await expect(heading).toBeVisible();

    // R3-24: Verify the ItemDetailsPanel actually rendered with item content
    const itemName = await canvas.findByText(/Surgical Gloves/i, {}, { timeout: 10000 });
    await expect(itemName).toBeVisible();
  },
};

/**
 * R3-25: Item Add/Edit form.
 * Clicks the "Add item" button and verifies ItemFormPanel opens with form fields.
 */
export const AddItemForm: Story = {
  args: {
    pathname: '/items',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the items page to render
    await canvas.findByRole('heading', { name: /Items/i }, { timeout: 10000 });

    // Click the "Add item" button to open the form panel
    const addButton = await canvas.findByRole('button', { name: /add item/i });
    await userEvent.click(addButton);

    // Verify the form panel opened (ItemFormPanel heading)
    const formHeading = await canvas.findByRole('heading', { name: /add new item/i }, { timeout: 5000 });
    await expect(formHeading).toBeVisible();
  },
};
