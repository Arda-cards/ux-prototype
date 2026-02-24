// Mock Kanban card data for local development
import { KanbanCardResult } from '@frontend/types/kanban';
import { mockItems } from './mockItems';
import { MOCK_TENANT_ID } from './mockUser';

// Helper to generate UUIDs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Card statuses - full lifecycle
type CardStatus = 'AVAILABLE' | 'REQUESTING' | 'REQUESTED' | 'IN_PROCESS' | 'READY' | 'FULFILLING' | 'FULFILLED';
const cardStatuses: CardStatus[] = ['AVAILABLE', 'REQUESTING', 'REQUESTED', 'IN_PROCESS', 'READY', 'FULFILLING', 'FULFILLED'];

// Map each card status to its corresponding last event type
const statusEventMap: Record<CardStatus, string> = {
  AVAILABLE: 'CREATE',
  REQUESTING: 'REQUEST',
  REQUESTED: 'ACCEPT',
  IN_PROCESS: 'START_PROCESSING',
  READY: 'COMPLETE_PROCESSING',
  FULFILLING: 'FULFILL',
  FULFILLED: 'RECEIVE',
};

// Helper to ensure classification has required fields
function getClassification(classification?: { type: string; subType?: string }): { type: string; subType: string } {
  return {
    type: classification?.type || '',
    subType: classification?.subType || '',
  };
}

// Helper to ensure locator has required fields
function getLocator(locator?: { facility: string; department?: string; location?: string }): { facility: string; department: string; location: string } {
  return {
    facility: locator?.facility || '',
    department: locator?.department || '',
    location: locator?.location || '',
  };
}

/**
 * Generate a mock Kanban card linked to an item
 */
export function generateMockKanbanCard(overrides?: Partial<KanbanCardResult>): KanbanCardResult {
  const itemIndex = Math.floor(Math.random() * Math.min(mockItems.length, 10));
  const item = mockItems[itemIndex];
  const eId = generateUUID();
  const rId = generateUUID();
  const now = Date.now();
  const serialNumber = `KC-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  const status = cardStatuses[Math.floor(Math.random() * cardStatuses.length)];

  const card: KanbanCardResult = {
    rId: rId,
    asOf: {
      effective: now,
      recorded: now,
    },
    payload: {
      eId: eId,
      rId: rId,
      lookupUrlId: `kanban/cards/${eId}?view=card&src=qr`,
      serialNumber: serialNumber,
      item: {
        type: 'Item',
        eId: item.payload.eId,
        name: item.payload.name,
      },
      itemDetails: {
        eId: item.payload.eId,
        name: item.payload.name,
        imageUrl: item.payload.imageUrl || '',
        classification: getClassification(item.payload.classification),
        useCase: item.payload.useCase || '',
        locator: getLocator(item.payload.locator),
        internalSKU: item.payload.internalSKU || '',
        generalLedgerCode: item.payload.generalLedgerCode,
        notes: item.payload.notes || '',
        cardNotesDefault: item.payload.cardNotesDefault || '',
        taxable: item.payload.taxable ?? false,
        minQuantity: item.payload.minQuantity,
        primarySupply: {
          supplier: item.payload.primarySupply?.supplier || '',
          sku: item.payload.primarySupply?.sku || '',
          orderMethod: item.payload.primarySupply?.orderMethod || '',
          url: item.payload.primarySupply?.url || '',
          orderQuantity: item.payload.primarySupply?.orderQuantity || { amount: 0, unit: '' },
          unitCost: item.payload.primarySupply?.unitCost || { value: 0, currency: '' },
          averageLeadTime: item.payload.primarySupply?.averageLeadTime || { length: 0, unit: '' },
        },
        defaultSupply: item.payload.defaultSupply || 'PRIMARY',
        cardSize: item.payload.cardSize || 'STANDARD',
        labelSize: item.payload.labelSize || 'SMALL',
        breadcrumbSize: item.payload.breadcrumbSize || 'SMALL',
        itemColor: item.payload.itemColor || '#808080',
      },
      cardQuantity: {
        amount: Math.floor(Math.random() * 50) + 10,
        unit: 'each',
      },
      lastEvent: {
        when: {
          effective: now - Math.floor(Math.random() * 86400000),
          recorded: now - Math.floor(Math.random() * 86400000),
        },
        type: statusEventMap[status],
        author: 'developer@arda.cards',
      },
      status: status,
      printStatus: status === 'AVAILABLE' ? 'NOT_PRINTED' : 'PRINTED',
    },
    metadata: {
      tenantId: MOCK_TENANT_ID,
    },
    author: 'developer@arda.cards',
    retired: false,
    ...overrides,
  };

  return card;
}

// Helper to build a pre-generated card for a specific item and status
function buildCard(
  item: typeof mockItems[0],
  cardIndex: number,
  status: CardStatus,
  baseTime: number,
): KanbanCardResult {
  const eId = `card-${cardIndex}`;
  const rId = `card-record-${cardIndex}`;
  // Older timestamps for later lifecycle states (FULFILLED cards are older)
  const statusAgeOffset: Record<CardStatus, number> = {
    AVAILABLE: 0,
    REQUESTING: 1_800_000,       // 30 min ago
    REQUESTED: 3_600_000,        // 1 hour ago
    IN_PROCESS: 7_200_000,       // 2 hours ago
    READY: 10_800_000,           // 3 hours ago
    FULFILLING: 14_400_000,      // 4 hours ago
    FULFILLED: 86_400_000,       // 1 day ago
  };
  const age = statusAgeOffset[status];
  const eventTime = baseTime - age;

  return {
    rId: rId,
    asOf: { effective: eventTime, recorded: eventTime },
    payload: {
      eId: eId,
      rId: rId,
      lookupUrlId: `kanban/cards/${eId}?view=card&src=qr`,
      serialNumber: `KC-${String(cardIndex).padStart(4, '0')}`,
      item: {
        type: 'Item',
        eId: item.payload.eId,
        name: item.payload.name,
      },
      itemDetails: {
        eId: item.payload.eId,
        name: item.payload.name,
        imageUrl: item.payload.imageUrl || '',
        classification: getClassification(item.payload.classification),
        useCase: item.payload.useCase || '',
        locator: getLocator(item.payload.locator),
        internalSKU: item.payload.internalSKU || '',
        notes: item.payload.notes || '',
        cardNotesDefault: item.payload.cardNotesDefault || '',
        taxable: item.payload.taxable ?? false,
        primarySupply: {
          supplier: item.payload.primarySupply?.supplier || '',
          sku: item.payload.primarySupply?.sku || '',
          orderMethod: item.payload.primarySupply?.orderMethod || '',
          url: item.payload.primarySupply?.url || '',
          orderQuantity: item.payload.primarySupply?.orderQuantity || { amount: 0, unit: '' },
          unitCost: item.payload.primarySupply?.unitCost || { value: 0, currency: '' },
          averageLeadTime: item.payload.primarySupply?.averageLeadTime || { length: 0, unit: '' },
        },
        defaultSupply: 'PRIMARY',
        cardSize: item.payload.cardSize || 'STANDARD',
        labelSize: item.payload.labelSize || 'SMALL',
        breadcrumbSize: item.payload.breadcrumbSize || 'SMALL',
        itemColor: item.payload.itemColor || '#808080',
      },
      cardQuantity: { amount: 25, unit: 'each' },
      lastEvent: {
        when: { effective: eventTime, recorded: eventTime },
        type: statusEventMap[status],
        author: 'developer@arda.cards',
      },
      status: status,
      printStatus: status === 'AVAILABLE' ? 'NOT_PRINTED' : 'PRINTED',
    },
    metadata: { tenantId: MOCK_TENANT_ID },
    author: 'developer@arda.cards',
    retired: false,
  };
}

// Pre-generate mock kanban cards with realistic lifecycle distribution
// Distribution table (MOCK-033):
//   Item 1 (Surgical Gloves):      AVAILABLE, REQUESTING, FULFILLED
//   Item 2 (Disposable Syringes):   REQUESTING, REQUESTED, FULFILLED
//   Item 3 (Bandage Rolls):         REQUESTING, IN_PROCESS, FULFILLED
//   Item 4 (IV Solution):           AVAILABLE, REQUESTING, REQUESTED
//   Item 5 (Oxygen Masks):          IN_PROCESS, FULFILLED, FULFILLED
export const mockKanbanCards: KanbanCardResult[] = [];

const now = Date.now();

// Card distribution: [itemIndex, [status1, status2, status3]]
const cardDistribution: [number, CardStatus[]][] = [
  [0, ['AVAILABLE', 'REQUESTING', 'FULFILLED']],
  [1, ['REQUESTING', 'REQUESTED', 'FULFILLED']],
  [2, ['REQUESTING', 'IN_PROCESS', 'FULFILLED']],
  [3, ['AVAILABLE', 'REQUESTING', 'REQUESTED']],
  [4, ['IN_PROCESS', 'FULFILLED', 'FULFILLED']],
];

let cardCounter = 1;
for (const [itemIndex, statuses] of cardDistribution) {
  const item = mockItems[itemIndex];
  for (const status of statuses) {
    mockKanbanCards.push(buildCard(item, cardCounter, status, now));
    cardCounter++;
  }
}
