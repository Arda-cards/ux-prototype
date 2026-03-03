import { useCallback } from 'react';

import { ArdaBadge, type ArdaBadgeVariant } from '@/extras/components/atoms/badge/badge';
import type {
  BusinessAffiliate,
  BusinessRoleType,
} from '@/extras/types/reference/business-affiliates/business-affiliate';
import { getContactDisplayName } from '@/extras/types/model/assets/contact';

import {
  SelectAllHeaderComponent,
  SelectionCheckboxCell,
  NotesIconCell,
} from '../common/common-cell-renderers';

// Re-export common components
export { SelectAllHeaderComponent, SelectionCheckboxCell };

/* ------------------------------------------------------------------ */
/*  Role Helpers                                                       */
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

/* ------------------------------------------------------------------ */
/*  Cell Renderers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Renders business roles as a row of badge components.
 */
export function RolesBadgesCell({ affiliate }: { affiliate: BusinessAffiliate }) {
  if (!affiliate.roles || affiliate.roles.length === 0) {
    return <span className="text-gray-400">{'\u2014'}</span>;
  }

  return (
    <div className="flex gap-1 flex-wrap items-center h-full">
      {affiliate.roles.map((r) => (
        <ArdaBadge key={r.role} variant={ROLE_VARIANTS[r.role]}>
          {ROLE_LABELS[r.role]}
        </ArdaBadge>
      ))}
    </div>
  );
}

/**
 * Two-line contact renderer: name (bold) + email (gray).
 */
export function ContactCell({ affiliate }: { affiliate: BusinessAffiliate }) {
  const contact = affiliate.contact;
  if (!contact) {
    return <span className="text-gray-400">{'\u2014'}</span>;
  }

  const displayName = getContactDisplayName(contact);

  if (!displayName) {
    return <span className="text-gray-400">{'\u2014'}</span>;
  }

  return <span className="font-medium text-gray-900 text-sm">{displayName}</span>;
}

/**
 * Location renderer: city, state from mainAddress.
 */
export function LocationCell({ affiliate }: { affiliate: BusinessAffiliate }) {
  const address = affiliate.mainAddress;
  if (!address) {
    return <span className="text-gray-400">{'\u2014'}</span>;
  }

  const parts = [address.city, address.state].filter(Boolean);
  if (parts.length === 0) {
    return <span className="text-gray-400">{'\u2014'}</span>;
  }

  return <span className="text-gray-900">{parts.join(', ')}</span>;
}

/**
 * Notes cell renderer for suppliers — MessageSquare icon with tooltip.
 * Delegates to the generic NotesIconCell.
 */
export function SupplierNotesCell({ affiliate }: { affiliate: BusinessAffiliate }) {
  return <NotesIconCell {...(affiliate.notes !== undefined ? { notes: affiliate.notes } : {})} />;
}

/**
 * Quick actions cell renderer — placeholder.
 */
export function SupplierQuickActionsCell({
  affiliate: _affiliate,
}: {
  affiliate: BusinessAffiliate;
}) {
  const handleMouseEvent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      onClick={handleMouseEvent}
      onMouseDown={handleMouseEvent}
    >
      <div className="flex items-center relative gap-1 flex-shrink-0">
        <span className="text-xs text-gray-400">Actions</span>
      </div>
    </div>
  );
}
