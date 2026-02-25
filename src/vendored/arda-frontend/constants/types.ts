// Import existing types from the types folder
// sync-pipeline test: verify fully automated flow (no manual approval)
import type {
  Supply,
  ItemClassification,
  CardSize,
  LabelSize,
  BreadcrumbSize,
  ItemColor,
  Quantity,
} from '@frontend/types/items';
import type { Locator } from '@frontend/types/domain';

// Form state type for the form component
export type ItemFormState = {
  name: string;
  imageUrl: string;
  classification: ItemClassification & { subType: string };
  useCase: string;
  locator: Locator & { subLocation?: string };
  internalSKU: string;
  generalLedgerCode: string;
  minQuantity: Quantity;
  notes: string;
  cardNotesDefault: string;
  taxable: boolean;
  primarySupply: Supply & { isDefault: boolean } & {
    url: string;
    sku: string;
    minimumQuantity: { amount: number; unit: string };
    orderQuantity: { amount: number; unit: string };
    unitCost: { value: number; currency: string };
    averageLeadTime: { length: number; unit: string };
  };
  secondarySupply: Supply & { isDefault: boolean } & {
    url: string;
    sku: string;
    minimumQuantity: { amount: number; unit: string };
    orderQuantity: { amount: number; unit: string };
    unitCost: { value: number; currency: string };
    averageLeadTime: { length: number; unit: string };
  };
  cardSize: CardSize;
  labelSize: LabelSize;
  breadcrumbSize: BreadcrumbSize;
  color: ItemColor;
};

// Legacy types (keeping for backward compatibility)
export type ItemForm = {
  title: string;
  minQty: string;
  minUnit: string;
  location: string;
  orderQty: string;
  orderUnit: string;
  supplier: string;
  image: string;
  status: 'Draft' | 'Published' | 'Done' | 'In Progress' | 'Canceled';
  optionalFields?: {
    link?: string;
    SKU?: string;
    UPC?: string;
    unitPrice?: string;
    creator?: string;
    internal?: boolean;
    department?: string;
    cardSize?: string;
    labelSize?: string;
    unitPrice2?: string;
    height?: string;
    heightUnit?: string;
    width?: string;
    widthUnit?: string;
    depth?: string;
    depthUnit?: string;
    weight?: string;
    weightUnit?: string;
    notes?: string;
  };
};

export type ItemFormData = {
  title: string;
  minQty: string;
  minUnit: string;
  location: string;
  orderQty: string;
  orderUnit: string;
  supplier: string;
  image: string;
  status: 'Draft' | 'Published' | 'Done' | 'In Progress' | 'Canceled';
  optionalFields?: {
    link?: string;
    SKU?: string;
    UPC?: string;
    unitPrice?: string;
    creator?: string;
    internal?: boolean;
    department?: string;
    cardSize?: string;
    labelSize?: string;
    unitPrice2?: string;
    height?: string;
    heightUnit?: string;
    width?: string;
    widthUnit?: string;
    depth?: string;
    depthUnit?: string;
    weight?: string;
    weightUnit?: string;
    notes?: string;
  };
};

export type Card = {
  serial: string;
  status: string;
  printStatus: string;
};

export type ItemCard = {
  eid: string;
  title: string;
  supplier: string;
  image: string;
  link: string;
  sku: string;
  serialNumber?: string;
  unitPrice: number;
  minQty?: string;
  minUnit?: string;
  location?: string;
  orderQty?: string;
  orderUnit?: string;
  cardNotes?: string;
  generalLedgerCode?: string;
};
