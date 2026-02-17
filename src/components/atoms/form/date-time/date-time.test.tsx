import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaDateTimeFieldDisplay } from './date-time-field-display';
import { ArdaDateTimeFieldEditor } from './date-time-field-editor';
import { ArdaDateTimeFieldInteractive } from './date-time-field-interactive';

describe('ArdaDateTimeFieldDisplay', () => {
  it('renders datetime value', () => {
    render(<ArdaDateTimeFieldDisplay value="2024-03-15T14:30" />);
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDateTimeFieldDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime', () => {
    render(<ArdaDateTimeFieldDisplay value="2024-12-31T23:59" />);
    expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
  });

  it('renders with explicit timezone', () => {
    render(<ArdaDateTimeFieldDisplay value="2024-03-15T14:30:00Z" timezone="Etc/UTC" />);
    expect(screen.getByText(/03\/15\/2024.*UTC/)).toBeInTheDocument();
  });

  it('renders with label on the left', () => {
    render(
      <ArdaDateTimeFieldDisplay value="2024-03-15T14:30" label="Created At" labelPosition="left" />,
    );
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(
      <ArdaDateTimeFieldDisplay value="2024-03-15T14:30" label="Created At" labelPosition="top" />,
    );
    const label = screen.getByText('Created At');
    expect(label.closest('div')).toHaveClass('flex-col');
  });
});

describe('ArdaDateTimeFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" />);
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange with original and current value on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" onChange={onChange} />);
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.clear(input);
    await user.type(input, '2024-12-25T09:00');
    expect(onChange).toHaveBeenCalled();
    // First argument should be the original value
    expect(onChange.mock.calls[0]![0]).toBe('2024-03-15T14:30');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" onComplete={onComplete} />);
    await user.type(screen.getByDisplayValue('2024-03-15T14:30'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('2024-03-15T14:30');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" onCancel={onCancel} />);
    await user.type(screen.getByDisplayValue('2024-03-15T14:30'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('auto-focuses when autoFocus is true', () => {
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" autoFocus />);
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toHaveFocus();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" disabled />);
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toBeDisabled();
  });

  it('shows timezone hint', () => {
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" timezone="Asia/Tokyo" />);
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" label="Created At" />);
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toBeInTheDocument();
  });

  it('shows error messages when showErrors is true', () => {
    render(
      <ArdaDateTimeFieldEditor
        value="2024-03-15T14:30"
        errors={['Date/time is required', 'Date/time must be in the future']}
        showErrors
      />,
    );
    expect(screen.getByText('Date/time is required')).toBeInTheDocument();
    expect(screen.getByText('Date/time must be in the future')).toBeInTheDocument();
  });

  it('does not show error messages when showErrors is false', () => {
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" errors={['Date/time is required']} />);
    expect(screen.queryByText('Date/time is required')).not.toBeInTheDocument();
  });
});

describe('ArdaDateTimeFieldInteractive', () => {
  const noop = vi.fn();

  it('renders in display mode', () => {
    render(
      <ArdaDateTimeFieldInteractive value="2024-03-15T14:30" onChange={noop} mode="display" />,
    );
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15T14:30')).not.toBeInTheDocument();
  });

  it('renders in edit mode with input', () => {
    render(<ArdaDateTimeFieldInteractive value="2024-03-15T14:30" onChange={noop} mode="edit" />);
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toBeInTheDocument();
  });

  it('renders in error mode with error messages', () => {
    render(
      <ArdaDateTimeFieldInteractive
        value="2024-03-15T14:30"
        onChange={noop}
        mode="error"
        errors={['Date/time is required']}
      />,
    );
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toBeInTheDocument();
    expect(screen.getByText('Date/time is required')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(
      <ArdaDateTimeFieldInteractive
        value="2024-03-15T14:30"
        onChange={noop}
        mode="edit"
        editable={false}
      />,
    );
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15T14:30')).not.toBeInTheDocument();
  });

  it('calls onChange with original and current value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaDateTimeFieldInteractive value="2024-03-15T14:30" onChange={onChange} mode="edit" />,
    );
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.clear(input);
    await user.type(input, '2024-12-25T09:00');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).toBe('2024-03-15T14:30');
  });

  it('passes timezone to display and editor', () => {
    const { rerender } = render(
      <ArdaDateTimeFieldInteractive
        value="2024-03-15T14:30:00Z"
        onChange={noop}
        mode="display"
        timezone="Etc/UTC"
      />,
    );
    expect(screen.getByText(/03\/15\/2024.*UTC/)).toBeInTheDocument();

    rerender(
      <ArdaDateTimeFieldInteractive
        value="2024-03-15T14:30"
        onChange={noop}
        mode="edit"
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });
});
