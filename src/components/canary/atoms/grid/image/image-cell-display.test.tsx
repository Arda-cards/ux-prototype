import { render, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

  // --- CDN 403 recovery hooks (PDEV-1180) ---------------------------------
  // AG Grid image cells are the surface where CDN cookie expiry shows up as
  // broken images. The consumer needs the failure signal to refresh cookies
  // and retry, so these must reach the underlying <img>.

  it('forwards onError to the underlying img', () => {
    const onError = vi.fn();
    const { container } = render(
      <ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} onError={onError} />,
    );

    fireEvent.error(container.querySelector('img')!);

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('forwards onLoad to the underlying img', () => {
    const onLoad = vi.fn();
    const { container } = render(
      <ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} onLoad={onLoad} />,
    );

    fireEvent.load(container.querySelector('img')!);

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('forwards errorReason so the failed cell explains itself on hover', () => {
    const { container } = render(
      <ImageCellDisplay
        {...defaultProps}
        value={MOCK_ITEM_IMAGE}
        errorReason="Image access expired — retrying"
      />,
    );

    fireEvent.error(container.querySelector('img')!);

    expect(screen.getByTitle('Image access expired — retrying')).toBeInTheDocument();
  });

  it('behaves identically when the new callbacks are omitted', () => {
    // Back-compat guard: existing consumers pass neither prop.
    const { container } = render(<ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} />);

    expect(() => fireEvent.error(container.querySelector('img')!)).not.toThrow();
    expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument();
  });

  it('forwards imagePending so the cell renders no request while unresolved', () => {
    const { container } = render(
      <ImageCellDisplay {...defaultProps} value={MOCK_ITEM_IMAGE} imagePending />,
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it('normalizes empty-string value to "no image" (no broken <img src="">)', () => {
    // Regression guard: legacy backend rows may ship an empty string
    // instead of null/undefined. The cell must still render as "no
    // image" — no <img> tag with empty src, which would render as a
    // broken image icon in most browsers.
    const { container } = render(
      <ImageCellDisplay {...defaultProps} value={'' as unknown as string} />,
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="image-cell-display"]')).toBeInTheDocument();
  });

  it('normalizes undefined value to "no image" (no broken <img src="">)', () => {
    // AG Grid passes undefined when the row data has no imageUrl field.
    // TypeScript types lie here: the static type says `string | null`
    // but runtime reality includes undefined.
    const { container } = render(
      <ImageCellDisplay {...defaultProps} value={undefined as unknown as string | null} />,
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="image-cell-display"]')).toBeInTheDocument();
  });
});
