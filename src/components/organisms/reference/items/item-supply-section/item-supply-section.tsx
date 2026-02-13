'use client';

import { Plus, Package } from 'lucide-react';

import type {
  ItemSupply,
  SupplyDesignation,
} from '@/types/reference/business-affiliates/item-supply';
import type { Money } from '@/types/model/general/money';
import type { Duration } from '@/types/model/general/time/duration';
import { ArdaSupplyCard } from '@/components/molecules/reference/items/supply-card/supply-card';

/* ------------------------------------------------------------------ */
/*  Config Interfaces                                                  */
/* ------------------------------------------------------------------ */

/** Design-time configuration for ArdaItemSupplySection. */
export interface ArdaItemSupplySectionStaticConfig {
  /** Section heading. Defaults to "Supplies". */
  title?: string;
}

/** Runtime configuration for ArdaItemSupplySection. */
export interface ArdaItemSupplySectionRuntimeConfig {
  /** List of item supplies to display. */
  supplies: ItemSupply[];
  /** Map of supply entityId to its designations. */
  designations: Record<string, SupplyDesignation[]>;
  /** Map of supply entityId to supplier display name. */
  supplierNames: Record<string, string>;
  /** Set of supply entityIds that are linked to a supplier record. */
  linkedSupplierIds?: Set<string>;
  /** The entityId of the default supply, if any. */
  defaultSupplyId?: string;
  /** Set of supply entityIds that are legacy (unlinked). */
  legacySupplyIds?: Set<string>;
  /** Called when the Add button is clicked. */
  onAdd?: () => void;
  /** Called when a supply's Edit action is triggered. */
  onEditSupply?: (supplyId: string) => void;
  /** Called when a supply's Remove action is triggered. */
  onRemoveSupply?: (supplyId: string) => void;
  /** Called when a supplier name is clicked. */
  onSupplierClick?: (affiliateId: string) => void;
  /** Called when a designation change is requested. */
  onDesignationChange?: (supplyId: string, designation: SupplyDesignation) => void;
  /** Called when the default toggle is clicked. */
  onToggleDefault?: (supplyId: string) => void;
}

/** Combined props for ArdaItemSupplySection. */
export interface ArdaItemSupplySectionProps
  extends ArdaItemSupplySectionStaticConfig, ArdaItemSupplySectionRuntimeConfig {}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

function formatMoney(money: Money | undefined): string | undefined {
  if (!money) return undefined;
  const formatted = money.value.toLocaleString('en-US', {
    style: 'currency',
    currency: money.currency,
  });
  return `${formatted}/unit`;
}

function formatDuration(dur: Duration | undefined): string | undefined {
  if (!dur) return undefined;
  const unitLabel = dur.unit.charAt(0) + dur.unit.slice(1).toLowerCase();
  return `${dur.length} ${unitLabel}${dur.length !== 1 ? 's' : ''}`;
}

const ORDER_MECHANISM_LABELS: Record<string, string> = {
  PURCHASE_ORDER: 'Purchase Order',
  EMAIL: 'Email',
  PHONE: 'Phone',
  IN_STORE: 'In Store',
  ONLINE: 'Online',
  RFQ: 'RFQ',
  PRODUCTION: 'Production',
  THIRD_PARTY: 'Third Party',
  OTHER: 'Other',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ArdaItemSupplySection({
  title = 'Supplies',
  supplies,
  designations,
  supplierNames,
  linkedSupplierIds,
  defaultSupplyId,
  legacySupplyIds,
  onAdd,
  onEditSupply,
  onRemoveSupply,
  onSupplierClick,
  onDesignationChange,
  onToggleDefault,
}: ArdaItemSupplySectionProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {/* Supply cards */}
      {supplies.length > 0 ? (
        <div className="space-y-2">
          {supplies.map((supply) => {
            const supplyDesignations = designations[supply.entityId] ?? [];
            const supplierName = supplierNames[supply.entityId] ?? 'Unknown Supplier';
            const isLinked = linkedSupplierIds?.has(supply.entityId) ?? false;
            const isDefault = defaultSupplyId === supply.entityId;
            const isLegacy = legacySupplyIds?.has(supply.entityId) ?? false;

            const mechanismLabel = supply.orderMechanism
              ? (ORDER_MECHANISM_LABELS[supply.orderMechanism] ?? supply.orderMechanism)
              : undefined;
            const unitCostLabel = formatMoney(supply.unitCost);
            const leadTimeLabel = formatDuration(supply.averageLeadTime);

            return (
              <ArdaSupplyCard
                key={supply.entityId}
                supplierName={supplierName}
                supplierLinked={isLinked}
                {...(supply.supplierSku ? { sku: supply.supplierSku } : {})}
                {...(mechanismLabel ? { orderMechanism: mechanismLabel } : {})}
                {...(unitCostLabel ? { unitCost: unitCostLabel } : {})}
                {...(leadTimeLabel ? { leadTime: leadTimeLabel } : {})}
                legacy={isLegacy}
                designations={supplyDesignations}
                isDefault={isDefault}
                {...(onSupplierClick
                  ? { onSupplierClick: () => onSupplierClick(supply.affiliateId) }
                  : {})}
                {...(onEditSupply ? { onEdit: () => onEditSupply(supply.entityId) } : {})}
                {...(onRemoveSupply ? { onRemove: () => onRemoveSupply(supply.entityId) } : {})}
                {...(onDesignationChange
                  ? {
                      onDesignationChange: (d: SupplyDesignation) =>
                        onDesignationChange(supply.entityId, d),
                    }
                  : {})}
                {...(onToggleDefault
                  ? { onToggleDefault: () => onToggleDefault(supply.entityId) }
                  : {})}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-300 rounded-lg">
          <Package size={32} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No supplies configured</p>
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Add a supply
            </button>
          )}
        </div>
      )}
    </div>
  );
}
