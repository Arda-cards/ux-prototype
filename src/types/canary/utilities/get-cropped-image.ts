import type { PixelCrop } from './image-field-config';

/**
 * Canvas helper that applies crop coordinates, zoom, and rotation
 * to an image source and returns a Blob.
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation: number = 0,
  outputFormat: string = 'image/jpeg',
  quality: number = 0.85,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to obtain 2D canvas context');

  const rotRad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));

  // Compute bounding box of the rotated source
  const bBoxWidth = image.width * cos + image.height * sin;
  const bBoxHeight = image.width * sin + image.height * cos;

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Extract the crop region. When pixelCrop has zero dimensions (rotate-only
  // or zoom-only edit), use the full rotated canvas as the crop area.
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
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}
