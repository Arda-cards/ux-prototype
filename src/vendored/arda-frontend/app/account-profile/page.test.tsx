import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountProfilePage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/account-profile',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}));

jest.mock('@/components/common/app-header', () => ({
  AppHeader: () => <div data-testid="app-header" />,
}));

jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/settings/ChangePasswordSection', () => ({
  ChangePasswordSection: () => <div data-testid="change-password-section" />,
}));

describe('AccountProfilePage', () => {
  it('renders Account Profile heading', () => {
    render(<AccountProfilePage />);
    expect(screen.getByRole('heading', { name: 'Account Profile' })).toBeInTheDocument();
  });

  it('renders the name input', () => {
    render(<AccountProfilePage />);
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
  });

  it('renders the date of birth button', () => {
    render(<AccountProfilePage />);
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('renders language select placeholder', () => {
    render(<AccountProfilePage />);
    expect(screen.getByText('Placeholder')).toBeInTheDocument();
  });

  it('renders the Update account button', () => {
    render(<AccountProfilePage />);
    expect(screen.getByRole('button', { name: 'Update account' })).toBeInTheDocument();
  });

  it('renders breadcrumb with My Account', () => {
    render(<AccountProfilePage />);
    expect(screen.getByText('My Account')).toBeInTheDocument();
  });

  it('renders Settings breadcrumb link', () => {
    render(<AccountProfilePage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders the ChangePasswordSection', () => {
    render(<AccountProfilePage />);
    expect(screen.getByTestId('change-password-section')).toBeInTheDocument();
  });

  it('renders descriptive text about name', () => {
    render(<AccountProfilePage />);
    expect(screen.getByText(/displayed on your profile/)).toBeInTheDocument();
  });

  it('renders app sidebar and header', () => {
    render(<AccountProfilePage />);
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
  });
});
