import * as React from 'react';
import { Eye, XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { cn } from '@/types/canary/utilities/utils';
import { Dialog, DialogClose, DialogPortal } from '@/components/canary/atoms/dialog/dialog';
import { Button } from '@/components/canary/primitives/button';

// --- Interfaces ---

/** Static configuration for ImageInspectorOverlay. */
export interface ImageInspectorOverlayStaticProps {}

/** Init configuration for ImageInspectorOverlay. */
export interface ImageInspectorOverlayInitProps {}

/** Runtime configuration for ImageInspectorOverlay (live data and callbacks). */
export interface ImageInspectorOverlayRuntimeProps {
  /** URL of the image to display full-size. */
  imageUrl: string;
  /**
   * Whether the overlay is open (controlled mode).
   * When omitted the component manages its own open state (uncontrolled mode)
   * and a trigger button is rendered to open the overlay.
   */
  open?: boolean;
  /** Callback when the overlay should close (Escape, click-outside, close button). */
  onClose?: () => void;
  /** Optional callback for the Edit button. When undefined, no Edit button is rendered. */
  onEdit?: () => void;
}

/** Combined props for ImageInspectorOverlay. */
export type ImageInspectorOverlayProps = ImageInspectorOverlayStaticProps &
  ImageInspectorOverlayInitProps &
  ImageInspectorOverlayRuntimeProps;

/**
 * ImageInspectorOverlay &#8212; full-size image modal overlay with optional Edit action.
 *
 * Supports two usage modes:
 *
 * - **Controlled**: pass `open` + `onClose` from the parent. The parent manages visibility.
 * - **Uncontrolled**: omit `open` and `onClose`. The component renders a trigger button
 *   and manages its own open state internally.
 *
 * Displays the image at up to full viewport height (`max-h-[90vh]`) with `object-contain`.
 * When `onEdit` is provided, an Edit button is shown in the footer; clicking it calls
 * `onEdit` and closes the overlay.
 *
 * Standard Dialog dismiss methods apply: Escape key, click-outside, and the close button.
 */
export function ImageInspectorOverlay({
  imageUrl,
  open: controlledOpen,
  onClose: controlledOnClose,
  onEdit,
}: ImageInspectorOverlayProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = isControlled ? controlledOpen : internalOpen;
  const handleClose = React.useCallback(() => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
  }, [isControlled, controlledOnClose]);

  const handleEdit = () => {
    onEdit?.();
    handleClose();
  };

  return (
    <div data-slot="image-inspector-overlay">
      {/* Uncontrolled mode: render a trigger button */}
      {!isControlled && (
        <button
          type="button"
          aria-label="Inspect image"
          onClick={() => setInternalOpen(true)}
          className={cn(
            'text-muted-foreground hover:text-foreground transition-colors',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm',
          )}
        >
          <Eye className="size-4" aria-hidden="true" />
        </button>
      )}
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogPortal>
          {/* Custom backdrop with bg-background/80 */}
          <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
              'fixed inset-0 z-50 bg-background/80',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            )}
          />
          {/* Dialog content panel */}
          <DialogPrimitive.Content
            data-slot="dialog-content"
            className={cn(
              'fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
              'flex flex-col items-center gap-4',
              'w-auto max-w-[calc(100vw-2rem)]',
              'rounded-lg border bg-background p-4 shadow-lg outline-none',
              'duration-200',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            )}
          >
            {/* Close button */}
            <DialogClose asChild>
              <button
                data-slot="inspector-close"
                aria-label="Close"
                className={cn(
                  'absolute top-3 right-3 rounded-sm p-1',
                  'text-muted-foreground hover:text-foreground',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                <XIcon className="size-5" />
              </button>
            </DialogClose>

            {/* Image */}
            <img
              src={imageUrl}
              alt="Full size preview"
              className="max-w-full max-h-[90vh] object-contain rounded"
            />

            {/* Footer — only rendered when onEdit is provided */}
            {onEdit !== undefined && (
              <div className="flex justify-end w-full">
                <Button className="bg-primary text-primary-foreground" onClick={handleEdit}>
                  Edit
                </Button>
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
