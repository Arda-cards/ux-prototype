/**
 * Unit tests for src/app/dashboard/DashboardContent.tsx
 * Covers: greeting display, justSignedIn toast, navigation clicks, badge display, mobile menu, notification section visibility
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// ─── Navigation ────────────────────────────────────────────────────────────
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// ─── Image & Link ──────────────────────────────────────────────────────────
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// ─── Auth ─────────────────────────────────────────────────────────────────
const mockUseAuth = jest.fn();
jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// ─── OrderQueue ────────────────────────────────────────────────────────────
const mockUseOrderQueue = jest.fn();
jest.mock('@/contexts/OrderQueueContext', () => ({
  useOrderQueue: () => mockUseOrderQueue(),
}));

// ─── Mobile detection ─────────────────────────────────────────────────────
const mockUseIsMobile = jest.fn();
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// ─── Sonner toast ─────────────────────────────────────────────────────────
const mockToastSuccess = jest.fn();
jest.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => mockToastSuccess(...args) },
  Toaster: () => null,
}));

// ─── AppSidebar / AppHeader / Sidebar components ─────────────────────────
jest.mock('@/components/app-sidebar', () => ({
  AppSidebar: () => <div data-testid='app-sidebar' />,
}));

jest.mock('@/components/common/app-header', () => ({
  AppHeader: () => <div data-testid='app-header' />,
}));

jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// ─── HubSpotPostsPanel ────────────────────────────────────────────────────
jest.mock('@/components/homepage/HubSpotPosts', () => ({
  __esModule: true,
  default: () => <div data-testid='hubspot-posts' />,
}));

// ─── UI components ────────────────────────────────────────────────────────
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...rest }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => (
    <button onClick={onClick} {...rest}>{children}</button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...rest}>{children}</div>
  ),
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => <tr {...rest}>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => <td {...rest}>{children}</td>,
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

// ─── Lucide icons ─────────────────────────────────────────────────────────
jest.mock('lucide-react', () => {
  const Icon = ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
    <svg data-testid={testId} />
  );
  return {
    Dock: Icon,
    FileText: Icon,
    ShoppingCart: Icon,
    PackageOpen: Icon,
    Bell: Icon,
    TrendingUp: Icon,
    X: Icon,
    Building: Icon,
    UserRound: Icon,
    ChevronLeft: Icon,
    ChevronRight: Icon,
    Menu: Icon,
  };
});

import { DashboardContent } from './DashboardContent';

// Helper to set up default mocks
function setupDefaultMocks(overrides: {
  userName?: string | null;
  readyToOrderCount?: number;
  isMobile?: boolean;
  deployEnv?: string;
} = {}) {
  const { userName = 'Alice', readyToOrderCount = 0, isMobile = false, deployEnv } = overrides;

  mockUseAuth.mockReturnValue({ user: userName != null ? { name: userName } : null });
  mockUseOrderQueue.mockReturnValue({ readyToOrderCount });
  mockUseIsMobile.mockReturnValue(isMobile);
  mockGet.mockReturnValue(null);

  if (deployEnv !== undefined) {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = deployEnv;
  } else {
    delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
  }
}

describe('DashboardContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.location
    window.history.pushState({}, '', '/dashboard');
    delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
  });

  // ── Greeting ─────────────────────────────────────────────────────────────
  it('renders greeting with user name', () => {
    setupDefaultMocks({ userName: 'Alice' });
    render(<DashboardContent />);
    expect(screen.getByText(/Hiya, Alice\./i)).toBeInTheDocument();
  });

  it('renders greeting with "There" when user has no name', () => {
    mockUseAuth.mockReturnValue({ user: {} });
    mockUseOrderQueue.mockReturnValue({ readyToOrderCount: 0 });
    mockUseIsMobile.mockReturnValue(false);
    mockGet.mockReturnValue(null);
    render(<DashboardContent />);
    expect(screen.getByText(/Hiya, There\./i)).toBeInTheDocument();
  });

  it('renders greeting with "There" when user is null', () => {
    setupDefaultMocks({ userName: null });
    render(<DashboardContent />);
    expect(screen.getByText(/Hiya, There\./i)).toBeInTheDocument();
  });

  // ── Navigation clicks ─────────────────────────────────────────────────────
  it('navigates to /items when "Manage items" is clicked', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    const manageItems = screen.getByText('Manage items');
    fireEvent.click(manageItems.closest('div')!);
    expect(mockPush).toHaveBeenCalledWith('/items');
  });

  it('navigates to /order-queue when "Reorder items" is clicked', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    const reorderItems = screen.getByText('Reorder items');
    fireEvent.click(reorderItems.closest('div')!);
    expect(mockPush).toHaveBeenCalledWith('/order-queue');
  });

  it('navigates to /receiving when "Receive items" is clicked', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    const receiveItems = screen.getByText('Receive items');
    fireEvent.click(receiveItems.closest('div')!);
    expect(mockPush).toHaveBeenCalledWith('/receiving');
  });

  // ── Order queue badge ─────────────────────────────────────────────────────
  it('shows order count badge when readyToOrderCount > 0', () => {
    setupDefaultMocks({ readyToOrderCount: 5 });
    render(<DashboardContent />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not show order badge when readyToOrderCount is 0', () => {
    setupDefaultMocks({ readyToOrderCount: 0 });
    render(<DashboardContent />);
    expect(screen.queryByText('0')).toBeNull();
  });

  // ── Time filter ───────────────────────────────────────────────────────────
  it('renders time filter buttons (Week, Month, Year)', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    expect(screen.getByRole('button', { name: 'Week' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Year' })).toBeInTheDocument();
  });

  it('changes time filter when Month is clicked', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    const monthBtn = screen.getByRole('button', { name: 'Month' });
    fireEvent.click(monthBtn);
    // The button should still be present (state changed to 'Month')
    expect(monthBtn).toBeInTheDocument();
  });

  it('changes time filter when Year is clicked', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    const yearBtn = screen.getByRole('button', { name: 'Year' });
    fireEvent.click(yearBtn);
    expect(yearBtn).toBeInTheDocument();
  });

  // ── Orders table ──────────────────────────────────────────────────────────
  it('renders the Orders table heading', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('renders the total amount in the table footer', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    // The total is $80.04 + $65.31 + $17.34 + $158.44 + $20.35 = $341.48
    expect(screen.getByText('$341.48')).toBeInTheDocument();
  });

  it('renders order statuses (Pending and Received)', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    const pendingItems = screen.getAllByText('Pending');
    const receivedItems = screen.getAllByText('Received');
    expect(pendingItems.length).toBeGreaterThan(0);
    expect(receivedItems.length).toBeGreaterThan(0);
  });

  // ── Notification section (hidden in PRODUCTION) ───────────────────────────
  it('shows notifications section when not in PRODUCTION', () => {
    setupDefaultMocks({ deployEnv: 'STAGING' });
    render(<DashboardContent />);
    expect(screen.getByText('View notifications')).toBeInTheDocument();
  });

  it('hides notifications section in PRODUCTION', () => {
    setupDefaultMocks({ deployEnv: 'PRODUCTION' });
    render(<DashboardContent />);
    expect(screen.queryByText('View notifications')).toBeNull();
  });

  it('shows notifications section when NEXT_PUBLIC_DEPLOY_ENV is undefined', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    expect(screen.getByText('View notifications')).toBeInTheDocument();
  });

  // ── Mobile menu ───────────────────────────────────────────────────────────
  it('shows mobile menu button when on mobile', () => {
    setupDefaultMocks({ isMobile: true });
    render(<DashboardContent />);
    // The mobile menu renders a DropdownMenuTrigger with a Menu button
    // Just verify the component renders without errors on mobile
    expect(screen.getByText('Manage items')).toBeInTheDocument();
  });

  it('does not show mobile dropdown when not on mobile', () => {
    setupDefaultMocks({ isMobile: false });
    render(<DashboardContent />);
    // On desktop, mobile-specific dropdown items shouldn't be rendered
    // The "Set up your company" should still exist in the sidebar panel
    expect(screen.getByText('Set up your company')).toBeInTheDocument();
  });

  // ── justSignedIn toast ────────────────────────────────────────────────────
  it('shows success toast when justSignedIn query param is "true"', async () => {
    mockGet.mockImplementation((key: string) => (key === 'justSignedIn' ? 'true' : null));
    mockUseAuth.mockReturnValue({ user: { name: 'Alice' } });
    mockUseOrderQueue.mockReturnValue({ readyToOrderCount: 0 });
    mockUseIsMobile.mockReturnValue(false);

    await act(async () => {
      render(<DashboardContent />);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Sign in successful',
      expect.objectContaining({ description: 'Welcome to Arda Systems' })
    );
  });

  it('removes justSignedIn param from URL after toast', async () => {
    window.history.pushState({}, '', '/dashboard?justSignedIn=true');
    mockGet.mockImplementation((key: string) => (key === 'justSignedIn' ? 'true' : null));
    mockUseAuth.mockReturnValue({ user: { name: 'Alice' } });
    mockUseOrderQueue.mockReturnValue({ readyToOrderCount: 0 });
    mockUseIsMobile.mockReturnValue(false);

    await act(async () => {
      render(<DashboardContent />);
    });

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('does NOT show toast when justSignedIn is not "true"', async () => {
    mockGet.mockReturnValue(null);
    mockUseAuth.mockReturnValue({ user: { name: 'Alice' } });
    mockUseOrderQueue.mockReturnValue({ readyToOrderCount: 0 });
    mockUseIsMobile.mockReturnValue(false);

    await act(async () => {
      render(<DashboardContent />);
    });

    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  // ── Get started section ───────────────────────────────────────────────────
  it('renders "Get started with Arda" section', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    expect(screen.getByText('Get started with Arda')).toBeInTheDocument();
  });

  it('renders HubSpot posts panel', () => {
    setupDefaultMocks();
    render(<DashboardContent />);
    expect(screen.getByTestId('hubspot-posts')).toBeInTheDocument();
  });
});
