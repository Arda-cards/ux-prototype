import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SignInPage from '@frontend/app/signin/page';

const meta: Meta<typeof SignInPage> = {
  title: 'Dev Witness/Sign In',
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
    const heading = await canvas.findByRole('heading', { name: /sign in/i }, { timeout: 10000 });
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
 * UC-AUTH-001 edge case: Invalid credentials error state.
 *
 * Mock limitation: The sign-in form dispatches signInThunk, which in Storybook
 * runs in mock mode (NEXT_PUBLIC_MOCK_MODE=true) and always succeeds — it
 * bypasses Cognito and returns mock tokens directly. The MSW handler approach
 * doesn't work because the form never makes an HTTP request to an auth endpoint.
 *
 * To demonstrate the error UI, we pre-populate the Redux auth slice with an
 * error. The sign-in page reads `error` from useAuth() (Redux selector) and
 * displays it as `authError`.
 */
export const InvalidCredentials: Story = {
  args: {
    initialState: {
      auth: {
        user: null,
        userContext: null,
        tokens: { accessToken: '', idToken: '', refreshToken: '', expiresAt: 0 },
        jwtPayload: null,
        isTokenValid: false,
        loading: false,
        error: 'Invalid email or password',
        isLoggingOut: false,
        isRefreshing: false,
        lastRefreshAttempt: null,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the form to render
    const heading = await canvas.findByRole('heading', { name: /sign in/i }, { timeout: 10000 });
    await expect(heading).toBeVisible();

    // The pre-populated auth error should be displayed
    // The sign-in page maps 'Invalid email or password' → 'Password or account incorrect'
    const errorMessage = await canvas.findByText(
      /password or account incorrect/i,
      {},
      { timeout: 5000 },
    );
    await expect(errorMessage).toBeVisible();
  },
};
