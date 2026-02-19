import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaTextCellDisplay } from './text-cell-display';
import { ArdaTextCellEditor, type TextCellEditorHandle } from './text-cell-editor';
import { ArdaTextCellInteractive } from './text-cell-interactive';

describe('ArdaTextCellDisplay', () => {
  it('renders text value', () => {
    render(<ArdaTextCellDisplay value="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaTextCellDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<ArdaTextCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('truncates long text with maxLength', () => {
    render(<ArdaTextCellDisplay value="Hello World" maxLength={5} />);
    expect(screen.getByText('Hello…')).toBeInTheDocument();
  });
});

describe('ArdaTextCellEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaTextCellEditor value="test" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test');
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<TextCellEditorHandle>();
    render(<ArdaTextCellEditor ref={ref} value="initial" />);
    expect(ref.current?.getValue()).toBe('initial');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaTextCellEditor value="test" stopEditing={stopEditing} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaTextCellEditor value="test" stopEditing={stopEditing} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ArdaTextCellEditor value="test" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });
});

describe('ArdaTextCellInteractive', () => {
  it('renders display when mode is display', () => {
    render(<ArdaTextCellInteractive value="Hello" mode="display" onChange={() => {}} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders editor when mode is edit', () => {
    render(<ArdaTextCellInteractive value="Hello" mode="edit" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
  });

  it('renders editor with error styling when mode is error', () => {
    render(
      <ArdaTextCellInteractive
        value="Hello"
        mode="error"
        errors={['Required field']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('renders display when editable is false regardless of mode', () => {
    render(
      <ArdaTextCellInteractive value="Hello" mode="edit" editable={false} onChange={() => {}} />,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('calls onChange with (original, current) on input change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaTextCellInteractive value="Hello" mode="edit" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'X');
    expect(onChange).toHaveBeenCalledWith('Hello', 'HelloX');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaTextCellInteractive
        value="Hello"
        mode="edit"
        onChange={() => {}}
        onComplete={onComplete}
      />,
    );
    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('Hello');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaTextCellInteractive value="Hello" mode="edit" onChange={() => {}} onCancel={onCancel} />,
    );
    const input = screen.getByRole('textbox');
    await user.type(input, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });
});
