import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import KanbanCardPage from './page';
import { getKanbanCard } from '@frontend/lib/ardaClient';
import { createMockKanbanCard } from '@frontend/test-utils/mock-factories';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: mockReplace }),
  useParams: () => ({ cardId: 'test-card-123' }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/kanban/cards/test-card-123',
}));

// Mock ardaClient
jest.mock('@/lib/ardaClient', () => ({
  getKanbanCard: jest.fn(),
}));

// Mock AuthGuard to render children (authenticated)
jest.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useIsMobile
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn().mockReturnValue(false),
}));

// Mock scan views
jest.mock('@/components/scan/MobileScanView', () => ({
  MobileScanView: ({ initialCardId }: { initialCardId: string }) => (
    <div data-testid="mobile-scan-view">MobileScanView: {initialCardId}</div>
  ),
}));

jest.mock('@/components/scan/DesktopScanView', () => ({
  DesktopScanView: ({ initialCardId }: { initialCardId?: string }) => (
    <div data-testid="desktop-scan-view">DesktopScanView: {initialCardId}</div>
  ),
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  isAuthenticationError: jest.fn().mockReturnValue(false),
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockGetKanbanCard = getKanbanCard as jest.Mock;

const mockCardData = createMockKanbanCard();

describe('KanbanCardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetKanbanCard.mockResolvedValue(mockCardData);
  });

  it('renders card details including serial number, item name, and status', async () => {
    render(<KanbanCardPage />);

    await waitFor(() => {
      expect(screen.getByText('KC-0001')).toBeInTheDocument();
    });

    expect(screen.getByText('Surgical Gloves - Medium')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('fetches card data using the cardId from the URL', async () => {
    render(<KanbanCardPage />);

    await waitFor(() => {
      expect(mockGetKanbanCard).toHaveBeenCalledWith('test-card-123');
    });
  });

  it('displays a loading state while fetching', async () => {
    // Make fetch never resolve to keep loading state
    mockGetKanbanCard.mockReturnValue(new Promise(() => {}));

    render(<KanbanCardPage />);

    expect(screen.getByText('Loading card...')).toBeInTheDocument();
  });

  it('displays an error state when fetch fails', async () => {
    mockGetKanbanCard.mockRejectedValue(new Error('Network error'));

    render(<KanbanCardPage />);

    await waitFor(() => {
      expect(screen.getByText('Card Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders card print status and quantity details', async () => {
    render(<KanbanCardPage />);

    await waitFor(() => {
      expect(screen.getByText('PRINTED')).toBeInTheDocument();
    });

    // Check quantity is rendered
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it('allows triggering close to navigate away', async () => {
    render(<KanbanCardPage />);

    await waitFor(() => {
      expect(screen.getByText('KC-0001')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockPush).toHaveBeenCalledWith('/items');
  });
});
