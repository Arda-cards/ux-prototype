import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CompanySettingsPage from './page';

// Use variable so tests can override search params
let mockSearchParamsStr = '';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/company-settings',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(mockSearchParamsStr),
}));

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => ({ user: { name: 'Test User', tenantId: 'T1' }, loading: false }),
}));

const mockHandleAuthError = jest.fn().mockReturnValue(false);
jest.mock('@/hooks/useAuthErrorHandler', () => ({
  useAuthErrorHandler: () => ({ handleAuthError: mockHandleAuthError }),
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

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

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

global.fetch = jest.fn();

const mockTenantPayload = {
  eId: 'tenant-123',
  tenantName: 'Test Tenant',
  company: {
    name: 'Test Company',
    legalName: 'Test Legal Name',
    country: 'US',
    taxId: '123-456',
    registrationId: 'REG-001',
    naicsCode: '123456',
  },
  plan: 'Business',
  settings: {},
  subscriptionReference: 'sub-ref',
};

describe('CompanySettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParamsStr = '';
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'DEVELOPMENT';
    mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false }),
    } as unknown as Response);
  });

  describe('basic rendering (no tenantId)', () => {
    it('renders the Company Settings heading', () => {
      render(<CompanySettingsPage />);
      expect(screen.getByRole('heading', { name: 'Company Settings' })).toBeInTheDocument();
    });

    it('renders breadcrumb with Company Settings label', () => {
      render(<CompanySettingsPage />);
      // There are two "Company Settings" elements (breadcrumb + heading)
      expect(screen.getAllByText('Company Settings').length).toBeGreaterThanOrEqual(1);
    });

    it('renders navigation buttons', () => {
      render(<CompanySettingsPage />);
      expect(screen.getByText('Company info')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Subscription')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
    });

    it('shows company-info section by default with form fields', () => {
      render(<CompanySettingsPage />);
      expect(screen.getByPlaceholderText('Company Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Legal Name')).toBeInTheDocument();
    });

    it('renders Save company button disabled when no tenantId', () => {
      render(<CompanySettingsPage />);
      expect(screen.getByRole('button', { name: /save company/i })).toBeDisabled();
    });
  });

  describe('section navigation', () => {
    it('switches to Users section', () => {
      render(<CompanySettingsPage />);
      fireEvent.click(screen.getByText('Users'));
      expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
    });

    it('shows No users found in Users section with no data', () => {
      render(<CompanySettingsPage />);
      fireEvent.click(screen.getByText('Users'));
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });

    it('switches to Subscription section', () => {
      render(<CompanySettingsPage />);
      fireEvent.click(screen.getByText('Subscription'));
      expect(screen.getByText('Subscription section - Coming soon')).toBeInTheDocument();
    });

    it('switches to Billing section', () => {
      render(<CompanySettingsPage />);
      fireEvent.click(screen.getByText('Billing'));
      expect(screen.getByText('Billing section - Coming soon')).toBeInTheDocument();
    });

    it('switches back to Company info', () => {
      render(<CompanySettingsPage />);
      fireEvent.click(screen.getByText('Billing'));
      fireEvent.click(screen.getByText('Company info'));
      expect(screen.getByPlaceholderText('Company Name')).toBeInTheDocument();
    });
  });

  describe('form input changes', () => {
    it('updates name field', () => {
      render(<CompanySettingsPage />);
      const input = screen.getByPlaceholderText('Company Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ACME Corp' } });
      expect(input.value).toBe('ACME Corp');
    });

    it('updates legalName field', () => {
      render(<CompanySettingsPage />);
      const input = screen.getByPlaceholderText('Legal Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ACME Legal' } });
      expect(input.value).toBe('ACME Legal');
    });

    it('updates country field', () => {
      render(<CompanySettingsPage />);
      const input = screen.getByPlaceholderText('Country') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'US' } });
      expect(input.value).toBe('US');
    });

    it('updates taxId field', () => {
      render(<CompanySettingsPage />);
      const input = screen.getByPlaceholderText('Tax ID') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '99-1234' } });
      expect(input.value).toBe('99-1234');
    });

    it('updates registrationId field', () => {
      render(<CompanySettingsPage />);
      const input = screen.getByPlaceholderText('Registration ID') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'R-999' } });
      expect(input.value).toBe('R-999');
    });

    it('updates naicsCode field', () => {
      render(<CompanySettingsPage />);
      const input = screen.getByPlaceholderText('NAICS Code') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '111111' } });
      expect(input.value).toBe('111111');
    });
  });

  describe('STAGE-mode fields', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGE';
    });

    it('shows email, phone, address fields in STAGE mode', () => {
      render(<CompanySettingsPage />);
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
    });

    it('shows logo upload section in STAGE mode', () => {
      render(<CompanySettingsPage />);
      expect(screen.getByText('Enter image URL')).toBeInTheDocument();
    });

    it('updates email field', () => {
      render(<CompanySettingsPage />);
      const input = screen.getByPlaceholderText('Email Address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      expect(input.value).toBe('test@test.com');
    });

    it('does NOT show email field in DEVELOPMENT mode', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'DEVELOPMENT';
      render(<CompanySettingsPage />);
      expect(screen.queryByPlaceholderText('Email Address')).not.toBeInTheDocument();
    });
  });

  describe('with tenantId - fetch flow', () => {
    beforeEach(() => {
      mockSearchParamsStr = 'tenantId=tenant-123';
    });

    it('shows error when no jwt token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<CompanySettingsPage />);
      await waitFor(() => {
        expect(screen.getByText(/No authentication token found/)).toBeInTheDocument();
      });
    });

    it('populates form data after successful tenant fetch', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { payload: mockTenantPayload } }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: false }),
        } as unknown as Response);

      render(<CompanySettingsPage />);
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Company Name') as HTMLInputElement;
        expect(nameInput.value).toBe('Test Company');
      });
    });

    it('shows error message on failed fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as unknown as Response);

      render(<CompanySettingsPage />);
      await waitFor(() => {
        expect(screen.getByText(/Error:.*Server error/)).toBeInTheDocument();
      });
    });

    it('shows error on api returning ok:false', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: false, error: 'Not found' }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: false }),
        } as unknown as Response);

      render(<CompanySettingsPage />);
      await waitFor(() => {
        const errorEls = screen.queryAllByText(/Not found/);
        expect(errorEls.length).toBeGreaterThan(0);
      });
    });

    it('handles save successfully and shows success toast', async () => {
      // GET tenant
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { payload: mockTenantPayload } }),
        } as unknown as Response)
        // GET users (agent-for)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: false }),
        } as unknown as Response)
        // PUT save
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { payload: mockTenantPayload } }),
        } as unknown as Response);

      render(<CompanySettingsPage />);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Company Name') as HTMLInputElement;
        expect(nameInput.value).toBe('Test Company');
      });

      const saveBtn = screen.getByRole('button', { name: /save company/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText('Update company success')).toBeInTheDocument();
      });
    });

    it('shows error on save failure', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { payload: mockTenantPayload } }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: false }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Save failed' }),
        } as unknown as Response);

      render(<CompanySettingsPage />);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Company Name') as HTMLInputElement;
        expect(nameInput.value).toBe('Test Company');
      });

      const saveBtn = screen.getByRole('button', { name: /save company/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText(/Error:.*Save failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Users section - with tenantId', () => {
    beforeEach(() => {
      mockSearchParamsStr = 'tenantId=tenant-123';
    });

    it('renders user from agent-for + user-account fetch', async () => {
      // Set up 3 fetch calls: GET tenant, POST agent-for, POST user-account
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { payload: mockTenantPayload } }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ok: true,
            data: { results: [{ payload: { userAccount: { local: 'eid-1' } } }] },
          }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ok: true,
            data: {
              results: [
                {
                  payload: {
                    eId: 'eid-1',
                    identity: {
                      firstName: 'Jane',
                      middleName: null,
                      lastName: 'Smith',
                      email: 'jane@example.com',
                    },
                  },
                },
              ],
            },
          }),
        } as unknown as Response);

      render(<CompanySettingsPage />);

      await waitFor(() => {
        expect(global.fetch as jest.Mock).toHaveBeenCalledTimes(3);
      });

      fireEvent.click(screen.getByText('Users'));

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('shows users error when agent-for fetch fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { payload: mockTenantPayload } }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Users fetch failed' }),
        } as unknown as Response);

      render(<CompanySettingsPage />);
      fireEvent.click(screen.getByText('Users'));

      await waitFor(() => {
        expect(screen.getByText(/Users fetch failed/)).toBeInTheDocument();
      });
    });

    it('shows No users found when agent-for returns empty results', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { payload: mockTenantPayload } }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, data: { results: [] } }),
        } as unknown as Response);

      render(<CompanySettingsPage />);
      fireEvent.click(screen.getByText('Users'));

      await waitFor(() => {
        expect(screen.getByText('No users found.')).toBeInTheDocument();
      });
    });
  });
});
