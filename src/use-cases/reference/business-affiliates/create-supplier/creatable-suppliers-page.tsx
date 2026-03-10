/**
 * Local wrapper that layers create capability on top of SuppliersPage.
 *
 * Private to the create-supplier story group — NOT added to _shared/.
 * Manages: open drawer in create mode → fill form → save → toast → re-fetch.
 *
 * Follows the DeletableSuppliersPage pattern from delete-supplier/.
 */
import React, { useState, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { SuppliersPage } from '../_shared/suppliers-page';
import { SupplierDrawer } from '../_shared/supplier-drawer';
import type { SupplierFormData } from '../_shared/supplier-drawer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreatableSuppliersPageProps {
  initialAffiliateId?: string;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreatableSuppliersPage(props: CreatableSuppliersPageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [remountKey, setRemountKey] = useState(0);

  const handleAddSupplier = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleSave = useCallback(async (data: SupplierFormData) => {
    try {
      const response = await fetch('/api/arda/business-affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          contact: data.contact,
          address: data.address,
          legal: data.legal,
          notes: data.notes,
        }),
      });
      const json = (await response.json()) as { ok: boolean; error?: string };

      if (json.ok) {
        toast.success('Supplier created successfully');
        setDrawerOpen(false);
        // Force SuppliersPage remount to re-fetch from the (now-modified) store
        setRemountKey((k) => k + 1);
      } else {
        toast.error(json.error ?? 'Failed to create supplier');
      }
    } catch {
      toast.error('Failed to create supplier — network error');
    }
  }, []);

  const handleCancel = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      <SuppliersPage
        key={remountKey}
        {...props}
        onAddSupplier={handleAddSupplier}
      />
      <SupplierDrawer
        open={drawerOpen}
        mode="create"
        onClose={handleClose}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      {/* duration=10000 ensures toast is visible during multi-step play function assertions */}
      <Toaster position="top-center" duration={10000} />
    </>
  );
}
