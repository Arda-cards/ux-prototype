/**
 * Local wrapper that layers panel-level delete capability on top of SuppliersPage.
 *
 * Private to the delete-from-panel story — NOT added to _shared/.
 * Uses the `onDrawerDelete` callback prop to intercept the drawer's Delete button
 * and manages the full delete flow: confirm dialog → API call → toast → re-fetch.
 *
 * Differs from DeletableSuppliersPage (list-level delete via Actions dropdown):
 *  - Triggered from the drawer footer Delete button, not the toolbar Actions dropdown.
 *  - Always single-delete (no bulk). Dialog message includes the specific affiliate name.
 *  - The confirm dialog closes immediately; remountKey handles drawer close + grid refresh.
 */
import React, { useState, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { SuppliersPage } from '../_shared/suppliers-page';
import { ConfirmDialog } from '../_shared/confirm-dialog';
import type { BusinessAffiliateWithRoles } from '../_shared/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PanelDeletableSuppliersPageProps {
  initialAffiliateId?: string;
  pageSize?: number;
}

interface ConfirmState {
  open: boolean;
  affiliate: BusinessAffiliateWithRoles | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PanelDeletableSuppliersPage(props: PanelDeletableSuppliersPageProps) {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    affiliate: null,
  });
  const [remountKey, setRemountKey] = useState(0);

  const handleDrawerDelete = useCallback((affiliate: BusinessAffiliateWithRoles) => {
    setConfirmState({ open: true, affiliate });
  }, []);

  const handleConfirm = useCallback(async () => {
    const { affiliate } = confirmState;
    if (!affiliate) return;

    // Close dialog immediately for responsive feel; DELETE request fires in background
    setConfirmState({ open: false, affiliate: null });

    try {
      const res = await fetch(`/api/arda/business-affiliate/${affiliate.eId}`, {
        method: 'DELETE',
      });
      const json = (await res.json()) as { ok: boolean; error?: string };

      if (json.ok) {
        toast.success('Supplier deleted successfully');
      } else {
        toast.error('Failed to delete supplier');
      }
    } catch {
      toast.error('Failed to delete supplier — network error');
    }

    // Force SuppliersPage remount to re-fetch from the (now-modified) store.
    // This also resets drawerOpen to false, closing the drawer without an explicit callback.
    setRemountKey((k) => k + 1);
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
  }, []);

  // Resolve the affiliate name for the dialog message
  const affiliateName = confirmState.affiliate?.name ?? 'this supplier';

  return (
    <>
      <SuppliersPage
        key={remountKey}
        {...props}
        onDrawerDelete={handleDrawerDelete}
      />
      <ConfirmDialog
        open={confirmState.open}
        title="Delete Supplier"
        message={`Are you sure you want to delete ${affiliateName}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Toaster position="top-center" duration={10000} />
    </>
  );
}
