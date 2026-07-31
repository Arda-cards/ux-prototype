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

  // --- Consumer-driven load/error reporting (PDEV-1180) -------------------
  // The app needs to know an image failed so it can refresh CDN cookies and
  // retry. ImageDisplay owns the <img>, so the signal has to come from here.

  it('calls onError when the image fails to load', () => {
    const onError = vi.fn();
    render(
      <ImageDisplay
        {...defaultProps}
        imageUrl="https://example.com/broken.jpg"
        onError={onError}
      />,
    );

    fireEvent.error(screen.getByRole('img'));

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('calls onLoad when the image loads', () => {
    const onLoad = vi.fn();
    render(
      <ImageDisplay {...defaultProps} imageUrl="https://example.com/image.jpg" onLoad={onLoad} />,
    );

    fireEvent.load(screen.getByRole('img'));

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('still renders its own error state when onError is provided', () => {
    // The callback augments the internal state machine, it does not replace it.
    render(
      <ImageDisplay
        {...defaultProps}
        entityTypeDisplayName="Item"
        imageUrl="https://example.com/broken.jpg"
        onError={vi.fn()}
      />,
    );

    fireEvent.error(screen.getByRole('img'));

    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument();
  });

  it('surfaces errorReason on the error badge for hover', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        imageUrl="https://example.com/broken.jpg"
        errorReason="Image access expired — retrying"
      />,
    );

    fireEvent.error(screen.getByRole('img'));

    expect(screen.getByLabelText('Image access expired — retrying')).toBeInTheDocument();
    expect(screen.getByTitle('Image access expired — retrying')).toBeInTheDocument();
  });

  it('falls back to the generic error label when no errorReason is given', () => {
    render(<ImageDisplay {...defaultProps} imageUrl="https://example.com/broken.jpg" />);

    fireEvent.error(screen.getByRole('img'));

    expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument();
  });

  it('does not show an error badge for a null imageUrl even with errorReason set', () => {
    // "No image" is not a failure — errorReason must not turn it into one.
    render(<ImageDisplay {...defaultProps} imageUrl={null} errorReason="Image access expired" />);

    expect(screen.queryByLabelText('Image access expired')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Image failed to load')).not.toBeInTheDocument();
  });

  // --- Pending state (PDEV-1180) -------------------------------------------
  // "No image" and "the URL cannot be resolved yet" are different situations
  // that both arrive as a falsy imageUrl. Conflating them makes a not-yet-ready
  // image look deleted — which, in an editing surface, risks saving it away.

  it('shows the skeleton and requests nothing while pending', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        imageUrl="https://example.com/image.jpg"
        imagePending={true}
      />,
    );

    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    // No <img> means no network request — this is the point of the gate: an
    // image requested before its CDN cookies exist 403s and nothing retries it.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not claim "no image" while pending', () => {
    // The initials placeholder is the empty state. Showing it for a pending
    // image tells the user the item has no picture, which is wrong.
    render(
      <ImageDisplay {...defaultProps} entityTypeDisplayName="Item" imageUrl={null} imagePending />,
    );

    expect(screen.queryByText('I')).not.toBeInTheDocument();
    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it('shows no error badge while pending', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        imageUrl="https://example.com/broken.jpg"
        imagePending
        errorReason="Image access expired"
      />,
    );

    expect(screen.queryByLabelText('Image access expired')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Image failed to load')).not.toBeInTheDocument();
  });

  it('renders normally once pending clears', () => {
    const { rerender } = render(
      <ImageDisplay {...defaultProps} imageUrl="https://example.com/image.jpg" imagePending />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    rerender(
      <ImageDisplay
        {...defaultProps}
        imageUrl="https://example.com/image.jpg"
        imagePending={false}
      />,
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('does not flash the previous error when pending clears on the same url', () => {
    // The retry sequence PDEV-1337 will drive: an image fails, the consumer
    // marks it pending while it refreshes credentials, then clears pending with
    // the *same* imageUrl. `loadState` is only reset by the imageUrl effect, so
    // without care the stale 'error' survives and the user sees an error badge
    // during what is actually a retry.
    const { rerender } = render(
      <ImageDisplay
        {...defaultProps}
        entityTypeDisplayName="Item"
        imageUrl="https://example.com/broken.jpg"
        imagePending={false}
      />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument();

    // Consumer takes over: pending while credentials are refreshed.
    rerender(
      <ImageDisplay
        {...defaultProps}
        entityTypeDisplayName="Item"
        imageUrl="https://example.com/broken.jpg"
        imagePending={true}
      />,
    );

    // Pending clears, same URL — this is a retry, so it must look like loading.
    rerender(
      <ImageDisplay
        {...defaultProps}
        entityTypeDisplayName="Item"
        imageUrl="https://example.com/broken.jpg"
        imagePending={false}
      />,
    );

    expect(screen.queryByLabelText('Image failed to load')).not.toBeInTheDocument();
    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
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

  it('applies object-contain to img', () => {
    render(<ImageDisplay {...defaultProps} imageUrl="https://example.com/image.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('object-contain');
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
