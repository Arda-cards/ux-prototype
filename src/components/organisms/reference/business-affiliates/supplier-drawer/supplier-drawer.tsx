'use client';

import { useEffect, useId, useRef } from 'react';
import { X, Building2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { BusinessAffiliate } from '@/types/reference/business-affiliates/business-affiliate';
import { ArdaSupplierViewer } from '@/components/organisms/reference/business-affiliates/arda-supplier-viewer';
import { supplierTabs } from '@/components/organisms/reference/business-affiliates/arda-supplier-viewer/configs/stepped-layout';
import { supplierFieldOrder } from '@/components/organisms/reference/business-affiliates/arda-supplier-viewer/configs/continuous-scroll-layout';

/* ------------------------------------------------------------------ */
/*  Config Interfaces                                                  */
/* ------------------------------------------------------------------ */

export type SupplierDrawerMode = 'view' | 'add';

/** Design-time configuration for ArdaSupplierDrawer. */
export interface ArdaSupplierDrawerStaticConfig {
  title?: string;
}

/** Runtime configuration for ArdaSupplierDrawer. */
export interface ArdaSupplierDrawerRuntimeConfig {
  open: boolean;
  mode: SupplierDrawerMode;
  affiliate?: BusinessAffiliate;
  onClose: () => void;
}

/** Combined props for ArdaSupplierDrawer. */
export interface ArdaSupplierDrawerProps
  extends ArdaSupplierDrawerStaticConfig, ArdaSupplierDrawerRuntimeConfig {}

/* ------------------------------------------------------------------ */
/*  ArdaSupplierDrawer Component                                       */
/* ------------------------------------------------------------------ */

export function ArdaSupplierDrawer({
  title,
  open,
  mode,
  affiliate,
  onClose,
}: ArdaSupplierDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const resolvedTitle =
    title ??
    (mode === 'view'
      ? (affiliate?.name ?? 'Supplier Details')
      : 'New Supplier');

  // Escape key
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Focus management
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 transition-all duration-300',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'fixed right-0 inset-y-0 z-50 w-full sm:w-[420px] lg:w-[460px] bg-white shadow-xl flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={20} className="text-muted-foreground shrink-0" />
            <h2 id={titleId} className="text-base font-semibold text-foreground truncate">
              {resolvedTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content — delegated to ArdaSupplierViewer */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {mode === 'view' && (
            <ArdaSupplierViewer
              editable={true}
              layoutMode="continuous-scroll"
              title={resolvedTitle}
              fieldOrder={supplierFieldOrder}
              {...(affiliate?.eId ? { entityId: affiliate.eId } : {})}
            />
          )}
          {mode === 'add' && (
            <ArdaSupplierViewer
              editable={true}
              layoutMode="stepped"
              title="New Supplier"
              tabs={supplierTabs}
            />
          )}
        </div>
      </div>
    </>
  );
}
