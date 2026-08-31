import { describe, it, expect } from 'vitest';
import { maybeConvertHeic } from './maybe-convert-heic';

describe('maybeConvertHeic', () => {
  it('converts a file with a HEIC MIME type to a renamed JPEG', async () => {
    const file = new File(['heic-bytes'], 'photo.heic', { type: 'image/heic' });

    const result = await maybeConvertHeic(file);

    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('photo.jpg');
  });

  it('converts a file with a HEIF MIME type to a renamed JPEG', async () => {
    const file = new File(['heif-bytes'], 'photo.heif', { type: 'image/heif' });

    const result = await maybeConvertHeic(file);

    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('photo.jpg');
  });

  it('converts a .heic file with an empty MIME type by extension', async () => {
    const file = new File(['heic-bytes'], 'photo.HEIC', { type: '' });

    const result = await maybeConvertHeic(file);

    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('photo.jpg');
  });

  it('passes non-HEIC files through unchanged', async () => {
    const file = new File(['jpeg-bytes'], 'photo.jpg', { type: 'image/jpeg' });

    const result = await maybeConvertHeic(file);

    expect(result).toBe(file);
  });
});
