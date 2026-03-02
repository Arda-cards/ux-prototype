import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ReceivingPage from '@frontend/app/receiving/page';

const meta: Meta<typeof ReceivingPage> = {
  title: 'Dev Witness/Receiving',
  component: ReceivingPage,
  tags: ['app-route:/receiving'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/receiving',
    appComponent: 'app/receiving/page.tsx',
  },
  args: {
    pathname: '/receiving',
  },
};

export default meta;
type Story = StoryObj<typeof ReceivingPage>;

/**
 * Default Receiving page view.
 * Exercises UC-RCV-001: View receiving list.
 *
 * TODO: Mock limitation — badge counts may be inaccurate because
 * the receiving page fetches counts from the API and mock data
 * may not reflect real totals.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // UC-RCV-001: Verify the receiving page renders its UI structure
    // TODO: Badge counts may be inaccurate with mock data
    const heading = await canvas.findByRole('heading', { name: /Receiving/i }, { timeout: 10000 });
    await expect(heading).toBeVisible();
  },
};
