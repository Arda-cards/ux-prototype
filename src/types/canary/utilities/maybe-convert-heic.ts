import heic2any from 'heic2any';

const HEIC_TYPES: string[] = ['image/heic', 'image/heif'];
const HEIC_EXTENSION = /\.hei[cf]$/i;

/**
 * True when a file is HEIC/HEIF, judged by MIME type — or by extension only
 * when the platform provided no usable MIME type (empty, or the generic
 * application/octet-stream, as on Windows). A concrete non-HEIC type is
 * trusted, so a renamed JPEG is not sent through conversion.
 */
function isHeicFile(file: File): boolean {
  if (HEIC_TYPES.includes(file.type)) return true;
  if (file.type && file.type !== 'application/octet-stream') return false;
  return HEIC_EXTENSION.test(file.name);
}

/** Convert HEIC/HEIF files to JPEG so browsers can render them. */
export async function maybeConvertHeic(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;

  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  const blob = Array.isArray(result) ? (result[0] as Blob) : result;
  const name = file.name.replace(HEIC_EXTENSION, '.jpg');
  return new File([blob], name, { type: 'image/jpeg' });
}
