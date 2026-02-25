import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockChangePassword = jest.fn();

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  debugLog: jest.fn(),
  debugError: jest.fn(),
  isAuthenticationError: jest.fn(),
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

import { ChangePasswordSection } from './ChangePasswordSection';
import { useAuth } from '@frontend/store/hooks/useAuth';

const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    changePassword: mockChangePassword,
    loading: false,
    error: null,
  });
});

describe('ChangePasswordSection', () => {
  it('renders change password heading', () => {
    render(<ChangePasswordSection />);
    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument();
  });

  it('renders all password fields', () => {
    render(<ChangePasswordSection />);
    expect(screen.getByPlaceholderText('Enter your current password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your new password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument();
  });

  it('submit button is disabled initially (no password data)', () => {
    render(<ChangePasswordSection />);
    expect(screen.getByRole('button', { name: /change password/i })).toBeDisabled();
  });

  it('shows password requirements when typing new password', async () => {
    render(<ChangePasswordSection />);
    const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
    fireEvent.change(newPasswordInput, { target: { value: 'test' } });
    expect(screen.getByText('Password Requirements:')).toBeInTheDocument();
  });

  describe('validation errors', () => {
    it('shows error when current password is empty on submit', async () => {
      render(<ChangePasswordSection />);
      // Need to fill in enough to make the button not disabled via other means
      // Actually the button is disabled unless conditions met, so let's test via direct submit
      const form = screen.getByRole('button', { name: /change password/i }).closest('form');
      fireEvent.submit(form!);
      await waitFor(() => {
        expect(screen.getByText('Current password is required')).toBeInTheDocument();
      });
    });

    it('shows error when new password does not meet requirements', async () => {
      render(<ChangePasswordSection />);
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

      fireEvent.change(currentPasswordInput, { target: { value: 'OldPassword1!' } });
      fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });

      const form = screen.getByRole('button', { name: /change password/i }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Password does not meet all requirements')).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      render(<ChangePasswordSection />);
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

      fireEvent.change(newPasswordInput, { target: { value: 'ValidPass1!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass1!' } });

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('shows passwords match message when they match', async () => {
      render(<ChangePasswordSection />);
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

      fireEvent.change(newPasswordInput, { target: { value: 'ValidPass1!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass1!' } });

      expect(screen.getByText('Passwords match')).toBeInTheDocument();
    });

    it('shows error if new password same as current password', async () => {
      render(<ChangePasswordSection />);
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

      fireEvent.change(currentPasswordInput, { target: { value: 'SamePass1!' } });
      fireEvent.change(newPasswordInput, { target: { value: 'SamePass1!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'SamePass1!' } });

      const form = currentPasswordInput.closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('New password must be different from current password')).toBeInTheDocument();
      });
    });
  });

  describe('successful submission', () => {
    it('calls changePassword with correct args', async () => {
      mockChangePassword.mockResolvedValue(undefined);
      render(<ChangePasswordSection />);

      fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
        target: { value: 'OldPass1!' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
        target: { value: 'NewPass1!' },
      });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), {
        target: { value: 'NewPass1!' },
      });

      const form = screen.getByPlaceholderText('Enter your current password').closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockChangePassword).toHaveBeenCalledWith({
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass1!',
        });
      });
    });

    it('shows success message after successful change', async () => {
      mockChangePassword.mockResolvedValue(undefined);
      render(<ChangePasswordSection />);

      fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
        target: { value: 'OldPass1!' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
        target: { value: 'NewPass1!' },
      });
      fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), {
        target: { value: 'NewPass1!' },
      });

      const form = screen.getByPlaceholderText('Enter your current password').closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('error display from AuthContext', () => {
    it('shows error from auth context', () => {
      mockUseAuth.mockReturnValue({
        changePassword: mockChangePassword,
        loading: false,
        error: 'Incorrect current password',
      });

      render(<ChangePasswordSection />);
      expect(screen.getByText('Incorrect current password')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading text when loading is true', () => {
      mockUseAuth.mockReturnValue({
        changePassword: mockChangePassword,
        loading: true,
        error: null,
      });

      render(<ChangePasswordSection />);
      expect(screen.getByText('Changing Password...')).toBeInTheDocument();
    });
  });

  describe('password visibility toggle', () => {
    it('toggles current password visibility', () => {
      render(<ChangePasswordSection />);
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      expect(currentPasswordInput).toHaveAttribute('type', 'password');

      // Find toggle button for current password
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      // First toggle button (index 0) should be for current password
      fireEvent.click(toggleButtons[0]);
      expect(currentPasswordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('clearing errors on input', () => {
    it('clears form error when user starts typing', async () => {
      render(<ChangePasswordSection />);

      const form = screen.getByPlaceholderText('Enter your current password').closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Current password is required')).toBeInTheDocument();
      });

      // Now type in the field
      fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
        target: { value: 'typing' },
      });

      expect(screen.queryByText('Current password is required')).not.toBeInTheDocument();
    });
  });
});
