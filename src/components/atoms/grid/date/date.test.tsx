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
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDateCellDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<ArdaDateCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime to date', () => {
    render(<ArdaDateCellDisplay value="2024-12-31T23:59:59Z" />);
    expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
  });

  it('renders with explicit timezone', () => {
    render(<ArdaDateCellDisplay value="2024-03-15" timezone="America/New_York" />);
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
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

  it('shows timezone hint', () => {
    render(<ArdaDateCellEditor value="2024-03-15" timezone="America/New_York" />);
    expect(screen.getByText(/EST|EDT|GMT-[45]/)).toBeInTheDocument();
  });
});

describe('ArdaDateCellInteractive', () => {
  it('renders display mode', () => {
    render(<ArdaDateCellInteractive value="2024-03-15" mode="display" onChange={vi.fn()} />);
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15')).not.toBeInTheDocument();
  });

  it('renders edit mode with inline editor', () => {
    render(<ArdaDateCellInteractive value="2024-03-15" mode="edit" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
  });

  it('calls onChange with original and current values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaDateCellInteractive value="2024-03-15" mode="edit" onChange={onChange} />);
    const input = screen.getByDisplayValue('2024-03-15');
    await user.clear(input);
    await user.type(input, '2024-12-25');
    expect(onChange).toHaveBeenCalledWith('2024-03-15', '2024-12-25');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaDateCellInteractive
        value="2024-03-15"
        mode="edit"
        onChange={vi.fn()}
        onComplete={onComplete}
      />,
    );
    const input = screen.getByDisplayValue('2024-03-15');
    await user.type(input, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('2024-03-15');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaDateCellInteractive
        value="2024-03-15"
        mode="edit"
        onChange={vi.fn()}
        onCancel={onCancel}
      />,
    );
    const input = screen.getByDisplayValue('2024-03-15');
    await user.type(input, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders display mode when editable is false even if mode is edit', () => {
    render(
      <ArdaDateCellInteractive
        value="2024-03-15"
        mode="edit"
        editable={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15')).not.toBeInTheDocument();
  });

  it('renders error mode with error messages', () => {
    render(
      <ArdaDateCellInteractive
        value="2024-03-15"
        mode="error"
        errors={['Date is required']}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('passes timezone to display', () => {
    render(
      <ArdaDateCellInteractive
        value="2024-03-15"
        mode="display"
        onChange={vi.fn()}
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('passes timezone to editor', () => {
    render(
      <ArdaDateCellInteractive
        value="2024-03-15"
        mode="edit"
        onChange={vi.fn()}
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });
});
