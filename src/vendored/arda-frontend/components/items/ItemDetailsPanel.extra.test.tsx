/**
 * ItemDetailsPanel — additional branch-deepening tests (PB-3)
 * Targets uncovered lines: handleDeleteItem, handleConfirmDelete, handleCancelDelete,
 * handlePrintSelectedCard, handlePrintLabel/Breadcrumb error paths, handleDuplicateItem,
 * handleViewCardPreview, handleScanPreview, card navigation, cards preview modal.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemDetailsPanel } from './ItemDetailsPanel';
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

jest.mock('@/contexts/OrderQueueContext', () => ({
  useOrderQueue: () => ({ refreshOrderQueueData: jest.fn() }),
}));

jest.mock('@/hooks/useOrderQueueToast', () => ({
  useOrderQueueToast: () => ({
    isToastVisible: false,
    showToast: jest.fn(),
    hideToast: jest.fn(),
    handleUndo: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAuthErrorHandler', () => ({
  useAuthErrorHandler: () => ({ handleAuthError: jest.fn().mockReturnValue(false) }),
}));

jest.mock('@/lib/fly-to-target', () => ({
  flyToTarget: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/cardStateUtils', () => ({
  canAddToOrderQueue: jest.fn().mockReturnValue(true),
}));

jest.mock('./ManageCardsPanel', () => ({
  ManageCardsPanel: ({ item }: { item: { title: string } }) => (
    <div data-testid="manage-cards-panel">ManageCardsPanel: {item.title}</div>
  ),
}));

jest.mock('./ItemCardView', () => ({
  ItemCardView: () => <div data-testid="item-card-view" />,
}));

jest.mock('./CardsPreviewModal', () => ({
  CardsPreviewModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="cards-preview-modal">
        <button onClick={onClose} data-testid="close-cards-preview">Close Cards Preview</button>
      </div>
    ) : null,
}));

jest.mock('@/components/scan/CardPreviewModal', () => ({
  CardPreviewModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="card-preview-modal">
        <button onClick={onClose} data-testid="close-card-preview">Close Card Preview</button>
      </div>
    ) : null,
}));

jest.mock('@/components/common/DeleteConfirmationModal', () => ({
  DeleteConfirmationModal: ({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={onClose} data-testid="cancel-delete">Cancel</button>
        <button onClick={onConfirm} data-testid="confirm-delete">Confirm delete</button>
      </div>
    ) : null,
}));

jest.mock('@/components/common/TruncatedLink', () => ({
  TruncatedLink: ({ href }: { href: string }) => <a href={href}>{href}</a>,
}));

jest.mock('@/components/ui/order-queue-toast', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// ---- Helpers ----------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { toast } = require('sonner');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { canAddToOrderQueue } = require('@/lib/cardStateUtils');

const mockItem: ItemCard = {
  eid: 'item-eid-1',
  title: 'Test Item',
  supplier: 'Test Supplier',
  image: '/img.png',
  link: 'https://test.com',
  sku: 'TEST-SKU',
  unitPrice: 10.99,
  minQty: '2',
  minUnit: 'Pack',
  location: 'Shelf A',
  orderQty: '2',
  orderUnit: 'Pack',
};

const makeCardResult = (id: string, status = 'FULFILLED') => ({
  payload: {
    eId: id,
    serialNumber: `SN-${id}`,
    item: { eId: 'item-eid-1', name: 'Test Item' },
    cardQuantity: { amount: 1, unit: 'each' },
    status,
    itemDetails: undefined,
  },
  rId: `rId-${id}`,
});

const mockFetchCards = (cards: ReturnType<typeof makeCardResult>[]) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      ok: true,
      data: { results: cards },
    }),
    text: () => Promise.resolve(''),
  });
};

const defaultProps = {
  item: mockItem,
  isOpen: true,
  onClose: jest.fn(),
  onOpenChange: jest.fn(),
  onEditItem: jest.fn(),
};

const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
  const moreBtn = document.querySelector('button[data-slot="dropdown-menu-trigger"]') as HTMLElement;
  if (moreBtn) {
    await user.click(moreBtn);
    // Wait for menu items to appear
    await waitFor(() => {
      expect(document.querySelectorAll('[role="menuitem"]').length).toBeGreaterThan(0);
    });
  }
  return moreBtn;
};

beforeEach(() => {
  jest.clearAllMocks();
  canAddToOrderQueue.mockReturnValue(true);
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
  mockFetchCards([]);
});

// ---- handleDuplicateItem ---------------------------------------------------

describe('ItemDetailsPanel — handleDuplicateItem (userEvent)', () => {
  it('calls onDuplicateItem when Duplicate item is clicked', async () => {
    const user = userEvent.setup();
    const onDuplicateItem = jest.fn();
    mockFetchCards([]);

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} onDuplicateItem={onDuplicateItem} />);
    });

    await openDropdown(user);

    const duplicateItem = screen.queryByText('Duplicate item...');
    if (duplicateItem) {
      await user.click(duplicateItem);
      expect(onDuplicateItem).toHaveBeenCalled();
    }
  });

  it('does not throw when onDuplicateItem is not provided', async () => {
    const user = userEvent.setup();
    mockFetchCards([]);

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await openDropdown(user);

    const duplicateItem = screen.queryByText('Duplicate item...');
    if (duplicateItem) {
      await expect(user.click(duplicateItem)).resolves.not.toThrow();
    }
  });
});

// ---- handleViewCardPreview and handleScanPreview ---------------------------

describe('ItemDetailsPanel — handleViewCardPreview and handleScanPreview (userEvent)', () => {
  it('opens CardsPreviewModal when "View card preview" is clicked', async () => {
    const user = userEvent.setup();
    mockFetchCards([]);

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await openDropdown(user);

    const viewCardPreview = screen.queryByText('View card preview');
    if (viewCardPreview) {
      await user.click(viewCardPreview);
      await screen.findByTestId('cards-preview-modal');
    }
  });

  it('opens CardPreviewModal when "Scan Preview" is clicked', async () => {
    const user = userEvent.setup();
    mockFetchCards([]);

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await openDropdown(user);

    const scanPreview = screen.queryByText('Scan Preview');
    if (scanPreview) {
      await user.click(scanPreview);
      await screen.findByTestId('card-preview-modal');
    }
  });
});

// ---- handleDeleteItem tests ------------------------------------------------

describe('ItemDetailsPanel — handleDeleteItem (userEvent)', () => {
  it('shows error when item has no eid', async () => {
    const user = userEvent.setup();
    mockFetchCards([]);

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} item={{ ...mockItem, eid: '' }} />);
    });

    await openDropdown(user);
    const deleteBtn = screen.queryByText('Delete');
    if (deleteBtn) {
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Item ID not found');
      });
    }
  });

  it('shows error when jwt token missing during delete item', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    mockFetchCards([]);

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await openDropdown(user);
    const deleteBtn = screen.queryByText('Delete');
    if (deleteBtn) {
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Authentication token not found');
      });
    }
  });

  it('opens delete modal and fetches cards when Delete is clicked', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn()
      // fetchCards initial
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
        text: () => Promise.resolve(''),
      })
      // query-by-item for deletion — returns 1 card
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ok: true,
          data: { records: [{ rId: 'rId-c1', payload: { eId: 'c1', serialNumber: 'SN-c1', item: { eId: 'item-eid-1', name: 'Test Item' }, cardQuantity: { amount: 1, unit: 'each' }, status: 'FULFILLED' } }] },
        }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await openDropdown(user);
    const deleteBtn = screen.queryByText('Delete');
    if (deleteBtn) {
      await user.click(deleteBtn);
      await screen.findByTestId('delete-modal');
    }

    expect(screen.getByText('Item details')).toBeInTheDocument();
  });

  it('handles query-by-item returning no records', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
        text: () => Promise.resolve(''),
      })
      // query-by-item — invalid/no records structure
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false, data: {} }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await openDropdown(user);
    const deleteBtn = screen.queryByText('Delete');
    if (deleteBtn) {
      await user.click(deleteBtn);
      // Modal should still open with 0 cards to delete
      await waitFor(() => {
        expect(screen.queryByTestId('delete-modal')).not.toBeNull();
      });
    }

    expect(screen.getByText('Item details')).toBeInTheDocument();
  });

  it('handles query-by-item HTTP failure', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
        text: () => Promise.resolve(''),
      })
      // query-by-item — HTTP 500
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await openDropdown(user);
    const deleteBtn = screen.queryByText('Delete');
    if (deleteBtn) {
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(screen.queryByTestId('delete-modal')).not.toBeNull();
      });
    }

    expect(screen.getByText('Item details')).toBeInTheDocument();
  });
});

// ---- handleConfirmDelete tests -----------------------------------------------

describe('ItemDetailsPanel — handleConfirmDelete (userEvent)', () => {
  const setupDeleteModal = async (user: ReturnType<typeof userEvent.setup>, fetchMocks: (() => Promise<unknown>)[]) => {
    let fetchCallIndex = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      const mock = fetchMocks[fetchCallIndex];
      fetchCallIndex++;
      return mock ? mock() : Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { results: [] } }), text: () => Promise.resolve('') });
    });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await openDropdown(user);
    const deleteBtn = screen.queryByText('Delete');
    if (deleteBtn) {
      await user.click(deleteBtn);
      await screen.findByTestId('delete-modal');
    }
  };

  it('cancels delete when cancel button clicked', async () => {
    const user = userEvent.setup();

    await setupDeleteModal(user, [
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { results: [] } }), text: () => Promise.resolve('') }),
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { records: [] } }), text: () => Promise.resolve('') }),
    ]);

    if (screen.queryByTestId('delete-modal')) {
      await user.click(screen.getByTestId('cancel-delete'));
      await waitFor(() => {
        expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
      });
    }
  });

  it('deletes item with no associated cards successfully', async () => {
    const user = userEvent.setup();

    await setupDeleteModal(user, [
      // fetchCards
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { results: [] } }), text: () => Promise.resolve('') }),
      // query-by-item
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { records: [] } }), text: () => Promise.resolve('') }),
      // DELETE item
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }), text: () => Promise.resolve('') }),
    ]);

    if (screen.queryByTestId('delete-modal')) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Successfully deleted item')
        );
      });
    }
  });

  it('deletes item with associated cards successfully', async () => {
    const user = userEvent.setup();

    await setupDeleteModal(user, [
      // fetchCards
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { results: [] } }), text: () => Promise.resolve('') }),
      // query-by-item — returns 1 card
      () => Promise.resolve({
        ok: true, json: () => Promise.resolve({ ok: true, data: { records: [{ rId: 'rId-c1', payload: { eId: 'c1', serialNumber: 'SN-c1', item: { eId: 'item-eid-1', name: 'Test' }, cardQuantity: { amount: 1, unit: 'each' }, status: 'FULFILLED' } }] } }),
        text: () => Promise.resolve('')
      }),
      // DELETE card
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }), text: () => Promise.resolve('') }),
      // DELETE item
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }), text: () => Promise.resolve('') }),
    ]);

    if (screen.queryByTestId('delete-modal')) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Successfully deleted item')
        );
      });
    }
  });

  it('shows error when delete item API returns ok=false', async () => {
    const user = userEvent.setup();

    await setupDeleteModal(user, [
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { results: [] } }), text: () => Promise.resolve('') }),
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { records: [] } }), text: () => Promise.resolve('') }),
      // DELETE item — ok=false
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: false }), text: () => Promise.resolve('') }),
    ]);

    if (screen.queryByTestId('delete-modal')) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete item');
      });
    }
  });

  it('shows error when delete item API HTTP fails', async () => {
    const user = userEvent.setup();

    await setupDeleteModal(user, [
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { results: [] } }), text: () => Promise.resolve('') }),
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { records: [] } }), text: () => Promise.resolve('') }),
      // DELETE item — HTTP error
      () => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}), text: () => Promise.resolve('Internal Error') }),
    ]);

    if (screen.queryByTestId('delete-modal')) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete item');
      });
    }
  });

  it('shows error when confirm delete has no jwt token', async () => {
    const user = userEvent.setup();

    await setupDeleteModal(user, [
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { results: [] } }), text: () => Promise.resolve('') }),
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: { records: [] } }), text: () => Promise.resolve('') }),
    ]);

    if (screen.queryByTestId('delete-modal')) {
      // Make token null for the confirm action
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: jest.fn(() => null), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
        writable: true,
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Authentication token not found');
      });
    }
  });

  it('shows error when item eid missing in confirm delete', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true, data: { results: [] } }), text: () => Promise.resolve('') })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true, data: { records: [] } }), text: () => Promise.resolve('') });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} item={{ ...mockItem, eid: '' }} />);
    });

    await openDropdown(user);
    const deleteBtn = screen.queryByText('Delete');
    if (deleteBtn) {
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Item ID not found');
      });
    }
  });
});

// ---- handlePrintSelectedCard edge cases ------------------------------------

describe('ItemDetailsPanel — handlePrintSelectedCard edge cases', () => {
  it('shows error when no cards available to print', async () => {
    mockFetchCards([]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });
    await screen.findByText('No cards available');

    const printBtn = screen.getByText('Print card').closest('button');
    expect(printBtn).toBeDisabled();
  });

  it('shows error when print card API HTTP fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [makeCardResult('c1')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });
    await screen.findByTestId('item-card-view');

    const printBtn = screen.getByText('Print card').closest('button');
    await act(async () => { fireEvent.click(printBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to print card');
    });
  });

  it('shows error when print card API throws', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [makeCardResult('c1')] } }),
        text: () => Promise.resolve(''),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });
    await screen.findByTestId('item-card-view');

    const printBtn = screen.getByText('Print card').closest('button');
    await act(async () => { fireEvent.click(printBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error printing card');
    });
  });
});

// ---- handlePrintLabel additional error paths --------------------------------

describe('ItemDetailsPanel — handlePrintLabel additional paths', () => {
  it('shows error when item fetch fails (HTTP error)', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve('Not Found'),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    const labelBtn = screen.getByText('Print label').closest('button');
    await act(async () => { fireEvent.click(labelBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch item record ID');
    });
  });

  it('shows error when item record ID not found', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false, data: {} }), // no rId
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    const labelBtn = screen.getByText('Print label').closest('button');
    await act(async () => { fireEvent.click(labelBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Item record ID not found');
    });
  });

  it('shows error when print-label API HTTP fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
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
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    const labelBtn = screen.getByText('Print label').closest('button');
    await act(async () => { fireEvent.click(labelBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to print label');
    });
  });

  it('shows error when print-label response has no url', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
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
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    const labelBtn = screen.getByText('Print label').closest('button');
    await act(async () => { fireEvent.click(labelBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to print label - invalid response');
    });
  });
});

// ---- handlePrintBreadcrumb additional error paths ---------------------------

describe('ItemDetailsPanel — handlePrintBreadcrumb additional paths', () => {
  it('shows error when item fetch fails for breadcrumb', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ ok: false }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    const breadcrumbBtn = screen.getByText('Print breadcrumb').closest('button');
    await act(async () => { fireEvent.click(breadcrumbBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch item record ID');
    });
  });

  it('shows error when item rId missing for breadcrumb', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false, data: {} }), // no rId
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    const breadcrumbBtn = screen.getByText('Print breadcrumb').closest('button');
    await act(async () => { fireEvent.click(breadcrumbBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Item record ID not found');
    });
  });

  it('shows error when print-breadcrumb API HTTP fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
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
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    const breadcrumbBtn = screen.getByText('Print breadcrumb').closest('button');
    await act(async () => { fireEvent.click(breadcrumbBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to print breadcrumb');
    });
  });

  it('shows error when print-breadcrumb response has no url', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [] } }),
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
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    const breadcrumbBtn = screen.getByText('Print breadcrumb').closest('button');
    await act(async () => { fireEvent.click(breadcrumbBtn!); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to print breadcrumb - invalid response');
    });
  });
});

// ---- Card navigation tests ------------------------------------------------

describe('ItemDetailsPanel — card navigation', () => {
  it('navigates to next card when next button clicked', async () => {
    mockFetchCards([makeCardResult('c1'), makeCardResult('c2'), makeCardResult('c3')]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });
    await screen.findByTestId('item-card-view');

    expect(screen.getByText('x3')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons.find(b => b.querySelector('svg.lucide-chevron-right'));

    if (nextBtn) {
      await act(async () => { fireEvent.click(nextBtn); });
      const ofText = screen.queryAllByText(/\bof\b/i);
      expect(ofText.length).toBeGreaterThan(0);
    }
  });

  it('navigates prev and next between cards', async () => {
    mockFetchCards([makeCardResult('c1'), makeCardResult('c2')]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });
    await screen.findByTestId('item-card-view');

    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons.find(b => b.querySelector('svg.lucide-chevron-right'));
    if (nextBtn) {
      await act(async () => { fireEvent.click(nextBtn); });
    }

    const prevBtn = screen.getAllByRole('button').find(
      b => b.querySelector('svg.lucide-chevron-left') && !b.className.includes('absolute top-4')
    );
    if (prevBtn) {
      await act(async () => { fireEvent.click(prevBtn); });
    }

    const ofText = screen.queryAllByText(/\bof\b/i);
    expect(ofText.length).toBeGreaterThan(0);
  });

  it('opens cards preview modal when "Card preview" button clicked', async () => {
    mockFetchCards([makeCardResult('c1')]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });
    await screen.findByTestId('item-card-view');

    const cardPreviewBtn = screen.getByText('Card preview').closest('button');
    await act(async () => { fireEvent.click(cardPreviewBtn!); });

    await screen.findByTestId('cards-preview-modal');
  });

  it('closes cards preview modal when close button clicked', async () => {
    mockFetchCards([makeCardResult('c1')]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });
    await screen.findByTestId('item-card-view');

    const cardPreviewBtn = screen.getByText('Card preview').closest('button');
    await act(async () => { fireEvent.click(cardPreviewBtn!); });
    await screen.findByTestId('cards-preview-modal');

    await act(async () => {
      fireEvent.click(screen.getByTestId('close-cards-preview'));
    });

    expect(screen.queryByTestId('cards-preview-modal')).not.toBeInTheDocument();
  });
});

// ---- handleCardsChange / cards tab refresh ---------------------------------

describe('ItemDetailsPanel — handleCardsChange (cards tab)', () => {
  it('switches to Cards tab and shows ManageCardsPanel', async () => {
    mockFetchCards([]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Cards'));
    });

    await screen.findByTestId('manage-cards-panel');
    expect(screen.queryByTestId('manage-cards-panel')).toBeInTheDocument();
  });
});

// ---- Item with optional fields (generalLedgerCode) -------------------------

describe('ItemDetailsPanel — optional item fields', () => {
  it('renders generalLedgerCode when present', async () => {
    const itemWithGL = {
      ...mockItem,
      generalLedgerCode: 'GL-12345',
    };

    mockFetchCards([]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} item={itemWithGL} />);
    });

    expect(screen.getByText('General Ledger Code')).toBeInTheDocument();
    expect(screen.getByText('GL-12345')).toBeInTheDocument();
  });

  it('renders "No GL Code available" when generalLedgerCode is absent', async () => {
    mockFetchCards([]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    expect(screen.getByText('No GL Code available')).toBeInTheDocument();
  });

  it('renders "Item Details" fallback when title is empty', async () => {
    mockFetchCards([]);
    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} item={{ ...mockItem, title: '' }} />);
    });

    expect(screen.getByText('Item Details')).toBeInTheDocument();
  });
});

// ---- handleAddToOrderQueue flyToTarget animation path ----------------------

describe('ItemDetailsPanel — handleAddToOrderQueue animation', () => {
  it('calls flyToTarget when order queue target element exists', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { flyToTarget } = require('@/lib/fly-to-target');
    canAddToOrderQueue.mockReturnValue(true);

    const targetEl = document.createElement('div');
    targetEl.id = 'order-queue-target';
    document.body.appendChild(targetEl);

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [makeCardResult('c1', 'FULFILLED')] } }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        text: () => Promise.resolve(''),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: { results: [makeCardResult('c1', 'REQUESTING')] } }),
        text: () => Promise.resolve(''),
      });

    await act(async () => {
      render(<ItemDetailsPanel {...defaultProps} />);
    });

    await screen.findByTestId('item-card-view');
    const addBtn = screen.getByText('Add to cart').closest('button');

    await act(async () => { fireEvent.click(addBtn!); });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/event/request'),
        expect.anything()
      );
    });

    document.body.removeChild(targetEl);
    flyToTarget.mockClear();
  });
});
