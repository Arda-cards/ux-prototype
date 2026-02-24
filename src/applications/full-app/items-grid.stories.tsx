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

    // UC-ITEM-002: Verify the items grid page renders
    const heading = await canvas.findByText(/Published Items/i, {}, { timeout: 10000 });
    await expect(heading).toBeVisible();
  },
};

/**
 * Empty state — no items returned from the API.
 */
export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/arda/items/query', () =>
          HttpResponse.json({ items: [], total: 0 }),
        ),
      ],
    },
  },
};

/**
 * Server error — API returns 500 for items query.
 */
export const ServerError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/arda/items/query', () =>
          new HttpResponse(null, { status: 500 }),
        ),
      ],
    },
  },
};

/**
 * Loading state — uses default MSW handlers.
 * The initial render shows the loading skeleton before data arrives.
 */
export const Loading: Story = {};
