import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaDateFieldDisplay } from './date-field-display';
import { ArdaDateFieldEditor } from './date-field-editor';
import { ArdaDateFieldInteractive } from './date-field-interactive';

describe('ArdaDateFieldDisplay', () => {
  it('renders date value', () => {
    render(<ArdaDateFieldDisplay value="2024-03-15" />);
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDateFieldDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime to date', () => {
    render(<ArdaDateFieldDisplay value="2024-12-31T23:59:59Z" />);
    expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
  });

  it('renders with explicit timezone', () => {
    render(<ArdaDateFieldDisplay value="2024-03-15" timezone="America/New_York" />);
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('renders with label on the left', () => {
    render(<ArdaDateFieldDisplay value="2024-03-15" label="Start Date" labelPosition="left" />);
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(<ArdaDateFieldDisplay value="2024-03-15" label="Start Date" labelPosition="top" />);
    const label = screen.getByText('Start Date');
    expect(label.closest('div')).toHaveClass('flex-col');
  });
});

describe('ArdaDateFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaDateFieldEditor value="2024-03-15" />);
    const input = screen.getByDisplayValue('2024-03-15');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange with original and current value on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaDateFieldEditor value="2024-03-15" onChange={onChange} />);
    const input = screen.getByDisplayValue('2024-03-15');
    await user.clear(input);
    await user.type(input, '2024-12-25');
    expect(onChange).toHaveBeenCalled();
    // First argument should be the original value
    expect(onChange.mock.calls[0]![0]).toBe('2024-03-15');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ArdaDateFieldEditor value="2024-03-15" onComplete={onComplete} />);
    await user.type(screen.getByDisplayValue('2024-03-15'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('2024-03-15');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ArdaDateFieldEditor value="2024-03-15" onCancel={onCancel} />);
    await user.type(screen.getByDisplayValue('2024-03-15'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('auto-focuses when autoFocus is true', () => {
    render(<ArdaDateFieldEditor value="2024-03-15" autoFocus />);
    expect(screen.getByDisplayValue('2024-03-15')).toHaveFocus();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ArdaDateFieldEditor value="2024-03-15" disabled />);
    expect(screen.getByDisplayValue('2024-03-15')).toBeDisabled();
  });

  it('shows timezone hint', () => {
    render(<ArdaDateFieldEditor value="2024-03-15" timezone="America/New_York" />);
    expect(screen.getByText(/EST|EDT|GMT-[45]/)).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ArdaDateFieldEditor value="2024-03-15" label="Start Date" />);
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
  });

  it('shows error messages when showErrors is true', () => {
    render(
      <ArdaDateFieldEditor
        value="2024-03-15"
        errors={['Date is required', 'Date must be in the future']}
        showErrors
      />,
    );
    expect(screen.getByText('Date is required')).toBeInTheDocument();
    expect(screen.getByText('Date must be in the future')).toBeInTheDocument();
  });

  it('does not show error messages when showErrors is false', () => {
    render(<ArdaDateFieldEditor value="2024-03-15" errors={['Date is required']} />);
    expect(screen.queryByText('Date is required')).not.toBeInTheDocument();
  });
});

describe('ArdaDateFieldInteractive', () => {
  const noop = vi.fn();

  it('renders in display mode', () => {
    render(<ArdaDateFieldInteractive value="2024-03-15" onChange={noop} mode="display" />);
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15')).not.toBeInTheDocument();
  });

  it('renders in edit mode with input', () => {
    render(<ArdaDateFieldInteractive value="2024-03-15" onChange={noop} mode="edit" />);
    expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
  });

  it('renders in error mode with error messages', () => {
    render(
      <ArdaDateFieldInteractive
        value="2024-03-15"
        onChange={noop}
        mode="error"
        errors={['Date is required']}
      />,
    );
    expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(
      <ArdaDateFieldInteractive value="2024-03-15" onChange={noop} mode="edit" editable={false} />,
    );
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15')).not.toBeInTheDocument();
  });

  it('calls onChange with original and current value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaDateFieldInteractive value="2024-03-15" onChange={onChange} mode="edit" />);
    const input = screen.getByDisplayValue('2024-03-15');
    await user.clear(input);
    await user.type(input, '2024-12-25');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).toBe('2024-03-15');
  });

  it('passes timezone to display and editor', () => {
    const { rerender } = render(
      <ArdaDateFieldInteractive
        value="2024-03-15"
        onChange={noop}
        mode="display"
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/03\/15\/2024/)).toBeInTheDocument();

    rerender(
      <ArdaDateFieldInteractive
        value="2024-03-15"
        onChange={noop}
        mode="edit"
        timezone="Asia/Tokyo"
      />,
    );
    expect(screen.getByText(/JST|GMT\+9/)).toBeInTheDocument();
  });
});
