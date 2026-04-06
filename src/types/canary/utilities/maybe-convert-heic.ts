import heic2any from 'heic2any';

const HEIC_TYPES: string[] = ['image/heic', 'image/heif'];

/** Convert HEIC/HEIF files to JPEG so browsers can render them. */
export async function maybeConvertHeic(file: File): Promise<File> {
  if (!HEIC_TYPES.includes(file.type)) return file;

  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  const blob = Array.isArray(result) ? (result[0] as Blob) : result;
  const name = file.name.replace(/\.hei[cf]$/i, '.jpg');
  return new File([blob], name, { type: 'image/jpeg' });
}
