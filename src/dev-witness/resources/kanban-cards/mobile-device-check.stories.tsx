import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import MobileDeviceCheckPage from '@frontend/app/mobile-device-check/page';
import '@/styles/vendored/globals.css';

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

    // Verify both device option cards are rendered.
    // Use exact match to avoid ambiguity: the card also has a subtitle "Use this path if user is on mobile device".
    const mobileOption = await canvas.findByText('Is mobile device', { exact: true }, { timeout: 10000 });
    await expect(mobileOption).toBeVisible();

    // Use exact match to avoid ambiguity: the card also has a subtitle "If user is on a desktop browser".
    const desktopOption = await canvas.findByText('Is desktop browser', { exact: true });
    await expect(desktopOption).toBeVisible();
  },
};
