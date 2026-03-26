import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ImageHoverPreview } from './image-hover-preview';

const defaultProps = {
  imageUrl: 'https://example.com/image.jpg',
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
};

describe('ImageHoverPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children (trigger element visible)', () => {
    render(
      <ImageHoverPreview {...defaultProps}>
        <button>Hover me</button>
      </ImageHoverPreview>,
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('does not show popover initially', () => {
    render(
      <ImageHoverPreview {...defaultProps}>
        <button>Hover me</button>
      </ImageHoverPreview>,
    );
    // Radix unmounts PopoverContent when closed — it should not be in the DOM
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull();
  });

  it('shows popover on hover after 500ms delay', () => {
    render(
      <ImageHoverPreview {...defaultProps}>
        <div data-testid="trigger">Hover me</div>
      </ImageHoverPreview>,
    );
    const root = document.querySelector('[data-slot="image-hover-preview"]')!;

    // Mouse enters — no popover yet
    fireEvent.mouseEnter(root);
    expect(document.querySelector('[data-state="open"]')).toBeNull();

    // Advance timer past 500ms — popover should open
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const popoverContent = document.querySelector('[data-slot="popover-content"]');
    expect(popoverContent).toBeInTheDocument();
  });

  it('hides popover on mouse leave', () => {
    render(
      <ImageHoverPreview {...defaultProps}>
        <div data-testid="trigger">Hover me</div>
      </ImageHoverPreview>,
    );
    const root = document.querySelector('[data-slot="image-hover-preview"]')!;

    // Open the popover
    fireEvent.mouseEnter(root);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // Verify it opened
    expect(document.querySelector('[data-slot="popover-content"]')).toBeInTheDocument();

    // Now leave — popover content should be closed (data-state="closed" or removed)
    act(() => {
      fireEvent.mouseLeave(root);
    });
    const content = document.querySelector('[data-slot="popover-content"]');
    if (content) {
      expect(content).toHaveAttribute('data-state', 'closed');
    } else {
      // Radix removed the element entirely
      expect(content).toBeNull();
    }
  });

  it('does not show popover when imageUrl is null', () => {
    render(
      <ImageHoverPreview {...defaultProps} imageUrl={null}>
        <div data-testid="trigger">Hover me</div>
      </ImageHoverPreview>,
    );
    const root = document.querySelector('[data-slot="image-hover-preview"]')!;

    fireEvent.mouseEnter(root);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Popover should not open — no [data-state="open"] attribute
    expect(document.querySelector('[data-state="open"]')).toBeNull();
  });

  it('renders ImageDisplay inside popover when open', () => {
    render(
      <ImageHoverPreview {...defaultProps}>
        <div data-testid="trigger">Hover me</div>
      </ImageHoverPreview>,
    );
    const root = document.querySelector('[data-slot="image-hover-preview"]')!;

    fireEvent.mouseEnter(root);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // ImageDisplay renders an img element when imageUrl is provided
    const popoverContent = document.querySelector('[data-slot="popover-content"]');
    expect(popoverContent).toBeInTheDocument();
    // ImageDisplay should be rendered inside the popover
    const imageDisplay = popoverContent?.querySelector('[data-slot="image-display"]');
    expect(imageDisplay).toBeInTheDocument();
  });
});
