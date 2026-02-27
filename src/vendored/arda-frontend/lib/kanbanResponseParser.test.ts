import { extractKanbanRecords } from './kanbanResponseParser';
import type { KanbanCardResult } from '@frontend/types/kanban';

const mockRecord: KanbanCardResult = {
  rId: 'r-1',
  asOf: { effective: 1000, recorded: 1000 },
  payload: {
    eId: 'card-1',
    rId: 'r-1',
    lookupUrlId: 'url-1',
    serialNumber: 'SN-001',
    item: { type: 'ITEM', eId: 'item-1', name: 'Widget' },
    itemDetails: {
      eId: 'item-1',
      name: 'Widget',
      imageUrl: '',
      classification: { type: 'T', subType: 'ST' },
      useCase: 'Lab',
      locator: { facility: 'F', department: 'D', location: 'L' },
      internalSKU: 'SKU',
      notes: '',
      cardNotesDefault: '',
      taxable: false,
      primarySupply: {
        supplier: 'Supplier',
        sku: 'SKU',
        orderMethod: 'PURCHASE_ORDER',
        url: '',
        orderQuantity: { amount: 1, unit: 'each' },
        unitCost: { value: 0, currency: 'USD' },
        averageLeadTime: { length: 1, unit: 'days' },
      },
      defaultSupply: 'primary',
      cardSize: 'SMALL',
      labelSize: 'SMALL',
      breadcrumbSize: 'SMALL',
      itemColor: '#fff',
    },
    cardQuantity: { amount: 5, unit: 'each' },
    lastEvent: { when: { effective: 1000, recorded: 1000 }, type: 'USE', author: 'user' },
    status: 'AVAILABLE',
    printStatus: 'PRINTED',
  },
  metadata: { tenantId: 'tenant-1' },
  author: 'user-1',
  retired: false,
};

describe('extractKanbanRecords', () => {
  describe('Format 1: data.data.records', () => {
    it('returns the records array', () => {
      const response = { ok: true, data: { records: [mockRecord] } };
      const result = extractKanbanRecords(response);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockRecord);
    });
  });

  describe('Format 2: data.data.data.records (nested)', () => {
    it('returns the nested records array', () => {
      const response = { ok: true, data: { data: { records: [mockRecord] } } };
      const result = extractKanbanRecords(response);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockRecord);
    });
  });

  describe('Format 3: data.data is a direct array', () => {
    it('returns the direct data array', () => {
      const response = { ok: true, data: [mockRecord] };
      const result = extractKanbanRecords(response);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockRecord);
    });
  });

  describe('Format 4: data.data.results', () => {
    it('returns the results array', () => {
      const response = { ok: true, data: { results: [mockRecord] } };
      const result = extractKanbanRecords(response);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockRecord);
    });
  });

  describe('Format 5: data.results (top-level)', () => {
    it('returns the top-level results array', () => {
      const response = { ok: true, results: [mockRecord] };
      const result = extractKanbanRecords(response);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockRecord);
    });
  });

  describe('edge cases', () => {
    it('returns empty array for null input', () => {
      expect(extractKanbanRecords(null)).toEqual([]);
    });

    it('returns empty array for undefined input', () => {
      expect(extractKanbanRecords(undefined)).toEqual([]);
    });

    it('returns empty array when data has no recognizable record field', () => {
      const response = { ok: true, data: { something: 'else' } };
      expect(extractKanbanRecords(response)).toEqual([]);
    });

    it('returns empty array when data is an empty object', () => {
      expect(extractKanbanRecords({})).toEqual([]);
    });

    it('returns multiple records correctly', () => {
      const second = { ...mockRecord, rId: 'r-2' };
      const response = { ok: true, data: { records: [mockRecord, second] } };
      const result = extractKanbanRecords(response);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when records field is not an array', () => {
      const response = { ok: true, data: { records: null } };
      expect(extractKanbanRecords(response)).toEqual([]);
    });
  });
});
