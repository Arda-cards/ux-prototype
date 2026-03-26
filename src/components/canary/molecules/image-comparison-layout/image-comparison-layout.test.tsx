import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { MOCK_BROKEN_IMAGE } from '@/components/canary/__mocks__/image-story-data';

import { ImageComparisonLayout } from './image-comparison-layout';

const defaultProps = {
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
};

describe('ImageComparisonLayout', () => {
  it('renders "Current" and "New" labels when existingImageUrl provided', () => {
    render(
      <ImageComparisonLayout {...defaultProps} existingImageUrl="https://example.com/existing.jpg">
        <div>new content</div>
      </ImageComparisonLayout>,
    );

    // Both labels appear (desktop layout)
    const currentLabels = screen.getAllByText('Current');
    const newLabels = screen.getAllByText('New');
    expect(currentLabels.length).toBeGreaterThan(0);
    expect(newLabels.length).toBeGreaterThan(0);
  });

  it('renders existing image via ImageDisplay', () => {
    render(
      <ImageComparisonLayout {...defaultProps} existingImageUrl="https://example.com/existing.jpg">
        <div>new content</div>
      </ImageComparisonLayout>,
    );

    // ImageDisplay renders an img element for the existing image URL
    const images = screen.getAllByRole('img');
    const existingImg = images.find((img) => img.getAttribute('src')?.includes('existing.jpg'));
    expect(existingImg).toBeInTheDocument();
  });

  it('renders children (new image content)', () => {
    render(
      <ImageComparisonLayout {...defaultProps} existingImageUrl="https://example.com/existing.jpg">
        <div data-testid="new-content">new image area</div>
      </ImageComparisonLayout>,
    );

    // Children appear in both desktop and mobile layouts
    expect(screen.getAllByTestId('new-content').length).toBeGreaterThan(0);
  });

  it('hides comparison when existingImageUrl is null (only children rendered)', () => {
    render(
      <ImageComparisonLayout {...defaultProps} existingImageUrl={null}>
        <div data-testid="only-child">sole content</div>
      </ImageComparisonLayout>,
    );

    // Children are rendered
    expect(screen.getByTestId('only-child')).toBeInTheDocument();

    // No "Current" / "New" labels
    expect(screen.queryByText('Current')).not.toBeInTheDocument();
    expect(screen.queryByText('New')).not.toBeInTheDocument();

    // No img element from ImageDisplay
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows initials placeholder for broken existing image', () => {
    render(
      <ImageComparisonLayout {...defaultProps} existingImageUrl={MOCK_BROKEN_IMAGE}>
        <div>new content</div>
      </ImageComparisonLayout>,
    );

    // Find the img element that ImageDisplay renders for the broken URL
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);

    // Trigger error on the broken image — initials placeholder should appear
    const firstImage = images[0];
    expect(firstImage).toBeInTheDocument();
    fireEvent.error(firstImage!);

    // "Item" → initials "I"
    const initialsEls = screen.getAllByText('I');
    expect(initialsEls.length).toBeGreaterThan(0);
  });

  it('labels text is correct ("Current" and "New")', () => {
    render(
      <ImageComparisonLayout {...defaultProps} existingImageUrl="https://example.com/existing.jpg">
        <div>children</div>
      </ImageComparisonLayout>,
    );

    // Desktop layout spans carry the muted + text-sm classes
    const desktopLabels = document.querySelectorAll(
      '[data-slot="image-comparison-layout"] span.text-muted-foreground.text-sm',
    );

    const labelTexts = Array.from(desktopLabels).map((el) => el.textContent);
    expect(labelTexts).toContain('Current');
    expect(labelTexts).toContain('New');

    desktopLabels.forEach((el) => {
      expect(el).toHaveClass('text-muted-foreground');
      expect(el).toHaveClass('text-sm');
    });
  });
});
