import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/canary/atoms/dialog/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/canary/primitives/alert-dialog';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/canary/primitives/button';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { ImageComparisonLayout } from '@/components/canary/molecules/image-comparison-layout/image-comparison-layout';
import {
  defaultUploadHandler,
  defaultReachabilityCheck,
} from '@/types/canary/utilities/image-upload-handlers';
import { getCroppedImage } from '@/types/canary/utilities/get-cropped-image';
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
 */
export interface ImageUploadDialogRuntimeProps {
  existingImageUrl: string | null;
  onConfirm: (result: ImageUploadResult) => void;
  open: boolean;
  onCancel: () => void;
  /**
   * Upload handler &#8212; receives the image blob, returns the CDN URL.
   * Defaults to `defaultUploadHandler` (Storybook/dev stub).
   */
  onUpload?: (file: Blob) => Promise<string>;
  /**
   * URL reachability check &#8212; returns true if the URL is reachable.
   * Defaults to `defaultReachabilityCheck`.
   */
  onCheckReachability?: (url: string) => Promise<boolean>;
}

/** Combined props for ImageUploadDialog. */
export type ImageUploadDialogProps = ImageUploadDialogStaticProps &
  ImageUploadDialogInitProps &
  ImageUploadDialogRuntimeProps;

// --- State machine ---

type DialogPhase =
  | { name: 'EditExisting'; imageUrl: string }
  | { name: 'EmptyImage' }
  | { name: 'ProvidedImage'; imageData: File | Blob | string }
  | { name: 'FailedValidation'; errorMessage: string }
  | { name: 'Uploading'; imageData: File | Blob | string }
  | { name: 'UploadError'; error: string; imageData: File | Blob | string }
  | { name: 'Warn'; imageData: File | Blob | string };

type DialogAction =
  | { type: 'INPUT_FILE'; file: File }
  | { type: 'INPUT_URL'; url: string }
  | { type: 'INPUT_ERROR'; message: string }
  | { type: 'CANCEL_CLICK' }
  | { type: 'CONFIRM_CLICK' }
  | { type: 'UPLOAD_ERROR'; error: string }
  | { type: 'UPLOAD_RETRY' }
  | { type: 'UPLOAD_DISCARD' }
  | { type: 'WARN_DISCARD' }
  | { type: 'WARN_GO_BACK' }
  | { type: 'EDIT_CONFIRM' }
  | { type: 'UPLOAD_NEW' }
  | { type: 'RESET'; existingImageUrl: string | null };

function dialogReducer(state: DialogPhase, action: DialogAction): DialogPhase {
  switch (action.type) {
    case 'INPUT_FILE':
      return { name: 'ProvidedImage', imageData: action.file };
    case 'INPUT_URL':
      return { name: 'ProvidedImage', imageData: action.url };
    case 'INPUT_ERROR':
      return { name: 'FailedValidation', errorMessage: action.message };
    case 'CANCEL_CLICK': {
      if (state.name === 'ProvidedImage') {
        return { name: 'Warn', imageData: state.imageData };
      }
      return state;
    }
    case 'CONFIRM_CLICK': {
      if (state.name === 'ProvidedImage') {
        return { name: 'Uploading', imageData: state.imageData };
      }
      return state;
    }
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
    case 'WARN_DISCARD':
      return { name: 'EmptyImage' };
    case 'WARN_GO_BACK': {
      if (state.name === 'Warn') {
        return { name: 'ProvidedImage', imageData: state.imageData };
      }
      return state;
    }
    case 'EDIT_CONFIRM': {
      if (state.name === 'EditExisting') {
        return { name: 'Uploading', imageData: state.imageUrl };
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
 * ImageUploadDialog &#8212; state-machine orchestrator for the full image upload flow.
 *
 * Manages the EditExisting / EmptyImage &#8594; ProvidedImage &#8594; Uploading lifecycle plus
 * FailedValidation and Warn guard states.
 */
export function ImageUploadDialog({
  config,
  existingImageUrl,
  onConfirm,
  open,
  onCancel,
  onUpload = defaultUploadHandler,
  onCheckReachability = defaultReachabilityCheck,
}: ImageUploadDialogProps) {
  const [phase, dispatch] = React.useReducer(dialogReducer, { name: 'EmptyImage' });
  // cropData tracks current crop/zoom/rotation for use in the real upload pipeline
  const cropDataRef = React.useRef<unknown>(null);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      dispatch({ type: 'RESET', existingImageUrl });
      cropDataRef.current = null;
    } else {
      dispatch({ type: 'RESET', existingImageUrl: null });
      cropDataRef.current = null;
    }
  }, [open]); // Intentionally deps on open only — existingImageUrl is captured at open time

  // Trigger upload when entering the Uploading phase
  React.useEffect(() => {
    if (phase.name !== 'Uploading') return;

    let cancelled = false;
    const imageData = phase.imageData;
    const blob = typeof imageData === 'string' ? new Blob([]) : imageData;

    onUpload(blob)
      .then((imageUrl) => {
        if (cancelled) return;
        onConfirm({
          imageUrl,
          wasCompressed: false,
          originalSizeBytes: blob.size,
          finalSizeBytes: blob.size,
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

  const handleInput = React.useCallback(
    (input: ImageInput) => {
      if (input.type === 'file') {
        dispatch({ type: 'INPUT_FILE', file: input.file });
      } else if (input.type === 'url') {
        // Reachability check; transition optimistically
        onCheckReachability(input.url).then((reachable) => {
          if (reachable) {
            dispatch({ type: 'INPUT_URL', url: input.url });
          } else {
            dispatch({ type: 'INPUT_ERROR', message: 'URL could not be reached' });
          }
        });
      } else {
        dispatch({ type: 'INPUT_ERROR', message: input.message });
      }
    },
    [onCheckReachability],
  );

  const handleCancelClick = React.useCallback(() => {
    if (phase.name === 'ProvidedImage') {
      dispatch({ type: 'CANCEL_CLICK' });
    } else {
      onCancel();
    }
  }, [phase.name, onCancel]);

  const handleConfirmClick = React.useCallback(() => {
    if (phase.name === 'ProvidedImage') {
      dispatch({ type: 'CONFIRM_CLICK' });
    }
  }, [phase.name]);

  const handleEditConfirm = React.useCallback(async () => {
    if (phase.name !== 'EditExisting') return;
    const cropData = cropDataRef.current as {
      pixelCrop: { x: number; y: number; width: number; height: number };
      rotation?: number;
    } | null;
    if (cropData !== null && cropData.pixelCrop.width > 0 && cropData.pixelCrop.height > 0) {
      try {
        await getCroppedImage(phase.imageUrl, cropData.pixelCrop, cropData.rotation ?? 0);
        // getCroppedImage result is not used directly — the upload effect handles the imageData
        // from the EDIT_CONFIRM transition which passes the original URL as imageData
      } catch {
        // Fall back to original URL if cropping fails
      }
    }
    dispatch({ type: 'EDIT_CONFIRM' });
  }, [phase]);

  const handleWarnDiscard = React.useCallback(() => {
    dispatch({ type: 'WARN_DISCARD' });
    onCancel();
  }, [onCancel]);

  const handleWarnGoBack = React.useCallback(() => {
    dispatch({ type: 'WARN_GO_BACK' });
  }, []);

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        if (phase.name === 'ProvidedImage') {
          dispatch({ type: 'CANCEL_CLICK' });
        } else {
          onCancel();
        }
      }
    },
    [phase.name, onCancel],
  );

  const isUploading = phase.name === 'Uploading';
  const isUploadError = phase.name === 'UploadError';
  const isProvidedOrUploading =
    phase.name === 'ProvidedImage' || phase.name === 'Uploading' || phase.name === 'Warn';

  return (
    <>
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
                : isProvidedOrUploading
                  ? `Edit ${config.propertyDisplayName}`
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
                imageData={phase.imageUrl}
                onCropChange={(d) => {
                  cropDataRef.current = d;
                }}
                onReset={() => {
                  cropDataRef.current = null;
                }}
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

          {/* ProvidedImage state */}
          {phase.name === 'ProvidedImage' && (
            <div className="flex flex-col gap-4">
              {existingImageUrl ? (
                <ImageComparisonLayout
                  existingImageUrl={existingImageUrl}
                  entityTypeDisplayName={config.entityTypeDisplayName}
                  propertyDisplayName={config.propertyDisplayName}
                >
                  <ImagePreviewEditor
                    aspectRatio={config.aspectRatio}
                    imageData={phase.imageData}
                    onCropChange={(d) => {
                      cropDataRef.current = d;
                    }}
                    onReset={() => {
                      cropDataRef.current = null;
                    }}
                  />
                </ImageComparisonLayout>
              ) : (
                <ImagePreviewEditor
                  aspectRatio={config.aspectRatio}
                  imageData={phase.imageData}
                  onCropChange={(d) => {
                    cropDataRef.current = d;
                  }}
                  onReset={() => {
                    cropDataRef.current = null;
                  }}
                />
              )}
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

          {/* Footer — shown only for ProvidedImage */}
          {/* EditExisting footer is baked into ImageComparisonLayout above */}
          {!isUploading &&
            !isUploadError &&
            phase.name !== 'EmptyImage' &&
            phase.name !== 'FailedValidation' &&
            phase.name !== 'EditExisting' &&
            phase.name !== 'Warn' && (
              <DialogFooter className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground text-center">
                  By confirming, you acknowledge that you own or have a license to use this image.
                </p>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={handleCancelClick}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleConfirmClick}>
                    Confirm
                  </Button>
                </div>
              </DialogFooter>
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

      {/* Warn AlertDialog */}
      <AlertDialog open={phase.name === 'Warn'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved image?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an image staged that has not been saved. Discarding will remove it
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleWarnGoBack}>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className={cn('bg-destructive text-destructive-foreground hover:bg-destructive/90')}
              onClick={handleWarnDiscard}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
