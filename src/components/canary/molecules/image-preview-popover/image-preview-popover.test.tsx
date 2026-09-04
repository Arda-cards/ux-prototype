import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ImagePreviewPopover } from './image-preview-popover';

const defaultProps = {
  imageUrl: 'https://example.com/image.jpg',
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
};

const popoverContent = () => document.querySelector('[data-slot="popover-content"]');

describe('ImagePreviewPopover', () => {
  it('renders children (trigger element visible)', () => {
    render(
      <ImagePreviewPopover {...defaultProps}>
        <button>Preview</button>
      </ImagePreviewPopover>,
    );
    expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
  });

  it('does not show the popover before the trigger is clicked', () => {
    render(
      <ImagePreviewPopover {...defaultProps}>
        <button>Preview</button>
      </ImagePreviewPopover>,
    );
    expect(popoverContent()).toBeNull();
  });

  it('opens on click with an ImageDisplay preview inside', () => {
    render(
      <ImagePreviewPopover {...defaultProps}>
        <button>Preview</button>
      </ImagePreviewPopover>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));

    const content = popoverContent();
    expect(content).toBeInTheDocument();
    expect(content?.querySelector('[data-slot="image-display"]')).toBeInTheDocument();
  });

  it('closes when the trigger is clicked again', () => {
    render(
      <ImagePreviewPopover {...defaultProps}>
        <button>Preview</button>
      </ImagePreviewPopover>,
    );
    const trigger = screen.getByRole('button', { name: 'Preview' });

    fireEvent.click(trigger);
    expect(popoverContent()).toBeInTheDocument();

    fireEvent.click(trigger);
    const content = popoverContent();
    if (content) {
      expect(content).toHaveAttribute('data-state', 'closed');
    } else {
      expect(content).toBeNull();
    }
  });

  it('renders children unwrapped when imageUrl is null — nothing to preview', () => {
    render(
      <ImagePreviewPopover {...defaultProps} imageUrl={null}>
        <button>Preview</button>
      </ImagePreviewPopover>,
    );
    const trigger = screen.getByRole('button', { name: 'Preview' });

    // No popover wiring at all: no popup semantics, and clicking opens nothing.
    expect(trigger).not.toHaveAttribute('aria-haspopup');
    fireEvent.click(trigger);
    expect(popoverContent()).toBeNull();
  });

  it('treats empty-string imageUrl the same as null', () => {
    // Legacy backend rows occasionally carry imageUrl === '' instead of null.
    render(
      <ImagePreviewPopover {...defaultProps} imageUrl={'' as unknown as string}>
        <button>Preview</button>
      </ImagePreviewPopover>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(popoverContent()).toBeNull();
  });
});
