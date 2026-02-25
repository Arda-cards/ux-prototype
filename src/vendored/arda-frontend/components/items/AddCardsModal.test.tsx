import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddCardsModal } from './AddCardsModal';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
};

describe('AddCardsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders when isOpen is true', () => {
      render(<AddCardsModal {...defaultProps} />);
      expect(screen.getByText('Add some cards')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<AddCardsModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Add some cards')).not.toBeInTheDocument();
    });
  });

  describe('initial state', () => {
    it('renders the header title', () => {
      render(<AddCardsModal {...defaultProps} />);
      expect(screen.getByText('Add some cards')).toBeInTheDocument();
    });

    it('renders the description text', () => {
      render(<AddCardsModal {...defaultProps} />);
      expect(screen.getByText(/how many cards do you want to create/i)).toBeInTheDocument();
    });

    it('renders quantity input with default value of 1', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(1);
    });

    it('renders Cancel and "Make it so" buttons', () => {
      render(<AddCardsModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /make it so/i })).toBeInTheDocument();
    });
  });

  describe('close behaviour', () => {
    it('calls onClose when Cancel button is clicked', () => {
      render(<AddCardsModal {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when X button is clicked', () => {
      render(<AddCardsModal {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      // X is the first button
      fireEvent.click(buttons[0]);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      render(<AddCardsModal {...defaultProps} />);
      const backdrop = screen.getByText('Add some cards').closest('.fixed')!;
      fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inner modal content', () => {
      render(<AddCardsModal {...defaultProps} />);
      const modalContent = screen.getByText('Add some cards').closest('.relative')!;
      fireEvent.click(modalContent);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('confirm behaviour', () => {
    it('calls onConfirm with default quantity (1) when Make it so is clicked', () => {
      render(<AddCardsModal {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /make it so/i }));
      expect(defaultProps.onConfirm).toHaveBeenCalledWith(1);
    });

    it('calls onClose after confirming', () => {
      render(<AddCardsModal {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /make it so/i }));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm with updated quantity', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '5' } });
      fireEvent.click(screen.getByRole('button', { name: /make it so/i }));
      expect(defaultProps.onConfirm).toHaveBeenCalledWith(5);
    });
  });

  describe('quantity input validation', () => {
    it('enforces minimum value of 1 — prevents 0', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '0' } });
      // After change, value should be clamped to 1
      expect(input).toHaveValue(1);
    });

    it('enforces minimum value of 1 — prevents negative', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '-3' } });
      expect(input).toHaveValue(1);
    });

    it('falls back to 1 for non-numeric input', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: 'abc' } });
      expect(input).toHaveValue(1);
    });

    it('accepts valid positive integer', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '7' } });
      expect(input).toHaveValue(7);
    });
  });

  describe('keyboard shortcuts', () => {
    it('calls onConfirm and onClose when Enter key is pressed in input', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '3' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(defaultProps.onConfirm).toHaveBeenCalledWith(3);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed in input', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });

    it('does not call anything for other key presses', () => {
      render(<AddCardsModal {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});
