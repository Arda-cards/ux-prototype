'use client';

import { useState } from 'react';
import { SidebarTrigger } from '@frontend/components/ui/sidebar';
import { Input } from '@frontend/components/ui/input';
import { Button } from '@frontend/components/ui/button';
import {
  BellIcon,
  HelpCircleIcon,
  ScanBarcodeIcon,
  SearchIcon,
} from 'lucide-react';

import { NotificationPanel } from '@frontend/components/sideBar/NotificationPanel';
import { HelpPanel } from '../sideBar/helpPanel';
// import { ScanPanel } from '../sideBar/scanPanel'; // Dropdown menu - commented out, now using direct scan modal
import { ScanModal } from '../scan/ScanModal';
import { MobileScanView } from '@frontend/components/scan/MobileScanView';
import { DesktopScanView } from '@frontend/components/scan/DesktopScanView';
import { InitialScanModal } from '@frontend/components/scan/InitialScanModal';
import { useSidebarState } from '@frontend/hooks/useSidebarState';
import { useIsMobile } from '@frontend/hooks/use-mobile';

export function AppHeader() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // const [scanPanelOpen, setScanPanelOpen] = useState(false); // Dropdown menu with multiple scan options - commented out, now using direct scan modal
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [mobileScanViewOpen, setMobileScanViewOpen] = useState(false);
  const [desktopScanViewOpen, setDesktopScanViewOpen] = useState(false);
  const [initialScanModalOpen, setInitialScanModalOpen] = useState(false);
  const [initialCardId, setInitialCardId] = useState<string | undefined>(
    undefined
  );
  const { isCollapsed } = useSidebarState();
  const isMobile = useIsMobile();

  const handleScanComplete = (scannedData: string) => {
    console.log('Scanned data:', scannedData);
  };

  const handleScanClick = () => {
    // Auto-detect device and open appropriate scan view
    if (isMobile) {
      setMobileScanViewOpen(true);
    } else {
      // In desktop, open the initial scan modal first
      setInitialScanModalOpen(true);
    }
  };

  const handleOpenCardView = (cardId: string) => {
    // Close initial scan modal
    setInitialScanModalOpen(false);
    // Set the card ID first, then open the desktop scan view
    // This ensures the card is loaded when the modal opens
    setInitialCardId(cardId);
    // Use a small timeout to ensure state is updated before opening
    setTimeout(() => {
      setDesktopScanViewOpen(true);
    }, 0);
  };

  return (
    <>
      <header
        className={`flex items-center border-b bg-background px-4 py-2 fixed top-0 right-0 left-0 z-30 h-16 transition-[margin-left] duration-200 ease-linear ${
          isMobile ? 'px-3' : 'px-4'
        }`}
        style={{
          marginLeft: isMobile ? '0' : isCollapsed ? '3rem' : '16rem',
        }}
      >
        <SidebarTrigger />
        <div
          className={`flex items-center gap-4 ml-auto ${
            isMobile ? 'gap-2' : 'gap-4'
          }`}
        >
          {/* Search bar - hidden on mobile */}
          {!isMobile && (
            <>
              <div className='relative max-w-[373px] w-full'>
                <SearchIcon className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Search'
                  className='pl-10 h-9 w-full text-sm'
                  style={{
                    fontFamily: 'Geist',
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#737373',
                  }}
                />
              </div>
              <div className='h-6 w-px bg-muted' />
            </>
          )}

          {/* Scan button - auto-detects device and opens appropriate scan view */}
          <Button
            variant='outline'
            className={`bg-[#F5F5F5] text-[#171717] font-medium text-[14px] leading-5 rounded-lg px-4 ${
              isMobile ? 'h-8 px-3 text-xs' : 'h-9 px-4'
            }`}
            style={{ fontFamily: 'Geist' }}
            onClick={handleScanClick}
          >
            <ScanBarcodeIcon
              className={`mr-2 text-base-foreground ${
                isMobile ? 'h-3 w-3' : 'h-4 w-4'
              }`}
            />
            Scan
          </Button>

          {/* Help icon - same size as notification in mobile, original in desktop */}
          <HelpCircleIcon
            className={`text-base-foreground cursor-pointer ${
              isMobile ? 'h-5 w-5' : 'h-11 w-11'
            }`}
            onClick={() => setHelpOpen(true)}
          />

          {/* Notification bell - hidden in production */}
          {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
            <div className='relative'>
              <BellIcon
                className={`text-base-foreground cursor-pointer ${
                  isMobile ? 'h-5 w-5' : 'h-6 w-6'
                }`}
                onClick={() => setPanelOpen(true)}
              />
              <span
                className='absolute -top-1 -right-1 bg-[#171717] text-[#FAFAFA] text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-semibold'
                style={{ fontFamily: 'Geist', lineHeight: '12px' }}
              >
                8
              </span>
            </div>
          )}
        </div>
      </header>

      <NotificationPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
      {/* Dropdown menu with multiple scan options - commented out, only "Scan an item" was working */}
      {/* <ScanPanel
        isOpen={scanPanelOpen}
        onClose={() => setScanPanelOpen(false)}
      /> */}
      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onScan={handleScanComplete}
      />
      {mobileScanViewOpen && (
        <MobileScanView
          onScan={handleScanComplete}
          onClose={() => setMobileScanViewOpen(false)}
        />
      )}
      <InitialScanModal
        isOpen={initialScanModalOpen}
        onClose={() => setInitialScanModalOpen(false)}
        onOpenCardView={handleOpenCardView}
      />
      <DesktopScanView
        isOpen={desktopScanViewOpen}
        onClose={() => {
          setDesktopScanViewOpen(false);
          // Reset initialCardId after a small delay to allow the modal to close
          setTimeout(() => {
            setInitialCardId(undefined);
          }, 100);
        }}
        onScan={handleScanComplete}
        initialCardId={initialCardId}
      />
      <HelpPanel isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
