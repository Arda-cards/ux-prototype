import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ImageInspectorOverlay } from './image-inspector-overlay';

const defaultProps = {
  imageUrl: 'https://example.com/image.jpg',
  open: true,
  onClose: vi.fn(),
};

describe('ImageInspectorOverlay', () => {
  it('renders nothing (dialog not open) when open is false', () => {
    render(<ImageInspectorOverlay {...defaultProps} open={false} />);
    // When Radix Dialog is closed, content is not in the DOM
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('renders image when open is true', () => {
    render(<ImageInspectorOverlay {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('calls onClose on Escape key', async () => {
    const onClose = vi.fn();
    render(<ImageInspectorOverlay {...defaultProps} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose on close button click', async () => {
    const onClose = vi.fn();
    render(<ImageInspectorOverlay {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows Edit button when onEdit is provided', () => {
    const onEdit = vi.fn();
    render(<ImageInspectorOverlay {...defaultProps} onEdit={onEdit} />);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('hides Edit button when onEdit is undefined', () => {
    render(<ImageInspectorOverlay {...defaultProps} />);
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('calls onEdit on Edit button click', async () => {
    const onEdit = vi.fn();
    const onClose = vi.fn();
    render(<ImageInspectorOverlay {...defaultProps} onClose={onClose} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('image has correct src', () => {
    render(<ImageInspectorOverlay {...defaultProps} imageUrl="https://example.com/photo.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });
});
