/**
 * Additional ScanModal tests to supplement src/tests/ScanModal.test.tsx
 * Focus: error state, loading state, card data (success) state
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScanModal } from './ScanModal';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/scan',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/OrderQueueContext', () => ({
  useOrderQueue: () => ({
    refreshOrderQueueData: jest.fn(),
    orderQueueData: [],
  }),
}));

jest.mock('@/hooks/useOrderQueueToast', () => ({
  useOrderQueueToast: () => ({
    isToastVisible: false,
    showToast: jest.fn(),
    hideToast: jest.fn(),
    handleUndo: jest.fn(),
  }),
}));

jest.mock('@/contexts/JWTContext', () => ({
  useJWT: () => ({
    token: 'mock-token',
    isTokenValid: () => true,
  }),
}));

jest.mock('@/hooks/useAuthErrorHandler', () => ({
  useAuthErrorHandler: () => ({
    handleAuthError: jest.fn(),
  }),
}));

jest.mock('@/lib/ardaClient', () => ({
  getKanbanCard: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
  Toaster: () => null,
}));

jest.mock('qr-scanner', () => {
  return jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    destroy: jest.fn(),
  }));
});

jest.mock('@/components/items/ItemDetailsPanel', () => ({
  ItemDetailsPanel: ({ onEditItem, onClose }: { onEditItem?: () => void; onClose?: () => void }) => (
    <div data-testid='item-details-panel'>
      {onEditItem && <button onClick={onEditItem}>Edit item</button>}
      {onClose && <button onClick={onClose}>Close details</button>}
    </div>
  ),
}));

jest.mock('@/components/items/ItemFormPanel', () => ({
  ItemFormPanel: ({
    isOpen,
    onSuccess,
    onClose,
  }: {
    isOpen?: boolean;
    onSuccess?: () => void;
    onClose?: () => void;
  }) =>
    isOpen ? (
      <div data-testid='item-form-panel'>
        {onSuccess && <button onClick={onSuccess}>Submit edit</button>}
        {onClose && <button onClick={onClose}>Close form</button>}
      </div>
    ) : null,
}));

jest.mock('@/components/ui/order-queue-toast', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/lib/fly-to-target', () => ({
  flyToTarget: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./CardActions', () => ({
  CardActions: ({
    onClose,
    onViewItemDetails,
    onAddToOrderQueue,
    onReceiveCard,
    cardData,
    isAddToOrderQueueDisabled,
    isReceiveCardDisabled,
  }: {
    onClose: () => void;
    onViewItemDetails: () => void;
    onAddToOrderQueue?: (eId: string) => void;
    onReceiveCard?: () => void;
    cardData?: unknown;
    isAddToOrderQueueDisabled?: (data: unknown) => boolean;
    isReceiveCardDisabled?: (data: unknown) => boolean;
  }) => {
    const addDisabled = isAddToOrderQueueDisabled ? isAddToOrderQueueDisabled(cardData) : false;
    const rcvDisabled = isReceiveCardDisabled ? isReceiveCardDisabled(cardData) : false;
    return (
      <div data-testid='card-actions'>
        <button onClick={onClose}>Done</button>
        <button onClick={onViewItemDetails}>View item details</button>
        {onAddToOrderQueue && (
          <button onClick={() => onAddToOrderQueue('card-eid-1')} disabled={addDisabled}>
            Add to order queue
          </button>
        )}
        {onReceiveCard && (
          <button onClick={onReceiveCard} disabled={rcvDisabled}>
            Receive card
          </button>
        )}
      </div>
    );
  },
}));

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => 'mock-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

const mockCardData = {
  rId: 'r1',
  asOf: { effective: 1000, recorded: 1001 },
  author: 'user1',
  retired: false,
  metadata: { tenantId: 'T1' },
  payload: {
    eId: 'card-eid-1',
    rId: 'r1',
    lookupUrlId: 'url1',
    serialNumber: 'SN-001',
    item: { type: 'ITEM', eId: 'item-eid-1', name: 'Test Item' },
    itemDetails: {
      eId: 'item-eid-1',
      name: 'Test Item',
      imageUrl: '',
      internalSKU: 'SKU-001',
      notes: '',
      cardNotesDefault: '',
      primarySupply: { supplier: 'Acme', sku: 'ACM-001' },
      defaultSupply: 'PRIMARY',
      cardSize: 'STANDARD',
      labelSize: 'STANDARD',
      breadcrumbSize: 'STANDARD',
      itemColor: 'GRAY',
    },
    cardQuantity: { amount: 1, unit: 'EA' },
    status: 'EMPTY',
    printStatus: 'PRINTED',
  },
};

describe('ScanModal - additional states', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error state when error prop is provided', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        error='Test error message'
      />
    );
    expect(screen.getByText('Scan Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls onClose when clicking Close in error state', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        error='Some error'
      />
    );
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        loading={true}
      />
    );
    expect(screen.getByText('Looking up card...')).toBeInTheDocument();
  });

  it('shows CardActions when cardData is provided', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );
    expect(screen.getByTestId('card-actions')).toBeInTheDocument();
  });

  it('calls onClose from Done button in card data state', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );
    fireEvent.click(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows camera scanning state with video element when no card data', () => {
    render(<ScanModal isOpen={true} onClose={onClose} />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
  });

  it('does not show Cancel button when in error state', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        error='Some error'
      />
    );
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('does not show Cancel button when in loading state', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        loading={true}
      />
    );
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('does not show Cancel button when card data is present', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('shows header text in all states', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        loading={true}
      />
    );
    expect(screen.getByText('Quick Scan')).toBeInTheDocument();
  });

  it('renders ItemFormPanel when edit form is open', async () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );
    expect(screen.queryByTestId('item-form-panel')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Edit item'));
    await waitFor(() => {
      expect(screen.getByTestId('item-form-panel')).toBeInTheDocument();
    });
  });
});

describe('ScanModal - branch coverage', () => {
  const onClose = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getKanbanCard } = require('@/lib/ardaClient');

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // ===== handleViewItemDetails / handleCloseItemDetails =====

  it('opens ItemDetailsPanel when View item details is clicked with cardData', async () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('View item details'));

    await waitFor(() => {
      expect(screen.getByTestId('item-details-panel')).toBeInTheDocument();
    });
  });

  it('closes ItemDetailsPanel when Close details is clicked', async () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Close details'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-details-panel')).not.toBeInTheDocument();
    });
  });

  // ===== handleEditItem =====

  it('opens edit form when Edit item is clicked in ItemDetailsPanel', async () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Edit item'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-details-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('item-form-panel')).toBeInTheDocument();
    });
  });

  // ===== handleEditSuccess =====

  it('shows success toast on edit success', async () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Edit item'));
    await waitFor(() => screen.getByTestId('item-form-panel'));

    fireEvent.click(screen.getByText('Submit edit'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-form-panel')).not.toBeInTheDocument();
    });
  });

  // ===== handleAddToOrderQueue =====

  it('shows error toast when add to order queue response is not ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('Add to order queue'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add card to order queue');
    });
  });

  it('shows error toast when add to order queue fetch throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network error'));

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('Add to order queue'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error adding card to order queue');
    });
  });

  // ===== handleReceiveCard =====

  it('shows error toast when receive card has no auth token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Authentication token not found');
    });
  });

  it('shows error toast when receive card response is not ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to receive card');
    });
  });

  it('shows error toast when receive card data.ok is false', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: false }),
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to receive card');
    });
  });

  it('shows error toast when receive card fetch throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network error'));

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error receiving card');
    });
  });

  it('shows success toast and calls onReceiveCard when receive card succeeds', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    const onReceiveCard = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
    (getKanbanCard as jest.Mock).mockResolvedValue(mockCardData);

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
        onReceiveCard={onReceiveCard}
      />
    );

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // ===== isAddToOrderQueueDisabled / isReceiveCardDisabled =====

  it('disables Add to order queue for REQUESTED status', () => {
    const requestedCard = {
      ...mockCardData,
      payload: { ...mockCardData.payload, status: 'REQUESTED' },
    };
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={requestedCard}
      />
    );

    expect(screen.getByText('Add to order queue')).toBeDisabled();
  });

  it('disables Receive card when status is FULFILLED', () => {
    const fulfilledCard = {
      ...mockCardData,
      payload: { ...mockCardData.payload, status: 'FULFILLED' },
    };
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={fulfilledCard}
      />
    );

    expect(screen.getByText('Receive card')).toBeDisabled();
  });

  it('enables Add to order queue when cardData has no status', () => {
    const noStatusCard = {
      ...mockCardData,
      payload: { ...mockCardData.payload, status: '' },
    };
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={noStatusCard}
      />
    );

    expect(screen.getByText('Add to order queue')).not.toBeDisabled();
  });

  it('enables Receive card when cardData has no status', () => {
    const noStatusCard = {
      ...mockCardData,
      payload: { ...mockCardData.payload, status: '' },
    };
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={noStatusCard}
      />
    );

    expect(screen.getByText('Receive card')).not.toBeDisabled();
  });

  it('closes edit form via handleCloseEditForm', async () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Edit item'));
    await waitFor(() => screen.getByTestId('item-form-panel'));

    fireEvent.click(screen.getByText('Close form'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-form-panel')).not.toBeInTheDocument();
    });
  });

  it('shows no error and calls refreshOrderQueue on add to order queue success (data.ok=true)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('Add to order queue'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/event/request'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('logs error when add to order queue data.ok is false', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: false, message: 'Already in queue' }),
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        cardData={mockCardData}
      />
    );

    fireEvent.click(screen.getByText('Add to order queue'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('clicks Try Again button to trigger restartScanning', async () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={onClose}
        error='Some scan error'
      />
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Try Again'));

    // No crash expected
    expect(screen.getByText('Scan Error')).toBeInTheDocument();
  });
});
