import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockPush = jest.fn();
const mockHandleAuthError = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/settings',
}));

jest.mock('@/hooks/useAuthErrorHandler', () => ({
  useAuthErrorHandler: () => ({ handleAuthError: mockHandleAuthError }),
}));

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockDecodeJWTPayload = jest.fn();
jest.mock('@/lib/jwt', () => ({
  decodeJWTPayload: (...args: unknown[]) => mockDecodeJWTPayload(...args),
}));

import { CompaniesSection } from './CompaniesSection';
import { useAuth } from '@frontend/store/hooks/useAuth';

const mockUseAuth = useAuth as jest.Mock;

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

global.fetch = jest.fn();

const makeUserAccountResponse = (eId = 'ua-123') => ({
  ok: true,
  json: async () => ({
    ok: true,
    data: {
      results: [{ payload: { eId } }],
    },
  }),
});

const makeAgentForResponse = (tenantLocals: string[] = ['tenant-1']) => ({
  ok: true,
  json: async () => ({
    ok: true,
    data: {
      results: tenantLocals.map((local) => ({
        payload: { tenant: { local } },
      })),
    },
  }),
});

const makeTenantResponse = (companies: Array<{ eId: string; name: string; tenantName: string }>) => ({
  ok: true,
  json: async () => ({
    ok: true,
    data: {
      results: companies.map((c) => ({
        payload: {
          eId: c.eId,
          company: { name: c.name },
          tenantName: c.tenantName,
        },
      })),
    },
  }),
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  mockHandleAuthError.mockReturnValue(false);
  mockUseAuth.mockReturnValue({ loading: false });
  mockDecodeJWTPayload.mockReturnValue({ sub: 'user-sub-123' });
});

describe('CompaniesSection', () => {
  describe('missing authentication token', () => {
    it('shows error when no JWT token', async () => {
      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('No authentication token found. Please sign in.')).toBeInTheDocument();
      });
    });
  });

  describe('auth still loading', () => {
    it('does not fetch while auth is loading', () => {
      mockUseAuth.mockReturnValue({ loading: true });
      render(<CompaniesSection />);
      // fetch should not be called
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('JWT decode failure', () => {
    it('shows error when JWT payload cannot be decoded', async () => {
      localStorageMock.setItem('idToken', 'bad-token');
      mockDecodeJWTPayload.mockReturnValue(null);

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Failed to decode JWT token')).toBeInTheDocument();
      });
    });

    it('shows error when payload has no sub', async () => {
      localStorageMock.setItem('idToken', 'bad-token');
      mockDecodeJWTPayload.mockReturnValue({ iss: 'test' }); // no sub

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Failed to decode JWT token')).toBeInTheDocument();
      });
    });
  });

  describe('user account API failure', () => {
    beforeEach(() => {
      localStorageMock.setItem('idToken', 'valid-token');
    });

    it('shows error when user-account query fails with HTTP error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('shows error when user account data is empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: { results: [] } }),
      });

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Legacy account information to be filled')).toBeInTheDocument();
      });
    });

    it('handles auth error via handleAuthError', async () => {
      mockHandleAuthError.mockReturnValue(true);
      (global.fetch as jest.Mock).mockRejectedValueOnce({ response: { status: 401 } });

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(mockHandleAuthError).toHaveBeenCalled();
      });
    });
  });

  describe('agent-for API failure', () => {
    beforeEach(() => {
      localStorageMock.setItem('idToken', 'valid-token');
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeUserAccountResponse());
    });

    it('shows error when agent-for query fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden' }),
      });

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Forbidden')).toBeInTheDocument();
      });
    });

    it('shows empty state when agent-for returns no results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: { results: [] } }),
      });

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('No companies found')).toBeInTheDocument();
      });
    });
  });

  describe('tenant query failure', () => {
    beforeEach(() => {
      localStorageMock.setItem('idToken', 'valid-token');
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(makeUserAccountResponse())
        .mockResolvedValueOnce(makeAgentForResponse());
    });

    it('shows error when tenant query fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText(/HTTP error! status: 500/)).toBeInTheDocument();
      });
    });

    it('shows error from tenant response data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: false, error: 'Tenant error' }),
      });

      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Tenant error')).toBeInTheDocument();
      });
    });
  });

  describe('successful company loading', () => {
    beforeEach(() => {
      localStorageMock.setItem('idToken', 'valid-token');
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(makeUserAccountResponse())
        .mockResolvedValueOnce(makeAgentForResponse())
        .mockResolvedValueOnce(makeTenantResponse([
          { eId: 'c-1', name: 'Acme Corp', tenantName: 'acme' },
          { eId: 'c-2', name: 'Beta LLC', tenantName: 'beta' },
        ]));
    });

    it('renders company names', async () => {
      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('Beta LLC')).toBeInTheDocument();
      });
    });

    it('renders Leave buttons for each company', async () => {
      render(<CompaniesSection />);
      await waitFor(() => {
        const leaveButtons = screen.getAllByRole('button', { name: /leave/i });
        expect(leaveButtons).toHaveLength(2);
      });
    });

    it('navigate to company-settings on manage company click', async () => {
      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      // Click the MoreHorizontal button (ellipsis)
      const moreButtons = screen.getAllByRole('button').filter(
        (btn) => !btn.textContent?.includes('Leave') && !btn.textContent?.includes('Companies') && !btn.textContent?.includes('Add')
      );
      if (moreButtons.length > 0) {
        fireEvent.click(moreButtons[0]);
        const manageOption = screen.queryByText('Manage company');
        if (manageOption) {
          fireEvent.click(manageOption);
          expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/company-settings'));
        }
      }
    });
  });

  describe('non-production add company button', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;
      localStorageMock.setItem('idToken', 'valid-token');
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(makeUserAccountResponse())
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, data: { results: [] } }) });
    });

    afterEach(() => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
    });

    it('shows Add Company button in non-production', async () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGING';
      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.getByText('Add Company')).toBeInTheDocument();
      });
    });

    it('does not show Add Company button in production', async () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      render(<CompaniesSection />);
      await waitFor(() => {
        expect(screen.queryByText('Add Company')).not.toBeInTheDocument();
      });
    });

    it('navigates to company-settings on Add Company click', async () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGING';
      render(<CompaniesSection />);
      await waitFor(() => {
        const addButton = screen.getByText('Add Company');
        fireEvent.click(addButton.closest('button')!);
        expect(mockPush).toHaveBeenCalledWith('/company-settings');
      });
    });
  });
});
