import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import DashboardPage from '@frontend/app/dashboard/page';

const meta: Meta<typeof DashboardPage> = {
  title: 'Full App/Dashboard',
  component: DashboardPage,
  tags: ['app-route:/dashboard'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/dashboard',
    appComponent: 'app/dashboard/page.tsx',
  },
  args: {
    pathname: '/dashboard',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardPage>;

/**
 * Default Dashboard view with mock authenticated user.
 * Exercises UC-DASH-001: Dashboard renders with welcome message,
 * summary cards, orders table, and getting-started panel.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // UC-DASH-001: Verify the welcome greeting is visible
    const greeting = await canvas.findByText(/Hiya,/i, {}, { timeout: 10000 });
    await expect(greeting).toBeVisible();

    // Verify summary cards are present
    const totalOrders = await canvas.findByText('Total Orders');
    await expect(totalOrders).toBeVisible();

    const ordersPlaced = await canvas.findByText('Orders placed');
    await expect(ordersPlaced).toBeVisible();

    // Verify the orders table is rendered
    const ordersHeading = await canvas.findByText('Orders');
    await expect(ordersHeading).toBeVisible();

    // Verify at least one order row is visible (multiple items match, use getAllByText)
    const steelItems = canvas.getAllByText(/Stainless Steel/i);
    await expect(steelItems.length).toBeGreaterThan(0);

    // Verify the "Get started" panel
    const getStarted = await canvas.findByText('Get started with Arda');
    await expect(getStarted).toBeVisible();
  },
};
