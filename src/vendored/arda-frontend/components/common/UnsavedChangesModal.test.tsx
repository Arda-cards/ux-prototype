import { render, screen, fireEvent } from '@testing-library/react';
import { UnsavedChangesModal } from './UnsavedChangesModal';

describe('UnsavedChangesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <UnsavedChangesModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with default title and message when isOpen is true', () => {
    render(<UnsavedChangesModal {...defaultProps} />);
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    expect(
      screen.getByText(
        'If you leave now, your changes will not be saved. Do you want to save before leaving?'
      )
    ).toBeInTheDocument();
  });

  it('calls onClose when "Continue editing" button clicked', () => {
    const onClose = jest.fn();
    render(<UnsavedChangesModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Continue editing'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when "Save" button clicked', () => {
    const onSave = jest.fn();
    render(<UnsavedChangesModal {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows "Leave without saving" button only when onLeaveWithoutSaving is provided', () => {
    const { rerender } = render(<UnsavedChangesModal {...defaultProps} />);
    expect(screen.queryByText('Leave without saving')).not.toBeInTheDocument();

    rerender(
      <UnsavedChangesModal
        {...defaultProps}
        onLeaveWithoutSaving={jest.fn()}
      />
    );
    expect(screen.getByText('Leave without saving')).toBeInTheDocument();
  });
});
