import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ArdaImageCellDisplay } from './image-cell-display';
import { ArdaImageCellEditor, type ImageCellEditorHandle } from './image-cell-editor';
import { ArdaImageCellInteractive } from './image-cell-interactive';

describe('ArdaImageCellDisplay', () => {
  it('renders image when URL is provided', () => {
    render(<ArdaImageCellDisplay value="https://example.com/image.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders placeholder icon for undefined', () => {
    const { container } = render(<ArdaImageCellDisplay />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders placeholder icon for empty string', () => {
    const { container } = render(<ArdaImageCellDisplay value="" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders placeholder icon when image fails to load', async () => {
    const { container } = render(<ArdaImageCellDisplay value="https://invalid-url.test/img.jpg" />);
    const img = screen.getByRole('img');
    // Trigger error handler
    img.dispatchEvent(new Event('error'));
    // Wait for the state update to complete
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('applies maxHeight style', () => {
    render(<ArdaImageCellDisplay value="https://example.com/image.jpg" maxHeight={32} />);
    const img = screen.getByRole('img');
    expect(img).toHaveStyle({ maxHeight: '32px' });
  });
});

describe('ArdaImageCellEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaImageCellEditor value="https://example.com/image.jpg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('https://example.com/image.jpg');
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<ImageCellEditorHandle>();
    render(<ArdaImageCellEditor ref={ref} value="https://example.com/image.jpg" />);
    expect(ref.current?.getValue()).toBe('https://example.com/image.jpg');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaImageCellEditor value="https://example.com/image.jpg" stopEditing={stopEditing} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ArdaImageCellEditor value="https://example.com/image.jpg" stopEditing={stopEditing} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ArdaImageCellEditor value="https://example.com/image.jpg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });
});

describe('ArdaImageCellInteractive', () => {
  it('renders display mode with image', () => {
    render(
      <ArdaImageCellInteractive
        value="https://example.com/image.jpg"
        onChange={() => {}}
        mode="display"
      />,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders edit mode with input', () => {
    render(
      <ArdaImageCellInteractive
        value="https://example.com/image.jpg"
        onChange={() => {}}
        mode="edit"
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com/image.jpg');
  });

  it('calls onChange with original and current values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaImageCellInteractive
        value="https://example.com/old.jpg"
        onChange={onChange}
        mode="edit"
      />,
    );
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'https://example.com/new.jpg');
    // onChange is called per keystroke; check last call has correct original
    expect(onChange).toHaveBeenLastCalledWith(
      'https://example.com/old.jpg',
      'https://example.com/new.jpg',
    );
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaImageCellInteractive
        value="https://example.com/image.jpg"
        onChange={() => {}}
        mode="edit"
        onComplete={onComplete}
      />,
    );
    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('https://example.com/image.jpg');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaImageCellInteractive
        value="https://example.com/image.jpg"
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
      <ArdaImageCellInteractive
        value="bad-url"
        onChange={() => {}}
        mode="error"
        errors={['Invalid image URL', 'Must point to an image file']}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Invalid image URL')).toBeInTheDocument();
    expect(screen.getByText('Must point to an image file')).toBeInTheDocument();
  });

  it('does not show errors in edit mode', () => {
    render(
      <ArdaImageCellInteractive
        value="bad-url"
        onChange={() => {}}
        mode="edit"
        errors={['Invalid image URL']}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText('Invalid image URL')).not.toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(
      <ArdaImageCellInteractive
        value="https://example.com/image.jpg"
        onChange={() => {}}
        mode="edit"
        editable={false}
      />,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
