'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AuthGuard } from '@frontend/components/AuthGuard';
import { getKanbanCard } from '@frontend/lib/ardaClient';
import { MobileScanView } from '@frontend/components/scan/MobileScanView';
import { DesktopScanView } from '@frontend/components/scan/DesktopScanView';
import { useIsMobile } from '@frontend/hooks/use-mobile';
import { Button } from '@frontend/components/ui/button';
import { isAuthenticationError } from '@frontend/lib/utils';

interface KanbanCardData {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: {
    eId: string;
    rId: string;
    lookupUrlId: string;
    serialNumber: string;
    item: {
      type: string;
      eId: string;
      name: string;
    };
    itemDetails: {
      eId: string;
      name: string;
      imageUrl?: string;
      locator?: {
        facility: string;
        location: string;
      };
      notes: string;
      cardNotesDefault: string;
      minQuantity?: {
        amount: number;
        unit: string;
      };
      primarySupply: {
        supplier: string;
        orderQuantity: {
          amount: number;
          unit: string;
        };
        unitCost: {
          value: number;
          currency: string;
        };
      };
      defaultSupply: string;
      cardSize: string;
      labelSize: string;
      breadcrumbSize: string;
      itemColor: string;
    };
    cardQuantity: {
      amount: number;
      unit: string;
    };
    status: string;
    printStatus: string;
  };
  metadata: {
    tenantId: string;
  };
  author: string;
  retired: boolean;
}

function KanbanCardPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cardData, setCardData] = useState<KanbanCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const cardId = params.cardId as string;
  const view = searchParams.get('view');
  const src = searchParams.get('src');
  const isQrSource =
    view === 'card' && !!src && src.toLowerCase().startsWith('qr');

  useEffect(() => {
    if (!cardId) {
      setError('Card ID is required');
      setLoading(false);
      return;
    }

    const fetchCard = async () => {
      try {
        setLoading(true);
        const data = await getKanbanCard(cardId);
        setCardData(data);
      } catch (err) {
        console.error('Error fetching kanban card:', err);

        // Check if this is an authentication error
        if (isAuthenticationError(err)) {
          // Redirect to login with the current path as next parameter
          const currentPath = `/kanban/cards/${cardId}`;
          const queryString = searchParams.toString();
          const currentUrl = queryString
            ? `${currentPath}?${queryString}`
            : currentPath;
          router.push(`/signin?next=${encodeURIComponent(currentUrl)}`);
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load card');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  const handleClose = () => {
    // For QR scans, always go to items page to see the item context
    router.push('/items');
  };

  // If view=card (QR scan flow), show appropriate view based on device immediately
  // Don't wait for loading to complete - let the components handle their own loading
  if (view === 'card') {
    // On mobile, show MobileScanView with the cardId
    if (isMobile) {
      return (
        <MobileScanView
          initialCardId={cardId}
          initialView={isQrSource ? 'card' : 'list'}
          showCardToggle={isQrSource}
          onClose={handleClose}
          onScan={(scannedData) => {
            console.log('Scanned data:', scannedData);
          }}
        />
      );
    }

    // On desktop, show DesktopScanView with the cardId
    return (
      <DesktopScanView
        isOpen={true}
        onClose={handleClose}
        initialCardId={cardId}
        onScan={(scannedData) => {
          console.log('Scanned data:', scannedData);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center max-w-md mx-auto p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Card Not Found
          </h2>
          <p className='text-gray-600 mb-6'>{error}</p>
          <div className='flex gap-3 justify-center'>
            <Button
              onClick={() => router.push('/items')}
              className='px-4 py-2'
              style={{
                backgroundColor: 'var(--base-primary, #FC5A29)',
                color: 'white',
              }}
            >
              Go Home
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant='outline'
              className='px-4 py-2'
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop QR view should still render the scan dialog
  if (!isMobile && view === 'card') {
    return (
      <DesktopScanView
        isOpen={true}
        onClose={handleClose}
        initialCardId={cardId}
        onScan={(scannedData) => {
          console.log('Scanned data:', scannedData);
        }}
      />
    );
  }

  // On mobile, render the MobileScanView for both QR flow and direct links
  if (isMobile) {
    const initialView = isQrSource ? 'card' : 'list';
    return (
      <MobileScanView
        initialCardId={cardId}
        initialView={initialView}
        showCardToggle={isQrSource}
        onClose={handleClose}
        onScan={(scannedData) => {
          console.log('Scanned data:', scannedData);
        }}
      />
    );
  }

  if (!cardData) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <p className='text-gray-600'>No card data available</p>
        </div>
      </div>
    );
  }

  // Default view (could be enhanced later)
  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h1 className='text-2xl font-bold mb-4'>Kanban Card Details</h1>
          <div className='space-y-4'>
            <div>
              <label className='font-medium'>Serial Number:</label>
              <p>{cardData.payload.serialNumber}</p>
            </div>
            <div>
              <label className='font-medium'>Item:</label>
              <p>{cardData.payload.item.name}</p>
            </div>
            <div>
              <label className='font-medium'>Status:</label>
              <p>{cardData.payload.status}</p>
            </div>
            <div>
              <label className='font-medium'>Print Status:</label>
              <p>{cardData.payload.printStatus}</p>
            </div>
            <div>
              <label className='font-medium'>Quantity:</label>
              <p>
                {cardData.payload.cardQuantity.amount}{' '}
                {cardData.payload.cardQuantity.unit}
              </p>
            </div>
          </div>
          <div className='mt-6 flex gap-3'>
            <button
              onClick={handleClose}
              className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KanbanCardPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Construct the current URL for the redirect
  const currentPath = `/kanban/cards/${params.cardId}`;
  const queryString = searchParams.toString();
  const currentUrl = queryString
    ? `${currentPath}?${queryString}`
    : currentPath;
  const redirectTo = `/signin?next=${encodeURIComponent(currentUrl)}`;

  return (
    <AuthGuard redirectTo={redirectTo}>
      <KanbanCardPageContent />
    </AuthGuard>
  );
}
