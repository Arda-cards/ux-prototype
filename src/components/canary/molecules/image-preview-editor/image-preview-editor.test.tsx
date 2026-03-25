import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock react-easy-crop so tests do not rely on its internal DOM structure
vi.mock('react-easy-crop', () => ({
  default: ({
    onCropComplete,
    image,
  }: {
    onCropComplete?: (croppedArea: unknown, croppedAreaPixels: unknown) => void;
    image?: string;
  }) => (
    <div
      data-testid="mock-cropper"
      data-image={image}
      onClick={() =>
        onCropComplete?.(
          { x: 0, y: 0, width: 100, height: 100 },
          { x: 0, y: 0, width: 200, height: 200 },
        )
      }
    />
  ),
}));

import { ImagePreviewEditor } from './image-preview-editor';

const MOCK_URL = 'https://picsum.photos/seed/test/400/400';

function renderEditor(
  overrides: Partial<{
    aspectRatio: number;
    imageData: File | Blob | string;
    onCropChange: ReturnType<typeof vi.fn>;
    onReset: ReturnType<typeof vi.fn>;
  }> = {},
) {
  const onCropChange = overrides.onCropChange ?? vi.fn();
  const onReset = overrides.onReset ?? vi.fn();
  const aspectRatio = overrides.aspectRatio ?? 1;
  const imageData = overrides.imageData ?? MOCK_URL;

  const result = render(
    <ImagePreviewEditor
      aspectRatio={aspectRatio}
      imageData={imageData}
      onCropChange={onCropChange}
      onReset={onReset}
    />,
  );

  return { ...result, onCropChange, onReset };
}

describe('ImagePreviewEditor', () => {
  it('renders crop area (Cropper container element)', () => {
    renderEditor();
    expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
  });

  it('renders toolbar with zoom slider, rotate button, and reset button', async () => {
    renderEditor();
    // The Radix Slider thumb renders with role="slider" but starts with display:none until the
    // collection index is resolved in a second render pass. Use findByRole to wait for visibility.
    expect(await screen.findByRole('slider')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rotate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls onCropChange when Cropper fires onCropComplete', () => {
    const { onCropChange } = renderEditor();
    const cropper = screen.getByTestId('mock-cropper');
    fireEvent.click(cropper);

    expect(onCropChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pixelCrop: { x: 0, y: 0, width: 200, height: 200 },
        zoom: expect.any(Number),
        rotation: expect.any(Number),
      }),
    );
  });

  it('rotate button increments rotation by 90 degrees', async () => {
    const user = userEvent.setup();
    const { onCropChange } = renderEditor();

    const rotateBtn = screen.getByRole('button', { name: /rotate/i });
    await user.click(rotateBtn);

    expect(onCropChange).toHaveBeenCalledWith(expect.objectContaining({ rotation: 90 }));
  });

  it('reset button calls onReset', async () => {
    const user = userEvent.setup();
    const { onReset } = renderEditor();

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  describe('File to object URL conversion', () => {
    const mockUrl = 'blob:http://localhost/fake-object-url';
    const createObjectURLSpy = vi.fn(() => mockUrl);
    const revokeObjectURLSpy = vi.fn();

    beforeAll(() => {
      Object.defineProperty(globalThis, 'URL', {
        value: {
          ...URL,
          createObjectURL: createObjectURLSpy,
          revokeObjectURL: revokeObjectURLSpy,
        },
        writable: true,
      });
    });

    afterAll(() => {
      vi.restoreAllMocks();
    });

    it('converts File to object URL', () => {
      const file = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
      const { unmount } = render(
        <ImagePreviewEditor
          aspectRatio={1}
          imageData={file}
          onCropChange={vi.fn()}
          onReset={vi.fn()}
        />,
      );

      expect(createObjectURLSpy).toHaveBeenCalledWith(file);

      // Verify the mock cropper received the blob URL
      const cropper = screen.getByTestId('mock-cropper');
      expect(cropper).toHaveAttribute('data-image', mockUrl);

      unmount();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockUrl);
    });
  });
});
