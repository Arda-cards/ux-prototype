import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent } from 'storybook/test';
import DashboardPage from '@frontend/app/dashboard/page';
import '@/styles/extras/vendored-theme.css';

const meta: Meta<typeof DashboardPage> = {
  title: 'Dev Witness/Home/Dashboard',
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

/**
 * R3-22: Notification Panel interaction.
 * Clicks the notification bell and verifies the NotificationPanel slide-over opens.
 */
export const NotificationPanel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the dashboard to render
    await canvas.findByText(/Hiya,/i, {}, { timeout: 10000 });

    // The bell icon is a bare SVG with no accessible name — query by CSS class.
    const bellIcon = canvasElement.querySelector('.lucide-bell') as HTMLElement;
    await userEvent.click(bellIcon);

    // Verify the notification panel opens (h2 heading rendered by NotificationPanel)
    const panelHeading = await canvas.findByRole('heading', { name: /notifications/i }, { timeout: 5000 });
    await expect(panelHeading).toBeVisible();
  },
};

/**
 * R3-23: Help Panel interaction.
 * Clicks the help icon and verifies the HelpPanel slide-over opens.
 */
export const HelpPanel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the dashboard to render
    await canvas.findByText(/Hiya,/i, {}, { timeout: 10000 });

    // The help icon is a bare SVG with no accessible name — query by CSS class.
    const helpIcon = canvasElement.querySelector('.lucide-circle-question-mark') as HTMLElement;
    await userEvent.click(helpIcon);

    // Verify the help panel opens (h2 heading "Need help?" rendered by HelpPanel)
    const helpHeading = await canvas.findByRole('heading', { name: /need help/i }, { timeout: 5000 });
    await expect(helpHeading).toBeVisible();
  },
};
