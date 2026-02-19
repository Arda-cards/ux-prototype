import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaNumberFieldDisplay } from './number-field-display';
import { ArdaNumberFieldEditor } from './number-field-editor';
import { ArdaNumberFieldInteractive } from './number-field-interactive';

describe('ArdaNumberFieldDisplay', () => {
  it('renders integer value', () => {
    render(<ArdaNumberFieldDisplay value={42} precision={0} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders decimal value with precision', () => {
    render(<ArdaNumberFieldDisplay value={3.14159} precision={2} />);
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaNumberFieldDisplay precision={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders with label on the left', () => {
    render(<ArdaNumberFieldDisplay value={42} label="Quantity" labelPosition="left" />);
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(<ArdaNumberFieldDisplay value={42} label="Quantity" labelPosition="top" />);
    const label = screen.getByText('Quantity');
    expect(label.closest('label')).toHaveClass('flex-col');
  });

  it('formats with different precisions', () => {
    const { rerender } = render(<ArdaNumberFieldDisplay value={3.14159} precision={0} />);
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<ArdaNumberFieldDisplay value={3.14159} precision={2} />);
    expect(screen.getByText('3.14')).toBeInTheDocument();

    rerender(<ArdaNumberFieldDisplay value={3.14159} precision={4} />);
    expect(screen.getByText('3.1416')).toBeInTheDocument();
  });
});

describe('ArdaNumberFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaNumberFieldEditor value={42} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(42);
  });

  it('calls onChange with original and current values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaNumberFieldEditor value={0} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '42');
    expect(onChange).toHaveBeenCalledWith(0, 42);
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ArdaNumberFieldEditor value={42} onComplete={onComplete} />);
    await user.type(screen.getByRole('spinbutton'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith(42);
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ArdaNumberFieldEditor value={42} onCancel={onCancel} />);
    await user.type(screen.getByRole('spinbutton'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('auto-focuses when autoFocus is true', () => {
    render(<ArdaNumberFieldEditor value={42} autoFocus />);
    expect(screen.getByRole('spinbutton')).toHaveFocus();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ArdaNumberFieldEditor value={42} disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('sets step based on precision', () => {
    const { rerender } = render(<ArdaNumberFieldEditor value={42} precision={0} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '1');

    rerender(<ArdaNumberFieldEditor value={42} precision={2} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.01');
  });

  it('renders error styling and messages when showErrors is true', () => {
    render(<ArdaNumberFieldEditor value={0} showErrors errors={['Must be positive']} />);
    expect(screen.getByText('Must be positive')).toBeInTheDocument();
    const input = screen.getByRole('spinbutton');
    expect(input.className).toContain('border-red-500');
  });

  it('respects min and max attributes', () => {
    render(<ArdaNumberFieldEditor value={50} min={0} max={100} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });
});

describe('ArdaNumberFieldInteractive', () => {
  const noop = vi.fn();

  it('renders display mode', () => {
    render(<ArdaNumberFieldInteractive value={42} mode="display" onChange={noop} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('renders edit mode with input', () => {
    render(<ArdaNumberFieldInteractive value={42} mode="edit" onChange={noop} />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders error mode with error messages', () => {
    render(
      <ArdaNumberFieldInteractive value={0} mode="error" onChange={noop} errors={['Required']} />,
    );
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(<ArdaNumberFieldInteractive value={42} mode="edit" onChange={noop} editable={false} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('passes onChange with original and current to editor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaNumberFieldInteractive value={42} mode="edit" onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '100');
    expect(onChange).toHaveBeenCalledWith(42, 1);
  });
});
