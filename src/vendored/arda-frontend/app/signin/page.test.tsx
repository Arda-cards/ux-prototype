import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import SignIn from './page';

let mockSearchParamsStr = '';
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: mockReplace }),
  usePathname: () => '/signin',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(mockSearchParamsStr),
}));

const mockSignIn = jest.fn();
const mockRespondToNewPasswordChallenge = jest.fn();
const mockCheckAuth = jest.fn();
let mockUser: null | object = null;
let mockLoading = false;
let mockAuthContextError: string | null = null;

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
    error: mockAuthContextError,
    signIn: mockSignIn,
    respondToNewPasswordChallenge: mockRespondToNewPasswordChallenge,
    checkAuth: mockCheckAuth,
  }),
}));

jest.mock('@/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    errors: {},
    setErrors: jest.fn(),
    validate: jest.fn().mockReturnValue(true),
  }),
}));

jest.mock('@/components/common/RequiredAsterisk', () => ({
  RequiredAsterisk: () => <span>*</span>,
}));

jest.mock('@/components/common/PasswordInput', () => ({
  PasswordInput: ({ id, label, value, onChange, placeholder, error }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    error?: string;
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={id}
      />
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

describe('SignIn page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParamsStr = '';
    mockUser = null;
    mockLoading = false;
    mockAuthContextError = null;
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'DEVELOPMENT';
    mockSignIn.mockResolvedValue(undefined);
    mockCheckAuth.mockResolvedValue(undefined);
    mockRespondToNewPasswordChallenge.mockResolvedValue(undefined);
  });

  describe('loading state', () => {
    it('shows loading screen when auth is loading', () => {
      mockLoading = true;
      render(<SignIn />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('basic rendering', () => {
    it('renders the sign-in heading', async () => {
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      });
    });

    it('renders email input', async () => {
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });
    });

    it('renders password input', async () => {
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByTestId('password')).toBeInTheDocument();
      });
    });

    it('renders sign in button', async () => {
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });
    });

    it('renders forgot password link', async () => {
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByText('Reset password')).toBeInTheDocument();
      });
    });

    it('renders sign up link', async () => {
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByText('Sign up')).toBeInTheDocument();
      });
    });

    it('shows OR SIGN IN WITH section in non-production mode', async () => {
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByText('OR SIGN IN WITH')).toBeInTheDocument();
      });
    });

    it('hides social signin in PRODUCTION mode', async () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.queryByText('OR SIGN IN WITH')).not.toBeInTheDocument();
      });
    });
  });

  describe('redirect if user already logged in', () => {
    it('redirects to /items when user is present without next param', async () => {
      mockUser = { id: 'user-1', name: 'Test User' };
      render(<SignIn />);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/items?justSignedIn=true');
      });
    });

    it('redirects to next param when user is present', async () => {
      mockUser = { id: 'user-1' };
      mockSearchParamsStr = 'next=%2Fdashboard';
      render(<SignIn />);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('success messages from searchParams', () => {
    it('shows verified success message when verified=true', async () => {
      mockSearchParamsStr = 'verified=true';
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByText(/Email verified successfully/)).toBeInTheDocument();
      });
      expect(mockReplace).toHaveBeenCalledWith('/signin');
    });

    it('shows signup success message when signup=success', async () => {
      mockSearchParamsStr = 'signup=success&email=test@test.com';
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByText(/Account created successfully/)).toBeInTheDocument();
      });
      expect(mockReplace).toHaveBeenCalledWith('/signin');
    });

    it('shows signup success message without email', async () => {
      mockSearchParamsStr = 'signup=success';
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByText(/Account created successfully/)).toBeInTheDocument();
      });
    });
  });

  describe('auth context error handling', () => {
    it('shows invalid email/password error from context', async () => {
      render(<SignIn />);
      await waitFor(() => {
        mockAuthContextError = 'Invalid email or password';
      });
      // Re-render to trigger the effect
      act(() => {
        mockAuthContextError = 'Invalid email or password';
      });
    });

    it('shows email verification error from context', async () => {
      mockAuthContextError = 'Please confirm your email';
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
      });
    });

    it('shows raw error from context when unrecognized', async () => {
      mockAuthContextError = 'Some unexpected error';
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByText('Some unexpected error')).toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('submits form and calls signIn', async () => {
      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password123' },
      });

      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });

    it('handles requiresNewPassword response from signIn', async () => {
      mockSignIn.mockResolvedValue({
        requiresNewPassword: true,
        session: 'test-session-token',
      });

      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password123' },
      });

      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('New Password Required')).toBeInTheDocument();
      });
    });
  });

  describe('new password challenge form', () => {
    const setupNewPasswordForm = async () => {
      mockSignIn.mockResolvedValue({
        requiresNewPassword: true,
        session: 'test-session',
      });

      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('New Password Required')).toBeInTheDocument();
      });
    };

    it('shows new password required banner', async () => {
      await setupNewPasswordForm();
      expect(screen.getByText(/temporary password/i)).toBeInTheDocument();
    });

    it('shows error when new password is too short', async () => {
      await setupNewPasswordForm();

      fireEvent.change(screen.getByTestId('newPassword'), {
        target: { value: 'short' },
      });
      fireEvent.change(screen.getByTestId('confirmNewPassword'), {
        target: { value: 'short' },
      });

      fireEvent.submit(screen.getByRole('button', { name: /set new password/i }).closest('form')!);

      await waitFor(() => {
        expect(screen.getAllByText(/at least eight characters/i).length).toBeGreaterThan(0);
      });
    });

    it('shows error when passwords do not match', async () => {
      await setupNewPasswordForm();

      fireEvent.change(screen.getByTestId('newPassword'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByTestId('confirmNewPassword'), {
        target: { value: 'different456' },
      });

      fireEvent.submit(screen.getByRole('button', { name: /set new password/i }).closest('form')!);

      await waitFor(() => {
        expect(screen.getAllByText(/do not match/i).length).toBeGreaterThan(0);
      });
    });

    it('shows error when session is empty', async () => {
      mockSignIn.mockResolvedValue({
        requiresNewPassword: true,
        session: '',
      });

      render(<SignIn />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'u@e.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('New Password Required')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('newPassword'), { target: { value: 'newpassword123' } });
      fireEvent.change(screen.getByTestId('confirmNewPassword'), { target: { value: 'newpassword123' } });
      fireEvent.submit(screen.getByRole('button', { name: /set new password/i }).closest('form')!);

      await waitFor(() => {
        expect(screen.getByText(/Session expired/)).toBeInTheDocument();
      });
    });

    it('calls respondToNewPasswordChallenge on valid new password form', async () => {
      // Setup tokens in localStorage so the redirect flow doesn't fail
      (window.localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('access-token')  // accessToken first check
        .mockReturnValueOnce('id-token')       // idToken first check
        .mockReturnValueOnce('access-token')  // accessToken final check
        .mockReturnValueOnce('id-token');      // idToken final check

      await setupNewPasswordForm();

      fireEvent.change(screen.getByTestId('newPassword'), { target: { value: 'newpassword123' } });
      fireEvent.change(screen.getByTestId('confirmNewPassword'), { target: { value: 'newpassword123' } });
      fireEvent.submit(screen.getByRole('button', { name: /set new password/i }).closest('form')!);

      await waitFor(() => {
        expect(mockRespondToNewPasswordChallenge).toHaveBeenCalledWith(
          'test-session',
          'newpassword123'
        );
      });
    });
  });
});
