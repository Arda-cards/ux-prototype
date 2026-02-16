import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaDateCellDisplay } from './date-cell-display';
import { ArdaDateCellEditor, type DateCellEditorHandle } from './date-cell-editor';
import { ArdaDateCellInteractive } from './date-cell-interactive';

describe('ArdaDateCellDisplay', () => {
  it('renders date value', () => {
    render(<ArdaDateCellDisplay value="2024-03-15" />);
    expect(screen.getByText('03/15/2024')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDateCellDisplay value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<ArdaDateCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime to date', () => {
    render(<ArdaDateCellDisplay value="2024-12-31T23:59:59Z" />);
    expect(screen.getByText('12/31/2024')).toBeInTheDocument();
  });
});

describe('ArdaDateCellEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaDateCellEditor value="2024-03-15" />);
    const input = screen.getByDisplayValue('2024-03-15');
    expect(input).toBeInTheDocument();
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<DateCellEditorHandle>();
    render(<ArdaDateCellEditor ref={ref} value="2024-03-15" />);
    expect(ref.current?.getValue()).toBe('2024-03-15');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaDateCellEditor value="2024-03-15" stopEditing={stopEditing} />);
    const input = screen.getByDisplayValue('2024-03-15');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaDateCellEditor value="2024-03-15" stopEditing={stopEditing} />);
    const input = screen.getByDisplayValue('2024-03-15');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ArdaDateCellEditor value="2024-03-15" />);
    const input = screen.getByDisplayValue('2024-03-15');
    expect(input).toHaveFocus();
  });
});

describe('ArdaDateCellInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaDateCellInteractive value="2024-03-15" />);
    expect(screen.getByText('03/15/2024')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaDateCellInteractive value="2024-03-15" />);
    await user.dblClick(screen.getByText('03/15/2024'));
    expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaDateCellInteractive value="2024-03-15" onValueChange={onValueChange} />);
    await user.dblClick(screen.getByText('03/15/2024'));
    const input = screen.getByDisplayValue('2024-03-15');
    await user.clear(input);
    await user.type(input, '2024-12-25{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('2024-12-25');
    expect(screen.queryByDisplayValue('2024-12-25')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaDateCellInteractive value="2024-03-15" disabled />);
    await user.dblClick(screen.getByText('03/15/2024'));
    expect(screen.queryByDisplayValue('2024-03-15')).not.toBeInTheDocument();
  });
});
