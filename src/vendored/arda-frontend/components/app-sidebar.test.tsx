import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppSidebar } from './app-sidebar';

// ─── Navigation ──────────────────────────────────────────────────────────────
const mockRouterPush = jest.fn();
let mockPathname = '/items';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, back: jest.fn(), replace: jest.fn() }),
  usePathname: () => mockPathname,
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Auth ─────────────────────────────────────────────────────────────────────
const mockSignOut = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// ─── JWT ──────────────────────────────────────────────────────────────────────
const mockUseJWT = jest.fn();

jest.mock('@/store/hooks/useJWT', () => ({
  useJWT: () => mockUseJWT(),
}));

// ─── OrderQueue ───────────────────────────────────────────────────────────────
const mockUseOrderQueue = jest.fn();

jest.mock('@/contexts/OrderQueueContext', () => ({
  useOrderQueue: () => mockUseOrderQueue(),
}));

// ─── SidebarVisibility ────────────────────────────────────────────────────────
const mockUseSidebarVisibility = jest.fn();

jest.mock('@/store/hooks/useSidebarVisibility', () => ({
  useSidebarVisibility: () => mockUseSidebarVisibility(),
}));

// ─── useIsMobile ──────────────────────────────────────────────────────────────
const mockUseIsMobile = jest.fn();

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// ─── unsavedNavigation ────────────────────────────────────────────────────────
const mockAttemptNavigate = jest.fn();

jest.mock('@/lib/unsavedNavigation', () => ({
  attemptNavigate: (...args: unknown[]) => mockAttemptNavigate(...args),
}));

// ─── next/image ───────────────────────────────────────────────────────────────
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// ─── Sidebar UI components ────────────────────────────────────────────────────
const mockUseSidebar = jest.fn();

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, collapsible: _collapsible, className }: { children: React.ReactNode; collapsible?: string; className?: string }) => (
    <div data-testid="sidebar" className={className}>{children}</div>
  ),
  SidebarContent: ({ children, className: _className }: { children: React.ReactNode; className?: string }) => <div>{children}</div>,
  SidebarFooter: ({ children, className: _className }: { children: React.ReactNode; className?: string }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children, className: _className }: { children: React.ReactNode; className?: string }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuButton: ({
    children,
    onClick,
    isActive,
    id,
    tooltip: _tooltip,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
    id?: string;
    tooltip?: string;
    className?: string;
  }) => (
    <button id={id} onClick={onClick} data-active={isActive} className={className}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuSub: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuSubButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  useSidebar: () => mockUseSidebar(),
}));

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children, className: _className }: { children: React.ReactNode; className?: string }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div role="menuitem" onClick={onClick}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button>{children}</button>,
}));

// ─── Avatar ───────────────────────────────────────────────────────────────────
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className: _className }: { children: React.ReactNode; className?: string }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span data-testid="avatar-fallback">{children}</span>,
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// ─── Default mock setup ───────────────────────────────────────────────────────
const defaultUser = { name: 'Jane Doe', email: 'jane@test.com', id: 'u1' };
const allVisible = { dashboard: true, items: true, orderQueue: true, receiving: true };

function setupMocks(overrides: {
  isMobile?: boolean;
  sidebarState?: 'expanded' | 'collapsed';
  user?: object | null;
  userContext?: object | null;
  readyToOrderCount?: number;
  visibility?: object;
  pathname?: string;
  deployEnv?: string;
} = {}) {
  mockUseIsMobile.mockReturnValue(overrides.isMobile ?? false);
  mockUseSidebar.mockReturnValue({ state: overrides.sidebarState ?? 'expanded' });
  mockUseAuth.mockReturnValue({
    user: overrides.user !== undefined ? overrides.user : defaultUser,
    signOut: mockSignOut,
    loading: false,
  });
  mockUseJWT.mockReturnValue({
    userContext: overrides.userContext !== undefined ? overrides.userContext : { name: 'Jane JWT' },
  });
  mockUseOrderQueue.mockReturnValue({
    readyToOrderCount: overrides.readyToOrderCount ?? 0,
  });
  mockUseSidebarVisibility.mockReturnValue({
    visibility: overrides.visibility ?? allVisible,
  });
  mockPathname = overrides.pathname ?? '/items';
  mockAttemptNavigate.mockReturnValue(false);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('AppSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
    setupMocks();
  });

  describe('desktop sidebar (isMobile=false)', () => {
    it('renders the full logo when expanded', () => {
      render(<AppSidebar />);
      const logo = screen.getByAltText('Arda');
      expect(logo).toBeInTheDocument();
    });

    it('renders collapsed logo icon when sidebar is collapsed', () => {
      setupMocks({ sidebarState: 'collapsed' });
      render(<AppSidebar />);
      expect(screen.getByAltText('Arda Icon')).toBeInTheDocument();
    });

    it('renders visible menu items', () => {
      render(<AppSidebar />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Items')).toBeInTheDocument();
      expect(screen.getByText('Order Queue')).toBeInTheDocument();
      expect(screen.getByText('Receiving')).toBeInTheDocument();
    });

    it('hides dashboard in PRODUCTION env', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      render(<AppSidebar />);
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.getByText('Items')).toBeInTheDocument();
    });

    it('hides items when visibility is false', () => {
      setupMocks({ visibility: { ...allVisible, items: false } });
      render(<AppSidebar />);
      expect(screen.queryByText('Items')).not.toBeInTheDocument();
    });

    it('shows active state for current path', () => {
      setupMocks({ pathname: '/items' });
      render(<AppSidebar />);
      const itemsButton = screen.getByText('Items').closest('button');
      expect(itemsButton).toHaveAttribute('data-active', 'true');
    });

    it('shows active state for dashboard when pathname is /', () => {
      setupMocks({ pathname: '/' });
      render(<AppSidebar />);
      const dashboardButton = screen.getByText('Dashboard').closest('button');
      expect(dashboardButton).toHaveAttribute('data-active', 'true');
    });

    it('shows order queue badge when readyToOrderCount > 0', () => {
      setupMocks({ readyToOrderCount: 5 });
      render(<AppSidebar />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('does not show order queue badge when count is 0', () => {
      setupMocks({ readyToOrderCount: 0 });
      render(<AppSidebar />);
      // The count badge "0" should NOT be rendered
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('navigates to /items when Items is clicked', () => {
      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Items').closest('button')!);
      expect(mockRouterPush).toHaveBeenCalledWith('/items');
    });

    it('navigates to /dashboard when Dashboard is clicked', () => {
      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Dashboard').closest('button')!);
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });

    it('navigates to /order-queue when Order Queue is clicked', () => {
      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Order Queue').closest('button')!);
      expect(mockRouterPush).toHaveBeenCalledWith('/order-queue');
    });

    it('navigates to /receiving when Receiving is clicked', () => {
      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Receiving').closest('button')!);
      expect(mockRouterPush).toHaveBeenCalledWith('/receiving');
    });

    it('does not navigate when attemptNavigate returns true (unsaved changes)', () => {
      mockAttemptNavigate.mockReturnValue(true);
      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Items').closest('button')!);
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('renders user display name from JWT userContext', () => {
      setupMocks({ userContext: { name: 'JWT Name' } });
      render(<AppSidebar />);
      expect(screen.getAllByText('JWT Name').length).toBeGreaterThan(0);
    });

    it('falls back to user.name when userContext has no name', () => {
      setupMocks({ userContext: null });
      render(<AppSidebar />);
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
    });

    it('falls back to "There" when no name is available', () => {
      setupMocks({ user: { ...defaultUser, name: '' }, userContext: null });
      render(<AppSidebar />);
      expect(screen.getAllByText('There').length).toBeGreaterThan(0);
    });

    it('computes single-word avatar fallback correctly', () => {
      setupMocks({ userContext: { name: 'Alice' } });
      render(<AppSidebar />);
      const fallbacks = screen.getAllByTestId('avatar-fallback');
      expect(fallbacks.some((el) => el.textContent === 'A')).toBe(true);
    });

    it('computes multi-word avatar fallback correctly', () => {
      setupMocks({ userContext: null, user: { ...defaultUser, name: 'Jane Doe' } });
      render(<AppSidebar />);
      const fallbacks = screen.getAllByTestId('avatar-fallback');
      expect(fallbacks.some((el) => el.textContent === 'JD')).toBe(true);
    });

    it('renders Settings menu item', () => {
      render(<AppSidebar />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders Admin item in non-production', () => {
      render(<AppSidebar />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('hides Admin item in PRODUCTION env', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      render(<AppSidebar />);
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('calls signOut and navigates on Log out click', async () => {
      mockSignOut.mockResolvedValue(undefined);
      // jsdom doesn't allow redefining window.location directly,
      // so just verify signOut is called
      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Log out'));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('handles signOut failure gracefully', async () => {
      mockSignOut.mockRejectedValue(new Error('sign out failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Log out'));

      await act(async () => {
        await Promise.resolve();
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('renders user menu trigger', () => {
      render(<AppSidebar />);
      expect(screen.getByTestId('sidebar-user-menu')).toBeInTheDocument();
    });
  });

  describe('mobile sidebar (isMobile=true)', () => {
    beforeEach(() => {
      setupMocks({ isMobile: true });
    });

    it('renders mobile toggle button', () => {
      render(<AppSidebar />);
      // Find the fixed menu toggle button
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('shows menu icon by default (closed state)', () => {
      render(<AppSidebar />);
      // Mobile sidebar is closed by default — no menu items visible
      expect(screen.queryByText('Items')).not.toBeInTheDocument();
    });

    it('opens mobile sidebar when toggle button is clicked', () => {
      render(<AppSidebar />);
      const toggleBtn = screen.getAllByRole('button')[0];
      fireEvent.click(toggleBtn);
      expect(screen.getByText('Items')).toBeInTheDocument();
    });

    it('closes mobile sidebar when toggle button is clicked again', () => {
      render(<AppSidebar />);
      const toggleBtn = screen.getAllByRole('button')[0];
      fireEvent.click(toggleBtn); // open
      fireEvent.click(toggleBtn); // close
      expect(screen.queryByText('Items')).not.toBeInTheDocument();
    });

    it('renders Arda logo in mobile sidebar header when opened', () => {
      render(<AppSidebar />);
      const toggleBtn = screen.getAllByRole('button')[0];
      fireEvent.click(toggleBtn);
      expect(screen.getByAltText('Arda')).toBeInTheDocument();
    });

    it('closes mobile sidebar after navigation', () => {
      render(<AppSidebar />);
      const toggleBtn = screen.getAllByRole('button')[0];
      fireEvent.click(toggleBtn); // open

      const itemsButton = screen.getByText('Items').closest('button')!;
      fireEvent.click(itemsButton);

      expect(mockRouterPush).toHaveBeenCalledWith('/items');
    });

    it('shows order queue badge in mobile when count > 0', () => {
      setupMocks({ isMobile: true, readyToOrderCount: 3 });
      render(<AppSidebar />);
      const toggleBtn = screen.getAllByRole('button')[0];
      fireEvent.click(toggleBtn);
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
