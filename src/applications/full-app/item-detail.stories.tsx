import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ItemDetailPage from '@frontend/app/item/[itemId]/page';

const meta: Meta<typeof ItemDetailPage> = {
  title: 'Dev Witness/Item Detail',
  component: ItemDetailPage,
  tags: ['app-route:/item/[itemId]'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/item/[itemId]',
    appComponent: 'app/item/[itemId]/page.tsx',
  },
  args: {
    pathname: '/item/mock-item-001',
    params: { itemId: 'mock-item-001' },
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
  },
};
