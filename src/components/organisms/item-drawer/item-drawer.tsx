'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { X, Pencil, Package, ImageOff, ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ArdaConfirmDialog } from '@/components/atoms/confirm-dialog/confirm-dialog';

/* ------------------------------------------------------------------ */
/*  Value Types                                                       */
/* ------------------------------------------------------------------ */

export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP';

export interface Money {
  value: number;
  currency: Currency;
}

export type TimeUnit = 'HOUR' | 'DAY' | 'WEEK';

export interface Duration {
  length: number;
  unit: TimeUnit;
}

export interface Quantity {
  amount: number;
  unit: string;
}

export type OrderMechanism =
  | 'PURCHASE_ORDER'
  | 'EMAIL'
  | 'PHONE'
  | 'IN_STORE'
  | 'ONLINE'
  | 'RFQ'
  | 'PRODUCTION'
  | 'THIRD_PARTY'
  | 'OTHER';

/* ------------------------------------------------------------------ */
/*  Domain Types                                                      */
/* ------------------------------------------------------------------ */

export interface ItemClassification {
  type: string;
  subType?: string;
}

export interface Locator {
  facility: string;
  department?: string;
  location?: string;
}

export interface Supply {
  supplier: string;
  name?: string;
  sku?: string;
  orderMechanism?: OrderMechanism;
  url?: string;
  minimumQuantity?: Quantity;
  orderQuantity?: Quantity;
  unitCost?: Money;
  averageLeadTime?: Duration;
  orderNotes?: string;
  orderCost: Money;
}

/* ------------------------------------------------------------------ */
/*  Item Type                                                         */
/* ------------------------------------------------------------------ */

export interface ItemData {
  entityId?: string;
  name: string;
  imageUrl?: string;
  classification?: ItemClassification;
  useCase?: string;
  locator?: Locator;
  internalSKU?: string;
  generalLedgerCode?: string;
  minQuantity?: Quantity;
  notes?: string;
  cardNotesDefault?: string;
  taxable?: boolean;
  primarySupply?: Supply;
  secondarySupply?: Supply;
  defaultSupply?: string;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                          */
/* ------------------------------------------------------------------ */

export const defaultMoney: Money = { value: 0, currency: 'USD' };
export const defaultQuantity: Quantity = { amount: 1, unit: 'each' };

export const emptyItem: ItemData = {
  name: '',
  classification: { type: '' },
  locator: { facility: '' },
  minQuantity: defaultQuantity,
  taxable: true,
  primarySupply: {
    supplier: '',
    orderCost: defaultMoney,
  },
};

/* ------------------------------------------------------------------ */
/*  Sample Data                                                       */
/* ------------------------------------------------------------------ */

export const sampleItem: ItemData = {
  entityId: 'item-001',
  name: 'Hydraulic Cylinder HC-500',
  imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
  classification: { type: 'Filters', subType: 'Hydraulic' },
  useCase: 'Maintenance',
  locator: {
    facility: 'Main Warehouse',
    department: 'MRO',
    location: 'W-03-B2',
  },
  internalSKU: 'HYD-CYL-HC500',
  generalLedgerCode: '6120-MRO',
  minQuantity: { amount: 5, unit: 'each' },
  notes: 'Requires pressure test before installation.',
  cardNotesDefault: 'Handle with care - precision component',
  taxable: true,
  primarySupply: {
    supplier: 'Fastenal Corp.',
    name: 'HC-500 Hydraulic Cylinder',
    sku: 'FAS-HC500-A',
    orderMechanism: 'ONLINE',
    url: 'https://fastenal.com/hc500',
    minimumQuantity: { amount: 1, unit: 'each' },
    orderQuantity: { amount: 5, unit: 'each' },
    unitCost: { value: 189.99, currency: 'USD' },
    averageLeadTime: { length: 5, unit: 'DAY' },
    orderNotes: 'Free shipping over $500',
    orderCost: { value: 949.95, currency: 'USD' },
  },
};

/* ------------------------------------------------------------------ */
/*  Drawer Config Interfaces                                          */
/* ------------------------------------------------------------------ */

export type ItemDrawerMode = 'view' | 'add' | 'edit';

/** Design-time configuration. */
export interface ArdaItemDrawerStaticConfig {
  /** Override the drawer header title. Defaults to mode-appropriate text. */
  title?: string;
  /** Classification type options for the form select. */
  classificationTypes?: string[];
  /** OrderMechanism labels map override. */
  orderMechanismLabels?: Partial<Record<OrderMechanism, string>>;
}

/** Runtime configuration. */
export interface ArdaItemDrawerRuntimeConfig {
  /** Whether the drawer is open. */
  open: boolean;
  /** Current operating mode. */
  mode: ItemDrawerMode;
  /** Item data for view/edit modes. Ignored in add mode. */
  item?: ItemData;
  /** Called when the drawer requests to close. */
  onClose: () => void;
  /** Called when the user submits the form (add or edit). */
  onSubmit?: (data: ItemData) => void;
  /** Called when the user clicks Edit from view mode. */
  onEdit?: () => void;
}

/** Combined props for ArdaItemDrawer. */
export interface ArdaItemDrawerProps
  extends ArdaItemDrawerStaticConfig, ArdaItemDrawerRuntimeConfig {}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const ORDER_MECHANISM_LABELS: Record<OrderMechanism, string> = {
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

const ALL_ORDER_MECHANISMS: OrderMechanism[] = [
  'PURCHASE_ORDER',
  'EMAIL',
  'PHONE',
  'IN_STORE',
  'ONLINE',
  'RFQ',
  'PRODUCTION',
  'THIRD_PARTY',
  'OTHER',
];

const ALL_CURRENCIES: Currency[] = ['USD', 'CAD', 'EUR', 'GBP'];

const ALL_TIME_UNITS: TimeUnit[] = ['HOUR', 'DAY', 'WEEK'];

function formatMoney(money: Money | undefined): string {
  if (!money) return '-';
  return `${money.currency} ${money.value.toFixed(2)}`;
}

function formatQuantity(qty: Quantity | undefined): string {
  if (!qty) return '-';
  return `${qty.amount} ${qty.unit}`;
}

function formatDuration(dur: Duration | undefined): string {
  if (!dur) return '-';
  const unitLabel = dur.unit.charAt(0) + dur.unit.slice(1).toLowerCase();
  return `${dur.length} ${unitLabel}${dur.length !== 1 ? 's' : ''}`;
}

/** Deep-compare two ItemData objects for dirty detection. */
function isItemDirty(a: ItemData, b: ItemData): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

/**
 * Set or remove an optional key from an object.
 * Needed because exactOptionalPropertyTypes prevents `{ ...obj, key: val || undefined }`.
 */
function withOptional<T extends object, K extends keyof T>(obj: T, key: K, value: string): T {
  const copy = { ...obj };
  if (value) {
    (copy as Record<string, unknown>)[key as string] = value;
  } else {
    delete (copy as Record<string, unknown>)[key as string];
  }
  return copy;
}

/** Build a Supply with defaults for missing optional fields. */
function ensureSupply(supply: Supply | undefined): Supply {
  return supply ?? { supplier: '', orderCost: defaultMoney };
}

/** Build a Quantity with defaults. */
function ensureQuantity(qty: Quantity | undefined): Quantity {
  return qty ?? { ...defaultQuantity };
}

/* ------------------------------------------------------------------ */
/*  View-mode sub-components                                          */
/* ------------------------------------------------------------------ */

function FieldRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 text-right max-w-[60%] break-words">
        {value || '-'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  View Mode Content                                                 */
/* ------------------------------------------------------------------ */

function ViewModeContent({
  item,
  mechanismLabels,
}: {
  item: ItemData;
  mechanismLabels: Record<OrderMechanism, string>;
}) {
  const classification = item.classification;
  const locator = item.locator;
  const supply = item.primarySupply;

  return (
    <>
      {/* Image preview */}
      <div className="mb-6">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageOff size={48} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Item name */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{item.name}</h2>

      {/* Item section */}
      <Section title="Item">
        <FieldRow label="SKU" value={item.internalSKU} />
        <FieldRow label="GL Code" value={item.generalLedgerCode} />
        <FieldRow
          label="Classification"
          value={
            classification
              ? [classification.type, classification.subType].filter(Boolean).join(' / ')
              : undefined
          }
        />
        <FieldRow label="Use Case" value={item.useCase} />
      </Section>

      {/* Location section */}
      <Section title="Location">
        <FieldRow label="Facility" value={locator?.facility} />
        <FieldRow label="Department" value={locator?.department} />
        <FieldRow label="Location" value={locator?.location} />
      </Section>

      {/* Stock section */}
      <Section title="Stock">
        <FieldRow label="Min Quantity" value={formatQuantity(item.minQuantity)} />
        <FieldRow
          label="Taxable"
          value={item.taxable === undefined ? '-' : item.taxable ? 'Yes' : 'No'}
        />
      </Section>

      {/* Supply section */}
      {supply && (
        <Section title="Supply">
          <FieldRow label="Supplier" value={supply.supplier} />
          <FieldRow label="Unit Cost" value={formatMoney(supply.unitCost)} />
          <FieldRow label="Order Qty" value={formatQuantity(supply.orderQuantity)} />
          <FieldRow label="Lead Time" value={formatDuration(supply.averageLeadTime)} />
          <FieldRow
            label="Order Mechanism"
            value={supply.orderMechanism ? mechanismLabels[supply.orderMechanism] : undefined}
          />
        </Section>
      )}

      {/* Notes section */}
      {(item.notes || item.cardNotesDefault) && (
        <Section title="Notes">
          <FieldRow label="Notes" value={item.notes} />
          <FieldRow label="Card Notes" value={item.cardNotesDefault} />
        </Section>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Form sub-components                                               */
/* ------------------------------------------------------------------ */

const fieldClasses =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldClasses}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function FormTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={fieldClasses}
    />
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {title}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Supply Fields                                                     */
/* ------------------------------------------------------------------ */

function SupplyFields({
  prefix,
  supply,
  onChange,
  mechanismLabels,
}: {
  prefix: string;
  supply: Supply;
  onChange: (updated: Supply) => void;
  mechanismLabels: Record<OrderMechanism, string>;
}) {
  const update = <K extends keyof Supply>(key: K, val: Supply[K]) => {
    onChange({ ...supply, [key]: val });
  };

  const unitCost = supply.unitCost ?? { ...defaultMoney };
  const minQty = ensureQuantity(supply.minimumQuantity);
  const orderQty = ensureQuantity(supply.orderQuantity);
  const leadTime = supply.averageLeadTime ?? { length: 0, unit: 'DAY' as TimeUnit };

  return (
    <>
      <FormField label="Supplier" htmlFor={`${prefix}-supplier`}>
        <input
          id={`${prefix}-supplier`}
          type="text"
          value={supply.supplier}
          onChange={(e) => update('supplier', e.target.value)}
          placeholder="Supplier name"
          className={fieldClasses}
        />
      </FormField>

      <FormField label="Product Name" htmlFor={`${prefix}-name`}>
        <input
          id={`${prefix}-name`}
          type="text"
          value={supply.name ?? ''}
          onChange={(e) => update('name', e.target.value || undefined)}
          placeholder="Product name"
          className={fieldClasses}
        />
      </FormField>

      <FormField label="Supplier SKU" htmlFor={`${prefix}-sku`}>
        <input
          id={`${prefix}-sku`}
          type="text"
          value={supply.sku ?? ''}
          onChange={(e) => update('sku', e.target.value || undefined)}
          placeholder="Supplier SKU"
          className={fieldClasses}
        />
      </FormField>

      <FormField label="Order Mechanism" htmlFor={`${prefix}-mechanism`}>
        <FormSelect
          id={`${prefix}-mechanism`}
          value={supply.orderMechanism ?? ''}
          onChange={(v) => update('orderMechanism', (v || undefined) as OrderMechanism | undefined)}
          options={ALL_ORDER_MECHANISMS.map((m) => ({ value: m, label: mechanismLabels[m] }))}
          placeholder="Select..."
        />
      </FormField>

      <FormField label="URL" htmlFor={`${prefix}-url`}>
        <input
          id={`${prefix}-url`}
          type="url"
          value={supply.url ?? ''}
          onChange={(e) => update('url', e.target.value || undefined)}
          placeholder="https://..."
          className={fieldClasses}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Min Qty" htmlFor={`${prefix}-minqty`}>
          <input
            id={`${prefix}-minqty`}
            type="number"
            min={0}
            value={minQty.amount}
            onChange={(e) =>
              update('minimumQuantity', { ...minQty, amount: Number(e.target.value) })
            }
            className={fieldClasses}
          />
        </FormField>
        <FormField label="Min Qty Unit" htmlFor={`${prefix}-minqty-unit`}>
          <input
            id={`${prefix}-minqty-unit`}
            type="text"
            value={minQty.unit}
            onChange={(e) => update('minimumQuantity', { ...minQty, unit: e.target.value })}
            className={fieldClasses}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Order Qty" htmlFor={`${prefix}-orderqty`}>
          <input
            id={`${prefix}-orderqty`}
            type="number"
            min={0}
            value={orderQty.amount}
            onChange={(e) =>
              update('orderQuantity', { ...orderQty, amount: Number(e.target.value) })
            }
            className={fieldClasses}
          />
        </FormField>
        <FormField label="Order Qty Unit" htmlFor={`${prefix}-orderqty-unit`}>
          <input
            id={`${prefix}-orderqty-unit`}
            type="text"
            value={orderQty.unit}
            onChange={(e) => update('orderQuantity', { ...orderQty, unit: e.target.value })}
            className={fieldClasses}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Unit Cost" htmlFor={`${prefix}-unitcost`}>
          <input
            id={`${prefix}-unitcost`}
            type="number"
            min={0}
            step={0.01}
            value={unitCost.value}
            onChange={(e) => update('unitCost', { ...unitCost, value: Number(e.target.value) })}
            className={fieldClasses}
          />
        </FormField>
        <FormField label="Currency" htmlFor={`${prefix}-unitcost-currency`}>
          <FormSelect
            id={`${prefix}-unitcost-currency`}
            value={unitCost.currency}
            onChange={(v) => update('unitCost', { ...unitCost, currency: v as Currency })}
            options={ALL_CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Lead Time" htmlFor={`${prefix}-leadtime`}>
          <input
            id={`${prefix}-leadtime`}
            type="number"
            min={0}
            value={leadTime.length}
            onChange={(e) =>
              update('averageLeadTime', { ...leadTime, length: Number(e.target.value) })
            }
            className={fieldClasses}
          />
        </FormField>
        <FormField label="Time Unit" htmlFor={`${prefix}-leadtime-unit`}>
          <FormSelect
            id={`${prefix}-leadtime-unit`}
            value={leadTime.unit}
            onChange={(v) => update('averageLeadTime', { ...leadTime, unit: v as TimeUnit })}
            options={ALL_TIME_UNITS.map((u) => ({
              value: u,
              label: u.charAt(0) + u.slice(1).toLowerCase(),
            }))}
          />
        </FormField>
      </div>

      <FormField label="Order Notes" htmlFor={`${prefix}-ordernotes`}>
        <FormTextarea
          id={`${prefix}-ordernotes`}
          value={supply.orderNotes ?? ''}
          onChange={(v) => update('orderNotes', v || undefined)}
          placeholder="Order notes..."
          rows={2}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Order Cost" htmlFor={`${prefix}-ordercost`}>
          <input
            id={`${prefix}-ordercost`}
            type="number"
            min={0}
            step={0.01}
            value={supply.orderCost.value}
            onChange={(e) =>
              update('orderCost', { ...supply.orderCost, value: Number(e.target.value) })
            }
            className={fieldClasses}
          />
        </FormField>
        <FormField label="Currency" htmlFor={`${prefix}-ordercost-currency`}>
          <FormSelect
            id={`${prefix}-ordercost-currency`}
            value={supply.orderCost.currency}
            onChange={(v) => update('orderCost', { ...supply.orderCost, currency: v as Currency })}
            options={ALL_CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </FormField>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Form Mode Content                                                 */
/* ------------------------------------------------------------------ */

function FormModeContent({
  formData,
  setFormData,
  classificationTypes,
  mechanismLabels,
}: {
  formData: ItemData;
  setFormData: React.Dispatch<React.SetStateAction<ItemData>>;
  classificationTypes: string[];
  mechanismLabels: Record<OrderMechanism, string>;
}) {
  const updateField = <K extends keyof ItemData>(key: K, value: ItemData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const classification = formData.classification ?? { type: '' };
  const locator = formData.locator ?? { facility: '' };
  const minQty = ensureQuantity(formData.minQuantity);
  const primarySupply = ensureSupply(formData.primarySupply);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Section 1: Item Details */}
      <Section title="Item Details">
        <FormField label="Name" htmlFor="item-name">
          <input
            id="item-name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Item name"
            className={fieldClasses}
          />
        </FormField>

        <FormField label="Image URL" htmlFor="item-imageurl">
          <input
            id="item-imageurl"
            type="url"
            value={formData.imageUrl ?? ''}
            onChange={(e) => updateField('imageUrl', e.target.value || undefined)}
            placeholder="https://..."
            className={fieldClasses}
          />
        </FormField>

        <FormField label="Internal SKU" htmlFor="item-sku">
          <input
            id="item-sku"
            type="text"
            value={formData.internalSKU ?? ''}
            onChange={(e) => updateField('internalSKU', e.target.value || undefined)}
            placeholder="SKU"
            className={fieldClasses}
          />
        </FormField>

        <FormField label="GL Code" htmlFor="item-glcode">
          <input
            id="item-glcode"
            type="text"
            value={formData.generalLedgerCode ?? ''}
            onChange={(e) => updateField('generalLedgerCode', e.target.value || undefined)}
            placeholder="General Ledger Code"
            className={fieldClasses}
          />
        </FormField>
      </Section>

      {/* Section 2: Classification */}
      <Section title="Classification">
        <FormField label="Type" htmlFor="item-class-type">
          {classificationTypes.length > 0 ? (
            <FormSelect
              id="item-class-type"
              value={classification.type}
              onChange={(v) => updateField('classification', { ...classification, type: v })}
              options={classificationTypes.map((t) => ({ value: t, label: t }))}
              placeholder="Select type..."
            />
          ) : (
            <input
              id="item-class-type"
              type="text"
              value={classification.type}
              onChange={(e) =>
                updateField('classification', { ...classification, type: e.target.value })
              }
              placeholder="Classification type"
              className={fieldClasses}
            />
          )}
        </FormField>

        <FormField label="Sub-Type" htmlFor="item-class-subtype">
          <input
            id="item-class-subtype"
            type="text"
            value={classification.subType ?? ''}
            onChange={(e) =>
              updateField('classification', withOptional(classification, 'subType', e.target.value))
            }
            placeholder="Sub-type"
            className={fieldClasses}
          />
        </FormField>

        <FormField label="Use Case" htmlFor="item-usecase">
          <input
            id="item-usecase"
            type="text"
            value={formData.useCase ?? ''}
            onChange={(e) => updateField('useCase', e.target.value || undefined)}
            placeholder="Use case"
            className={fieldClasses}
          />
        </FormField>
      </Section>

      {/* Section 3: Location */}
      <Section title="Location">
        <FormField label="Facility" htmlFor="item-facility">
          <input
            id="item-facility"
            type="text"
            value={locator.facility}
            onChange={(e) => updateField('locator', { ...locator, facility: e.target.value })}
            placeholder="Facility"
            className={fieldClasses}
          />
        </FormField>

        <FormField label="Department" htmlFor="item-department">
          <input
            id="item-department"
            type="text"
            value={locator.department ?? ''}
            onChange={(e) =>
              updateField('locator', withOptional(locator, 'department', e.target.value))
            }
            placeholder="Department"
            className={fieldClasses}
          />
        </FormField>

        <FormField label="Location" htmlFor="item-location">
          <input
            id="item-location"
            type="text"
            value={locator.location ?? ''}
            onChange={(e) =>
              updateField('locator', withOptional(locator, 'location', e.target.value))
            }
            placeholder="Location"
            className={fieldClasses}
          />
        </FormField>
      </Section>

      {/* Section 4: Stock Settings */}
      <Section title="Stock Settings">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Min Quantity" htmlFor="item-minqty">
            <input
              id="item-minqty"
              type="number"
              min={0}
              value={minQty.amount}
              onChange={(e) =>
                updateField('minQuantity', { ...minQty, amount: Number(e.target.value) })
              }
              className={fieldClasses}
            />
          </FormField>
          <FormField label="Unit" htmlFor="item-minqty-unit">
            <input
              id="item-minqty-unit"
              type="text"
              value={minQty.unit}
              onChange={(e) => updateField('minQuantity', { ...minQty, unit: e.target.value })}
              className={fieldClasses}
            />
          </FormField>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <input
            id="item-taxable"
            type="checkbox"
            checked={formData.taxable ?? false}
            onChange={(e) => updateField('taxable', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="item-taxable" className="text-sm font-medium text-gray-700">
            Taxable
          </label>
        </div>

        <FormField label="Card Notes Default" htmlFor="item-cardnotes">
          <FormTextarea
            id="item-cardnotes"
            value={formData.cardNotesDefault ?? ''}
            onChange={(v) => updateField('cardNotesDefault', v || undefined)}
            placeholder="Default card notes..."
            rows={2}
          />
        </FormField>
      </Section>

      {/* Section 5: Primary Supply */}
      <Section title="Primary Supply">
        <SupplyFields
          prefix="primary"
          supply={primarySupply}
          onChange={(updated) => updateField('primarySupply', updated)}
          mechanismLabels={mechanismLabels}
        />
      </Section>

      {/* Section 6: Secondary Supply (collapsible) */}
      <CollapsibleSection
        title="Secondary Supply (Optional)"
        defaultOpen={!!formData.secondarySupply?.supplier}
      >
        <SupplyFields
          prefix="secondary"
          supply={ensureSupply(formData.secondarySupply)}
          onChange={(updated) => updateField('secondarySupply', updated)}
          mechanismLabels={mechanismLabels}
        />
      </CollapsibleSection>

      {/* Section 7: Notes */}
      <Section title="Notes">
        <FormField label="Notes" htmlFor="item-notes">
          <FormTextarea
            id="item-notes"
            value={formData.notes ?? ''}
            onChange={(v) => updateField('notes', v || undefined)}
            placeholder="Additional notes..."
          />
        </FormField>
      </Section>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  ArdaItemDrawer Component                                          */
/* ------------------------------------------------------------------ */

export function ArdaItemDrawer({
  title,
  classificationTypes = [],
  orderMechanismLabels,
  open,
  mode,
  item,
  onClose,
  onSubmit,
  onEdit,
}: ArdaItemDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const mechanismLabels: Record<OrderMechanism, string> = {
    ...ORDER_MECHANISM_LABELS,
    ...orderMechanismLabels,
  };

  // Form state management
  const initialFormData = mode === 'edit' && item ? item : emptyItem;
  const [formData, setFormData] = useState<ItemData>(initialFormData);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const originalRef = useRef<ItemData>(initialFormData);

  // Re-initialize form when mode or item changes
  useEffect(() => {
    const data = mode === 'edit' && item ? item : emptyItem;
    setFormData(data);
    originalRef.current = data;
  }, [mode, item]);

  // Resolve the header title based on mode and props
  const resolvedTitle =
    title ??
    (mode === 'view'
      ? (item?.name ?? 'Item Details')
      : mode === 'add'
        ? 'Add New Item'
        : 'Edit Item');

  // Determine if form has unsaved changes
  const isDirty = useCallback(() => {
    if (mode === 'view') return false;
    return isItemDirty(formData, originalRef.current);
  }, [formData, mode]);

  // Cancel flow: show confirm dialog if dirty, otherwise close/return to view
  const handleCancel = useCallback(() => {
    if (isDirty()) {
      setConfirmOpen(true);
    } else if (mode === 'edit') {
      // No changes in edit mode: return to view mode
      onEdit?.();
    } else {
      // Add mode with no changes: close drawer
      onClose();
    }
  }, [isDirty, mode, onEdit, onClose]);

  // Confirm discard: discard changes and close/return
  const handleConfirmDiscard = useCallback(() => {
    setConfirmOpen(false);
    if (mode === 'edit') {
      setFormData(originalRef.current);
      onEdit?.();
    } else {
      onClose();
    }
  }, [mode, onEdit, onClose]);

  // Cancel discard: close dialog, stay in form
  const handleCancelDiscard = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  // Submit handler
  const handleSubmit = useCallback(() => {
    onSubmit?.(formData);
  }, [formData, onSubmit]);

  // Handle overlay click and X button: in form modes, trigger cancel flow
  const handleCloseRequest = useCallback(() => {
    if (mode === 'view') {
      onClose();
    } else {
      handleCancel();
    }
  }, [mode, onClose, handleCancel]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't handle Escape when confirm dialog is open (it handles its own Escape)
      if (confirmOpen) return;
      if (e.key === 'Escape') {
        if (mode === 'view') {
          onClose();
        } else {
          handleCancel();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, mode, handleCancel, confirmOpen]);

  // Focus management: focus first focusable element when drawer opens
  useEffect(() => {
    if (!open) return;

    // Small delay to let the transition start before focusing
    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 transition-all duration-300',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        onClick={handleCloseRequest}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'fixed right-0 inset-y-0 z-50 w-full sm:w-[420px] lg:w-[460px] bg-white shadow-xl flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            <Package size={20} className="text-gray-400 shrink-0" />
            <h2 id={titleId} className="text-base font-semibold text-gray-900 truncate">
              {resolvedTitle}
            </h2>
          </div>
          <button
            onClick={handleCloseRequest}
            aria-label="Close drawer"
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {mode === 'view' && item && (
            <ViewModeContent item={item} mechanismLabels={mechanismLabels} />
          )}
          {(mode === 'add' || mode === 'edit') && (
            <FormModeContent
              formData={formData}
              setFormData={setFormData}
              classificationTypes={classificationTypes}
              mechanismLabels={mechanismLabels}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          {mode === 'view' && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
          {(mode === 'add' || mode === 'edit') && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {mode === 'add' ? 'Add Item' : 'Save'}
              </button>
            </div>
          )}
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
        onCancel={handleCancelDiscard}
      />
    </>
  );
}
