/** CDN URL pattern — matches `*.assets.arda.cards` domains (FD-17). */
export function isCdnUrl(src: string): boolean {
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return false;
    return url.hostname === 'assets.arda.cards' || url.hostname.endsWith('.assets.arda.cards');
  } catch {
    return false;
  }
}

/**
 * Prefetch a CDN image URL with credentials and return a local blob URL.
 * This eliminates CORS issues when the image is later drawn onto a canvas,
 * because the blob URL is same-origin.
 *
 * Returns the original URL unchanged if the fetch fails or the URL is not
 * a CDN URL (e.g., a blob: URL from a fresh upload).
 */
export async function prefetchImageAsBlob(imageUrl: string): Promise<string> {
  if (!isCdnUrl(imageUrl)) return imageUrl;
  try {
    const response = await fetch(imageUrl, { credentials: 'include' });
    if (!response.ok) return imageUrl;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return imageUrl;
  }
}
