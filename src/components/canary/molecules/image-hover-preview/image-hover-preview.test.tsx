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

  it('shows "No Image Available" popover when imageUrl is null', () => {
    // Regression guard: previously the popover was fully suppressed for null
    // imageUrl, leaving users staring at a gray cell with no feedback. Now
    // the popover opens with a centered empty-state caption instead.
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

    // Popover opens at the same size as the image variant.
    const popoverContent = document.querySelector('[data-slot="popover-content"]');
    expect(popoverContent).toBeInTheDocument();
    expect(popoverContent).toHaveAttribute('data-state', 'open');

    // Empty-state caption renders inside the popover, not an ImageDisplay.
    const empty = popoverContent?.querySelector('[data-slot="image-hover-preview-empty"]');
    expect(empty).toBeInTheDocument();
    expect(empty).toHaveTextContent('No Image Available');
    expect(popoverContent?.querySelector('[data-slot="image-display"]')).toBeNull();
  });

  it('empty-state popover closes on mouse leave', () => {
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
    expect(document.querySelector('[data-slot="popover-content"]')).toBeInTheDocument();

    act(() => {
      fireEvent.mouseLeave(root);
    });
    const content = document.querySelector('[data-slot="popover-content"]');
    if (content) {
      expect(content).toHaveAttribute('data-state', 'closed');
    } else {
      expect(content).toBeNull();
    }
  });

  it('does not open the popover before the hover delay elapses (null imageUrl)', () => {
    render(
      <ImageHoverPreview {...defaultProps} imageUrl={null}>
        <div data-testid="trigger">Hover me</div>
      </ImageHoverPreview>,
    );
    const root = document.querySelector('[data-slot="image-hover-preview"]')!;

    fireEvent.mouseEnter(root);
    act(() => {
      vi.advanceTimersByTime(499);
    });
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

  it('treats empty-string imageUrl the same as null', () => {
    // Legacy backend rows occasionally carry imageUrl === '' instead of
    // null. The component must show the same empty-state caption for
    // that case rather than trying to render an <img src=""> inside the
    // popover.
    render(
      <ImageHoverPreview {...defaultProps} imageUrl={'' as unknown as string}>
        <div data-testid="trigger">Hover me</div>
      </ImageHoverPreview>,
    );
    const root = document.querySelector('[data-slot="image-hover-preview"]')!;

    fireEvent.mouseEnter(root);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const popoverContent = document.querySelector('[data-slot="popover-content"]');
    expect(popoverContent).toBeInTheDocument();
    const empty = popoverContent?.querySelector('[data-slot="image-hover-preview-empty"]');
    expect(empty).toHaveTextContent('No Image Available');
    expect(popoverContent?.querySelector('[data-slot="image-display"]')).toBeNull();
  });
});
