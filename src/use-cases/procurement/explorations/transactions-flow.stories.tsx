import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import TransactionsFlow from '@/canary-refactor/components/TransactionsFlow';
import '@/styles/vendored/globals.css';

const meta: Meta<typeof TransactionsFlow> = {
  title: 'Use Cases/Procurement/Explorations/Transactions Flow 01',
  parameters: {
    fullAppProviders: true,
    layout: 'fullscreen',
  },
  component: TransactionsFlow,
};

export default meta;
type Story = StoryObj<typeof TransactionsFlow>;

/**
 * Start on the Items page.
 * Click "Order Queue" or "Receiving" in the sidebar to navigate.
 */
export const StartAtItems: Story = {
  args: {
    startingPage: '/items',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = await canvas.findByRole(
      'heading',
      { name: /Items/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();
  },
};
