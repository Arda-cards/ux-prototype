import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaUrlCellDisplay } from './url-cell-display';
import { ArdaUrlCellEditor, type UrlCellEditorHandle } from './url-cell-editor';
import { ArdaUrlCellInteractive } from './url-cell-interactive';

describe('ArdaUrlCellDisplay', () => {
  it('renders link format by default', () => {
    render(<ArdaUrlCellDisplay value="https://example.com" />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('text-blue-600');
  });

  it('renders button format', () => {
    render(<ArdaUrlCellDisplay value="https://example.com" displayFormat="button" />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Open');
    expect(link).toHaveClass('bg-primary');
  });

  it('renders custom button label', () => {
    render(
      <ArdaUrlCellDisplay value="https://example.com" displayFormat="button" buttonLabel="Visit" />,
    );
    expect(screen.getByText('Visit')).toBeInTheDocument();
  });

  it('opens in new tab by default', () => {
    render(<ArdaUrlCellDisplay value="https://example.com" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens in same tab when openInNewTab is false', () => {
    render(<ArdaUrlCellDisplay value="https://example.com" openInNewTab={false} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_self');
    expect(link).not.toHaveAttribute('rel');
  });

  it('renders dash for undefined', () => {
    render(<ArdaUrlCellDisplay value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('truncates long URLs with maxLength', () => {
    render(<ArdaUrlCellDisplay value="https://example.com/very-long-path" maxLength={10} />);
    expect(screen.getByText('https://ex…')).toBeInTheDocument();
  });
});

describe('ArdaUrlCellEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaUrlCellEditor value="https://example.com" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('https://example.com');
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<UrlCellEditorHandle>();
    render(<ArdaUrlCellEditor ref={ref} value="https://example.com" />);
    expect(ref.current?.getValue()).toBe('https://example.com');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaUrlCellEditor value="https://example.com" stopEditing={stopEditing} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaUrlCellEditor value="https://example.com" stopEditing={stopEditing} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ArdaUrlCellEditor value="https://example.com" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });
});

describe('ArdaUrlCellInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaUrlCellInteractive value="https://example.com" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaUrlCellInteractive value="https://example.com" />);
    await user.dblClick(screen.getByRole('link'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaUrlCellInteractive value="https://old.com" onValueChange={onValueChange} />);
    await user.dblClick(screen.getByRole('link'));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'https://new.com{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('https://new.com');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaUrlCellInteractive value="https://example.com" disabled />);
    await user.dblClick(screen.getByRole('link'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
