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

/** Invoke getCroppedImage with test defaults merged with overrides. */
async function runCrop(overrides: Partial<Parameters<typeof getCroppedImage>[0]> = {}) {
  return getCroppedImage({ imageSrc: TEST_IMAGE_SRC, pixelCrop: DEFAULT_CROP, ...overrides });
}

describe('getCroppedImage', () => {
  it('returns a Blob', async () => {
    installCanvasMock('image/jpeg');
    const result = await runCrop();
    expect(result).toBeInstanceOf(Blob);
  });

  it('output MIME type matches the outputFormat parameter', async () => {
    installCanvasMock('image/png');
    const result = await runCrop({ outputFormat: 'image/png', quality: 0.9 });
    expect(result.type).toBe('image/png');
  });

  it('produces a Blob when using the default quality of 0.85 (smoke test)', async () => {
    installCanvasMock('image/jpeg');
    const result = await runCrop();
    expect(result.size).toBeGreaterThan(0);
  });

  it('completes successfully with zero rotation', async () => {
    installCanvasMock('image/jpeg');
    const result = await runCrop({ rotation: 0 });
    expect(result).toBeInstanceOf(Blob);
  });

  it('completes successfully with 90-degree rotation', async () => {
    installCanvasMock('image/jpeg');
    const result = await runCrop({ rotation: 90 });
    expect(result).toBeInstanceOf(Blob);
  });

  it.each([
    { zoom: 2, expected: 2, label: 'zoom > 1 (enlarge)' },
    { zoom: 0.5, expected: 0.5, label: 'zoom < 1 (shrink, Option A)' },
    { zoom: 1, expected: 1, label: 'zoom = 1 (no scaling)' },
  ])(
    'applies zoom ($label): drawImage receives scaled dimensions (5a)',
    async ({ zoom, expected }) => {
      const { ctx } = installCanvasMock('image/jpeg');
      await runCrop({ zoom });
      // The source drawImage call uses scaled dimensions:
      //   drawImage(image, 0, 0, scaledWidth, scaledHeight)
      // With the mock image at 1x1, scaled dims equal the zoom factor.
      const sourceDraw = ctx.drawImage.mock.calls[0];
      expect(sourceDraw).toBeDefined();
      expect(sourceDraw[3]).toBe(expected);
      expect(sourceDraw[4]).toBe(expected);
    },
  );
});
