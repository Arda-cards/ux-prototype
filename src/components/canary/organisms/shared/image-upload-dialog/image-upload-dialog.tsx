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
import { Progress } from '@/components/canary/primitives/progress';
import { Button } from '@/components/canary/primitives/button';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { ImageComparisonLayout } from '@/components/canary/molecules/image-comparison-layout/image-comparison-layout';
import { CopyrightAcknowledgment } from '@/components/canary/atoms/copyright-acknowledgment/copyright-acknowledgment';
import { mockUpload, mockReachabilityCheck } from '@/components/canary/__mocks__/image-story-data';
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

/** Runtime props for ImageUploadDialog. */
export interface ImageUploadDialogRuntimeProps {
  existingImageUrl: string | null;
  onConfirm: (result: ImageUploadResult) => void;
  open: boolean;
  onCancel: () => void;
}

/** Combined props for ImageUploadDialog. */
export type ImageUploadDialogProps = ImageUploadDialogStaticProps &
  ImageUploadDialogInitProps &
  ImageUploadDialogRuntimeProps;

// --- State machine ---

type DialogPhase =
  | { name: 'EmptyImage' }
  | { name: 'ProvidedImage'; imageData: File | Blob | string }
  | { name: 'FailedValidation'; errorMessage: string }
  | { name: 'Uploading'; imageData: File | Blob | string; progress: number }
  | { name: 'Warn'; imageData: File | Blob | string };

type DialogAction =
  | { type: 'INPUT_FILE'; file: File }
  | { type: 'INPUT_URL'; url: string }
  | { type: 'INPUT_ERROR'; message: string }
  | { type: 'CANCEL_CLICK' }
  | { type: 'CONFIRM_CLICK' }
  | { type: 'UPLOAD_PROGRESS'; progress: number }
  | { type: 'WARN_DISCARD' }
  | { type: 'WARN_GO_BACK' }
  | { type: 'RESET' };

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
        return { name: 'Uploading', imageData: state.imageData, progress: 0 };
      }
      return state;
    }
    case 'UPLOAD_PROGRESS': {
      if (state.name === 'Uploading') {
        return { ...state, progress: action.progress };
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
    case 'RESET':
      return { name: 'EmptyImage' };
    default:
      return state;
  }
}

// --- Component ---

/**
 * ImageUploadDialog &#8212; state-machine orchestrator for the full image upload flow.
 *
 * Manages the EmptyImage &#8594; ProvidedImage &#8594; Uploading lifecycle plus
 * FailedValidation and Warn guard states.
 */
export function ImageUploadDialog({
  config,
  existingImageUrl,
  onConfirm,
  open,
  onCancel,
}: ImageUploadDialogProps) {
  const [phase, dispatch] = React.useReducer(dialogReducer, { name: 'EmptyImage' });
  const [copyrightAcked, setCopyrightAcked] = React.useState(false);
  // cropData tracks current crop/zoom/rotation for use in the real upload pipeline
  const cropDataRef = React.useRef<unknown>(null);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      dispatch({ type: 'RESET' });
      setCopyrightAcked(false);
      cropDataRef.current = null;
    }
  }, [open]);

  // Handle upload progress simulation
  React.useEffect(() => {
    if (phase.name !== 'Uploading') return;

    const imageData = phase.imageData;
    const startTime = Date.now();
    const duration = 1500;

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      dispatch({ type: 'UPLOAD_PROGRESS', progress });

      if (progress >= 100) {
        clearInterval(intervalId);
        const blob = typeof imageData === 'string' ? new Blob([]) : imageData;
        mockUpload(blob).then((imageUrl) => {
          onConfirm({
            imageUrl,
            wasCompressed: false,
            originalSizeBytes: blob.size,
            finalSizeBytes: blob.size,
          });
        });
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [phase.name]); // Intentionally deps on phase.name only — fires once on entering Uploading

  const handleInput = React.useCallback((input: ImageInput) => {
    if (input.type === 'file') {
      dispatch({ type: 'INPUT_FILE', file: input.file });
      setCopyrightAcked(false);
    } else if (input.type === 'url') {
      // Mock reachability check; transition optimistically
      mockReachabilityCheck(input.url).then((reachable) => {
        if (reachable) {
          dispatch({ type: 'INPUT_URL', url: input.url });
          setCopyrightAcked(false);
        } else {
          dispatch({ type: 'INPUT_ERROR', message: 'URL could not be reached' });
        }
      });
    } else {
      dispatch({ type: 'INPUT_ERROR', message: input.message });
    }
  }, []);

  const handleCancelClick = React.useCallback(() => {
    if (phase.name === 'ProvidedImage') {
      dispatch({ type: 'CANCEL_CLICK' });
    } else {
      onCancel();
    }
  }, [phase.name, onCancel]);

  const handleConfirmClick = React.useCallback(() => {
    if (phase.name === 'ProvidedImage' && copyrightAcked) {
      dispatch({ type: 'CONFIRM_CLICK' });
    }
  }, [phase.name, copyrightAcked]);

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
  const isProvidedOrUploading =
    phase.name === 'ProvidedImage' || phase.name === 'Uploading' || phase.name === 'Warn';

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          data-slot="image-upload-dialog"
          className={cn('bg-background border-border rounded-lg p-6 max-w-2xl w-full')}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>
              {isProvidedOrUploading
                ? `Edit ${config.propertyDisplayName}`
                : `Add ${config.propertyDisplayName}`}
            </DialogTitle>
          </DialogHeader>

          {/* EmptyImage state */}
          {phase.name === 'EmptyImage' && (
            <ImageDropZone
              acceptedFormats={config.acceptedFormats}
              onInput={handleInput}
              onDismiss={onCancel}
            />
          )}

          {/* FailedValidation state */}
          {phase.name === 'FailedValidation' && (
            <div className="flex flex-col gap-3">
              <p className={cn('text-sm text-destructive')} role="alert">
                {phase.errorMessage}
              </p>
              <ImageDropZone
                acceptedFormats={config.acceptedFormats}
                onInput={handleInput}
                onDismiss={onCancel}
              />
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
              <CopyrightAcknowledgment
                acknowledged={copyrightAcked}
                onAcknowledge={setCopyrightAcked}
              />
            </div>
          )}

          {/* Uploading state */}
          {phase.name === 'Uploading' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground text-center">Uploading image&#8230;</p>
              <Progress value={phase.progress} className="bg-muted" />
            </div>
          )}

          {/* Footer — hidden during upload */}
          {!isUploading && phase.name !== 'EmptyImage' && phase.name !== 'FailedValidation' && (
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                className="bg-secondary text-secondary-foreground"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={cn(
                  'bg-primary text-primary-foreground',
                  'disabled:pointer-events-none disabled:opacity-50',
                )}
                disabled={!copyrightAcked}
                onClick={handleConfirmClick}
              >
                Confirm
              </Button>
            </DialogFooter>
          )}

          {/* Footer for empty/failed states — just dismiss */}
          {(phase.name === 'EmptyImage' || phase.name === 'FailedValidation') && (
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                className="bg-secondary text-secondary-foreground"
                onClick={onCancel}
              >
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
