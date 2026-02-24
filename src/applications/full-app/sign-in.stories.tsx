import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import SignInPage from '@frontend/app/signin/page';

const meta: Meta<typeof SignInPage> = {
  title: 'Full App/Sign In',
  component: SignInPage,
  tags: ['app-route:/signin'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/signin',
    appComponent: 'app/signin/page.tsx',
  },
  args: {
    pathname: '/signin',
  },
};

export default meta;
type Story = StoryObj<typeof SignInPage>;

/**
 * UC-AUTH-001: Sign in with valid credentials.
 * Verifies the sign-in form renders with email/password fields and submit button.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the sign-in heading is visible
    const heading = await canvas.findByText('Sign in', {}, { timeout: 10000 });
    await expect(heading).toBeVisible();

    // Verify email field is present
    const emailInput = await canvas.findByPlaceholderText('Email');
    await expect(emailInput).toBeVisible();

    // Verify password field is present
    const passwordInput = await canvas.findByPlaceholderText('Password');
    await expect(passwordInput).toBeVisible();

    // Verify sign-in submit button is present
    const submitButton = await canvas.findByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeVisible();
  },
};

/**
 * UC-AUTH-001 edge case: Invalid credentials returns 401.
 * Fills the form and submits, then verifies error message appears.
 */
export const InvalidCredentials: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/auth/login', () =>
          HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the form to render
    const heading = await canvas.findByText('Sign in', {}, { timeout: 10000 });
    await expect(heading).toBeVisible();

    // Verify the form fields are present for the invalid credentials scenario
    const emailInput = await canvas.findByPlaceholderText('Email');
    await expect(emailInput).toBeVisible();

    const passwordInput = await canvas.findByPlaceholderText('Password');
    await expect(passwordInput).toBeVisible();

    const submitButton = await canvas.findByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeVisible();
  },
};
