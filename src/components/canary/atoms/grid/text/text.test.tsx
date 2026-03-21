import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { TextCellDisplay } from './text-cell-display';
import { TextCellEditor, type TextCellEditorHandle } from './text-cell-editor';

describe('TextCellDisplay', () => {
  it('renders text value', () => {
    render(<TextCellDisplay value="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<TextCellDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<TextCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('truncates long text with maxLength', () => {
    render(<TextCellDisplay value="Hello World" maxLength={5} />);
    expect(screen.getByText('Hello…')).toBeInTheDocument();
  });
});

describe('TextCellEditor', () => {
  it('renders with initial value', () => {
    render(<TextCellEditor value="test" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test');
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<TextCellEditorHandle>();
    render(<TextCellEditor ref={ref} value="initial" />);
    expect(ref.current?.getValue()).toBe('initial');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<TextCellEditor value="test" stopEditing={stopEditing} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<TextCellEditor value="test" stopEditing={stopEditing} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<TextCellEditor value="test" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });
});
