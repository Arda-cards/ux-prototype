import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getCroppedImage } from './get-cropped-image';
import type { PixelCrop } from './image-field-config';

// Minimal 1x1 transparent PNG as a data URI (used as test image source)
const TEST_IMAGE_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

const DEFAULT_CROP: PixelCrop = { x: 0, y: 0, width: 1, height: 1 };

// ── Canvas mock setup ────────────────────────────────────────────────────────

function makeCtxMock() {
  return {
    translate: vi.fn(),
    rotate: vi.fn(),
    drawImage: vi.fn(),
  };
}

function installCanvasMock(mimeType: string) {
  const ctx = makeCtxMock();

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );

  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    this: HTMLCanvasElement,
    callback,
    type,
  ) {
    const blob = new Blob(['fake-image-data'], { type: type ?? mimeType });
    callback(blob);
  });

  return { ctx };
}

// ── Image load mock ──────────────────────────────────────────────────────────

function mockImageLoad() {
  Object.defineProperty(window.Image.prototype, 'src', {
    set(_src: string) {
      // Trigger load asynchronously so the Promise resolves
      setTimeout(() => {
        Object.defineProperty(this, 'width', { value: 1, configurable: true });
        Object.defineProperty(this, 'height', { value: 1, configurable: true });
        this.dispatchEvent(new Event('load'));
      }, 0);
    },
    configurable: true,
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
  mockImageLoad();
});

describe('getCroppedImage', () => {
  it('returns a Blob', async () => {
    installCanvasMock('image/jpeg');
    const result = await getCroppedImage(TEST_IMAGE_SRC, DEFAULT_CROP);
    expect(result).toBeInstanceOf(Blob);
  });

  it('output MIME type matches the outputFormat parameter', async () => {
    installCanvasMock('image/png');
    const result = await getCroppedImage(TEST_IMAGE_SRC, DEFAULT_CROP, 0, 'image/png', 0.9);
    expect(result.type).toBe('image/png');
  });

  it('produces a Blob when using the default quality of 0.85 (smoke test)', async () => {
    installCanvasMock('image/jpeg');
    const result = await getCroppedImage(TEST_IMAGE_SRC, DEFAULT_CROP);
    expect(result.size).toBeGreaterThan(0);
  });

  it('completes successfully with zero rotation', async () => {
    installCanvasMock('image/jpeg');
    const result = await getCroppedImage(TEST_IMAGE_SRC, DEFAULT_CROP, 0);
    expect(result).toBeInstanceOf(Blob);
  });

  it('completes successfully with 90-degree rotation', async () => {
    installCanvasMock('image/jpeg');
    const result = await getCroppedImage(TEST_IMAGE_SRC, DEFAULT_CROP, 90);
    expect(result).toBeInstanceOf(Blob);
  });
});
