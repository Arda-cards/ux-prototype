import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaDateTimeCellDisplay } from './date-time-cell-display';
import { ArdaDateTimeCellEditor, type DateTimeCellEditorHandle } from './date-time-cell-editor';
import { ArdaDateTimeCellInteractive } from './date-time-cell-interactive';

describe('ArdaDateTimeCellDisplay', () => {
  it('renders datetime value', () => {
    render(<ArdaDateTimeCellDisplay value="2024-03-15T14:30" />);
    // The exact format depends on locale, but should contain date and time parts
    expect(screen.getByText(/03\/15\/2024.*2:30 PM/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDateTimeCellDisplay value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<ArdaDateTimeCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime', () => {
    render(<ArdaDateTimeCellDisplay value="2024-12-31T23:59" />);
    expect(screen.getByText(/12\/31\/2024.*11:59 PM/)).toBeInTheDocument();
  });
});

describe('ArdaDateTimeCellEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaDateTimeCellEditor value="2024-03-15T14:30" />);
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    expect(input).toBeInTheDocument();
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<DateTimeCellEditorHandle>();
    render(<ArdaDateTimeCellEditor ref={ref} value="2024-03-15T14:30" />);
    expect(ref.current?.getValue()).toBe('2024-03-15T14:30');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaDateTimeCellEditor value="2024-03-15T14:30" stopEditing={stopEditing} />);
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaDateTimeCellEditor value="2024-03-15T14:30" stopEditing={stopEditing} />);
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ArdaDateTimeCellEditor value="2024-03-15T14:30" />);
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    expect(input).toHaveFocus();
  });
});

describe('ArdaDateTimeCellInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaDateTimeCellInteractive value="2024-03-15T14:30" />);
    expect(screen.getByText(/03\/15\/2024.*2:30 PM/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15T14:30')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaDateTimeCellInteractive value="2024-03-15T14:30" />);
    await user.dblClick(screen.getByText(/03\/15\/2024.*2:30 PM/));
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaDateTimeCellInteractive value="2024-03-15T14:30" onValueChange={onValueChange} />);
    await user.dblClick(screen.getByText(/03\/15\/2024.*2:30 PM/));
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.clear(input);
    await user.type(input, '2024-12-25T09:00{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('2024-12-25T09:00');
    expect(screen.queryByDisplayValue('2024-12-25T09:00')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaDateTimeCellInteractive value="2024-03-15T14:30" disabled />);
    await user.dblClick(screen.getByText(/03\/15\/2024.*2:30 PM/));
    expect(screen.queryByDisplayValue('2024-03-15T14:30')).not.toBeInTheDocument();
  });
});
