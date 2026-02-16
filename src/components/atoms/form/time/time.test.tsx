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
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaTimeFieldDisplay value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats time with seconds', () => {
    render(<ArdaTimeFieldDisplay value="09:15:30" />);
    expect(screen.getByText('9:15 AM')).toBeInTheDocument();
  });
});

describe('ArdaTimeFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaTimeFieldEditor value="14:30" />);
    const input = screen.getByDisplayValue('14:30');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaTimeFieldEditor value="14:30" onChange={onChange} />);
    const input = screen.getByDisplayValue('14:30');
    await user.clear(input);
    await user.type(input, '09:00');
    expect(onChange).toHaveBeenCalled();
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
});

describe('ArdaTimeFieldInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaTimeFieldInteractive value="14:30" />);
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('14:30')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaTimeFieldInteractive value="14:30" />);
    await user.dblClick(screen.getByText('2:30 PM'));
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaTimeFieldInteractive value="14:30" onValueChange={onValueChange} />);
    await user.dblClick(screen.getByText('2:30 PM'));
    const input = screen.getByDisplayValue('14:30');
    await user.clear(input);
    await user.type(input, '09:00{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('09:00');
    expect(screen.queryByDisplayValue('09:00')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaTimeFieldInteractive value="14:30" disabled />);
    await user.dblClick(screen.getByText('2:30 PM'));
    expect(screen.queryByDisplayValue('14:30')).not.toBeInTheDocument();
  });
});
