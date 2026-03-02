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
    render(<ArdaUrlCellDisplay />);
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
  it('renders display mode', () => {
    render(
      <ArdaUrlCellInteractive value="https://example.com" onChange={() => {}} mode="display" />,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders edit mode with input', () => {
    render(<ArdaUrlCellInteractive value="https://example.com" onChange={() => {}} mode="edit" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com');
  });

  it('calls onChange with original and current values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaUrlCellInteractive value="https://old.com" onChange={onChange} mode="edit" />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'https://new.com');
    // onChange is called per keystroke; check last call has correct original
    expect(onChange).toHaveBeenLastCalledWith('https://old.com', 'https://new.com');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaUrlCellInteractive
        value="https://example.com"
        onChange={() => {}}
        mode="edit"
        onComplete={onComplete}
      />,
    );
    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('https://example.com');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaUrlCellInteractive
        value="https://example.com"
        onChange={() => {}}
        mode="edit"
        onCancel={onCancel}
      />,
    );
    const input = screen.getByRole('textbox');
    await user.type(input, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders error mode with error messages', () => {
    render(
      <ArdaUrlCellInteractive
        value="bad-url"
        onChange={() => {}}
        mode="error"
        errors={['Invalid URL', 'Must start with https://']}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Invalid URL')).toBeInTheDocument();
    expect(screen.getByText('Must start with https://')).toBeInTheDocument();
  });

  it('does not show errors in edit mode', () => {
    render(
      <ArdaUrlCellInteractive
        value="bad-url"
        onChange={() => {}}
        mode="edit"
        errors={['Invalid URL']}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(
      <ArdaUrlCellInteractive
        value="https://example.com"
        onChange={() => {}}
        mode="edit"
        editable={false}
      />,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
