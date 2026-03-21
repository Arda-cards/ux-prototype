import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { BooleanCellDisplay } from './boolean-cell-display';
import { BooleanCellEditor, type BooleanCellEditorHandle } from './boolean-cell-editor';

describe('BooleanCellDisplay', () => {
  describe('checkbox format', () => {
    it('renders check icon for true', () => {
      const { container } = render(<BooleanCellDisplay value={true} displayFormat="checkbox" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders cross icon for false', () => {
      const { container } = render(<BooleanCellDisplay value={false} displayFormat="checkbox" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders dash for undefined', () => {
      render(<BooleanCellDisplay displayFormat="checkbox" />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('yes-no format', () => {
    it('renders "Yes" for true', () => {
      render(<BooleanCellDisplay value={true} displayFormat="yes-no" />);
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('renders "No" for false', () => {
      render(<BooleanCellDisplay value={false} displayFormat="yes-no" />);
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('renders dash for undefined', () => {
      render(<BooleanCellDisplay displayFormat="yes-no" />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});

describe('BooleanCellEditor', () => {
  describe('checkbox format', () => {
    it('renders checkbox with initial value', () => {
      render(<BooleanCellEditor value={true} displayFormat="checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('exposes getValue via ref', () => {
      const ref = React.createRef<BooleanCellEditorHandle>();
      render(<BooleanCellEditor ref={ref} value={true} displayFormat="checkbox" />);
      expect(ref.current?.getValue()).toBe(true);
    });

    it('calls stopEditing on Enter', async () => {
      const user = userEvent.setup();
      const stopEditing = vi.fn();
      render(<BooleanCellEditor value={true} displayFormat="checkbox" stopEditing={stopEditing} />);
      const checkbox = screen.getByRole('checkbox');
      await user.type(checkbox, '{Enter}');
      expect(stopEditing).toHaveBeenCalledWith(false);
    });

    it('calls stopEditing with cancel on Escape', async () => {
      const user = userEvent.setup();
      const stopEditing = vi.fn();
      render(<BooleanCellEditor value={true} displayFormat="checkbox" stopEditing={stopEditing} />);
      const checkbox = screen.getByRole('checkbox');
      await user.type(checkbox, '{Escape}');
      expect(stopEditing).toHaveBeenCalledWith(true);
    });

    it('auto-focuses on mount', () => {
      render(<BooleanCellEditor value={true} displayFormat="checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveFocus();
    });
  });

  describe('yes-no format', () => {
    it('renders toggle buttons', () => {
      render(<BooleanCellEditor value={true} displayFormat="yes-no" />);
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    });

    it('highlights correct button based on value', () => {
      const { unmount } = render(<BooleanCellEditor value={true} displayFormat="yes-no" />);
      const yesButton = screen.getByRole('button', { name: 'Yes' });
      expect(yesButton.className).toContain('bg-primary');
      unmount();

      render(<BooleanCellEditor value={false} displayFormat="yes-no" />);
      const noButton = screen.getByRole('button', { name: 'No' });
      expect(noButton.className).toContain('bg-primary');
    });
  });
});
