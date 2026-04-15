import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/canary/atoms/dialog/dialog';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/canary/primitives/button';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { ImageComparisonLayout } from '@/components/canary/molecules/image-comparison-layout/image-comparison-layout';
import { getCroppedImage } from '@/types/canary/utilities/get-cropped-image';
import { prefetchImageAsBlob } from '@/types/canary/utilities/cdn-url';
import { useImageUploader } from '@/types/canary/utilities/image-uploader';
import type {
  ImageFieldConfig,
  ImageInput,
  ImageUploadResult,
} from '@/types/canary/utilities/image-field-config';

// --- Interfaces ---

/** Static configuration for ImageUploadDialog. */
export interface ImageUploadDialogStaticProps {}

/** Init configuration for ImageUploadDialog. */
export interface ImageUploadDialogInitProps {
  config: ImageFieldConfig;
}

/**
 * Runtime props for ImageUploadDialog.
 * Confirm/cancel callbacks follow `EditLifecycleCallbacks<ImageUploadResult>`.
 *
 * As of 4.11.7, upload/URL-upload/reachability are provided by the
 * `ImageUploader` on the surrounding `ImageUploadProvider` Context — no
 * longer wired per-callback here. See the `useImageUploader` hook and
 * the `ImageUploadProvider` component.
 */
export interface ImageUploadDialogRuntimeProps {
  existingImageUrl: string | null;
  onConfirm: (result: ImageUploadResult) => void;
  open: boolean;
  onCancel: () => void;
  /**
   * Externally-supplied image input &#8212; typically forwarded from the host's
   * own drop zone. When defined while `open` is true, the input is
   * dispatched through the same state-machine path as the dialog's
   * internal `ImageDropZone`: file inputs land directly in `Uploading`
   * (no cropper review step — rapid-batch UX); URL inputs go through
   * reachability check first; error inputs land in `FailedValidation`.
   *
   * A new identity (referential inequality) is treated as a new dispatch.
   * The host should clear this prop on confirm/cancel to avoid re-entry on
   * the next open.
   */
  pendingInput?: ImageInput;
}

/** Combined props for ImageUploadDialog. */
export type ImageUploadDialogProps = ImageUploadDialogStaticProps &
  ImageUploadDialogInitProps &
  ImageUploadDialogRuntimeProps;

// --- State machine ---
//
// As of 4.11.7 the dialog does NOT stop in a cropper review step on new
// uploads (completing the #750 issue 1 "rapid-batch" directive across
// both ItemCardEditor and this dialog). File/URL inputs land directly
// in `Uploading`. The cropper only appears in the `EditExisting` phase
// — the deliberate edit-existing-image flow where the user has asked
// to crop/zoom/rotate an already-placed image.

type DialogPhase =
  | { name: 'EditExisting'; imageUrl: string }
  | { name: 'EmptyImage' }
  | { name: 'FailedValidation'; errorMessage: string }
  | { name: 'Uploading'; imageData: File | Blob | string; skipUpload?: boolean }
  | { name: 'UploadError'; error: string; imageData: File | Blob | string };

type DialogAction =
  | { type: 'INPUT_FILE'; file: File }
  | { type: 'INPUT_URL'; url: string }
  | { type: 'INPUT_ERROR'; message: string }
  | { type: 'UPLOAD_ERROR'; error: string }
  | { type: 'UPLOAD_RETRY' }
  | { type: 'UPLOAD_DISCARD' }
  | { type: 'EDIT_CONFIRM'; croppedBlob?: Blob }
  | { type: 'UPLOAD_NEW' }
  | { type: 'RESET'; existingImageUrl: string | null };

function dialogReducer(state: DialogPhase, action: DialogAction): DialogPhase {
  switch (action.type) {
    case 'INPUT_FILE':
      return { name: 'Uploading', imageData: action.file };
    case 'INPUT_URL':
      return { name: 'Uploading', imageData: action.url };
    case 'INPUT_ERROR':
      return { name: 'FailedValidation', errorMessage: action.message };
    case 'UPLOAD_ERROR': {
      if (state.name === 'Uploading') {
        return { name: 'UploadError', error: action.error, imageData: state.imageData };
      }
      return state;
    }
    case 'UPLOAD_RETRY': {
      if (state.name === 'UploadError') {
        return { name: 'Uploading', imageData: state.imageData };
      }
      return state;
    }
    case 'UPLOAD_DISCARD': {
      if (state.name === 'UploadError') {
        return { name: 'EmptyImage' };
      }
      return state;
    }
    case 'EDIT_CONFIRM': {
      if (state.name === 'EditExisting') {
        // If the action carries a cropped blob, upload it as a new image.
        // If no blob (crop failed or no edits), confirm with the original URL.
        if (action.croppedBlob) {
          return { name: 'Uploading', imageData: action.croppedBlob };
        }
        return { name: 'Uploading', imageData: state.imageUrl, skipUpload: true };
      }
      return state;
    }
    case 'UPLOAD_NEW': {
      if (state.name === 'EditExisting') {
        return { name: 'EmptyImage' };
      }
      return state;
    }
    case 'RESET':
      if (action.existingImageUrl !== null) {
        return { name: 'EditExisting', imageUrl: action.existingImageUrl };
      }
      return { name: 'EmptyImage' };
    default:
      return state;
  }
}

// --- Component ---

/**
 * ImageUploadDialog — state-machine orchestrator for the full image upload flow.
 *
 * As of 4.11.7:
 * - Uploader is consumed from `ImageUploadProvider` via `useImageUploader`.
 * - New file/URL inputs skip the cropper review step and go directly to
 *   `Uploading` (rapid-batch UX). The cropper is reachable only via
 *   `EditExisting` when an existing image is already on record.
 */
export function ImageUploadDialog({
  config,
  existingImageUrl,
  onConfirm,
  open,
  onCancel,
  pendingInput,
}: ImageUploadDialogProps) {
  const uploader = useImageUploader();
  const [phase, dispatch] = React.useReducer(dialogReducer, { name: 'EmptyImage' });
  // Independent refs for crop/zoom/rotation — kept separate so zoom and
  // rotation changes don't clobber the last valid pixelCrop (#750 issue 5b).
  // pixelCropRef is updated only by onCropComplete (react-easy-crop's final
  // crop event); zoom and rotation refs by their own callbacks.
  const pixelCropRef = React.useRef<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );
  const zoomRef = React.useRef<number>(1);
  const rotationRef = React.useRef<number>(0);

  // Prefetched blob URL for CDN images — eliminates CORS mismatch between
  // the Cropper (use-credentials) and getCroppedImage (anonymous) by
  // fetching the image once with credentials and using the same-origin
  // blob URL for both display and canvas operations.
  const [prefetchedImageUrl, setPrefetchedImageUrl] = React.useState<string | null>(null);

  // Stable refs for callbacks/uploader used in effects to avoid stale closures.
  const onConfirmRef = React.useRef(onConfirm);
  onConfirmRef.current = onConfirm;
  const uploaderRef = React.useRef(uploader);
  uploaderRef.current = uploader;

  // Reset state when dialog opens/closes
  const resetEditRefs = React.useCallback(() => {
    pixelCropRef.current = null;
    zoomRef.current = 1;
    rotationRef.current = 0;
  }, []);
  React.useEffect(() => {
    // When the dialog opens with a pendingInput already queued, skip the
    // EditExisting initial state — the pendingInput effect will dispatch
    // INPUT_FILE/INPUT_URL into Uploading on the same render. Starting
    // in EditExisting would kick off a CDN prefetch that immediately gets
    // discarded, wasting a network round-trip.
    const initialExistingUrl = open && !pendingInput ? existingImageUrl : null;
    dispatch({ type: 'RESET', existingImageUrl: initialExistingUrl });
    resetEditRefs();
    setPrefetchedImageUrl(null);
  }, [open]); // Intentionally deps on open only — existingImageUrl/pendingInput captured at open time

  // Prefetch CDN image as blob when entering EditExisting phase. The promise
  // is also kept in a ref so handleEditConfirm can await it deterministically
  // — protecting against the race where the user clicks Accept before the
  // initial prefetch effect's microtask resolves.
  const prefetchPromiseRef = React.useRef<Promise<string> | null>(null);
  React.useEffect(() => {
    if (phase.name !== 'EditExisting') {
      return;
    }
    let revoke: string | null = null;
    let cancelled = false;
    const promise = prefetchImageAsBlob(phase.imageUrl);
    prefetchPromiseRef.current = promise;
    promise.then((blobUrl) => {
      if (cancelled) {
        if (blobUrl !== phase.imageUrl) URL.revokeObjectURL(blobUrl);
        return;
      }
      if (blobUrl !== phase.imageUrl) revoke = blobUrl;
      setPrefetchedImageUrl(blobUrl);
    });
    return () => {
      cancelled = true;
      // Clear state alongside the revoke so a stale revoked URL never lingers
      // in component state (and never gets re-rendered as a dead <img src>).
      setPrefetchedImageUrl(null);
      prefetchPromiseRef.current = null;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [phase.name, phase.name === 'EditExisting' ? (phase as { imageUrl: string }).imageUrl : null]);

  // Trigger upload when entering the Uploading phase
  React.useEffect(() => {
    if (phase.name !== 'Uploading') return;

    let cancelled = false;
    const imageData = phase.imageData;

    // EditExisting accept (skipUpload) — confirm directly with the existing URL.
    if (phase.skipUpload && typeof imageData === 'string') {
      onConfirmRef.current({
        imageUrl: imageData,
        wasCompressed: false,
        originalSizeBytes: 0,
        finalSizeBytes: 0,
      });
      return () => {
        cancelled = true;
      };
    }

    // For new uploads, the two input kinds take different paths on the
    // ImageUploader interface:
    //
    // - Blob/File → `uploader.uploadFile(bytes)`.
    // - string URL → `uploader.uploadFromUrl(url)`, which performs the
    //   server-side fetch + upload round-trip.
    //
    // If no `ImageUploadProvider` is mounted, `useImageUploader` returns
    // the bundled default stub — so stories and dev harnesses work out
    // of the box. Production consumers must mount a real provider.
    const uploadPromise: Promise<string> =
      typeof imageData === 'string'
        ? uploaderRef.current.uploadFromUrl(imageData)
        : uploaderRef.current.uploadFile(imageData);

    const originalSize = typeof imageData === 'string' ? 0 : imageData.size;
    uploadPromise
      .then((imageUrl) => {
        if (cancelled) return;
        onConfirmRef.current({
          imageUrl,
          wasCompressed: false,
          originalSizeBytes: originalSize,
          finalSizeBytes: originalSize,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Upload failed';
        dispatch({ type: 'UPLOAD_ERROR', error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [phase.name]); // Intentionally deps on phase.name only — fires once on entering Uploading

  const handleInput = React.useCallback((input: ImageInput) => {
    if (input.type === 'file') {
      dispatch({ type: 'INPUT_FILE', file: input.file });
    } else if (input.type === 'url') {
      // Reachability check; transition optimistically
      uploaderRef.current.checkReachability(input.url).then((reachable) => {
        if (reachable) {
          dispatch({ type: 'INPUT_URL', url: input.url });
        } else {
          dispatch({ type: 'INPUT_ERROR', message: 'URL could not be reached' });
        }
      });
    } else {
      dispatch({ type: 'INPUT_ERROR', message: input.message });
    }
  }, []);

  // Forward externally-supplied pendingInput through the same state-machine
  // path as the dialog's internal ImageDropZone. Tracked by referential
  // identity: a new ImageInput object is treated as a new dispatch, the
  // same object on re-render is ignored. Reset on `open` transitioning to
  // false so the next open with a new pendingInput re-dispatches cleanly.
  const lastDispatchedInputRef = React.useRef<ImageInput | undefined>(undefined);
  React.useEffect(() => {
    if (!open) {
      lastDispatchedInputRef.current = undefined;
      return;
    }
    if (pendingInput && pendingInput !== lastDispatchedInputRef.current) {
      lastDispatchedInputRef.current = pendingInput;
      handleInput(pendingInput);
    }
  }, [open, pendingInput, handleInput]);

  const handleEditConfirm = React.useCallback(async () => {
    if (phase.name !== 'EditExisting') return;

    const pixelCrop = pixelCropRef.current;
    const zoom = zoomRef.current;
    const rotation = rotationRef.current;

    // Determine if the user made any edits. Each edit type has its own ref,
    // so they never clobber each other.
    const hasCropArea = pixelCrop !== null && pixelCrop.width > 0 && pixelCrop.height > 0;
    const hasZoom = zoom !== 1;
    const hasRotation = rotation !== 0;
    const hasEdits = hasCropArea || hasZoom || hasRotation;

    if (hasEdits) {
      try {
        // Use the prefetched blob URL (same-origin) to avoid the CORS
        // mismatch between the Cropper and the canvas. If the user clicked
        // Accept before the prefetch effect's microtask resolved, await the
        // in-flight promise here so getCroppedImage never sees a raw CDN URL.
        const imageSource =
          prefetchedImageUrl ??
          (await (prefetchPromiseRef.current ?? Promise.resolve(phase.imageUrl)));
        // pixelCrop may be null if the user only zoomed/rotated — pass a
        // zero-sized rect to signal "use full canvas".
        const effectiveCrop = pixelCrop ?? { x: 0, y: 0, width: 0, height: 0 };
        const croppedBlob = await getCroppedImage({
          imageSrc: imageSource,
          pixelCrop: effectiveCrop,
          rotation,
          zoom,
        });
        // Upload the cropped/rotated image as a new file via the
        // uploader; the Uploading effect picks up the Blob imageData.
        dispatch({ type: 'EDIT_CONFIRM', croppedBlob });
        return;
      } catch {
        // Canvas operation failed unexpectedly. Fall through to confirm with
        // the original URL unchanged rather than silently losing the edit.
      }
    }
    // No edits or crop failed — confirm with the original URL as-is.
    dispatch({ type: 'EDIT_CONFIRM' });
  }, [phase, prefetchedImageUrl]);

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (!isOpen) onCancel();
    },
    [onCancel],
  );

  const isUploading = phase.name === 'Uploading';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-slot="image-upload-dialog"
        className={cn(
          'bg-background border-border rounded-lg p-4 sm:p-6 sm:max-w-2xl w-full overflow-hidden',
        )}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            {phase.name === 'EditExisting'
              ? `Edit ${config.propertyDisplayName}`
              : phase.name === 'Uploading'
                ? `Upload ${config.propertyDisplayName}`
                : `Add ${config.propertyDisplayName}`}
          </DialogTitle>
        </DialogHeader>

        {/* EditExisting state — side-by-side with baked-in action buttons */}
        {phase.name === 'EditExisting' && (
          <ImageComparisonLayout
            existingImageUrl={phase.imageUrl}
            entityTypeDisplayName={config.entityTypeDisplayName}
            propertyDisplayName={config.propertyDisplayName}
            onAccept={() => void handleEditConfirm()}
            onDismiss={onCancel}
            onUploadNew={() => dispatch({ type: 'UPLOAD_NEW' })}
          >
            <ImagePreviewEditor
              aspectRatio={config.aspectRatio}
              imageData={prefetchedImageUrl ?? phase.imageUrl}
              onCropComplete={(pc) => {
                pixelCropRef.current = pc;
              }}
              onZoomChange={(z) => {
                zoomRef.current = z;
              }}
              onRotationChange={(r) => {
                rotationRef.current = r;
              }}
              onReset={resetEditRefs}
            />
          </ImageComparisonLayout>
        )}

        {/* EmptyImage state */}
        {phase.name === 'EmptyImage' && (
          <ImageDropZone acceptedFormats={config.acceptedFormats} onInput={handleInput} />
        )}

        {/* FailedValidation state */}
        {phase.name === 'FailedValidation' && (
          <div className="flex flex-col gap-3">
            <p className={cn('text-sm text-destructive')} role="alert">
              {phase.errorMessage}
            </p>
            <ImageDropZone acceptedFormats={config.acceptedFormats} onInput={handleInput} />
          </div>
        )}

        {/* Uploading state — indeterminate spinner (FD-04) */}
        {phase.name === 'Uploading' && (
          <div className="flex flex-col items-center gap-4 py-8" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Uploading image&#8230;</p>
          </div>
        )}

        {/* UploadError state — error message with retry/discard */}
        {phase.name === 'UploadError' && (
          <div className="flex flex-col gap-4">
            <p className={cn('text-sm text-destructive')} role="alert">
              {phase.error}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => dispatch({ type: 'UPLOAD_DISCARD' })}
              >
                Discard
              </Button>
              <Button type="button" onClick={() => dispatch({ type: 'UPLOAD_RETRY' })}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Footer for empty/failed states — just dismiss */}
        {(phase.name === 'EmptyImage' || phase.name === 'FailedValidation') && (
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </DialogFooter>
        )}

        {/* Uploading footer */}
        {isUploading && (
          <DialogFooter>
            <Button type="button" variant="secondary" disabled>
              Uploading&#8230;
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
