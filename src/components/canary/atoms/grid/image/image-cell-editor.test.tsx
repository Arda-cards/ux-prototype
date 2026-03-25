import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import {
  ImageCellEditor,
  createImageCellEditor,
  type ImageCellEditorHandle,
} from './image-cell-editor';
import { ITEM_IMAGE_CONFIG, MOCK_ITEM_IMAGE } from '@/components/canary/__mocks__/image-story-data';

// Mock ImageUploadDialog so tests don't render the full dialog tree.
// The mock exposes Confirm and Cancel buttons for interaction testing.
vi.mock('@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog', () => ({
  ImageUploadDialog: ({
    open,
    onConfirm,
    onCancel,
    existingImageUrl,
    config,
  }: {
    open: boolean;
    onConfirm: (result: { imageUrl: string }) => void;
    onCancel: () => void;
    existingImageUrl: string | null;
    config: { entityTypeDisplayName: string };
  }) =>
    open ? (
      <div data-testid="mock-upload-dialog">
        <span data-testid="dialog-existing-url">{existingImageUrl ?? 'null'}</span>
        <span data-testid="dialog-entity-type">{config.entityTypeDisplayName}</span>
        <button
          data-testid="dialog-confirm"
          onClick={() =>
            onConfirm({
              imageUrl: 'https://cdn.example.com/new-image.jpg',
            })
          }
        >
          Confirm
        </button>
        <button data-testid="dialog-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

const defaultProps = {
  data: {},
  config: ITEM_IMAGE_CONFIG,
};

describe('ImageCellEditor', () => {
  it('opens ImageUploadDialog on mount', () => {
    render(<ImageCellEditor value={MOCK_ITEM_IMAGE} {...defaultProps} />);
    expect(screen.getByTestId('mock-upload-dialog')).toBeInTheDocument();
  });

  it('passes existingImageUrl and config to the dialog', () => {
    render(<ImageCellEditor value={MOCK_ITEM_IMAGE} {...defaultProps} />);
    expect(screen.getByTestId('dialog-existing-url')).toHaveTextContent(MOCK_ITEM_IMAGE);
    expect(screen.getByTestId('dialog-entity-type')).toHaveTextContent('Item');
  });

  it('getValue returns new URL after confirm', async () => {
    const ref = React.createRef<ImageCellEditorHandle>();
    const stopEditing = vi.fn();
    render(
      <ImageCellEditor
        ref={ref}
        value={MOCK_ITEM_IMAGE}
        {...defaultProps}
        stopEditing={stopEditing}
      />,
    );

    fireEvent.click(screen.getByTestId('dialog-confirm'));

    // getValue should return the new URL from onConfirm
    expect(ref.current?.getValue()).toBe('https://cdn.example.com/new-image.jpg');

    // stopEditing(false) is called via setTimeout
    await waitFor(() => {
      expect(stopEditing).toHaveBeenCalledWith(false);
    });
  });

  it('getValue returns original value after cancel', async () => {
    const ref = React.createRef<ImageCellEditorHandle>();
    const stopEditing = vi.fn();
    render(
      <ImageCellEditor
        ref={ref}
        value={MOCK_ITEM_IMAGE}
        {...defaultProps}
        stopEditing={stopEditing}
      />,
    );

    fireEvent.click(screen.getByTestId('dialog-cancel'));

    // getValue should still return the original value
    expect(ref.current?.getValue()).toBe(MOCK_ITEM_IMAGE);

    // stopEditing(true) is called via setTimeout
    await waitFor(() => {
      expect(stopEditing).toHaveBeenCalledWith(true);
    });
  });

  it('renders invisible placeholder in the cell', () => {
    const { container } = render(<ImageCellEditor value={MOCK_ITEM_IMAGE} {...defaultProps} />);
    const placeholder = container.querySelector('[data-slot="image-cell-editor"]');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder?.getAttribute('aria-hidden')).toBe('true');
  });

  it('dialog closes after confirm', () => {
    render(<ImageCellEditor value={MOCK_ITEM_IMAGE} {...defaultProps} />);
    expect(screen.getByTestId('mock-upload-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-confirm'));

    expect(screen.queryByTestId('mock-upload-dialog')).not.toBeInTheDocument();
  });

  it('dialog closes after cancel', () => {
    render(<ImageCellEditor value={MOCK_ITEM_IMAGE} {...defaultProps} />);
    expect(screen.getByTestId('mock-upload-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-cancel'));

    expect(screen.queryByTestId('mock-upload-dialog')).not.toBeInTheDocument();
  });

  it('createImageCellEditor factory curries config into the editor', () => {
    const EditorComponent = createImageCellEditor(ITEM_IMAGE_CONFIG);
    expect(typeof EditorComponent).toBe('object'); // forwardRef returns an object
    render(<EditorComponent value={null} data={{}} />);
    // Dialog should open with the curried config
    expect(screen.getByTestId('dialog-entity-type')).toHaveTextContent('Item');
  });

  it('handles null initial value', () => {
    const ref = React.createRef<ImageCellEditorHandle>();
    render(<ImageCellEditor ref={ref} value={null} {...defaultProps} />);
    expect(ref.current?.getValue()).toBeNull();
    expect(screen.getByTestId('dialog-existing-url')).toHaveTextContent('null');
  });
});
