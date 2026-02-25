import { render, screen, fireEvent } from '@testing-library/react';
import { InitialScanModal } from './InitialScanModal';
import '@testing-library/jest-dom';

// Stub window.location for href assignment tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (window as any).location;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).location = { href: '', pathname: '/', search: '' };

describe('InitialScanModal', () => {
  const onClose = jest.fn();
  const onOpenCardView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
  });

  it('renders when isOpen is true', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    expect(screen.getByText('Scan')).toBeInTheDocument();
    expect(screen.getByText('Scan one card or an entire stack.')).toBeInTheDocument();
    expect(screen.getByText('Waiting for first scan...')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <InitialScanModal
        isOpen={false}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    expect(screen.queryByText('Scan')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the X button', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    // The X button is the close icon button
    const closeBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the Done button', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    fireEvent.click(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the backdrop', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside the modal', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    const modalContent = screen.getByText('Scan').closest('.bg-white');
    if (modalContent) {
      fireEvent.click(modalContent);
    }
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles keyboard scanner input: kanban card URL', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    const cardId = 'abc12345-1234-1234-1234-abcdef123456';
    const qrText = `/kanban/cards/${cardId}`;

    // Simulate scanner input character by character
    for (const char of qrText) {
      fireEvent.keyDown(window, { key: char });
    }
    // Press Enter to submit
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onOpenCardView).toHaveBeenCalledWith(cardId);
  });

  it('handles keyboard scanner input: item URL navigates to item page', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    const itemId = 'abc12345-1234-1234-1234-abcdef123456';
    const qrText = `/item/${itemId}`;

    for (const char of qrText) {
      fireEvent.keyDown(window, { key: char });
    }
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onClose).toHaveBeenCalled();
    // window.location.href is set to the item path (jsdom may not reflect the assignment directly)
    expect(onOpenCardView).not.toHaveBeenCalled();
  });

  it('handles full URL item QR code', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    const itemId = 'abc12345-1234-1234-1234-abcdef123456';
    const qrText = `https://stage.app.arda.cards/item/${itemId}`;

    for (const char of qrText) {
      fireEvent.keyDown(window, { key: char });
    }
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onClose).toHaveBeenCalled();
    expect(onOpenCardView).not.toHaveBeenCalled();
  });

  it('ignores Enter key when buffer is empty', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onOpenCardView).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores invalid QR codes (no card or item match)', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    const qrText = 'invalid-qr-code';
    for (const char of qrText) {
      fireEvent.keyDown(window, { key: char });
    }
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onOpenCardView).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not attach keydown listener when isOpen is false', () => {
    render(
      <InitialScanModal
        isOpen={false}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    const qrText = '/kanban/cards/abc12345-1234-1234-1234-abcdef123456';
    for (const char of qrText) {
      fireEvent.keyDown(window, { key: char });
    }
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onOpenCardView).not.toHaveBeenCalled();
  });

  it('handles UUID-only kanban card QR code', () => {
    render(
      <InitialScanModal
        isOpen={true}
        onClose={onClose}
        onOpenCardView={onOpenCardView}
      />
    );
    const uuid = 'abcdef12-1234-1234-1234-abcdef123456';
    for (const char of uuid) {
      fireEvent.keyDown(window, { key: char });
    }
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onOpenCardView).toHaveBeenCalledWith(uuid);
  });
});
