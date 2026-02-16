import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaBooleanCellDisplay } from './boolean-cell-display';
import { ArdaBooleanCellEditor, type BooleanCellEditorHandle } from './boolean-cell-editor';
import { ArdaBooleanCellInteractive } from './boolean-cell-interactive';

describe('ArdaBooleanCellDisplay', () => {
  describe('checkbox format', () => {
    it('renders check icon for true', () => {
      const { container } = render(
        <ArdaBooleanCellDisplay value={true} displayFormat="checkbox" />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders cross icon for false', () => {
      const { container } = render(
        <ArdaBooleanCellDisplay value={false} displayFormat="checkbox" />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders dash for undefined', () => {
      render(<ArdaBooleanCellDisplay value={undefined} displayFormat="checkbox" />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('yes-no format', () => {
    it('renders "Yes" for true', () => {
      render(<ArdaBooleanCellDisplay value={true} displayFormat="yes-no" />);
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('renders "No" for false', () => {
      render(<ArdaBooleanCellDisplay value={false} displayFormat="yes-no" />);
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('renders dash for undefined', () => {
      render(<ArdaBooleanCellDisplay value={undefined} displayFormat="yes-no" />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});

describe('ArdaBooleanCellEditor', () => {
  describe('checkbox format', () => {
    it('renders checkbox with initial value', () => {
      render(<ArdaBooleanCellEditor value={true} displayFormat="checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('exposes getValue via ref', () => {
      const ref = React.createRef<BooleanCellEditorHandle>();
      render(<ArdaBooleanCellEditor ref={ref} value={true} displayFormat="checkbox" />);
      expect(ref.current?.getValue()).toBe(true);
    });

    it('calls stopEditing on Enter', async () => {
      const user = userEvent.setup();
      const stopEditing = vi.fn();
      render(
        <ArdaBooleanCellEditor value={true} displayFormat="checkbox" stopEditing={stopEditing} />,
      );
      const checkbox = screen.getByRole('checkbox');
      await user.type(checkbox, '{Enter}');
      expect(stopEditing).toHaveBeenCalledWith(false);
    });

    it('calls stopEditing with cancel on Escape', async () => {
      const user = userEvent.setup();
      const stopEditing = vi.fn();
      render(
        <ArdaBooleanCellEditor value={true} displayFormat="checkbox" stopEditing={stopEditing} />,
      );
      const checkbox = screen.getByRole('checkbox');
      await user.type(checkbox, '{Escape}');
      expect(stopEditing).toHaveBeenCalledWith(true);
    });

    it('auto-focuses on mount', () => {
      render(<ArdaBooleanCellEditor value={true} displayFormat="checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveFocus();
    });
  });

  describe('yes-no format', () => {
    it('renders toggle buttons', () => {
      render(<ArdaBooleanCellEditor value={true} displayFormat="yes-no" />);
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    });

    it('highlights correct button based on value', () => {
      const { unmount } = render(<ArdaBooleanCellEditor value={true} displayFormat="yes-no" />);
      const yesButton = screen.getByRole('button', { name: 'Yes' });
      expect(yesButton.className).toContain('bg-primary');
      unmount();

      render(<ArdaBooleanCellEditor value={false} displayFormat="yes-no" />);
      const noButton = screen.getByRole('button', { name: 'No' });
      expect(noButton.className).toContain('bg-primary');
    });
  });
});

describe('ArdaBooleanCellInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaBooleanCellInteractive value={true} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    const { container } = render(<ArdaBooleanCellInteractive value={true} />);
    const displayWrapper = container.firstChild as HTMLElement;
    await user.dblClick(displayWrapper);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <ArdaBooleanCellInteractive value={true} onValueChange={onValueChange} />,
    );
    const displayWrapper = container.firstChild as HTMLElement;
    await user.dblClick(displayWrapper);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    fireEvent.keyDown(checkbox, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(<ArdaBooleanCellInteractive value={true} disabled />);
    const displayWrapper = container.firstChild as HTMLElement;
    await user.dblClick(displayWrapper);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
