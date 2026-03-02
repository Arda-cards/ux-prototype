import { describe, it, expect } from 'vitest';

import type { Money } from '@/extras/types/model';

import {
  formatCurrency,
  formatDate,
  formatQuantity,
  EDITABLE_FIELDS,
  enhanceEditableColumnDefs,
  itemsColumnDefs,
  itemsDefaultColDef,
} from './items-column-presets';

describe('items-column-presets', () => {
  describe('formatCurrency', () => {
    it('formats money object to currency string', () => {
      const money: Money = { value: 123.45, currency: 'USD' };
      expect(formatCurrency(money)).toBe('$123.45 USD');
    });

    it('returns dash for undefined', () => {
      expect(formatCurrency(undefined)).toBe('-');
    });

    it('formats zero correctly', () => {
      const money: Money = { value: 0, currency: 'USD' };
      expect(formatCurrency(money)).toBe('$0.00 USD');
    });

    it('formats large numbers correctly', () => {
      const money: Money = { value: 1234567.89, currency: 'EUR' };
      expect(formatCurrency(money)).toBe('$1234567.89 EUR');
    });
  });

  describe('formatDate', () => {
    it('formats Unix timestamp to date string', () => {
      // Use noon UTC to avoid timezone date-shift issues
      const timestamp = new Date('2024-01-15T12:00:00Z').getTime();
      const result = formatDate(timestamp);
      expect(result).toMatch(/1\/15\/2024/);
    });

    it('returns dash for undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('formats epoch correctly', () => {
      const result = formatDate(0);
      // Epoch 0 is a valid timestamp — should return a date string, not '-'
      expect(result).toMatch(/12\/31\/1969|1\/1\/1970/);
    });
  });

  describe('formatQuantity', () => {
    it('formats quantity object to string', () => {
      const quantity = { amount: 100, unit: 'EACH' };
      expect(formatQuantity(quantity)).toBe('100 EACH');
    });

    it('returns dash for undefined', () => {
      expect(formatQuantity(undefined)).toBe('-');
    });

    it('formats zero amount correctly', () => {
      const quantity = { amount: 0, unit: 'BOX' };
      expect(formatQuantity(quantity)).toBe('0 BOX');
    });

    it('formats decimal amount correctly', () => {
      const quantity = { amount: 12.5, unit: 'KILOGRAM' };
      expect(formatQuantity(quantity)).toBe('12.5 KILOGRAM');
    });
  });

  describe('EDITABLE_FIELDS', () => {
    it('contains expected editable fields', () => {
      expect(EDITABLE_FIELDS.has('internalSKU')).toBe(true);
      expect(EDITABLE_FIELDS.has('name')).toBe(true);
      expect(EDITABLE_FIELDS.has('primarySupply.orderMechanism')).toBe(true);
      expect(EDITABLE_FIELDS.has('primarySupply.orderQuantity.unit')).toBe(true);
      expect(EDITABLE_FIELDS.has('cardSize')).toBe(true);
      expect(EDITABLE_FIELDS.has('labelSize')).toBe(true);
      expect(EDITABLE_FIELDS.has('breadcrumbSize')).toBe(true);
      expect(EDITABLE_FIELDS.has('color')).toBe(true);
    });

    it('does not contain non-editable fields', () => {
      expect(EDITABLE_FIELDS.has('entityId')).toBe(false);
      expect(EDITABLE_FIELDS.has('imageUrl')).toBe(false);
      expect(EDITABLE_FIELDS.has('notes')).toBe(false);
    });

    it('has expected size', () => {
      expect(EDITABLE_FIELDS.size).toBe(8);
    });
  });

  describe('enhanceEditableColumnDefs', () => {
    it('adds editable flag to editable columns', () => {
      const defs = [
        { field: 'internalSKU', headerName: 'SKU' },
        { field: 'name', headerName: 'Name' },
        { field: 'imageUrl', headerName: 'Image' },
      ];

      const enhanced = enhanceEditableColumnDefs(defs as any);

      expect(enhanced[0]!.editable).toBe(true);
      expect(enhanced[1]!.editable).toBe(true);
      expect(enhanced[2]!.editable).toBeUndefined();
    });

    it('preserves original column configuration', () => {
      const defs = [{ field: 'internalSKU', headerName: 'SKU', width: 140 }];

      const enhanced = enhanceEditableColumnDefs(defs as any);

      expect(enhanced[0]!.headerName).toBe('SKU');
      expect(enhanced[0]!.width).toBe(140);
    });

    it('adds valueGetter to editable columns', () => {
      const defs = [{ field: 'name', headerName: 'Name' }];

      const enhanced = enhanceEditableColumnDefs(defs as any);

      expect(typeof enhanced[0]!.valueGetter).toBe('function');
    });

    it('adds valueSetter to editable columns', () => {
      const defs = [{ field: 'name', headerName: 'Name' }];

      const enhanced = enhanceEditableColumnDefs(defs as any);

      expect(typeof enhanced[0]!.valueSetter).toBe('function');
    });

    it('respects enabled option', () => {
      const defs = [{ field: 'internalSKU', headerName: 'SKU' }];

      const enhanced = enhanceEditableColumnDefs(defs as any, { enabled: false });

      expect(enhanced[0]!.editable).toBeUndefined();
    });

    it('adds cellEditor for order mechanism field', () => {
      const defs = [
        {
          field: 'primarySupply.orderMechanism',
          colId: 'primarySupply.orderMechanism',
          headerName: 'Order Method',
        },
      ];

      const enhanced = enhanceEditableColumnDefs(defs as any);

      expect(enhanced[0]!.cellEditor).toBeDefined();
    });

    it('adds cellEditor for unit field', () => {
      const defs = [
        {
          field: 'primarySupply.orderQuantity.unit',
          colId: 'primarySupply.orderQuantity.unit',
          headerName: 'Order Unit',
        },
      ];

      const enhanced = enhanceEditableColumnDefs(defs as any);

      expect(enhanced[0]!.cellEditor).toBeDefined();
    });

    it('adds cellEditor for size fields', () => {
      const defs = [
        { field: 'cardSize', colId: 'cardSize', headerName: 'Card Size' },
        { field: 'labelSize', colId: 'labelSize', headerName: 'Label Size' },
        { field: 'breadcrumbSize', colId: 'breadcrumbSize', headerName: 'Breadcrumb Size' },
      ];

      const enhanced = enhanceEditableColumnDefs(defs as any);

      expect(enhanced[0]!.cellEditor).toBeDefined();
      expect(enhanced[1]!.cellEditor).toBeDefined();
      expect(enhanced[2]!.cellEditor).toBeDefined();
    });

    it('adds cellEditor for color field', () => {
      const defs = [{ field: 'color', colId: 'color', headerName: 'Color' }];

      const enhanced = enhanceEditableColumnDefs(defs as any);

      expect(enhanced[0]!.cellEditor).toBeDefined();
    });
  });

  describe('itemsColumnDefs', () => {
    it('has expected number of columns', () => {
      expect(itemsColumnDefs.length).toBeGreaterThan(25);
    });

    it('has select column first', () => {
      expect(itemsColumnDefs[0]!.colId).toBe('select');
    });

    it('has image column', () => {
      const imageCol = itemsColumnDefs.find((col) => col.field === 'imageUrl');
      expect(imageCol).toBeDefined();
    });

    it('has name column', () => {
      const nameCol = itemsColumnDefs.find((col) => col.field === 'name');
      expect(nameCol).toBeDefined();
      expect(nameCol?.headerName).toBe('Name');
    });

    it('has SKU column', () => {
      const skuCol = itemsColumnDefs.find((col) => col.field === 'internalSKU');
      expect(skuCol).toBeDefined();
      expect(skuCol?.headerName).toBe('SKU');
    });

    it('has classification columns', () => {
      const typeCol = itemsColumnDefs.find((col) => col.field === 'classification.type');
      const subTypeCol = itemsColumnDefs.find((col) => col.field === 'classification.subType');
      expect(typeCol).toBeDefined();
      expect(subTypeCol).toBeDefined();
    });

    it('has locator columns', () => {
      const facilityCol = itemsColumnDefs.find((col) => col.field === 'locator.facility');
      const deptCol = itemsColumnDefs.find((col) => col.field === 'locator.department');
      const locationCol = itemsColumnDefs.find((col) => col.field === 'locator.location');
      expect(facilityCol).toBeDefined();
      expect(deptCol).toBeDefined();
      expect(locationCol).toBeDefined();
    });

    it('has supply columns', () => {
      const supplierCol = itemsColumnDefs.find((col) => col.field === 'primarySupply.supplier');
      const orderMethodCol = itemsColumnDefs.find(
        (col) => col.field === 'primarySupply.orderMechanism',
      );
      const unitCostCol = itemsColumnDefs.find((col) => col.field === 'primarySupply.unitCost');
      const orderCostCol = itemsColumnDefs.find((col) => col.field === 'primarySupply.orderCost');
      expect(supplierCol).toBeDefined();
      expect(orderMethodCol).toBeDefined();
      expect(unitCostCol).toBeDefined();
      expect(orderCostCol).toBeDefined();
    });

    it('has size columns', () => {
      const cardSizeCol = itemsColumnDefs.find((col) => col.colId === 'cardSize');
      const labelSizeCol = itemsColumnDefs.find((col) => col.colId === 'labelSize');
      const breadcrumbSizeCol = itemsColumnDefs.find((col) => col.colId === 'breadcrumbSize');
      expect(cardSizeCol).toBeDefined();
      expect(labelSizeCol).toBeDefined();
      expect(breadcrumbSizeCol).toBeDefined();
    });

    it('has color column', () => {
      const colorCol = itemsColumnDefs.find((col) => col.colId === 'color');
      expect(colorCol).toBeDefined();
      expect(colorCol?.headerName).toBe('Color');
    });

    it('has notes columns', () => {
      const notesCol = itemsColumnDefs.find((col) => col.field === 'notes');
      const cardNotesCol = itemsColumnDefs.find((col) => col.field === 'cardNotesDefault');
      expect(notesCol).toBeDefined();
      expect(cardNotesCol).toBeDefined();
    });

    it('has taxable column', () => {
      const taxableCol = itemsColumnDefs.find((col) => col.field === 'taxable');
      expect(taxableCol).toBeDefined();
      expect(taxableCol?.headerName).toBe('Taxable');
    });

    it('has card count column', () => {
      const cardCountCol = itemsColumnDefs.find((col) => col.colId === 'cardCount');
      expect(cardCountCol).toBeDefined();
      expect(cardCountCol?.headerName).toBe('# of Cards');
    });

    it('has quick actions column', () => {
      const quickActionsCol = itemsColumnDefs.find((col) => col.colId === 'quickActions');
      expect(quickActionsCol).toBeDefined();
      expect(quickActionsCol?.headerName).toBe('Quick Actions');
    });

    it('all columns have headerName or custom header', () => {
      itemsColumnDefs.forEach((col) => {
        if (col.colId !== 'select') {
          expect(col.headerName).toBeDefined();
        }
      });
    });

    it('select column has custom header component', () => {
      const selectCol = itemsColumnDefs[0]!;
      expect(selectCol.headerComponent).toBeDefined();
    });
  });

  describe('itemsDefaultColDef', () => {
    it('has sortable enabled', () => {
      expect(itemsDefaultColDef.sortable).toBe(true);
    });

    it('has filter disabled', () => {
      expect(itemsDefaultColDef.filter).toBe(false);
    });

    it('has resizable enabled', () => {
      expect(itemsDefaultColDef.resizable).toBe(true);
    });

    it('has movable enabled', () => {
      expect(itemsDefaultColDef.suppressMovable).toBe(false);
    });
  });
});
