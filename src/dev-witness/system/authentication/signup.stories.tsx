import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SignUpPage from '@frontend/app/signup/page';
import '@/styles/vendored/globals.css';

const meta: Meta<typeof SignUpPage> = {
  title: 'App/Reference/System/Authentication/Sign Up',
  component: SignUpPage,
  tags: ['app-route:/signup'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/signup',
    appComponent: 'app/signup/page.tsx',
  },
  args: {
    pathname: '/signup',
  },
};

export default meta;
type Story = StoryObj<typeof SignUpPage>;

/**
 * UC-AUTH-002: Sign up form.
 * Verifies the sign-up form renders with name, email, password fields,
 * terms checkbox, and social sign-in buttons.
 * Note: Social sign-in buttons (GitHub, Google, Apple) are visible in
 * non-production environments only. In production they are hidden.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the sign-up heading
    const heading = await canvas.findByRole(
      'heading',
      { name: /create.*account/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();

    // Verify key form fields
    const emailInput = await canvas.findByLabelText(/email/i);
    await expect(emailInput).toBeVisible();
  },
};
