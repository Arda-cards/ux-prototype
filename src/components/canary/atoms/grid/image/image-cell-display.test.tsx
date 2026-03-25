import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ImageCellDisplay } from './image-cell-display';
import { ITEM_IMAGE_CONFIG, MOCK_ITEM_IMAGE } from '@/components/canary/__mocks__/image-story-data';

const defaultProps = {
  config: ITEM_IMAGE_CONFIG,
  data: {},
};

describe('ImageCellDisplay', () => {
  it('renders ImageDisplay with value as imageUrl', () => {
    const { container } = render(<ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe(MOCK_ITEM_IMAGE);
  });

  it('renders placeholder when value is null', () => {
    const { container } = render(<ImageCellDisplay {...defaultProps} value={null} />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="image-cell-display"]')).toBeInTheDocument();
  });

  it('passes config entityTypeDisplayName to ImageDisplay', () => {
    const { container } = render(<ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe(ITEM_IMAGE_CONFIG.entityTypeDisplayName);
  });

  it('wraps thumbnail in ImageHoverPreview', () => {
    const { container } = render(<ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} />);
    expect(container.querySelector('[data-slot="image-hover-preview"]')).toBeInTheDocument();
  });

  it('does not block click events (no stopPropagation overlays)', () => {
    const { container } = render(<ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} />);
    // No buttons inside the cell — action icons were removed to allow
    // AG Grid double-click editing to work unimpeded
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });
});
