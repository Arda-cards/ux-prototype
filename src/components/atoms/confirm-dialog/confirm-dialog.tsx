import { useCallback, useEffect, useId, useRef } from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration. */
export interface ArdaConfirmDialogStaticConfig {
  /** Dialog title. */
  title: string;
  /** Descriptive message body. */
  message: string;
  /** Label for the confirm (destructive) action. Default: "Confirm". */
  confirmLabel?: string;
  /** Label for the cancel (safe) action. Default: "Cancel". */
  cancelLabel?: string;
  /** Visual style of the confirm button. Default: "destructive". */
  confirmVariant?: 'destructive' | 'primary';
}

/** Runtime configuration. */
export interface ArdaConfirmDialogRuntimeConfig {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Called when the user cancels or closes. */
  onCancel: () => void;
}

export interface ArdaConfirmDialogProps
  extends ArdaConfirmDialogStaticConfig, ArdaConfirmDialogRuntimeConfig {}

export function ArdaConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  open,
  onConfirm,
  onCancel,
}: ArdaConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap: move focus into dialog when opened, restore when closed
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      // Focus the first focusable element (cancel button) after render
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstEl = focusable?.[0];
      if (firstEl) {
        firstEl.focus();
      }
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
      // Focus trap: cycle focus within dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0] as HTMLElement | undefined;
        const last = focusable[focusable.length - 1] as HTMLElement | undefined;
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onCancel],
  );

  if (!open) return null;

  const confirmButtonStyles =
    confirmVariant === 'destructive'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';

  return (
    // Backdrop overlay
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-200"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(
          'relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl',
          'animate-in fade-in duration-200',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-sm text-gray-600">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
              confirmButtonStyles,
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
