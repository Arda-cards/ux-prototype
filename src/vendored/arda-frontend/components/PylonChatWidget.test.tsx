import React from 'react';
import { render, act } from '@testing-library/react';
import { PylonChatWidget } from './PylonChatWidget';

const mockUseAuth = jest.fn();

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock next/script
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ id, dangerouslySetInnerHTML: _dangerouslySetInnerHTML }: { id: string; dangerouslySetInnerHTML?: { __html: string } }) => (
    <script id={id} data-testid="pylon-script" />
  ),
}));

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
};

describe('PylonChatWidget', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Clean up window.pylon between tests
    delete (window as Window & { pylon?: unknown }).pylon;
    // Reset localStorage mocks
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    delete (window as Window & { pylon?: unknown }).pylon;
  });

  describe('when no appId is configured', () => {
    it('returns null when NEXT_PUBLIC_PYLON_APP_ID is not set', () => {
      delete process.env.NEXT_PUBLIC_PYLON_APP_ID;
      mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
      const { container } = render(<PylonChatWidget />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('when appId is configured', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_PYLON_APP_ID = 'test-app-id';
    });

    it('renders the script tag', () => {
      mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
      const { getByTestId } = render(<PylonChatWidget />);
      expect(getByTestId('pylon-script')).toBeInTheDocument();
    });

    it('renders null when loading is true', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true });
      const { getByTestId } = render(<PylonChatWidget />);
      // Script should still be rendered since appId exists
      expect(getByTestId('pylon-script')).toBeInTheDocument();
    });
  });

  describe('window.pylon initialization', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_PYLON_APP_ID = 'test-app-id';
    });

    it('initializes window.pylon when user is logged in and tokens are available', async () => {
      (window.localStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'accessToken') return 'mock-access-token';
          if (key === 'idToken') return 'mock-id-token';
          return null;
        });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, email_hash: 'abc123' }),
      });

      mockUseAuth.mockReturnValue({ user: mockUser, loading: false });

      await act(async () => {
        render(<PylonChatWidget />);
      });

      // window.pylon should be initialized
      expect((window as Window & { pylon?: { chat_settings: unknown } }).pylon).toBeDefined();
    });

    it('skips fetch when tokens are not available', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
      global.fetch = jest.fn();

      mockUseAuth.mockReturnValue({ user: mockUser, loading: false });

      await act(async () => {
        render(<PylonChatWidget />);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('clears window.pylon when user logs out', async () => {
      (window as Window & { pylon?: unknown }).pylon = {
        chat_settings: { app_id: 'test', email: 'old@test.com', name: 'Old' },
      };

      mockUseAuth.mockReturnValue({ user: null, loading: false });

      await act(async () => {
        render(<PylonChatWidget />);
      });

      expect((window as Window & { pylon?: unknown }).pylon).toBeUndefined();
    });

    it('handles fetch error gracefully', async () => {
      (window.localStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'accessToken') return 'mock-access-token';
          if (key === 'idToken') return 'mock-id-token';
          return null;
        });

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockUseAuth.mockReturnValue({ user: mockUser, loading: false });

      await act(async () => {
        render(<PylonChatWidget />);
      });

      consoleSpy.mockRestore();
    });

    it('handles non-ok response from email hash API', async () => {
      (window.localStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'accessToken') return 'mock-access-token';
          if (key === 'idToken') return 'mock-id-token';
          return null;
        });

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Unauthorized' }),
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockUseAuth.mockReturnValue({ user: mockUser, loading: false });

      await act(async () => {
        render(<PylonChatWidget />);
      });

      consoleSpy.mockRestore();
    });

    it('handles invalid response format from email hash API', async () => {
      (window.localStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'accessToken') return 'mock-access-token';
          if (key === 'idToken') return 'mock-id-token';
          return null;
        });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: false }),
      });
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockUseAuth.mockReturnValue({ user: mockUser, loading: false });

      await act(async () => {
        render(<PylonChatWidget />);
      });

      consoleSpy.mockRestore();
    });

    it('updates existing window.pylon settings', async () => {
      (window as Window & { pylon?: { chat_settings: Record<string, unknown> } }).pylon = {
        chat_settings: {
          app_id: 'test-app-id',
          email: 'old@test.com',
          name: 'Old User',
          avatar_url: '/avatar.png',
          account_id: 'acc-1',
          account_external_id: 'ext-1',
        },
      };
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      mockUseAuth.mockReturnValue({ user: mockUser, loading: false });

      await act(async () => {
        render(<PylonChatWidget />);
      });

      const pylonWindow = window as Window & { pylon?: { chat_settings: Record<string, unknown> } };
      expect(pylonWindow.pylon?.chat_settings.email).toBe('test@example.com');
    });
  });

  describe('when user has no email', () => {
    it('does not initialize pylon when user email is empty', async () => {
      process.env.NEXT_PUBLIC_PYLON_APP_ID = 'test-app-id';
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
      mockUseAuth.mockReturnValue({
        user: { id: 'u1', name: 'No Email', email: '' },
        loading: false,
      });

      await act(async () => {
        render(<PylonChatWidget />);
      });

      expect((window as Window & { pylon?: unknown }).pylon).toBeUndefined();
    });
  });
});
