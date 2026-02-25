import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/dashboard',
}));

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useAuthValidation', () => ({
  useAuthValidation: jest.fn(),
}));

jest.mock('@/components/ui/loader', () => ({
  Loader: ({ 'aria-label': ariaLabel }: { 'aria-label'?: string }) => (
    <div data-testid="loader" aria-label={ariaLabel} />
  ),
}));

import { AuthGuard } from './AuthGuard';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useAuthValidation } from '@frontend/hooks/useAuthValidation';

const mockUseAuth = useAuth as jest.Mock;
const mockUseAuthValidation = useAuthValidation as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuthValidation.mockReturnValue(undefined);
});

describe('AuthGuard', () => {
  describe('loading state', () => {
    it('shows loader when loading is true', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true, isLoggingOut: false });
      render(<AuthGuard><div>protected content</div></AuthGuard>);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    });

    it('shows verifying authentication text when loading', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true, isLoggingOut: false });
      render(<AuthGuard><div>content</div></AuthGuard>);
      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
    });
  });

  describe('isLoggingOut state', () => {
    it('shows loader when isLoggingOut is true', () => {
      mockUseAuth.mockReturnValue({ user: { name: 'Test' }, loading: false, isLoggingOut: true });
      render(<AuthGuard><div>protected content</div></AuthGuard>);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    });

    it('shows signing out text when isLoggingOut', () => {
      mockUseAuth.mockReturnValue({ user: { name: 'Test' }, loading: false, isLoggingOut: true });
      render(<AuthGuard><div>content</div></AuthGuard>);
      expect(screen.getByText('Signing out...')).toBeInTheDocument();
    });
  });

  describe('unauthenticated state', () => {
    it('returns null when no user and not loading', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false, isLoggingOut: false });
      const { container } = render(<AuthGuard><div>protected content</div></AuthGuard>);
      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    it('renders children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({ user: { name: 'Test User' }, loading: false, isLoggingOut: false });
      render(<AuthGuard><div>protected content</div></AuthGuard>);
      expect(screen.getByText('protected content')).toBeInTheDocument();
    });

    it('calls useAuthValidation with provided options', () => {
      mockUseAuth.mockReturnValue({ user: { name: 'Test User' }, loading: false, isLoggingOut: false });
      render(<AuthGuard intervalMs={5000} redirectTo="/login"><div>content</div></AuthGuard>);
      expect(mockUseAuthValidation).toHaveBeenCalledWith({ intervalMs: 5000, redirectTo: '/login' });
    });

    it('uses default intervalMs and redirectTo', () => {
      mockUseAuth.mockReturnValue({ user: { name: 'Test User' }, loading: false, isLoggingOut: false });
      render(<AuthGuard><div>content</div></AuthGuard>);
      expect(mockUseAuthValidation).toHaveBeenCalledWith({
        intervalMs: 15 * 60 * 1000,
        redirectTo: '/signin',
      });
    });
  });
});
