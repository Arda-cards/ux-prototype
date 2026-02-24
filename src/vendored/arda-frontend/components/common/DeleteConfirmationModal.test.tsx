import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    ...rest
  }: React.ComponentProps<'button'> & { variant?: string }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...rest}>
      {children}
    </button>
  ),
}));

describe('DeleteConfirmationModal', () => {
  const onClose = jest.fn();
  const onConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when isOpen is false', () => {
    it('renders nothing', () => {
      const { container } = render(
        <DeleteConfirmationModal isOpen={false} onClose={onClose} onConfirm={onConfirm} />
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('when isOpen is true (default props)', () => {
    beforeEach(() => {
      render(
        <DeleteConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />
      );
    });

    it('renders default title', () => {
      expect(screen.getByText('You sure about that?')).toBeInTheDocument();
    });

    it('renders default message', () => {
      expect(screen.getByText(/Delete it like you mean it/)).toBeInTheDocument();
    });

    it('renders default confirm button text', () => {
      expect(screen.getByRole('button', { name: 'Delete it' })).toBeInTheDocument();
    });

    it('renders default cancel button text', () => {
      expect(screen.getByRole('button', { name: 'Just kidding' })).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete it' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Just kidding' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when X button is clicked', () => {
      // The X button is first in the modal
      const allButtons = screen.getAllByRole('button');
      const xButton = allButtons.find(
        (b) => !b.textContent || b.textContent.trim() === ''
      );
      if (xButton) fireEvent.click(xButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const { container } = render(
        <DeleteConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />
      );
      const backdrop = container.firstChild as HTMLElement;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('custom props', () => {
    it('renders custom title', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Custom Title"
        />
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders custom message', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          message="Custom message here"
        />
      );
      expect(screen.getByText('Custom message here')).toBeInTheDocument();
    });

    it('renders custom confirmText', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          confirmText="Yes, remove"
        />
      );
      expect(screen.getByRole('button', { name: 'Yes, remove' })).toBeInTheDocument();
    });

    it('renders custom cancelText', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          cancelText="Go back"
        />
      );
      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    });
  });

  describe('loading state (isLoading=true)', () => {
    beforeEach(() => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          isLoading={true}
          confirmText="Delete it"
          cancelText="Cancel"
        />
      );
    });

    it('shows "Deleting..." instead of confirmText', () => {
      expect(screen.getByRole('button', { name: 'Deleting...' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete it' })).not.toBeInTheDocument();
    });

    it('disables the confirm button', () => {
      const deletingButton = screen.getByRole('button', { name: 'Deleting...' });
      expect(deletingButton).toBeDisabled();
    });

    it('disables the cancel button', () => {
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('not loading state (isLoading=false)', () => {
    it('shows confirmText (not "Deleting...")', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          isLoading={false}
          confirmText="Delete it"
        />
      );
      expect(screen.getByRole('button', { name: 'Delete it' })).toBeInTheDocument();
      expect(screen.queryByText('Deleting...')).not.toBeInTheDocument();
    });

    it('confirm and cancel buttons are not disabled', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          isLoading={false}
          confirmText="Delete it"
          cancelText="Cancel"
        />
      );
      expect(screen.getByRole('button', { name: 'Delete it' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();
    });
  });
});
