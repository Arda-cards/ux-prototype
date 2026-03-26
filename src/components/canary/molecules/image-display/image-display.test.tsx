import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ImageDisplay } from './image-display';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';

const defaultProps = {
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
};

const TEST_CONFIG: ImageFieldConfig = {
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
  aspectRatio: 1,
  acceptedFormats: ['image/jpeg', 'image/png'],
  maxFileSizeBytes: 5_000_000,
  maxDimension: 2048,
};

describe('ImageDisplay', () => {
  it('renders img element when imageUrl provided', () => {
    render(<ImageDisplay {...defaultProps} imageUrl="https://example.com/image.jpg" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows skeleton during loading', () => {
    render(<ImageDisplay {...defaultProps} imageUrl="https://example.com/image.jpg" />);
    // Before load event fires the skeleton shimmer should be present
    const skeleton = document.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('shows loaded state after img load', () => {
    render(<ImageDisplay {...defaultProps} imageUrl="https://example.com/image.jpg" />);
    const img = screen.getByRole('img');
    // Skeleton present before load
    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();

    fireEvent.load(img);

    // Skeleton gone after load
    expect(document.querySelector('[data-slot="skeleton"]')).not.toBeInTheDocument();
    // Image is visible (no invisible class)
    expect(img).not.toHaveClass('invisible');
  });

  it('shows error state on img error', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        entityTypeDisplayName="Item"
        imageUrl="https://example.com/broken.jpg"
      />,
    );
    const img = screen.getByRole('img');
    fireEvent.error(img);

    // Initials shown
    expect(screen.getByText('I')).toBeInTheDocument();
    // Error badge present
    expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument();
  });

  it('shows initials placeholder when imageUrl is null', () => {
    render(<ImageDisplay {...defaultProps} entityTypeDisplayName="Item" imageUrl={null} />);
    // Initials present
    expect(screen.getByText('I')).toBeInTheDocument();
    // No error badge
    expect(screen.queryByLabelText('Image failed to load')).not.toBeInTheDocument();
    // No img element
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('initials derived from entityTypeDisplayName', () => {
    render(<ImageDisplay {...defaultProps} entityTypeDisplayName="Spare Part" imageUrl={null} />);
    // "Spare Part" → "SP"
    expect(screen.getByText('SP')).toBeInTheDocument();
  });

  it('no border on container', () => {
    render(<ImageDisplay {...defaultProps} imageUrl={null} />);
    const container = document.querySelector('[data-slot="image-display"]');
    expect(container).not.toHaveClass('border');
  });

  it('fills parent container', () => {
    render(<ImageDisplay {...defaultProps} imageUrl={null} />);
    const container = document.querySelector('[data-slot="image-display"]');
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('h-full');
  });

  it('applies object-cover to img', () => {
    render(<ImageDisplay {...defaultProps} imageUrl="https://example.com/image.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('object-cover');
  });

  // --- onImageChange / config interaction tests ---

  it('renders as div (non-interactive) when onImageChange is not provided', () => {
    const { container } = render(<ImageDisplay {...defaultProps} imageUrl={null} />);
    const root = container.querySelector('[data-slot="image-display"]');
    expect(root?.tagName).toBe('DIV');
  });

  it('renders as div (non-interactive) when config is not provided even if onImageChange is set', () => {
    const { container } = render(
      <ImageDisplay {...defaultProps} imageUrl={null} onImageChange={vi.fn()} />,
    );
    const root = container.querySelector('[data-slot="image-display"]');
    expect(root?.tagName).toBe('DIV');
  });

  it('renders as button (interactive) when both onImageChange and config are provided', () => {
    const { container } = render(
      <ImageDisplay
        {...defaultProps}
        imageUrl={null}
        config={TEST_CONFIG}
        onImageChange={vi.fn()}
      />,
    );
    const root = container.querySelector('[data-slot="image-display"]');
    expect(root?.tagName).toBe('BUTTON');
  });

  it('opens ImageUploadDialog on double-click when interactive', () => {
    const { container } = render(
      <ImageDisplay
        {...defaultProps}
        imageUrl="https://example.com/img.jpg"
        config={TEST_CONFIG}
        onImageChange={vi.fn()}
      />,
    );
    const btn = container.querySelector('[data-slot="image-display"]') as HTMLElement;
    fireEvent.dblClick(btn);
    // Dialog should be rendered (the Dialog component renders to the DOM)
    expect(document.querySelector('[data-slot="image-upload-dialog"]')).toBeInTheDocument();
  });

  it('opens ImageUploadDialog on Enter key when interactive', async () => {
    const user = userEvent.setup();
    render(
      <ImageDisplay
        {...defaultProps}
        imageUrl="https://example.com/img.jpg"
        config={TEST_CONFIG}
        onImageChange={vi.fn()}
      />,
    );
    await user.tab(); // focus the button
    await user.keyboard('{Enter}');
    expect(document.querySelector('[data-slot="image-upload-dialog"]')).toBeInTheDocument();
  });

  it('has focus-visible ring when interactive', () => {
    const { container } = render(
      <ImageDisplay
        {...defaultProps}
        imageUrl={null}
        config={TEST_CONFIG}
        onImageChange={vi.fn()}
      />,
    );
    const btn = container.querySelector('[data-slot="image-display"]');
    expect(btn).toHaveClass('focus-visible:ring-2');
  });

  it('does not render ImageUploadDialog before interaction', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        imageUrl={null}
        config={TEST_CONFIG}
        onImageChange={vi.fn()}
      />,
    );
    // Dialog should not be open on initial render (dialogOpen starts as false)
    // The Dialog component is rendered but closed — it will not mount content
    const dialogContent = document.querySelector('[data-slot="image-upload-dialog"]');
    expect(dialogContent).not.toBeInTheDocument();
  });
});
