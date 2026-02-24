'use client';

import { XIcon, TriangleAlertIcon, InfoIcon, MailIcon } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@frontend/lib/utils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle click outside panel to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).id === 'notification-overlay') {
      onClose();
    }
  };

  return (
    <div
      id='notification-overlay'
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
          <h2 className='text-[18px] font-semibold text-base-foreground font-geist'>
            Notifications
          </h2>
          <p className='text-sm text-muted-foreground font-geist'>
            Updates, alerts, and things that need your attention. Nothing noisy
            — just the stuff that matters.
          </p>
        </div>

        <div className='flex flex-col gap-2 pt-4 border-t border-border'>
          <NotificationItem
            icon={<TriangleAlertIcon className='h-4 w-4' />}
            label='Alerts'
            count={3}
          />
          <NotificationItem
            icon={<InfoIcon className='h-4 w-4' />}
            label='Notifications'
            count={4}
          />
          <NotificationItem
            icon={<MailIcon className='h-4 w-4' />}
            label='Messages'
            count={5}
          />
        </div>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
}

function NotificationItem({ icon, label, count }: NotificationItemProps) {
  return (
    <div className='relative w-full h-8 px-2 py-1 rounded-md flex items-center gap-2 hover:bg-muted cursor-pointer'>
      {icon}
      <span className='text-sm font-normal text-base-foreground font-geist'>
        {label}
      </span>
      <span className='absolute right-2 text-xs font-medium text-base-foreground font-geist'>
        {count}
      </span>
    </div>
  );
}
