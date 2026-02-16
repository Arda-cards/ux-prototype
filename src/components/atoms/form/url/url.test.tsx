import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaUrlFieldDisplay } from './url-field-display';
import { ArdaUrlFieldEditor } from './url-field-editor';
import { ArdaUrlFieldInteractive } from './url-field-interactive';

describe('ArdaUrlFieldDisplay', () => {
  it('renders link format by default', () => {
    render(<ArdaUrlFieldDisplay value="https://example.com" />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('text-blue-600');
  });

  it('renders button format', () => {
    render(<ArdaUrlFieldDisplay value="https://example.com" displayFormat="button" />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Open');
    expect(link).toHaveClass('bg-primary');
  });

  it('renders custom button label', () => {
    render(
      <ArdaUrlFieldDisplay
        value="https://example.com"
        displayFormat="button"
        buttonLabel="Visit Site"
      />,
    );
    expect(screen.getByText('Visit Site')).toBeInTheDocument();
  });

  it('opens in new tab by default', () => {
    render(<ArdaUrlFieldDisplay value="https://example.com" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens in same tab when openInNewTab is false', () => {
    render(<ArdaUrlFieldDisplay value="https://example.com" openInNewTab={false} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_self');
    expect(link).not.toHaveAttribute('rel');
  });

  it('renders dash for undefined', () => {
    render(<ArdaUrlFieldDisplay value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders with label on the left', () => {
    render(
      <ArdaUrlFieldDisplay value="https://example.com" label="Website" labelPosition="left" />,
    );
    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(<ArdaUrlFieldDisplay value="https://example.com" label="Website" labelPosition="top" />);
    const label = screen.getByText('Website');
    expect(label.closest('div')).toHaveClass('flex-col');
  });
});

describe('ArdaUrlFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaUrlFieldEditor value="https://example.com" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('https://example.com');
  });

  it('calls onChange on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaUrlFieldEditor value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ArdaUrlFieldEditor value="https://example.com" onComplete={onComplete} />);
    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('https://example.com');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ArdaUrlFieldEditor value="https://example.com" onCancel={onCancel} />);
    await user.type(screen.getByRole('textbox'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('auto-focuses when autoFocus is true', () => {
    render(<ArdaUrlFieldEditor value="https://example.com" autoFocus />);
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ArdaUrlFieldEditor value="https://example.com" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with label', () => {
    render(<ArdaUrlFieldEditor value="https://example.com" label="Website" />);
    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

describe('ArdaUrlFieldInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaUrlFieldInteractive value="https://example.com" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaUrlFieldInteractive value="https://example.com" />);
    const container = screen.getByRole('link').parentElement;
    if (container) {
      await user.dblClick(container);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    }
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ArdaUrlFieldInteractive value="https://old.com" onValueChange={onValueChange} />);
    const container = screen.getByRole('link').parentElement;
    if (container) {
      await user.dblClick(container);
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'https://new.com{Enter}');
      expect(onValueChange).toHaveBeenCalledWith('https://new.com');
    }
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaUrlFieldInteractive value="https://example.com" disabled />);
    const container = screen.getByRole('link').parentElement;
    if (container) {
      await user.dblClick(container);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    }
  });
});
