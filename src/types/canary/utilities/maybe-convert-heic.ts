import heic2any from 'heic2any';

const HEIC_TYPES: string[] = ['image/heic', 'image/heif'];
const HEIC_EXTENSION = /\.hei[cf]$/i;

/**
 * True when a file is HEIC/HEIF, judged by MIME type or file extension.
 * Some platforms (notably Windows) report an empty or generic MIME type
 * for .heic/.heif files, so the extension is checked as a fallback.
 */
function isHeicFile(file: File): boolean {
  return HEIC_TYPES.includes(file.type) || HEIC_EXTENSION.test(file.name);
}

/** Convert HEIC/HEIF files to JPEG so browsers can render them. */
export async function maybeConvertHeic(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;

  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  const blob = Array.isArray(result) ? (result[0] as Blob) : result;
  const name = file.name.replace(HEIC_EXTENSION, '.jpg');
  return new File([blob], name, { type: 'image/jpeg' });
}
