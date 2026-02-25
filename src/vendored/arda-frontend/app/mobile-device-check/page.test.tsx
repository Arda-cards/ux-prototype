import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileDeviceCheckPage from './page';

const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack, replace: jest.fn() }),
  usePathname: () => '/mobile-device-check',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
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

jest.mock('@/components/scan/MobileScanView', () => ({
  MobileScanView: ({ onClose }: { onClose: () => void; onScan: (data: string) => void }) => (
    <div data-testid="mobile-scan-view">
      <button onClick={onClose}>Close Mobile</button>
    </div>
  ),
}));

jest.mock('@/components/scan/DesktopScanView', () => ({
  DesktopScanView: ({ onClose }: { isOpen: boolean; onClose: () => void; onScan: (data: string) => void }) => (
    <div data-testid="desktop-scan-view">
      <button onClick={onClose}>Close Desktop</button>
    </div>
  ),
}));

describe('MobileDeviceCheckPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('renders the Mobile device check heading', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.getByText('Mobile device check')).toBeInTheDocument();
    });

    it('renders the "Is mobile device" card', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.getByText('Is mobile device')).toBeInTheDocument();
    });

    it('renders the "Is desktop browser" card', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.getByText('Is desktop browser')).toBeInTheDocument();
    });

    it('renders Mobile badge', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.getByText('Mobile')).toBeInTheDocument();
    });

    it('renders Desktop badge', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.getByText('Desktop')).toBeInTheDocument();
    });

    it('renders descriptive text for mobile path', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.getByText(/Use this path if user is on mobile device/)).toBeInTheDocument();
    });

    it('renders descriptive text for desktop path', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.getByText(/If user is on a desktop browser/)).toBeInTheDocument();
    });

    it('does not show MobileScanView initially', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.queryByTestId('mobile-scan-view')).not.toBeInTheDocument();
    });

    it('does not show DesktopScanView initially', () => {
      render(<MobileDeviceCheckPage />);
      expect(screen.queryByTestId('desktop-scan-view')).not.toBeInTheDocument();
    });
  });

  describe('mobile device click', () => {
    it('opens MobileScanView when "Is mobile device" card is clicked', () => {
      render(<MobileDeviceCheckPage />);
      fireEvent.click(screen.getByText('Is mobile device').closest('div')!);
      expect(screen.getByTestId('mobile-scan-view')).toBeInTheDocument();
    });

    it('closes MobileScanView and calls router.back() when closed', () => {
      render(<MobileDeviceCheckPage />);
      fireEvent.click(screen.getByText('Is mobile device').closest('div')!);
      fireEvent.click(screen.getByText('Close Mobile'));
      expect(screen.queryByTestId('mobile-scan-view')).not.toBeInTheDocument();
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('desktop browser click', () => {
    it('opens DesktopScanView when "Is desktop browser" card is clicked', () => {
      render(<MobileDeviceCheckPage />);
      fireEvent.click(screen.getByText('Is desktop browser').closest('div')!);
      expect(screen.getByTestId('desktop-scan-view')).toBeInTheDocument();
    });

    it('closes DesktopScanView and calls router.back() when closed', () => {
      render(<MobileDeviceCheckPage />);
      fireEvent.click(screen.getByText('Is desktop browser').closest('div')!);
      fireEvent.click(screen.getByText('Close Desktop'));
      expect(screen.queryByTestId('desktop-scan-view')).not.toBeInTheDocument();
      expect(mockBack).toHaveBeenCalled();
    });
  });
});
