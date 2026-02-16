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
    const { container } = render(<ArdaImageCellDisplay value={undefined} />);
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
  it('starts in display mode', () => {
    render(<ArdaImageCellInteractive value="https://example.com/image.jpg" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ArdaImageCellInteractive value="https://example.com/image.jpg" />);
    await user.dblClick(screen.getByRole('img'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ArdaImageCellInteractive
        value="https://example.com/old.jpg"
        onValueChange={onValueChange}
      />,
    );
    await user.dblClick(screen.getByRole('img'));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'https://example.com/new.jpg{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('https://example.com/new.jpg');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<ArdaImageCellInteractive value="https://example.com/image.jpg" disabled />);
    await user.dblClick(screen.getByRole('img'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
