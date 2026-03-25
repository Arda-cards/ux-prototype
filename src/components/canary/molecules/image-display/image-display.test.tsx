import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ImageDisplay } from './image-display';

const defaultProps = {
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
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
});
