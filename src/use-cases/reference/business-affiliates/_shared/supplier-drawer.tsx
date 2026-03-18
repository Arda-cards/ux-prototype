/**
 * SupplierDrawer — shared detail panel for business affiliate records.
 *
 * Supports three modes:
 *  - 'view'   — read-only field display with Edit + Delete action buttons
 *  - 'create' — blank form with Save + Cancel buttons (full sections: Identity,
 *               Contact, Address, Legal, Notes)
 *  - 'edit'   — pre-populated editable form with Save + Cancel buttons
 *
 * Renders as a fixed-position inline side panel (NOT a Radix Sheet portal) so
 * that all elements remain within canvasElement scope for Storybook play-function
 * assertions using canvas.* queries.
 *
 * Used by:
 *  BA::0002::0001 — View Details (view mode)
 *  BA::0003::0001 — Create Happy Path (create mode)
 *  BA::0004::0001 — Edit Happy Path (edit mode)
 *  BA::0005::0002 — Delete from Panel (view mode + onDelete callback)
 */
import React, { useEffect, useRef, useState } from 'react';
import { Building2, X, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@frontend/components/ui/collapsible';
import { Button } from '@frontend/components/ui/button';
import { cn } from '@/types/canary/utils';
import type { BusinessAffiliateWithRoles } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SupplierDrawerMode = 'view' | 'create' | 'edit';

export interface SupplierDrawerProps {
  /** Whether the drawer is open. */
  open: boolean;

  /** Current mode of the drawer. */
  mode: SupplierDrawerMode;

  /**
   * The affiliate record to display or edit.
   * Required in 'view' and 'edit' modes; ignored in 'create' mode.
   */
  affiliate?: BusinessAffiliateWithRoles;

  // — Callbacks active in ALL modes --

  /** Close the drawer (X button, Escape key). */
  onClose: () => void;

  // — Callbacks active in VIEW mode --

  /**
   * Transition from view to edit mode.
   * Active only when mode === 'view'.
   */
  onEdit?: () => void;

  /**
   * Initiate delete flow from the detail panel.
   * Active only when mode === 'view'.
   */
  onDelete?: () => void;

  // — Callbacks active in CREATE and EDIT modes --

  /**
   * Save the affiliate (create or update).
   * Active when mode === 'create' or 'edit'.
   */
  onSave?: (data: SupplierFormData) => void;

  /**
   * Cancel create or edit, discarding unsaved changes.
   * Active when mode === 'create' or 'edit'.
   */
  onCancel?: () => void;
}

export interface SupplierFormData {
  name: string;
  contact?: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
  };
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  legal?: {
    name?: string;
    taxId?: string;
    registrationId?: string;
    naicsCode?: string;
  };
  notes?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Determine whether a collapsible section should start open. */
function sectionDefaultOpen(
  mode: SupplierDrawerMode,
  sectionId: 'identity' | 'contact' | 'address' | 'legal',
  affiliate?: BusinessAffiliateWithRoles,
): boolean {
  if (sectionId === 'identity') return true; // Always expanded
  if (mode === 'create') return false; // All non-identity sections collapsed in create mode
  // In view/edit mode: expanded if data exists
  switch (sectionId) {
    case 'contact':
      return !!affiliate?.contact;
    case 'address':
      return !!affiliate?.mainAddress;
    case 'legal':
      return !!affiliate?.legal;
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CollapsibleSectionProps {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
  onOpenChange,
}: CollapsibleSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <button
          className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground hover:bg-gray-50 rounded-md px-2 group"
          type="button"
        >
          <span>{title}</span>
          <span className="text-muted-foreground">
            {/* Radix sets data-state on the root; we use CSS group-data to swap icons */}
            <ChevronDown className="w-4 h-4 hidden group-data-[state=open]:block" />
            <ChevronRight className="w-4 h-4 block group-data-[state=open]:hidden" />
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4 px-2 space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {value ? (
        <p className="text-sm">{value}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">--</p>
      )}
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

function FormField({ id, label, required, type = 'text', placeholder, inputRef }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground" htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SupplierDrawer
// ---------------------------------------------------------------------------

export function SupplierDrawer({
  open,
  mode,
  affiliate,
  onClose,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: SupplierDrawerProps) {
  // Ref to the form element — used to read field values on Save
  const formRef = useRef<HTMLFormElement>(null);
  // Track name value for Save button disabled state.
  // In edit mode, initialize with the existing affiliate name.
  const [nameValue, setNameValue] = useState(mode === 'edit' ? (affiliate?.name ?? '') : '');

  // Reset/reinitialize form state when drawer opens or mode changes
  useEffect(() => {
    if (!open) {
      setNameValue('');
    } else if (mode === 'edit' && affiliate?.name) {
      setNameValue(affiliate.name);
    } else if (mode === 'create') {
      setNameValue('');
    }
  }, [open, mode, affiliate?.name]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleSave = () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const get = (name: string) => (fd.get(name) as string | null) ?? undefined;

    const data: SupplierFormData = {
      name: (get('create-name') ?? get('edit-name') ?? '').trim(),
      contact: {
        salutation: get('contact-salutation') || undefined,
        firstName: get('contact-firstName') || undefined,
        lastName: get('contact-lastName') || undefined,
        jobTitle: get('contact-jobTitle') || undefined,
        email: get('contact-email') || undefined,
        phone: get('contact-phone') || undefined,
      },
      address: {
        addressLine1: get('address-line1') || undefined,
        addressLine2: get('address-line2') || undefined,
        city: get('address-city') || undefined,
        state: get('address-state') || undefined,
        postalCode: get('address-postalCode') || undefined,
        country: get('address-country') || undefined,
      },
      legal: {
        name: get('legal-name') || undefined,
        taxId: get('legal-taxId') || undefined,
        registrationId: get('legal-registrationId') || undefined,
        naicsCode: get('legal-naicsCode') || undefined,
      },
      notes: get('notes') || undefined,
    };

    onSave?.(data);
  };

  if (!open) return null;

  const title = mode === 'create' ? 'New Supplier' : (affiliate?.name ?? 'Supplier');
  const isSaveDisabled = (mode === 'create' || mode === 'edit') && !nameValue.trim();

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} aria-hidden="true" />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed top-0 right-0 h-full w-[420px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
        data-slot="drawer"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 shrink-0"
          data-slot="drawer-header"
        >
          <Building2 className="w-5 h-5 text-muted-foreground shrink-0" />
          <h2 className="text-base font-semibold truncate flex-1">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 shrink-0"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {mode === 'view' && affiliate && <ViewModeBody affiliate={affiliate} />}
          {(mode === 'create' || mode === 'edit') && (
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              {mode === 'create' && (
                <CreateModeBody nameValue={nameValue} onNameChange={setNameValue} />
              )}
              {mode === 'edit' && affiliate && (
                <EditModeBody
                  affiliate={affiliate}
                  nameValue={nameValue}
                  onNameChange={setNameValue}
                />
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 shrink-0"
          data-slot="drawer-footer"
        >
          {mode === 'view' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Delete
              </Button>
              <Button size="sm" onClick={onEdit}>
                Edit
              </Button>
            </>
          )}
          {(mode === 'create' || mode === 'edit') && (
            <>
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="sm" disabled={isSaveDisabled} onClick={handleSave}>
                Save
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Mode-specific body components
// ---------------------------------------------------------------------------

function ViewModeBody({ affiliate }: { affiliate: BusinessAffiliateWithRoles }) {
  return (
    <div className="space-y-1 divide-y divide-gray-100">
      {/* Identity section — always expanded */}
      <CollapsibleSection
        title="Identity"
        defaultOpen={sectionDefaultOpen('view', 'identity', affiliate)}
      >
        <ReadOnlyField label="Name" value={affiliate.name} />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Entity ID</p>
          <p className={cn('text-sm font-mono break-all')}>{affiliate.eId}</p>
        </div>
      </CollapsibleSection>

      {/* Contact section */}
      <CollapsibleSection
        title="Contact"
        defaultOpen={sectionDefaultOpen('view', 'contact', affiliate)}
      >
        {affiliate.contact ? (
          <>
            <ReadOnlyField label="Contact Name" value={affiliate.contact.name} />
            <ReadOnlyField label="Email" value={affiliate.contact.email} />
            <ReadOnlyField label="Phone" value={affiliate.contact.phone} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">No contact information</p>
        )}
      </CollapsibleSection>

      {/* Address section */}
      <CollapsibleSection
        title="Address"
        defaultOpen={sectionDefaultOpen('view', 'address', affiliate)}
      >
        {affiliate.mainAddress ? (
          <>
            <ReadOnlyField label="Address Line 1" value={affiliate.mainAddress.addressLine1} />
            {affiliate.mainAddress.addressLine2 && (
              <ReadOnlyField label="Address Line 2" value={affiliate.mainAddress.addressLine2} />
            )}
            <ReadOnlyField label="City" value={affiliate.mainAddress.city} />
            <ReadOnlyField label="State" value={affiliate.mainAddress.state} />
            <ReadOnlyField label="Postal Code" value={affiliate.mainAddress.postalCode} />
            <ReadOnlyField label="Country" value={affiliate.mainAddress.country?.name} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">No address information</p>
        )}
      </CollapsibleSection>

      {/* Legal section */}
      <CollapsibleSection
        title="Legal"
        defaultOpen={sectionDefaultOpen('view', 'legal', affiliate)}
      >
        {affiliate.legal ? (
          <>
            <ReadOnlyField label="Legal Name" value={affiliate.legal.name} />
            <ReadOnlyField label="Tax ID" value={affiliate.legal.taxId} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">No legal information</p>
        )}
      </CollapsibleSection>

      {/* Notes — not in a collapsible, always visible */}
      <div className="pt-3 pb-2 px-2">
        <p className="text-sm font-semibold text-foreground mb-2">Notes</p>
        {affiliate.notes ? (
          <div className="bg-gray-50 rounded border border-gray-200 p-2 text-sm">
            {affiliate.notes}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No notes</p>
        )}
      </div>
    </div>
  );
}

interface CreateModeBodyProps {
  nameValue: string;
  onNameChange: (value: string) => void;
}

function CreateModeBody({ nameValue, onNameChange }: CreateModeBodyProps) {
  // Show "Name is required" error after the field is blurred while empty (BA::0003::0002)
  const [nameBlurred, setNameBlurred] = useState(false);
  const showNameError = nameBlurred && !nameValue.trim();

  return (
    <div className="space-y-1 divide-y divide-gray-100 py-2">
      {/* Identity section — always expanded */}
      <CollapsibleSection title="Identity" defaultOpen>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="create-name">
            Name<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            id="create-name"
            name="create-name"
            type="text"
            placeholder="Supplier name"
            value={nameValue}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setNameBlurred(true)}
            className={cn(
              'w-full h-9 rounded-md border px-3 text-sm focus:outline-none focus:ring-1',
              showNameError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-200 focus:ring-gray-300',
            )}
            aria-label="Name"
            aria-describedby={showNameError ? 'create-name-error' : undefined}
          />
          {showNameError && (
            <p id="create-name-error" className="text-xs text-red-500 mt-0.5">
              Name is required
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Contact section — collapsed by default */}
      <CollapsibleSection title="Contact" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="contact-salutation">
              Salutation
            </label>
            <input
              id="contact-salutation"
              name="contact-salutation"
              type="text"
              placeholder="Ms."
              aria-label="Salutation"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="contact-jobTitle">
              Job Title
            </label>
            <input
              id="contact-jobTitle"
              name="contact-jobTitle"
              type="text"
              placeholder="Account Manager"
              aria-label="Job Title"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="contact-firstName">
              First Name
            </label>
            <input
              id="contact-firstName"
              name="contact-firstName"
              type="text"
              placeholder="Sarah"
              aria-label="First Name"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="contact-lastName">
              Last Name
            </label>
            <input
              id="contact-lastName"
              name="contact-lastName"
              type="text"
              placeholder="Chen"
              aria-label="Last Name"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            name="contact-email"
            type="email"
            placeholder="contact@example.com"
            aria-label="Email"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="contact-phone">
            Phone
          </label>
          <input
            id="contact-phone"
            name="contact-phone"
            type="tel"
            placeholder="+1-555-000-0000"
            aria-label="Phone"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </CollapsibleSection>

      {/* Address section — collapsed by default */}
      <CollapsibleSection title="Address" defaultOpen={false}>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="address-line1">
            Address Line 1
          </label>
          <input
            id="address-line1"
            name="address-line1"
            type="text"
            placeholder="123 Main St"
            aria-label="Address Line 1"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="address-line2">
            Address Line 2
          </label>
          <input
            id="address-line2"
            name="address-line2"
            type="text"
            placeholder="Suite 100"
            aria-label="Address Line 2"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="address-city">
              City
            </label>
            <input
              id="address-city"
              name="address-city"
              type="text"
              placeholder="City"
              aria-label="City"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="address-state">
              State
            </label>
            <input
              id="address-state"
              name="address-state"
              type="text"
              placeholder="CA"
              aria-label="State"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="address-postalCode">
              Postal Code
            </label>
            <input
              id="address-postalCode"
              name="address-postalCode"
              type="text"
              placeholder="90210"
              aria-label="Postal Code"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="address-country">
              Country
            </label>
            <input
              id="address-country"
              name="address-country"
              type="text"
              placeholder="US"
              aria-label="Country"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Legal section — collapsed by default */}
      <CollapsibleSection title="Legal" defaultOpen={false}>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="legal-name">
            Legal Name
          </label>
          <input
            id="legal-name"
            name="legal-name"
            type="text"
            placeholder="Fastenal Company"
            aria-label="Legal Name"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="legal-taxId">
            Tax ID
          </label>
          <input
            id="legal-taxId"
            name="legal-taxId"
            type="text"
            placeholder="41-0948415"
            aria-label="Tax ID"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="legal-registrationId">
            Registration ID
          </label>
          <input
            id="legal-registrationId"
            name="legal-registrationId"
            type="text"
            placeholder="MN-12345678"
            aria-label="Registration ID"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="legal-naicsCode">
            NAICS Code
          </label>
          <input
            id="legal-naicsCode"
            name="legal-naicsCode"
            type="text"
            placeholder="423710"
            aria-label="NAICS Code"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </CollapsibleSection>

      {/* Notes — not in a collapsible */}
      <div className="pt-3 pb-2 space-y-1">
        <label className="text-xs font-medium text-foreground" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Additional notes about this supplier..."
          aria-label="Notes"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
        />
      </div>
    </div>
  );
}

interface EditModeBodyProps {
  affiliate: BusinessAffiliateWithRoles;
  nameValue: string;
  onNameChange: (value: string) => void;
}

function EditModeBody({ affiliate, nameValue, onNameChange }: EditModeBodyProps) {
  return (
    <div className="space-y-1 divide-y divide-gray-100 py-2">
      {/* Identity section — always expanded */}
      <CollapsibleSection title="Identity" defaultOpen>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="edit-name">
            Name<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            id="edit-name"
            name="edit-name"
            type="text"
            value={nameValue}
            onChange={(e) => onNameChange(e.target.value)}
            aria-label="Name"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </CollapsibleSection>

      {/* Contact section — expanded if affiliate has contact data */}
      <CollapsibleSection
        title="Contact"
        defaultOpen={sectionDefaultOpen('edit', 'contact', affiliate)}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="contact-firstName">
              First Name
            </label>
            <input
              id="contact-firstName"
              name="contact-firstName"
              type="text"
              defaultValue={affiliate.contact?.firstName ?? ''}
              aria-label="First Name"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="contact-lastName">
              Last Name
            </label>
            <input
              id="contact-lastName"
              name="contact-lastName"
              type="text"
              defaultValue={affiliate.contact?.lastName ?? ''}
              aria-label="Last Name"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            name="contact-email"
            type="email"
            defaultValue={affiliate.contact?.email ?? ''}
            aria-label="Email"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="contact-phone">
            Phone
          </label>
          <input
            id="contact-phone"
            name="contact-phone"
            type="tel"
            defaultValue={affiliate.contact?.phone ?? ''}
            aria-label="Phone"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </CollapsibleSection>

      {/* Address section — expanded if affiliate has address data */}
      <CollapsibleSection
        title="Address"
        defaultOpen={sectionDefaultOpen('edit', 'address', affiliate)}
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="address-line1">
            Address Line 1
          </label>
          <input
            id="address-line1"
            name="address-line1"
            type="text"
            defaultValue={affiliate.mainAddress?.addressLine1 ?? ''}
            aria-label="Address Line 1"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="address-city">
              City
            </label>
            <input
              id="address-city"
              name="address-city"
              type="text"
              defaultValue={affiliate.mainAddress?.city ?? ''}
              aria-label="City"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="address-state">
              State
            </label>
            <input
              id="address-state"
              name="address-state"
              type="text"
              defaultValue={affiliate.mainAddress?.state ?? ''}
              aria-label="State"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="address-postalCode">
              Postal Code
            </label>
            <input
              id="address-postalCode"
              name="address-postalCode"
              type="text"
              defaultValue={affiliate.mainAddress?.postalCode ?? ''}
              aria-label="Postal Code"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="address-country">
              Country
            </label>
            <input
              id="address-country"
              name="address-country"
              type="text"
              defaultValue={affiliate.mainAddress?.country?.symbol ?? ''}
              aria-label="Country"
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Legal section — expanded if affiliate has legal data */}
      <CollapsibleSection
        title="Legal"
        defaultOpen={sectionDefaultOpen('edit', 'legal', affiliate)}
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="legal-name">
            Legal Name
          </label>
          <input
            id="legal-name"
            name="legal-name"
            type="text"
            defaultValue={affiliate.legal?.name ?? ''}
            aria-label="Legal Name"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground" htmlFor="legal-taxId">
            Tax ID
          </label>
          <input
            id="legal-taxId"
            name="legal-taxId"
            type="text"
            defaultValue={affiliate.legal?.taxId ?? ''}
            aria-label="Tax ID"
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </CollapsibleSection>

      {/* Notes */}
      <div className="pt-3 pb-2 space-y-1">
        <label className="text-xs font-medium text-foreground" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={affiliate.notes ?? ''}
          aria-label="Notes"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
        />
      </div>
    </div>
  );
}
