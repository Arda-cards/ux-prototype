import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportSuccessModal } from './ImportSuccessModal';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  added: 3,
  modified: 0,
  deleted: 0,
};

describe('ImportSuccessModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders when isOpen is true', () => {
      render(<ImportSuccessModal {...defaultProps} />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<ImportSuccessModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });
  });

  describe('summary rows — basic counts', () => {
    it('always renders the added items row', () => {
      render(<ImportSuccessModal {...defaultProps} added={5} />);
      expect(screen.getByText('5 items added.')).toBeInTheDocument();
    });

    it('renders "0 items added." when added is 0', () => {
      render(<ImportSuccessModal {...defaultProps} added={0} />);
      expect(screen.getByText('0 items added.')).toBeInTheDocument();
    });

    it('does NOT render modified row when modified is 0', () => {
      render(<ImportSuccessModal {...defaultProps} modified={0} />);
      expect(screen.queryByText(/items modified/i)).not.toBeInTheDocument();
    });

    it('renders modified row when modified > 0', () => {
      render(<ImportSuccessModal {...defaultProps} modified={2} />);
      expect(screen.getByText('2 items modified.')).toBeInTheDocument();
    });

    it('does NOT render deleted row when deleted is 0', () => {
      render(<ImportSuccessModal {...defaultProps} deleted={0} />);
      expect(screen.queryByText(/items deleted/i)).not.toBeInTheDocument();
    });

    it('renders deleted row when deleted > 0', () => {
      render(<ImportSuccessModal {...defaultProps} deleted={1} />);
      expect(screen.getByText('1 items deleted.')).toBeInTheDocument();
    });
  });

  describe('errors summary row', () => {
    it('does NOT render error row when errorCount is 0', () => {
      render(<ImportSuccessModal {...defaultProps} errorCount={0} />);
      expect(screen.queryByText(/errors found/i)).not.toBeInTheDocument();
    });

    it('renders error row when errorCount > 0', () => {
      render(<ImportSuccessModal {...defaultProps} errorCount={3} />);
      expect(screen.getByText('3 errors found.')).toBeInTheDocument();
    });

    it('error row is expandable and shows error details on click', () => {
      const errors = [
        { recordNumber: 0, messages: ['name: required field'] },
        { recordNumber: 1, messages: ['sku: must be unique'] },
      ];
      render(<ImportSuccessModal {...defaultProps} errorCount={2} errors={errors} />);
      const errorRow = screen.getByText('2 errors found.').closest('div')!.parentElement!;
      fireEvent.click(errorRow);
      expect(screen.getByText('Record 1:')).toBeInTheDocument();
      expect(screen.getByText('name: required field')).toBeInTheDocument();
    });

    it('collapses error details when clicked again', () => {
      const errors = [{ recordNumber: 0, messages: ['name: required field'] }];
      render(<ImportSuccessModal {...defaultProps} errorCount={1} errors={errors} />);
      const errorRow = screen.getByText('1 errors found.').closest('div')!.parentElement!;
      fireEvent.click(errorRow);
      expect(screen.getByText('Record 1:')).toBeInTheDocument();
      fireEvent.click(errorRow);
      expect(screen.queryByText('Record 1:')).not.toBeInTheDocument();
    });
  });

  describe('error message parsing', () => {
    it('shows plain messages as-is when not JSON', () => {
      const errors = [{ recordNumber: 2, messages: ['plain error message'] }];
      render(<ImportSuccessModal {...defaultProps} errorCount={1} errors={errors} />);
      const errorRow = screen.getByText('1 errors found.').closest('div')!.parentElement!;
      fireEvent.click(errorRow);
      expect(screen.getByText('plain error message')).toBeInTheDocument();
    });

    it('parses JSON error with field_validations', () => {
      const jsonMsg = JSON.stringify({
        field_validations: [{ field: 'payload.name', error: 'is required' }],
      });
      const errors = [{ recordNumber: 0, messages: [jsonMsg] }];
      render(<ImportSuccessModal {...defaultProps} errorCount={1} errors={errors} />);
      const errorRow = screen.getByText('1 errors found.').closest('div')!.parentElement!;
      fireEvent.click(errorRow);
      expect(screen.getByText('name: is required')).toBeInTheDocument();
    });

    it('parses JSON error with field and error keys', () => {
      const jsonMsg = JSON.stringify({
        field: 'payload.sku',
        error: 'must be unique',
      });
      const errors = [{ recordNumber: 0, messages: [jsonMsg] }];
      render(<ImportSuccessModal {...defaultProps} errorCount={1} errors={errors} />);
      const errorRow = screen.getByText('1 errors found.').closest('div')!.parentElement!;
      fireEvent.click(errorRow);
      expect(screen.getByText('sku: must be unique')).toBeInTheDocument();
    });

    it('removes duplicate messages', () => {
      const errors = [{ recordNumber: 0, messages: ['dup message', 'dup message'] }];
      render(<ImportSuccessModal {...defaultProps} errorCount={1} errors={errors} />);
      const errorRow = screen.getByText('1 errors found.').closest('div')!.parentElement!;
      fireEvent.click(errorRow);
      const msgs = screen.getAllByText('dup message');
      expect(msgs).toHaveLength(1);
    });
  });

  describe('close behaviour', () => {
    it('calls onClose when Done button is clicked', () => {
      render(<ImportSuccessModal {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /done/i }));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when X button is clicked', () => {
      render(<ImportSuccessModal {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const xButton = buttons.find((b) => !b.textContent?.trim());
      fireEvent.click(xButton!);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when clicking the backdrop', () => {
      render(<ImportSuccessModal {...defaultProps} />);
      const backdrop = screen.getByText('Success!').closest('.fixed')!;
      fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does NOT call onClose when clicking inside the modal', () => {
      render(<ImportSuccessModal {...defaultProps} />);
      const modalContent = screen.getByText('Success!').closest('[style]')!;
      fireEvent.click(modalContent);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      render(<ImportSuccessModal {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on Escape when modal is closed', () => {
      render(<ImportSuccessModal {...defaultProps} isOpen={false} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('removes escape listener on cleanup', () => {
      const { unmount } = render(<ImportSuccessModal {...defaultProps} />);
      unmount();
      fireEvent.keyDown(document, { key: 'Escape' });
      // After unmount, listener removed — onClose not called from event
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});
