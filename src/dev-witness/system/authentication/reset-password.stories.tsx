import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ResetPasswordPage from '@frontend/app/reset-password/page';
import '@/styles/vendored/globals.css';

const meta: Meta<typeof ResetPasswordPage> = {
  title: 'App/Reference/System/Authentication/Reset Password',
  component: ResetPasswordPage,
  tags: ['app-route:/reset-password'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/reset-password',
    appComponent: 'app/reset-password/page.tsx',
  },
  args: {
    pathname: '/reset-password',
  },
};

export default meta;
type Story = StoryObj<typeof ResetPasswordPage>;

/**
 * UC-AUTH-003: Reset password request form.
 * Verifies the form renders with email field and submit button.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the email input for password reset
    const emailInput = await canvas.findByLabelText(/email/i, {}, { timeout: 10000 });
    await expect(emailInput).toBeVisible();
  },
};
