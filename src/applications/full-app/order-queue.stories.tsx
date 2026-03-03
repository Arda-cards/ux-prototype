import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import OrderQueuePage from '@frontend/app/order-queue/page';

const meta: Meta<typeof OrderQueuePage> = {
  title: 'Dev Witness/Order Queue',
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

    // UC-ORD-006: Verify the order queue page renders with heading
    const heading = await canvas.findByRole(
      'heading',
      { name: /Order Queue/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();
  },
};

/**
 * Empty queue — no kanban cards in any status bucket.
 * The Order Queue page fetches cards from three POST endpoints:
 * - /api/arda/kanban/kanban-card/details/requested
 * - /api/arda/kanban/kanban-card/details/in-process
 * - /api/arda/kanban/kanban-card/details/requesting
 */
export const EmptyQueue: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/arda/kanban/kanban-card/details/requested', () =>
          HttpResponse.json({
            ok: true,
            status: 200,
            data: { thisPage: '0', nextPage: '0', previousPage: '0', results: [] },
          }),
        ),
        http.post('/api/arda/kanban/kanban-card/details/in-process', () =>
          HttpResponse.json({
            ok: true,
            status: 200,
            data: { thisPage: '0', nextPage: '0', previousPage: '0', results: [] },
          }),
        ),
        http.post('/api/arda/kanban/kanban-card/details/requesting', () =>
          HttpResponse.json({
            ok: true,
            status: 200,
            data: { thisPage: '0', nextPage: '0', previousPage: '0', results: [] },
          }),
        ),
      ],
    },
  },
};
