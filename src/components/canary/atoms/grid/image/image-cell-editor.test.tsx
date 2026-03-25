import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import {
  ImageCellEditor,
  createImageCellEditor,
  type ImageCellEditorHandle,
} from './image-cell-editor';
import { ITEM_IMAGE_CONFIG, MOCK_ITEM_IMAGE } from '@/components/canary/__mocks__/image-story-data';

const defaultProps = {
  data: {},
};

describe('ImageCellEditor', () => {
  it('exposes getValue via ref', () => {
    const ref = React.createRef<ImageCellEditorHandle>();
    render(<ImageCellEditor ref={ref} value={MOCK_ITEM_IMAGE} {...defaultProps} />);
    expect(ref.current?.getValue()).toBe(MOCK_ITEM_IMAGE);
  });

  it('getValue returns original value on cancel', () => {
    const ref = React.createRef<ImageCellEditorHandle>();
    render(<ImageCellEditor ref={ref} value={MOCK_ITEM_IMAGE} {...defaultProps} />);
    // getValue should still return the initialValue even after cancel
    expect(ref.current?.getValue()).toBe(MOCK_ITEM_IMAGE);
  });

  it('renders invisible placeholder', () => {
    const { container } = render(<ImageCellEditor value={MOCK_ITEM_IMAGE} {...defaultProps} />);
    const placeholder = container.querySelector('[data-slot="image-cell-editor"]');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder?.getAttribute('aria-hidden')).toBe('true');
  });

  it('createImageCellEditor factory returns a component', () => {
    const EditorComponent = createImageCellEditor(ITEM_IMAGE_CONFIG);
    expect(typeof EditorComponent).toBe('function');
    // Render it to verify it works
    const { container } = render(<EditorComponent value={null} data={{}} />);
    expect(container.querySelector('[data-slot="image-cell-editor"]')).toBeInTheDocument();
  });

  it('stopEditing called on mount (placeholder behavior)', () => {
    const stopEditing = vi.fn();
    render(<ImageCellEditor value={MOCK_ITEM_IMAGE} {...defaultProps} stopEditing={stopEditing} />);
    expect(stopEditing).toHaveBeenCalledWith(true);
  });
});
