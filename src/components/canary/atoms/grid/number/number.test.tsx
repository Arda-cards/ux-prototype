import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { NumberCellDisplay } from './number-cell-display';
import { NumberCellEditor, type NumberCellEditorHandle } from './number-cell-editor';

describe('NumberCellDisplay', () => {
  it('renders integer value', () => {
    render(<NumberCellDisplay value={42} precision={0} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders decimal value with precision', () => {
    render(<NumberCellDisplay value={3.14159} precision={2} />);
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<NumberCellDisplay precision={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats with different precisions', () => {
    const { rerender } = render(<NumberCellDisplay value={3.14159} precision={0} />);
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<NumberCellDisplay value={3.14159} precision={2} />);
    expect(screen.getByText('3.14')).toBeInTheDocument();

    rerender(<NumberCellDisplay value={3.14159} precision={4} />);
    expect(screen.getByText('3.1416')).toBeInTheDocument();
  });
});

describe('NumberCellEditor', () => {
  it('renders with initial value', () => {
    render(<NumberCellEditor value={42} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(42);
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<NumberCellEditorHandle>();
    render(<NumberCellEditor ref={ref} value={42} />);
    expect(ref.current?.getValue()).toBe(42);
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<NumberCellEditor value={42} stopEditing={stopEditing} />);
    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<NumberCellEditor value={42} stopEditing={stopEditing} />);
    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<NumberCellEditor value={42} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveFocus();
  });

  it('sets step based on precision', () => {
    const { rerender } = render(<NumberCellEditor value={42} precision={0} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '1');

    rerender(<NumberCellEditor value={42} precision={2} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.01');

    rerender(<NumberCellEditor value={42} precision={4} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.0001');
  });

  it('respects min and max attributes', () => {
    render(<NumberCellEditor value={50} min={0} max={100} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });
});
