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
    expect(screen.getByText('03/15/2024')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDateFieldDisplay value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats ISO datetime to date', () => {
    render(<ArdaDateFieldDisplay value="2024-12-31T23:59:59Z" />);
    expect(screen.getByText('12/31/2024')).toBeInTheDocument();
  });
});

describe('ArdaDateFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaDateFieldEditor value="2024-03-15" />);
    const input = screen.getByDisplayValue('2024-03-15');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaDateFieldEditor value="2024-03-15" onChange={onChange} />);
    const input = screen.getByDisplayValue('2024-03-15');
    await user.clear(input);
    await user.type(input, '2024-12-25');
    expect(onChange).toHaveBeenCalled();
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
});

describe('ArdaDateFieldInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaDateFieldInteractive value="2024-03-15" />);
    expect(screen.getByText('03/15/2024')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-03-15')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaDateFieldInteractive value="2024-03-15" />);
    await user.dblClick(screen.getByText('03/15/2024'));
    expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaDateFieldInteractive value="2024-03-15" onValueChange={onValueChange} />);
    await user.dblClick(screen.getByText('03/15/2024'));
    const input = screen.getByDisplayValue('2024-03-15');
    await user.clear(input);
    await user.type(input, '2024-12-25{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('2024-12-25');
    expect(screen.queryByDisplayValue('2024-12-25')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaDateFieldInteractive value="2024-03-15" disabled />);
    await user.dblClick(screen.getByText('03/15/2024'));
    expect(screen.queryByDisplayValue('2024-03-15')).not.toBeInTheDocument();
  });
});
