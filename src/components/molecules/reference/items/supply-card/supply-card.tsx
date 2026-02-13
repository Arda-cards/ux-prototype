'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, MoreHorizontal, Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ArdaBadge } from '@/components/atoms/badge/badge';
import type { SupplyDesignation } from '@/types/reference/business-affiliates/item-supply';

/* ------------------------------------------------------------------ */
/*  Config Interfaces                                                  */
/* ------------------------------------------------------------------ */

/** Design-time configuration for ArdaSupplyCard. */
export interface ArdaSupplyCardStaticConfig {
  /** Supplier display name. */
  supplierName: string;
  /** Whether the supplier name is linked to a supplier record. */
  supplierLinked?: boolean;
  /** Supplier SKU for this supply. */
  sku?: string;
  /** Order mechanism label (e.g. "Online", "Purchase Order"). */
  orderMechanism?: string;
  /** Formatted unit cost string (e.g. "$189.99/unit"). */
  unitCost?: string;
  /** Formatted lead time string (e.g. "5 Days"). */
  leadTime?: string;
  /** Whether this is a legacy supply not linked to a supplier record. */
  legacy?: boolean;
}

/** Runtime configuration for ArdaSupplyCard. */
export interface ArdaSupplyCardRuntimeConfig {
  /** Current designations for this supply (e.g. PRIMARY, SECONDARY). */
  designations: SupplyDesignation[];
  /** Whether this supply is the default. */
  isDefault?: boolean;
  /** Called when the supplier name is clicked (only when supplierLinked). */
  onSupplierClick?: () => void;
  /** Called when the Edit action is triggered. */
  onEdit?: () => void;
  /** Called when the Remove action is triggered. */
  onRemove?: () => void;
  /** Called when a designation change is requested from the overflow menu. */
  onDesignationChange?: (designation: SupplyDesignation) => void;
  /** Called when the default toggle star is clicked. */
  onToggleDefault?: () => void;
}

/** Combined props for ArdaSupplyCard. */
export interface ArdaSupplyCardProps
  extends ArdaSupplyCardStaticConfig, ArdaSupplyCardRuntimeConfig {}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DESIGNATION_LABELS: Record<SupplyDesignation, string> = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  TERTIARY: 'Tertiary',
  BACKUP: 'Backup',
};

const DESIGNATION_VARIANTS: Record<SupplyDesignation, 'info' | 'default' | 'warning' | 'outline'> =
  {
    PRIMARY: 'info',
    SECONDARY: 'default',
    TERTIARY: 'outline',
    BACKUP: 'warning',
  };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ArdaSupplyCard({
  supplierName,
  supplierLinked = false,
  sku,
  orderMechanism,
  unitCost,
  leadTime,
  legacy = false,
  designations,
  isDefault = false,
  onSupplierClick,
  onEdit,
  onRemove,
  onDesignationChange,
  onToggleDefault,
}: ArdaSupplyCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const costLeadParts: string[] = [];
  if (unitCost) costLeadParts.push(unitCost);
  if (leadTime) costLeadParts.push(`${leadTime} lead`);
  const costLeadLine = costLeadParts.join(' \u00B7 ');

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      {/* Row 1: Star + Supplier name + SKU */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleDefault}
          aria-label={isDefault ? 'Remove default' : 'Set as default'}
          className="p-0.5 rounded hover:bg-gray-100 transition-colors shrink-0"
        >
          <Star
            size={16}
            className={cn(isDefault ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
          />
        </button>

        {supplierLinked ? (
          <button
            type="button"
            onClick={onSupplierClick}
            className="text-sm font-semibold text-blue-600 hover:underline truncate"
          >
            {supplierName}
          </button>
        ) : (
          <span className="text-sm font-semibold text-gray-900 truncate">{supplierName}</span>
        )}

        {sku && <span className="ml-auto text-xs text-gray-500 font-mono shrink-0">{sku}</span>}
      </div>

      {/* Row 2: Cost / lead time */}
      {costLeadLine && <div className="mt-1 ml-7 text-xs text-gray-500">{costLeadLine}</div>}

      {/* Row 3: Designation badges */}
      <div className="mt-2 ml-7 flex flex-wrap items-center gap-1.5">
        {designations.map((d) => (
          <ArdaBadge key={d} variant={DESIGNATION_VARIANTS[d]}>
            {DESIGNATION_LABELS[d]}
          </ArdaBadge>
        ))}
        {isDefault && <ArdaBadge variant="success">Default</ArdaBadge>}
      </div>

      {/* Row 4: Order mechanism + actions */}
      <div className="mt-2 ml-7 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {legacy ? (
            <em>*Legacy supply — not linked to a supplier record*</em>
          ) : (
            (orderMechanism ?? '')
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Overflow menu */}
          {onDesignationChange && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Designation options"
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-gray-200 bg-white shadow-lg z-10 py-1">
                  {(['PRIMARY', 'SECONDARY', 'TERTIARY', 'BACKUP'] as SupplyDesignation[]).map(
                    (d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          onDesignationChange(d);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Set as {DESIGNATION_LABELS[d]}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit supply"
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Pencil size={16} />
            </button>
          )}

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove supply"
              className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
