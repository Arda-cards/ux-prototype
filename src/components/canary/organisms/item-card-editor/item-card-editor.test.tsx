import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ItemCardEditor, EMPTY_ITEM_CARD_FIELDS } from './item-card-editor';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';

// Mock the dialog so the test doesn't pull in the full upload state machine.
vi.mock('@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog', () => ({
  ImageUploadDialog: () => null,
}));

// Mock the typeahead so we don't have to provide a unit lookup implementation.
vi.mock('@/components/canary/molecules/typeahead-input/typeahead-input', () => ({
  TypeaheadInput: () => null,
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
