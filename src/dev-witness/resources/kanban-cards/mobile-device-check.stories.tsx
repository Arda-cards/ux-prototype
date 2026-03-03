import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import MobileDeviceCheckPage from '@frontend/app/mobile-device-check/page';
import '@/styles/extras/vendored-theme.css';

const meta: Meta<typeof MobileDeviceCheckPage> = {
  title: 'Dev Witness/Resources/Kanban Cards/Mobile Device Check',
  component: MobileDeviceCheckPage,
  tags: ['app-route:/mobile-device-check'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/mobile-device-check',
    appComponent: 'app/mobile-device-check/page.tsx',
  },
  args: {
    pathname: '/mobile-device-check',
  },
};

export default meta;
type Story = StoryObj<typeof MobileDeviceCheckPage>;

/**
 * UC-SCAN-002: Mobile device check page.
 * Renders two option cards: "Is mobile device" and "Is desktop browser".
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify both device option cards are rendered
    const mobileOption = await canvas.findByText(/mobile device/i, {}, { timeout: 10000 });
    await expect(mobileOption).toBeVisible();

    const desktopOption = await canvas.findByText(/desktop/i);
    await expect(desktopOption).toBeVisible();
  },
};
