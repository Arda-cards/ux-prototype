/**
 * Local wrapper that layers delete capability on top of SuppliersPage.
 *
 * Private to the delete-supplier story group — NOT added to _shared/.
 * Uses the `toolbarActions` render prop to inject an Actions dropdown
 * and manages the full delete flow: confirm dialog → API call → toast → re-fetch.
 */
import React, { useState, useCallback } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@frontend/components/ui/dropdown-menu';
import { Button } from '@frontend/components/ui/button';
import { SuppliersPage } from '../_shared/suppliers-page';
import { ArdaConfirmDialog } from '../_shared/confirm-dialog';
import { affiliateStore } from '../_shared/msw-handlers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeletableSuppliersPageProps {
  initialAffiliateId?: string;
  pageSize?: number;
}

interface ConfirmState {
  open: boolean;
  affiliateIds: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeletableSuppliersPage(props: DeletableSuppliersPageProps) {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    affiliateIds: [],
  });
  const [remountKey, setRemountKey] = useState(0);

  const handleDeleteRequest = useCallback((selectedIds: Set<string>) => {
    setConfirmState({
      open: true,
      affiliateIds: [...selectedIds],
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    const { affiliateIds } = confirmState;
    setConfirmState((s) => ({ ...s, open: false }));

    try {
      const results = await Promise.all(
        affiliateIds.map((id) =>
          fetch(`/api/arda/business-affiliate/${id}`, { method: 'DELETE' }).then(
            (res) => res.json() as Promise<{ ok: boolean; error?: string }>,
          ),
        ),
      );

      const failures = results.filter((r) => !r.ok);

      if (failures.length === 0) {
        const noun = affiliateIds.length === 1 ? 'Supplier' : 'Suppliers';
        toast.success(`${noun} deleted successfully`);
      } else {
        toast.error(`Failed to delete ${failures.length} supplier(s)`);
      }
    } catch {
      toast.error('Failed to delete supplier(s) — network error');
    }

    // Force SuppliersPage remount to re-fetch from the (now-modified) store
    setRemountKey((k) => k + 1);
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
  }, []);

  // Resolve display count for dialog message
  const count = confirmState.affiliateIds.length;
  const dialogTitle = count === 1 ? 'Delete Supplier' : 'Delete Suppliers';
  const dialogMessage =
    count === 1
      ? 'Are you sure you want to delete this supplier? This action cannot be undone.'
      : `Are you sure you want to delete ${count} suppliers? This action cannot be undone.`;

  return (
    <>
      <SuppliersPage
        key={remountKey}
        {...props}
        toolbarActions={(selectedIds) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1"
                disabled={selectedIds.size === 0}
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => handleDeleteRequest(selectedIds)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      <ArdaConfirmDialog
        open={confirmState.open}
        title={dialogTitle}
        message={dialogMessage}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Toaster position="top-center" duration={10000} />
    </>
  );
}
