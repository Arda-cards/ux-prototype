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
  SUPPLIER: 'Vendor',
  CUSTOMER: 'Customer',
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
};

const ROLE_VARIANTS: Record<BusinessRoleType, ArdaBadgeVariant> = {
  SUPPLIER: 'info',
  CUSTOMER: 'success',
  MANUFACTURER: 'warning',
  DISTRIBUTOR: 'default',
};

const ALL_ROLE_TYPES: BusinessRoleType[] = ['SUPPLIER', 'CUSTOMER', 'MANUFACTURER', 'DISTRIBUTOR'];

function emptyAffiliate(): BusinessAffiliate {
  return {
    entityId: '',
    companyInformation: {},
    roles: [],
  };
}

function isAffiliateDirty(a: BusinessAffiliate, b: BusinessAffiliate): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

const fieldClasses =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

/**
 * Set or remove an optional key from an object.
 * Needed because exactOptionalPropertyTypes prevents `{ ...obj, key: val || undefined }`.
 */
function withOptional<T extends object, K extends keyof T>(obj: T, key: K, value: string): T {
  const copy = { ...obj };
  if (value) {
    (copy as Record<string, unknown>)[key as string] = value;
  } else {
    delete (copy as Record<string, unknown>)[key as string];
  }
  return copy;
}

/* ------------------------------------------------------------------ */
/*  View-mode sub-components                                           */
/* ------------------------------------------------------------------ */

function FieldRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 text-right max-w-[60%] break-words">
        {value || '-'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  View Tab: Details                                                  */
/* ------------------------------------------------------------------ */

function DetailsTab({ affiliate }: { affiliate: BusinessAffiliate }) {
  const info = affiliate.companyInformation;
  const contact = affiliate.primaryContact;
  const address = affiliate.address;

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
            <ArdaBadge key={role.type} variant={ROLE_VARIANTS[role.type]}>
              {ROLE_LABELS[role.type]}
            </ArdaBadge>
          ))}
        </div>
      )}

      {/* Contact */}
      <Section title="Contact">
        <FieldRow label="Name" value={contact?.name} />
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
          <p className="text-sm text-gray-700">{affiliate.notes}</p>
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
        <p className="text-sm text-gray-500">No items are linked to this supplier.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Item</th>
            <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">SKU</th>
            <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">
              Unit Cost
            </th>
            <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">
              Designation
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.itemId} className="border-b border-gray-100 last:border-b-0">
              <td className="py-2">
                {onItemClick ? (
                  <button
                    type="button"
                    onClick={() => onItemClick(item.itemId)}
                    className="text-blue-600 hover:underline text-left"
                  >
                    {item.itemName}
                  </button>
                ) : (
                  <span>{item.itemName}</span>
                )}
              </td>
              <td className="py-2 text-gray-500 font-mono text-xs">{item.supplierSku ?? '-'}</td>
              <td className="py-2 text-gray-700">{item.unitCost ?? '-'}</td>
              <td className="py-2 text-gray-500">{item.designation ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form Mode                                                          */
/* ------------------------------------------------------------------ */

function FormMode({
  formData,
  setFormData,
}: {
  formData: BusinessAffiliate;
  setFormData: React.Dispatch<React.SetStateAction<BusinessAffiliate>>;
}) {
  const info = formData.companyInformation ?? {};
  const contact = formData.primaryContact ?? {};
  const address = formData.address ?? {};
  const selectedRoles = new Set(formData.roles.map((r) => r.type));

  const toggleRole = (roleType: BusinessRoleType) => {
    setFormData((prev) => {
      const exists = prev.roles.some((r) => r.type === roleType);
      return {
        ...prev,
        roles: exists
          ? prev.roles.filter((r) => r.type !== roleType)
          : [...prev.roles, { type: roleType }],
      };
    });
  };

  const [legalOpen, setLegalOpen] = useState(Boolean(info.legalName || info.country || info.taxId));
  const [contactOpen, setContactOpen] = useState(
    Boolean(contact.name || contact.email || contact.phone),
  );

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Basic Information */}
      <Section title="Basic Information">
        <div className="mb-3">
          <label htmlFor="supplier-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="supplier-name"
            type="text"
            value={info.name ?? ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                companyInformation: { ...prev.companyInformation, name: e.target.value },
              }))
            }
            placeholder="Company name"
            className={fieldClasses}
          />
        </div>

        <div className="mb-3">
          <span className="block text-sm font-medium text-gray-700 mb-2">Roles</span>
          <div className="flex flex-wrap gap-3">
            {ALL_ROLE_TYPES.map((roleType) => (
              <label key={roleType} className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedRoles.has(roleType)}
                  onChange={() => toggleRole(roleType)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {ROLE_LABELS[roleType]}
              </label>
            ))}
          </div>
        </div>
      </Section>

      {/* Legal Information (collapsible) */}
      <div className="mb-4 border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => setLegalOpen(!legalOpen)}
          className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
        >
          Legal Information
        </button>
        {legalOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label
                htmlFor="supplier-legal-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Legal Name
              </label>
              <input
                id="supplier-legal-name"
                type="text"
                value={info.legalName ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyInformation: withOptional(
                      prev.companyInformation,
                      'legalName',
                      e.target.value,
                    ),
                  }))
                }
                placeholder="Legal entity name"
                className={fieldClasses}
              />
            </div>
            <div>
              <label
                htmlFor="supplier-country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <input
                id="supplier-country"
                type="text"
                value={info.country ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyInformation: withOptional(
                      prev.companyInformation,
                      'country',
                      e.target.value,
                    ),
                  }))
                }
                placeholder="Country code (e.g. US)"
                className={fieldClasses}
              />
            </div>
            <div>
              <label
                htmlFor="supplier-taxid"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tax ID
              </label>
              <input
                id="supplier-taxid"
                type="text"
                value={info.taxId ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyInformation: withOptional(
                      prev.companyInformation,
                      'taxId',
                      e.target.value,
                    ),
                  }))
                }
                placeholder="Tax identification number"
                className={fieldClasses}
              />
            </div>
          </div>
        )}
      </div>

      {/* Contact (collapsible) */}
      <div className="mb-4 border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => setContactOpen(!contactOpen)}
          className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
        >
          Contact
        </button>
        {contactOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label
                htmlFor="supplier-contact-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Name
              </label>
              <input
                id="supplier-contact-name"
                type="text"
                value={contact.name ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primaryContact: withOptional(prev.primaryContact ?? {}, 'name', e.target.value),
                  }))
                }
                placeholder="Contact name"
                className={fieldClasses}
              />
            </div>
            <div>
              <label
                htmlFor="supplier-contact-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="supplier-contact-email"
                type="email"
                value={contact.email ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primaryContact: withOptional(
                      prev.primaryContact ?? {},
                      'email',
                      e.target.value,
                    ),
                  }))
                }
                placeholder="email@example.com"
                className={fieldClasses}
              />
            </div>
            <div>
              <label
                htmlFor="supplier-contact-phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone
              </label>
              <input
                id="supplier-contact-phone"
                type="tel"
                value={contact.phone ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primaryContact: withOptional(
                      prev.primaryContact ?? {},
                      'phone',
                      e.target.value,
                    ),
                  }))
                }
                placeholder="+1-555-555-5555"
                className={fieldClasses}
              />
            </div>

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">
              Address
            </div>
            <div>
              <label
                htmlFor="supplier-addr-line1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address Line 1
              </label>
              <input
                id="supplier-addr-line1"
                type="text"
                value={address.addressLine1 ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: withOptional(prev.address ?? {}, 'addressLine1', e.target.value),
                  }))
                }
                placeholder="Street address"
                className={fieldClasses}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="supplier-addr-city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <input
                  id="supplier-addr-city"
                  type="text"
                  value={address.city ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: withOptional(prev.address ?? {}, 'city', e.target.value),
                    }))
                  }
                  placeholder="City"
                  className={fieldClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="supplier-addr-state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State
                </label>
                <input
                  id="supplier-addr-state"
                  type="text"
                  value={address.state ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: withOptional(prev.address ?? {}, 'state', e.target.value),
                    }))
                  }
                  placeholder="State"
                  className={fieldClasses}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="supplier-addr-zip"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Postal Code
                </label>
                <input
                  id="supplier-addr-zip"
                  type="text"
                  value={address.postalCode ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: withOptional(prev.address ?? {}, 'postalCode', e.target.value),
                    }))
                  }
                  placeholder="Zip"
                  className={fieldClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="supplier-addr-country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country
                </label>
                <input
                  id="supplier-addr-country"
                  type="text"
                  value={address.country ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: withOptional(prev.address ?? {}, 'country', e.target.value),
                    }))
                  }
                  placeholder="Country"
                  className={fieldClasses}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
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
      ? (affiliate?.companyInformation?.name ?? 'Supplier Details')
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={20} className="text-gray-400 shrink-0" />
            <h2 id={titleId} className="text-base font-semibold text-gray-900 truncate">
              {resolvedTitle}
            </h2>
          </div>
          <button
            onClick={handleCloseRequest}
            aria-label="Close drawer"
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs (view mode only) */}
        {mode === 'view' && (
          <div className="flex border-b border-gray-200 px-6">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'details'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
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
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
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
            <FormMode formData={formData} setFormData={setFormData} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          {mode === 'view' && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
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
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
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
