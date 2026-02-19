import { useCallback, useEffect, useId, useRef } from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration. */
export interface ArdaConfirmDialogStaticConfig {
  /* --- Model / Data Binding --- */
  /** Dialog title. */
  title: string;
  /** Descriptive message body. */
  message: string;

  /* --- View / Layout / Controller --- */
  /** Label for the confirm (destructive) action. Default: "Confirm". */
  confirmLabel?: string;
  /** Label for the cancel (safe) action. Default: "Cancel". */
  cancelLabel?: string;
  /** Visual style of the confirm button. Default: "destructive". */
  confirmVariant?: 'destructive' | 'primary';
}

/** Runtime configuration. */
export interface ArdaConfirmDialogRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Called when the user cancels or closes. */
  onCancel: () => void;

  /* --- View / Layout / Controller --- */
  /** Whether the dialog is open. */
  open: boolean;
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
      ? 'bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive'
      : 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary';

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
          'relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg',
          'animate-in fade-in duration-200',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-sm text-muted-foreground">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
