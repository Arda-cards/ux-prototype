import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderQueueToast from './order-queue-toast';

describe('OrderQueueToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('does not render when isVisible=false', () => {
    render(<OrderQueueToast isVisible={false} />);
    expect(screen.queryByText('Order up!')).not.toBeInTheDocument();
  });

  it('renders when isVisible=true', () => {
    render(<OrderQueueToast isVisible={true} />);
    expect(screen.getByText('Order up!')).toBeInTheDocument();
    expect(screen.getByText('Added to order queue.')).toBeInTheDocument();
  });

  it('renders the Undo button', () => {
    render(<OrderQueueToast isVisible={true} />);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('calls onUndo when Undo button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onUndo = jest.fn();
    render(<OrderQueueToast isVisible={true} onUndo={onUndo} />);
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after 5 seconds + 300ms animation', () => {
    const onClose = jest.fn();
    render(<OrderQueueToast isVisible={true} onClose={onClose} />);

    // After 5000ms the animation starts fading
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onClose).not.toHaveBeenCalled();

    // After the additional 300ms animation delay, onClose fires
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('starts animating (isAnimating=true) when visible', () => {
    render(<OrderQueueToast isVisible={true} />);
    const toast = screen.getByText('Order up!').closest('div[class*="fixed"]');
    expect(toast).toHaveClass('opacity-100');
  });

  it('is not animating before becoming visible', () => {
    render(<OrderQueueToast isVisible={false} />);
    expect(screen.queryByText('Order up!')).not.toBeInTheDocument();
  });

  it('clears timer when component unmounts', () => {
    const onClose = jest.fn();
    const { unmount } = render(<OrderQueueToast isVisible={true} onClose={onClose} />);
    unmount();
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders without onUndo and onClose callbacks', () => {
    render(<OrderQueueToast isVisible={true} />);
    expect(screen.getByText('Order up!')).toBeInTheDocument();
    // Undo still renders
    const undoBtn = screen.getByRole('button', { name: 'Undo' });
    expect(undoBtn).toBeInTheDocument();
    // Clicking Undo without handler should not throw
    expect(() => undoBtn.click()).not.toThrow();
  });

  it('transitions from visible to invisible when isVisible changes to false', () => {
    const { rerender } = render(<OrderQueueToast isVisible={true} />);
    expect(screen.getByText('Order up!')).toBeInTheDocument();

    rerender(<OrderQueueToast isVisible={false} />);
    expect(screen.queryByText('Order up!')).not.toBeInTheDocument();
  });
});
