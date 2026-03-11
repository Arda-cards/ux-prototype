/**
 * Local wrapper that layers edit capability on top of SuppliersPage.
 *
 * Private to the edit-supplier story group — NOT added to _shared/.
 * Manages: row click → open drawer in view mode → click Edit → edit mode →
 * modify fields → Save → PUT request → toast → view mode with updated values.
 *
 * Follows the CreatableSuppliersPage / DeletableSuppliersPage pattern from
 * create-supplier/ and delete-supplier/ story groups.
 *
 * Uses the SuppliersPage `onRowClick` prop to intercept row clicks and
 * manage its own SupplierDrawer with full view/edit mode support.
 */
import React, { useState, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { SuppliersPage } from '../_shared/suppliers-page';
import { SupplierDrawer } from '../_shared/supplier-drawer';
import type { SupplierDrawerMode, SupplierFormData } from '../_shared/supplier-drawer';
import type { BusinessAffiliateWithRoles } from '../_shared/types';
import type { ArdaApiResponse, ArdaResult } from '@frontend/types/arda-api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditableSuppliersPageProps {
  /** Pre-select and open drawer for this affiliate. */
  initialAffiliateId?: string;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditableSuppliersPage(props: EditableSuppliersPageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<SupplierDrawerMode>('view');
  const [selectedAffiliate, setSelectedAffiliate] = useState<BusinessAffiliateWithRoles | undefined>();
  const [remountKey, setRemountKey] = useState(0);

  // Called when SuppliersPage row is clicked — opens drawer in view mode
  const handleRowClick = useCallback((affiliate: BusinessAffiliateWithRoles) => {
    setSelectedAffiliate(affiliate);
    setDrawerMode('view');
    setDrawerOpen(true);
  }, []);

  // Close drawer — discard any unsaved state
  const handleClose = useCallback(() => {
    setDrawerOpen(false);
    setDrawerMode('view');
    setSelectedAffiliate(undefined);
  }, []);

  // Transition from view to edit mode
  const handleEdit = useCallback(() => {
    setDrawerMode('edit');
  }, []);

  // Cancel edit — revert to view mode with original data
  const handleCancel = useCallback(() => {
    setDrawerMode('view');
  }, []);

  // Save edit — send PUT, show toast, return to view mode with updated data
  const handleSave = useCallback(async (data: SupplierFormData) => {
    if (!selectedAffiliate) return;

    try {
      const response = await fetch(`/api/arda/business-affiliate/${selectedAffiliate.eId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          contact: data.contact
            ? {
                ...selectedAffiliate.contact,
                firstName: data.contact.firstName,
                lastName: data.contact.lastName,
                email: data.contact.email,
                phone: data.contact.phone,
                // Re-derive name from first/last or preserve existing
                name:
                  [data.contact.firstName, data.contact.lastName].filter(Boolean).join(' ') ||
                  selectedAffiliate.contact?.name ||
                  '',
              }
            : undefined,
          mainAddress: data.address
            ? {
                ...selectedAffiliate.mainAddress,
                addressLine1: data.address.addressLine1,
                city: data.address.city,
                state: data.address.state,
                postalCode: data.address.postalCode,
                country: data.address.country
                  ? { symbol: data.address.country, name: data.address.country }
                  : selectedAffiliate.mainAddress?.country,
              }
            : undefined,
          legal: data.legal
            ? {
                ...selectedAffiliate.legal,
                name: data.legal.name ?? selectedAffiliate.legal?.name ?? '',
                taxId: data.legal.taxId,
              }
            : undefined,
          notes: data.notes,
        }),
      });

      const json = (await response.json()) as ArdaApiResponse<ArdaResult<BusinessAffiliateWithRoles>>;

      if (json.ok) {
        // Update the displayed affiliate with the server's response
        const updated = json.data.payload;
        setSelectedAffiliate(updated);
        setDrawerMode('view');
        toast.success('Supplier updated successfully');
        // Remount SuppliersPage to re-fetch the grid with the updated data
        setRemountKey((k) => k + 1);
      } else {
        toast.error(json.error ?? 'Failed to update supplier');
      }
    } catch {
      toast.error('Failed to update supplier — network error');
    }
  }, [selectedAffiliate]);

  return (
    <>
      <SuppliersPage
        key={remountKey}
        {...props}
        onRowClick={handleRowClick}
      />
      <SupplierDrawer
        open={drawerOpen}
        mode={drawerMode}
        affiliate={selectedAffiliate}
        onClose={handleClose}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={() => {
          // Out of scope for the edit story — placeholder only
        }}
      />
      {/* duration=10000 ensures toast is visible during multi-step play function assertions */}
      <Toaster position="top-center" duration={10000} />
    </>
  );
}
