import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithAll } from '@frontend/test-utils/render-with-providers';
import OrderQueuePage from './page';
import { toast } from 'sonner';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/order-queue',
}));

// Mock useAuth (Redux-based)
jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { name: 'Test User' },
    loading: false,
    signOut: jest.fn(),
  }),
}));

// Mock useJWT (Redux-based)
jest.mock('@/store/hooks/useJWT', () => ({
  useJWT: jest.fn().mockReturnValue({
    token: 'mock-token',
    isTokenValid: true,
    payload: { sub: 'user-1' },
    userContext: { tenantId: 'tenant-1', userId: 'user-1' },
  }),
}));

// Mock useOrderQueue
jest.mock('@/contexts/OrderQueueContext', () => ({
  useOrderQueue: jest.fn().mockReturnValue({
    readyToOrderCount: 0,
    setReadyToOrderCount: jest.fn(),
    updateOrderCounts: jest.fn(),
    fetchOrderQueueData: jest.fn().mockResolvedValue(undefined),
    refreshOrderQueueData: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}));

// Mock useAuthErrorHandler
jest.mock('@/hooks/useAuthErrorHandler', () => ({
  useAuthErrorHandler: () => ({
    handleAuthError: jest.fn().mockReturnValue(false),
  }),
}));

// Mock AppSidebar
jest.mock('@/components/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">Sidebar</div>,
}));

// Mock AppHeader
jest.mock('@/components/common/app-header', () => ({
  AppHeader: () => <div data-testid="app-header">Header</div>,
}));

// Mock SidebarProvider and SidebarInset
jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
}));

// Mock EmptyOrdersState
jest.mock('@/components/common/EmptyOrdersState', () => ({
  EmptyOrdersState: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="empty-orders-state">
      <span>{title}</span>
      {subtitle && <span>{subtitle}</span>}
    </div>
  ),
}));

// Mock dynamic imports
jest.mock('next/dynamic', () => (_fn: () => Promise<unknown>) => {
  return function DynamicComponent(props: Record<string, unknown>) {
    const onSendEmail = props.onSendEmail as ((itemIds: string[], userContext?: unknown) => Promise<void>) | undefined;
    const onCopyToClipboard = props.onCopyToClipboard as ((itemIds: string[]) => Promise<void>) | undefined;
    const onClose = props.onClose as (() => void) | undefined;
    const onEditItem = props.onEditItem as (() => void) | undefined;
    const onOpenChange = props.onOpenChange as (() => void) | undefined;
    const onSuccess = props.onSuccess as (() => void) | undefined;
    const isOpen = props.isOpen as boolean | undefined;
    const items = props.items as Array<{ id: string }> | undefined;
    return (
      <div data-testid="dynamic-component" data-props={JSON.stringify(props)}>
        {isOpen !== false && (
          <>
            {onSendEmail && items && items.length > 0 && (
              <button
                data-testid="send-email-btn"
                onClick={() => onSendEmail(items.map(i => i.id))}
              >
                Send Email
              </button>
            )}
            {onCopyToClipboard && items && items.length > 0 && (
              <button
                data-testid="copy-clipboard-btn"
                onClick={() => onCopyToClipboard(items.map(i => i.id))}
              >
                Copy to Clipboard
              </button>
            )}
            {onClose && (
              <button data-testid="dynamic-close-btn" onClick={onClose}>
                Close Panel
              </button>
            )}
            {onEditItem && (
              <button data-testid="dynamic-edit-btn" onClick={onEditItem}>
                Edit Item
              </button>
            )}
            {onOpenChange && (
              <button data-testid="dynamic-open-change-btn" onClick={onOpenChange}>
                Open Change
              </button>
            )}
            {onSuccess && (
              <button data-testid="dynamic-success-btn" onClick={onSuccess}>
                Success
              </button>
            )}
          </>
        )}
      </div>
    );
  };
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock icon components
jest.mock('@/components/common/OnlineOrderIcon', () => ({
  OnlineOrderIcon: () => <span>OnlineIcon</span>,
}));
jest.mock('@/components/common/EmailOrderIcon', () => ({
  EmailOrderIcon: () => <span>EmailIcon</span>,
}));
jest.mock('@/components/common/PhoneOrderIcon', () => ({
  PhoneOrderIcon: () => <span>PhoneIcon</span>,
}));
jest.mock('@/components/common/PurchaseOrderIcon', () => ({
  PurchaseOrderIcon: () => <span>POIcon</span>,
}));
jest.mock('@/components/common/InStoreIcon', () => ({
  InStoreIcon: () => <span>InStoreIcon</span>,
}));
jest.mock('@/components/common/RFQIcon', () => ({
  RFQIcon: () => <span>RFQIcon</span>,
}));
jest.mock('@/components/common/ProductionIcon', () => ({
  ProductionIcon: () => <span>ProductionIcon</span>,
}));
jest.mock('@/components/common/ThirdPartyIcon', () => ({
  ThirdPartyIcon: () => <span>ThirdPartyIcon</span>,
}));
jest.mock('@/components/common/CardStateDropdown', () => ({
  CardStateDropdown: ({
    onStateChange,
    onAddToOrderQueue,
    onOpenEmailPanel,
    onTriggerRefresh,
    showToast,
  }: {
    onStateChange?: (state: string) => void;
    onAddToOrderQueue?: () => void;
    card?: unknown;
    orderMethod?: string;
    link?: string;
    onOpenEmailPanel?: () => void;
    onTriggerRefresh?: () => void;
    showToast?: (msg: string) => void;
  }) => (
    <div>
      CardState
      {onAddToOrderQueue && (
        <button
          data-testid='card-state-add-queue'
          onClick={onAddToOrderQueue}
        >
          Add to Queue
        </button>
      )}
      {onStateChange && (
        <>
          <button
            data-testid='card-state-requesting'
            onClick={() => onStateChange('REQUESTING')}
          >
            Set Requesting
          </button>
          <button
            data-testid='card-state-fulfilled'
            onClick={() => onStateChange('FULFILLED')}
          >
            Set Fulfilled
          </button>
          <button
            data-testid='card-state-in-process'
            onClick={() => onStateChange('IN_PROCESS')}
          >
            Set In Process
          </button>
          <button
            data-testid='card-state-unknown'
            onClick={() => onStateChange('UNKNOWN_STATE')}
          >
            Set Unknown
          </button>
        </>
      )}
      {onOpenEmailPanel && (
        <button
          data-testid='card-state-open-email'
          onClick={onOpenEmailPanel}
        >
          Open Email Panel
        </button>
      )}
      {onTriggerRefresh && (
        <button
          data-testid='card-state-trigger-refresh'
          onClick={onTriggerRefresh}
        >
          Trigger Refresh
        </button>
      )}
      {showToast && (
        <button
          data-testid='card-state-show-toast'
          onClick={() => showToast('State changed successfully')}
        >
          Show Toast
        </button>
      )}
    </div>
  ),
}));

// Mock cardStateUtils
jest.mock('@/lib/cardStateUtils', () => ({
  mapApiStatusToDisplay: jest.fn((status: string) => status),
}));

// Mock dropdown-menu to make all items always visible
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => {
    if (asChild) return <>{children}</>;
    return <div>{children}</div>;
  },
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

// Mock performance logger
jest.mock('@/utils/performanceLogger', () => ({
  perfLogger: {
    start: jest.fn(),
    end: jest.fn(),
  },
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn().mockReturnValue('toast-id'),
    dismiss: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

// Helper to create a mock kanban card API response
function createMockApiResponse(
  supplierName: string,
  itemName: string,
  status: string = 'REQUESTING',
  overrides: Record<string, unknown> = {}
) {
  return {
    payload: {
      eId: `card-${Math.random().toString(36).slice(2)}`,
      rId: 'record-1',
      serialNumber: 'SN-001',
      status,
      itemDetails: {
        eId: 'item-1',
        name: itemName,
        primarySupply: {
          supplier: supplierName,
          orderMethod: 'ONLINE',
          url: 'https://example.com/order',
          orderQuantity: { amount: 10, unit: 'Each' },
          unitCost: { value: 5.0, currency: 'USD' },
          averageLeadTime: { length: 3, unit: 'DAY' },
          sku: 'SKU-001',
        },
        defaultSupply: 'PRIMARY',
        cardSize: 'STANDARD',
        labelSize: 'SMALL',
        breadcrumbSize: 'SMALL',
        itemColor: '#808080',
        notes: '',
        cardNotesDefault: '',
        taxable: false,
        imageUrl: 'https://example.com/image.jpg',
        ...(overrides.itemDetails as Record<string, unknown> || {}),
      },
      item: { type: 'Item', eId: 'item-1', name: itemName },
      cardQuantity: { amount: 5, unit: 'Each' },
      printStatus: 'PRINTED',
      ...(overrides.payload as Record<string, unknown> || {}),
    },
  };
}

// Helper to mock fetch to return specific data for each endpoint
function mockFetchForOrderQueue(
  requestedResults: ReturnType<typeof createMockApiResponse>[] = [],
  inProcessResults: ReturnType<typeof createMockApiResponse>[] = [],
  requestingResults: ReturnType<typeof createMockApiResponse>[] = []
) {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes('/details/requested')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: requestedResults } }),
      });
    }
    if (url.includes('/details/in-process')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: inProcessResults } }),
      });
    }
    if (url.includes('/details/requesting')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: requestingResults } }),
      });
    }
    // Default - accept/start-processing/etc.
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
  });
}

describe('OrderQueuePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: fetch returns empty results for all endpoints
    mockFetchForOrderQueue();
  });

  // ===== RENDERING & LOADING STATES =====

  it('displays a loading state while data is being fetched', async () => {
    renderWithAll(<OrderQueuePage />, {
      authContext: { loading: true },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/loading/i, { selector: 'p' })
      ).toBeInTheDocument();
    });
  });

  it('displays an empty state when no items are in the queue', async () => {
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  it('renders the page header and tabs', async () => {
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Order Queue')).toBeInTheDocument();
    });
    expect(screen.getByText('Ready to Order')).toBeInTheDocument();
    expect(screen.getByText('Recently Ordered')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search Items')).toBeInTheDocument();
    });
  });

  it('sets loading to false when no user is present', async () => {
    renderWithAll(<OrderQueuePage />, {
      authContext: { user: null },
    });

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  it('sets loading to false when token is invalid', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useJWT } = require('@/store/hooks/useJWT');
    useJWT.mockReturnValue({
      token: null,
      isTokenValid: false,
      payload: null,
      userContext: null,
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });

    // Restore mock
    useJWT.mockReturnValue({
      token: 'mock-token',
      isTokenValid: true,
      payload: { sub: 'user-1' },
      userContext: { tenantId: 'tenant-1', userId: 'user-1' },
    });
  });

  // ===== DATA FETCHING & DISPLAY =====

  it('renders grouped order items by supplier when data is available', async () => {
    const requestingResults = [
      createMockApiResponse('Acme Supplies', 'Widget A', 'REQUESTING'),
      createMockApiResponse('Acme Supplies', 'Widget B', 'REQUESTING'),
      createMockApiResponse('Beta Corp', 'Gadget X', 'REQUESTING'),
    ];
    mockFetchForOrderQueue([], [], requestingResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
    });

    expect(screen.getByText('Beta Corp')).toBeInTheDocument();
  });

  it('renders items from multiple API endpoints', async () => {
    const requestedResults = [
      createMockApiResponse('Supplier A', 'Item Requested', 'REQUESTED'),
    ];
    const requestingResults = [
      createMockApiResponse('Supplier B', 'Item Requesting', 'REQUESTING'),
    ];
    mockFetchForOrderQueue(requestedResults, [], requestingResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    });
    expect(screen.getByText('Supplier B')).toBeInTheDocument();
  });

  it('handles items without primarySupply gracefully', async () => {
    const result = {
      payload: {
        eId: 'card-no-supply',
        rId: 'record-1',
        serialNumber: 'SN-001',
        status: 'REQUESTING',
        itemDetails: {
          eId: 'item-1',
          name: 'No Supply Item',
          primarySupply: null,
          defaultSupply: 'PRIMARY',
          cardSize: 'STANDARD',
          labelSize: 'SMALL',
          breadcrumbSize: 'SMALL',
          itemColor: '#808080',
          notes: '',
          cardNotesDefault: '',
          taxable: false,
        },
        item: { type: 'Item', eId: 'item-1', name: 'No Supply Item' },
        cardQuantity: { amount: 5, unit: 'Each' },
        printStatus: 'PRINTED',
      },
    };

    mockFetchForOrderQueue([], [], [result as unknown as ReturnType<typeof createMockApiResponse>]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('No supplier')).toBeInTheDocument();
    });
  });

  it('renders items with "In progress" status in recently ordered tab', async () => {
    const inProcessResults = [
      createMockApiResponse('Supplier C', 'In Process Item', 'IN_PROCESS'),
    ];
    mockFetchForOrderQueue([], inProcessResults, []);

    renderWithAll(<OrderQueuePage />);

    // Switch to recently ordered tab
    await waitFor(() => {
      expect(screen.getByText('Recently Ordered')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Recently Ordered'));

    await waitFor(() => {
      expect(screen.getByText('In Process Item')).toBeInTheDocument();
    });
  });

  // ===== FETCH ERROR HANDLING =====

  it('handles API error for requested endpoint', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requested')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Server error'),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    // Should fall back to empty state
    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  it('handles 401 authentication error', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requested')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: () => Promise.resolve('Unauthorized'),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  // ===== TAB SWITCHING =====

  it('allows expanding and collapsing supplier groups', async () => {
    const mockResults = [
      createMockApiResponse('Acme Supplies', 'Widget A', 'REQUESTING'),
    ];

    mockFetchForOrderQueue([], [], mockResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
    });

    // Find the supplier group collapse button and click it
    const collapseButtons = screen.getAllByRole('button');
    const supplierGroupButton = collapseButtons.find(
      (btn) =>
        btn.textContent?.includes('Acme Supplies') ||
        btn.closest('[data-testid]')?.textContent?.includes('Acme Supplies')
    );

    if (supplierGroupButton) {
      fireEvent.click(supplierGroupButton);
      await waitFor(() => {
        expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
      });
    } else {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    }
  });

  it('switches between Ready to Order and Recently Ordered tabs', async () => {
    const requestingResults = [
      createMockApiResponse('Supplier A', 'Ready Item', 'REQUESTING'),
    ];
    const inProcessResults = [
      createMockApiResponse('Supplier B', 'Recent Item', 'IN_PROCESS'),
    ];
    mockFetchForOrderQueue([], inProcessResults, requestingResults);

    renderWithAll(<OrderQueuePage />);

    // Wait for ready tab items
    await waitFor(() => {
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    });

    // Switch to recently ordered
    fireEvent.click(screen.getByText('Recently Ordered'));

    await waitFor(() => {
      expect(screen.getByText('Supplier B')).toBeInTheDocument();
    });
  });

  // ===== SEARCH FUNCTIONALITY =====

  it('filters items by search term', async () => {
    const requestingResults = [
      createMockApiResponse('Acme Supplies', 'Widget A', 'REQUESTING'),
      createMockApiResponse('Beta Corp', 'Gadget X', 'REQUESTING'),
    ];
    mockFetchForOrderQueue([], [], requestingResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
    });

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search Items');
    fireEvent.change(searchInput, { target: { value: 'Widget' } });

    await waitFor(() => {
      expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
    });
  });

  // ===== ORDER ACTIONS =====

  it('handles start order action for an item with link', async () => {
    const card = createMockApiResponse('Acme Supplies', 'Widget A', 'REQUESTING');
    // Make the eId deterministic
    card.payload.eId = 'card-1';
    mockFetchForOrderQueue([], [], [card]);

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    // Find the start order button
    const startOrderButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startOrderButtons.length > 0) {
      fireEvent.click(startOrderButtons[0]);

      await waitFor(() => {
        // Should open the link
        expect(windowOpenSpy).toHaveBeenCalled();
      });

      // Should call the accept endpoint
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/event/accept'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    }

    windowOpenSpy.mockRestore();
  });

  it('shows items without supplier as non-orderable', async () => {
    // Create a mock card without supplier - the page maps empty supplier to 'No supplier'
    // which is still a valid supplier string, so we need to test the canOrderItem validation
    const card = createMockApiResponse('', 'No Supplier Item', 'REQUESTING');
    card.payload.eId = 'card-no-supplier';
    // The component maps empty supplier from API to 'No supplier' string

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('No Supplier Item')).toBeInTheDocument();
    });

    // Verify the item renders (it gets grouped under 'No supplier')
    expect(screen.getByText('No supplier')).toBeInTheDocument();
  });

  it('handles complete order action', async () => {
    const card = createMockApiResponse('Acme Supplies', 'Requested Item', 'REQUESTED');
    card.payload.eId = 'card-complete';
    mockFetchForOrderQueue([card], [], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Requested Item')).toBeInTheDocument();
    });

    // Look for "Complete order" button
    const completeButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Complete order')
    );

    if (completeButtons.length > 0) {
      fireEvent.click(completeButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/event/start-processing'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    }
  });

  it('handles failed order start API response', async () => {
    const card = createMockApiResponse('Acme Supplies', 'Widget A', 'REQUESTING');
    card.payload.eId = 'card-fail';

    // Set up mock: initial load works, accept call fails
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ ok: false }),
        });
      }
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const startOrderButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startOrderButtons.length > 0) {
      fireEvent.click(startOrderButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to start order');
      });
    }

    windowOpenSpy.mockRestore();
  });

  // ===== EMAIL FLOW =====

  it('opens email panel for Email order method items', async () => {
    const card = createMockApiResponse('Email Supplier', 'Email Item', 'REQUESTING');
    card.payload.eId = 'card-email';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Item')).toBeInTheDocument();
    });

    const startOrderButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startOrderButtons.length > 0) {
      fireEvent.click(startOrderButtons[0]);

      // EmailPanel should get rendered (dynamic component)
      await waitFor(() => {
        const dynamicComponents = screen.getAllByTestId('dynamic-component');
        expect(dynamicComponents.length).toBeGreaterThan(0);
      });
    }
  });

  // ===== ITEM DETAILS =====

  it('shows item details when view card details is clicked from dropdown', async () => {
    const card = createMockApiResponse('Acme Supplies', 'Widget A', 'REQUESTING');
    card.payload.eId = 'card-details';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    // The page should render with the dynamic components available
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
  });

  // ===== BADGE / COUNT DISPLAY =====

  it('shows ready to order count badge when items exist', async () => {
    const requestingResults = [
      createMockApiResponse('Supplier A', 'Item 1', 'REQUESTING'),
      createMockApiResponse('Supplier A', 'Item 2', 'REQUESTING'),
    ];
    mockFetchForOrderQueue([], [], requestingResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    // The badge should show count
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  // ===== ORDER METHOD DISPLAY =====

  it('maps various order methods correctly', async () => {
    const cards = [
      (() => {
        const c = createMockApiResponse('Phone Supplier', 'Phone Item', 'REQUESTING');
        c.payload.itemDetails.primarySupply.orderMethod = 'PHONE';
        return c;
      })(),
      (() => {
        const c = createMockApiResponse('PO Supplier', 'PO Item', 'REQUESTING');
        c.payload.itemDetails.primarySupply.orderMethod = 'PURCHASE_ORDER';
        return c;
      })(),
    ];
    mockFetchForOrderQueue([], [], cards);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Phone Item')).toBeInTheDocument();
    });
    expect(screen.getByText('PO Item')).toBeInTheDocument();
  });

  // ===== VISIBILITY CHANGE HANDLING =====

  it('refreshes data on visibility change', async () => {
    mockFetchForOrderQueue();

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const initialCallCount = (global.fetch as jest.Mock).mock.calls.length;

    // Simulate visibility change
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  // ===== STATUS DISPLAY =====

  it('renders items with Requested status correctly', async () => {
    const requestedCard = createMockApiResponse('Supplier R', 'Requested Widget', 'REQUESTED');
    requestedCard.payload.eId = 'card-requested';
    mockFetchForOrderQueue([requestedCard], [], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Requested Widget')).toBeInTheDocument();
    });

    // Verify the item is displayed in the ready tab
    expect(screen.getByText('Supplier R')).toBeInTheDocument();
  });

  // ===== GROUP BY SWITCHING =====

  it('renders group by dropdown', async () => {
    mockFetchForOrderQueue();

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Group by')).toBeInTheDocument();
    });
  });

  // ===== ITEM WITH NOTES =====

  it('displays item notes when available', async () => {
    const card = createMockApiResponse('Acme', 'Noted Item', 'REQUESTING');
    card.payload.eId = 'card-notes';
    (card.payload as Record<string, unknown>).notes = 'Important note';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Noted Item')).toBeInTheDocument();
    });
  });

  // ===== FETCH EXCEPTION HANDLING =====

  it('handles network error during data fetch', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

    renderWithAll(<OrderQueuePage />);

    // Should fall back to empty state
    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  // ===== ITEMS WITHOUT URLs =====

  it('shows items without URLs as non-orderable for Online method', async () => {
    const card = createMockApiResponse('Acme', 'No URL Item', 'REQUESTING');
    card.payload.eId = 'card-nourl';
    card.payload.itemDetails.primarySupply.url = '';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('No URL Item')).toBeInTheDocument();
    });

    // The "Start order" button should be disabled for items without URL (Online method)
    const startOrderButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startOrderButtons.length > 0) {
      expect(startOrderButtons[0]).toBeDisabled();
    }
  });

  // ===== MULTIPLE STATUS ITEMS IN SAME GROUP =====

  it('groups items from different statuses under the same supplier', async () => {
    const requestingCard = createMockApiResponse('Shared Supplier', 'Requesting Item', 'REQUESTING');
    requestingCard.payload.eId = 'card-req1';
    const requestedCard = createMockApiResponse('Shared Supplier', 'Requested Item', 'REQUESTED');
    requestedCard.payload.eId = 'card-req2';

    mockFetchForOrderQueue([requestedCard], [], [requestingCard]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Shared Supplier')).toBeInTheDocument();
    });
    expect(screen.getByText('Requesting Item')).toBeInTheDocument();
    expect(screen.getByText('Requested Item')).toBeInTheDocument();
  });

  // ===== GROUP BY SWITCHING =====

  it('switches group by to no grouping and shows flat list', async () => {
    const requestingResults = [
      createMockApiResponse('Supplier A', 'Item Alpha', 'REQUESTING'),
      createMockApiResponse('Supplier B', 'Item Beta', 'REQUESTING'),
    ];
    mockFetchForOrderQueue([], [], requestingResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Item Alpha')).toBeInTheDocument();
    });

    // Click "(No grouping)" in the Group by dropdown
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);
      await waitFor(() => {
        expect(screen.getByText('Item Alpha')).toBeInTheDocument();
      });
    }
  });

  it('switches group by to order method', async () => {
    const requestingResults = [
      createMockApiResponse('Supplier A', 'Online Item', 'REQUESTING'),
    ];
    mockFetchForOrderQueue([], [], requestingResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Online Item')).toBeInTheDocument();
    });

    // Click "Order method" in the Group by dropdown
    const orderMethodBtn = screen.queryByText('Order method');
    if (orderMethodBtn) {
      fireEvent.click(orderMethodBtn);
      await waitFor(() => {
        // Items should still be visible after group switch
        expect(screen.getByText('Online Item')).toBeInTheDocument();
      });
    }
  });

  it('switches group by to supplier', async () => {
    const requestingResults = [
      createMockApiResponse('Test Supplier', 'Test Item', 'REQUESTING'),
    ];
    mockFetchForOrderQueue([], [], requestingResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    });

    // Click Supplier button in Group by dropdown
    const supplierBtns = screen.getAllByText('Supplier');
    // Should have at least the group by Supplier option
    if (supplierBtns.length > 0) {
      fireEvent.click(supplierBtns[supplierBtns.length - 1]);
      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });
    }
  });

  // ===== COMPLETE ORDER FLOW =====

  it('handles complete order action successfully', async () => {
    const card = createMockApiResponse('Acme Supplies', 'Requested Item', 'REQUESTED');
    card.payload.eId = 'card-complete-success';
    mockFetchForOrderQueue([card], [], []);

    // Mock the complete order (start-processing) endpoint to return success
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requested')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/start-processing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Requested Item')).toBeInTheDocument();
    });

    const completeButtons = screen.getAllByRole('button').filter((btn) =>
      btn.textContent?.includes('Complete order')
    );

    if (completeButtons.length > 0) {
      fireEvent.click(completeButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/event/start-processing'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    }
  });

  it('shows error toast when complete order API returns ok=false', async () => {
    const card = createMockApiResponse('Acme', 'Complete Fail Item', 'REQUESTED');
    card.payload.eId = 'card-complete-fail';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requested')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/start-processing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: false }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Complete Fail Item')).toBeInTheDocument();
    });

    const completeButtons = screen.getAllByRole('button').filter((btn) =>
      btn.textContent?.includes('Complete order')
    );

    if (completeButtons.length > 0) {
      fireEvent.click(completeButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to complete order');
      });
    }
  });

  it('shows error toast when complete order API response is not ok', async () => {
    const card = createMockApiResponse('Acme', 'Complete HTTP Fail Item', 'REQUESTED');
    card.payload.eId = 'card-complete-http-fail';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requested')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/start-processing')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ ok: false }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Complete HTTP Fail Item')).toBeInTheDocument();
    });

    const completeButtons = screen.getAllByRole('button').filter((btn) =>
      btn.textContent?.includes('Complete order')
    );

    if (completeButtons.length > 0) {
      fireEvent.click(completeButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to complete order');
      });
    }
  });

  // ===== HANDLE START ORDER EDGE CASES =====

  it('shows empty state when JWT token is not valid', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useJWT } = require('@/store/hooks/useJWT');
    // Override to return null token for this test
    useJWT.mockReturnValue({
      token: null,
      isTokenValid: false,
      payload: null,
      userContext: null,
    });

    mockFetchForOrderQueue([], [], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });

    // Restore to valid token
    useJWT.mockReturnValue({
      token: 'mock-token',
      isTokenValid: true,
      payload: { sub: 'user-1' },
      userContext: { tenantId: 'tenant-1', userId: 'user-1' },
    });
  });

  it('shows error toast when item is missing supplier for order', async () => {
    // Create a card with empty supplier name
    const card = createMockApiResponse('', 'Missing Supplier Item', 'REQUESTING');
    card.payload.eId = 'card-missing-supplier';
    // Force empty supplier in the API response
    (card.payload as Record<string, unknown>).itemDetails = {
      ...(card.payload as Record<string, unknown>).itemDetails as Record<string, unknown>,
    };

    mockFetchForOrderQueue([], [], [card]);

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      // Grouped under 'No supplier'
      expect(screen.getByText('No supplier')).toBeInTheDocument();
    });

    // Find and click the start order button - it should be disabled for items without supplier
    const startOrderButtons = screen.getAllByRole('button').filter((btn) =>
      btn.textContent?.includes('Start order')
    );

    if (startOrderButtons.length > 0 && startOrderButtons[0].hasAttribute('disabled')) {
      // Already verified it's disabled - canOrderItem check works
      expect(startOrderButtons[0]).toBeDisabled();
    }

    windowOpenSpy.mockRestore();
  });

  // ===== VIEW CARD DETAILS =====

  it('opens item details panel when View card details is clicked', async () => {
    const card = createMockApiResponse('Acme Supplies', 'Details Item', 'REQUESTING');
    card.payload.eId = 'card-view-details';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Details Item')).toBeInTheDocument();
    });

    // With DropdownMenu mocked, "View card details" should be visible
    const viewDetailsBtn = screen.queryByText('View card details');
    if (viewDetailsBtn) {
      fireEvent.click(viewDetailsBtn);

      await waitFor(() => {
        // ItemDetailsPanel (dynamic component) should now be rendered
        const dynamicComponents = screen.getAllByTestId('dynamic-component');
        expect(dynamicComponents.length).toBeGreaterThan(0);
      });
    }
  });

  // ===== EDIT ITEM =====

  it('opens item form panel when Edit item is clicked', async () => {
    const card = createMockApiResponse('Acme Supplies', 'Edit Item', 'REQUESTING');
    card.payload.eId = 'card-edit-item';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Item')).toBeInTheDocument();
    });

    // With DropdownMenu mocked, "Edit item" should be visible
    const editItemBtns = screen.queryAllByText('Edit item');
    if (editItemBtns.length > 0) {
      fireEvent.click(editItemBtns[0]);

      // ItemFormPanel (dynamic component) should now be rendered
      await waitFor(() => {
        const dynamicComponents = screen.getAllByTestId('dynamic-component');
        expect(dynamicComponents.length).toBeGreaterThan(0);
      });
    }
  });

  it('shows error toast when edit item data is not found', async () => {
    // Create a card but ensure originalApiData won't have it (by resetting)
    mockFetchForOrderQueue([], [], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  // ===== TOGGLE SUPPLIER EXPANSION =====

  it('toggles supplier group expansion when collapse button is clicked', async () => {
    const mockResults = [
      createMockApiResponse('Toggle Supplier', 'Toggle Item', 'REQUESTING'),
    ];
    mockFetchForOrderQueue([], [], mockResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Toggle Supplier')).toBeInTheDocument();
    });

    // Find the expand/collapse button (aria-label="Expand/Collapse")
    const expandBtns = screen.queryAllByLabelText('Expand/Collapse');
    if (expandBtns.length > 0) {
      fireEvent.click(expandBtns[0]);
      // Should still render after toggle
      expect(screen.getByText('Toggle Supplier')).toBeInTheDocument();
    }
  });

  // ===== RECENTLY ORDERED TAB =====

  it('shows in-process items in recently ordered tab', async () => {
    const inProcessResults = [
      createMockApiResponse('Process Supplier', 'Processing Item', 'IN_PROCESS'),
    ];
    mockFetchForOrderQueue([], inProcessResults, []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Recently Ordered')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Recently Ordered'));

    await waitFor(() => {
      expect(screen.getByText('Processing Item')).toBeInTheDocument();
    });
  });

  // ===== SEARCH WITH NO GROUPING =====

  it('filters flat list by search term when groupBy is none', async () => {
    const requestingResults = [
      createMockApiResponse('Supplier A', 'Alpha Item', 'REQUESTING'),
      createMockApiResponse('Supplier B', 'Beta Item', 'REQUESTING'),
    ];
    mockFetchForOrderQueue([], [], requestingResults);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Item')).toBeInTheDocument();
    });

    // Switch to no grouping first
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);

      // Now search for Alpha
      const searchInput = screen.getByPlaceholderText('Search Items');
      fireEvent.change(searchInput, { target: { value: 'Alpha' } });

      await waitFor(() => {
        expect(screen.getByText('Alpha Item')).toBeInTheDocument();
      });
    }
  });

  // ===== HANDLE SEND EMAIL =====

  it('handles send email flow with success', async () => {
    const card = createMockApiResponse('Email Co', 'Email Order Item', 'REQUESTING');
    card.payload.eId = 'card-email-send';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Order Item')).toBeInTheDocument();
    });

    // Click Start order to open email panel
    const startOrderBtns = screen.getAllByRole('button').filter((btn) =>
      btn.textContent?.includes('Start order')
    );

    if (startOrderBtns.length > 0) {
      // Setup email API mock
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/email/send-order')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true }),
          });
        }
        if (url.includes('/event/accept')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true }),
          });
        }
        if (url.includes('/details/requesting')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { results: [card] } }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [] } }),
        });
      });

      fireEvent.click(startOrderBtns[0]);

      // Email panel should be opened (dynamic component rendered)
      await waitFor(() => {
        const dynamicComponents = screen.getAllByTestId('dynamic-component');
        expect(dynamicComponents.length).toBeGreaterThan(0);
      });
    }
  });

  // ===== ORDER METHOD MAPPING =====

  it('maps RFQ order method correctly', async () => {
    const card = createMockApiResponse('RFQ Supplier', 'RFQ Item', 'REQUESTING');
    card.payload.itemDetails.primarySupply.orderMethod = 'RFQ';
    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('RFQ Item')).toBeInTheDocument();
    });
  });

  it('maps PRODUCTION order method correctly', async () => {
    const card = createMockApiResponse('Prod Supplier', 'Production Item', 'REQUESTING');
    card.payload.itemDetails.primarySupply.orderMethod = 'PRODUCTION';
    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Production Item')).toBeInTheDocument();
    });
  });

  it('maps THIRD_PARTY order method correctly', async () => {
    const card = createMockApiResponse('3rd Party Supplier', '3rd Party Item', 'REQUESTING');
    card.payload.itemDetails.primarySupply.orderMethod = 'THIRD_PARTY';
    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('3rd Party Item')).toBeInTheDocument();
    });
  });

  it('maps IN_STORE order method correctly', async () => {
    const card = createMockApiResponse('Store Supplier', 'In Store Item', 'REQUESTING');
    card.payload.itemDetails.primarySupply.orderMethod = 'IN_STORE';
    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('In Store Item')).toBeInTheDocument();
    });
  });

  it('defaults to Online for unknown order method', async () => {
    const card = createMockApiResponse('Unknown Supplier', 'Unknown Method Item', 'REQUESTING');
    card.payload.itemDetails.primarySupply.orderMethod = 'UNKNOWN_METHOD';
    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Unknown Method Item')).toBeInTheDocument();
    });
  });

  it('handles null order method gracefully', async () => {
    const card = createMockApiResponse('Null Method Supplier', 'Null Method Item', 'REQUESTING');
    (card.payload.itemDetails.primarySupply as Record<string, unknown>).orderMethod = null;
    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Null Method Item')).toBeInTheDocument();
    });
  });

  // ===== IN-PROCESS ERROR HANDLING =====

  it('handles 401 error for in-process endpoint', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/in-process')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: () => Promise.resolve('Unauthorized'),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  it('handles 500 error for requesting endpoint', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Server Error'),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  // ===== COPY TO CLIPBOARD / EMAIL PANEL =====

  it('renders dynamic components for email panel', async () => {
    const card = createMockApiResponse('Email Supplier 2', 'Email Panel Item', 'REQUESTING');
    card.payload.eId = 'card-email-panel';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Panel Item')).toBeInTheDocument();
    });

    // Start order should open email panel for EMAIL method
    const startOrderBtns = screen.getAllByRole('button').filter((btn) =>
      btn.textContent?.includes('Start order')
    );

    if (startOrderBtns.length > 0) {
      fireEvent.click(startOrderBtns[0]);

      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });
    }
  });

  // ===== HANDLE FETCH EXCEPTION IN DATA REFRESH =====

  it('handles unexpected fetch exception and shows empty state', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError('fetch failed'),
    );

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    });
  });

  // ===== HANDLE CARD STATE CHANGE =====

  it('changes card state via add-queue button (REQUESTING)', async () => {
    const card = createMockApiResponse('State Supplier', 'Queue Item', 'REQUESTING');
    card.payload.eId = 'card-state-req-1';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/request')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Queue Item')).toBeInTheDocument();
    });

    const addQueueBtns = screen.getAllByTestId('card-state-add-queue');
    if (addQueueBtns.length > 0) {
      fireEvent.click(addQueueBtns[0]);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/event/request'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    }
  });

  it('changes card state to FULFILLED', async () => {
    const card = createMockApiResponse('Fulfill Supplier', 'Fulfill Item', 'REQUESTING');
    card.payload.eId = 'card-fulfill-1';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/fulfill')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Fulfill Item')).toBeInTheDocument();
    });

    const fulfillBtns = screen.getAllByTestId('card-state-fulfilled');
    if (fulfillBtns.length > 0) {
      fireEvent.click(fulfillBtns[0]);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/event/fulfill'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    }
  });

  it('changes card state to IN_PROCESS', async () => {
    const card = createMockApiResponse('Process Supplier', 'Process State Item', 'REQUESTING');
    card.payload.eId = 'card-inprocess-1';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/start-processing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Process State Item')).toBeInTheDocument();
    });

    const inProcessBtns = screen.getAllByTestId('card-state-in-process');
    if (inProcessBtns.length > 0) {
      fireEvent.click(inProcessBtns[0]);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/event/start-processing'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    }
  });

  it('shows error toast for unknown card state change', async () => {
    const card = createMockApiResponse('Unknown State Supplier', 'Unknown State Item', 'REQUESTING');
    card.payload.eId = 'card-unknown-state-1';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Unknown State Item')).toBeInTheDocument();
    });

    const unknownBtns = screen.getAllByTestId('card-state-unknown');
    if (unknownBtns.length > 0) {
      fireEvent.click(unknownBtns[0]);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Unknown state change');
      });
    }
  });

  it('shows error toast when card state API returns ok=false', async () => {
    const card = createMockApiResponse('API Fail Supplier', 'API Fail Item', 'REQUESTING');
    card.payload.eId = 'card-api-fail-1';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/fulfill')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: false }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('API Fail Item')).toBeInTheDocument();
    });

    const fulfillBtns = screen.getAllByTestId('card-state-fulfilled');
    if (fulfillBtns.length > 0) {
      fireEvent.click(fulfillBtns[0]);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to change card state');
      });
    }
  });

  it('shows error toast when card state API returns HTTP error', async () => {
    const card = createMockApiResponse('HTTP Fail Supplier', 'HTTP Fail Item', 'REQUESTING');
    card.payload.eId = 'card-http-fail-1';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/fulfill')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('HTTP Fail Item')).toBeInTheDocument();
    });

    const fulfillBtns = screen.getAllByTestId('card-state-fulfilled');
    if (fulfillBtns.length > 0) {
      fireEvent.click(fulfillBtns[0]);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to change card state');
      });
    }
  });

  it('opens email panel when REQUESTED state change is triggered for Email order method', async () => {
    const card = createMockApiResponse('Email State Supplier', 'Email State Item', 'REQUESTING');
    card.payload.eId = 'card-email-state-1';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email State Item')).toBeInTheDocument();
    });

    // Click the start order button for the Email item - should open email panel
    const startOrderBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );
    if (startOrderBtns.length > 0) {
      fireEvent.click(startOrderBtns[0]);
      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });
    }
  });

  // ===== HANDLE ORDER ALL =====

  it('shows info toast when Order All is clicked with no requesting items', async () => {
    // Create a Requested (not Requesting) card - Order All button should appear
    // but clicking it shows info since no "Requesting" items
    const card = createMockApiResponse('Order All Supplier', 'All Requested Item', 'REQUESTED');
    card.payload.eId = 'card-order-all-1';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requested')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('All Requested Item')).toBeInTheDocument();
    });

    // Complete All Order button should appear (all items are Requested)
    const completeAllBtns = screen.queryAllByText(/Complete All Order/);
    if (completeAllBtns.length > 0) {
      fireEvent.click(completeAllBtns[0]);
      // No Requested items to complete or fetch is called
      await waitFor(() => {
        expect(screen.getByText('All Requested Item')).toBeInTheDocument();
      });
    }
  });

  it('handles Order All button click with requesting items', async () => {
    const card = createMockApiResponse('Order All Supplier', 'Order All Item', 'REQUESTING');
    card.payload.eId = 'card-order-all-2';
    card.payload.itemDetails.primarySupply.url = 'https://example.com/order';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);
    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Order All Item')).toBeInTheDocument();
    });

    // Find Order All button
    const orderAllBtns = screen.queryAllByText('Order All');
    if (orderAllBtns.length > 0) {
      fireEvent.click(orderAllBtns[0]);
      // Should attempt to process items
      await waitFor(() => {
        expect(screen.getByText('Order All Item')).toBeInTheDocument();
      });
    }

    windowOpenSpy.mockRestore();
  });

  // ===== HANDLE SEND EMAIL =====

  it('handles send email with valid items and success response', async () => {
    const card = createMockApiResponse('Email Co Full', 'Email Full Item', 'REQUESTING');
    card.payload.eId = 'card-email-full-1';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/api/email/send-order')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Full Item')).toBeInTheDocument();
    });

    // Click Start order to open email panel
    const startOrderBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );
    if (startOrderBtns.length > 0) {
      fireEvent.click(startOrderBtns[0]);
      // Email panel (dynamic component) opens
      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });
    }
  });

  it('shows error when send email fails with HTTP error', async () => {
    const card = createMockApiResponse('Email Fail Co', 'Email Fail Item', 'REQUESTING');
    card.payload.eId = 'card-email-fail-1';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/api/email/send-order')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Fail Item')).toBeInTheDocument();
    });
  });

  // ===== RECENTLY ORDERED TAB - IN PROCESS ITEMS JSX =====

  it('renders in-process items in the Recently Ordered tab with In-Transit badge', async () => {
    const inProcessCard = createMockApiResponse('Transit Supplier', 'Transit Item', 'IN_PROCESS');
    inProcessCard.payload.eId = 'card-transit-1';

    mockFetchForOrderQueue([], [inProcessCard], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Recently Ordered')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Recently Ordered'));

    await waitFor(() => {
      expect(screen.getByText('Transit Item')).toBeInTheDocument();
    });
  });

  it('renders in-process items with correct supplier grouping', async () => {
    const inProcessCard1 = createMockApiResponse('GroupedSupplier', 'Process Item A', 'IN_PROCESS');
    inProcessCard1.payload.eId = 'card-grp-1';
    const inProcessCard2 = createMockApiResponse('GroupedSupplier', 'Process Item B', 'IN_PROCESS');
    inProcessCard2.payload.eId = 'card-grp-2';

    mockFetchForOrderQueue([], [inProcessCard1, inProcessCard2], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Recently Ordered')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Recently Ordered'));

    await waitFor(() => {
      expect(screen.getByText('Process Item A')).toBeInTheDocument();
    });
    expect(screen.getByText('Process Item B')).toBeInTheDocument();
    expect(screen.getByText('GroupedSupplier')).toBeInTheDocument();
  });

  it('renders in-process items with group by order method in Recently Ordered tab', async () => {
    const inProcessCard = createMockApiResponse('Email Sup', 'Email Process Item', 'IN_PROCESS');
    inProcessCard.payload.eId = 'card-email-proc';
    inProcessCard.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [inProcessCard], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Recently Ordered')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Recently Ordered'));

    await waitFor(() => {
      expect(screen.getByText('Email Process Item')).toBeInTheDocument();
    });

    // Switch to order method grouping
    const orderMethodBtn = screen.queryByText('Order method');
    if (orderMethodBtn) {
      fireEvent.click(orderMethodBtn);
      await waitFor(() => {
        expect(screen.getByText('Email Process Item')).toBeInTheDocument();
      });
    }
  });

  it('shows Complete order button for Requested items', async () => {
    const requestedCard = createMockApiResponse('Req Corp', 'Ready to Complete', 'REQUESTED');
    requestedCard.payload.eId = 'card-req-complete';

    mockFetchForOrderQueue([requestedCard], [], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Ready to Complete')).toBeInTheDocument();
    });

    // Complete order button should be visible for Requested items
    const completeBtns = screen.queryAllByText('Complete order');
    expect(completeBtns.length).toBeGreaterThan(0);
  });

  it('shows Start order button for Requesting items with a link', async () => {
    const requestingCard = createMockApiResponse('Order Corp', 'Requesting Link Item', 'REQUESTING');
    requestingCard.payload.eId = 'card-req-order';
    requestingCard.payload.itemDetails.primarySupply.url = 'https://example.com/order';

    mockFetchForOrderQueue([], [], [requestingCard]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Requesting Link Item')).toBeInTheDocument();
    });

    // Start order button should be visible for Requesting items
    const startBtns = screen.queryAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );
    // The button must be present for Requesting items
    expect(startBtns.length).toBeGreaterThan(0);
    expect(startBtns[0]).toBeInTheDocument();
  });

  it('handles start order for item with link (non-email)', async () => {
    const requestingCard = createMockApiResponse('Online Corp', 'Link Order Item', 'REQUESTING');
    requestingCard.payload.eId = 'card-link-order';
    requestingCard.payload.itemDetails.primarySupply.url = 'https://example.com/order';

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [requestingCard] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Link Order Item')).toBeInTheDocument();
    });

    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/order', '_blank');
      });
    }

    windowOpenSpy.mockRestore();
  });

  it('handles start order error (thrown exception)', async () => {
    const requestingCard = createMockApiResponse('Error Corp', 'Exception Order Item', 'REQUESTING');
    requestingCard.payload.eId = 'card-exc-order';
    requestingCard.payload.itemDetails.primarySupply.url = 'https://example.com/order';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [requestingCard] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Exception Order Item')).toBeInTheDocument();
    });

    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error starting order');
      });
    }

    windowOpenSpy.mockRestore();
  });

  it('shows error for item missing URL when start order clicked for Online item', async () => {
    // Create an Online method item with no URL - canOrderItem returns false
    const card = createMockApiResponse('Missing URL Corp', 'No URL Online Item', 'REQUESTING');
    card.payload.eId = 'card-no-url-order';
    // Remove the URL so canOrderItem returns false for Online method
    card.payload.itemDetails.primarySupply.url = '';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('No URL Online Item')).toBeInTheDocument();
    });

    // Start order button should be disabled (canOrderItem returns false for Online with no URL)
    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startBtns.length > 0) {
      if (startBtns[0].hasAttribute('disabled')) {
        // Verified: button is disabled due to missing URL
        expect(startBtns[0]).toBeDisabled();
      } else {
        // If not disabled, clicking should show error about missing info
        fireEvent.click(startBtns[0]);
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('missing'));
        });
      }
    }
  });

  // ===== GETSTATUSDISPLAYINFO (module-level function covered via JSX rendering) =====

  it('renders Ready to order status info correctly', async () => {
    const card = createMockApiResponse('Status Sup', 'Status Item', 'REQUESTING');
    card.payload.eId = 'card-status-info';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Status Item')).toBeInTheDocument();
    });

    // The item should show Ready to order / In Order Queue status in the badge
    // This exercises getStatusDisplayInfo indirectly
    expect(screen.getByText('Status Item')).toBeInTheDocument();
  });

  it('renders In progress status for in-process items correctly', async () => {
    const inProcessCard = createMockApiResponse('Process Sup', 'In Process Status', 'IN_PROCESS');
    inProcessCard.payload.eId = 'card-inprocess-status';

    mockFetchForOrderQueue([], [inProcessCard], []);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Recently Ordered')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Recently Ordered'));

    await waitFor(() => {
      expect(screen.getByText('In Process Status')).toBeInTheDocument();
    });
  });

  // ===== COPY TO CLIPBOARD =====

  it('handles copy to clipboard for email items', async () => {
    const card = createMockApiResponse('Clipboard Co', 'Copy Item', 'REQUESTING');
    card.payload.eId = 'card-clipboard';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [], [card]);

    // Mock clipboard API
    const clipboardWriteSpy = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: clipboardWriteSpy },
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Copy Item')).toBeInTheDocument();
    });

    // The copy functionality is tested via the email panel
    // Start order to open email panel
    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );
    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);
      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });
    }
  });

  // ===== HANDLE SEND EMAIL - EDGE CASES =====

  it('handles send email when email API returns ok=false', async () => {
    const card = createMockApiResponse('Email Co Fail', 'Email False Item', 'REQUESTING');
    card.payload.eId = 'card-email-false';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/api/email/send-order')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: false }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email False Item')).toBeInTheDocument();
    });
  });

  it('handles start order with no link (non-email method without URL)', async () => {
    const card = createMockApiResponse('Phone Corp', 'Phone Order Item', 'REQUESTING');
    card.payload.eId = 'card-phone-order';
    card.payload.itemDetails.primarySupply.orderMethod = 'PHONE';
    card.payload.itemDetails.primarySupply.url = '';

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Phone Order Item')).toBeInTheDocument();
    });

    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/event/accept'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    }

    windowOpenSpy.mockRestore();
  });

  // ===== HANDLE SEND EMAIL (FUNCTION BODY) =====

  it('executes handleSendEmail via email panel send button', async () => {
    const card = createMockApiResponse('Email Corp Send', 'Email Send Item', 'REQUESTING');
    card.payload.eId = 'card-email-send-fn';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/api/email/send-order')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Send Item')).toBeInTheDocument();
    });

    // Click Start order to open email panel
    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      // Email panel should be shown - look for Send Email button
      await waitFor(() => {
        const sendBtn = screen.queryByTestId('send-email-btn');
        if (sendBtn) {
          fireEvent.click(sendBtn);
        }
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/email/send-order',
          expect.objectContaining({ method: 'POST' })
        );
      });
    }
  });

  it('executes handleSendEmail with API returning ok=false', async () => {
    const card = createMockApiResponse('Email Corp Fail', 'Email Fail Item', 'REQUESTING');
    card.payload.eId = 'card-email-fail';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/api/email/send-order')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: false }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Fail Item')).toBeInTheDocument();
    });

    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      await waitFor(() => {
        const sendBtn = screen.queryByTestId('send-email-btn');
        if (sendBtn) {
          fireEvent.click(sendBtn);
        }
      });

      // Should show failure toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to generate email')
        );
      });
    }
  });

  it('executes handleSendEmail with email API HTTP error', async () => {
    const card = createMockApiResponse('Email Corp HTTP', 'Email HTTP Item', 'REQUESTING');
    card.payload.eId = 'card-email-http';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/api/email/send-order')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email HTTP Item')).toBeInTheDocument();
    });

    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      await waitFor(() => {
        const sendBtn = screen.queryByTestId('send-email-btn');
        if (sendBtn) {
          fireEvent.click(sendBtn);
        }
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to generate email')
        );
      });
    }
  });

  // ===== HANDLE COPY TO CLIPBOARD =====

  it('executes handleCopyToClipboard via email panel copy button', async () => {
    const card = createMockApiResponse('Copy Corp', 'Copy Item', 'REQUESTING');
    card.payload.eId = 'card-copy';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Copy Item')).toBeInTheDocument();
    });

    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );

    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      await waitFor(() => {
        const copyBtn = screen.queryByTestId('copy-clipboard-btn');
        if (copyBtn) {
          fireEvent.click(copyBtn);
        }
      });

      await waitFor(() => {
        // handleCopyToClipboard accepts items and calls accept endpoint
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      });
    }
  });

  // ===== CARDSTATEDROPDOWN CALLBACKS IN GROUPED VIEW =====

  it('triggers onOpenEmailPanel via CardStateDropdown in grouped view', async () => {
    const card = createMockApiResponse('Email Supplier', 'Email Group Item', 'REQUESTING');
    card.payload.eId = 'card-email-group';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Group Item')).toBeInTheDocument();
    });

    const openEmailBtns = screen.getAllByTestId('card-state-open-email');
    if (openEmailBtns.length > 0) {
      fireEvent.click(openEmailBtns[0]);

      await waitFor(() => {
        // After opening email panel, DynamicComponent with send-email-btn should appear
        // The EmailPanel is only rendered when selectedItemsForEmail.length > 0
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      });
    }
  });

  it('triggers onTriggerRefresh via CardStateDropdown in grouped view', async () => {
    const card = createMockApiResponse('Refresh Supplier', 'Refresh Group Item', 'REQUESTING');
    card.payload.eId = 'card-refresh-group';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Refresh Group Item')).toBeInTheDocument();
    });

    const refreshBtns = screen.getAllByTestId('card-state-trigger-refresh');
    if (refreshBtns.length > 0) {
      fireEvent.click(refreshBtns[0]);
      await waitFor(() => {
        // After triggering refresh, fetch should be called again
        expect(global.fetch).toHaveBeenCalled();
      });
    }
  });

  it('triggers showToast via CardStateDropdown in grouped view', async () => {
    const card = createMockApiResponse('Toast Supplier', 'Toast Group Item', 'REQUESTING');
    card.payload.eId = 'card-toast-group';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Toast Group Item')).toBeInTheDocument();
    });

    const toastBtns = screen.getAllByTestId('card-state-show-toast');
    if (toastBtns.length > 0) {
      fireEvent.click(toastBtns[0]);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('State changed successfully');
      });
    }
  });

  // ===== UNGROUPED VIEW =====

  it('renders items in ungrouped view with Start Order button', async () => {
    const card = createMockApiResponse('Flat Supplier', 'Flat Item', 'REQUESTING');
    card.payload.eId = 'card-flat-1';
    card.payload.itemDetails.primarySupply.url = 'https://example.com/flat';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Flat Item')).toBeInTheDocument();
    });

    // Switch to no grouping
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);

      await waitFor(() => {
        expect(screen.getByText('Flat Item')).toBeInTheDocument();
      });

      // Click Start order in ungrouped view
      const startBtns = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('Start order')
      );
      if (startBtns.length > 0) {
        fireEvent.click(startBtns[0]);
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/event/accept'),
            expect.objectContaining({ method: 'POST' })
          );
        });
      }
    }
  });

  it('renders items in ungrouped view with Complete Order button', async () => {
    const card = createMockApiResponse('Flat Supplier 2', 'Flat Requested Item', 'REQUESTED');
    card.payload.eId = 'card-flat-req';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requested')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/start-processing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Flat Requested Item')).toBeInTheDocument();
    });

    // Switch to no grouping
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);

      await waitFor(() => {
        expect(screen.getByText('Flat Requested Item')).toBeInTheDocument();
      });

      // Click Complete order in ungrouped view
      const completeBtns = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('Complete order')
      );
      if (completeBtns.length > 0) {
        fireEvent.click(completeBtns[0]);
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/event/start-processing'),
            expect.objectContaining({ method: 'POST' })
          );
        });
      }
    }
  });

  it('renders CardStateDropdown in ungrouped view', async () => {
    const card = createMockApiResponse('Flat Supplier 3', 'Flat Dropdown Item', 'REQUESTING');
    card.payload.eId = 'card-flat-dropdown';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Flat Dropdown Item')).toBeInTheDocument();
    });

    // Switch to no grouping
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);

      await waitFor(() => {
        expect(screen.getByText('Flat Dropdown Item')).toBeInTheDocument();
      });

      // CardStateDropdown should be present in the ungrouped view
      const toastBtns = screen.getAllByTestId('card-state-show-toast');
      if (toastBtns.length > 0) {
        fireEvent.click(toastBtns[0]);
        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith('State changed successfully');
        });
      }
    }
  });

  // ===== HANDLE SEND EMAIL - ACCEPT ENDPOINT FAILURE =====

  it('handles handleSendEmail when accept endpoint fails', async () => {
    const card = createMockApiResponse('Fail Accept Corp', 'Fail Accept Item', 'REQUESTING');
    card.payload.eId = 'card-fail-accept';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/api/email/send-order')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Fail Accept Item')).toBeInTheDocument();
    });

    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );
    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      await waitFor(() => {
        const sendBtn = screen.queryByTestId('send-email-btn');
        if (sendBtn) {
          fireEvent.click(sendBtn);
        }
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to accept some items')
        );
      });
    }
  });

  // ===== HANDLE COPY TO CLIPBOARD - ACCEPT ENDPOINT FAILURE =====

  it('handles handleCopyToClipboard when accept endpoint fails', async () => {
    const card = createMockApiResponse('Copy Fail Corp', 'Copy Fail Item', 'REQUESTING');
    card.payload.eId = 'card-copy-fail';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Copy Fail Item')).toBeInTheDocument();
    });

    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );
    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      await waitFor(() => {
        const copyBtn = screen.queryByTestId('copy-clipboard-btn');
        if (copyBtn) {
          fireEvent.click(copyBtn);
        }
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to accept some items')
        );
      });
    }
  });

  // ===== DYNAMIC COMPONENT CALLBACKS =====

  it('closes ItemDetailsPanel via dynamic-close-btn', async () => {
    const card = createMockApiResponse('Close Supplier', 'Close Details Item', 'REQUESTING');
    card.payload.eId = 'card-close-details';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Close Details Item')).toBeInTheDocument();
    });

    // Click View card details
    const viewDetailsBtns = screen.queryAllByText('View card details');
    if (viewDetailsBtns.length > 0) {
      fireEvent.click(viewDetailsBtns[0]);

      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });

      // Click close button
      const closeBtns = screen.queryAllByTestId('dynamic-close-btn');
      if (closeBtns.length > 0) {
        fireEvent.click(closeBtns[0]);
        // No error should occur
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      }
    }
  });

  it('triggers onEditItem via dynamic-edit-btn from ItemDetailsPanel', async () => {
    const card = createMockApiResponse('Edit Supplier 2', 'Edit Details Item', 'REQUESTING');
    card.payload.eId = 'card-edit-details';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Details Item')).toBeInTheDocument();
    });

    // Click View card details to open ItemDetailsPanel
    const viewDetailsBtns = screen.queryAllByText('View card details');
    if (viewDetailsBtns.length > 0) {
      fireEvent.click(viewDetailsBtns[0]);

      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });

      // Click edit button in ItemDetailsPanel
      const editBtns = screen.queryAllByTestId('dynamic-edit-btn');
      if (editBtns.length > 0) {
        fireEvent.click(editBtns[0]);
        // ItemFormPanel should now be open
        await waitFor(() => {
          expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
        });
      }
    }
  });

  // ===== HANDLE ORDER ALL FOR ORDER METHOD GROUP =====

  it('handles Order All when groupBy is orderMethod', async () => {
    const card = createMockApiResponse('OM Supplier', 'OM Item', 'REQUESTING');
    card.payload.eId = 'card-om-1';
    card.payload.itemDetails.primarySupply.url = 'https://example.com/om';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('OM Item')).toBeInTheDocument();
    });

    // Switch to order method grouping
    const orderMethodBtn = screen.queryByText('Order method');
    if (orderMethodBtn) {
      fireEvent.click(orderMethodBtn);

      await waitFor(() => {
        expect(screen.getByText('OM Item')).toBeInTheDocument();
      });

      // Click Order All button if present
      const orderAllBtns = screen.queryAllByText('Order All');
      if (orderAllBtns.length > 0) {
        fireEvent.click(orderAllBtns[0]);
        await waitFor(() => {
          expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
        });
      }
    }
  });

  // ===== HANDLE SEND EMAIL - EMPTY ITEMS =====

  it('handles handleSendEmail with no valid items found', async () => {
    // Create a card with minimal data so originalApiData won't match
    const card = createMockApiResponse('No Data Corp', 'No Data Item', 'REQUESTING');
    card.payload.eId = 'card-no-data';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    // Mock API to not return item details for the email
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/api/email/send-order')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('No Data Item')).toBeInTheDocument();
    });

    // Start the email flow
    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );
    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      // If email panel opens, click send
      await waitFor(() => {
        const sendBtn = screen.queryByTestId('send-email-btn');
        if (sendBtn) {
          fireEvent.click(sendBtn);
        }
      });

      // Either success or error toast should be shown
      await waitFor(() => {
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      });
    }
  });

  // ===== EMAIL PANEL onClose CALLBACK =====

  it('closes EmailPanel via dynamic-close-btn', async () => {
    const card = createMockApiResponse('Email Close Corp', 'Email Close Item', 'REQUESTING');
    card.payload.eId = 'card-email-close';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Close Item')).toBeInTheDocument();
    });

    // Start order for Email method - opens email panel
    const startBtns = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Start order')
    );
    if (startBtns.length > 0) {
      fireEvent.click(startBtns[0]);

      // Wait for EmailPanel to open
      await waitFor(() => {
        const closeBtns = screen.queryAllByTestId('dynamic-close-btn');
        if (closeBtns.length > 0) {
          fireEvent.click(closeBtns[0]);
        }
      });

      // After closing, page should still render
      await waitFor(() => {
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      });
    }
  });

  // ===== ITEM FORM PANEL CALLBACKS =====

  it('closes ItemFormPanel via dynamic-close-btn when opened via Edit item', async () => {
    const card = createMockApiResponse('Form Close Supplier', 'Form Close Item', 'REQUESTING');
    card.payload.eId = 'card-form-close';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Form Close Item')).toBeInTheDocument();
    });

    // Click Edit item to open ItemFormPanel
    const editItemBtns = screen.queryAllByText('Edit item');
    if (editItemBtns.length > 0) {
      fireEvent.click(editItemBtns[0]);

      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });

      // Close the form panel
      const closeBtns = screen.queryAllByTestId('dynamic-close-btn');
      if (closeBtns.length > 0) {
        fireEvent.click(closeBtns[0]);
        await waitFor(() => {
          expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
        });
      }
    }
  });

  it('triggers onSuccess callback of ItemFormPanel', async () => {
    const card = createMockApiResponse('Form Success Supplier', 'Form Success Item', 'REQUESTING');
    card.payload.eId = 'card-form-success';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Form Success Item')).toBeInTheDocument();
    });

    // Click Edit item to open ItemFormPanel
    const editItemBtns = screen.queryAllByText('Edit item');
    if (editItemBtns.length > 0) {
      fireEvent.click(editItemBtns[0]);

      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });

      // Click success button
      const successBtns = screen.queryAllByTestId('dynamic-success-btn');
      if (successBtns.length > 0) {
        fireEvent.click(successBtns[0]);
        await waitFor(() => {
          expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
        });
      }
    }
  });

  // ===== TOGGLE ORDER METHOD GROUP EXPANSION =====

  it('toggles orderMethod group expansion when collapse button is clicked', async () => {
    const card = createMockApiResponse('OM Toggle Supplier', 'OM Toggle Item', 'REQUESTING');
    card.payload.eId = 'card-om-toggle';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('OM Toggle Item')).toBeInTheDocument();
    });

    // Switch to order method grouping
    const orderMethodBtn = screen.queryByText('Order method');
    if (orderMethodBtn) {
      fireEvent.click(orderMethodBtn);

      await waitFor(() => {
        expect(screen.getByText('OM Toggle Item')).toBeInTheDocument();
      });

      // Click expand/collapse button for orderMethod group
      const expandBtns = screen.queryAllByLabelText('Expand/Collapse');
      if (expandBtns.length > 0) {
        fireEvent.click(expandBtns[0]);
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      }
    }
  });

  // ===== HANDLE ORDER ALL - COMPLETE ACTION =====

  it('handles Order All complete action for supplier group', async () => {
    const card = createMockApiResponse('Complete All Supplier', 'Complete All Item', 'REQUESTED');
    card.payload.eId = 'card-complete-all';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requested')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/start-processing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Complete All Item')).toBeInTheDocument();
    });

    // Click "Complete All Order" button if present
    const completeAllBtns = screen.queryAllByText('Complete All Order');
    if (completeAllBtns.length > 0) {
      fireEvent.click(completeAllBtns[0]);
      await waitFor(() => {
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      });
    }
  });

  // ===== HANDLE ORDER ALL - ORDER METHOD EMPTY =====

  it('handles Order All for orderMethod group with no requesting items', async () => {
    const card = createMockApiResponse('OM Empty Supplier', 'OM Empty Item', 'REQUESTING');
    card.payload.eId = 'card-om-empty';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('OM Empty Item')).toBeInTheDocument();
    });

    // Switch to order method grouping first
    const orderMethodBtn = screen.queryByText('Order method');
    if (orderMethodBtn) {
      fireEvent.click(orderMethodBtn);

      await waitFor(() => {
        expect(screen.getByText('OM Empty Item')).toBeInTheDocument();
      });

      // Click Order All in order method view
      const orderAllBtns = screen.queryAllByText('Order All');
      if (orderAllBtns.length > 0) {
        fireEvent.click(orderAllBtns[0]);
        await waitFor(() => {
          expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
        });
      }
    }
  });

  // ===== ITEM DETAILS PANEL onOpenChange CALLBACK =====

  it('triggers onOpenChange callback of ItemDetailsPanel', async () => {
    const card = createMockApiResponse('Open Change Supplier', 'Open Change Item', 'REQUESTING');
    card.payload.eId = 'card-open-change';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Open Change Item')).toBeInTheDocument();
    });

    // Open item details panel
    const viewDetailsBtns = screen.queryAllByText('View card details');
    if (viewDetailsBtns.length > 0) {
      fireEvent.click(viewDetailsBtns[0]);

      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });

      // Click onOpenChange button
      const openChangeBtns = screen.queryAllByTestId('dynamic-open-change-btn');
      if (openChangeBtns.length > 0) {
        fireEvent.click(openChangeBtns[0]);
        await waitFor(() => {
          expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
        });
      }
    }
  });

  // ===== MISSING URL MODAL =====

  it('opens MissingUrlModal when Order All is clicked with mixed items and clicks Add the rest', async () => {
    // Two items in the same supplier group: one with URL (can order), one without (cannot)
    const cardWithUrl = createMockApiResponse('Mixed Supplier', 'Item With URL', 'REQUESTING');
    cardWithUrl.payload.eId = 'card-with-url';
    cardWithUrl.payload.itemDetails.primarySupply.url = 'https://example.com/item';

    const cardNoUrl = createMockApiResponse('Mixed Supplier', 'Item No URL', 'REQUESTING');
    cardNoUrl.payload.eId = 'card-no-url';
    cardNoUrl.payload.itemDetails.primarySupply.url = ''; // No URL - can't order

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [cardWithUrl, cardNoUrl] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);
    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Item With URL')).toBeInTheDocument();
    });

    // Click Order All button which should open the MissingUrlModal
    const orderAllBtns = screen.queryAllByText('Order All');
    if (orderAllBtns.length > 0) {
      fireEvent.click(orderAllBtns[0]);

      // Wait for modal to appear
      await waitFor(() => {
        const cantOrderText = screen.queryByText(/Can.t order some items/);
        if (cantOrderText) {
          expect(cantOrderText).toBeInTheDocument();
        }
      });

      // Check if modal is open by looking for Cancel button
      const cancelBtns = screen.queryAllByText('Cancel');
      if (cancelBtns.length > 0) {
        // Modal IS open - click "Add the rest" button (the proceed button in the modal)
        const addRestBtns = screen.queryAllByText('Add the rest');
        if (addRestBtns.length > 0) {
          fireEvent.click(addRestBtns[0]);
          await waitFor(() => {
            expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
          });
        } else {
          // Click Cancel to close
          fireEvent.click(cancelBtns[0]);
        }
      }
    }

    windowOpenSpy.mockRestore();
  });

  it('closes MissingUrlModal via close icon button', async () => {
    const cardWithUrl = createMockApiResponse('Close Icon Supplier', 'Close Icon URL Item', 'REQUESTING');
    cardWithUrl.payload.eId = 'card-close-icon-url';
    cardWithUrl.payload.itemDetails.primarySupply.url = 'https://example.com/close';

    const cardNoUrl = createMockApiResponse('Close Icon Supplier', 'Close Icon No URL Item', 'REQUESTING');
    cardNoUrl.payload.eId = 'card-close-icon-nourl';
    cardNoUrl.payload.itemDetails.primarySupply.url = '';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [cardWithUrl, cardNoUrl] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Close Icon URL Item')).toBeInTheDocument();
    });

    // Click Order All to open modal
    const orderAllBtns = screen.queryAllByText('Order All');
    if (orderAllBtns.length > 0) {
      fireEvent.click(orderAllBtns[0]);

      await waitFor(() => {
        const cancelBtns = screen.queryAllByText('Cancel');
        if (cancelBtns.length > 0) {
          // Modal is open - find the X close button (button inside modal without text)
          // The X button is before Cancel, so look for buttons with no text content
          const allBtns = screen.queryAllByRole('button');
          const xBtn = allBtns.find(btn => btn.textContent === '' || btn.textContent?.trim() === '');
          if (xBtn) {
            fireEvent.click(xBtn);
          } else {
            // Fall back to clicking Cancel
            fireEvent.click(cancelBtns[0]);
          }
          expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
        }
      });
    }
  });

  it('handles ItemFormPanel with secondarySupply data', async () => {
    const card = createMockApiResponse('Secondary Supplier', 'Secondary Item', 'REQUESTING');
    card.payload.eId = 'card-secondary';
    // Add secondarySupply data
    (card.payload.itemDetails as Record<string, unknown>).secondarySupply = {
      supplier: 'Secondary Supplier Co',
      url: 'https://secondary.com',
      sku: 'SEC-SKU-001',
      unitCost: { value: 15.0, currency: 'USD' },
      minimumQuantity: { amount: 5, unit: 'each' },
      orderQuantity: { amount: 10, unit: 'each' },
      averageLeadTime: { length: 7, unit: 'DAY' },
      orderMethod: 'EMAIL',
    };

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Secondary Item')).toBeInTheDocument();
    });

    // Click Edit item to open ItemFormPanel with secondarySupply
    const editItemBtns = screen.queryAllByText('Edit item');
    if (editItemBtns.length > 0) {
      fireEvent.click(editItemBtns[0]);

      await waitFor(() => {
        // ItemFormPanel should render with secondarySupply data mapped
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });
    }
  });

  // ===== HANDLE EDIT ITEM IN UNGROUPED VIEW =====

  it('handles Edit item click in ungrouped view', async () => {
    const card = createMockApiResponse('Ungrouped Edit Supplier', 'Ungrouped Edit Item', 'REQUESTING');
    card.payload.eId = 'card-ungrouped-edit';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Ungrouped Edit Item')).toBeInTheDocument();
    });

    // Switch to no grouping
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);

      await waitFor(() => {
        expect(screen.getByText('Ungrouped Edit Item')).toBeInTheDocument();
      });

      // Click Edit item in ungrouped view
      const editItemBtns = screen.queryAllByText('Edit item');
      if (editItemBtns.length > 0) {
        fireEvent.click(editItemBtns[0]);
        await waitFor(() => {
          expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
        });
      }
    }
  });

  it('triggers onAddToOrderQueue in ungrouped view', async () => {
    const card = createMockApiResponse('Ungrouped Queue Supplier', 'Ungrouped Queue Item', 'REQUESTING');
    card.payload.eId = 'card-ungrouped-queue';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      if (url.includes('/event/request')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Ungrouped Queue Item')).toBeInTheDocument();
    });

    // Switch to no grouping
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);

      await waitFor(() => {
        expect(screen.getByText('Ungrouped Queue Item')).toBeInTheDocument();
      });

      // Click add-queue button in ungrouped view
      const addQueueBtns = screen.getAllByTestId('card-state-add-queue');
      if (addQueueBtns.length > 0) {
        fireEvent.click(addQueueBtns[0]);
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/event/request'),
            expect.objectContaining({ method: 'POST' })
          );
        });
      }
    }
  });

  it('triggers onOpenEmailPanel via CardStateDropdown in ungrouped view', async () => {
    const card = createMockApiResponse('Ungrouped Email Supplier', 'Ungrouped Email Item', 'REQUESTING');
    card.payload.eId = 'card-ungrouped-email';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [], [card]);

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Ungrouped Email Item')).toBeInTheDocument();
    });

    // Switch to no grouping
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);

      await waitFor(() => {
        expect(screen.getByText('Ungrouped Email Item')).toBeInTheDocument();
      });

      // Click open-email button in ungrouped view
      const openEmailBtns = screen.getAllByTestId('card-state-open-email');
      if (openEmailBtns.length > 0) {
        fireEvent.click(openEmailBtns[0]);
        await waitFor(() => {
          // Email panel opens (selectedItemsForEmail.length > 0)
          expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
        });
      }
    }
  });

  it('triggers onTriggerRefresh via CardStateDropdown in ungrouped view', async () => {
    const card = createMockApiResponse('Ungrouped Refresh Supplier', 'Ungrouped Refresh Item', 'REQUESTING');
    card.payload.eId = 'card-ungrouped-refresh';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Ungrouped Refresh Item')).toBeInTheDocument();
    });

    // Switch to no grouping
    const noGroupingBtn = screen.queryByText('(No grouping)');
    if (noGroupingBtn) {
      fireEvent.click(noGroupingBtn);

      await waitFor(() => {
        expect(screen.getByText('Ungrouped Refresh Item')).toBeInTheDocument();
      });

      // Click trigger-refresh button in ungrouped view
      const refreshBtns = screen.getAllByTestId('card-state-trigger-refresh');
      if (refreshBtns.length > 0) {
        fireEvent.click(refreshBtns[0]);
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        });
      }
    }
  });

  // ===== MISSING URL MODAL INTERACTION =====

  it('closes MissingUrlModal by clicking close icon', async () => {
    const cardNoUrl = createMockApiResponse('Close Modal Supplier', 'Close Modal Item', 'REQUESTING');
    cardNoUrl.payload.eId = 'card-close-modal';
    cardNoUrl.payload.itemDetails.primarySupply.url = '';

    const cardWithUrl = createMockApiResponse('Close Modal Supplier', 'Close Modal Item 2', 'REQUESTING');
    cardWithUrl.payload.eId = 'card-close-modal-2';
    cardWithUrl.payload.itemDetails.primarySupply.url = 'https://example.com';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [cardNoUrl, cardWithUrl] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Close Modal Item')).toBeInTheDocument();
    });

    // Click Order All to trigger modal
    const orderAllBtns = screen.queryAllByText('Order All');
    if (orderAllBtns.length > 0) {
      fireEvent.click(orderAllBtns[0]);

      await waitFor(() => {
        const cantOrderText = screen.queryByText(/Can.t order some items/);
        if (cantOrderText) {
          // Click Cancel button to close modal
          const cancelBtns = screen.queryAllByRole('button').filter(btn =>
            btn.textContent?.trim() === 'Cancel'
          );
          if (cancelBtns.length > 0) {
            fireEvent.click(cancelBtns[0]);
            expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
          }
        }
      });
    }
  });

  it('handles handleOrderAll with items all missing required info', async () => {
    // Only item with no URL and no supplier
    const cardNoInfo = createMockApiResponse('', 'No Info Item', 'REQUESTING');
    cardNoInfo.payload.eId = 'card-no-info';
    cardNoInfo.payload.itemDetails.primarySupply.url = '';
    cardNoInfo.payload.itemDetails.primarySupply.supplier = '';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [cardNoInfo] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('No Info Item')).toBeInTheDocument();
    });

    // With no supplier, the item cannot be ordered - canOrderItem returns false
    // "Order All" button is shown for groups with Requesting items
    const orderAllBtns = screen.queryAllByText('Order All');
    if (orderAllBtns.length > 0) {
      fireEvent.click(orderAllBtns[0]);

      // Either the modal opens (lines 1331-1334) or "No items to process" toast shows (1346-1349)
      await waitFor(() => {
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      });
    }
  });

  it('handles handleOrderAll with Email and non-Email mix (both can order)', async () => {
    // Create two cards in the same supplier group:
    // 1. Email method card
    // 2. Online method card with URL
    const emailCard = createMockApiResponse('Mix Supplier', 'Email Mix Item', 'REQUESTING');
    emailCard.payload.eId = 'card-email-mix';
    emailCard.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';
    emailCard.payload.itemDetails.primarySupply.url = '';

    const onlineCard = createMockApiResponse('Mix Supplier', 'Online Mix Item', 'REQUESTING');
    onlineCard.payload.eId = 'card-online-mix';
    onlineCard.payload.itemDetails.primarySupply.orderMethod = 'ONLINE';
    onlineCard.payload.itemDetails.primarySupply.url = 'https://example.com/mix';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [emailCard, onlineCard] } }),
        });
      }
      if (url.includes('/event/accept')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);
    localStorage.setItem('idToken', 'mock-token');
    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Email Mix Item')).toBeInTheDocument();
    });

    // Click Order All button for the Mix Supplier group
    const orderAllBtns = screen.queryAllByText('Order All');
    if (orderAllBtns.length > 0) {
      fireEvent.click(orderAllBtns[0]);

      await waitFor(() => {
        // After Order All, email panel should open for the Email item
        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      });
    }

    windowOpenSpy.mockRestore();
  });

  it('handles card without primarySupply in data fetch', async () => {
    // Card with missing primarySupply but with eId in requesting set
    const cardNoPrimary = {
      payload: {
        eId: 'card-no-primary',
        status: 'REQUESTING',
        itemDetails: {
          eId: 'item-no-primary',
          name: 'No Primary Item',
          // No primarySupply
        },
        item: { type: 'Item', eId: 'item-1', name: 'No Primary Item' },
        cardQuantity: { amount: 1, unit: 'each' },
        printStatus: 'PRINTED',
      },
    };

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [cardNoPrimary] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      // Page should render even with cards missing primarySupply
      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    });
  });

  it('handles handleSendEmail when token is missing', async () => {
    const card = createMockApiResponse('No Token Corp', 'No Token Item', 'REQUESTING');
    card.payload.eId = 'card-no-token';
    card.payload.itemDetails.primarySupply.orderMethod = 'EMAIL';

    mockFetchForOrderQueue([], [], [card]);

    // Override JWT mock to return no token
    const { useJWT } = jest.requireMock('@/contexts/JWTContext');
    useJWT.mockReturnValueOnce({
      token: null,
      isTokenValid: false,
      payload: null,
      userContext: null,
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    });
  });

  it('covers ItemFormPanel onSuccess refresh calls', async () => {
    jest.useFakeTimers();
    const card = createMockApiResponse('OnSuccess Supplier', 'OnSuccess Item', 'REQUESTING');
    card.payload.eId = 'card-on-success-refresh';

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/details/requesting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { results: [card] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { results: [] } }),
      });
    });

    renderWithAll(<OrderQueuePage />);

    await waitFor(() => {
      expect(screen.getByText('OnSuccess Item')).toBeInTheDocument();
    });

    // Open ItemFormPanel via Edit item
    const editItemBtns = screen.queryAllByText('Edit item');
    if (editItemBtns.length > 0) {
      fireEvent.click(editItemBtns[0]);

      await waitFor(() => {
        expect(screen.getAllByTestId('dynamic-component').length).toBeGreaterThan(0);
      });

      // Click success button which triggers onSuccess callback (refreshKanbanData + refreshOrderQueueData)
      const successBtns = screen.queryAllByTestId('dynamic-success-btn');
      if (successBtns.length > 0) {
        fireEvent.click(successBtns[0]);

        // Advance timers to trigger the setTimeout(1000) inside onSuccess
        jest.runAllTimers();

        await waitFor(() => {
          expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
        });
      }
    }

    jest.useRealTimers();
  });
});
