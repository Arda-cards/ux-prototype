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
    render(<ArdaImageFieldDisplay value={undefined} />);
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
    expect(label.closest('div')).toHaveClass('flex-col');
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

  it('calls onChange on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaImageFieldEditor value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
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
});

describe('ArdaImageFieldInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaImageFieldInteractive value="https://example.com/image.jpg" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaImageFieldInteractive value="https://example.com/image.jpg" />);
    const container = screen.getByRole('img').parentElement?.parentElement;
    if (container) {
      await user.dblClick(container);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    }
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ArdaImageFieldInteractive
        value="https://example.com/old.jpg"
        onValueChange={onValueChange}
      />,
    );
    const container = screen.getByRole('img').parentElement?.parentElement;
    if (container) {
      await user.dblClick(container);
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'https://example.com/new.jpg{Enter}');
      expect(onValueChange).toHaveBeenCalledWith('https://example.com/new.jpg');
    }
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaImageFieldInteractive value="https://example.com/image.jpg" disabled />);
    const container = screen.getByRole('img').parentElement?.parentElement;
    if (container) {
      await user.dblClick(container);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    }
  });
});
