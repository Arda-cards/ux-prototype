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
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDateTimeCellDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<ArdaDateTimeCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime', () => {
    render(<ArdaDateTimeCellDisplay value="2024-12-31T23:59" />);
    expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
  });

  it('renders with explicit timezone', () => {
    render(<ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" timezone="Etc/UTC" />);
    expect(screen.getByText(/03\/15\/2024.*UTC/)).toBeInTheDocument();
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

  it('shows timezone hint', () => {
    render(<ArdaDateTimeCellEditor value="2024-03-15T14:30" timezone="Asia/Tokyo" />);
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });
});

describe('ArdaDateTimeCellInteractive', () => {
  it('renders display mode', () => {
    render(
      <ArdaDateTimeCellInteractive value="2024-03-15T14:30" mode="display" onChange={vi.fn()} />,
    );
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15T14:30')).not.toBeInTheDocument();
  });

  it('renders edit mode with inline editor', () => {
    render(<ArdaDateTimeCellInteractive value="2024-03-15T14:30" mode="edit" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toBeInTheDocument();
  });

  it('calls onChange with original and current values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaDateTimeCellInteractive value="2024-03-15T14:30" mode="edit" onChange={onChange} />,
    );
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.clear(input);
    await user.type(input, '2024-12-25T09:00');
    expect(onChange).toHaveBeenCalledWith('2024-03-15T14:30', '2024-12-25T09:00');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaDateTimeCellInteractive
        value="2024-03-15T14:30"
        mode="edit"
        onChange={vi.fn()}
        onComplete={onComplete}
      />,
    );
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.type(input, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('2024-03-15T14:30');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaDateTimeCellInteractive
        value="2024-03-15T14:30"
        mode="edit"
        onChange={vi.fn()}
        onCancel={onCancel}
      />,
    );
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.type(input, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders display mode when editable is false even if mode is edit', () => {
    render(
      <ArdaDateTimeCellInteractive
        value="2024-03-15T14:30"
        mode="edit"
        editable={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15T14:30')).not.toBeInTheDocument();
  });

  it('renders error mode with error messages', () => {
    render(
      <ArdaDateTimeCellInteractive
        value="2024-03-15T14:30"
        mode="error"
        errors={['Date/time is required']}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toBeInTheDocument();
    expect(screen.getByText('Date/time is required')).toBeInTheDocument();
  });

  it('passes timezone to display', () => {
    render(
      <ArdaDateTimeCellInteractive
        value="2024-03-15T14:30:00Z"
        mode="display"
        onChange={vi.fn()}
        timezone="Etc/UTC"
      />,
    );
    expect(screen.getByText(/03\/15\/2024.*UTC/)).toBeInTheDocument();
  });

  it('passes timezone to editor', () => {
    render(
      <ArdaDateTimeCellInteractive
        value="2024-03-15T14:30"
        mode="edit"
        onChange={vi.fn()}
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });
});
