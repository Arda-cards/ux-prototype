'use client';

import {
  XIcon,
  QrCodeIcon,
  Table2Icon,
  PackageOpenIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@frontend/lib/utils';
import { ScanModal } from '@frontend/components/scan';

interface ScanPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanPanel({ isOpen, onClose }: ScanPanelProps) {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).id === 'scan-overlay') {
      onClose();
    }
  };

  const handleScanItemClick = () => {
    setScanModalOpen(true);
    onClose(); // Close the sidebar when opening the scan modal
  };

  const handleScanComplete = (scannedData: string) => {
    console.log('Scanned data:', scannedData);
  };

  const handleOrderQueueClick = () => {
    router.push('/order-queue');
    onClose(); // Close the sidebar when navigating
  };

  return (
    <>
      <div
        id='scan-overlay'
        onClick={handleOverlayClick}
        className={cn(
          'fixed inset-0 z-50 flex justify-end transition-all duration-300',
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(0px)',
        }}
      >
        <div
          className={cn(
            'relative w-96 h-full bg-white border-l border-border p-6 flex flex-col gap-4 shadow-xl transition-transform duration-300',
            isOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <button
            className='absolute top-4 right-4 text-foreground opacity-70 hover:opacity-100'
            onClick={onClose}
          >
            <XIcon className='h-4 w-4' />
          </button>

          <div className='flex flex-col gap-2'>
            <h2 className='text-[18px] font-semibold text-base-foreground font-geist leading-7'>
              Scan-n-go
            </h2>
            <p className='text-sm text-muted-foreground font-geist leading-5'>
              Set scanners to stun. Pew pew!
            </p>
          </div>

          <div className='flex flex-col pt-2 border-t border-border divide-y divide-border'>
            <ScanItem
              icon={
                <QrCodeIcon
                  className='h-5 w-5'
                  style={{ color: 'var(--foreground)' }}
                />
              }
              title='Scan an item'
              description='Scan a single item.'
              onClick={handleScanItemClick}
            />
            <ScanItem
              icon={
                <QrCodeIcon
                  className='h-5 w-5'
                  style={{ color: 'var(--foreground)' }}
                />
              }
              title='Add to order queue'
              description='Restock scanned items in one go.'
              onClick={handleOrderQueueClick}
            />
            <ScanItem
              icon={
                <Table2Icon
                  className='h-5 w-5'
                  style={{ color: 'var(--foreground)' }}
                />
              }
              title='Create new items'
              description='Scan to quickly add what is missing.'
            />
            <ScanItem
              icon={
                <PackageOpenIcon
                  className='h-5 w-5'
                  style={{ color: 'var(--foreground)' }}
                />
              }
              title='Receive items'
              description='Scan to receive delivered items.'
            />
          </div>
        </div>
      </div>

      {/* Scan Modal - render only when open to avoid unnecessary effects */}
      {scanModalOpen && (
        <ScanModal
          isOpen={scanModalOpen}
          onClose={() => setScanModalOpen(false)}
          onScan={handleScanComplete}
        />
      )}
    </>
  );
}

interface ScanItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function ScanItem({ icon, title, description, onClick }: ScanItemProps) {
  return (
    <div
      className='flex items-center justify-between gap-4 px-2 py-6 hover:bg-muted cursor-pointer transition-colors'
      onClick={onClick}
    >
      <div className='flex items-start gap-4'>
        <div
          className='w-12 h-12 flex items-center justify-center rounded-lg shadow-sm'
          style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
          }}
        >
          {icon}
        </div>
        <div className='flex flex-col'>
          <span
            className='text-base font-semibold font-geist leading-6'
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </span>
          <span
            className='text-sm font-geist leading-5'
            style={{ color: 'var(--muted-foreground)' }}
          >
            {description}
          </span>
        </div>
      </div>
      <ChevronRightIcon
        className='h-5 w-5'
        style={{ color: 'var(--foreground)' }}
      />
    </div>
  );
}
