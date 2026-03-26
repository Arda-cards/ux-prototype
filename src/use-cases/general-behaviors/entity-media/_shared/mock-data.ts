/**
 * Use-case-specific mock data for Entity Media stories.
 *
 * Re-exports component-level mocks and adds File/Blob/URL mocks
 * needed by use case stories that simulate user input methods.
 */
export {
  MOCK_ITEM_IMAGE,
  MOCK_ITEM_IMAGE_ALT,
  MOCK_BROKEN_IMAGE,
  MOCK_LARGE_IMAGE,
  ITEM_IMAGE_CONFIG,
  mockUpload,
  mockReachabilityCheck,
  MOCK_ITEMS,
  type MockItem,
} from '@/components/canary/__mocks__/image-story-data';

// ---------------------------------------------------------------------------
// File / Blob mocks for input-method stories
// ---------------------------------------------------------------------------

/** 1x1 red JPEG pixel as base64. */
const JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAFRABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgA//9k=';

const jpegBytes = Uint8Array.from(atob(JPEG_BASE64), (c) => c.charCodeAt(0));

/** Small valid JPEG File for file-pick and drag-drop stories. */
export const MOCK_FILE_JPEG = new File([jpegBytes], 'test-image.jpg', {
  type: 'image/jpeg',
});

/** Small valid PNG File. */
const PNG_1PX = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
]);
export const MOCK_FILE_PNG = new File([PNG_1PX], 'test-image.png', {
  type: 'image/png',
});

/** Oversized file (exceeds 10 MB maxFileSizeBytes) — content is padding. */
export const MOCK_FILE_OVERSIZED = new File([new ArrayBuffer(11 * 1024 * 1024)], 'oversized.jpg', {
  type: 'image/jpeg',
});

/** Unsupported format (BMP) for rejection stories. */
export const MOCK_FILE_BMP = new File(
  [new Uint8Array([0x42, 0x4d, 0x00, 0x00])],
  'unsupported.bmp',
  { type: 'image/bmp' },
);

/** Clipboard image blob mock — simulates pasting a screenshot. */
export const MOCK_CLIPBOARD_IMAGE_BLOB = new Blob([jpegBytes], {
  type: 'image/jpeg',
});

// ---------------------------------------------------------------------------
// URL mocks
// ---------------------------------------------------------------------------

/** Valid external HTTPS URL for URL-entry stories. */
export const MOCK_EXTERNAL_URL = 'https://picsum.photos/seed/arda-external/400/400';

/** Unreachable HTTPS URL. */
export const MOCK_EXTERNAL_URL_BROKEN = 'https://example.com/nonexistent-image-404.jpg';

/** URL that returns non-image content type. */
export const MOCK_EXTERNAL_URL_NON_IMAGE = 'https://example.com/page.html';

// ---------------------------------------------------------------------------
// Upload variant mocks
// ---------------------------------------------------------------------------

/** Slow upload (~5s) for progress bar demonstration. */
export async function mockUploadSlow(_file: Blob): Promise<string> {
  await new Promise((r) => setTimeout(r, 5000));
  return 'https://cdn.example.com/images/mock-uploaded-slow.jpg';
}

/** Failing upload for error handling stories. */
export async function mockUploadFail(_file: Blob): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  throw new Error('Upload failed: network timeout');
}
