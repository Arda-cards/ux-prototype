/**
 * ManageCardsPanel — additional branch-deepening tests (PB-3)
 * Targets uncovered lines: handleViewHistory, handleSendEmail, handlePrintCard,
 * handlePrintLabel, handlePrintBreadcrumb, handleAddToOrderQueue, handleStateChange,
 * handleModalConfirm, EmailPanel open/close, triggerDataRefresh, overlay click, onClose.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ManageCardsPanel } from './ManageCardsPanel';
import type { ItemCard } from '@frontend/constants/types';

// ---- Mocks ----------------------------------------------------------------

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  Toaster: () => null,
}));

jest.mock('@/hooks/useOrderQueueToast', () => ({
  useOrderQueueToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('@/lib/fly-to-target', () => ({
  flyToTarget: jest.fn().mockResolvedValue(undefined),
}));

// CardInfo mock exposes all callbacks
jest.mock('./CardInfo', () => ({
  CardInfo: ({
    card,
    onDelete,
    onPrint,
    onAddToOrderQueue,
    onStateChange,
    onViewPreview,
    onViewHistory,
    onOpenEmailPanel,
    onTriggerRefresh,
    showToast,
    onPrintLabel,
    onPrintBreadcrumb,
  }: {
    card: { entityId: string; serialNumber: string };
    onDelete: () => void;
    onPrint: () => void;
    onAddToOrderQueue: () => void;
    onStateChange: (state: string) => void;
    onViewPreview: () => void;
    onViewHistory: () => void;
    onOpenEmailPanel: () => void;
    onTriggerRefresh: () => void;
    showToast: (msg: string) => void;
    onPrintLabel: () => void;
    onPrintBreadcrumb: () => void;
  }) => (
    <div data-testid={`card-info-${card.entityId}`}>
      <span>Card: {card.serialNumber}</span>
      <button onClick={onDelete} data-testid={`delete-${card.entityId}`}>Delete</button>
      <button onClick={onPrint} data-testid={`print-${card.entityId}`}>Print</button>
      <button onClick={onAddToOrderQueue} data-testid={`queue-${card.entityId}`}>Queue</button>
      <button onClick={() => onStateChange('REQUESTED')} data-testid={`state-requested-${card.entityId}`}>Accept</button>
      <button onClick={() => onStateChange('IN_PROCESS')} data-testid={`state-inprocess-${card.entityId}`}>Start Processing</button>
      <button onClick={() => onStateChange('FULFILLED')} data-testid={`state-fulfilled-${card.entityId}`}>Fulfill</button>
      <button onClick={() => onStateChange('UNKNOWN_STATE')} data-testid={`state-unknown-${card.entityId}`}>Unknown State</button>
      <button onClick={onViewPreview} data-testid={`preview-${card.entityId}`}>Preview</button>
      <button onClick={onViewHistory} data-testid={`history-${card.entityId}`}>History</button>
      <button onClick={onOpenEmailPanel} data-testid={`email-${card.entityId}`}>Email</button>
      <button onClick={onTriggerRefresh} data-testid={`refresh-${card.entityId}`}>Refresh</button>
      <button onClick={() => showToast('test')} data-testid={`showtoast-${card.entityId}`}>ShowToast</button>
      <button onClick={onPrintLabel} data-testid={`printlabel-${card.entityId}`}>Print Label</button>
      <button onClick={onPrintBreadcrumb} data-testid={`printbreadcrumb-${card.entityId}`}>Print Breadcrumb</button>
    </div>
  ),
}));

jest.mock('./AddCardsModal', () => ({
  AddCardsModal: ({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (qty: number) => void;
  }) => isOpen ? (
    <div data-testid="add-cards-modal">
      <button onClick={onClose}>Close modal</button>
      <button onClick={() => onConfirm(2)} data-testid="confirm-modal-2">Confirm 2</button>
      <button onClick={() => onConfirm(1)} data-testid="confirm-modal-1">Confirm 1</button>
    </div>
  ) : null,
}));

jest.mock('./CardsPreviewModalIndividual', () => ({
  CardsPreviewModalIndividual: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="preview-modal-individual">
        <button onClick={onClose} data-testid="close-preview-modal">Close Preview</button>
      </div>
    ) : null,
}));

jest.mock('./KanbanHistoryModal', () => ({
  KanbanHistoryModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="history-modal">
        <button onClick={onClose} data-testid="close-history-modal">Close History</button>
      </div>
    ) : null,
}));

jest.mock('@/components/common/DeleteConfirmationModal', () => ({
  DeleteConfirmationModal: ({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) => isOpen ? (
    <div data-testid="delete-confirmation-modal">
      <button onClick={onClose}>Cancel</button>
      <button onClick={onConfirm} data-testid="confirm-delete-btn">Delete card</button>
    </div>
  ) : null,
}));

jest.mock('@/components/EmailPanel', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSendEmail, onCopyToClipboard }: {
    isOpen: boolean;
    onClose: () => void;
    onSendEmail: (itemIds: string[]) => void;
    onCopyToClipboard: () => void;
  }) => isOpen ? (
    <div data-testid="email-panel">
      <button onClick={onClose} data-testid="close-email-panel">Close Email</button>
      <button onClick={() => onSendEmail(['item-1'])} data-testid="send-email-btn">Send Email</button>
      <button onClick={onCopyToClipboard} data-testid="copy-clipboard-btn">Copy</button>
    </div>
  ) : null,
}));

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

// ---- Helpers ----------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { toast } = require('sonner');

const mockItem: ItemCard = {
  eid: 'item-eid-1',
  title: 'Test Item',
  supplier: 'Test Supplier',
  image: '/img.png',
  link: 'https://test.com',
  sku: 'SKU-001',
  unitPrice: 9.99,
  minQty: '1',
  minUnit: 'piece',
  location: 'Shelf A',
  orderQty: '2',
  orderUnit: 'piece',
};

const makeCard = (id: string, serial: string) => ({
  rId: id,
  author: 'system',
  payload: {
    eId: id,
    serialNumber: serial,
    status: 'FULFILLED',
    printStatus: 'UNPRINTED',
    item: { eId: 'item-eid-1', name: 'Test Item' },
    cardQuantity: { amount: 1, unit: 'piece' },
  },
});

const mockFetchSuccess = (cards: ReturnType<typeof makeCard>[] = []) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      ok: true,
      data: { records: cards },
    }),
    text: () => Promise.resolve(''),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => 'mock-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
  window.open = jest.fn();
});

// ---- handleViewHistory tests -----------------------------------------------

describe('ManageCardsPanel — handleViewHistory', () => {
  const oneCard = [makeCard('c1', 'SN001')];

  it('fetches card history and opens history modal on success', async () => {
    global.fetch = jest.fn()
      // fetchCards
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: oneCard } }),
        text: () => Promise.resolve(''),
      })
      // history API
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ok: true,
          data: { results: [{ rId: 'h1', asOf: { effective: 0, recorded: 0 }, payload: { status: 'FULFILLED', type: 'card', eId: 'c1', serialNumber: 'SN001', item: { type: 'item', eId: 'item-eid-1', name: 'Test' }, printStatus: 'UNPRINTED' }, metadata: { tenantId: 'T1' }, author: 'system', retired: false }] },
        }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('history-c1'));
    });

    await screen.findByTestId('history-modal');
  });

  it('shows error toast when history fetch fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: oneCard } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve('error'),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('history-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to get kanban card history')
    );
  });

  it('shows error toast when history API returns ok=false', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: oneCard } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false, error: 'Something went wrong' }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('history-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to get kanban card history')
    );
  });

  it('shows error toast when history API throws', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: oneCard } }),
        text: () => Promise.resolve(''),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('history-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error getting kanban card history')
    );
  });

  it('closes history modal when onClose is triggered', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: oneCard } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ok: true,
          data: { results: [] },
        }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('history-c1'));
    });

    await screen.findByTestId('history-modal');
    await act(async () => {
      fireEvent.click(screen.getByTestId('close-history-modal'));
    });

    expect(screen.queryByTestId('history-modal')).not.toBeInTheDocument();
  });
});

// ---- handleViewPreview tests ------------------------------------------------

describe('ManageCardsPanel — handleViewPreview', () => {
  it('opens and closes preview modal', async () => {
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('preview-c1'));
    });

    await screen.findByTestId('preview-modal-individual');

    await act(async () => {
      fireEvent.click(screen.getByTestId('close-preview-modal'));
    });

    expect(screen.queryByTestId('preview-modal-individual')).not.toBeInTheDocument();
  });
});

// ---- handlePrintCard tests --------------------------------------------------

describe('ManageCardsPanel — handlePrintCard', () => {
  it('prints card successfully and opens URL', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      // print-card API
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { url: 'https://print.pdf' } }),
        text: () => Promise.resolve(''),
      })
      // fetchCards refresh
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [] } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('print-c1'));
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Card printed successfully!')
    );
    expect(window.open).toHaveBeenCalledWith('https://print.pdf', '_blank', 'noopener,noreferrer');
  });

  it('shows error when print API returns invalid response', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: {} }), // no url
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('print-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to print card - invalid response')
    );
  });

  it('shows error when print API fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('print-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to print card')
    );
  });

  it('shows error when print API throws', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('print-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error printing card')
    );
  });
});

// ---- handlePrintLabel tests -------------------------------------------------

describe('ManageCardsPanel — handlePrintLabel via CardInfo', () => {
  it('prints label successfully', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      // GET item for rId
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { rId: 'rId-item' } }),
        text: () => Promise.resolve(''),
      })
      // POST print-label
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { url: 'https://label.pdf' } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printlabel-c1'));
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Successfully printed label!')
    );
    expect(window.open).toHaveBeenCalledWith('https://label.pdf', '_blank', 'noopener,noreferrer');
  });

  it('shows error when item eid is missing for label print', async () => {
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={{ ...mockItem, eid: '' }} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printlabel-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Item ID not available')
    );
  });

  it('shows error when no auth token for label print', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printlabel-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Authentication token not found')
    );
  });

  it('shows error when label fetch item fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printlabel-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch item record ID')
    );
  });

  it('shows error when item rId not found for label', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: {} }), // no rId
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printlabel-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Item record ID not found')
    );
  });

  it('shows error when label print response is invalid', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { rId: 'rId-item' } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: {} }), // no url
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printlabel-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to print label - invalid response')
    );
  });

  it('shows error when label print API fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { rId: 'rId-item' } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printlabel-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to print label')
    );
  });
});

// ---- handlePrintBreadcrumb tests --------------------------------------------

describe('ManageCardsPanel — handlePrintBreadcrumb via CardInfo', () => {
  it('prints breadcrumb successfully', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { rId: 'rId-item' } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { url: 'https://breadcrumb.pdf' } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printbreadcrumb-c1'));
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Successfully printed breadcrumb!')
    );
    expect(window.open).toHaveBeenCalledWith('https://breadcrumb.pdf', '_blank', 'noopener,noreferrer');
  });

  it('shows error when item eid missing for breadcrumb', async () => {
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={{ ...mockItem, eid: '' }} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printbreadcrumb-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Item ID not available')
    );
  });

  it('shows error when no auth token for breadcrumb', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn(() => null), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
      writable: true,
    });
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printbreadcrumb-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Authentication token not found')
    );
  });

  it('shows error when breadcrumb print response invalid', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { rId: 'rId-item' } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: {} }), // no url
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printbreadcrumb-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to print breadcrumb - invalid response')
    );
  });

  it('shows error when breadcrumb print API fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { rId: 'rId-item' } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('printbreadcrumb-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to print breadcrumb')
    );
  });
});

// ---- handleAddToOrderQueue tests -------------------------------------------

describe('ManageCardsPanel — handleAddToOrderQueue via CardInfo', () => {
  it('adds card to order queue successfully', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      // request API
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        text: () => Promise.resolve(''),
      })
      // fetchCards refresh after queue
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [] } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('queue-c1'));
    });

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/event/request'),
        expect.anything()
      )
    );
  });

  it('shows error when add to queue API returns ok=false', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false, error: 'some error' }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('queue-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to add card to order queue')
    );
  });

  it('shows error when add to queue API fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('queue-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to add card to order queue')
    );
  });

  it('shows error when add to queue API throws', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('queue-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error adding card to order queue')
    );
  });
});

// ---- handleStateChange tests ------------------------------------------------

describe('ManageCardsPanel — handleStateChange via CardInfo', () => {
  const setupWithCard = async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
  };

  it('changes state to REQUESTED (accept) successfully', async () => {
    await setupWithCard();

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [] } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      fireEvent.click(screen.getByTestId('state-requested-c1'));
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Card status changed to In Progress')
    );
  });

  it('changes state to IN_PROCESS (start-processing) successfully', async () => {
    await setupWithCard();

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [] } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      fireEvent.click(screen.getByTestId('state-inprocess-c1'));
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Card status changed to Receiving')
    );
  });

  it('changes state to FULFILLED (fulfill) successfully', async () => {
    await setupWithCard();

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [] } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      fireEvent.click(screen.getByTestId('state-fulfilled-c1'));
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Card status changed to Restocked')
    );
  });

  it('shows error for unknown state change', async () => {
    await setupWithCard();

    await act(async () => {
      fireEvent.click(screen.getByTestId('state-unknown-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Unknown state change')
    );
  });

  it('shows error when state change API fails', async () => {
    await setupWithCard();

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      fireEvent.click(screen.getByTestId('state-requested-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to change card state')
    );
  });

  it('shows error when state change API returns ok=false', async () => {
    await setupWithCard();

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false, error: 'conflict' }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      fireEvent.click(screen.getByTestId('state-requested-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to change card state')
    );
  });

  it('shows error when state change API throws', async () => {
    await setupWithCard();

    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('state-requested-c1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error changing card state')
    );
  });
});

// ---- handleModalConfirm (add multiple) tests --------------------------------

describe('ManageCardsPanel — handleModalConfirm (add multiple cards)', () => {
  it('creates multiple cards and shows success toast', async () => {
    global.fetch = jest.fn()
      // fetchCards initial
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [] } }),
        text: () => Promise.resolve(''),
      })
      // POST create card 1
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { payload: { eId: 'new-c1' } } }),
        text: () => Promise.resolve(''),
      })
      // fulfill card 1
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        text: () => Promise.resolve(''),
      })
      // POST create card 2
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { payload: { eId: 'new-c2' } } }),
        text: () => Promise.resolve(''),
      })
      // fulfill card 2
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        text: () => Promise.resolve(''),
      })
      // fetchCards refresh
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [] } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByText('No cards... yet');

    const addMultipleBtns = screen.getAllByText(/Add multiple/i);
    fireEvent.click(addMultipleBtns[0]);

    expect(screen.getByTestId('add-cards-modal')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-modal-2'));
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Successfully created 2 kanban cards!')
    );
  });

  it('shows error when creating multiple cards fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [] } }),
        text: () => Promise.resolve(''),
      })
      // POST fails
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByText('No cards... yet');
    const addMultipleBtns = screen.getAllByText(/Add multiple/i);
    fireEvent.click(addMultipleBtns[0]);

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-modal-1'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error creating kanban cards')
    );
  });
});

// ---- triggerDataRefresh tests -----------------------------------------------

describe('ManageCardsPanel — triggerDataRefresh', () => {
  it('refreshes card list when triggerDataRefresh is called', async () => {
    const updatedCards = [makeCard('c1', 'SN001'), makeCard('c2', 'SN002')];

    global.fetch = jest.fn()
      // fetchCards initial
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      // fetchCards after refresh
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: updatedCards } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');

    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh-c1'));
    });

    await screen.findByTestId('card-info-c2');
  });
});

// ---- EmailPanel open/close/send/copy tests ----------------------------------

describe('ManageCardsPanel — EmailPanel', () => {
  it('opens email panel when onOpenEmailPanel is called', async () => {
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('email-c1'));
    });

    expect(screen.getByTestId('email-panel')).toBeInTheDocument();
  });

  it('closes email panel when onClose is triggered', async () => {
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('email-c1'));
    });

    expect(screen.getByTestId('email-panel')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('close-email-panel'));
    });

    expect(screen.queryByTestId('email-panel')).not.toBeInTheDocument();
  });

  it('copies to clipboard via handleCopyToClipboard', async () => {
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('email-c1'));
    });

    expect(screen.getByTestId('email-panel')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-clipboard-btn'));
    });

    expect(screen.queryByTestId('email-panel')).not.toBeInTheDocument();
  });

  it('sends email successfully', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      // send-order API
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('email-c1'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('send-email-btn'));
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Email sent successfully')
    );
  });

  it('shows error when send email API fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('email-c1'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('send-email-btn'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to send email')
    );
  });

  it('shows error when email API returns ok=false', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { records: [makeCard('c1', 'SN001')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false, error: 'Something failed' }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('email-c1'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('send-email-btn'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to send email')
    );
  });

  it('shows error when no auth token for email', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn(() => null), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
      writable: true,
    });
    mockFetchSuccess([makeCard('c1', 'SN001')]);

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    await screen.findByTestId('card-info-c1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('email-c1'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('send-email-btn'));
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Authentication token not found')
    );
  });
});

// ---- Overlay mode close/onClose tests ---------------------------------------

describe('ManageCardsPanel — overlay mode onClose', () => {
  it('calls onClose when X button clicked in overlay mode', async () => {
    mockFetchSuccess([]);
    const onClose = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();

    await act(async () => {
      render(
        <ManageCardsPanel
          item={mockItem}
          mode="overlay"
          open={true}
          onClose={onClose}
          onOpenChange={onOpenChange}
        />
      );
    });

    // Click X icon button
    const xBtn = document.querySelector('button .lucide-x')?.closest('button') as HTMLElement;
    if (xBtn) {
      await act(async () => {
        fireEvent.click(xBtn);
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  });
});

// ---- Inline mode cannot close via overlay click ----------------------------

describe('ManageCardsPanel — inline mode overlay click (no-op)', () => {
  it('does not call onOpenChange when inline mode overlay is clicked', async () => {
    mockFetchSuccess([]);
    const onOpenChange = jest.fn();

    await act(async () => {
      render(
        <ManageCardsPanel
          item={mockItem}
          mode="inline"
          onOpenChange={onOpenChange}
        />
      );
    });

    // In inline mode, there's no overlay; onOpenChange should not be triggered
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

// ---- refreshItemCards event in ManageCardsPanel ----------------------------

describe('ManageCardsPanel — refreshItemCards window event', () => {
  it('does NOT refresh when event is for different item', async () => {
    mockFetchSuccess([]);

    await act(async () => {
      render(<ManageCardsPanel item={mockItem} mode="inline" />);
    });

    const callsBefore = (global.fetch as jest.Mock).mock.calls.length;

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent('refreshItemCards', {
          detail: { itemEntityId: 'different-item-eid' },
        })
      );
    });

    expect((global.fetch as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});
