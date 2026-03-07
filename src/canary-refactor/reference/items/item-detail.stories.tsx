import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ItemDetailPage from '../../components/ItemDetailPage';

const meta: Meta<typeof ItemDetailPage> = {
  title: 'App/Migration/Reference/Items/Item Detail',
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
 * App Migration: Item Detail view with ArdaDetailField replacing inline blocks.
 * Exercises UC-ITEM-003: View item detail panel.
 *
 * Intentional deviations from App Baseline (vendored):
 * - Label color: `text-[#737373]` -> `text-muted-foreground` (design token)
 * - Value color: `text-[#0a0a0a]` -> `text-foreground` (design token)
 * - "Number of cards" value: `text-sm` -> `text-base` (consistent with other values)
 * - Link fallback: muted/normal -> foreground/semibold (consistent with other fallbacks)
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // UC-ITEM-003: Verify the items page renders (detail panel opens based on URL)
    const heading = await canvas.findByRole('heading', { name: /Items/i }, { timeout: 10000 });
    await expect(heading).toBeVisible();
  },
};
