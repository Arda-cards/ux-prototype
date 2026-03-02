import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaImageFieldDisplay } from './image-field-display';
import { ArdaImageFieldEditor } from './image-field-editor';
import { ArdaImageFieldInteractive } from './image-field-interactive';

describe('ArdaImageFieldDisplay', () => {
  it('renders image when URL is provided', () => {
    render(<ArdaImageFieldDisplay value="https://example.com/image.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders placeholder for undefined', () => {
    render(<ArdaImageFieldDisplay />);
    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  it('renders placeholder when image fails to load', async () => {
    render(<ArdaImageFieldDisplay value="https://invalid-url.test/img.jpg" />);
    const img = screen.getByRole('img');
    // Trigger error handler
    img.dispatchEvent(new Event('error'));
    // Wait for the state update to complete
    await waitFor(() => {
      expect(screen.getByText('Invalid image')).toBeInTheDocument();
    });
  });

  it('renders with label on the left', () => {
    render(
      <ArdaImageFieldDisplay
        value="https://example.com/image.jpg"
        label="Photo"
        labelPosition="left"
      />,
    );
    expect(screen.getByText('Photo')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(
      <ArdaImageFieldDisplay
        value="https://example.com/image.jpg"
        label="Photo"
        labelPosition="top"
      />,
    );
    const label = screen.getByText('Photo');
    expect(label.closest('label')).toHaveClass('flex-col');
  });

  it('displays URL below the image', () => {
    render(<ArdaImageFieldDisplay value="https://example.com/image.jpg" />);
    expect(screen.getByText('https://example.com/image.jpg')).toBeInTheDocument();
  });
});

describe('ArdaImageFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaImageFieldEditor value="https://example.com/image.jpg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('https://example.com/image.jpg');
  });

  it('calls onChange with original and current values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaImageFieldEditor value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('', 'a');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ArdaImageFieldEditor value="https://example.com/image.jpg" onComplete={onComplete} />);
    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('https://example.com/image.jpg');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ArdaImageFieldEditor value="https://example.com/image.jpg" onCancel={onCancel} />);
    await user.type(screen.getByRole('textbox'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('auto-focuses when autoFocus is true', () => {
    render(<ArdaImageFieldEditor value="https://example.com/image.jpg" autoFocus />);
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ArdaImageFieldEditor value="https://example.com/image.jpg" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with label', () => {
    render(<ArdaImageFieldEditor value="https://example.com/image.jpg" label="Photo" />);
    expect(screen.getByText('Photo')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders error styling and messages when showErrors is true', () => {
    render(
      <ArdaImageFieldEditor
        value="test"
        showErrors
        errors={['Image URL is required', 'Must be a valid URL']}
      />,
    );
    expect(screen.getByText('Image URL is required')).toBeInTheDocument();
    expect(screen.getByText('Must be a valid URL')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-500');
  });

  it('does not render errors when showErrors is false', () => {
    render(<ArdaImageFieldEditor value="test" errors={['Image URL is required']} />);
    expect(screen.queryByText('Image URL is required')).not.toBeInTheDocument();
  });
});

describe('ArdaImageFieldInteractive', () => {
  const noop = vi.fn();

  it('renders display mode with image', () => {
    render(
      <ArdaImageFieldInteractive
        value="https://example.com/image.jpg"
        mode="display"
        onChange={noop}
      />,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders edit mode with input', () => {
    render(
      <ArdaImageFieldInteractive
        value="https://example.com/image.jpg"
        mode="edit"
        onChange={noop}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com/image.jpg');
  });

  it('renders error mode with input and error messages', () => {
    render(
      <ArdaImageFieldInteractive
        value="https://example.com/image.jpg"
        mode="error"
        onChange={noop}
        errors={['Required field']}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(
      <ArdaImageFieldInteractive
        value="https://example.com/image.jpg"
        mode="edit"
        onChange={noop}
        editable={false}
      />,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('forces display mode when editable is false even in error mode', () => {
    render(
      <ArdaImageFieldInteractive
        value="https://example.com/image.jpg"
        mode="error"
        onChange={noop}
        editable={false}
        errors={['Required']}
      />,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('passes onChange with original and current to editor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaImageFieldInteractive
        value="https://example.com/image.jpg"
        mode="edit"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'https://new.com');
    expect(onChange).toHaveBeenCalledWith('https://example.com/image.jpg', 'h');
  });
});
