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

describe('ItemCardEditor — drop-zone routes through dialog (#750 issue 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastDialogProps = undefined;
  });

  it('opens the upload dialog with the file as pendingInput on file drop', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    renderEditor({ onChange, onImageConfirmed });

    fireEvent.click(screen.getByText('drop-file'));

    await waitFor(() => {
      expect(screen.getByTestId('image-upload-dialog')).toBeInTheDocument();
    });

    // Dialog received the dropped file as pendingInput, did NOT receive the
    // file as existingImageUrl, and the parent's fields.imageUrl was NOT
    // touched yet (no commit until the user confirms in the dialog).
    expect(lastDialogProps?.pendingInput?.type).toBe('file');
    expect(lastDialogProps?.pendingInput?.file).toBeInstanceOf(File);
    expect(lastDialogProps?.existingImageUrl).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(onImageConfirmed).not.toHaveBeenCalled();
  });

  it('opens the upload dialog with the URL as pendingInput on URL drop', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    renderEditor({ onChange, onImageConfirmed });

    fireEvent.click(screen.getByText('drop-url'));

    await waitFor(() => {
      expect(screen.getByTestId('image-upload-dialog')).toBeInTheDocument();
    });

    expect(lastDialogProps?.pendingInput?.type).toBe('url');
    expect(lastDialogProps?.pendingInput?.url).toBe('https://example.com/img.jpg');
    expect(onChange).not.toHaveBeenCalled();
    expect(onImageConfirmed).not.toHaveBeenCalled();
  });

  it('does not open the dialog and ignores error inputs from the drop zone', () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    renderEditor({ onChange, onImageConfirmed });

    fireEvent.click(screen.getByText('drop-error'));

    expect(screen.queryByTestId('image-upload-dialog')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(onImageConfirmed).not.toHaveBeenCalled();
  });

  it('commits imageUrl and fires onImageConfirmed only after dialog confirms', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    renderEditor({ onChange, onImageConfirmed });

    fireEvent.click(screen.getByText('drop-file'));
    await waitFor(() => {
      expect(screen.getByTestId('image-upload-dialog')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('dialog-confirm'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/confirmed.jpg' }),
      );
      expect(onImageConfirmed).toHaveBeenCalledWith('https://cdn.example.com/confirmed.jpg');
    });
  });

  it('does not commit imageUrl when the dialog cancels', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    renderEditor({ onChange, onImageConfirmed });

    fireEvent.click(screen.getByText('drop-file'));
    await waitFor(() => {
      expect(screen.getByTestId('image-upload-dialog')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('dialog-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('image-upload-dialog')).not.toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onImageConfirmed).not.toHaveBeenCalled();
  });
});
