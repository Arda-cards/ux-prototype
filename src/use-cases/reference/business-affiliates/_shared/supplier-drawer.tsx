/**
 * SupplierDrawer — shared detail panel for business affiliate records.
 *
 * Supports three modes:
 *  - 'view'   — read-only field display with Edit + Delete action buttons
 *  - 'create' — blank form with Save + Cancel buttons
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
import React, { useEffect } from 'react';
import { Building2, X, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@frontend/components/ui/collapsible';
import { Button } from '@frontend/components/ui/button';
import { cn } from '@/lib/utils';
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
      <CollapsibleContent className="pt-2 pb-4 px-2 space-y-3">
        {children}
      </CollapsibleContent>
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
  onSave: _onSave,
  onCancel,
}: SupplierDrawerProps) {
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

  if (!open) return null;

  const title = mode === 'create' ? 'New Supplier' : (affiliate?.name ?? 'Supplier');

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

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
          {mode === 'view' && affiliate && (
            <ViewModeBody affiliate={affiliate} />
          )}
          {mode === 'create' && (
            <CreateModeBody />
          )}
          {mode === 'edit' && affiliate && (
            <EditModeBody affiliate={affiliate} />
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
              <Button size="sm">
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
            <ReadOnlyField
              label="Country"
              value={affiliate.mainAddress.country?.name}
            />
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

function CreateModeBody() {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground" htmlFor="create-name">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="create-name"
          type="text"
          placeholder="Supplier name"
          className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Additional fields (contact, address, legal) can be added after saving.
      </p>
    </div>
  );
}

function EditModeBody({ affiliate }: { affiliate: BusinessAffiliateWithRoles }) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground" htmlFor="edit-name">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="edit-name"
          type="text"
          defaultValue={affiliate.name}
          className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>
    </div>
  );
}
