import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, afterAll, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { CropData } from '@/types/canary/utilities/image-field-config';

type PixelCrop = CropData['pixelCrop'];

// Mock react-easy-crop so tests do not rely on its internal DOM structure
vi.mock('react-easy-crop', () => ({
  default: ({
    onCropComplete,
    onZoomChange,
    image,
    mediaProps,
  }: {
    onCropComplete?: (croppedArea: unknown, croppedAreaPixels: unknown) => void;
    onZoomChange?: (zoom: number) => void;
    image?: string;
    mediaProps?: Record<string, string>;
  }) => (
    <div
      data-testid="mock-cropper"
      data-image={image}
      data-cross-origin={mediaProps?.crossOrigin ?? ''}
      onClick={() =>
        onCropComplete?.(
          { x: 0, y: 0, width: 100, height: 100 },
          { x: 0, y: 0, width: 200, height: 200 },
        )
      }
    >
      <button
        type="button"
        data-testid="mock-cropper-gesture-zoom"
        onClick={(e) => {
          e.stopPropagation();
          onZoomChange?.(1.75);
        }}
      >
        gesture-zoom
      </button>
    </div>
  ),
}));

import { ImagePreviewEditor } from './image-preview-editor';

const MOCK_URL = 'https://picsum.photos/seed/test/400/400';

function renderEditor(
  overrides: Partial<{
    aspectRatio: number;
    imageData: File | Blob | string;
    onCropComplete: Mock<(pc: PixelCrop) => void>;
    onZoomChange: Mock<(z: number) => void>;
    onRotationChange: Mock<(r: number) => void>;
    onReset: Mock<() => void>;
  }> = {},
) {
  const onCropComplete = overrides.onCropComplete ?? vi.fn<(pc: PixelCrop) => void>();
  const onZoomChange = overrides.onZoomChange ?? vi.fn<(z: number) => void>();
  const onRotationChange = overrides.onRotationChange ?? vi.fn<(r: number) => void>();
  const onReset = overrides.onReset ?? vi.fn<() => void>();
  const aspectRatio = overrides.aspectRatio ?? 1;
  const imageData = overrides.imageData ?? MOCK_URL;

  const result = render(
    <ImagePreviewEditor
      aspectRatio={aspectRatio}
      imageData={imageData}
      onCropComplete={onCropComplete}
      onZoomChange={onZoomChange}
      onRotationChange={onRotationChange}
      onReset={onReset}
    />,
  );

  return { ...result, onCropComplete, onZoomChange, onRotationChange, onReset };
}

describe('ImagePreviewEditor', () => {
  it('renders crop area (Cropper container element)', () => {
    renderEditor();
    expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
  });

  it('renders toolbar with zoom slider, rotate buttons, and reset button', async () => {
    renderEditor();
    // The Radix Slider thumb renders with role="slider" but starts with display:none until the
    // collection index is resolved in a second render pass. Use findByRole to wait for visibility.
    expect(await screen.findByRole('slider')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^rotate 90 degrees clockwise$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /counter-clockwise/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls onCropComplete when Cropper fires its onCropComplete', () => {
    const { onCropComplete } = renderEditor();
    fireEvent.click(screen.getByTestId('mock-cropper'));
    expect(onCropComplete).toHaveBeenCalledWith({ x: 0, y: 0, width: 200, height: 200 });
  });

  it('clockwise rotate button calls onRotationChange with +90 (5b: independent of crop)', async () => {
    const user = userEvent.setup();
    const { onRotationChange, onCropComplete } = renderEditor();

    await user.click(screen.getByRole('button', { name: /^rotate 90 degrees clockwise$/i }));
    expect(onRotationChange).toHaveBeenCalledWith(90);
    // Rotate must NOT fire onCropComplete (would clobber the last valid crop)
    expect(onCropComplete).not.toHaveBeenCalled();
  });

  it('counter-clockwise rotate button calls onRotationChange with 270 (5b: independent of crop)', async () => {
    const user = userEvent.setup();
    const { onRotationChange, onCropComplete } = renderEditor();

    await user.click(screen.getByRole('button', { name: /counter-clockwise/i }));
    expect(onRotationChange).toHaveBeenCalledWith(270);
    expect(onCropComplete).not.toHaveBeenCalled();
  });

  it('reset button calls onReset', async () => {
    const user = userEvent.setup();
    const { onReset } = renderEditor();

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('forwards Cropper-driven zoom (wheel/pinch gesture) through onZoomChange prop', async () => {
    // Without the wrapper around Cropper.onZoomChange, gesture-driven zoom
    // updates only local state and never the prop, so callers (e.g.
    // ImageUploadDialog) see a stale zoom on accept (#750 PR-96 review).
    const user = userEvent.setup();
    const { onZoomChange } = renderEditor();
    await user.click(screen.getByTestId('mock-cropper-gesture-zoom'));
    expect(onZoomChange).toHaveBeenCalledWith(1.75);
  });

  describe('crossOrigin for CDN URLs (FD-17)', () => {
    it('sets crossOrigin="use-credentials" for CDN URLs', () => {
      renderEditor({ imageData: 'https://dev.alpha002.assets.arda.cards/images/item/123.jpg' });
      const cropper = screen.getByTestId('mock-cropper');
      expect(cropper).toHaveAttribute('data-cross-origin', 'use-credentials');
    });

    it('does not set crossOrigin for non-CDN URLs', () => {
      renderEditor({ imageData: 'https://picsum.photos/seed/test/400/400' });
      const cropper = screen.getByTestId('mock-cropper');
      expect(cropper).toHaveAttribute('data-cross-origin', '');
    });

    it('does not set crossOrigin for blob URLs', () => {
      renderEditor({ imageData: 'blob:http://localhost/fake-uuid' });
      const cropper = screen.getByTestId('mock-cropper');
      expect(cropper).toHaveAttribute('data-cross-origin', '');
    });
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
          onCropComplete={vi.fn()}
          onZoomChange={vi.fn()}
          onRotationChange={vi.fn()}
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

    it('does not call createObjectURL when imageData is not a Blob (FD-19 defensive guard)', () => {
      // Regression guard: at runtime imageData may be null/undefined
      // under unusual lifecycle paths (transient mount, parent state
      // not yet settled). Calling URL.createObjectURL with such a value
      // throws "Overload resolution failed" and crashes the tree. The
      // guard converts that case to a safe no-op — imageSrc stays empty,
      // so the Cropper is not rendered and no exception escapes.
      createObjectURLSpy.mockClear();
      const { container, unmount } = render(
        <ImagePreviewEditor
          aspectRatio={1}
          imageData={null as unknown as File}
          onCropComplete={vi.fn()}
          onZoomChange={vi.fn()}
          onRotationChange={vi.fn()}
          onReset={vi.fn()}
        />,
      );
      expect(createObjectURLSpy).not.toHaveBeenCalled();
      // Cropper must not render when imageSrc is empty (avoids passing
      // an empty src to react-easy-crop, which would itself error).
      expect(container.querySelector('[data-testid="mock-cropper"]')).toBeNull();
      // Toolbar still renders so the component remains in the React
      // tree without crashing.
      expect(container.querySelector('[data-slot="image-preview-editor"]')).toBeInTheDocument();
      unmount();
    });

    it('does not call createObjectURL when imageData is undefined (FD-19 defensive guard)', () => {
      createObjectURLSpy.mockClear();
      const { container, unmount } = render(
        <ImagePreviewEditor
          aspectRatio={1}
          imageData={undefined as unknown as File}
          onCropComplete={vi.fn()}
          onZoomChange={vi.fn()}
          onRotationChange={vi.fn()}
          onReset={vi.fn()}
        />,
      );
      expect(createObjectURLSpy).not.toHaveBeenCalled();
      expect(container.querySelector('[data-testid="mock-cropper"]')).toBeNull();
      unmount();
    });
  });
});
