import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { DateCellDisplay } from './date-cell-display';
import { DateCellEditor, type DateCellEditorHandle } from './date-cell-editor';

describe('DateCellDisplay', () => {
  it('renders date value', () => {
    render(<DateCellDisplay value="2024-03-15" />);
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<DateCellDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<DateCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime to date', () => {
    render(<DateCellDisplay value="2024-12-31T23:59:59Z" />);
    expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
  });

  it('renders with explicit timezone', () => {
    render(<DateCellDisplay value="2024-03-15" timezone="America/New_York" />);
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });
});

describe('DateCellEditor', () => {
  it('renders with initial value', () => {
    render(<DateCellEditor value="2024-03-15" />);
    const input = screen.getByDisplayValue('2024-03-15');
    expect(input).toBeInTheDocument();
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<DateCellEditorHandle>();
    render(<DateCellEditor ref={ref} value="2024-03-15" />);
    expect(ref.current?.getValue()).toBe('2024-03-15');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<DateCellEditor value="2024-03-15" stopEditing={stopEditing} />);
    const input = screen.getByDisplayValue('2024-03-15');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<DateCellEditor value="2024-03-15" stopEditing={stopEditing} />);
    const input = screen.getByDisplayValue('2024-03-15');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<DateCellEditor value="2024-03-15" />);
    const input = screen.getByDisplayValue('2024-03-15');
    expect(input).toHaveFocus();
  });

  it('shows timezone hint', () => {
    render(<DateCellEditor value="2024-03-15" timezone="America/New_York" />);
    expect(screen.getByText(/EST|EDT|GMT-[45]/)).toBeInTheDocument();
  });
});
