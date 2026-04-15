import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ImageUploadDialog, type ImageUploadDialogProps } from './image-upload-dialog';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';

// --- Mocks ---

vi.mock('@/types/canary/utilities/image-upload-handlers', () => ({
  defaultUploadHandler: vi
    .fn()
    .mockResolvedValue('https://cdn.example.com/images/mock-uploaded.jpg'),
  defaultReachabilityCheck: vi.fn().mockResolvedValue(true),
}));

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
    onDismiss,
  }: {
    onInput: (input: { type: string; file?: File; url?: string; message?: string }) => void;
    onDismiss: () => void;
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
      <button onClick={onDismiss}>dismiss</button>
    </div>
  ),
}));

vi.mock('@/types/canary/utilities/get-cropped-image', () => ({
  getCroppedImage: vi.fn().mockResolvedValue(new Blob(['cropped'], { type: 'image/jpeg' })),
}));

vi.mock('@/types/canary/utilities/cdn-url', () => ({
  isCdnUrl: (src: string) => src.includes('.assets.arda.cards'),
  prefetchImageAsBlob: vi.fn().mockImplementation(async (url: string) => {
    // Simulate prefetch: CDN URLs get converted to blob URLs, others pass through
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

function renderDialog(props: Partial<ImageUploadDialogProps> = {}) {
  return render(<ImageUploadDialog {...defaultProps} {...props} />);
}

// --- Tests ---

describe('ImageUploadDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByTestId('image-drop-zone')).not.toBeInTheDocument();
  });

  it('renders ImageDropZone in EmptyImage state (no existingImageUrl)', () => {
    renderDialog();
    expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
  });

  it('transitions to ProvidedImage on image input (mock file input)', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
    });
  });

  it('shows copyright subtext and enabled Confirm button in ProvidedImage state', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByText(/you acknowledge that you own/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).not.toBeDisabled();
    });
  });

  it('calls onCancel on cancel click (no staged image)', () => {
    const onCancel = vi.fn();
    renderDialog({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows Warn dialog on cancel with staged image', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.getByText('Discard unsaved image?')).toBeInTheDocument();
    });
  });

  it('Warn discard calls onCancel', async () => {
    const onCancel = vi.fn();
    renderDialog({ onCancel });
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.getByText('Discard')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Discard'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('Warn go-back returns to ProvidedImage', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Go Back'));
    await waitFor(() => {
      expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid file', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop error'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid file type');
    });
  });

  it('calls onConfirm with result on confirm (mock the upload)', async () => {
    const { defaultUploadHandler } = await import('@/types/canary/utilities/image-upload-handlers');
    (defaultUploadHandler as ReturnType<typeof vi.fn>).mockResolvedValue(
      'https://cdn.example.com/images/mock-uploaded.jpg',
    );
    const onConfirm = vi.fn();
    renderDialog({ onConfirm });

    fireEvent.click(screen.getByText('drop file'));
    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/images/mock-uploaded.jpg' }),
      );
    });
  });

  it('shows indeterminate indicator during upload (no progress percentage)', async () => {
    // Make onUpload hang so we can inspect the Uploading state
    const { defaultUploadHandler } = await import('@/types/canary/utilities/image-upload-handlers');
    (defaultUploadHandler as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderDialog();

    fireEvent.click(screen.getByText('drop file'));
    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Uploading image\u2026')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  // --- UploadError state tests ---

  describe('UploadError state', () => {
    async function enterUploadError() {
      const { defaultUploadHandler } =
        await import('@/types/canary/utilities/image-upload-handlers');
      (defaultUploadHandler as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network failure'),
      );
      renderDialog();

      fireEvent.click(screen.getByText('drop file'));
      await act(async () => {
        await Promise.resolve();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    }

    it('renders error message on upload failure', async () => {
      await enterUploadError();
      expect(screen.getByRole('alert')).toHaveTextContent('Network failure');
    });

    it('retry transitions back to Uploading', async () => {
      const { defaultUploadHandler } =
        await import('@/types/canary/utilities/image-upload-handlers');
      (defaultUploadHandler as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network failure'),
      );
      // On retry, succeed
      (defaultUploadHandler as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        'https://cdn.example.com/retried.jpg',
      );
      const onConfirm = vi.fn();
      renderDialog({ onConfirm });

      fireEvent.click(screen.getByText('drop file'));
      await act(async () => {
        await Promise.resolve();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Network failure');
      });

      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({ imageUrl: 'https://cdn.example.com/retried.jpg' }),
        );
      });
    });

    it('discard transitions to EmptyImage', async () => {
      await enterUploadError();

      fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

      await waitFor(() => {
        expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
      });
    });
  });

  it('comparison layout shown when existingImageUrl set and new image provided', async () => {
    renderDialog({ existingImageUrl: 'https://example.com/existing.jpg' });
    // When existingImageUrl is set, dialog opens in EditExisting state (no drop zone)
    // To reach ProvidedImage with comparison, click "Upload New Image" first
    fireEvent.click(screen.getByRole('button', { name: 'Upload New Image' }));
    await waitFor(() => {
      expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByTestId('image-comparison-layout')).toBeInTheDocument();
    });
  });

  it('no comparison when existingImageUrl null', async () => {
    renderDialog({ existingImageUrl: null });
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('image-comparison-layout')).not.toBeInTheDocument();
    });
  });

  // --- EditExisting state tests ---

  describe('EditExisting state (existingImageUrl provided)', () => {
    const EXISTING_URL = 'https://example.com/existing.jpg';

    /** Extract the options object passed to getCroppedImage on its first call. */
    async function firstCropCall() {
      const { getCroppedImage } = await import('@/types/canary/utilities/get-cropped-image');
      const mockFn = getCroppedImage as ReturnType<typeof vi.fn>;
      const firstCall = mockFn.mock.calls[0];
      if (!firstCall) throw new Error('getCroppedImage was not called');
      return firstCall[0] as {
        imageSrc: string;
        pixelCrop: { x: number; y: number; width: number; height: number };
        zoom?: number;
        rotation?: number;
      };
    }

    it('opens in EditExisting state when existingImageUrl is provided', () => {
      renderDialog({ existingImageUrl: EXISTING_URL });
      expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('image-drop-zone')).not.toBeInTheDocument();
    });

    it('shows the existing image URL in ImagePreviewEditor', () => {
      renderDialog({ existingImageUrl: EXISTING_URL });
      expect(screen.getByTestId('preview-src')).toHaveTextContent(EXISTING_URL);
    });

    it('does NOT show copyright subtext in EditExisting state', () => {
      renderDialog({ existingImageUrl: EXISTING_URL });
      expect(screen.queryByText(/you acknowledge that you own/i)).not.toBeInTheDocument();
    });

    it('shows "Upload New Image", "Dismiss", and "Accept" buttons in EditExisting state', () => {
      renderDialog({ existingImageUrl: EXISTING_URL });
      expect(screen.getByRole('button', { name: 'Upload New Image' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    });

    it('shows dialog title as "Edit Product Image" in EditExisting state', () => {
      renderDialog({ existingImageUrl: EXISTING_URL });
      expect(screen.getByText('Edit Product Image')).toBeInTheDocument();
    });

    it('"Upload New Image" button transitions to EmptyImage (shows drop zone)', async () => {
      renderDialog({ existingImageUrl: EXISTING_URL });
      fireEvent.click(screen.getByRole('button', { name: 'Upload New Image' }));
      await waitFor(() => {
        expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
        expect(screen.queryByTestId('image-preview-editor')).not.toBeInTheDocument();
      });
    });

    it('"Dismiss" in EditExisting calls onCancel', () => {
      const onCancel = vi.fn();
      renderDialog({ existingImageUrl: EXISTING_URL, onCancel });
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('"Confirm" in EditExisting triggers upload (enters Uploading state)', async () => {
      const { defaultUploadHandler } =
        await import('@/types/canary/utilities/image-upload-handlers');
      (defaultUploadHandler as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
      renderDialog({ existingImageUrl: EXISTING_URL });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('"Accept" without edits confirms with existing URL (skipUpload)', async () => {
      const onConfirm = vi.fn();
      renderDialog({ existingImageUrl: EXISTING_URL, onConfirm });

      // Don't crop/rotate — just accept immediately
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: EXISTING_URL }));
      });
    });

    it('"Accept" after crop uploads cropped blob and returns new URL', async () => {
      const onUpload = vi.fn().mockResolvedValue('https://cdn.example.com/cropped-new.jpg');
      const onConfirm = vi.fn();
      renderDialog({ existingImageUrl: EXISTING_URL, onConfirm, onUpload });

      // Simulate crop edit (non-zero pixelCrop)
      fireEvent.click(screen.getByText('crop'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        await Promise.resolve();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(expect.any(Blob));
        expect(onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({ imageUrl: 'https://cdn.example.com/cropped-new.jpg' }),
        );
      });
    });

    it('"Accept" after rotate-only uploads rotated blob (not skipUpload)', async () => {
      const onUpload = vi.fn().mockResolvedValue('https://cdn.example.com/rotated-new.jpg');
      const onConfirm = vi.fn();
      renderDialog({ existingImageUrl: EXISTING_URL, onConfirm, onUpload });

      // Simulate rotation-only edit (zero pixelCrop, rotation=90)
      fireEvent.click(screen.getByText('rotate'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(expect.any(Blob));
        expect(onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({ imageUrl: 'https://cdn.example.com/rotated-new.jpg' }),
        );
      });
    });

    it('"Accept" after zoom-only uploads zoomed blob (not skipUpload)', async () => {
      const onUpload = vi.fn().mockResolvedValue('https://cdn.example.com/zoomed-new.jpg');
      const onConfirm = vi.fn();
      renderDialog({ existingImageUrl: EXISTING_URL, onConfirm, onUpload });

      // Simulate zoom-only edit (zero pixelCrop, zoom=2)
      fireEvent.click(screen.getByText('zoom'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(expect.any(Blob));
        expect(onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({ imageUrl: 'https://cdn.example.com/zoomed-new.jpg' }),
        );
      });
    });

    it('"Accept" falls back to original URL when getCroppedImage fails', async () => {
      const { getCroppedImage } = await import('@/types/canary/utilities/get-cropped-image');
      (getCroppedImage as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('CORS taint'));
      const onConfirm = vi.fn();
      renderDialog({ existingImageUrl: EXISTING_URL, onConfirm });

      // Simulate crop edit
      fireEvent.click(screen.getByText('crop'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        await Promise.resolve();
        await Promise.resolve();
      });

      await waitFor(() => {
        // Falls back to original URL (skipUpload path)
        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: EXISTING_URL }));
      });
    });

    it('opens in EmptyImage state when existingImageUrl is null', () => {
      renderDialog({ existingImageUrl: null });
      expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
      expect(screen.queryByTestId('image-preview-editor')).not.toBeInTheDocument();
    });

    it('getCroppedImage receives a blob URL (prefetched), not the raw CDN URL', async () => {
      const CDN_URL = 'https://dev.alpha002.assets.arda.cards/tenant/images/uuid.jpg';
      const PREFETCHED_BLOB = 'blob:http://localhost/prefetched-cdn-image';
      const { getCroppedImage } = await import('@/types/canary/utilities/get-cropped-image');
      const onUpload = vi.fn().mockResolvedValue('https://cdn.example.com/cropped.jpg');
      const onConfirm = vi.fn();
      renderDialog({ existingImageUrl: CDN_URL, onConfirm, onUpload });

      // Synchronization: wait for the prefetched blob URL to propagate through
      // ImagePreviewEditor — its mock renders imageData in the preview-src node.
      // Once the preview shows the blob URL, we know the prefetch effect has
      // resolved and setPrefetchedImageUrl has flushed. No arbitrary waits.
      await waitFor(() => {
        expect(screen.getByTestId('preview-src')).toHaveTextContent(PREFETCHED_BLOB);
      });

      // Simulate crop edit
      fireEvent.click(screen.getByText('crop'));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
      });

      await waitFor(() => {
        expect(getCroppedImage).toHaveBeenCalled();
      });

      // getCroppedImage should receive the prefetched blob URL, not the CDN URL
      const opts = await firstCropCall();
      expect(opts.imageSrc).toBe(PREFETCHED_BLOB);
      expect(opts.imageSrc).not.toBe(CDN_URL);
    });

    // Issue 5a + 5b: zoom ignored in getCroppedImage; zoom/rotation-only
    // handlers overwrite pixelCrop with zero-sized values.
    it('5a: getCroppedImage receives the zoom value on zoom-only edit', async () => {
      const { getCroppedImage } = await import('@/types/canary/utilities/get-cropped-image');
      const EXISTING_URL = 'https://example.com/existing.jpg';
      renderDialog({
        existingImageUrl: EXISTING_URL,
        onConfirm: vi.fn(),
        onUpload: vi.fn().mockResolvedValue('x'),
      });

      fireEvent.click(screen.getByText('zoom'));
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
      });
      await waitFor(() => expect(getCroppedImage).toHaveBeenCalled());

      const opts = await firstCropCall();
      expect(opts.zoom).toBe(2);
    });

    it('5b: crop + rotate preserves pixelCrop (rotate does not overwrite crop)', async () => {
      const { getCroppedImage } = await import('@/types/canary/utilities/get-cropped-image');
      const EXISTING_URL = 'https://example.com/existing.jpg';
      renderDialog({
        existingImageUrl: EXISTING_URL,
        onConfirm: vi.fn(),
        onUpload: vi.fn().mockResolvedValue('x'),
      });

      // User drags crop area (sets non-zero pixelCrop), then rotates
      fireEvent.click(screen.getByText('crop'));
      fireEvent.click(screen.getByText('rotate'));
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
      });
      await waitFor(() => expect(getCroppedImage).toHaveBeenCalled());

      const opts = await firstCropCall();
      // pixelCrop preserved from the crop click; rotation captured from the rotate click
      expect(opts.pixelCrop.width).toBeGreaterThan(0);
      expect(opts.pixelCrop.height).toBeGreaterThan(0);
      expect(opts.rotation).toBe(90);
    });
  });

  // --- pendingInput entry point (#750 issue 1) -----------------------------
  //
  // Drop-zone inputs delivered by a parent component (e.g. ItemCardEditor)
  // should land in the same ProvidedImage / FailedValidation / Loading flow
  // as inputs from the dialog's own ImageDropZone.

  describe('pendingInput entry point', () => {
    it('dispatches a File pendingInput into ProvidedImage when opened', async () => {
      const file = new File(['x'], 'pending.jpg', { type: 'image/jpeg' });
      renderDialog({
        open: true,
        pendingInput: { type: 'file', file },
      });

      await waitFor(() => {
        expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
      });
      // The ImagePreviewEditor mock prints "file-blob" when imageData is a Blob/File.
      expect(screen.getByTestId('preview-src')).toHaveTextContent('file-blob');
    });

    it('dispatches a URL pendingInput through reachability check into ProvidedImage', async () => {
      renderDialog({
        open: true,
        pendingInput: { type: 'url', url: 'https://images.example.com/p.jpg' },
      });

      await waitFor(() => {
        expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
      });
      expect(screen.getByTestId('preview-src')).toHaveTextContent(
        'https://images.example.com/p.jpg',
      );
    });

    it('routes pendingInput error through the FailedValidation phase', async () => {
      renderDialog({
        open: true,
        pendingInput: { type: 'error', message: 'File too large' },
      });
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('File too large');
      });
    });

    it('does not re-dispatch the same pendingInput on parent re-render', async () => {
      const file = new File(['x'], 'pending.jpg', { type: 'image/jpeg' });
      const pendingInput = { type: 'file' as const, file };

      const { rerender } = render(
        <ImageUploadDialog {...defaultProps} open={true} pendingInput={pendingInput} />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
      });

      // User starts cropping and clicks Cancel — moves to Warn state.
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => {
        expect(screen.getByText('Discard unsaved image?')).toBeInTheDocument();
      });

      // Parent re-renders with the SAME pendingInput reference. The dialog
      // must not jump back into ProvidedImage — that would clobber the Warn
      // dialog and silently drop the user's pending decision.
      rerender(<ImageUploadDialog {...defaultProps} open={true} pendingInput={pendingInput} />);

      expect(screen.getByText('Discard unsaved image?')).toBeInTheDocument();
    });

    it('re-enters ProvidedImage when pendingInput identity changes', async () => {
      const fileA = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
      const fileB = new File(['b'], 'b.jpg', { type: 'image/jpeg' });

      const { rerender } = render(
        <ImageUploadDialog
          {...defaultProps}
          open={true}
          pendingInput={{ type: 'file', file: fileA }}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
      });

      rerender(
        <ImageUploadDialog
          {...defaultProps}
          open={true}
          pendingInput={{ type: 'file', file: fileB }}
        />,
      );

      // Still in ProvidedImage, now with the new file.
      await waitFor(() => {
        expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
      });
    });

    it('clears pendingInput state when open transitions to false', async () => {
      const file = new File(['x'], 'pending.jpg', { type: 'image/jpeg' });
      const { rerender } = render(
        <ImageUploadDialog {...defaultProps} open={true} pendingInput={{ type: 'file', file }} />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('image-preview-editor')).toBeInTheDocument();
      });

      // Close, then reopen with NO pendingInput — should land in EmptyImage,
      // not retain the previous file.
      rerender(<ImageUploadDialog {...defaultProps} open={false} />);
      rerender(<ImageUploadDialog {...defaultProps} open={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('image-preview-editor')).not.toBeInTheDocument();
    });
  });
});
