import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ItemCardEditor, EMPTY_ITEM_CARD_FIELDS } from './item-card-editor';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';
import { ImageUploadProvider, type ImageUploader } from '@/types/canary/utilities/image-uploader';

// Capture the dialog's last props so tests can assert on them and drive the
// confirm/cancel callbacks without rendering the real dialog state machine.
type CapturedDialogProps = {
  open: boolean;
  existingImageUrl: string | null;
  onConfirm: (result: { imageUrl: string }) => void;
  onCancel: () => void;
};

let lastDialogProps: CapturedDialogProps | undefined;

vi.mock('@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog', () => ({
  ImageUploadDialog: (props: CapturedDialogProps) => {
    lastDialogProps = props;
    if (!props.open) return null;
    return (
      <div data-testid="image-upload-dialog" data-existing-url={props.existingImageUrl ?? 'null'}>
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
  TypeaheadInput: ({
    value,
    onValueChange,
    placeholder,
  }: {
    value: string;
    onValueChange: (val: string) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="typeahead-input"
      aria-label={placeholder}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    />
  ),
}));

// Mock ImageDropZone so tests can synthesize file/url/error inputs without
// driving the real drag-and-drop / file-input plumbing.
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

// --- Uploader helpers ------------------------------------------------------

// `Mocked<T>` from vitest preserves the ImageUploader signatures while
// adding the .mockResolvedValue / .mock.calls surface. Tests that want
// non-default behavior do `uploader.uploadFile.mockResolvedValue(...)`
// on the returned object.
type MockUploader = Mocked<ImageUploader>;

function makeUploader(): MockUploader {
  return {
    uploadFile: vi.fn(async (_file: Blob) => 'https://cdn.example.com/uploaded.jpg'),
    uploadFromUrl: vi.fn(async (_url: string) => 'https://cdn.example.com/from-url.jpg'),
    checkReachability: vi.fn(async (_url: string) => true),
  };
}

function renderEditor(
  props: Partial<React.ComponentProps<typeof ItemCardEditor>> = {},
  uploader?: ImageUploader,
) {
  const wrapped = (
    <ItemCardEditor
      imageConfig={CONFIG}
      unitLookup={async () => []}
      fields={EMPTY_ITEM_CARD_FIELDS}
      onChange={vi.fn()}
      {...props}
    />
  );
  return render(
    uploader ? <ImageUploadProvider value={uploader}>{wrapped}</ImageUploadProvider> : wrapped,
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
    await waitFor(() => {
      const src = qr.getAttribute('src') ?? '';
      expect(src).not.toBe('/images/qr-code.png');
      expect(src).toBeTruthy();
    });
  });
});

describe('ItemCardEditor — drop-zone direct upload via ImageUploader Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastDialogProps = undefined;
  });

  it('uploads a dropped file via uploader.uploadFile and commits the returned CDN URL', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    const uploader = makeUploader();
    uploader.uploadFile.mockResolvedValue('https://cdn.example.com/uploaded.jpg');
    renderEditor({ onChange, onImageConfirmed }, uploader);

    fireEvent.click(screen.getByText('drop-file'));

    // No dialog opens on the direct-upload flow.
    expect(screen.queryByTestId('image-upload-dialog')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(uploader.uploadFile).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/uploaded.jpg' }),
      );
      expect(onImageConfirmed).toHaveBeenCalledWith('https://cdn.example.com/uploaded.jpg');
    });
  });

  it('uploads a dropped URL via uploader.uploadFromUrl and commits the returned CDN URL', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    const uploader = makeUploader();
    uploader.uploadFromUrl.mockResolvedValue('https://cdn.example.com/from-url.jpg');
    renderEditor({ onChange, onImageConfirmed }, uploader);

    fireEvent.click(screen.getByText('drop-url'));

    expect(screen.queryByTestId('image-upload-dialog')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(uploader.uploadFromUrl).toHaveBeenCalledWith('https://example.com/img.jpg');
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/from-url.jpg' }),
      );
      expect(onImageConfirmed).toHaveBeenCalledWith('https://cdn.example.com/from-url.jpg');
    });
  });

  it('shows a spinner (role=status) while an upload is in flight', async () => {
    const uploader = makeUploader();
    uploader.uploadFile.mockImplementation(() => new Promise<string>(() => {})); // never resolves
    renderEditor({}, uploader);

    fireEvent.click(screen.getByText('drop-file'));

    const status = await screen.findByRole('status');
    expect(status).toHaveAttribute('data-slot', 'item-card-editor-uploading');
    expect(status).toHaveTextContent(/uploading image/i);
  });

  it('shows an inline error banner and hides the drop zone on upload failure', async () => {
    const onChange = vi.fn();
    const onImageConfirmed = vi.fn();
    const onUploadError = vi.fn();
    const uploader = makeUploader();
    uploader.uploadFile.mockRejectedValue(new Error('quota exceeded'));
    renderEditor({ onChange, onImageConfirmed, onUploadError }, uploader);

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
    const uploader = makeUploader();
    uploader.uploadFile.mockRejectedValue(new Error('network down'));
    renderEditor({}, uploader);

    fireEvent.click(screen.getByText('drop-file'));
    await screen.findByRole('alert');

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByTestId('image-drop-zone')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('falls back to the bundled default uploader when no ImageUploadProvider is mounted', async () => {
    const onChange = vi.fn();
    // No <ImageUploadProvider> wrapper — defaults to defaultImageUploader (stub).
    renderEditor({ onChange });

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
  });

  it('ignores error inputs from the drop zone (ImageDropZone surfaces them inline itself)', () => {
    const onChange = vi.fn();
    const uploader = makeUploader();
    renderEditor({ onChange }, uploader);

    fireEvent.click(screen.getByText('drop-error'));

    expect(screen.queryByTestId('image-upload-dialog')).not.toBeInTheDocument();
    expect(uploader.uploadFile).not.toHaveBeenCalled();
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

describe('ItemCardEditor — MINIMUM → ORDER auto-mirror', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function getMinQtyInput(): HTMLInputElement {
    return screen.getByPlaceholderText('Min qty') as HTMLInputElement;
  }
  function getOrderQtyInput(): HTMLInputElement {
    return screen.getByPlaceholderText('Order qty') as HTMLInputElement;
  }
  function getUnitInputs(): HTMLInputElement[] {
    return screen.getAllByTestId('typeahead-input') as HTMLInputElement[];
  }

  it('mirrors minQty into orderQty while the cell is untouched', () => {
    const onChange = vi.fn();
    renderEditor({
      fields: { ...EMPTY_ITEM_CARD_FIELDS, minQty: '', orderQty: '' },
      onChange,
    });

    fireEvent.change(getMinQtyInput(), { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ minQty: '5', orderQty: '5' }));
  });

  it('mirrors minUnit into orderUnit while the cell is untouched', () => {
    const onChange = vi.fn();
    renderEditor({
      fields: { ...EMPTY_ITEM_CARD_FIELDS, minUnit: '', orderUnit: '' },
      onChange,
    });

    const [minUnitInput] = getUnitInputs();
    fireEvent.change(minUnitInput!, { target: { value: 'box' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ minUnit: 'box', orderUnit: 'box' }),
    );
  });

  it('tracks qty and unit independently: touching orderQty does not stop unit mirroring', () => {
    const onChange = vi.fn();
    const { rerender } = renderEditor({
      fields: {
        ...EMPTY_ITEM_CARD_FIELDS,
        minQty: '5',
        orderQty: '5',
        minUnit: 'box',
        orderUnit: 'box',
      },
      onChange,
    });

    // User diverges ORDER qty.
    fireEvent.change(getOrderQtyInput(), { target: { value: '10' } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minQty: '5', orderQty: '10' }),
    );

    // Parent re-renders with the new state.
    rerender(
      <ItemCardEditor
        imageConfig={CONFIG}
        unitLookup={async () => []}
        fields={{
          ...EMPTY_ITEM_CARD_FIELDS,
          minQty: '5',
          orderQty: '10',
          minUnit: 'box',
          orderUnit: 'box',
        }}
        onChange={onChange}
      />,
    );

    // qty no longer mirrors…
    fireEvent.change(getMinQtyInput(), { target: { value: '6' } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minQty: '6', orderQty: '10' }),
    );

    // …but unit still mirrors.
    rerender(
      <ItemCardEditor
        imageConfig={CONFIG}
        unitLookup={async () => []}
        fields={{
          ...EMPTY_ITEM_CARD_FIELDS,
          minQty: '6',
          orderQty: '10',
          minUnit: 'box',
          orderUnit: 'box',
        }}
        onChange={onChange}
      />,
    );
    const [minUnitInput] = getUnitInputs();
    fireEvent.change(minUnitInput!, { target: { value: 'pallet' } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minUnit: 'pallet', orderUnit: 'pallet' }),
    );
  });

  it('does not mirror when initial fields are already diverged', () => {
    const onChange = vi.fn();
    renderEditor({
      fields: { ...EMPTY_ITEM_CARD_FIELDS, minQty: '5', orderQty: '10' },
      onChange,
    });

    fireEvent.change(getMinQtyInput(), { target: { value: '6' } });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minQty: '6', orderQty: '10' }),
    );
  });

  it('reseeds touched state when formInstanceKey changes (mirror resumes for equal new fields)', () => {
    const onChange = vi.fn();
    const baseProps = {
      imageConfig: CONFIG,
      unitLookup: async () => [],
      onChange,
    };

    // Start diverged → mirror is dormant.
    const { rerender } = render(
      <ItemCardEditor
        {...baseProps}
        fields={{ ...EMPTY_ITEM_CARD_FIELDS, minQty: '5', orderQty: '10' }}
        formInstanceKey="item-A"
      />,
    );
    fireEvent.change(getMinQtyInput(), { target: { value: '6' } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minQty: '6', orderQty: '10' }),
    );

    // Switch to a new form instance with equal fields — mirror should resume.
    rerender(
      <ItemCardEditor
        {...baseProps}
        fields={{ ...EMPTY_ITEM_CARD_FIELDS, minQty: '', orderQty: '' }}
        formInstanceKey="item-B"
      />,
    );
    fireEvent.change(getMinQtyInput(), { target: { value: '7' } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minQty: '7', orderQty: '7' }),
    );
  });

  it('does not auto-update touched state when fields change without a formInstanceKey bump (documented limitation)', () => {
    const onChange = vi.fn();
    const baseProps = {
      imageConfig: CONFIG,
      unitLookup: async () => [],
      onChange,
    };

    // Mount with equal fields — touched seeded to false.
    const { rerender } = render(<ItemCardEditor {...baseProps} fields={EMPTY_ITEM_CARD_FIELDS} />);

    // Parent swaps in already-diverged fields without bumping the key.
    rerender(
      <ItemCardEditor
        {...baseProps}
        fields={{ ...EMPTY_ITEM_CARD_FIELDS, minQty: '5', orderQty: '10' }}
      />,
    );

    // Typing minQty still mirrors and overwrites the diverged orderQty — this
    // is the documented behavior: hosts must bump formInstanceKey to reseed.
    fireEvent.change(getMinQtyInput(), { target: { value: '7' } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minQty: '7', orderQty: '7' }),
    );
  });

  it('does not mark touched when user types orderQty equal to current minQty', () => {
    const onChange = vi.fn();
    const baseProps = {
      imageConfig: CONFIG,
      unitLookup: async () => [],
      onChange,
    };

    // User types orderQty equal to minQty — no divergence.
    const { rerender } = render(
      <ItemCardEditor
        {...baseProps}
        fields={{ ...EMPTY_ITEM_CARD_FIELDS, minQty: '5', orderQty: '5' }}
      />,
    );
    fireEvent.change(getOrderQtyInput(), { target: { value: '5' } });

    // Subsequent minQty change must still mirror — touched should not have flipped.
    rerender(
      <ItemCardEditor
        {...baseProps}
        fields={{ ...EMPTY_ITEM_CARD_FIELDS, minQty: '5', orderQty: '5' }}
      />,
    );
    fireEvent.change(getMinQtyInput(), { target: { value: '8' } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minQty: '8', orderQty: '8' }),
    );
  });
});
