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
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaTimeCellDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<ArdaTimeCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats time with seconds', () => {
    render(<ArdaTimeCellDisplay value="09:15:30" />);
    expect(screen.getByText(/9:15 AM/)).toBeInTheDocument();
  });

  it('renders with explicit timezone', () => {
    render(<ArdaTimeCellDisplay value="14:30" timezone="America/New_York" />);
    expect(screen.getByText(/2:30 PM (EST|EDT|GMT-[45])/)).toBeInTheDocument();
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

  it('shows timezone hint', () => {
    render(<ArdaTimeCellEditor value="14:30" timezone="Asia/Tokyo" />);
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });
});

describe('ArdaTimeCellInteractive', () => {
  it('renders display mode', () => {
    render(<ArdaTimeCellInteractive value="14:30" mode="display" onChange={vi.fn()} />);
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('14:30')).not.toBeInTheDocument();
  });

  it('renders edit mode with inline editor', () => {
    render(<ArdaTimeCellInteractive value="14:30" mode="edit" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('calls onChange with original and current values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaTimeCellInteractive value="14:30" mode="edit" onChange={onChange} />);
    const input = screen.getByDisplayValue('14:30');
    await user.clear(input);
    await user.type(input, '09:00');
    expect(onChange).toHaveBeenCalledWith('14:30', '09:00');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaTimeCellInteractive
        value="14:30"
        mode="edit"
        onChange={vi.fn()}
        onComplete={onComplete}
      />,
    );
    const input = screen.getByDisplayValue('14:30');
    await user.type(input, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('14:30');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaTimeCellInteractive value="14:30" mode="edit" onChange={vi.fn()} onCancel={onCancel} />,
    );
    const input = screen.getByDisplayValue('14:30');
    await user.type(input, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders display mode when editable is false even if mode is edit', () => {
    render(
      <ArdaTimeCellInteractive value="14:30" mode="edit" editable={false} onChange={vi.fn()} />,
    );
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('14:30')).not.toBeInTheDocument();
  });

  it('renders error mode with error messages', () => {
    render(
      <ArdaTimeCellInteractive
        value="14:30"
        mode="error"
        errors={['Time is required']}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
    expect(screen.getByText('Time is required')).toBeInTheDocument();
  });

  it('passes timezone to display', () => {
    render(
      <ArdaTimeCellInteractive
        value="14:30"
        mode="display"
        onChange={vi.fn()}
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
  });

  it('passes timezone to editor', () => {
    render(
      <ArdaTimeCellInteractive
        value="14:30"
        mode="edit"
        onChange={vi.fn()}
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });
});
