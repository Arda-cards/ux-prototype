import type { ImageFieldConfig } from '@/types/canary/utilities';

// Placeholder image URLs (via picsum.photos, stable seeds)
export const MOCK_ITEM_IMAGE = 'https://picsum.photos/seed/arda-item-1/400/400';
export const MOCK_ITEM_IMAGE_ALT = 'https://picsum.photos/seed/arda-item-2/400/400';
export const MOCK_BROKEN_IMAGE = 'https://example.com/nonexistent-image-404.jpg';
export const MOCK_LARGE_IMAGE = 'https://picsum.photos/seed/arda-large/2048/2048';

export const ITEM_IMAGE_CONFIG: ImageFieldConfig = {
  aspectRatio: 1,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxDimension: 2048,
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
};

/** Simulated presigned-POST upload (happy path, ~1.5s). */
export async function mockUpload(_file: Blob): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  return 'https://cdn.example.com/images/mock-uploaded.jpg';
}

/** Simulated URL reachability check (happy path, ~500ms). */
export async function mockReachabilityCheck(url: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 500));
  return !url.includes('broken');
}

// Sample items for grid stories
export interface MockItem {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  unitCost: number;
}

export const MOCK_ITEMS: MockItem[] = [
  { id: '1', name: 'Hex Bolt M10x30', sku: 'HB-1030', imageUrl: MOCK_ITEM_IMAGE, unitCost: 0.45 },
  {
    id: '2',
    name: 'Flat Washer 3/8"',
    sku: 'FW-0375',
    imageUrl: MOCK_ITEM_IMAGE_ALT,
    unitCost: 0.12,
  },
  { id: '3', name: 'Spring Pin 4x20', sku: 'SP-0420', imageUrl: null, unitCost: 0.28 },
  { id: '4', name: 'Tee Nut 1/4-20', sku: 'TN-2520', imageUrl: MOCK_BROKEN_IMAGE, unitCost: 0.65 },
];
