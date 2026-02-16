import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaNumberCellDisplay } from './number-cell-display';
import { ArdaNumberCellEditor, type NumberCellEditorHandle } from './number-cell-editor';
import { ArdaNumberCellInteractive } from './number-cell-interactive';

describe('ArdaNumberCellDisplay', () => {
  it('renders integer value', () => {
    render(<ArdaNumberCellDisplay value={42} precision={0} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders decimal value with precision', () => {
    render(<ArdaNumberCellDisplay value={3.14159} precision={2} />);
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaNumberCellDisplay value={undefined} precision={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats with different precisions', () => {
    const { rerender } = render(<ArdaNumberCellDisplay value={3.14159} precision={0} />);
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<ArdaNumberCellDisplay value={3.14159} precision={2} />);
    expect(screen.getByText('3.14')).toBeInTheDocument();

    rerender(<ArdaNumberCellDisplay value={3.14159} precision={4} />);
    expect(screen.getByText('3.1416')).toBeInTheDocument();
  });
});

describe('ArdaNumberCellEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaNumberCellEditor value={42} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(42);
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<NumberCellEditorHandle>();
    render(<ArdaNumberCellEditor ref={ref} value={42} />);
    expect(ref.current?.getValue()).toBe(42);
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaNumberCellEditor value={42} stopEditing={stopEditing} />);
    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaNumberCellEditor value={42} stopEditing={stopEditing} />);
    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ArdaNumberCellEditor value={42} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveFocus();
  });

  it('sets step based on precision', () => {
    const { rerender } = render(<ArdaNumberCellEditor value={42} precision={0} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '1');

    rerender(<ArdaNumberCellEditor value={42} precision={2} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.01');

    rerender(<ArdaNumberCellEditor value={42} precision={4} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.0001');
  });

  it('respects min and max attributes', () => {
    render(<ArdaNumberCellEditor value={50} min={0} max={100} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });
});

describe('ArdaNumberCellInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaNumberCellInteractive value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaNumberCellInteractive value={42} />);
    await user.dblClick(screen.getByText('42'));
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaNumberCellInteractive value={42} onValueChange={onValueChange} />);
    await user.dblClick(screen.getByText('42'));
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '100{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(100);
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaNumberCellInteractive value={42} disabled />);
    await user.dblClick(screen.getByText('42'));
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });
});
