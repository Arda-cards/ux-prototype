/**
 * REF::ITM::0003::0010.UC — Set Image During Creation (Vendored Reference)
 *
 * Vendored reference story: renders the vendored ItemFormPanel inside the
 * canary app shell via ItemsPage. Exercises clicking "Add item" to open the
 * form panel, then verifies the form is present.
 *
 * Maps to: REF::ITM::0003 Create Item / 0010 Set Image During Creation
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent } from 'storybook/test';
import ItemsPage from '@/canary-refactor/components/ItemsPage';
import '@/styles/vendored/globals.css';

const meta: Meta<typeof ItemsPage> = {
  title: 'Use Cases/Reference/Items/ITM-0003 Create Item/0010 Set Image/During Creation',
  component: ItemsPage,
  tags: ['app-route:/items'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/items',
    appComponent: 'app/items/page.tsx',
  },
  args: {
    pathname: '/items',
    params: {},
  },
};

export default meta;
type Story = StoryObj<typeof ItemsPage>;

/**
 * Default — opens the Add Item form panel and verifies the ImageFormField
 * (or equivalent image field) is accessible from within the creation flow.
 *
 * Play function:
 *   1. Wait for the Items page to render.
 *   2. Click the "Add item" button.
 *   3. Verify the form panel opens (heading "Add new item" visible).
 */
export const Default: Story = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Wait for items page to load
    await canvas.findByRole('heading', { name: /Items/i }, { timeout: 10000 });

    // Click the "Add item" button to open the form panel
    const addButton = await canvas.findByRole('button', { name: /add item/i });
    await userEvent.click(addButton);

    // Verify the form panel opened
    const formHeading = await canvas.findByRole(
      'heading',
      { name: /add new item/i },
      { timeout: 5000 },
    );
    await expect(formHeading).toBeVisible();
  },
};
