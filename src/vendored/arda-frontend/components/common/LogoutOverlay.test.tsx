import React from 'react';
import { render, screen } from '@testing-library/react';
import { LogoutOverlay } from './LogoutOverlay';

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/ui/loader', () => ({
  Loader: ({ size, 'aria-label': ariaLabel }: { size?: string; 'aria-label'?: string }) => (
    <div data-testid="loader" data-size={size} aria-label={ariaLabel} />
  ),
}));

import { useAuth } from '@frontend/store/hooks/useAuth';
const mockUseAuth = useAuth as jest.Mock;

describe('LogoutOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when isLoggingOut is false', () => {
    it('renders nothing', () => {
      mockUseAuth.mockReturnValue({ isLoggingOut: false });
      const { container } = render(<LogoutOverlay />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('when isLoggingOut is true', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isLoggingOut: true });
    });

    it('renders the overlay', () => {
      render(<LogoutOverlay />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label "Logging out"', () => {
      render(<LogoutOverlay />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Logging out');
    });

    it('has aria-live="polite"', () => {
      render(<LogoutOverlay />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('renders the Loader component', () => {
      render(<LogoutOverlay />);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders "Signing out..." heading', () => {
      render(<LogoutOverlay />);
      expect(screen.getByText('Signing out...')).toBeInTheDocument();
    });

    it('renders "Please wait a moment" text', () => {
      render(<LogoutOverlay />);
      expect(screen.getByText('Please wait a moment')).toBeInTheDocument();
    });

    it('overlay has fixed positioning class', () => {
      render(<LogoutOverlay />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveClass('fixed');
    });

    it('overlay has high z-index class', () => {
      render(<LogoutOverlay />);
      const overlay = screen.getByRole('status');
      expect(overlay.className).toContain('z-[9999]');
    });
  });
});
