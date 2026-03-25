import { render, screen, fireEvent } from '@testing-library/react';
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
    // No <img> element — just the initials placeholder
    expect(container.querySelector('img')).not.toBeInTheDocument();
    // The data-slot root is present
    expect(container.querySelector('[data-slot="image-cell-display"]')).toBeInTheDocument();
  });

  it('passes config entityTypeDisplayName to ImageDisplay', () => {
    const { container } = render(<ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} />);
    // ImageDisplay renders an <img> with alt = entityTypeDisplayName
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe(ITEM_IMAGE_CONFIG.entityTypeDisplayName);
  });

  it('shows hover affordances on mouseenter', () => {
    const { container } = render(<ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} />);
    const root = container.querySelector('[data-slot="image-cell-display"]') as HTMLElement;
    // Action icon overlay starts opacity-0 (hidden via CSS class)
    const overlay = root.querySelector('.opacity-0') as HTMLElement;
    expect(overlay).toBeInTheDocument();
    // Trigger hover — group-hover changes apply via CSS, so check that buttons exist
    fireEvent.mouseEnter(root);
    const editBtn = screen.getByRole('button', { name: 'Edit image' });
    expect(editBtn).toBeInTheDocument();
  });

  it('hides affordances on mouseleave', () => {
    const { container } = render(<ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} />);
    const root = container.querySelector('[data-slot="image-cell-display"]') as HTMLElement;
    fireEvent.mouseEnter(root);
    fireEvent.mouseLeave(root);
    // Overlay div still rendered but has opacity-0 class (CSS handles visual hiding)
    const overlay = root.querySelector('.opacity-0');
    expect(overlay).toBeInTheDocument();
  });

  it('eye icon suppressed for null images', () => {
    render(<ImageCellDisplay {...defaultProps} value={null} />);
    // Inspect button should not be rendered when value is null
    expect(screen.queryByRole('button', { name: 'Inspect image' })).not.toBeInTheDocument();
    // Edit button is still rendered
    expect(screen.getByRole('button', { name: 'Edit image' })).toBeInTheDocument();
  });
});
