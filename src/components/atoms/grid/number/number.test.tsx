import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaNumberCellDisplay } from './number-cell-display';
import { ArdaNumberCellEditor, type NumberCellEditorHandle } from './number-cell-editor';
import { ArdaNumberCellInteractive } from './number-cell-interactive';

describe('ArdaNumberCellDisplay', () => {
  it('renders integer value', () => {
    render(<ArdaNumberCellDisplay value={42} precision={0} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders decimal value with precision', () => {
    render(<ArdaNumberCellDisplay value={3.14159} precision={2} />);
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaNumberCellDisplay precision={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats with different precisions', () => {
    const { rerender } = render(<ArdaNumberCellDisplay value={3.14159} precision={0} />);
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<ArdaNumberCellDisplay value={3.14159} precision={2} />);
    expect(screen.getByText('3.14')).toBeInTheDocument();

    rerender(<ArdaNumberCellDisplay value={3.14159} precision={4} />);
    expect(screen.getByText('3.1416')).toBeInTheDocument();
  });
});

describe('ArdaNumberCellEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaNumberCellEditor value={42} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(42);
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<NumberCellEditorHandle>();
    render(<ArdaNumberCellEditor ref={ref} value={42} />);
    expect(ref.current?.getValue()).toBe(42);
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaNumberCellEditor value={42} stopEditing={stopEditing} />);
    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaNumberCellEditor value={42} stopEditing={stopEditing} />);
    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ArdaNumberCellEditor value={42} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveFocus();
  });

  it('sets step based on precision', () => {
    const { rerender } = render(<ArdaNumberCellEditor value={42} precision={0} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '1');

    rerender(<ArdaNumberCellEditor value={42} precision={2} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.01');

    rerender(<ArdaNumberCellEditor value={42} precision={4} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.0001');
  });

  it('respects min and max attributes', () => {
    render(<ArdaNumberCellEditor value={50} min={0} max={100} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });
});

describe('ArdaNumberCellInteractive', () => {
  it('renders display when mode is display', () => {
    render(<ArdaNumberCellInteractive value={42} mode="display" onChange={() => {}} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('renders editor when mode is edit', () => {
    render(<ArdaNumberCellInteractive value={42} mode="edit" onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(42);
  });

  it('renders editor with error styling when mode is error', () => {
    render(
      <ArdaNumberCellInteractive
        value={0}
        mode="error"
        errors={['Value must be greater than 0']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByText('Value must be greater than 0')).toBeInTheDocument();
  });

  it('renders display when editable is false regardless of mode', () => {
    render(
      <ArdaNumberCellInteractive value={42} mode="edit" editable={false} onChange={() => {}} />,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('calls onChange with (original, current) on input change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaNumberCellInteractive value={42} mode="edit" onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '100');
    expect(onChange).toHaveBeenCalledWith(42, 100);
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaNumberCellInteractive
        value={42}
        mode="edit"
        onChange={() => {}}
        onComplete={onComplete}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith(42);
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaNumberCellInteractive value={42} mode="edit" onChange={() => {}} onCancel={onCancel} />,
    );
    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('passes precision to display component', () => {
    render(
      <ArdaNumberCellInteractive
        value={3.14159}
        mode="display"
        precision={2}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });
});
