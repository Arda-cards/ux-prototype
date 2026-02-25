import { publishedItems, draftItems, recentlyUploaded } from './itemsData';
import type { Item } from '@frontend/types/items';

describe('itemsData', () => {
  describe('publishedItems', () => {
    it('exports a non-empty array', () => {
      expect(Array.isArray(publishedItems)).toBe(true);
      expect(publishedItems.length).toBeGreaterThan(0);
    });

    it('contains 50 items (5 explicit + 45 generated)', () => {
      expect(publishedItems).toHaveLength(50);
    });

    it('first item has correct entityId', () => {
      expect(publishedItems[0].entityId).toBe('TASK-0001');
    });

    it('first item has the correct name', () => {
      expect(publishedItems[0].name).toBe('Generating synthetic data');
    });

    it('all items have required fields', () => {
      publishedItems.forEach((item: Item) => {
        expect(item.entityId).toBeDefined();
        expect(item.recordId).toBeDefined();
        expect(item.name).toBeDefined();
      });
    });

    it('all items have a primarySupply with a supplier', () => {
      publishedItems.forEach((item: Item) => {
        expect(item.primarySupply).toBeDefined();
        expect(item.primarySupply?.supplier).toBeDefined();
      });
    });

    it('all items have a locator with a location', () => {
      publishedItems.forEach((item: Item) => {
        expect(item.locator).toBeDefined();
        expect(item.locator?.location).toBeDefined();
      });
    });

    it('all items have cardSize MEDIUM', () => {
      publishedItems.forEach((item: Item) => {
        expect(item.cardSize).toBe('MEDIUM');
      });
    });

    it('generated items cycle through 4 suppliers', () => {
      const suppliers = new Set(publishedItems.map((i) => i.primarySupply?.supplier));
      expect(suppliers.has('Amazon')).toBe(true);
      expect(suppliers.has('Mouser')).toBe(true);
      expect(suppliers.has('Digikey')).toBe(true);
      expect(suppliers.has('BestBuy')).toBe(true);
    });
  });

  describe('draftItems', () => {
    it('exports an array', () => {
      expect(Array.isArray(draftItems)).toBe(true);
    });

    it('contains at least one item', () => {
      expect(draftItems.length).toBeGreaterThan(0);
    });

    it('first item has entityId TASK-7181', () => {
      expect(draftItems[0].entityId).toBe('TASK-7181');
    });
  });

  describe('recentlyUploaded', () => {
    it('exports an array', () => {
      expect(Array.isArray(recentlyUploaded)).toBe(true);
    });

    it('contains at least one item', () => {
      expect(recentlyUploaded.length).toBeGreaterThan(0);
    });

    it('first item has entityId TASK-9202', () => {
      expect(recentlyUploaded[0].entityId).toBe('TASK-9202');
    });
  });
});
