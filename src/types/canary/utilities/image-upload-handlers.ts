/**
 * Default upload handlers for ImageUploadDialog.
 *
 * These are self-contained defaults suitable for Storybook and development.
 * Production deployments should provide real implementations via the
 * `onUpload` and `onCheckReachability` props.
 */

/** Default upload handler &#8212; simulates a presigned-POST upload with a 1.5s delay. */
export async function defaultUploadHandler(_file: Blob): Promise<string> {
  await new Promise<void>((r) => setTimeout(r, 1500));
  return 'https://picsum.photos/seed/arda-uploaded/400/400';
}

/**
 * Default URL-upload handler &#8212; simulates a BFF fetch + upload round-trip
 * with a 1.5s delay and returns a mock CDN-shaped URL. Used by the design
 * system when consumers (Storybook, dev harnesses) don't supply their
 * own `onUploadFromUrl` implementation.
 */
export async function defaultUrlUploadHandler(url: string): Promise<string> {
  await new Promise<void>((r) => setTimeout(r, 1500));
  // Seed the mock CDN URL from the source URL length so repeated uploads
  // from different sources produce visually distinct results in stories.
  return `https://picsum.photos/seed/arda-from-url-${url.length}/400/400`;
}

/** Default reachability check &#8212; returns false for URLs containing "broken", true otherwise. */
export async function defaultReachabilityCheck(url: string): Promise<boolean> {
  return !url.includes('broken');
}
