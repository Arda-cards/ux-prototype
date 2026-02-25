import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteModal } from './NoteModal';

describe('NoteModal', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when isOpen is false', () => {
    it('renders nothing', () => {
      const { container } = render(
        <NoteModal isOpen={false} onClose={onClose} />
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('when isOpen is true', () => {
    it('renders the modal with title', () => {
      render(
        <NoteModal isOpen={true} onClose={onClose} title="My Note" />
      );
      expect(screen.getByText('My Note')).toBeInTheDocument();
    });

    it('renders confirmText on the done button', () => {
      render(
        <NoteModal isOpen={true} onClose={onClose} confirmText="Done" />
      );
      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });

    it('calls onClose when X button is clicked', () => {
      render(<NoteModal isOpen={true} onClose={onClose} />);
      // The close button contains XIcon
      const buttons = screen.getAllByRole('button');
      // First button is the X close button
      fireEvent.click(buttons[0]);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking the backdrop', () => {
      const { container } = render(
        <NoteModal isOpen={true} onClose={onClose} />
      );
      // The outermost div is the backdrop
      const backdrop = container.firstChild as HTMLElement;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking the inner modal content', () => {
      render(<NoteModal isOpen={true} onClose={onClose} confirmText="Done" />);
      // The inner modal div — clicking it should NOT close
      const modal = screen.getByRole('button', { name: /done/i }).closest('div[class*="relative"]');
      if (modal) fireEvent.click(modal);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('read-only mode (editable=false)', () => {
    it('displays message text in a div (not textarea)', () => {
      render(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          message="Read only content"
          editable={false}
        />
      );
      expect(screen.getByText('Read only content')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('calls onClose (not onSave) when done button clicked in read-only mode', () => {
      render(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          editable={false}
          confirmText="Close"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('editable mode (editable=true)', () => {
    it('renders a textarea with initialValue', () => {
      render(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          editable={true}
          initialValue="Initial text"
          confirmText="Save"
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      expect(textarea.value).toBe('Initial text');
    });

    it('renders textarea with message when no initialValue', () => {
      render(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          editable={true}
          message="Message text"
          confirmText="Save"
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Message text');
    });

    it('updates textarea on user input', () => {
      render(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          editable={true}
          initialValue=""
          confirmText="Save"
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'New note text' } });
      expect(textarea.value).toBe('New note text');
    });

    it('calls onSave with current value and onClose when done button clicked', () => {
      render(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          editable={true}
          initialValue="Initial"
          confirmText="Save"
        />
      );
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Updated text' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(onSave).toHaveBeenCalledWith('Updated text');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onSave when editable=true but onSave is not provided', () => {
      render(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          editable={true}
          confirmText="Done"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Done' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('useEffect: resets value when isOpen changes', () => {
    it('resets value to initialValue when modal reopens', () => {
      const { rerender } = render(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          editable={true}
          initialValue="Original"
          confirmText="Save"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Modified' } });
      expect(textarea.value).toBe('Modified');

      // Close then reopen
      rerender(
        <NoteModal
          isOpen={false}
          onClose={onClose}
          onSave={onSave}
          editable={true}
          initialValue="Original"
          confirmText="Save"
        />
      );
      rerender(
        <NoteModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          editable={true}
          initialValue="Original"
          confirmText="Save"
        />
      );
      const newTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(newTextarea.value).toBe('Original');
    });
  });
});
