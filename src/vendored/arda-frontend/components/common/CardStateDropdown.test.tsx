import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@frontend/components/ui/dropdown-menu';
import { CardStateDropdown } from './CardStateDropdown';
import { canAddToOrderQueue } from '@frontend/lib/cardStateUtils';
import { KanbanCard } from '@frontend/types/kanban-cards';

jest.mock('@/lib/cardStateUtils', () => ({
  canAddToOrderQueue: jest.fn(),
}));
jest.mock('@/lib/fly-to-target', () => ({
  flyToTarget: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockCard: KanbanCard = {
  entityId: 'card-1',
  recordId: 'rec-1',
  author: 'test',
  timeCoordinates: { timestamp: '2024-01-01T00:00:00Z' } as unknown as KanbanCard['timeCoordinates'],
  createdCoordinates: { timestamp: '2024-01-01T00:00:00Z' } as unknown as KanbanCard['createdCoordinates'],
  serialNumber: 'SN-001',
  item: {
    entityId: 'item-1',
    recordId: 'rec-item-1',
    author: 'test',
    timeCoordinates: { timestamp: '2024-01-01T00:00:00Z' } as unknown as KanbanCard['timeCoordinates'],
    createdCoordinates: { timestamp: '2024-01-01T00:00:00Z' } as unknown as KanbanCard['createdCoordinates'],
    name: 'Test Item',
  },
  status: 'REQUESTING',
  printStatus: 'NOT_PRINTED',
};

function renderCardStateDropdown(props: Partial<React.ComponentProps<typeof CardStateDropdown>> = {}) {
  return render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <CardStateDropdown card={mockCard} {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('CardStateDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (canAddToOrderQueue as jest.Mock).mockReturnValue(true);
  });

  it('renders "Card state" sub-trigger text', async () => {
    renderCardStateDropdown();
    expect(await screen.findByText('Card state')).toBeInTheDocument();
  });

  it('shows all state options', async () => {
    renderCardStateDropdown();
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);

    expect(await screen.findByText('In Order Queue')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Receiving')).toBeInTheDocument();
    expect(screen.getByText('Restocked')).toBeInTheDocument();
  });

  it('disables current state option', async () => {
    renderCardStateDropdown({ card: { ...mockCard, status: 'REQUESTING' } });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);

    const orderQueueItem = await screen.findByText('In Order Queue');
    const menuItem = orderQueueItem.closest('[role="menuitem"]');
    expect(menuItem).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables "In Order Queue" when canAddToOrderQueue returns false', async () => {
    (canAddToOrderQueue as jest.Mock).mockReturnValue(false);
    renderCardStateDropdown({ card: { ...mockCard, status: 'REQUESTED' } });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);

    const orderQueueItem = await screen.findByText('In Order Queue');
    const menuItem = orderQueueItem.closest('[role="menuitem"]');
    expect(menuItem).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onStateChange callback when state option clicked', async () => {
    const onStateChange = jest.fn();
    renderCardStateDropdown({
      card: { ...mockCard, status: 'REQUESTING' },
      onStateChange,
    });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);

    const restockedItem = await screen.findByText('Restocked');
    fireEvent.click(restockedItem);
    expect(onStateChange).toHaveBeenCalledWith('FULFILLED');
  });

  it('calls onAddToOrderQueue when REQUESTING clicked and no internal triggers', async () => {
    const onAddToOrderQueue = jest.fn();
    renderCardStateDropdown({
      card: { ...mockCard, status: 'AVAILABLE' },
      onAddToOrderQueue,
    });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('In Order Queue');
    fireEvent.click(item);
    expect(onAddToOrderQueue).toHaveBeenCalledTimes(1);
  });

  it('calls onStateChange with IN_PROCESS when Receiving clicked', async () => {
    const onStateChange = jest.fn();
    renderCardStateDropdown({
      card: { ...mockCard, status: 'REQUESTING' },
      onStateChange,
    });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Receiving');
    fireEvent.click(item);
    expect(onStateChange).toHaveBeenCalledWith('IN_PROCESS');
  });

  it('opens email panel for REQUESTED state when orderMethod is Email', async () => {
    const onOpenEmailPanel = jest.fn();
    renderCardStateDropdown({
      card: { ...mockCard, status: 'REQUESTING' },
      orderMethod: 'Email',
      onOpenEmailPanel,
    });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('In Progress');
    fireEvent.click(item);
    expect(onOpenEmailPanel).toHaveBeenCalledTimes(1);
  });

  it('opens link in new tab for REQUESTED state when link is provided', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const onStateChange = jest.fn();
    renderCardStateDropdown({
      card: { ...mockCard, status: 'REQUESTING' },
      link: 'https://example.com',
      onStateChange,
    });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('In Progress');
    fireEvent.click(item);
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
    openSpy.mockRestore();
  });
});

describe('CardStateDropdown — handleInternalStateChange (fetch mocked)', () => {
  // toast mock is set up in jest.mock('sonner') above; no local variable needed

  beforeEach(() => {
    jest.clearAllMocks();
    (canAddToOrderQueue as jest.Mock).mockReturnValue(true);
    // Set JWT token in localStorage
    localStorage.setItem('idToken', 'test-jwt-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  function renderWithInternal(props: Partial<React.ComponentProps<typeof CardStateDropdown>> = {}) {
    const onTriggerRefresh = jest.fn().mockResolvedValue(undefined);
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <CardStateDropdown
            card={mockCard}
            onTriggerRefresh={onTriggerRefresh}
            {...props}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
    return { onTriggerRefresh };
  }

  it('shows error toast when no JWT token in localStorage', async () => {
    localStorage.removeItem('idToken');
    const showToast = jest.fn();
    renderWithInternal({ showToast });

    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Restocked');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Authentication token not found');
    });
  });

  it('calls onTriggerRefresh on successful FULFILLED state change', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as jest.Mock;

    const { onTriggerRefresh } = renderWithInternal();
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Restocked');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(onTriggerRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onTriggerRefresh on successful REQUESTED state change', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as jest.Mock;

    const { onTriggerRefresh } = renderWithInternal({
      card: { ...mockCard, status: 'REQUESTING' },
    });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('In Progress');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(onTriggerRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onTriggerRefresh on successful IN_PROCESS state change', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as jest.Mock;

    const { onTriggerRefresh } = renderWithInternal({
      card: { ...mockCard, status: 'REQUESTING' },
    });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Receiving');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(onTriggerRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onRefreshCards as fallback when onTriggerRefresh not provided', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as jest.Mock;

    const onRefreshCards = jest.fn().mockResolvedValue(undefined);
    const showToast = jest.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <CardStateDropdown
            card={mockCard}
            onRefreshCards={onRefreshCards}
            showToast={showToast}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Restocked');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(onRefreshCards).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast when response.ok is false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as jest.Mock;

    const showToast = jest.fn();
    renderWithInternal({ showToast });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Restocked');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Failed to change card state');
    });
  });

  it('shows error toast when response.ok true but data.ok is false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false }),
    }) as jest.Mock;

    const showToast = jest.fn();
    renderWithInternal({ showToast });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Restocked');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Failed to change card state');
    });
  });

  it('shows error toast when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;

    const showToast = jest.fn();
    renderWithInternal({ showToast });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Restocked');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Error changing card state');
    });
  });

  it('uses toast.success directly when showToast not provided (success path)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as jest.Mock;
    const { toast: toastMock } = jest.requireMock('sonner');

    renderWithInternal();
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Restocked');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(toastMock.success).toHaveBeenCalled();
    });
  });

  it('uses toast.error directly when showToast not provided (error path)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    }) as jest.Mock;
    const { toast: toastMock } = jest.requireMock('sonner');

    renderWithInternal();
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('Restocked');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalled();
    });
  });

  it('REQUESTING state: runs animation when card element and order-queue-target found', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as jest.Mock;

    // Create DOM elements for the animation
    const cardEl = document.createElement('div');
    cardEl.setAttribute('data-card-id', 'card-1');
    document.body.appendChild(cardEl);
    const targetEl = document.createElement('div');
    targetEl.id = 'order-queue-target';
    document.body.appendChild(targetEl);

    const { onTriggerRefresh } = renderWithInternal({
      card: { ...mockCard, status: 'AVAILABLE' },
    });
    const trigger = await screen.findByText('Card state');
    fireEvent.click(trigger);
    const item = await screen.findByText('In Order Queue');
    await act(async () => {
      fireEvent.click(item);
    });
    await waitFor(() => {
      expect(onTriggerRefresh).toHaveBeenCalledTimes(1);
    });

    document.body.removeChild(cardEl);
    document.body.removeChild(targetEl);
  });
});
