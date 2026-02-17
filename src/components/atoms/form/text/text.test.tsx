import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaTextFieldDisplay } from './text-field-display';
import { ArdaTextFieldEditor } from './text-field-editor';
import { ArdaTextFieldInteractive } from './text-field-interactive';

describe('ArdaTextFieldDisplay', () => {
  it('renders text value', () => {
    render(<ArdaTextFieldDisplay value="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaTextFieldDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('truncates long text with maxLength', () => {
    render(<ArdaTextFieldDisplay value="Hello World" maxLength={5} />);
    expect(screen.getByText('Hello…')).toBeInTheDocument();
  });

  it('renders with label on the left', () => {
    render(<ArdaTextFieldDisplay value="Hello" label="Name" labelPosition="left" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(<ArdaTextFieldDisplay value="Hello" label="Name" labelPosition="top" />);
    const label = screen.getByText('Name');
    expect(label.closest('div')).toHaveClass('flex-col');
  });
});

describe('ArdaTextFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaTextFieldEditor value="test" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test');
  });

  it('calls onChange with original and current values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaTextFieldEditor value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('', 'a');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ArdaTextFieldEditor value="test" onComplete={onComplete} />);
    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('test');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ArdaTextFieldEditor value="test" onCancel={onCancel} />);
    await user.type(screen.getByRole('textbox'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('auto-focuses when autoFocus is true', () => {
    render(<ArdaTextFieldEditor value="test" autoFocus />);
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ArdaTextFieldEditor value="test" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with label', () => {
    render(<ArdaTextFieldEditor value="test" label="Name" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders error styling and messages when showErrors is true', () => {
    render(
      <ArdaTextFieldEditor value="test" showErrors errors={['Name is required', 'Too short']} />,
    );
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Too short')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-500');
  });

  it('does not render errors when showErrors is false', () => {
    render(<ArdaTextFieldEditor value="test" errors={['Name is required']} />);
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });
});

describe('ArdaTextFieldInteractive', () => {
  const noop = vi.fn();

  it('renders display mode', () => {
    render(<ArdaTextFieldInteractive value="Hello" mode="display" onChange={noop} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders edit mode with input', () => {
    render(<ArdaTextFieldInteractive value="Hello" mode="edit" onChange={noop} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
  });

  it('renders error mode with input and error messages', () => {
    render(
      <ArdaTextFieldInteractive
        value="Hello"
        mode="error"
        onChange={noop}
        errors={['Required field']}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(<ArdaTextFieldInteractive value="Hello" mode="edit" onChange={noop} editable={false} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('forces display mode when editable is false even in error mode', () => {
    render(
      <ArdaTextFieldInteractive
        value="Hello"
        mode="error"
        onChange={noop}
        editable={false}
        errors={['Required']}
      />,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('passes onChange with original and current to editor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaTextFieldInteractive value="Hello" mode="edit" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'World');
    expect(onChange).toHaveBeenCalledWith('Hello', 'W');
  });
});
