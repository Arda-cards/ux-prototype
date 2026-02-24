import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockCheckAuth = jest.fn();
const mockRefreshTokenData = jest.fn();
const mockUpdatePayloadAttributes = jest.fn();

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/store/hooks/useJWT', () => ({
  useJWT: jest.fn(),
}));

// Mock ChangePasswordSection to avoid its own dependency chain
jest.mock('./ChangePasswordSection', () => ({
  ChangePasswordSection: () => <div data-testid="change-password-section" />,
}));

import { AccountSection } from './AccountSection';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useJWT } from '@frontend/store/hooks/useJWT';

const mockUseAuth = useAuth as jest.Mock;
const mockUseJWT = useJWT as jest.Mock;

const defaultAuthState = {
  user: { name: 'Test User', email: 'test@example.com' },
  checkAuth: mockCheckAuth,
  loading: false,
};

const defaultJWTState = {
  payload: {
    given_name: 'John',
    middle_name: 'M',
    family_name: 'Doe',
    sub: 'user-123',
  },
  refreshTokenData: mockRefreshTokenData,
  updatePayloadAttributes: mockUpdatePayloadAttributes,
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  mockUseAuth.mockReturnValue(defaultAuthState);
  mockUseJWT.mockReturnValue(defaultJWTState);
  mockCheckAuth.mockResolvedValue(undefined);
  mockRefreshTokenData.mockResolvedValue(undefined);
});

describe('AccountSection', () => {
  describe('rendering', () => {
    it('renders Account heading', () => {
      render(<AccountSection />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('renders first name field with JWT payload value', () => {
      render(<AccountSection />);
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    it('renders middle name field with JWT payload value', () => {
      render(<AccountSection />);
      expect(screen.getByDisplayValue('M')).toBeInTheDocument();
    });

    it('renders last name field with JWT payload value', () => {
      render(<AccountSection />);
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });

    it('renders user email', () => {
      render(<AccountSection />);
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('shows "No email available" when user has no email', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { name: 'Test', email: undefined },
      });
      render(<AccountSection />);
      expect(screen.getByText('No email available')).toBeInTheDocument();
    });

    it('renders Update account button', () => {
      render(<AccountSection />);
      expect(screen.getByRole('button', { name: /update account/i })).toBeInTheDocument();
    });

    it('renders ChangePasswordSection', () => {
      render(<AccountSection />);
      expect(screen.getByTestId('change-password-section')).toBeInTheDocument();
    });
  });

  describe('no JWT payload', () => {
    it('shows empty name fields when no payload', () => {
      mockUseJWT.mockReturnValue({
        ...defaultJWTState,
        payload: null,
      });
      render(<AccountSection />);
      // name display should fall back to user.name
      const nameInput = screen.getByDisplayValue('Test User');
      expect(nameInput).toBeInTheDocument();
    });
  });

  describe('form submission - missing tokens', () => {
    it('shows error when no idToken in localStorage', async () => {
      // No tokens set in localStorage
      render(<AccountSection />);
      const button = screen.getByRole('button', { name: /update account/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('No authentication token found. Please sign in.')).toBeInTheDocument();
      });
    });
  });

  describe('form submission - successful update with attributes', () => {
    beforeEach(() => {
      localStorageMock.setItem('idToken', 'mock-jwt-token');
      localStorageMock.setItem('accessToken', 'mock-access-token');
    });

    it('calls update-attributes API when fields have values', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ok: true,
            attributes: { given_name: 'Jane', family_name: 'Smith' },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true }),
        });

      render(<AccountSection />);
      const button = screen.getByRole('button', { name: /update account/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/update-attributes',
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    it('shows success message after successful update', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, attributes: {} }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true }),
        });

      render(<AccountSection />);
      const button = screen.getByRole('button', { name: /update account/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/account updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('form submission - API errors', () => {
    beforeEach(() => {
      localStorageMock.setItem('idToken', 'mock-jwt-token');
      localStorageMock.setItem('accessToken', 'mock-access-token');
    });

    it('shows error when update-attributes returns non-ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Attribute update failed' }),
      });

      render(<AccountSection />);
      const button = screen.getByRole('button', { name: /update account/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Attribute update failed')).toBeInTheDocument();
      });
    });

    it('shows error when legacy account update returns non-ok response', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, attributes: {} }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Legacy update failed' }),
        });

      render(<AccountSection />);
      const button = screen.getByRole('button', { name: /update account/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Legacy update failed')).toBeInTheDocument();
      });
    });

    it('shows error when legacy account update data.ok is false', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, attributes: {} }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: false, error: 'Account error' }),
        });

      render(<AccountSection />);
      const button = screen.getByRole('button', { name: /update account/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Account error')).toBeInTheDocument();
      });
    });
  });

  describe('production environment', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;
    });

    afterEach(() => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
    });

    it('does not show language selector in production', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      render(<AccountSection />);
      expect(screen.queryByText('Language')).not.toBeInTheDocument();
    });

    it('shows language selector in non-production', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGING';
      render(<AccountSection />);
      expect(screen.getByText('Language')).toBeInTheDocument();
    });
  });
});
