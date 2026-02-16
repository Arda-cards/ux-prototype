'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { X, Pencil, Building2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ArdaBadge, type ArdaBadgeVariant } from '@/components/atoms/badge/badge';
import { ArdaConfirmDialog } from '@/components/atoms/confirm-dialog/confirm-dialog';
import type {
  BusinessAffiliate,
  BusinessRoleType,
} from '@/types/reference/business-affiliates/business-affiliate';
import { getContactDisplayName } from '@/types/model/assets/contact';
import { ArdaSupplierForm } from '@/components/organisms/reference/business-affiliates/supplier-form/supplier-form';
/* ------------------------------------------------------------------ */
/*  Config Interfaces                                                  */
/* ------------------------------------------------------------------ */

export type SupplierDrawerMode = 'view' | 'add' | 'edit';

/** Supplied item row for the Items tab. */
export interface SuppliedItemRow {
  itemId: string;
  itemName: string;
  supplierSku?: string;
  unitCost?: string;
  designation?: string;
}

/** Design-time configuration for ArdaSupplierDrawer. */
export interface ArdaSupplierDrawerStaticConfig {
  title?: string;
}

/** Runtime configuration for ArdaSupplierDrawer. */
export interface ArdaSupplierDrawerRuntimeConfig {
  open: boolean;
  mode: SupplierDrawerMode;
  affiliate?: BusinessAffiliate;
  suppliedItems?: SuppliedItemRow[];
  onClose: () => void;
  onSubmit?: (data: BusinessAffiliate) => void;
  onEdit?: () => void;
  onItemClick?: (itemId: string) => void;
}

/** Combined props for ArdaSupplierDrawer. */
export interface ArdaSupplierDrawerProps
  extends ArdaSupplierDrawerStaticConfig, ArdaSupplierDrawerRuntimeConfig {}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ROLE_LABELS: Record<BusinessRoleType, string> = {
  VENDOR: 'Vendor',
  CUSTOMER: 'Customer',
  CARRIER: 'Carrier',
  OPERATOR: 'Operator',
  OTHER: 'Other',
};

const ROLE_VARIANTS: Record<BusinessRoleType, ArdaBadgeVariant> = {
  VENDOR: 'info',
  CUSTOMER: 'success',
  CARRIER: 'warning',
  OPERATOR: 'default',
  OTHER: 'outline',
};

function emptyAffiliate(): BusinessAffiliate {
  return {
    eId: '',
    name: '',
    legal: {},
    roles: [],
  };
}

function isAffiliateDirty(a: BusinessAffiliate, b: BusinessAffiliate): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

/* ------------------------------------------------------------------ */
/*  View-mode sub-components                                           */
/* ------------------------------------------------------------------ */

function FieldRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/50 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right max-w-[60%] break-words">
        {value || '-'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  View Tab: Details                                                  */
/* ------------------------------------------------------------------ */

function DetailsTab({ affiliate }: { affiliate: BusinessAffiliate }) {
  const info = affiliate.legal;
  const contact = affiliate.contact;
  const address = affiliate.mainAddress;

  const addressParts = [
    address?.addressLine1,
    address?.addressLine2,
    [address?.city, address?.state].filter(Boolean).join(', '),
    address?.postalCode,
    address?.country,
  ].filter(Boolean);

  return (
    <>
      {/* Roles */}
      {affiliate.roles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {affiliate.roles.map((role) => (
            <ArdaBadge key={role.role} variant={ROLE_VARIANTS[role.role]}>
              {ROLE_LABELS[role.role]}
            </ArdaBadge>
          ))}
        </div>
      )}

      {/* Contact */}
      <Section title="Contact">
        <FieldRow label="Name" value={getContactDisplayName(contact) || undefined} />
        <FieldRow label="Email" value={contact?.email} />
        <FieldRow label="Phone" value={contact?.phone} />
        <FieldRow
          label="Address"
          value={addressParts.length > 0 ? addressParts.join(', ') : undefined}
        />
      </Section>

      {/* Legal */}
      <Section title="Legal Information">
        <FieldRow label="Legal Name" value={info?.legalName} />
        <FieldRow label="Country" value={info?.country} />
        <FieldRow label="Tax ID" value={info?.taxId} />
      </Section>

      {/* Notes */}
      {affiliate.notes && (
        <Section title="Notes">
          <p className="text-sm text-foreground">{affiliate.notes}</p>
        </Section>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  View Tab: Items                                                    */
/* ------------------------------------------------------------------ */

function ItemsTab({
  items,
  onItemClick,
}: {
  items: SuppliedItemRow[];
  onItemClick?: (itemId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">No items are linked to this supplier.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">
              Item
            </th>
            <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">
              SKU
            </th>
            <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">
              Unit Cost
            </th>
            <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">
              Designation
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.itemId} className="border-b border-border/50 last:border-b-0">
              <td className="py-2">
                {onItemClick ? (
                  <button
                    type="button"
                    onClick={() => onItemClick(item.itemId)}
                    className="text-accent-blue hover:underline text-left"
                  >
                    {item.itemName}
                  </button>
                ) : (
                  <span>{item.itemName}</span>
                )}
              </td>
              <td className="py-2 text-muted-foreground font-mono text-xs">
                {item.supplierSku ?? '-'}
              </td>
              <td className="py-2 text-foreground">{item.unitCost ?? '-'}</td>
              <td className="py-2 text-muted-foreground">{item.designation ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ArdaSupplierDrawer Component                                       */
/* ------------------------------------------------------------------ */

export function ArdaSupplierDrawer({
  title,
  open,
  mode,
  affiliate,
  suppliedItems = [],
  onClose,
  onSubmit,
  onEdit,
  onItemClick,
}: ArdaSupplierDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Tab state for view mode
  const [activeTab, setActiveTab] = useState<'details' | 'items'>('details');

  // Form state
  const initialFormData = mode === 'edit' && affiliate ? affiliate : emptyAffiliate();
  const [formData, setFormData] = useState<BusinessAffiliate>(initialFormData);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const originalRef = useRef<BusinessAffiliate>(initialFormData);

  // Re-initialize form when mode or affiliate changes
  useEffect(() => {
    const data = mode === 'edit' && affiliate ? affiliate : emptyAffiliate();
    setFormData(data);
    originalRef.current = data;
    setActiveTab('details');
  }, [mode, affiliate]);

  const resolvedTitle =
    title ??
    (mode === 'view'
      ? (affiliate?.name ?? 'Supplier Details')
      : mode === 'add'
        ? 'Add Supplier'
        : 'Edit Supplier');

  const isDirty = useCallback(() => {
    if (mode === 'view') return false;
    return isAffiliateDirty(formData, originalRef.current);
  }, [formData, mode]);

  const handleCancel = useCallback(() => {
    if (isDirty()) {
      setConfirmOpen(true);
    } else if (mode === 'edit') {
      onEdit?.();
    } else {
      onClose();
    }
  }, [isDirty, mode, onEdit, onClose]);

  const handleConfirmDiscard = useCallback(() => {
    setConfirmOpen(false);
    if (mode === 'edit') {
      setFormData(originalRef.current);
      onEdit?.();
    } else {
      onClose();
    }
  }, [mode, onEdit, onClose]);

  const handleSubmit = useCallback(() => {
    onSubmit?.(formData);
  }, [formData, onSubmit]);

  const handleCloseRequest = useCallback(() => {
    if (mode === 'view') {
      onClose();
    } else {
      handleCancel();
    }
  }, [mode, onClose, handleCancel]);

  // Escape key
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (confirmOpen) return;
      if (e.key === 'Escape') {
        if (mode === 'view') {
          onClose();
        } else {
          handleCancel();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, mode, handleCancel, confirmOpen]);

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
        onClick={handleCloseRequest}
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
            onClick={handleCloseRequest}
            aria-label="Close drawer"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs (view mode only) */}
        {mode === 'view' && (
          <div className="flex border-b border-border px-6">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'details'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'items'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              Items
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {mode === 'view' && affiliate && activeTab === 'details' && (
            <DetailsTab affiliate={affiliate} />
          )}
          {mode === 'view' && activeTab === 'items' && (
            <ItemsTab items={suppliedItems} {...(onItemClick ? { onItemClick } : {})} />
          )}
          {(mode === 'add' || mode === 'edit') && (
            <ArdaSupplierForm value={formData} onChange={setFormData} mode="single-scroll" />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          {mode === 'view' && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
          {(mode === 'add' || mode === 'edit') && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                {mode === 'add' ? 'Add Supplier' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirm discard dialog */}
      <ArdaConfirmDialog
        open={confirmOpen}
        title="Discard changes?"
        message="You have unsaved changes that will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        confirmVariant="destructive"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
