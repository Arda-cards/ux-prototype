// Mock item data for local development
import { ArdaItem, ArdaItemPayload } from '@frontend/types/arda-api';
import { MOCK_TENANT_ID } from './mockUser';

// Helper to generate UUIDs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Realistic sample item data
const sampleItems: Partial<ArdaItemPayload>[] = [
  {
    name: 'Surgical Gloves - Medium',
    classification: { type: 'Medical Supplies', subType: 'PPE' },
    useCase: 'General surgical procedures',
    locator: { facility: 'Main Hospital', department: 'Surgery', location: 'Storage Room A' },
    internalSKU: 'SG-MED-001',
    generalLedgerCode: '5100',
    cardSize: 'STANDARD',
    labelSize: 'SMALL',
    itemColor: '#4A90D9',
  },
  {
    name: 'Disposable Syringes 10ml',
    classification: { type: 'Medical Supplies', subType: 'Injection Equipment' },
    useCase: 'Medication administration',
    locator: { facility: 'Main Hospital', department: 'Pharmacy', location: 'Cabinet B3' },
    internalSKU: 'SYR-10ML-002',
    generalLedgerCode: '5101',
    cardSize: 'STANDARD',
    labelSize: 'SMALL',
    itemColor: '#50C878',
  },
  {
    name: 'Bandage Rolls - 4 inch',
    classification: { type: 'Medical Supplies', subType: 'Wound Care' },
    useCase: 'Wound dressing and support',
    locator: { facility: 'Main Hospital', department: 'Emergency', location: 'Trauma Bay' },
    internalSKU: 'BND-4IN-003',
    generalLedgerCode: '5102',
    cardSize: 'SMALL',
    labelSize: 'SMALL',
    itemColor: '#FFD700',
  },
  {
    name: 'IV Solution Saline 0.9%',
    classification: { type: 'Pharmaceuticals', subType: 'IV Fluids' },
    useCase: 'Fluid replacement therapy',
    locator: { facility: 'Main Hospital', department: 'ICU', location: 'Fluid Storage' },
    internalSKU: 'IV-SAL-004',
    generalLedgerCode: '5200',
    cardSize: 'LARGE',
    labelSize: 'MEDIUM',
    itemColor: '#87CEEB',
  },
  {
    name: 'Oxygen Masks - Adult',
    classification: { type: 'Medical Equipment', subType: 'Respiratory' },
    useCase: 'Oxygen therapy delivery',
    locator: { facility: 'Main Hospital', department: 'Respiratory', location: 'Equipment Room' },
    internalSKU: 'OXY-MSK-005',
    generalLedgerCode: '5300',
    cardSize: 'STANDARD',
    labelSize: 'MEDIUM',
    itemColor: '#FF6B6B',
  },
];

// Supplier names for variety
const suppliers = ['MedSupply Co.', 'Healthcare Direct', 'Medical Essentials', 'SupplyChain Medical', 'GlobalMed'];
const orderMethods = ['ONLINE', 'PHONE', 'FAX', 'EDI'];

// Realistic supplier URLs per item (MOCK-034)
const supplierUrls: Record<number, string> = {
  0: 'https://www.medsupplyco.com/order/gloves',
  1: 'https://orders.healthcaredirect.com/syringes',
  2: 'https://example.com/order',
  3: 'https://example.com/order',
  4: 'https://example.com/order',
};

/**
 * Generate a complete mock item with all required fields
 */
export function generateMockItem(overrides?: Partial<ArdaItem>): ArdaItem {
  const eId = generateUUID();
  const rId = generateUUID();
  const now = Date.now();
  const sampleIndex = Math.floor(Math.random() * sampleItems.length);
  const sample = sampleItems[sampleIndex];
  const supplierIndex = Math.floor(Math.random() * suppliers.length);

  const payload: ArdaItemPayload = {
    type: 'Item',
    eId: eId,
    name: sample.name || 'Generic Item',
    imageUrl: `https://picsum.photos/seed/${eId}/200/200`,
    classification: sample.classification,
    useCase: sample.useCase,
    locator: sample.locator,
    internalSKU: sample.internalSKU,
    generalLedgerCode: sample.generalLedgerCode,
    minQuantity: { amount: 10, unit: 'each' },
    notes: 'Mock item for local development',
    cardNotesDefault: '',
    taxable: true,
    primarySupply: {
      supplier: suppliers[supplierIndex],
      sku: `SUP-${sample.internalSKU}`,
      orderMethod: orderMethods[Math.floor(Math.random() * orderMethods.length)],
      url: 'https://example.com/order',
      minimumQuantity: { amount: 5, unit: 'each' },
      orderQuantity: { amount: 100, unit: 'each' },
      unitCost: { value: Math.floor(Math.random() * 50) + 5, currency: 'USD' },
      averageLeadTime: { length: Math.floor(Math.random() * 7) + 1, unit: 'Days' },
    },
    cardSize: sample.cardSize || 'STANDARD',
    labelSize: sample.labelSize || 'SMALL',
    breadcrumbSize: 'SMALL',
    itemColor: sample.itemColor || '#808080',
  };

  const item: ArdaItem = {
    rId: rId,
    asOf: {
      effective: now,
      recorded: now,
    },
    payload: payload,
    metadata: {
      tenantId: MOCK_TENANT_ID,
    },
    author: 'developer@arda.cards',
    retired: false,
    createdBy: 'developer@arda.cards',
    createdAt: now,
    previous: null,
    ...overrides,
  };

  return item;
}

// Pre-generate 50 mock items for consistent pagination testing
export const mockItems: ArdaItem[] = [];

// Add the 5 sample items with consistent IDs for predictable testing
for (let i = 0; i < 5; i++) {
  const sample = sampleItems[i];
  const eId = `item-${String(i + 1).padStart(3, '0')}`;
  const rId = `record-${String(i + 1).padStart(3, '0')}`;
  const now = Date.now() - i * 3600000; // Stagger creation times

  mockItems.push({
    rId: rId,
    asOf: {
      effective: now,
      recorded: now,
    },
    payload: {
      type: 'Item',
      eId: eId,
      name: sample.name!,
      imageUrl: `https://picsum.photos/seed/${eId}/200/200`,
      classification: sample.classification,
      useCase: sample.useCase,
      locator: sample.locator,
      internalSKU: sample.internalSKU,
      generalLedgerCode: sample.generalLedgerCode,
      minQuantity: { amount: 10, unit: 'each' },
      notes: 'Sample item for testing',
      cardNotesDefault: '',
      taxable: true,
      primarySupply: {
        supplier: suppliers[i % suppliers.length],
        sku: `SUP-${sample.internalSKU}`,
        orderMethod: orderMethods[i % orderMethods.length],
        url: supplierUrls[i] || 'https://example.com/order',
        minimumQuantity: { amount: 5, unit: 'each' },
        orderQuantity: { amount: 100, unit: 'each' },
        unitCost: { value: 10 + i * 5, currency: 'USD' },
        averageLeadTime: { length: 3, unit: 'Days' },
      },
      cardSize: sample.cardSize || 'STANDARD',
      labelSize: sample.labelSize || 'SMALL',
      breadcrumbSize: 'SMALL',
      itemColor: sample.itemColor || '#808080',
    },
    metadata: {
      tenantId: MOCK_TENANT_ID,
    },
    author: 'developer@arda.cards',
    retired: false,
    createdBy: 'developer@arda.cards',
    createdAt: now,
    previous: null,
  });
}

// Generate 45 more items dynamically
for (let i = 5; i < 50; i++) {
  const item = generateMockItem();
  item.payload.eId = `item-${String(i + 1).padStart(3, '0')}`;
  item.rId = `record-${String(i + 1).padStart(3, '0')}`;
  item.payload.name = `${sampleItems[i % 5].name} - Variant ${i - 4}`;
  mockItems.push(item);
}
