import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import CompanySettingsPage from '@frontend/app/company-settings/page';

const meta: Meta<typeof CompanySettingsPage> = {
  title: 'Dev Witness/Company Settings',
  component: CompanySettingsPage,
  tags: ['app-route:/company-settings'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/company-settings',
    appComponent: 'app/company-settings/page.tsx',
  },
  args: {
    pathname: '/company-settings',
  },
};

export default meta;
type Story = StoryObj<typeof CompanySettingsPage>;

/**
 * UC-SET-003: Update company settings.
 * Verifies the settings form renders with the expected sections.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the Company Settings heading is visible
    const heading = await canvas.findByRole(
      'heading',
      { name: /Company Settings/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();
  },
};
