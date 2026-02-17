import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaTimeFieldDisplay } from './time-field-display';
import { ArdaTimeFieldEditor } from './time-field-editor';
import { ArdaTimeFieldInteractive } from './time-field-interactive';

describe('ArdaTimeFieldDisplay', () => {
  it('renders time value', () => {
    render(<ArdaTimeFieldDisplay value="14:30" />);
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaTimeFieldDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats time with seconds', () => {
    render(<ArdaTimeFieldDisplay value="09:15:30" />);
    expect(screen.getByText(/9:15 AM/)).toBeInTheDocument();
  });

  it('renders with explicit timezone', () => {
    render(<ArdaTimeFieldDisplay value="14:30" timezone="America/New_York" />);
    expect(screen.getByText(/2:30 PM (EST|EDT|GMT-[45])/)).toBeInTheDocument();
  });

  it('renders with label on the left', () => {
    render(<ArdaTimeFieldDisplay value="14:30" label="Start Time" labelPosition="left" />);
    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(<ArdaTimeFieldDisplay value="14:30" label="Start Time" labelPosition="top" />);
    const label = screen.getByText('Start Time');
    expect(label.closest('div')).toHaveClass('flex-col');
  });
});

describe('ArdaTimeFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaTimeFieldEditor value="14:30" />);
    const input = screen.getByDisplayValue('14:30');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange with original and current value on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaTimeFieldEditor value="14:30" onChange={onChange} />);
    const input = screen.getByDisplayValue('14:30');
    await user.clear(input);
    await user.type(input, '09:00');
    expect(onChange).toHaveBeenCalled();
    // First argument should be the original value
    expect(onChange.mock.calls[0]![0]).toBe('14:30');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ArdaTimeFieldEditor value="14:30" onComplete={onComplete} />);
    await user.type(screen.getByDisplayValue('14:30'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('14:30');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ArdaTimeFieldEditor value="14:30" onCancel={onCancel} />);
    await user.type(screen.getByDisplayValue('14:30'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('auto-focuses when autoFocus is true', () => {
    render(<ArdaTimeFieldEditor value="14:30" autoFocus />);
    expect(screen.getByDisplayValue('14:30')).toHaveFocus();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ArdaTimeFieldEditor value="14:30" disabled />);
    expect(screen.getByDisplayValue('14:30')).toBeDisabled();
  });

  it('shows timezone hint', () => {
    render(<ArdaTimeFieldEditor value="14:30" timezone="Asia/Tokyo" />);
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ArdaTimeFieldEditor value="14:30" label="Start Time" />);
    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('shows error messages when showErrors is true', () => {
    render(
      <ArdaTimeFieldEditor
        value="14:30"
        errors={['Time is required', 'Time must be during business hours']}
        showErrors
      />,
    );
    expect(screen.getByText('Time is required')).toBeInTheDocument();
    expect(screen.getByText('Time must be during business hours')).toBeInTheDocument();
  });

  it('does not show error messages when showErrors is false', () => {
    render(<ArdaTimeFieldEditor value="14:30" errors={['Time is required']} />);
    expect(screen.queryByText('Time is required')).not.toBeInTheDocument();
  });
});

describe('ArdaTimeFieldInteractive', () => {
  const noop = vi.fn();

  it('renders in display mode', () => {
    render(<ArdaTimeFieldInteractive value="14:30" onChange={noop} mode="display" />);
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('14:30')).not.toBeInTheDocument();
  });

  it('renders in edit mode with input', () => {
    render(<ArdaTimeFieldInteractive value="14:30" onChange={noop} mode="edit" />);
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('renders in error mode with error messages', () => {
    render(
      <ArdaTimeFieldInteractive
        value="14:30"
        onChange={noop}
        mode="error"
        errors={['Time is required']}
      />,
    );
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
    expect(screen.getByText('Time is required')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(<ArdaTimeFieldInteractive value="14:30" onChange={noop} mode="edit" editable={false} />);
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('14:30')).not.toBeInTheDocument();
  });

  it('calls onChange with original and current value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaTimeFieldInteractive value="14:30" onChange={onChange} mode="edit" />);
    const input = screen.getByDisplayValue('14:30');
    await user.clear(input);
    await user.type(input, '09:00');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).toBe('14:30');
  });

  it('passes timezone to display and editor', () => {
    const { rerender } = render(
      <ArdaTimeFieldInteractive
        value="14:30"
        onChange={noop}
        mode="display"
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/2:30 PM (JST|GMT\+9)/)).toBeInTheDocument();

    rerender(
      <ArdaTimeFieldInteractive value="14:30" onChange={noop} mode="edit" timezone="Asia/Tokyo" />,
    );
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });
});
