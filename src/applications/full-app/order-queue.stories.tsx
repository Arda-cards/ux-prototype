import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import OrderQueuePage from '@frontend/app/order-queue/page';

const meta: Meta<typeof OrderQueuePage> = {
  title: 'Full App/Order Queue',
  component: OrderQueuePage,
  tags: ['app-route:/order-queue'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/order-queue',
    appComponent: 'app/order-queue/page.tsx',
  },
  args: {
    pathname: '/order-queue',
  },
};

export default meta;
type Story = StoryObj<typeof OrderQueuePage>;

/**
 * Default Order Queue view.
 * Exercises UC-ORD-006: View order details.
 * Play function verifies the order queue page renders.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // UC-ORD-006: Verify the order queue page renders
    const heading = await canvas.findByText(/Order Queue/i, {}, { timeout: 10000 });
    await expect(heading).toBeVisible();
  },
};

/**
 * Empty queue — API returns no orders.
 */
export const EmptyQueue: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/arda/kanban-cards', () =>
          HttpResponse.json({ results: [], total: 0, pageToken: null }),
        ),
      ],
    },
  },
};
