import * as items from '@frontend/types/items';
import * as domain from '@frontend/types/domain';
import * as general from '@frontend/types/general';
import type { ArdaItem, ArdaDraftItem, ArdaItemPayload, ArdaCreateItemRequest } from '@frontend/types/arda-api';
import { mapArdaItemToItem, mapItemToArdaCreateRequest, mapItemToArdaUpdateRequest } from './ardaMappers';

const API_TOP_LEVEL_KEYS: (keyof ArdaCreateItemRequest)[] = [
  'name',
  'imageUrl',
  'classification',
  'useCase',
  'locator',
  'internalSKU',
  'generalLedgerCode',
  'glCode',
  'minQuantity',
  'notes',
  'cardNotesDefault',
  'taxable',
  'primarySupply',
  'secondarySupply',
  'defaultSupply',
  'cardSize',
  'labelSize',
  'breadcrumbSize',
  'itemColor',
];

const LOCATOR_KEYS = ['facility', 'department', 'location', 'subLocation'] as const;

const SUPPLY_KEYS = [
  'supplyEId',
  'name',
  'supplier',
  'sku',
  'orderMethod',
  'url',
  'minimumQuantity',
  'orderQuantity',
  'unitCost',
  'averageLeadTime',
] as const;

const defaultOrderCost: items.Supply['orderCost'] = { value: 0, currency: 'USD' };

function fullItemFromEditForm(): Partial<items.Item> {
  return {
    name: 'Test Item',
    imageUrl: 'https://example.com/img.png',
    classification: { type: 'Type A', subType: 'SubType 1' },
    useCase: 'Lab',
    locator: {
      facility: 'F1',
      department: 'D1',
      location: 'L1',
      subLocation: 'SL1',
    },
    internalSKU: 'SKU-001',
    generalLedgerCode: 'GL-001',
    minQuantity: { amount: 2, unit: 'each' },
    notes: 'Some notes',
    cardNotesDefault: 'Card notes',
    taxable: true,
    primarySupply: {
      supplyEId: 'supply-eid-1',
      supplier: 'Supplier A',
      name: 'Primary',
      sku: 'PSKU-1',
      orderMechanism: 'ONLINE',
      url: 'https://supplier-a.com',
      minimumQuantity: { amount: 1, unit: 'each' },
      orderQuantity: { amount: 10, unit: 'each' },
      unitCost: { value: 5.99, currency: 'USD' },
      averageLeadTime: { length: 2, unit: 'DAY' },
      orderCost: { value: 59.9, currency: 'USD' },
    },
    secondarySupply: {
      supplyEId: 'supply-eid-2',
      supplier: 'Supplier B',
      sku: 'SSKU-1',
      orderMechanism: 'EMAIL',
      url: 'https://supplier-b.com',
      orderQuantity: { amount: 5, unit: 'box' },
      unitCost: { value: 4.5, currency: 'USD' },
      orderCost: { value: 22.5, currency: 'USD' },
    },
    defaultSupply: 'Supplier A',
    cardSize: 'LARGE',
    labelSize: 'MEDIUM',
    breadcrumbSize: 'LARGE',
    color: 'BLUE',
  };
}

describe('mapItemToArdaUpdateRequest', () => {
  it('always includes all top-level API fields in payload', () => {
    const item = fullItemFromEditForm();
    const payload = mapItemToArdaUpdateRequest(item);
    for (const key of API_TOP_LEVEL_KEYS) {
      expect(payload).toHaveProperty(key);
    }
  });

  it('always sends locator with facility, department, location, subLocation', () => {
    const payload = mapItemToArdaUpdateRequest({ name: 'X' });
    expect(payload.locator).toBeDefined();
    for (const k of LOCATOR_KEYS) {
      expect(payload.locator).toHaveProperty(k);
    }
    expect(payload.locator?.facility).toBe('');
    const withLocator = mapItemToArdaUpdateRequest({
      name: 'Y',
      locator: { facility: 'F', department: 'D', location: 'L', subLocation: 'SL' },
    });
    expect(withLocator.locator?.facility).toBe('F');
    expect(withLocator.locator?.department).toBe('D');
    expect(withLocator.locator?.location).toBe('L');
    expect(withLocator.locator?.subLocation).toBe('SL');
  });

  it('sends primarySupply when item has primarySupply with only supplier (no supplyEId) - old items', () => {
    const item: Partial<items.Item> = {
      name: 'Item',
      primarySupply: { supplier: 'Only Supplier', orderCost: defaultOrderCost },
    };
    const payload = mapItemToArdaUpdateRequest(item);
    expect(payload.primarySupply).toBeDefined();
    expect(payload.primarySupply?.supplier).toBe('Only Supplier');
    expect(payload.primarySupply?.supplyEId).toBeUndefined();
  });

  it('sends primarySupply with supplyEId when item has it', () => {
    const item: Partial<items.Item> = {
      name: 'Item',
      primarySupply: { supplyEId: 'eid-123', supplier: 'S', orderCost: defaultOrderCost },
    };
    const payload = mapItemToArdaUpdateRequest(item);
    expect(payload.primarySupply?.supplyEId).toBe('eid-123');
    expect(payload.primarySupply?.supplier).toBe('S');
  });

  it('sends full primarySupply with all sub-fields when item has them', () => {
    const item = fullItemFromEditForm();
    const payload = mapItemToArdaUpdateRequest(item);
    expect(payload.primarySupply).toBeDefined();
    for (const key of SUPPLY_KEYS) {
      if (key === 'supplyEId') continue;
      expect(payload.primarySupply).toHaveProperty(key);
    }
    expect(payload.primarySupply?.supplyEId).toBe('supply-eid-1');
    expect(payload.primarySupply?.supplier).toBe('Supplier A');
    expect(payload.primarySupply?.sku).toBe('PSKU-1');
    expect(payload.primarySupply?.orderMethod).toBe('ONLINE');
    expect(payload.primarySupply?.url).toBe('https://supplier-a.com');
    expect(payload.primarySupply?.minimumQuantity).toEqual({ amount: 1, unit: 'each' });
    expect(payload.primarySupply?.orderQuantity).toEqual({ amount: 10, unit: 'each' });
    expect(payload.primarySupply?.unitCost).toEqual({ value: 5.99, currency: 'USD' });
    expect(payload.primarySupply?.averageLeadTime).toEqual({ length: 2, unit: 'DAY' });
  });

  it('sends full secondarySupply when item has secondarySupply (with or without supplyEId)', () => {
    const item = fullItemFromEditForm();
    const payload = mapItemToArdaUpdateRequest(item);
    expect(payload.secondarySupply).toBeDefined();
    expect(payload.secondarySupply?.supplier).toBe('Supplier B');
    expect(payload.secondarySupply?.supplyEId).toBe('supply-eid-2');
    expect(payload.secondarySupply?.sku).toBe('SSKU-1');
    expect(payload.secondarySupply?.orderMethod).toBe('EMAIL');
  });

  it('sends secondarySupply without supplyEId for old items', () => {
    const item: Partial<items.Item> = {
      name: 'Item',
      secondarySupply: { supplier: 'Old Supplier', orderCost: defaultOrderCost },
    };
    const payload = mapItemToArdaUpdateRequest(item);
    expect(payload.secondarySupply).toBeDefined();
    expect(payload.secondarySupply?.supplier).toBe('Old Supplier');
    expect(payload.secondarySupply?.supplyEId).toBeUndefined();
  });

  it('omits primarySupply when item has no primarySupply', () => {
    const payload = mapItemToArdaUpdateRequest({ name: 'No supply' });
    expect(payload.primarySupply).toBeUndefined();
  });

  it('omits secondarySupply when item has no secondarySupply', () => {
    const payload = mapItemToArdaUpdateRequest({
      name: 'X',
      primarySupply: { supplier: 'A', orderCost: defaultOrderCost },
    });
    expect(payload.secondarySupply).toBeUndefined();
  });

  it('converts empty string optional fields to undefined', () => {
    const item: Partial<items.Item> = {
      name: 'Item',
      internalSKU: '',
      generalLedgerCode: '  ',
      useCase: '',
      notes: '',
      cardNotesDefault: '',
      locator: { facility: '', department: '', location: '', subLocation: '' },
    };
    const payload = mapItemToArdaUpdateRequest(item);
    expect(payload.internalSKU).toBeUndefined();
    expect(payload.generalLedgerCode).toBeUndefined();
    expect(payload.useCase).toBeUndefined();
    expect(payload.notes).toBeUndefined();
    expect(payload.cardNotesDefault).toBeUndefined();
    expect(payload.locator?.facility).toBe('');
    expect(payload.locator?.department).toBeUndefined();
    expect(payload.locator?.location).toBeUndefined();
    expect(payload.locator?.subLocation).toBeUndefined();
  });

  it('sends full item from edit form as API expects', () => {
    const item = fullItemFromEditForm();
    const payload = mapItemToArdaUpdateRequest(item);
    expect(payload.name).toBe('Test Item');
    expect(payload.imageUrl).toBe('https://example.com/img.png');
    expect(payload.classification).toEqual({ type: 'Type A', subType: 'SubType 1' });
    expect(payload.useCase).toBe('Lab');
    expect(payload.internalSKU).toBe('SKU-001');
    expect(payload.generalLedgerCode).toBe('GL-001');
    expect(payload.minQuantity).toEqual({ amount: 2, unit: 'each' });
    expect(payload.notes).toBe('Some notes');
    expect(payload.cardNotesDefault).toBe('Card notes');
    expect(payload.taxable).toBe(true);
    expect(payload.defaultSupply).toBe('Supplier A');
    expect(payload.cardSize).toBe('LARGE');
    expect(payload.labelSize).toBe('MEDIUM');
    expect(payload.breadcrumbSize).toBe('LARGE');
    expect(payload.itemColor).toBe('BLUE');
  });

  it('payload shape satisfies ArdaCreateItemRequest', () => {
    const item = fullItemFromEditForm();
    const payload = mapItemToArdaUpdateRequest(item);
    const _typed: ArdaCreateItemRequest = payload;
    expect(_typed.name).toBeDefined();
    expect(typeof _typed.name).toBe('string');
    if (payload.primarySupply) {
      expect(typeof payload.primarySupply.supplier).toBe('string');
    }
    if (payload.locator) {
      expect(typeof payload.locator.facility).toBe('string');
    }
  });

  it('keeps name required and non-empty default', () => {
    expect(mapItemToArdaUpdateRequest({}).name).toBe('');
    expect(mapItemToArdaUpdateRequest({ name: 'A' }).name).toBe('A');
  });

  it('keeps taxable default true', () => {
    expect(mapItemToArdaUpdateRequest({ name: 'X' }).taxable).toBe(true);
    expect(mapItemToArdaUpdateRequest({ name: 'X', taxable: false }).taxable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Helpers for building ArdaItem / ArdaDraftItem test fixtures
// ---------------------------------------------------------------------------

function makeArdaItem(overrides: Partial<ArdaItemPayload> = {}): ArdaItem {
  return {
    rId: 'rId-001',
    asOf: { effective: 1000, recorded: 2000 },
    payload: {
      type: 'ITEM',
      eId: 'eid-001',
      name: 'Test Item',
      ...overrides,
    },
    metadata: { tenantId: 'tenant-001' },
    author: 'user@test.com',
    retired: false,
  };
}

function makeArdaDraftItem(overrides: Partial<ArdaItemPayload> = {}, entityId = 'draft-eid-001'): ArdaDraftItem {
  return {
    author: 'user@test.com',
    entityId,
    metadata: { tenantId: 'tenant-001' },
    tenantId: 'tenant-001',
    value: {
      type: 'ITEM',
      eId: 'payload-eid-001',
      name: 'Draft Item',
      ...overrides,
    },
  };
}

// ---------------------------------------------------------------------------
// Task 1.2.1: mapArdaItemToItem — item mapping (tests 1–13)
// ---------------------------------------------------------------------------

describe('mapArdaItemToItem', () => {
  // Test 1: Maps regular ArdaItem with all entity fields
  it('maps regular ArdaItem entity fields: entityId, recordId, author, timeCoordinates', () => {
    const ardaItem = makeArdaItem();
    const result = mapArdaItemToItem(ardaItem);
    expect(result.entityId).toBe('eid-001');
    expect(result.recordId).toBe('rId-001');
    expect(result.author).toBe('user@test.com');
    expect(result.timeCoordinates.effectiveAsOf).toBe(1000);
    expect(result.timeCoordinates.recordedAsOf).toBe(2000);
  });

  // Test 2: Maps draft item using `value` instead of `payload`, uses payload.eId when available
  it('maps draft item using value field and uses payload.eId as entityId when present', () => {
    const draft = makeArdaDraftItem({ eId: 'payload-eid-001' }, 'draft-entity-id');
    const result = mapArdaItemToItem(draft);
    expect(result.entityId).toBe('payload-eid-001');
    expect(result.name).toBe('Draft Item');
  });

  // Test 3: Falls back to ardaItem.entityId for drafts when payload.eId missing
  it('falls back to ardaItem.entityId for drafts when payload.eId missing', () => {
    const draft: ArdaDraftItem = {
      author: 'user@test.com',
      entityId: 'fallback-entity-id',
      metadata: { tenantId: 'tenant-001' },
      tenantId: 'tenant-001',
      value: {
        type: 'ITEM',
        eId: '', // empty, falsy
        name: 'Draft No EId',
      },
    };
    const result = mapArdaItemToItem(draft);
    expect(result.entityId).toBe('fallback-entity-id');
  });

  // Test 4: Maps classification (type, subType) when present
  it('maps classification type and subType when present', () => {
    const ardaItem = makeArdaItem({ classification: { type: 'Chemical', subType: 'Reagent' } });
    const result = mapArdaItemToItem(ardaItem);
    expect(result.classification).toEqual({ type: 'Chemical', subType: 'Reagent' });
  });

  // Test 5: Returns undefined classification when not present
  it('returns undefined classification when not present', () => {
    const ardaItem = makeArdaItem();
    const result = mapArdaItemToItem(ardaItem);
    expect(result.classification).toBeUndefined();
  });

  // Test 6: Maps locator (facility, dept, location, subLocation) when present
  it('maps locator fields when present', () => {
    const ardaItem = makeArdaItem({
      locator: { facility: 'F1', department: 'D1', location: 'L1', subLocation: 'SL1' },
    });
    const result = mapArdaItemToItem(ardaItem);
    expect(result.locator).toEqual({ facility: 'F1', department: 'D1', location: 'L1', subLocation: 'SL1' });
  });

  // Test 7: Returns undefined locator when not present
  it('returns undefined locator when not present', () => {
    const ardaItem = makeArdaItem();
    const result = mapArdaItemToItem(ardaItem);
    expect(result.locator).toBeUndefined();
  });

  // Test 8: Maps primarySupply correctly (unitCost, orderQuantity, minimumQuantity, averageLeadTime)
  it('maps primarySupply correctly with all sub-fields', () => {
    const ardaItem = makeArdaItem({
      primarySupply: {
        supplyEId: 'supply-eid-1',
        supplier: 'Acme Corp',
        name: 'Primary',
        sku: 'SKU-1',
        orderMethod: 'PURCHASE_ORDER',
        url: 'https://acme.com',
        unitCost: { value: 10.5, currency: 'USD' },
        orderQuantity: { amount: 5, unit: 'box' },
        minimumQuantity: { amount: 1, unit: 'each' },
        averageLeadTime: { length: 3, unit: 'DAY' },
      },
    });
    const result = mapArdaItemToItem(ardaItem);
    expect(result.primarySupply).toBeDefined();
    expect(result.primarySupply?.supplyEId).toBe('supply-eid-1');
    expect(result.primarySupply?.supplier).toBe('Acme Corp');
    expect(result.primarySupply?.unitCost).toEqual({ value: 10.5, currency: 'USD' });
    expect(result.primarySupply?.orderQuantity).toEqual({ amount: 5, unit: 'box' });
    expect(result.primarySupply?.minimumQuantity).toEqual({ amount: 1, unit: 'each' });
    expect(result.primarySupply?.averageLeadTime).toEqual({ length: 3, unit: 'DAY' });
  });

  // Test 9: Returns undefined primarySupply when not present
  it('returns undefined primarySupply when not present in payload', () => {
    const ardaItem = makeArdaItem();
    const result = mapArdaItemToItem(ardaItem);
    expect(result.primarySupply).toBeUndefined();
  });

  // Test 10: Maps secondarySupply correctly
  it('maps secondarySupply correctly', () => {
    const ardaItem = makeArdaItem({
      secondarySupply: {
        supplier: 'Beta LLC',
        orderMethod: 'EMAIL',
        unitCost: { value: 8.0, currency: 'EUR' },
        orderQuantity: { amount: 2, unit: 'case' },
        minimumQuantity: { amount: 1, unit: 'each' },
        averageLeadTime: { length: 7, unit: 'DAY' },
      },
    });
    const result = mapArdaItemToItem(ardaItem);
    expect(result.secondarySupply).toBeDefined();
    expect(result.secondarySupply?.supplier).toBe('Beta LLC');
    expect(result.secondarySupply?.unitCost).toEqual({ value: 8.0, currency: 'EUR' });
  });

  // Test 11: Uses unitCost as orderCost (per "for now" comment)
  it('uses unitCost as orderCost in mapped supply', () => {
    const ardaItem = makeArdaItem({
      primarySupply: {
        supplier: 'Acme',
        unitCost: { value: 25.0, currency: 'USD' },
        orderQuantity: { amount: 3, unit: 'each' },
        minimumQuantity: { amount: 1, unit: 'each' },
        averageLeadTime: { length: 1, unit: 'DAY' },
      },
    });
    const result = mapArdaItemToItem(ardaItem);
    expect(result.primarySupply?.orderCost).toEqual({ value: 25.0, currency: 'USD' });
    expect(result.primarySupply?.orderCost).toEqual(result.primarySupply?.unitCost);
  });

  // Test 12: Falls back to `sku` field from payload when `internalSKU` not present
  it('falls back to sku field when internalSKU not present', () => {
    const ardaItem: ArdaItem = {
      rId: 'rId-sku',
      asOf: { effective: 100, recorded: 200 },
      payload: {
        type: 'ITEM',
        eId: 'eid-sku',
        name: 'SKU Fallback Item',
        // internalSKU not set; inject sku via unknown cast to simulate legacy data
      } as unknown as ArdaItemPayload & { sku?: string },
      metadata: { tenantId: 'tenant-001' },
      author: 'user@test.com',
      retired: false,
    };
    // Inject legacy `sku` field directly
    (ardaItem.payload as unknown as Record<string, unknown>).sku = 'LEGACY-SKU';
    const result = mapArdaItemToItem(ardaItem);
    expect(result.internalSKU).toBe('LEGACY-SKU');
  });

  // Test 13: Maps minQuantity when present, undefined when absent
  it('maps minQuantity when present and returns undefined when absent', () => {
    const withMin = makeArdaItem({ minQuantity: { amount: 5, unit: 'box' } });
    expect(mapArdaItemToItem(withMin).minQuantity).toEqual({ amount: 5, unit: 'box' });

    const withoutMin = makeArdaItem();
    expect(mapArdaItemToItem(withoutMin).minQuantity).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Task 1.2.2: Enum Mappings (tests 14–33) — tested through mapArdaItemToItem
// ---------------------------------------------------------------------------

describe('mapArdaItemToItem — enum mappings', () => {
  function ardaItemWithOrderMethod(orderMethod: string | undefined): ArdaItem {
    return makeArdaItem({
      primarySupply: {
        supplier: 'S',
        ...(orderMethod !== undefined && { orderMethod }),
        orderQuantity: { amount: 1, unit: 'each' },
        minimumQuantity: { amount: 1, unit: 'each' },
        averageLeadTime: { length: 1, unit: 'DAY' },
      },
    });
  }

  // Tests 14–18: Order method mapping
  it('maps each known orderMethod correctly', () => {
    const knownMethods: Array<[string, items.OrderMechanism]> = [
      ['PURCHASE_ORDER', 'PURCHASE_ORDER'],
      ['EMAIL', 'EMAIL'],
      ['PHONE', 'PHONE'],
      ['IN_STORE', 'IN_STORE'],
      ['ONLINE', 'ONLINE'],
      ['RFQ', 'RFQ'],
      ['PRODUCTION', 'PRODUCTION'],
      ['THIRD_PARTY', 'THIRD_PARTY'],
    ];
    for (const [input, expected] of knownMethods) {
      const result = mapArdaItemToItem(ardaItemWithOrderMethod(input));
      expect(result.primarySupply?.orderMechanism).toBe(expected);
    }
  });

  it('maps unknown orderMethod to OTHER', () => {
    const result = mapArdaItemToItem(ardaItemWithOrderMethod('CARRIER_PIGEON'));
    expect(result.primarySupply?.orderMechanism).toBe('OTHER');
  });

  it('maps undefined orderMethod to OTHER', () => {
    const result = mapArdaItemToItem(ardaItemWithOrderMethod(undefined));
    expect(result.primarySupply?.orderMechanism).toBe('OTHER');
  });

  // Tests 19–21: Currency mapping
  function ardaItemWithCurrency(currency: string | undefined): ArdaItem {
    return makeArdaItem({
      primarySupply: {
        supplier: 'S',
        orderMethod: 'ONLINE',
        ...(currency !== undefined && { unitCost: { value: 1, currency } }),
        orderQuantity: { amount: 1, unit: 'each' },
        minimumQuantity: { amount: 1, unit: 'each' },
        averageLeadTime: { length: 1, unit: 'DAY' },
      },
    });
  }

  it('maps each known currency to itself', () => {
    const knownCurrencies: domain.Currency[] = ['USD', 'CAD', 'EUR', 'GBP', 'JPY', 'AUD', 'CNY', 'CHF'];
    for (const currency of knownCurrencies) {
      const result = mapArdaItemToItem(ardaItemWithCurrency(currency));
      expect(result.primarySupply?.unitCost?.currency).toBe(currency);
    }
  });

  it('maps unknown currency to defaultCurrency (USD)', () => {
    const result = mapArdaItemToItem(ardaItemWithCurrency('XYZ'));
    expect(result.primarySupply?.unitCost?.currency).toBe(domain.defaultCurrency);
  });

  it('maps omitted unitCost to defaultMoney with defaultCurrency', () => {
    // unitCost intentionally not included in primarySupply
    const ardaItem = makeArdaItem({
      primarySupply: {
        supplier: 'S',
        orderMethod: 'ONLINE',
        orderQuantity: { amount: 1, unit: 'each' },
        minimumQuantity: { amount: 1, unit: 'each' },
        averageLeadTime: { length: 1, unit: 'DAY' },
      },
    });
    const result = mapArdaItemToItem(ardaItem);
    expect(result.primarySupply?.unitCost?.currency).toBe(domain.defaultCurrency);
  });

  // Tests 22–24: Time unit mapping
  function ardaItemWithTimeUnit(unit: string | undefined): ArdaItem {
    return makeArdaItem({
      primarySupply: {
        supplier: 'S',
        orderMethod: 'ONLINE',
        orderQuantity: { amount: 1, unit: 'each' },
        minimumQuantity: { amount: 1, unit: 'each' },
        ...(unit !== undefined && { averageLeadTime: { length: 5, unit } }),
      },
    });
  }

  it('maps each known time unit correctly, case-insensitive', () => {
    const knownUnits: Array<[string, general.TimeUnit]> = [
      ['SECOND', 'SECOND'],
      ['second', 'SECOND'],
      ['MINUTE', 'MINUTE'],
      ['minute', 'MINUTE'],
      ['HOUR', 'HOUR'],
      ['hour', 'HOUR'],
      ['DAY', 'DAY'],
      ['day', 'DAY'],
      ['WEEK', 'WEEK'],
      ['week', 'WEEK'],
    ];
    for (const [input, expected] of knownUnits) {
      const result = mapArdaItemToItem(ardaItemWithTimeUnit(input));
      expect(result.primarySupply?.averageLeadTime?.unit).toBe(expected);
    }
  });

  it('maps unknown time unit to defaultTimeUnit', () => {
    const result = mapArdaItemToItem(ardaItemWithTimeUnit('FORTNIGHT'));
    expect(result.primarySupply?.averageLeadTime?.unit).toBe(general.defaultTimeUnit);
  });

  it('maps undefined averageLeadTime to defaultDuration', () => {
    const result = mapArdaItemToItem(ardaItemWithTimeUnit(undefined));
    expect(result.primarySupply?.averageLeadTime?.unit).toBe(general.defaultTimeUnit);
  });

  // Tests 25–28: Card size mapping
  it('maps SMALL, MEDIUM, LARGE card sizes correctly', () => {
    for (const size of ['SMALL', 'MEDIUM', 'LARGE'] as const) {
      const result = mapArdaItemToItem(makeArdaItem({ cardSize: size }));
      expect(result.cardSize).toBe(size);
    }
  });

  it('maps both EXTRA_LARGE and X_LARGE to X_LARGE for cardSize', () => {
    expect(mapArdaItemToItem(makeArdaItem({ cardSize: 'EXTRA_LARGE' })).cardSize).toBe('X_LARGE');
    expect(mapArdaItemToItem(makeArdaItem({ cardSize: 'X_LARGE' })).cardSize).toBe('X_LARGE');
  });

  it('maps unknown cardSize to defaultCardSize', () => {
    expect(mapArdaItemToItem(makeArdaItem({ cardSize: 'GINORMOUS' })).cardSize).toBe(items.defaultCardSize);
    expect(mapArdaItemToItem(makeArdaItem()).cardSize).toBe(items.defaultCardSize);
  });

  it('card size mapping is case-insensitive', () => {
    expect(mapArdaItemToItem(makeArdaItem({ cardSize: 'small' })).cardSize).toBe('SMALL');
    expect(mapArdaItemToItem(makeArdaItem({ cardSize: 'large' })).cardSize).toBe('LARGE');
  });

  // Tests 29–30: Label size and breadcrumb size mirror card size behavior
  it('label size maps SMALL/MEDIUM/LARGE/X_LARGE and defaults correctly', () => {
    expect(mapArdaItemToItem(makeArdaItem({ labelSize: 'SMALL' })).labelSize).toBe('SMALL');
    expect(mapArdaItemToItem(makeArdaItem({ labelSize: 'medium' })).labelSize).toBe('MEDIUM');
    expect(mapArdaItemToItem(makeArdaItem({ labelSize: 'EXTRA_LARGE' })).labelSize).toBe('X_LARGE');
    expect(mapArdaItemToItem(makeArdaItem({ labelSize: 'X_LARGE' })).labelSize).toBe('X_LARGE');
    expect(mapArdaItemToItem(makeArdaItem({ labelSize: 'UNKNOWN' })).labelSize).toBe(items.defaultLabelSize);
    expect(mapArdaItemToItem(makeArdaItem()).labelSize).toBe(items.defaultLabelSize);
  });

  it('breadcrumb size maps SMALL/MEDIUM/LARGE/X_LARGE and defaults correctly', () => {
    expect(mapArdaItemToItem(makeArdaItem({ breadcrumbSize: 'LARGE' })).breadcrumbSize).toBe('LARGE');
    expect(mapArdaItemToItem(makeArdaItem({ breadcrumbSize: 'extra_large' })).breadcrumbSize).toBe('X_LARGE');
    expect(mapArdaItemToItem(makeArdaItem({ breadcrumbSize: 'UNKNOWN' })).breadcrumbSize).toBe(items.defaultBreadcrumbSize);
    expect(mapArdaItemToItem(makeArdaItem()).breadcrumbSize).toBe(items.defaultBreadcrumbSize);
  });

  // Tests 31–33: Color mapping
  it('maps each known color correctly, case-insensitive', () => {
    const knownColors = ['RED', 'GREEN', 'BLUE', 'YELLOW', 'BLACK', 'WHITE', 'GRAY', 'ORANGE', 'PURPLE', 'PINK'] as const;
    for (const color of knownColors) {
      expect(mapArdaItemToItem(makeArdaItem({ itemColor: color })).color).toBe(color);
      expect(mapArdaItemToItem(makeArdaItem({ itemColor: color.toLowerCase() })).color).toBe(color);
    }
  });

  it('maps unknown color to defaultItemColor', () => {
    expect(mapArdaItemToItem(makeArdaItem({ itemColor: 'MAGENTA' })).color).toBe(items.defaultItemColor);
  });

  it('maps undefined itemColor to defaultItemColor', () => {
    expect(mapArdaItemToItem(makeArdaItem()).color).toBe(items.defaultItemColor);
  });
});

// ---------------------------------------------------------------------------
// Task 1.2.3: mapItemToArdaCreateRequest (tests 34–47)
// ---------------------------------------------------------------------------

describe('mapItemToArdaCreateRequest', () => {
  // Test 34: Maps name, defaults to "" when absent
  it('maps name and defaults to empty string when absent', () => {
    expect(mapItemToArdaCreateRequest({ name: 'My Item' }).name).toBe('My Item');
    expect(mapItemToArdaCreateRequest({}).name).toBe('');
  });

  // Test 35: Includes imageUrl when non-empty, excludes when empty/whitespace
  it('includes imageUrl when non-empty, excludes when empty or whitespace-only', () => {
    expect(mapItemToArdaCreateRequest({ imageUrl: 'https://img.com/pic.jpg' }).imageUrl).toBe('https://img.com/pic.jpg');
    expect(mapItemToArdaCreateRequest({ imageUrl: '' }).imageUrl).toBeUndefined();
    expect(mapItemToArdaCreateRequest({ imageUrl: '   ' }).imageUrl).toBeUndefined();
    expect(mapItemToArdaCreateRequest({}).imageUrl).toBeUndefined();
  });

  // Test 36: Maps classification when present, omits when absent
  it('maps classification when present and omits when absent', () => {
    const withClass = mapItemToArdaCreateRequest({
      classification: { type: 'Chemical', subType: 'Reagent' },
    });
    expect(withClass.classification).toEqual({ type: 'Chemical', subType: 'Reagent' });
    expect(mapItemToArdaCreateRequest({}).classification).toBeUndefined();
  });

  // Test 37: Maps locator with 4 sub-fields, defaults to "" when missing
  it('maps locator sub-fields and defaults to empty string when missing', () => {
    const withLocator = mapItemToArdaCreateRequest({
      locator: { facility: 'F1', department: 'D1', location: 'L1', subLocation: 'SL1' },
    });
    expect(withLocator.locator).toEqual({ facility: 'F1', department: 'D1', location: 'L1', subLocation: 'SL1' });

    const withoutLocator = mapItemToArdaCreateRequest({});
    expect(withoutLocator.locator?.facility).toBe('');
    expect(withoutLocator.locator?.department).toBe('');
    expect(withoutLocator.locator?.location).toBe('');
    expect(withoutLocator.locator?.subLocation).toBe('');
  });

  // Test 38: Defaults taxable to true
  it('defaults taxable to true when not specified', () => {
    expect(mapItemToArdaCreateRequest({}).taxable).toBe(true);
    expect(mapItemToArdaCreateRequest({ taxable: false }).taxable).toBe(false);
    expect(mapItemToArdaCreateRequest({ taxable: true }).taxable).toBe(true);
  });

  // Test 39: Maps primarySupply when supplier non-empty
  it('maps primarySupply with all sub-fields when supplier is non-empty', () => {
    const result = mapItemToArdaCreateRequest({
      primarySupply: {
        supplier: 'Acme',
        name: 'Primary',
        sku: 'SKU-1',
        orderMechanism: 'PURCHASE_ORDER',
        url: 'https://acme.com',
        minimumQuantity: { amount: 1, unit: 'each' },
        orderQuantity: { amount: 5, unit: 'box' },
        unitCost: { value: 10.0, currency: 'USD' },
        averageLeadTime: { length: 3, unit: 'DAY' },
        orderCost: { value: 50.0, currency: 'USD' },
      },
    });
    expect(result.primarySupply).toBeDefined();
    expect(result.primarySupply?.supplier).toBe('Acme');
    expect(result.primarySupply?.sku).toBe('SKU-1');
    expect(result.primarySupply?.orderMethod).toBe('PURCHASE_ORDER');
    expect(result.primarySupply?.minimumQuantity).toEqual({ amount: 1, unit: 'each' });
    expect(result.primarySupply?.orderQuantity).toEqual({ amount: 5, unit: 'box' });
    expect(result.primarySupply?.unitCost).toEqual({ value: 10.0, currency: 'USD' });
    expect(result.primarySupply?.averageLeadTime).toEqual({ length: 3, unit: 'DAY' });
  });

  // Test 40: Omits primarySupply when supplier empty and no orderMechanism
  it('omits primarySupply when supplier is empty and orderMechanism is absent', () => {
    expect(mapItemToArdaCreateRequest({
      primarySupply: { supplier: '', orderCost: { value: 0, currency: 'USD' } },
    }).primarySupply).toBeUndefined();

    expect(mapItemToArdaCreateRequest({}).primarySupply).toBeUndefined();
  });

  // Test 41: Prepends "https://" to supply URL without "http" prefix
  it('prepends https:// to supply URL that does not start with http', () => {
    const result = mapItemToArdaCreateRequest({
      primarySupply: {
        supplier: 'Acme',
        url: 'acme.com/products',
        orderCost: { value: 0, currency: 'USD' },
      },
    });
    expect(result.primarySupply?.url).toBe('https://acme.com/products');
  });

  // Test 42: Preserves URL when already starts with "http"/"https"
  it('preserves URL when it already starts with http or https', () => {
    const httpsResult = mapItemToArdaCreateRequest({
      primarySupply: { supplier: 'S', url: 'https://supplier.com', orderCost: { value: 0, currency: 'USD' } },
    });
    expect(httpsResult.primarySupply?.url).toBe('https://supplier.com');

    const httpResult = mapItemToArdaCreateRequest({
      primarySupply: { supplier: 'S', url: 'http://supplier.com', orderCost: { value: 0, currency: 'USD' } },
    });
    expect(httpResult.primarySupply?.url).toBe('http://supplier.com');
  });

  // Test 43: Omits supply URL when empty/whitespace
  it('omits supply URL when empty or whitespace', () => {
    const emptyUrl = mapItemToArdaCreateRequest({
      primarySupply: { supplier: 'S', url: '', orderCost: { value: 0, currency: 'USD' } },
    });
    expect(emptyUrl.primarySupply?.url).toBeUndefined();

    const whitespaceUrl = mapItemToArdaCreateRequest({
      primarySupply: { supplier: 'S', url: '   ', orderCost: { value: 0, currency: 'USD' } },
    });
    expect(whitespaceUrl.primarySupply?.url).toBeUndefined();
  });

  // Test 44: Maps secondarySupply same rules as primary
  it('maps secondarySupply with same rules as primarySupply', () => {
    const result = mapItemToArdaCreateRequest({
      secondarySupply: {
        supplier: 'Beta',
        url: 'beta.com',
        orderMechanism: 'EMAIL',
        orderCost: { value: 0, currency: 'USD' },
      },
    });
    expect(result.secondarySupply?.supplier).toBe('Beta');
    expect(result.secondarySupply?.url).toBe('https://beta.com');
    expect(result.secondarySupply?.orderMethod).toBe('EMAIL');

    // Omitted when supplier empty
    expect(mapItemToArdaCreateRequest({
      secondarySupply: { supplier: '', orderCost: { value: 0, currency: 'USD' } },
    }).secondarySupply).toBeUndefined();
  });

  // Test 45: Maps defaultSupply, cardSize, labelSize, breadcrumbSize, itemColor
  it('maps defaultSupply, cardSize, labelSize, breadcrumbSize, itemColor', () => {
    const result = mapItemToArdaCreateRequest({
      defaultSupply: 'Acme',
      cardSize: 'LARGE',
      labelSize: 'SMALL',
      breadcrumbSize: 'MEDIUM',
      color: 'BLUE',
    });
    expect(result.defaultSupply).toBe('Acme');
    expect(result.cardSize).toBe('LARGE');
    expect(result.labelSize).toBe('SMALL');
    expect(result.breadcrumbSize).toBe('MEDIUM');
    expect(result.itemColor).toBe('BLUE');
  });

  // Test 46: Defaults supply name to "Primary"/"Secondary"
  it('defaults supply name to Primary for primarySupply and Secondary for secondarySupply', () => {
    const result = mapItemToArdaCreateRequest({
      primarySupply: { supplier: 'S1', orderCost: { value: 0, currency: 'USD' } },
      secondarySupply: { supplier: 'S2', orderCost: { value: 0, currency: 'USD' } },
    });
    expect(result.primarySupply?.name).toBe('Primary');
    expect(result.secondarySupply?.name).toBe('Secondary');
  });

  // Test 47: Defaults supply orderMethod to "ONLINE" when orderMechanism undefined
  it('defaults supply orderMethod to ONLINE when orderMechanism is undefined', () => {
    const result = mapItemToArdaCreateRequest({
      primarySupply: { supplier: 'S', orderCost: { value: 0, currency: 'USD' } },
    });
    expect(result.primarySupply?.orderMethod).toBe('ONLINE');
  });

  // mapItemToArdaCreateRequest does NOT include supplyEId (generated by backend on create)
  it('does not include supplyEId in create request primarySupply', () => {
    const result = mapItemToArdaCreateRequest({
      primarySupply: {
        supplyEId: 'should-not-appear',
        supplier: 'S',
        orderCost: { value: 0, currency: 'USD' },
      },
    });
    expect(result.primarySupply?.supplyEId).toBeUndefined();
  });
});
