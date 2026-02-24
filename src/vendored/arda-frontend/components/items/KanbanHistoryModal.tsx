import React from 'react';
import { XIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';

interface HistoryEntry {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: {
    type: string;
    eId: string;
    serialNumber: string;
    item: {
      type: string;
      eId: string;
      name: string;
    };
    cardQuantity?: {
      amount: number;
      unit: string;
    };
    lastEvent?: {
      when: {
        effective: number;
        recorded: number;
      };
      type: string;
      author: string;
    };
    status: string;
    printStatus: string;
  };
  metadata: {
    tenantId: string;
  };
  author: string;
  previous?: string;
  retired: boolean;
}

interface KanbanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  historyData?: {
    results: HistoryEntry[];
    thisPage?: string;
    nextPage?: string;
    previousPage?: string;
  };
}

const getActivityFromStatus = (
  status: string,
  printStatus: string,
  author: string
): string => {
  // Check if author is printing-author first
  if (author === 'printing-author' && printStatus === 'PRINTED') {
    return 'Printed card';
  }

  switch (status) {
    case 'AVAILABLE':
      return 'Card created';
    case 'REQUESTING':
      return 'In order queue';
    case 'REQUESTED':
      return 'Added to order queue';
    case 'IN_PROCESS':
      return 'Add to in process';
    case 'FULFILLED':
      return 'Move card to receive';

    default:
      return 'Status updated';
  }
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getVersion = (index: number, total: number): string => {
  return `${total - index}.0.0`;
};

export const KanbanHistoryModal: React.FC<KanbanHistoryModalProps> = ({
  isOpen,
  onClose,
  itemName,
  historyData,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Use real data from API or fallback to empty array
  const historyEntries: HistoryEntry[] = historyData?.results || [];

  return (
    <div
      onClick={handleOverlayClick}
      className='fixed inset-0 z-50 flex justify-end transition-all duration-300'
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      {/* Panel */}
      <div className='relative w-full sm:w-[420px] lg:w-[460px] h-full bg-white shadow-[-10px_0px_20px_rgba(0,0,0,0.2)] flex flex-col'>
        {/* Header */}
        <div className='bg-white border-b border-[#E5E5E5] px-6 py-4 flex flex-col gap-4'>
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-6 w-6 h-6 flex items-center justify-center'
          >
            <XIcon className='w-6 h-6' />
          </button>

          {/* Title section */}
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-9 px-2.5 border-[#E5E5E5]'
              onClick={onClose}
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <h1 className='text-2xl font-semibold text-[#0A0A0A] truncate'>
              {itemName}
            </h1>
          </div>

          {/* Toolbar */}
          <div className='flex flex-col gap-2'>
            {/* Breadcrumb */}
            <div className='flex items-center gap-2.5 text-sm text-[#737373]'>
              <span>{itemName}</span>
              <ChevronRight className='w-4 h-4' />
              <span className='text-[#0A0A0A]'>History</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto px-4 pt-4 pb-5 h-full'>
          <div className='w-full  h-full border border-[#BABFC7] rounded-sm bg-white overflow-hidden'>
            {/* Table */}
            <div className='w-full'>
              {/* Headers */}
              <div className='grid grid-cols-4 w-full'>
                <div className='bg-gray-50 border-b border-gray-300 h-12 flex items-center px-4'>
                  <span className='font-semibold text-sm'>Activity</span>
                </div>
                <div className='bg-gray-50 border-b border-gray-300 h-12 flex items-center px-4'>
                  <span className='font-semibold text-sm'>Version</span>
                </div>
                <div className='bg-gray-50 border-b border-gray-300 h-12 flex items-center px-4'>
                  <span className='font-semibold text-sm'>Date</span>
                </div>
                <div className='bg-gray-50 border-b border-gray-300 h-12 flex items-center px-4'>
                  <span className='font-semibold text-sm'>User</span>
                </div>
              </div>

              {/* Data rows */}
              {historyEntries.map((entry: HistoryEntry, index: number) => (
                <div key={entry.rId} className='grid grid-cols-4 w-full'>
                  <div className='border-b border-gray-200 h-[42px] flex items-center px-4'>
                    <span className='truncate'>
                      {getActivityFromStatus(
                        entry.payload.status,
                        entry.payload.printStatus,
                        entry.author
                      )}
                    </span>
                  </div>
                  <div className='border-b border-gray-200 h-[42px] flex items-center px-4'>
                    <span>{getVersion(index, historyEntries.length)}</span>
                  </div>
                  <div className='border-b border-gray-200 h-[42px] flex items-center px-4'>
                    <span className='truncate'>
                      {formatDate(entry.asOf.effective)}
                    </span>
                  </div>
                  <div className='border-b border-gray-200 h-[42px] flex items-center px-4'>
                    <span className='truncate'>{entry.author || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 left-0 w-full px-6 py-4 z-40 flex justify-end bg-white border-t border-[#E5E5E5]'>
          <Button
            variant='outline'
            className='text-sm font-medium text-[#0A0A0A] px-4 py-2 h-10 rounded-md border border-[#E5E5E5]'
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
