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
    render(<ArdaTextCellDisplay value={undefined} />);
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
  it('starts in display mode', () => {
    render(<ArdaTextCellInteractive value="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaTextCellInteractive value="Hello" />);
    await user.dblClick(screen.getByText('Hello'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaTextCellInteractive value="Hello" onValueChange={onValueChange} />);
    await user.dblClick(screen.getByText('Hello'));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'World{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('World');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaTextCellInteractive value="Hello" disabled />);
    await user.dblClick(screen.getByText('Hello'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
