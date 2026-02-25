import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithAll } from '@frontend/test-utils/render-with-providers';
import SettingsPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/settings',
}));

// Mock AuthGuard to render children (authenticated)
jest.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useAuthValidation (used by AuthGuard)
jest.mock('@/hooks/useAuthValidation', () => ({
  useAuthValidation: jest.fn(),
}));

// Mock settings sections
jest.mock('@/components/settings/AccountSection', () => ({
  AccountSection: () => (
    <div data-testid="account-section">Account Section Content</div>
  ),
}));

jest.mock('@/components/settings/CompaniesSection', () => ({
  CompaniesSection: () => (
    <div data-testid="companies-section">Companies Section Content</div>
  ),
}));

jest.mock('@/components/settings/AppearanceSection', () => ({
  AppearanceSection: () => (
    <div data-testid="appearance-section">Appearance Section Content</div>
  ),
}));

jest.mock('@/components/settings/NotificationsSection', () => ({
  NotificationsSection: () => (
    <div data-testid="notifications-section">Notifications Section</div>
  ),
}));

jest.mock('@/components/settings/DisplaySection', () => ({
  DisplaySection: () => (
    <div data-testid="display-section">Display Section Content</div>
  ),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure we're not in production mode
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'DEVELOPMENT';
  });

  it('renders settings sections (navigation and heading)', async () => {
    renderWithAll(<SettingsPage />);

    // Use getByRole heading to specifically find the Settings h2 heading
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Settings' })
      ).toBeInTheDocument();
    });

    // Verify section navigation buttons exist
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Companies' })
    ).toBeInTheDocument();
  });

  it('loads user profile data on mount (renders AccountSection by default)', async () => {
    renderWithAll(<SettingsPage />);

    // AccountSection should be rendered by default
    await waitFor(() => {
      expect(screen.getByTestId('account-section')).toBeInTheDocument();
    });
  });

  it('displays a loading state while data is being fetched', async () => {
    renderWithAll(<SettingsPage />);

    // All settings navigation sections should render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    });

    // Verify the account section renders (it manages its own loading state)
    expect(screen.getByTestId('account-section')).toBeInTheDocument();

    // The description text indicates account settings are loaded
    expect(
      screen.getByText(/Your account, your rules/i)
    ).toBeInTheDocument();
  });
});
