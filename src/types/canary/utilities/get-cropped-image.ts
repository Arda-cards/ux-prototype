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
   * Zoom factor from the editor (0.5..3). Only used when pixelCrop is
   * zero-sized (zoom-only or rotate-only edit) — the image is scaled by
   * this factor so the output matches what the user saw. When pixelCrop
   * has non-zero dimensions, zoom is already encoded in the crop rect
   * coordinates by react-easy-crop and must NOT be applied to the canvas.
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

  const hasCropArea = pixelCrop.width > 0 && pixelCrop.height > 0;

  // Two drawing strategies depending on whether the user interacted with
  // the crop area:
  //
  // 1. hasCropArea (user cropped): draw at NATURAL size. react-easy-crop's
  //    croppedAreaPixels is in the image's natural pixel coordinate space —
  //    zoom is encoded in the crop rect itself (extending beyond the image
  //    bounds when zoom < 1, covering a sub-region when zoom > 1). Scaling
  //    here would double-apply the zoom.
  //
  // 2. !hasCropArea (zoom-only or rotate-only): draw at SCALED size. The
  //    caller passed a zero-sized pixelCrop to signal "use full canvas",
  //    so zoom must be applied to the canvas for the output to match the
  //    editor preview.
  const drawWidth = hasCropArea ? image.width : image.width * zoom;
  const drawHeight = hasCropArea ? image.height : image.height * zoom;

  const rotRad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));

  const bBoxWidth = Math.ceil(drawWidth * cos + drawHeight * sin);
  const bBoxHeight = Math.ceil(drawWidth * sin + drawHeight * cos);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-drawWidth / 2, -drawHeight / 2);
  ctx.drawImage(image, 0, 0, drawWidth, drawHeight);

  // Determine the effective crop rect. Round dimensions up so non-integer
  // values (from zoom factors and trig) don't truncate the last pixel.
  const effectiveCrop = hasCropArea
    ? {
        x: pixelCrop.x,
        y: pixelCrop.y,
        width: Math.ceil(pixelCrop.width),
        height: Math.ceil(pixelCrop.height),
      }
    : { x: 0, y: 0, width: bBoxWidth, height: bBoxHeight };

  // Extract the crop region.
  // When zoom < 1 the crop area reported by react-easy-crop extends beyond
  // the rotated image bounds (negative x/y or size > image). A plain
  // drawImage clips to the available source pixels, pegging the result to
  // the top-left corner. Clamp the source rect to the actual image and
  // offset the destination so the image stays centered in the output.
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) throw new Error('Failed to obtain 2D canvas context for crop');
  croppedCanvas.width = effectiveCrop.width;
  croppedCanvas.height = effectiveCrop.height;

  // Clamp source coordinates to available pixels
  const sx = Math.max(0, effectiveCrop.x);
  const sy = Math.max(0, effectiveCrop.y);
  const sRight = Math.min(bBoxWidth, effectiveCrop.x + effectiveCrop.width);
  const sBottom = Math.min(bBoxHeight, effectiveCrop.y + effectiveCrop.height);
  const sw = Math.max(0, sRight - sx);
  const sh = Math.max(0, sBottom - sy);

  // Offset destination so the drawn region is centered
  const dx = sx - effectiveCrop.x;
  const dy = sy - effectiveCrop.y;

  // If the requested crop lies completely outside the rotated image bounds,
  // there is nothing to draw. Leave the output canvas blank/transparent and
  // still export it, rather than calling drawImage() with a zero source size
  // (which throws IndexSizeError in browsers).
  if (sw > 0 && sh > 0) {
    croppedCtx.drawImage(canvas, sx, sy, sw, sh, dx, dy, sw, sh);
  }

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
    // Always opt into anonymous CORS. For same-origin sources (blob: URLs
    // from the dialog's CDN prefetch in #750/5c) the attribute is a no-op;
    // for cross-origin https: sources whose server returns the right CORS
    // headers, it prevents the canvas from being tainted so toBlob() can
    // still produce output.
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.src = src;
  });
}
