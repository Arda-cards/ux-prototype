import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ScanPage from '@frontend/app/scan/page';

const meta: Meta<typeof ScanPage> = {
  title: 'Dev Witness/Scan',
  component: ScanPage,
  tags: ['app-route:/scan'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/scan',
    appComponent: 'app/scan/page.tsx',
  },
  args: {
    pathname: '/scan',
  },
};

export default meta;
type Story = StoryObj<typeof ScanPage>;

/**
 * UC-NEW-016: Scan page UI renders.
 * Verifies the scan page renders with camera prompt UI elements.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The scan page renders DesktopScanView (desktop viewport in Storybook).
    // Verify the scan UI renders with its characteristic elements.
    const scanLabel = await canvas.findByText(/Scan cards/i, {}, { timeout: 10000 });
    await expect(scanLabel).toBeVisible();
  },
};
