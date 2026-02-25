import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmailPanel from './EmailPanel';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
  Toaster: () => null,
}));

const mockItems = [
  {
    id: 'item-1',
    name: 'Widget A',
    quantity: '10',
    supplier: 'Acme Supplies',
    orderMethod: 'email',
    taxable: true,
    sku: 'SKU-001',
    unitPrice: 9.99,
  },
];

const multipleItems = [
  {
    id: 'item-1',
    name: 'Widget A',
    quantity: '10',
    supplier: 'Acme Supplies',
    orderMethod: 'email',
    taxable: true,
    sku: 'SKU-001',
    unitPrice: 9.99,
  },
  {
    id: 'item-2',
    name: 'Gadget B',
    quantity: '5',
    supplier: 'Acme Supplies',
    orderMethod: 'email',
    taxable: false,
    sku: 'SKU-002',
    unitPrice: undefined,
  },
];

const userContext = {
  userId: 'user-1',
  email: 'user@test.com',
  name: 'Test User',
  tenantId: 'T1',
  role: 'admin',
  author: 'Test User',
};

const deliveryAddress = {
  street: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
};

describe('EmailPanel', () => {
  const onClose = jest.fn();
  const onSendEmail = jest.fn().mockResolvedValue(undefined);
  const onCopyToClipboard = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when closed (isOpen=false)', () => {
    it('renders but is invisible', () => {
      const { container } = render(
        <EmailPanel
          isOpen={false}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );
      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('invisible');
    });
  });

  describe('when open with single item', () => {
    it('renders item name as title', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );
      // Widget A appears in both the title h2 and the table cell
      expect(screen.getAllByText('Widget A').length).toBeGreaterThan(0);
    });

    it('does not show "items to order" count for single item', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );
      expect(screen.queryByText(/items to order/)).not.toBeInTheDocument();
    });

    it('renders supplier greeting', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );
      expect(screen.getByText(/Hi Acme Supplies,/)).toBeInTheDocument();
    });

    it('renders "Powered by Arda"', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );
      expect(screen.getByText(/Powered by/)).toBeInTheDocument();
    });
  });

  describe('when open with multiple items', () => {
    it('shows "Order from [supplier]" title for multiple items', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={multipleItems}
          onSendEmail={onSendEmail}
        />
      );
      expect(screen.getByText('Order from Acme Supplies')).toBeInTheDocument();
    });

    it('shows count for multiple items', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={multipleItems}
          onSendEmail={onSendEmail}
        />
      );
      expect(screen.getByText('2 items to order')).toBeInTheDocument();
    });

    it('renders taxable=false as "No"', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={multipleItems}
          onSendEmail={onSendEmail}
        />
      );
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  describe('with delivery address', () => {
    it('renders delivery address section', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
          deliveryAddress={deliveryAddress}
        />
      );
      expect(screen.getByText('Deliver To:')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Springfield, IL 62701')).toBeInTheDocument();
    });
  });

  describe('with user context', () => {
    it('renders user name in signature', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
          userContext={userContext}
        />
      );
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('overlay click handling', () => {
    it('calls onClose when clicking the overlay directly', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );
      const overlay = document.getElementById('email-panel-overlay')!;
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel button is clicked', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );
      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when X button is clicked', () => {
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );
      // X icon is in a button - find all buttons and click the close one
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // X is the first button (absolute positioned)
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('copy to clipboard', () => {
    it('calls clipboard.write and shows success toast', async () => {
      const mockWrite = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { write: mockWrite, writeText: jest.fn() },
      });

      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
          onCopyToClipboard={onCopyToClipboard}
        />
      );

      fireEvent.click(screen.getByText('Copy to clipboard'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Message copied to clipboard');
      });
      expect(onCopyToClipboard).toHaveBeenCalledWith(['item-1']);
    });

    it('falls back to writeText when clipboard.write fails', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          write: jest.fn().mockRejectedValue(new Error('Not supported')),
          writeText: mockWriteText,
        },
      });

      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
          onCopyToClipboard={onCopyToClipboard}
        />
      );

      fireEvent.click(screen.getByText('Copy to clipboard'));

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Message copied to clipboard');
      });
    });

    it('shows error toast when both clipboard methods fail', async () => {
      Object.assign(navigator, {
        clipboard: {
          write: jest.fn().mockRejectedValue(new Error('Failed')),
          writeText: jest.fn().mockRejectedValue(new Error('Also failed')),
        },
      });

      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={mockItems}
          onSendEmail={onSendEmail}
        />
      );

      fireEvent.click(screen.getByText('Copy to clipboard'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy');
      });
    });
  });

  describe('item without supplier', () => {
    it('does not render greeting when supplier is empty', () => {
      const itemNoSupplier = [{ ...mockItems[0], supplier: '' }];
      render(
        <EmailPanel
          isOpen={true}
          onClose={onClose}
          items={itemNoSupplier}
          onSendEmail={onSendEmail}
        />
      );
      expect(screen.queryByText(/Hi ,/)).not.toBeInTheDocument();
    });
  });
});
