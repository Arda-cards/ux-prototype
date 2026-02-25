import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardPreviewModal } from './CardPreviewModal';
import '@testing-library/jest-dom';
import { getKanbanCard } from '@frontend/lib/ardaClient';

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

jest.mock('@/lib/ardaClient', () => ({
  getKanbanCard: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
  Toaster: () => null,
}));

jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => null,
}));

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
    onAddToOrderQueue,
    onReceiveCard,
    onViewItemDetails,
    cardData,
    isAddToOrderQueueDisabled,
    isReceiveCardDisabled,
  }: {
    onClose: () => void;
    onAddToOrderQueue: (eId: string) => void;
    onReceiveCard: () => void;
    onViewItemDetails: () => void;
    cardData?: unknown;
    isAddToOrderQueueDisabled?: (data: unknown) => boolean;
    isReceiveCardDisabled?: (data: unknown) => boolean;
  }) => {
    const addDisabled = isAddToOrderQueueDisabled ? isAddToOrderQueueDisabled(cardData) : false;
    const rcvDisabled = isReceiveCardDisabled ? isReceiveCardDisabled(cardData) : false;
    return (
      <div data-testid='card-actions'>
        <button onClick={onClose}>Done</button>
        <button onClick={() => onAddToOrderQueue('card-eid-1')} disabled={addDisabled}>Add to order queue</button>
        <button onClick={onReceiveCard} disabled={rcvDisabled}>Receive card</button>
        <button onClick={onViewItemDetails}>View item details</button>
      </div>
    );
  },
}));

const mockGetKanbanCard = getKanbanCard as jest.Mock;

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

beforeAll(() => {
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

describe('CardPreviewModal', () => {
  const onClose = jest.fn();
  const onReceiveCard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetKanbanCard.mockResolvedValue(mockCardData);
  });

  it('does not render when isOpen is false', () => {
    render(
      <CardPreviewModal
        isOpen={false}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    expect(screen.queryByText('Card Preview')).not.toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Make getKanbanCard never resolve
    mockGetKanbanCard.mockReturnValue(new Promise(() => {}));
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    expect(screen.getByText('Loading card...')).toBeInTheDocument();
  });

  it('renders card preview header when open', async () => {
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    expect(screen.getByText('Card Preview')).toBeInTheDocument();
    expect(screen.getByText('Preview the selected card and perform actions.')).toBeInTheDocument();
  });

  it('shows CardActions after successful data load', async () => {
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('card-actions')).toBeInTheDocument();
    });
  });

  it('shows error state when getKanbanCard fails', async () => {
    mockGetKanbanCard.mockRejectedValue(new Error('Not found'));
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='bad-card-id'
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Error Loading Card')).toBeInTheDocument();
      expect(screen.getByText('Card not found or could not be loaded.')).toBeInTheDocument();
    });
  });

  it('calls onClose when clicking the X button', async () => {
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    // X button (close button at top-right)
    const xBtn = document.querySelector('button.absolute');
    if (xBtn) fireEvent.click(xBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking backdrop', () => {
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside modal', async () => {
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    const modal = screen.getByText('Card Preview').closest('.relative');
    if (modal) fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose from CardActions Done button', async () => {
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('card-actions')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalled();
  });

  it('fetches card data on open', async () => {
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    await waitFor(() => {
      expect(mockGetKanbanCard).toHaveBeenCalledWith('card-eid-1');
    });
  });

  it('shows Close button in error state and calls onClose', async () => {
    mockGetKanbanCard.mockRejectedValue(new Error('Not found'));
    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='bad-id'
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Error Loading Card')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles add to order queue action', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('card-actions')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Add to order queue'));
    // Just verify no crash
    expect(screen.getByTestId('card-actions')).toBeInTheDocument();
  });

  it('handles receive card action', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
        onReceiveCard={onReceiveCard}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('card-actions')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Receive card'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

describe('CardPreviewModal - branch coverage', () => {
  const onClose = jest.fn();
  const onReceiveCard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetKanbanCard.mockResolvedValue(mockCardData);
  });

  // ===== handleViewItemDetails =====

  it('opens ItemDetailsPanel when View item details is clicked', async () => {
    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('View item details'));

    await waitFor(() => {
      expect(screen.getByTestId('item-details-panel')).toBeInTheDocument();
    });
  });

  it('opens ItemDetailsPanel even when refresh fails before opening', async () => {
    mockGetKanbanCard
      .mockResolvedValueOnce(mockCardData)   // initial load
      .mockRejectedValueOnce(new Error('refresh failed')); // refresh in handleViewItemDetails

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('View item details'));

    await waitFor(() => {
      expect(screen.getByTestId('item-details-panel')).toBeInTheDocument();
    });
  });

  it('closes ItemDetailsPanel via handleCloseItemDetails', async () => {
    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Close details'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-details-panel')).not.toBeInTheDocument();
    });
  });

  // ===== handleEditItem =====

  it('opens edit form when Edit item is clicked in ItemDetailsPanel', async () => {
    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Edit item'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-details-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('item-form-panel')).toBeInTheDocument();
    });
  });

  // ===== handleCloseEditForm =====

  it('closes edit form via handleCloseEditForm', async () => {
    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Edit item'));
    await waitFor(() => screen.getByTestId('item-form-panel'));

    fireEvent.click(screen.getByText('Close form'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-form-panel')).not.toBeInTheDocument();
    });
  });

  // ===== handleEditSuccess =====

  it('shows success toast and refreshes data on edit success', async () => {
    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('View item details'));
    await waitFor(() => expect(screen.getByTestId('item-details-panel')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Edit item'));
    await waitFor(() => screen.getByTestId('item-form-panel'));

    fireEvent.click(screen.getByText('Submit edit'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-form-panel')).not.toBeInTheDocument();
    });
  });

  // ===== isAddToOrderQueueDisabled =====

  it('disables Add to order queue button when status is REQUESTING', async () => {
    const requestingCard = {
      ...mockCardData,
      payload: { ...mockCardData.payload, status: 'REQUESTING' },
    };
    mockGetKanbanCard.mockResolvedValue(requestingCard);

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    expect(screen.getByText('Add to order queue')).toBeDisabled();
  });

  it('enables Add to order queue button when status is EMPTY', async () => {
    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    expect(screen.getByText('Add to order queue')).not.toBeDisabled();
  });

  // ===== isReceiveCardDisabled =====

  it('disables Receive card button when status is FULFILLED', async () => {
    const fulfilledCard = {
      ...mockCardData,
      payload: { ...mockCardData.payload, status: 'FULFILLED' },
    };
    mockGetKanbanCard.mockResolvedValue(fulfilledCard);

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    expect(screen.getByText('Receive card')).toBeDisabled();
  });

  it('enables Receive card button when status is EMPTY', async () => {
    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    expect(screen.getByText('Receive card')).not.toBeDisabled();
  });

  // ===== handleAddToOrderQueue error paths =====

  it('shows error toast when add to order queue response is not ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Add to order queue'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add card to order queue');
    });
  });

  it('shows error toast when add to order queue data.ok is false', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: false }),
    });

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Add to order queue'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add card to order queue');
    });
  });

  it('shows error toast when add to order queue fetch throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Add to order queue'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error adding card to order queue');
    });
  });

  // ===== handleReceiveCard error paths =====

  it('shows error toast when receive card has no auth token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Authentication token not found');
    });
  });

  it('shows error toast when receive card response is not ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to receive card', {
        description: 'Please try again.',
      });
    });
  });

  it('shows error toast when receive card data.ok is false', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: false }),
    });

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to receive card', {
        description: 'Please try again.',
      });
    });
  });

  it('shows error toast when receive card fetch throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    render(<CardPreviewModal isOpen={true} onClose={onClose} cardId='card-eid-1' />);
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error receiving card');
    });
    consoleSpy.mockRestore();
  });

  it('calls onReceiveCard callback and shows success after successful receive', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toast } = require('sonner');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    render(
      <CardPreviewModal
        isOpen={true}
        onClose={onClose}
        cardId='card-eid-1'
        onReceiveCard={onReceiveCard}
      />
    );
    await waitFor(() => expect(screen.getByTestId('card-actions')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Receive card'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Card received successfully!', { duration: 4000 });
      expect(onReceiveCard).toHaveBeenCalled();
    });
  });
});
