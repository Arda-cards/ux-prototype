import * as React from 'react';

import {
  defaultUploadHandler,
  defaultUrlUploadHandler,
  defaultReachabilityCheck,
} from './image-upload-handlers';

/**
 * Contract for the full image-upload pipeline.
 *
 * A single object instead of three separate callback props — before
 * 5.0.0 consumers had to wire `onUpload`, `onUploadFromUrl`, and
 * `onCheckReachability` separately on every component that needed them.
 * That shape made the application reverse-engineer which operations
 * the component performed and in what order, and duplicated the wiring
 * across every call site.
 *
 * The three operations are intentionally orthogonal:
 *
 * - `uploadFile` takes bytes the app already has (drag-dropped file,
 *   clipboard Blob, cropped Blob from the editor) and returns the
 *   persisted CDN URL.
 * - `uploadFromUrl` takes an external URL the app does NOT have bytes
 *   for and handles the full fetch-plus-upload round-trip server-side
 *   (to bypass browser CORS).
 * - `checkReachability` is an optional pre-flight on URLs so callers
 *   can fail fast before attempting a full upload.
 */
export interface ImageUploader {
  /** Upload a File/Blob; resolves to the persisted CDN URL. */
  uploadFile(file: Blob): Promise<string>;
  /** Fetch + upload an external URL; resolves to the persisted CDN URL. */
  uploadFromUrl(url: string): Promise<string>;
  /** HEAD-style check: is the URL fetchable? Returns false for obvious bad URLs. */
  checkReachability(url: string): Promise<boolean>;
}

/**
 * Default uploader used when no provider is mounted and no override is
 * passed. Backed by the stubbed handlers in `image-upload-handlers.ts`
 * so Storybook / dev harnesses work out of the box.
 */
export const defaultImageUploader: ImageUploader = {
  uploadFile: defaultUploadHandler,
  uploadFromUrl: defaultUrlUploadHandler,
  checkReachability: defaultReachabilityCheck,
};

// --- React context ---

const ImageUploadContext = React.createContext<ImageUploader>(defaultImageUploader);

export interface ImageUploadProviderProps {
  value: ImageUploader;
  children: React.ReactNode;
}

/**
 * Provide an `ImageUploader` to every design-system component in the
 * subtree (`ItemCardEditor`, `ImageUploadDialog`, and any future
 * component that needs upload semantics). Mount once at or above the
 * level where upload-capable components live.
 *
 * @example
 * ```tsx
 * const uploader = useItemImageUploader();    // app hook
 * return (
 *   <ImageUploadProvider value={uploader}>
 *     <ItemFormPanel />
 *     <ItemsTable />
 *   </ImageUploadProvider>
 * );
 * ```
 */
export function ImageUploadProvider({ value, children }: ImageUploadProviderProps) {
  return <ImageUploadContext.Provider value={value}>{children}</ImageUploadContext.Provider>;
}

/**
 * Access the current `ImageUploader`. Returns the default stub
 * uploader if no `ImageUploadProvider` is mounted — keeps stories,
 * dev pages, and isolated tests working without a wrapper.
 */
export function useImageUploader(): ImageUploader {
  return React.useContext(ImageUploadContext);
}
