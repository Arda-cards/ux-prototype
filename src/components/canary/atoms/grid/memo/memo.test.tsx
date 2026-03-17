import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { MemoCellDisplay } from './memo-cell-display';
import { MemoCellEditor, type MemoCellEditorHandle } from './memo-cell-editor';
import { MemoButtonCell } from './memo-button-cell';

describe('MemoCellDisplay', () => {
  it('renders dash for undefined', () => {
    render(<MemoCellDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders short text without truncation', () => {
    render(<MemoCellDisplay value="Short note" />);
    expect(screen.getByText('Short note')).toBeInTheDocument();
  });

  it('truncates long text', () => {
    const longText = 'A'.repeat(60);
    render(<MemoCellDisplay value={longText} maxLength={50} />);
    expect(screen.getByText('A'.repeat(50) + '…')).toBeInTheDocument();
  });

  it('renders dash for empty string', () => {
    render(<MemoCellDisplay value="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('MemoCellEditor', () => {
  it('renders textarea with initial value', () => {
    render(<MemoCellEditor value="test note" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('test note');
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<MemoCellEditorHandle>();
    render(<MemoCellEditor ref={ref} value="initial" />);
    expect(ref.current?.getValue()).toBe('initial');
  });

  it('calls stopEditing on Enter (without Shift)', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<MemoCellEditor value="test" stopEditing={stopEditing} />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('allows Shift+Enter for newline', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<MemoCellEditor value="test" stopEditing={stopEditing} />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '{Shift>}{Enter}{/Shift}');
    expect(stopEditing).not.toHaveBeenCalled();
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<MemoCellEditor value="test" stopEditing={stopEditing} />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<MemoCellEditor value="test" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveFocus();
  });

  it('shows placeholder when empty', () => {
    render(<MemoCellEditor placeholder="Custom placeholder" />);
    const textarea = screen.getByPlaceholderText('Custom placeholder');
    expect(textarea).toBeInTheDocument();
  });
});

describe('MemoButtonCell', () => {
  it('renders dash icon when no value', () => {
    render(<MemoButtonCell />);
    const button = screen.getByRole('button', { name: 'Add note' });
    expect(button).toBeInTheDocument();
  });

  it('renders chat icon when value exists', () => {
    render(<MemoButtonCell value="Some note" />);
    const button = screen.getByRole('button', { name: 'View note' });
    expect(button).toBeInTheDocument();
  });

  it('renders edit title when editable and value exists', () => {
    render(<MemoButtonCell value="Some note" editable />);
    const button = screen.getByRole('button', { name: 'Edit note' });
    expect(button).toBeInTheDocument();
  });

  it('opens modal on click', async () => {
    const user = userEvent.setup();
    render(<MemoButtonCell value="Test note" title="My Note" />);
    await user.click(screen.getByRole('button', { name: 'View note' }));
    expect(screen.getByText('My Note')).toBeInTheDocument();
    expect(screen.getByText('Test note')).toBeInTheDocument();
  });

  it('calls onSave when editable and Done clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<MemoButtonCell value="Original" editable onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Edit note' }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Updated');

    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(onSave).toHaveBeenCalledWith('Updated');
  });

  it('closes modal on Close button (read-only)', async () => {
    const user = userEvent.setup();
    render(<MemoButtonCell value="Test" />);
    await user.click(screen.getByRole('button', { name: 'View note' }));
    expect(screen.getByText('Test')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Note')).not.toBeInTheDocument();
  });
});
