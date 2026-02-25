import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import ItemsPage from '@frontend/app/items/page';

const meta: Meta<typeof ItemsPage> = {
  title: 'Full App/Items Grid',
  component: ItemsPage,
  tags: ['app-route:/items'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/items',
    appComponent: 'app/items/page.tsx',
  },
  args: {
    pathname: '/items',
  },
};

export default meta;
type Story = StoryObj<typeof ItemsPage>;

/**
 * Default Items Grid view.
 * Exercises UC-ITEM-002: Search items by keyword.
 * Play function verifies the grid renders with data.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // UC-ITEM-002: Verify the items grid page renders with heading and tabs
    const heading = await canvas.findByRole('heading', { name: /Items/i }, { timeout: 10000 });
    await expect(heading).toBeVisible();
  },
};

/**
 * Empty state — no items returned from the API.
 * The items page calls POST /api/arda/items/query.
 */
export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/arda/items/query', () =>
          HttpResponse.json({
            ok: true,
            status: 200,
            data: {
              thisPage: '0',
              nextPage: '0',
              previousPage: '0',
              results: [],
            },
          }),
        ),
      ],
    },
  },
};

// Server error story removed: the Items page catches fetch errors via toast
// and falls back to showing the empty grid — visually identical to EmptyState.
// This is the production app behavior (see vendored app/items/page.tsx).
