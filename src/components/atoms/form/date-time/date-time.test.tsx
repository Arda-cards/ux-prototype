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
    expect(screen.getByText(/03\/15\/2024.*2:30 PM/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDateTimeFieldDisplay value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime', () => {
    render(<ArdaDateTimeFieldDisplay value="2024-12-31T23:59" />);
    expect(screen.getByText(/12\/31\/2024.*11:59 PM/)).toBeInTheDocument();
  });
});

describe('ArdaDateTimeFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" />);
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaDateTimeFieldEditor value="2024-03-15T14:30" onChange={onChange} />);
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.clear(input);
    await user.type(input, '2024-12-25T09:00');
    expect(onChange).toHaveBeenCalled();
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
});

describe('ArdaDateTimeFieldInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaDateTimeFieldInteractive value="2024-03-15T14:30" />);
    expect(screen.getByText(/03\/15\/2024.*2:30 PM/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15T14:30')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaDateTimeFieldInteractive value="2024-03-15T14:30" />);
    await user.dblClick(screen.getByText(/03\/15\/2024.*2:30 PM/));
    expect(screen.getByDisplayValue('2024-03-15T14:30')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaDateTimeFieldInteractive value="2024-03-15T14:30" onValueChange={onValueChange} />);
    await user.dblClick(screen.getByText(/03\/15\/2024.*2:30 PM/));
    const input = screen.getByDisplayValue('2024-03-15T14:30');
    await user.clear(input);
    await user.type(input, '2024-12-25T09:00{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('2024-12-25T09:00');
    expect(screen.queryByDisplayValue('2024-12-25T09:00')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaDateTimeFieldInteractive value="2024-03-15T14:30" disabled />);
    await user.dblClick(screen.getByText(/03\/15\/2024.*2:30 PM/));
    expect(screen.queryByDisplayValue('2024-03-15T14:30')).not.toBeInTheDocument();
  });
});
