import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ImageUploadDialog, type ImageUploadDialogProps } from './image-upload-dialog';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';

// --- Mocks ---

vi.mock('@/components/canary/__mocks__/image-story-data', () => ({
  mockUpload: vi.fn().mockResolvedValue('https://cdn.example.com/images/mock-uploaded.jpg'),
  mockReachabilityCheck: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/components/canary/molecules/image-preview-editor/image-preview-editor', () => ({
  ImagePreviewEditor: ({
    imageData,
    onCropChange,
    onReset,
  }: {
    imageData: File | Blob | string;
    onCropChange: (d: unknown) => void;
    onReset: () => void;
  }) => (
    <div data-testid="image-preview-editor">
      <span data-testid="preview-src">
        {typeof imageData === 'string' ? imageData : 'file-blob'}
      </span>
      <button
        onClick={() =>
          onCropChange({ pixelCrop: { x: 0, y: 0, width: 0, height: 0 }, zoom: 1, rotation: 0 })
        }
      >
        crop
      </button>
      <button onClick={onReset}>reset</button>
    </div>
  ),
}));

vi.mock('@/components/canary/molecules/image-comparison-layout/image-comparison-layout', () => ({
  ImageComparisonLayout: ({
    existingImageUrl,
    children,
  }: {
    existingImageUrl: string | null;
    children: React.ReactNode;
  }) => (
    <div data-testid="image-comparison-layout" data-existing-url={existingImageUrl ?? ''}>
      {children}
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

vi.mock('@/components/canary/atoms/copyright-acknowledgment/copyright-acknowledgment', () => ({
  CopyrightAcknowledgment: ({
    acknowledged,
    onAcknowledge,
  }: {
    acknowledged: boolean;
    onAcknowledge: (v: boolean) => void;
  }) => (
    <div data-testid="copyright-acknowledgment">
      <input
        type="checkbox"
        data-testid="copyright-checkbox"
        checked={acknowledged}
        onChange={(e) => onAcknowledge(e.target.checked)}
        aria-label="Copyright acknowledgment"
      />
    </div>
  ),
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

  it('renders ImageDropZone in EmptyImage state', () => {
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

  it('shows CopyrightAcknowledgment in ProvidedImage state', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByTestId('copyright-acknowledgment')).toBeInTheDocument();
    });
  });

  it('Confirm button is disabled when copyright unchecked', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    });
  });

  it('Confirm button is enabled when copyright checked', async () => {
    renderDialog();
    fireEvent.click(screen.getByText('drop file'));
    await waitFor(() => {
      expect(screen.getByTestId('copyright-checkbox')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('copyright-checkbox'));
    await waitFor(() => {
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
    vi.useFakeTimers();
    try {
      const { mockUpload } = await import('@/components/canary/__mocks__/image-story-data');
      (mockUpload as ReturnType<typeof vi.fn>).mockResolvedValue(
        'https://cdn.example.com/images/mock-uploaded.jpg',
      );
      const onConfirm = vi.fn();
      renderDialog({ onConfirm });

      fireEvent.click(screen.getByText('drop file'));
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.getByTestId('copyright-checkbox')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('copyright-checkbox'));
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.getByRole('button', { name: 'Confirm' })).not.toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      // Advance timers to complete the progress simulation
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://cdn.example.com/images/mock-uploaded.jpg' }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows progress bar during upload', async () => {
    vi.useFakeTimers();
    try {
      renderDialog();
      fireEvent.click(screen.getByText('drop file'));
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.getByTestId('copyright-checkbox')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('copyright-checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      await act(async () => {
        vi.advanceTimersByTime(100);
        await Promise.resolve();
      });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('comparison layout shown when existingImageUrl set', async () => {
    renderDialog({ existingImageUrl: 'https://example.com/existing.jpg' });
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
});
