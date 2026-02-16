import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaTimeCellDisplay } from './time-cell-display';
import { ArdaTimeCellEditor, type TimeCellEditorHandle } from './time-cell-editor';
import { ArdaTimeCellInteractive } from './time-cell-interactive';

describe('ArdaTimeCellDisplay', () => {
  it('renders time value', () => {
    render(<ArdaTimeCellDisplay value="14:30" />);
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaTimeCellDisplay value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<ArdaTimeCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats time with seconds', () => {
    render(<ArdaTimeCellDisplay value="09:15:30" />);
    expect(screen.getByText('9:15 AM')).toBeInTheDocument();
  });
});

describe('ArdaTimeCellEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaTimeCellEditor value="14:30" />);
    const input = screen.getByDisplayValue('14:30');
    expect(input).toBeInTheDocument();
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<TimeCellEditorHandle>();
    render(<ArdaTimeCellEditor ref={ref} value="14:30" />);
    expect(ref.current?.getValue()).toBe('14:30');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaTimeCellEditor value="14:30" stopEditing={stopEditing} />);
    const input = screen.getByDisplayValue('14:30');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaTimeCellEditor value="14:30" stopEditing={stopEditing} />);
    const input = screen.getByDisplayValue('14:30');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ArdaTimeCellEditor value="14:30" />);
    const input = screen.getByDisplayValue('14:30');
    expect(input).toHaveFocus();
  });
});

describe('ArdaTimeCellInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaTimeCellInteractive value="14:30" />);
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('14:30')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaTimeCellInteractive value="14:30" />);
    await user.dblClick(screen.getByText('2:30 PM'));
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaTimeCellInteractive value="14:30" onValueChange={onValueChange} />);
    await user.dblClick(screen.getByText('2:30 PM'));
    const input = screen.getByDisplayValue('14:30');
    await user.clear(input);
    await user.type(input, '09:00{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('09:00');
    expect(screen.queryByDisplayValue('09:00')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaTimeCellInteractive value="14:30" disabled />);
    await user.dblClick(screen.getByText('2:30 PM'));
    expect(screen.queryByDisplayValue('14:30')).not.toBeInTheDocument();
  });
});
