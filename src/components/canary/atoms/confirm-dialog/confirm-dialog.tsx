import { useCallback, useEffect, useId, useRef } from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Button } from '@/components/canary/primitives/button';

export interface ArdaConfirmDialogStaticConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'destructive' | 'primary';
}

export interface ArdaConfirmDialogRuntimeConfig {
  onConfirm: () => void;
  onCancel: () => void;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl bg-background p-6 shadow-lg',
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
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant === 'primary' ? 'default' : 'destructive'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
