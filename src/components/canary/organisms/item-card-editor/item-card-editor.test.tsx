import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ItemCardEditor, EMPTY_ITEM_CARD_FIELDS } from './item-card-editor';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';

// Capture the dialog's last props so tests can assert on them and drive the
// confirm/cancel callbacks without rendering the real dialog state machine.
type CapturedDialogProps = {
  open: boolean;
  existingImageUrl: string | null;
  pendingInput: { type: string; file?: File; url?: string; message?: string } | undefined;
  onConfirm: (result: { imageUrl: string }) => void;
  onCancel: () => void;
};

let lastDialogProps: CapturedDialogProps | undefined;

vi.mock('@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog', () => ({
  ImageUploadDialog: (props: CapturedDialogProps) => {
    lastDialogProps = props;
    if (!props.open) return null;
    return (
      <div
        data-testid="image-upload-dialog"
        data-pending-type={props.pendingInput?.type ?? 'none'}
        data-existing-url={props.existingImageUrl ?? 'null'}
      >
        <button
          onClick={() => props.onConfirm({ imageUrl: 'https://cdn.example.com/confirmed.jpg' })}
        >
          dialog-confirm
        </button>
        <button onClick={() => props.onCancel()}>dialog-cancel</button>
      </div>
    );
  },
}));

vi.mock('@/components/canary/molecules/typeahead-input/typeahead-input', () => ({
  TypeaheadInput: () => null,
}));

// Mock ImageDropZone so tests can synthesize file/url/error inputs without
// having to drive the real drag-and-drop / file-input plumbing.
vi.mock('@/components/canary/molecules/image-drop-zone/image-drop-zone', () => ({
  ImageDropZone: ({
    onInput,
  }: {
    onInput: (input: { type: string; file?: File; url?: string; message?: string }) => void;
  }) => (
    <div data-testid="image-drop-zone">
      <button
        onClick={() =>
          onInput({
            type: 'file',
            file: new File(['x'], 'photo.jpg', { type: 'image/jpeg' }),
          })
        }
      >
        drop-file
      </button>
      <button onClick={() => onInput({ type: 'url', url: 'https://example.com/img.jpg' })}>
        drop-url
      </button>
      <button onClick={() => onInput({ type: 'error', message: 'bad' })}>drop-error</button>
    </div>
  ),
}));

const CONFIG: ImageFieldConfig = {
  aspectRatio: 1,
  acceptedFormats: ['image/jpeg', 'image/png'],
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxDimension: 2048,
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
};

function renderEditor(props: Partial<React.ComponentProps<typeof ItemCardEditor>> = {}) {
  return render(
    <ItemCardEditor
      imageConfig={CONFIG}
      unitLookup={async () => []}
      fields={EMPTY_ITEM_CARD_FIELDS}
      onChange={vi.fn()}
      {...props}
    />,
  );
}

describe('ItemCardEditor — QR placeholder (#750 issue 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastDialogProps = undefined;
  });

  it('renders the bundled default QR image when qrCodeUrl prop is not provided', async () => {
    renderEditor();
    const qr = await screen.findByAltText('QR');
    // The default URL should be a bundled asset, NOT the absolute path
    // /images/qr-code.png (which only works in Storybook's dev server).
    // In tests, Vite resolves the import to a file URL or data URL.
    const src = qr.getAttribute('src') ?? '';
    expect(src).not.toBe('/images/qr-code.png');
    expect(src).toBeTruthy();
  });

  it('renders the URL returned by qrCodeUrl callback when provided', async () => {
    const qrCodeUrl = vi.fn().mockResolvedValue('https://qr.example.com/custom.png');
    renderEditor({ qrCodeUrl });
    const qr = await screen.findByAltText('QR');
    await waitFor(() => {
      expect(qr).toHaveAttribute('src', 'https://qr.example.com/custom.png');
    });
    expect(qrCodeUrl).toHaveBeenCalled();
  });

  it('falls back to the bundled default if qrCodeUrl callback rejects', async () => {
    const qrCodeUrl = vi.fn().mockRejectedValue(new Error('lookup failed'));
    renderEditor({ qrCodeUrl });
    const qr = await screen.findByAltText('QR');
    // After the rejection, the src should be the bundled default — not empty,
    // not the failed callback's nonexistent URL, and not the absolute path.
    await waitFor(() => {
      const src = qr.getAttribute('src') ?? '';
      expect(src).not.toBe('/images/qr-code.png');
      expect(src).toBeTruthy();
    });
  });
});

describe('ItemCardEditor — drop-zone uploads directly, no dialog (#750 issue 1 completion)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastDialogProps = undefined;
  });

  it('uploads a dropped file via onUpload and commits the returned CDN URL', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    const onUpload = vi.fn().mockResolvedValue('https://cdn.example.com/uploaded.jpg');
    renderEditor({ onChange, onImageConfirmed, onUpload });

    fireEvent.click(screen.getByText('drop-file'));

    // Upload dialog must NOT be shown for the direct-upload flow.
    expect(screen.queryByTestId('image-upload-dialog')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/uploaded.jpg' }),
      );
      expect(onImageConfirmed).toHaveBeenCalledWith('https://cdn.example.com/uploaded.jpg');
    });
  });

  it('uploads a dropped URL via onUploadFromUrl and commits the returned CDN URL', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    const onUploadFromUrl = vi.fn().mockResolvedValue('https://cdn.example.com/from-url.jpg');
    renderEditor({ onChange, onImageConfirmed, onUploadFromUrl });

    fireEvent.click(screen.getByText('drop-url'));

    expect(screen.queryByTestId('image-upload-dialog')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(onUploadFromUrl).toHaveBeenCalledWith('https://example.com/img.jpg');
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/from-url.jpg' }),
      );
      expect(onImageConfirmed).toHaveBeenCalledWith('https://cdn.example.com/from-url.jpg');
    });
  });

  it('shows a spinner (role=status) while an upload is in flight', async () => {
    const onUpload = vi.fn(
      () => new Promise<string>(() => {}), // never resolves
    );
    renderEditor({ onUpload });

    fireEvent.click(screen.getByText('drop-file'));

    const status = await screen.findByRole('status');
    expect(status).toHaveAttribute('data-slot', 'item-card-editor-uploading');
    expect(status).toHaveTextContent(/uploading image/i);
  });

  it('shows an inline error banner and hides the drop zone on upload failure', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    const onUploadError = vi.fn();
    const onUpload = vi.fn().mockRejectedValue(new Error('quota exceeded'));
    renderEditor({ onChange, onImageConfirmed, onUpload, onUploadError });

    fireEvent.click(screen.getByText('drop-file'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/upload failed: quota exceeded/i);
    expect(screen.queryByTestId('image-drop-zone')).not.toBeInTheDocument();
    expect(onUploadError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'quota exceeded' }),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(onImageConfirmed).not.toHaveBeenCalled();
  });

  it('Try again restores the drop zone so the user can drop another file', async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error('network down'));
    renderEditor({ onUpload });

    fireEvent.click(screen.getByText('drop-file'));
    await screen.findByRole('alert');

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('falls back to the bundled defaultUploadHandler for file drops when onUpload is not supplied (Storybook/dev parity)', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    // No onUpload — component defaults to defaultUploadHandler and commits
    // its mock CDN URL. Storybook play functions rely on this.
    renderEditor({ onChange, onImageConfirmed });

    fireEvent.click(screen.getByText('drop-file'));

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            imageUrl: expect.stringMatching(/^https:\/\/picsum\.photos\//),
          }),
        );
      },
      { timeout: 3000 },
    );
    expect(onImageConfirmed).toHaveBeenCalled();
  });

  it('falls back to defaultUrlUploadHandler for URL drops when onUploadFromUrl is not supplied', async () => {
    const onChange = vi.fn();
    renderEditor({ onChange });

    fireEvent.click(screen.getByText('drop-url'));

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            imageUrl: expect.stringMatching(/^https:\/\/picsum\.photos\//),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it('ignores error inputs from the drop zone (ImageDropZone surfaces them inline itself)', () => {
    const onChange = vi.fn();
    const onUpload = vi.fn();
    renderEditor({ onChange, onUpload });

    fireEvent.click(screen.getByText('drop-error'));

    expect(screen.queryByTestId('image-upload-dialog')).not.toBeInTheDocument();
    expect(onUpload).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('edit-existing flow still opens the dialog (overlay click triggers it)', async () => {
    const onChange = vi.fn();
    renderEditor({
      onChange,
      fields: { ...EMPTY_ITEM_CARD_FIELDS, imageUrl: 'https://cdn.example.com/existing.jpg' },
    });

    fireEvent.click(screen.getByRole('button', { name: /replace image/i }));

    await waitFor(() => {
      expect(screen.getByTestId('image-upload-dialog')).toBeInTheDocument();
    });
    expect(lastDialogProps?.existingImageUrl).toBe('https://cdn.example.com/existing.jpg');
  });
});
