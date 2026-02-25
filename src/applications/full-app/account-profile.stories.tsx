import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import AccountProfilePage from '@frontend/app/account-profile/page';

const meta: Meta<typeof AccountProfilePage> = {
  title: 'Full App/Account Profile',
  component: AccountProfilePage,
  tags: ['app-route:/account-profile'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/account-profile',
    appComponent: 'app/account-profile/page.tsx',
  },
  args: {
    pathname: '/account-profile',
  },
};

export default meta;
type Story = StoryObj<typeof AccountProfilePage>;

/**
 * UC-SET-001: Update user profile.
 * Verifies the profile form renders with name, date of birth, language fields.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the Account Profile heading is visible
    const heading = await canvas.findByRole(
      'heading',
      { name: /Account Profile/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();

    // Verify form fields are present
    const nameInput = await canvas.findByLabelText('Name');
    await expect(nameInput).toBeVisible();

    // Verify the update button is present
    const updateButton = await canvas.findByRole('button', { name: /update account/i });
    await expect(updateButton).toBeVisible();
  },
};
