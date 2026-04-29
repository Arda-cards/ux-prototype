import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';

import { ImageUploadDialog, type ImageUploadDialogProps } from './image-upload-dialog';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';
import {
  ImageUploadProvider,
  defaultImageUploader,
  type ImageUploader,
} from '@/types/canary/utilities/image-uploader';

// --- Mocks ---

vi.mock('@/components/canary/molecules/image-preview-editor/image-preview-editor', () => ({
  ImagePreviewEditor: ({
    imageData,
    onCropComplete,
    onZoomChange,
    onRotationChange,
    onReset,
  }: {
    imageData: File | Blob | string;
    onCropComplete: (pc: { x: number; y: number; width: number; height: number }) => void;
    onZoomChange: (z: number) => void;
    onRotationChange: (r: number) => void;
    onReset: () => void;
  }) => (
    <div data-testid="image-preview-editor">
      <span data-testid="preview-src">
        {typeof imageData === 'string' ? imageData : 'file-blob'}
      </span>
      <button onClick={() => onCropComplete({ x: 0, y: 0, width: 100, height: 100 })}>crop</button>
      <button onClick={() => onRotationChange(90)}>rotate</button>
      <button onClick={() => onZoomChange(2)}>zoom</button>
      <button onClick={onReset}>reset</button>
    </div>
  ),
}));

vi.mock('@/components/canary/molecules/image-comparison-layout/image-comparison-layout', () => ({
  ImageComparisonLayout: ({
    existingImageUrl,
    children,
    onAccept,
    onDismiss,
    onUploadNew,
  }: {
    existingImageUrl: string | null;
    children: React.ReactNode;
    onAccept?: () => void;
    onDismiss?: () => void;
    onUploadNew?: () => void;
  }) => (
    <div data-testid="image-comparison-layout" data-existing-url={existingImageUrl ?? ''}>
      {children}
      {onAccept && <button onClick={onAccept}>Accept</button>}
      {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
      {onUploadNew && <button onClick={onUploadNew}>Upload New Image</button>}
    </div>
  ),
}));

vi.mock('@/components/canary/molecules/image-drop-zone/image-drop-zone', () => ({
  ImageDropZone: ({
    onInput,
  }: {
    onInput: (input: { type: string; file?: File; url?: string; message?: string }) => void;
  }) => (
    <div data-testid="image-drop-zone">
      <button
        onClick={() =>
          onInput({ type: 'file', file: new File(['content'], 'test.jpg', { type: 'image/jpeg' }) })
        }
      >
        drop file
      </button>
      <button onClick={() => onInput({ type: 'url', url: 'https://example.com/image.jpg' })}>
        drop url
      </button>
      <button onClick={() => onInput({ type: 'error', message: 'Invalid file type' })}>
        drop error
      </button>
    </div>
  ),
}));

vi.mock('@/types/canary/utilities/get-cropped-image', () => ({
  getCroppedImage: vi.fn().mockResolvedValue(new Blob(['cropped'], { type: 'image/jpeg' })),
}));

vi.mock('@/types/canary/utilities/cdn-url', () => ({
  isCdnUrl: (src: string) => src.includes('.assets.arda.cards'),
  prefetchImageAsBlob: vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('.assets.arda.cards')) {
      return 'blob:http://localhost/prefetched-cdn-image';
    }
    return url;
  }),
}));

// --- Test config ---

const CONFIG: ImageFieldConfig = {
  aspectRatio: 1,
  acceptedFormats: ['image/jpeg', 'image/png'],
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxDimension: 2048,
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
};

const defaultProps: ImageUploadDialogProps = {
  config: CONFIG,
  existingImageUrl: null,
  onConfirm: vi.fn(),
  open: true,
  onCancel: vi.fn(),
};

// --- Helpers ---

// `Mocked<T>` from vitest preserves `T`'s function signatures while adding
// `.mockResolvedValue` / `.mockClear` / `.mock.calls` surface. Structural
// subtype of `ImageUploader` — passes through `ImageUploadProvider value=...`
// with no cast required.
//
// Tests that want non-default behavior use `.mockResolvedValue(...)` /
// `.mockRejectedValue(...)` on the returned object directly; we intentionally
// don't take a `Partial<ImageUploader>` override here because mixing plain
// functions and MockInstance members defeats the Mocked<T> typing.
type MockUploader = Mocked<ImageUploader>;

function makeMockUploader(): MockUploader {
  return {
    uploadFile: vi.fn(async (_file: Blob) => 'https://cdn.example.com/images/mock-uploaded.jpg'),
    uploadFromUrl: vi.fn(
      async (_url: string) => 'https://cdn.example.com/images/mock-from-url.jpg',
    ),
    checkReachability: vi.fn(async (_url: string) => true),
  };
}

function renderDialog(
  props: Partial<ImageUploadDialogProps> = {},
  uploader: ImageUploader = makeMockUploader(),
) {
  return render(
    <ImageUploadProvider value={uploader}>
      <ImageUploadDialog {...defaultProps} {...props} />
    </ImageUploadProvider>,
  );
}

// --- Tests ---

describe('ImageUploadDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering / basic phases ---------------------------------------------

  it('renders nothing when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByTestId('image-drop-zone')).not.toBeInTheDocument();
  });

  it('renders ImageDropZone in EmptyImage state (no existingImageUrl)', () => {
    renderDialog();
    expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
  });

  it('opens in EditExisting state when existingImageUrl is set', () => {
    renderDialog({ existingImageUrl: 'https://cdn.example.com/existing.jpg' });
    expect(screen.getByTestId('image-comparison-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('image-drop-zone')).not.toBeInTheDocument();
  });

  // --- New-upload flow (file) ------------------------------------------------

  it('file drop goes directly to Uploading (no cropper stop — rapid-batch UX)', async () => {
    const uploader = makeMockUploader();
    renderDialog({}, uploader);

    fireEvent.click(screen.getByText('drop file'));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    // Cropper is NOT shown on the new-upload path.
    expect(screen.queryByTestId('image-preview-editor')).not.toBeInTheDocument();
    expect(uploader.uploadFile).toHaveBeenCalledTimes(1);
  });

  it('Uploading success calls onConfirm with the returned CDN URL', async () => {
    const uploader = makeMockUploader();
    uploader.uploadFile.mockResolvedValue('https://cdn.example.com/uploaded.jpg');
    const onConfirm = vi.fn();
    renderDialog({ onConfirm }, uploader);

    fireEvent.click(screen.getByText('drop file'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/uploaded.jpg' }),
      );
    });
  });

  it('Uploading failure transitions to UploadError with Retry + Discard', async () => {
    const uploader = makeMockUploader();
    uploader.uploadFile.mockRejectedValue(new Error('Network failure'));
    renderDialog({}, uploader);

    fireEvent.click(screen.getByText('drop file'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network failure');
    });
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('UploadError Retry re-enters Uploading', async () => {
    const uploader = makeMockUploader();
    uploader.uploadFile
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValueOnce('https://cdn.example.com/second-try.jpg');
    const onConfirm = vi.fn();
    renderDialog({ onConfirm }, uploader);

    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/second-try.jpg' }),
      );
    });
  });

  it('UploadError Discard returns to EmptyImage', async () => {
    const uploader = makeMockUploader();
    uploader.uploadFile.mockRejectedValue(new Error('fail'));
    renderDialog({}, uploader);

    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

    await waitFor(() => {
      expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
    });
  });

  // --- New-upload flow (URL) -------------------------------------------------

  it('URL drop: reachability passes → Uploading via uploadFromUrl (no cropper)', async () => {
    const uploader = makeMockUploader();
    uploader.uploadFromUrl.mockResolvedValue('https://cdn.example.com/from-url.jpg');
    const onConfirm = vi.fn();
    renderDialog({ onConfirm }, uploader);

    fireEvent.click(screen.getByText('drop url'));

    await waitFor(() => {
      expect(uploader.checkReachability).toHaveBeenCalledWith('https://example.com/image.jpg');
      expect(uploader.uploadFromUrl).toHaveBeenCalledWith('https://example.com/image.jpg');
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/from-url.jpg' }),
      );
    });
    expect(screen.queryByTestId('image-preview-editor')).not.toBeInTheDocument();
    expect(uploader.uploadFile).not.toHaveBeenCalled();
  });

  it('URL drop: reachability fails → FailedValidation', async () => {
    const uploader = makeMockUploader();
    uploader.checkReachability.mockResolvedValue(false);
    renderDialog({}, uploader);

    fireEvent.click(screen.getByText('drop url'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/URL could not be reached/i);
    });
    expect(uploader.uploadFromUrl).not.toHaveBeenCalled();
  });

  // --- Invalid input ---------------------------------------------------------

  it('invalid file (error input) → FailedValidation', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop error'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid file type');
    });
  });

  // --- EditExisting flow -----------------------------------------------------

  describe('EditExisting', () => {
    const EXISTING = 'https://images.assets.arda.cards/items/existing.jpg';

    it('"Upload New Image" transitions EditExisting → EmptyImage (drop zone)', async () => {
      renderDialog({ existingImageUrl: EXISTING });
      fireEvent.click(screen.getByRole('button', { name: 'Upload New Image' }));
      await waitFor(() => {
        expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
      });
    });

    it('"Dismiss" calls onCancel', () => {
      const onCancel = vi.fn();
      renderDialog({ existingImageUrl: EXISTING, onCancel });
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('"Accept" without edits confirms with existing URL (skipUpload)', async () => {
      const uploader = makeMockUploader();
      const onConfirm = vi.fn();
      renderDialog({ existingImageUrl: EXISTING, onConfirm }, uploader);
      fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: EXISTING }));
      });
      expect(uploader.uploadFile).not.toHaveBeenCalled();
    });

    it('"Accept" after crop uploads cropped blob and returns the new URL', async () => {
      const uploader = makeMockUploader();
      uploader.uploadFile.mockResolvedValue('https://cdn.example.com/cropped.jpg');
      const onConfirm = vi.fn();
      renderDialog({ existingImageUrl: EXISTING, onConfirm }, uploader);

      // Record a non-zero crop.
      fireEvent.click(screen.getByText('crop'));
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
      });

      await waitFor(() => {
        expect(uploader.uploadFile).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({ imageUrl: 'https://cdn.example.com/cropped.jpg' }),
        );
      });
    });

    it('renders ImagePreviewEditor inside the comparison layout', () => {
      renderDialog({ existingImageUrl: EXISTING });
      expect(screen.getByTestId('image-comparison-layout')).toBeInTheDocument();
      expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
    });
  });

  // --- pendingInput entry point ---------------------------------------------

  describe('pendingInput', () => {
    it('file pendingInput goes straight to Uploading (same as internal drop)', async () => {
      const uploader = makeMockUploader();
      const file = new File(['x'], 'pending.jpg', { type: 'image/jpeg' });
      renderDialog({ open: true, pendingInput: { type: 'file', file } }, uploader);

      await waitFor(() => {
        expect(uploader.uploadFile).toHaveBeenCalledTimes(1);
      });
      // No cropper on the way.
      expect(screen.queryByTestId('image-preview-editor')).not.toBeInTheDocument();
    });

    it('URL pendingInput goes through reachability → Uploading via uploadFromUrl', async () => {
      const uploader = makeMockUploader();
      renderDialog(
        {
          open: true,
          pendingInput: { type: 'url', url: 'https://images.example.com/p.jpg' },
        },
        uploader,
      );

      await waitFor(() => {
        expect(uploader.checkReachability).toHaveBeenCalledWith('https://images.example.com/p.jpg');
        expect(uploader.uploadFromUrl).toHaveBeenCalledWith('https://images.example.com/p.jpg');
      });
    });

    it('error pendingInput lands in FailedValidation', async () => {
      renderDialog({
        open: true,
        pendingInput: { type: 'error', message: 'File too large' },
      });
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('File too large');
      });
    });

    it('same pendingInput identity on re-render does not re-dispatch', async () => {
      const uploader = makeMockUploader();
      const file = new File(['x'], 'pending.jpg', { type: 'image/jpeg' });
      const pendingInput = { type: 'file' as const, file };

      const { rerender } = render(
        <ImageUploadProvider value={uploader}>
          <ImageUploadDialog {...defaultProps} open={true} pendingInput={pendingInput} />
        </ImageUploadProvider>,
      );
      await waitFor(() => {
        expect(uploader.uploadFile).toHaveBeenCalledTimes(1);
      });

      // Re-render with the SAME pendingInput object.
      rerender(
        <ImageUploadProvider value={uploader}>
          <ImageUploadDialog {...defaultProps} open={true} pendingInput={pendingInput} />
        </ImageUploadProvider>,
      );
      // Still just one call — no re-dispatch.
      expect(uploader.uploadFile).toHaveBeenCalledTimes(1);
    });

    it('open=false clears pending dispatch, so next open with no pendingInput lands in EmptyImage', async () => {
      const uploader = makeMockUploader();
      const file = new File(['x'], 'pending.jpg', { type: 'image/jpeg' });
      const { rerender } = render(
        <ImageUploadProvider value={uploader}>
          <ImageUploadDialog {...defaultProps} open={true} pendingInput={{ type: 'file', file }} />
        </ImageUploadProvider>,
      );
      await waitFor(() => {
        expect(uploader.uploadFile).toHaveBeenCalledTimes(1);
      });

      // Close, then reopen with no pendingInput.
      rerender(
        <ImageUploadProvider value={uploader}>
          <ImageUploadDialog {...defaultProps} open={false} />
        </ImageUploadProvider>,
      );
      rerender(
        <ImageUploadProvider value={uploader}>
          <ImageUploadDialog {...defaultProps} open={true} />
        </ImageUploadProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
      });
    });

    it('opening with BOTH existingImageUrl and pendingInput skips the EditExisting CDN prefetch', async () => {
      const uploader = makeMockUploader();
      const { prefetchImageAsBlob } = await import('@/types/canary/utilities/cdn-url');
      (prefetchImageAsBlob as ReturnType<typeof vi.fn>).mockClear();

      const file = new File(['x'], 'pending.jpg', { type: 'image/jpeg' });
      renderDialog(
        {
          open: true,
          existingImageUrl: 'https://images.assets.arda.cards/items/abc.jpg',
          pendingInput: { type: 'file', file },
        },
        uploader,
      );

      await waitFor(() => {
        expect(uploader.uploadFile).toHaveBeenCalledTimes(1);
      });
      expect(prefetchImageAsBlob).not.toHaveBeenCalled();
    });
  });

  // --- ImageUploader Context -------------------------------------------------

  describe('ImageUploader Context', () => {
    it('uses the default stub uploader when no provider is mounted', async () => {
      // Intentionally bypass renderDialog helper to omit the provider.
      const onConfirm = vi.fn();
      render(<ImageUploadDialog {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByText('drop file'));
      // defaultImageUploader.uploadFile returns a picsum URL after a 1.5s delay;
      // allow waitFor enough time.
      await waitFor(
        () => {
          expect(onConfirm).toHaveBeenCalledWith(
            expect.objectContaining({
              imageUrl: expect.stringMatching(/picsum\.photos/),
            }),
          );
        },
        { timeout: 3000 },
      );
    });

    it('respects a provider-supplied uploader over the default', async () => {
      const uploader = makeMockUploader();
      uploader.uploadFile.mockResolvedValue('https://cdn.provider.arda.cards/uploaded.jpg');
      const onConfirm = vi.fn();
      renderDialog({ onConfirm }, uploader);

      fireEvent.click(screen.getByText('drop file'));
      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({ imageUrl: 'https://cdn.provider.arda.cards/uploaded.jpg' }),
        );
      });
    });

    it('defaultImageUploader is exported and callable (stories/dev safety)', async () => {
      // Regression guard — if this export goes away, Storybook play functions
      // that depend on the stub break in hard-to-diagnose ways.
      expect(defaultImageUploader).toBeDefined();
      expect(typeof defaultImageUploader.uploadFile).toBe('function');
      expect(typeof defaultImageUploader.uploadFromUrl).toBe('function');
      expect(typeof defaultImageUploader.checkReachability).toBe('function');
    });
  });
});
