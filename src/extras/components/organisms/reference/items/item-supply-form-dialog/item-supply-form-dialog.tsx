'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ArdaTypeahead, type TypeaheadOption } from '@/extras/components/atoms/typeahead/typeahead';
import { ArdaConfirmDialog } from '@/extras/components/atoms/confirm-dialog/confirm-dialog';
import type { Currency } from '@/extras/types/model/general/money';
import type { TimeUnit } from '@/extras/types/model/general/time/duration';
import type { OrderMechanism, QuantityUnit } from '@/extras/types/reference/items/item-domain';
import type { ItemSupply } from '@/extras/types/reference/business-affiliates/item-supply';

/* ------------------------------------------------------------------ */
/*  Form State                                                         */
/* ------------------------------------------------------------------ */

interface SupplyFormData {
  affiliateId: string;
  supplierName: string;
  supplierProductName: string;
  supplierSku: string;
  orderMechanism: OrderMechanism | '';
  url: string;
  orderQtyAmount: number;
  orderQtyUnit: QuantityUnit;
  unitCostValue: number;
  unitCostCurrency: Currency;
  leadTimeLength: number;
  leadTimeUnit: TimeUnit;
}

const EMPTY_FORM: SupplyFormData = {
  affiliateId: '',
  supplierName: '',
  supplierProductName: '',
  supplierSku: '',
  orderMechanism: '',
  url: '',
  orderQtyAmount: 1,
  orderQtyUnit: 'EACH',
  unitCostValue: 0,
  unitCostCurrency: 'USD',
  leadTimeLength: 0,
  leadTimeUnit: 'DAY',
};

/* ------------------------------------------------------------------ */
/*  Config Interfaces                                                  */
/* ------------------------------------------------------------------ */

export type ItemSupplyFormMode = 'add' | 'edit';

/** Design-time configuration for ArdaItemSupplyFormDialog. */
export interface ArdaItemSupplyFormDialogStaticConfig {
  /** Available supplier options for the typeahead. */
  availableSuppliers: TypeaheadOption[];
}

/** Runtime configuration for ArdaItemSupplyFormDialog. */
export interface ArdaItemSupplyFormDialogRuntimeConfig {
  /** Whether the dialog is open. */
  open: boolean;
  /** Operating mode: add a new supply or edit an existing one. */
  mode: ItemSupplyFormMode;
  /** Supply data to pre-fill in edit mode. */
  supply?: ItemSupply;
  /** Called when the dialog requests to close. */
  onClose: () => void;
  /** Called when the user saves the form. */
  onSave: (data: Partial<ItemSupply>) => void;
  /** Called when the user wants to create a new supplier inline. */
  onCreateSupplier?: (name: string) => void;
}

/** Combined props for ArdaItemSupplyFormDialog. */
export interface ArdaItemSupplyFormDialogProps
  extends ArdaItemSupplyFormDialogStaticConfig, ArdaItemSupplyFormDialogRuntimeConfig {}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ORDER_MECHANISMS: { value: OrderMechanism; label: string }[] = [
  { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'IN_STORE', label: 'In Store' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'RFQ', label: 'RFQ' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'THIRD_PARTY', label: 'Third Party' },
  { value: 'OTHER', label: 'Other' },
];

const CURRENCIES: Currency[] = ['USD', 'CAD', 'EUR', 'GBP', 'JPY', 'AUD', 'CNY', 'INR', 'MXN'];

const TIME_UNITS: { value: TimeUnit; label: string }[] = [
  { value: 'HOUR', label: 'Hour' },
  { value: 'DAY', label: 'Day' },
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
];

const fieldClasses =
  'w-full rounded-md border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring';

function formFromSupply(supply: ItemSupply): SupplyFormData {
  return {
    affiliateId: supply.affiliateId,
    supplierName: '',
    supplierProductName: supply.supplierProductName ?? '',
    supplierSku: supply.supplierSku ?? '',
    orderMechanism: supply.orderMechanism ?? '',
    url: supply.url ?? '',
    orderQtyAmount: supply.orderQuantity?.amount ?? 1,
    orderQtyUnit: supply.orderQuantity?.unit ?? 'EACH',
    unitCostValue: supply.unitCost?.value ?? 0,
    unitCostCurrency: supply.unitCost?.currency ?? 'USD',
    leadTimeLength: supply.averageLeadTime?.length ?? 0,
    leadTimeUnit: supply.averageLeadTime?.unit ?? 'DAY',
  };
}

function formToSupplyData(form: SupplyFormData): Partial<ItemSupply> {
  const result: Partial<ItemSupply> = {
    affiliateId: form.affiliateId,
  };

  if (form.supplierProductName) result.supplierProductName = form.supplierProductName;
  if (form.supplierSku) result.supplierSku = form.supplierSku;
  if (form.orderMechanism) result.orderMechanism = form.orderMechanism as OrderMechanism;
  if (form.url) result.url = form.url;

  result.orderQuantity = { amount: form.orderQtyAmount, unit: form.orderQtyUnit };
  result.unitCost = { value: form.unitCostValue, currency: form.unitCostCurrency };

  if (form.leadTimeLength > 0) {
    result.averageLeadTime = { length: form.leadTimeLength, unit: form.leadTimeUnit };
  }

  return result;
}

function isFormDirty(a: SupplyFormData, b: SupplyFormData): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ArdaItemSupplyFormDialog({
  availableSuppliers,
  open,
  mode,
  supply,
  onClose,
  onSave,
  onCreateSupplier,
}: ArdaItemSupplyFormDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const initialForm = mode === 'edit' && supply ? formFromSupply(supply) : EMPTY_FORM;
  const [form, setForm] = useState<SupplyFormData>(initialForm);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const originalRef = useRef<SupplyFormData>(initialForm);

  // Re-initialize form when mode/supply/open changes
  useEffect(() => {
    if (!open) return;
    const data = mode === 'edit' && supply ? formFromSupply(supply) : EMPTY_FORM;
    setForm(data);
    setSupplierSearch('');
    originalRef.current = data;
  }, [mode, supply, open]);

  // Filter supplier options
  const filteredSuppliers = supplierSearch.trim()
    ? availableSuppliers.filter(
        (s) =>
          s.label.toLowerCase().includes(supplierSearch.toLowerCase()) ||
          (s.meta && s.meta.toLowerCase().includes(supplierSearch.toLowerCase())),
      )
    : availableSuppliers;

  const isDirty = useCallback(() => {
    return isFormDirty(form, originalRef.current);
  }, [form]);

  const handleClose = useCallback(() => {
    if (isDirty()) {
      setConfirmOpen(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleConfirmDiscard = useCallback(() => {
    setConfirmOpen(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!form.affiliateId) return;
    onSave(formToSupplyData(form));
  }, [form, onSave]);

  const update = <K extends keyof SupplyFormData>(key: K, value: SupplyFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Escape key handler
  useEffect(() => {
    if (!open || confirmOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, confirmOpen, handleClose]);

  // Focus management
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const panel = dialogRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(
        'input, select, textarea, button:not([aria-label="Close"])',
      );
      focusable?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const isValid = form.affiliateId.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        onClick={handleClose}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed left-1/2 top-1/2 z-[60] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {mode === 'add' ? 'Add Supply' : 'Edit Supply'}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Supplier <span className="text-destructive">*</span>
            </label>
            <ArdaTypeahead
              placeholder="Search suppliers..."
              value={supplierSearch}
              options={filteredSuppliers}
              onInputChange={setSupplierSearch}
              onSelect={(opt) => {
                update('affiliateId', opt.value);
                update('supplierName', opt.label);
                setSupplierSearch(opt.label);
              }}
              {...(onCreateSupplier ? { allowCreate: true, onCreate: onCreateSupplier } : {})}
            />
            {form.affiliateId && (
              <p className="mt-1 text-xs text-muted-foreground">
                Selected: {form.supplierName || form.affiliateId}
              </p>
            )}
          </div>

          {/* Supply Name */}
          <div>
            <label htmlFor="supply-name" className="block text-sm font-medium text-foreground mb-1">
              Supply Name
            </label>
            <input
              id="supply-name"
              type="text"
              value={form.supplierProductName}
              onChange={(e) => update('supplierProductName', e.target.value)}
              placeholder="Descriptive name"
              className={fieldClasses}
            />
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="supply-sku" className="block text-sm font-medium text-foreground mb-1">
              SKU
            </label>
            <input
              id="supply-sku"
              type="text"
              value={form.supplierSku}
              onChange={(e) => update('supplierSku', e.target.value)}
              placeholder="Supplier's SKU"
              className={fieldClasses}
            />
          </div>

          {/* Order Method */}
          <div>
            <label
              htmlFor="supply-mechanism"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Order Method
            </label>
            <select
              id="supply-mechanism"
              value={form.orderMechanism}
              onChange={(e) => update('orderMechanism', e.target.value as OrderMechanism | '')}
              className={fieldClasses}
            >
              <option value="">Select...</option>
              {ORDER_MECHANISMS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* URL (shown when order method is ONLINE) */}
          {form.orderMechanism === 'ONLINE' && (
            <div>
              <label
                htmlFor="supply-url"
                className="block text-sm font-medium text-foreground mb-1"
              >
                URL
              </label>
              <input
                id="supply-url"
                type="url"
                value={form.url}
                onChange={(e) => update('url', e.target.value)}
                placeholder="https://..."
                className={fieldClasses}
              />
            </div>
          )}

          {/* Order Quantity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Order Quantity</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                value={form.orderQtyAmount}
                onChange={(e) => update('orderQtyAmount', Number(e.target.value))}
                className={fieldClasses}
                aria-label="Order quantity amount"
              />
              <select
                value={form.orderQtyUnit}
                onChange={(e) => update('orderQtyUnit', e.target.value as QuantityUnit)}
                className={fieldClasses}
                aria-label="Order quantity unit"
              >
                {[
                  'EACH',
                  'PAIR',
                  'DOZEN',
                  'CASE',
                  'BOX',
                  'PALLET',
                  'ROLL',
                  'GALLON',
                  'LITER',
                  'POUND',
                  'KILOGRAM',
                  'FOOT',
                  'METER',
                ].map((u) => (
                  <option key={u} value={u}>
                    {u.charAt(0) + u.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit Cost */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Unit Cost</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.unitCostValue}
                onChange={(e) => update('unitCostValue', Number(e.target.value))}
                className={fieldClasses}
                aria-label="Unit cost amount"
              />
              <select
                value={form.unitCostCurrency}
                onChange={(e) => update('unitCostCurrency', e.target.value as Currency)}
                className={fieldClasses}
                aria-label="Unit cost currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Average Lead Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Average Lead Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                value={form.leadTimeLength}
                onChange={(e) => update('leadTimeLength', Number(e.target.value))}
                className={fieldClasses}
                aria-label="Lead time length"
              />
              <select
                value={form.leadTimeUnit}
                onChange={(e) => update('leadTimeUnit', e.target.value as TimeUnit)}
                className={fieldClasses}
                aria-label="Lead time unit"
              >
                {TIME_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isValid
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'bg-secondary text-muted-foreground cursor-not-allowed',
            )}
          >
            {mode === 'add' ? 'Add Supply' : 'Save'}
          </button>
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
