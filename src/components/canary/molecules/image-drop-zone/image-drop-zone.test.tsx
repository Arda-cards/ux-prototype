import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { ImageInput, ImageMimeType } from '@/types/canary/utilities/image-field-config';

// ---- react-dropzone mock -----------------------------------------------
// Use vi.hoisted so the captured callback reference survives vi.mock hoisting.
// This lets tests trigger onDrop directly without fighting jsdom FileList limits.
const { getOnDrop, setOnDrop } = vi.hoisted(() => {
  let _onDrop:
    | ((accepted: File[], rejected: { file: File; errors: { code: string }[] }[]) => void)
    | null = null;
  return {
    getOnDrop: () => _onDrop,
    setOnDrop: (cb: typeof _onDrop) => {
      _onDrop = cb;
    },
  };
});

vi.mock('react-dropzone', () => ({
  useDropzone: ({
    onDrop,
  }: {
    onDrop?: (accepted: File[], rejected: { file: File; errors: { code: string }[] }[]) => void;
  }) => {
    setOnDrop(onDrop ?? null);
    return {
      getRootProps: () => ({ 'data-dropzone': true }),
      getInputProps: () => ({ type: 'file', style: { display: 'none' } }),
      isDragActive: false,
      open: vi.fn(),
    };
  },
}));
// -----------------------------------------------------------------------

// Spy on maybeConvertHeic while keeping its real implementation by default,
// so the conversion-failure test can override it for a single call.
vi.mock('@/types/canary/utilities/maybe-convert-heic', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/types/canary/utilities/maybe-convert-heic')>();
  return {
    ...actual,
    maybeConvertHeic: vi.fn(actual.maybeConvertHeic),
  };
});

import { ImageDropZone } from './image-drop-zone';

const ACCEPTED_FORMATS: ImageMimeType[] = ['image/jpeg', 'image/png', 'image/webp'];

function renderDropZone(
  overrides: Partial<{
    acceptedFormats: ImageMimeType[];
    onInput: Mock<(input: ImageInput) => void>;
  }> = {},
) {
  const onInput = overrides.onInput ?? vi.fn<(input: ImageInput) => void>();
  const acceptedFormats = overrides.acceptedFormats ?? ACCEPTED_FORMATS;

  const result = render(<ImageDropZone acceptedFormats={acceptedFormats} onInput={onInput} />);

  return { ...result, onInput };
}

beforeEach(() => {
  setOnDrop(null);
});

describe('ImageDropZone', () => {
  it('renders drop area with dashed border', () => {
    renderDropZone();
    const dropZone = document.querySelector('[data-slot="image-drop-zone"]');
    expect(dropZone).toBeInTheDocument();
    expect(dropZone).toHaveClass('border-dashed');
  });

  it('renders upload button', () => {
    renderDropZone();
    expect(screen.getByRole('button', { name: /select file/i })).toBeInTheDocument();
  });

  it('renders URL text field', () => {
    renderDropZone();
    expect(screen.getByPlaceholderText(/example\.com\/image/i)).toBeInTheDocument();
  });

  it('calls onInput with file data on file selection', async () => {
    const { onInput } = renderDropZone();
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

    const onDrop = getOnDrop();
    expect(onDrop).toBeDefined();
    await act(async () => {
      onDrop!([file], []);
    });

    await waitFor(() => {
      expect(onInput).toHaveBeenCalledWith({ type: 'file', file });
    });
  });

  it('calls onInput with URL on text submit (Enter key)', async () => {
    const user = userEvent.setup();
    const { onInput } = renderDropZone();
    const urlInput = screen.getByPlaceholderText(/example\.com\/image/i);

    await user.click(urlInput);
    await user.type(urlInput, 'https://example.com/image.jpg');
    await user.keyboard('{Enter}');

    expect(onInput).toHaveBeenCalledWith({
      type: 'url',
      url: 'https://example.com/image.jpg',
    });
  });

  it('defers error for invalid file type to allow URL fallback', async () => {
    const { onInput } = renderDropZone();
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });

    const onDrop = getOnDrop();
    expect(onDrop).toBeDefined();
    await act(async () => {
      onDrop!([], [{ file, errors: [{ code: 'file-invalid-type' }] }]);
    });

    // onDrop no longer emits error directly — it defers to handleDrop
    // so the URL fallback (e.g. Google Images drag) can be attempted first.
    // The error is shown by handleDrop when no URL fallback is available.
    expect(onInput).not.toHaveBeenCalled();
  });

  it('does not render a dismiss button (parent handles dismissal)', () => {
    renderDropZone();
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('shows idle border classes initially (before any drag)', () => {
    renderDropZone();
    const dropZone = document.querySelector('[data-slot="image-drop-zone"]') as HTMLElement;

    // In idle state, the drop zone has border-dashed (not border-primary)
    expect(dropZone).toBeInTheDocument();
    expect(dropZone).toHaveClass('border-dashed');
    expect(dropZone).not.toHaveClass('border-primary');
  });

  it('shows idle border classes when no drag is active', () => {
    renderDropZone();
    const dropZone = document.querySelector('[data-slot="image-drop-zone"]') as HTMLElement;

    // Verify idle state: dashed border without accent background
    expect(dropZone).toHaveClass('border-dashed');
    expect(dropZone).toHaveClass('border-border');
  });

  it('submits valid https:// URL on Enter', async () => {
    const user = userEvent.setup();
    const { onInput } = renderDropZone();
    const urlInput = screen.getByPlaceholderText(/example\.com\/image/i);

    await user.click(urlInput);
    await user.type(urlInput, 'https://example.com/image.jpg');
    await user.keyboard('{Enter}');

    expect(onInput).toHaveBeenCalledWith({
      type: 'url',
      url: 'https://example.com/image.jpg',
    });
  });

  it('shows error and emits error input for non-https URL on Enter', async () => {
    const user = userEvent.setup();
    const { onInput } = renderDropZone();
    const urlInput = screen.getByPlaceholderText(/example\.com\/image/i);

    await user.click(urlInput);
    await user.type(urlInput, 'http://example.com/image.jpg');
    await user.keyboard('{Enter}');

    expect(onInput).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    expect(screen.getByText(/url must start with https:\/\//i)).toBeInTheDocument();
  });

  describe('HEIC intake', () => {
    it('converts a HEIC file with a proper MIME type on drop', async () => {
      const { onInput } = renderDropZone({
        acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
      });
      const file = new File(['heic-bytes'], 'photo.heic', { type: 'image/heic' });

      const onDrop = getOnDrop();
      expect(onDrop).toBeDefined();
      await act(async () => {
        onDrop!([file], []);
      });

      await waitFor(() => {
        expect(onInput).toHaveBeenCalledWith({
          type: 'file',
          file: expect.objectContaining({ type: 'image/jpeg', name: 'photo.jpg' }),
        });
      });
    });

    // Regression test: Windows does not register a MIME type for .heic
    // files, so file.type is '' — the drop path must fall back to the
    // file extension instead of rejecting the file outright.
    it('converts a HEIC file with an empty MIME type on drop (Windows)', async () => {
      const { onInput } = renderDropZone({
        acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
      });
      const file = new File(['heic-bytes'], 'photo.heic', { type: '' });

      const onDrop = getOnDrop();
      expect(onDrop).toBeDefined();
      await act(async () => {
        onDrop!([file], []);
      });

      await waitFor(() => {
        expect(onInput).toHaveBeenCalledWith({
          type: 'file',
          file: expect.objectContaining({ type: 'image/jpeg', name: 'photo.jpg' }),
        });
      });
    });

    it('shows an inline error and emits an error input when conversion fails', async () => {
      const { maybeConvertHeic } = await import('@/types/canary/utilities/maybe-convert-heic');
      vi.mocked(maybeConvertHeic).mockRejectedValueOnce(new Error('conversion failed'));

      const { onInput } = renderDropZone({
        acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
      });
      const file = new File(['heic-bytes'], 'photo.heic', { type: 'image/heic' });

      const onDrop = getOnDrop();
      expect(onDrop).toBeDefined();
      await act(async () => {
        onDrop!([file], []);
      });

      await waitFor(() => {
        expect(onInput).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
      });
      expect(screen.getByText(/failed to process the dropped image/i)).toBeInTheDocument();
    });

    it('passes a non-HEIC file through untouched', async () => {
      const { onInput } = renderDropZone();
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      const onDrop = getOnDrop();
      expect(onDrop).toBeDefined();
      await act(async () => {
        onDrop!([file], []);
      });

      await waitFor(() => {
        expect(onInput).toHaveBeenCalledWith({ type: 'file', file });
      });
    });
  });
});
