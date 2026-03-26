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

/** Default reachability check &#8212; returns false for URLs containing "broken", true otherwise. */
export async function defaultReachabilityCheck(url: string): Promise<boolean> {
  return !url.includes('broken');
}
