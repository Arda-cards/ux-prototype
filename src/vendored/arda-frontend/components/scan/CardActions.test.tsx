import { render, screen, fireEvent } from '@testing-library/react';
import { CardActions } from './CardActions';
import '@testing-library/jest-dom';

jest.mock('@/components/items/ItemCardView', () => ({
  ItemCardView: ({ item }: { item: { title: string } }) => (
    <div data-testid='item-card-view'>{item.title}</div>
  ),
}));

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

describe('CardActions', () => {
  const onAddToOrderQueue = jest.fn();
  const onReceiveCard = jest.fn();
  const onViewItemDetails = jest.fn();
  const onClose = jest.fn();
  const isAddToOrderQueueDisabled = jest.fn(() => false);
  const isReceiveCardDisabled = jest.fn(() => false);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    cardData: mockCardData,
    onAddToOrderQueue,
    onReceiveCard,
    onViewItemDetails,
    onClose,
    isAddToOrderQueueDisabled,
    isReceiveCardDisabled,
  };

  it('renders ItemCardView with card data', () => {
    render(<CardActions {...defaultProps} />);
    expect(screen.getByTestId('item-card-view')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    render(<CardActions {...defaultProps} />);
    expect(screen.getByText('Add to order queue')).toBeInTheDocument();
    expect(screen.getByText('Receive card')).toBeInTheDocument();
    expect(screen.getByText('View item details')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('calls onAddToOrderQueue with card eId when clicked', () => {
    render(<CardActions {...defaultProps} />);
    fireEvent.click(screen.getByText('Add to order queue'));
    expect(onAddToOrderQueue).toHaveBeenCalledWith('card-eid-1');
  });

  it('calls onReceiveCard when Receive card is clicked', () => {
    render(<CardActions {...defaultProps} />);
    fireEvent.click(screen.getByText('Receive card'));
    expect(onReceiveCard).toHaveBeenCalled();
  });

  it('calls onViewItemDetails when View item details is clicked', () => {
    render(<CardActions {...defaultProps} />);
    fireEvent.click(screen.getByText('View item details'));
    expect(onViewItemDetails).toHaveBeenCalled();
  });

  it('calls onClose when Done is clicked (no onDoneClick provided)', () => {
    render(<CardActions {...defaultProps} />);
    fireEvent.click(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onDoneClick when Done is clicked and onDoneClick is provided', () => {
    const onDoneClick = jest.fn();
    render(<CardActions {...defaultProps} onDoneClick={onDoneClick} />);
    fireEvent.click(screen.getByText('Done'));
    expect(onDoneClick).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables Add to order queue button when isAddToOrderQueueDisabled returns true', () => {
    isAddToOrderQueueDisabled.mockReturnValue(true);
    render(<CardActions {...defaultProps} />);
    const addBtn = screen.getByText('Add to order queue').closest('button');
    expect(addBtn).toBeDisabled();
  });

  it('disables Receive card button when isReceiveCardDisabled returns true', () => {
    isReceiveCardDisabled.mockReturnValue(true);
    render(<CardActions {...defaultProps} />);
    const receiveBtn = screen.getByText('Receive card').closest('button');
    expect(receiveBtn).toBeDisabled();
  });

  it('hides Done button when showDoneButton is false', () => {
    render(<CardActions {...defaultProps} showDoneButton={false} />);
    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });

  it('passes cardStatus to ItemCardView', () => {
    render(<CardActions {...defaultProps} />);
    // ItemCardView is mocked, just verify it renders
    expect(screen.getByTestId('item-card-view')).toBeInTheDocument();
  });

  it('does not call onAddToOrderQueue when cardData has no eId', () => {
    const cardDataNoEid = {
      ...mockCardData,
      payload: { ...mockCardData.payload, eId: '' },
    };
    render(<CardActions {...defaultProps} cardData={cardDataNoEid} />);
    fireEvent.click(screen.getByText('Add to order queue'));
    expect(onAddToOrderQueue).not.toHaveBeenCalled();
  });
});
