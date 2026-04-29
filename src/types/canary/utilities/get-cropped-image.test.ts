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

  it('draws at natural size when pixelCrop is non-zero (zoom is in crop coords)', async () => {
    const { ctx } = installCanvasMock('image/jpeg');
    // Non-zero pixelCrop: zoom should NOT be applied to the canvas draw.
    await runCrop({ pixelCrop: { x: 0, y: 0, width: 1, height: 1 }, zoom: 0.5 });
    const sourceDraw = ctx.drawImage.mock.calls[0]!;
    // drawImage(image, 0, 0, drawWidth, drawHeight) — drawWidth/Height = natural (1)
    expect(sourceDraw[3]).toBe(1);
    expect(sourceDraw[4]).toBe(1);
  });

  it('draws at scaled size when pixelCrop is zero-sized (zoom-only edit)', async () => {
    const { ctx } = installCanvasMock('image/jpeg');
    // Zero-sized pixelCrop: zoom MUST be applied so the output reflects the zoom.
    await runCrop({ pixelCrop: { x: 0, y: 0, width: 0, height: 0 }, zoom: 0.5 });
    const sourceDraw = ctx.drawImage.mock.calls[0]!;
    // drawImage(image, 0, 0, drawWidth, drawHeight) — drawWidth/Height = 0.5 (scaled)
    expect(sourceDraw[3]).toBe(0.5);
    expect(sourceDraw[4]).toBe(0.5);
  });

  it('rounds non-integer crop dimensions up to avoid canvas truncation (PR-96 review)', async () => {
    installCanvasMock('image/jpeg');
    // Use the toBlob spy to capture the croppedCanvas dimensions just before
    // encoding. Replace the spy with one that records the canvas width/height.
    let capturedWidth = -1;
    let capturedHeight = -1;
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
      this: HTMLCanvasElement,
      callback,
    ) {
      capturedWidth = this.width;
      capturedHeight = this.height;
      callback(new Blob(['x'], { type: 'image/jpeg' }));
    });

    // A pixelCrop with non-integer dimensions (the realistic case at zoom=1.7,
    // rotation=37, etc.) — expect Math.ceil applied so canvas.width/height
    // never truncate below the requested region.
    await runCrop({ pixelCrop: { x: 0, y: 0, width: 100.4, height: 100.6 } });
    expect(capturedWidth).toBe(101);
    expect(capturedHeight).toBe(101);
  });

  it('centers the image when crop extends beyond bounds (zoom < 1)', async () => {
    const { ctx } = installCanvasMock('image/jpeg');

    // Simulate zoom < 1: crop area is larger than the 1×1 image, with
    // negative offsets (crop extends beyond the rotated image bounds).
    const oversizedCrop: PixelCrop = { x: -1, y: -1, width: 3, height: 3 };
    await runCrop({ pixelCrop: oversizedCrop });

    // The second drawImage call extracts the crop region.
    // Source coords should be clamped (sx=0, sy=0) and destination offset
    // by the clamped amount (dx=1, dy=1) to center the image.
    const cropDraw = ctx.drawImage.mock.calls[1]!;
    // drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh)
    const [, sx, sy, sw, sh, dx, dy] = cropDraw;
    expect(sx).toBe(0); // clamped from -1
    expect(sy).toBe(0); // clamped from -1
    expect(dx).toBe(1); // offset = 0 - (-1) = 1
    expect(dy).toBe(1); // offset = 0 - (-1) = 1
    expect(sw).toBe(1); // clamped to available width
    expect(sh).toBe(1); // clamped to available height
  });
});
