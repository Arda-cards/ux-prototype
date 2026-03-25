import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { ImageMimeType } from '@/types/canary/utilities/image-field-config';

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

import { ImageDropZone } from './image-drop-zone';

const ACCEPTED_FORMATS: ImageMimeType[] = ['image/jpeg', 'image/png', 'image/webp'];

function renderDropZone(
  overrides: Partial<{
    acceptedFormats: ImageMimeType[];
    onInput: ReturnType<typeof vi.fn>;
    onDismiss: ReturnType<typeof vi.fn>;
  }> = {},
) {
  const onInput = overrides.onInput ?? vi.fn();
  const onDismiss = overrides.onDismiss ?? vi.fn();
  const acceptedFormats = overrides.acceptedFormats ?? ACCEPTED_FORMATS;

  const result = render(
    <ImageDropZone acceptedFormats={acceptedFormats} onInput={onInput} onDismiss={onDismiss} />,
  );

  return { ...result, onInput, onDismiss };
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
    expect(screen.getByRole('button', { name: /upload from computer/i })).toBeInTheDocument();
  });

  it('renders URL text field', () => {
    renderDropZone();
    expect(screen.getByPlaceholderText(/or paste an image url/i)).toBeInTheDocument();
  });

  it('calls onInput with file data on file selection', async () => {
    const { onInput } = renderDropZone();
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

    const onDrop = getOnDrop();
    expect(onDrop).toBeDefined();
    await act(async () => {
      onDrop!([file], []);
    });

    expect(onInput).toHaveBeenCalledWith({ type: 'file', file });
  });

  it('calls onInput with URL on text submit (Enter key)', async () => {
    const user = userEvent.setup();
    const { onInput } = renderDropZone();
    const urlInput = screen.getByPlaceholderText(/or paste an image url/i);

    await user.click(urlInput);
    await user.type(urlInput, 'https://example.com/image.jpg');
    await user.keyboard('{Enter}');

    expect(onInput).toHaveBeenCalledWith({
      type: 'url',
      url: 'https://example.com/image.jpg',
    });
  });

  it('shows error for invalid file type', async () => {
    const { onInput } = renderDropZone();
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });

    const onDrop = getOnDrop();
    expect(onDrop).toBeDefined();
    await act(async () => {
      onDrop!([], [{ file, errors: [{ code: 'file-invalid-type' }] }]);
    });

    expect(onInput).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
  });

  it('calls onDismiss on dismiss click', async () => {
    const user = userEvent.setup();
    const { onDismiss } = renderDropZone();

    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
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

  it('rejects non-HTTPS URL and shows error message', async () => {
    const user = userEvent.setup();
    const { onInput } = renderDropZone();
    const urlInput = screen.getByPlaceholderText(/or paste an image url/i);

    await user.click(urlInput);
    await user.type(urlInput, 'http://example.com/image.jpg');
    await user.keyboard('{Enter}');

    expect(onInput).toHaveBeenCalledWith({
      type: 'error',
      message: 'URL must start with https://',
    });

    expect(screen.getByRole('alert')).toHaveTextContent('URL must start with https://');
  });
});
