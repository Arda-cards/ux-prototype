import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import KanbanCardPage from '@frontend/app/kanban/cards/[cardId]/page';

const meta: Meta<typeof KanbanCardPage> = {
  title: 'Full App/Kanban Card',
  component: KanbanCardPage,
  tags: ['app-route:/kanban/cards/[cardId]'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/kanban/cards/[cardId]',
    appComponent: 'app/kanban/cards/[cardId]/page.tsx',
  },
  args: {
    // card-1 is the first card in mock data (AVAILABLE status, linked to item-001)
    pathname: '/kanban/cards/card-1',
    params: { cardId: 'card-1' },
  },
};

export default meta;
type Story = StoryObj<typeof KanbanCardPage>;

/**
 * Kanban Card detail page — QR scan view (DesktopScanView).
 * Exercises UC-NEW-001: Render card detail page.
 *
 * Uses card-1 from mock data (AVAILABLE status, linked to item "Surgical Gloves").
 * The `searchParams: { view: 'card', src: 'qr' }` activates the rich
 * DesktopScanView which includes the item image, card details, and actions.
 * Without these params the page shows a plain-text summary without images.
 */
export const Default: Story = {
  args: {
    pathname: '/kanban/cards/card-1',
    params: { cardId: 'card-1' },
    searchParams: { view: 'card', src: 'qr' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // UC-NEW-001: Verify the scan view renders with card content.
    // DesktopScanView displays the card details including the item name.
    const element = await canvas.findByText(/Surgical Gloves/i, {}, { timeout: 10000 });
    await expect(element).toBeVisible();
  },
};

/**
 * Card not found — when the card ID doesn't exist in the system.
 * Uses a non-existent card ID to trigger the 404 error page.
 */
export const CardNotFound: Story = {
  args: {
    pathname: '/kanban/cards/non-existent-card',
    params: { cardId: 'non-existent-card' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const heading = await canvas.findByRole('heading', { name: /Card Not Found/i }, { timeout: 10000 });
    await expect(heading).toBeVisible();
  },
};
