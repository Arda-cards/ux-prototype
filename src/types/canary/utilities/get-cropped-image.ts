import type { PixelCrop } from './image-field-config';

export interface GetCroppedImageOptions {
  /** Image source — URL, blob URL, or data URI. */
  imageSrc: string;
  /**
   * Crop region in the source image's natural coordinate space, as produced
   * by react-easy-crop's `onCropComplete`. When zoom < 1 in the editor, this
   * rectangle can extend beyond the image bounds (the padded area the user
   * sees around the shrunken image). Canvas areas outside the image render
   * transparent (or black for JPEG output) — matching the editor preview.
   *
   * Pass a zero-sized rect (width=0 and/or height=0) to signal "no crop"
   * (zoom/rotation-only edits); the output canvas will be sized to fit the
   * full rotated+zoomed image.
   */
  pixelCrop: PixelCrop;
  /** Rotation in degrees. Defaults to 0. */
  rotation?: number;
  /**
   * Zoom factor from the editor (0.5..3). When != 1, the source image is
   * scaled before being drawn onto the canvas, so the output matches what
   * the user saw in the editor (Option A semantics: zoom < 1 produces
   * visible padding in the output).
   */
  zoom?: number;
  /** Output image MIME type. Defaults to 'image/jpeg'. */
  outputFormat?: string;
  /** Output quality (0..1). Defaults to 0.85. */
  quality?: number;
}

/**
 * Canvas helper that applies crop coordinates, rotation, and zoom to an
 * image source and returns a Blob.
 */
export async function getCroppedImage(options: GetCroppedImageOptions): Promise<Blob> {
  const {
    imageSrc,
    pixelCrop,
    rotation = 0,
    zoom = 1,
    outputFormat = 'image/jpeg',
    quality = 0.85,
  } = options;

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to obtain 2D canvas context');

  // Apply zoom by scaling the effective image dimensions. When zoom < 1,
  // the scaled image is smaller than its natural size; when zoom > 1, larger.
  const scaledWidth = image.width * zoom;
  const scaledHeight = image.height * zoom;

  const rotRad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));

  // Bounding box of the rotated, scaled source
  const bBoxWidth = scaledWidth * cos + scaledHeight * sin;
  const bBoxHeight = scaledWidth * sin + scaledHeight * cos;

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-scaledWidth / 2, -scaledHeight / 2);
  // Draw the image at the scaled size (zoom applied). Canvas areas outside
  // this rectangle remain transparent — they render as black in JPEG output
  // when pixelCrop extends beyond the image bounds (zoom < 1 case).
  ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

  // Extract the crop region. When pixelCrop has zero dimensions (rotate-only
  // or zoom-only edit), use the full rotated+scaled canvas as the crop area.
  const effectiveCrop =
    pixelCrop.width > 0 && pixelCrop.height > 0
      ? pixelCrop
      : { x: 0, y: 0, width: bBoxWidth, height: bBoxHeight };

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) throw new Error('Failed to obtain 2D canvas context for crop');
  croppedCanvas.width = effectiveCrop.width;
  croppedCanvas.height = effectiveCrop.height;

  croppedCtx.drawImage(
    canvas,
    effectiveCrop.x,
    effectiveCrop.y,
    effectiveCrop.width,
    effectiveCrop.height,
    0,
    0,
    effectiveCrop.width,
    effectiveCrop.height,
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      outputFormat,
      quality,
    );
  });
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.src = src;
  });
}
