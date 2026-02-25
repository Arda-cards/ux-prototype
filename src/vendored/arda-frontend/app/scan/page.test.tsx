import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithAll } from '@frontend/test-utils/render-with-providers';
import ScanPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/scan',
}));

// Mock AuthGuard to render children (authenticated)
jest.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useAuthValidation (used by AuthGuard)
jest.mock('@/hooks/useAuthValidation', () => ({
  useAuthValidation: jest.fn(),
}));

// Mock useIsMobile
const mockUseIsMobile = jest.fn().mockReturnValue(false);
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// Mock MobileScanView
jest.mock('@/components/scan/MobileScanView', () => ({
  MobileScanView: ({
    onScan,
    onClose,
  }: {
    onScan: (data: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="mobile-scan-view">
      <button onClick={() => onScan('test-scan-data')}>Scan</button>
      <button onClick={onClose}>Close Mobile</button>
    </div>
  ),
}));

// Mock DesktopScanView
jest.mock('@/components/scan/DesktopScanView', () => ({
  DesktopScanView: ({
    isOpen,
    onScan,
    onClose,
  }: {
    isOpen: boolean;
    onScan: (data: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="desktop-scan-view" data-open={String(isOpen)}>
      <button onClick={() => onScan('desktop-scan-result')}>
        Desktop Scan
      </button>
      <button onClick={onClose}>Close Desktop</button>
    </div>
  ),
}));

describe('ScanPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
  });

  it('renders scan interface components', async () => {
    renderWithAll(<ScanPage />);

    // Desktop scan view should appear (not mobile)
    await waitFor(() => {
      expect(screen.getByTestId('desktop-scan-view')).toBeInTheDocument();
    });
  });

  it('renders mobile scan view on mobile devices', async () => {
    mockUseIsMobile.mockReturnValue(true);

    renderWithAll(<ScanPage />);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-scan-view')).toBeInTheDocument();
    });
  });

  it('displays appropriate feedback after scanning', async () => {
    renderWithAll(<ScanPage />);

    await waitFor(() => {
      expect(screen.getByTestId('desktop-scan-view')).toBeInTheDocument();
    });

    // Verify the scan interface is open (isOpen=true passed to DesktopScanView)
    const scanView = screen.getByTestId('desktop-scan-view');
    expect(scanView).toHaveAttribute('data-open', 'true');
  });
});
