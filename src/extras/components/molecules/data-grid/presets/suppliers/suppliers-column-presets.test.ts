import { describe, it, expect } from 'vitest';

import {
  EDITABLE_SUPPLIER_FIELDS,
  enhanceEditableSupplierColumnDefs,
  suppliersColumnDefs,
  suppliersDefaultColDef,
} from './suppliers-column-presets';

describe('suppliers-column-presets', () => {
  describe('EDITABLE_SUPPLIER_FIELDS', () => {
    it('contains expected editable fields', () => {
      expect(EDITABLE_SUPPLIER_FIELDS.has('name')).toBe(true);
      expect(EDITABLE_SUPPLIER_FIELDS.has('contact.lastName')).toBe(true);
      expect(EDITABLE_SUPPLIER_FIELDS.has('contact.email')).toBe(true);
      expect(EDITABLE_SUPPLIER_FIELDS.has('contact.phone')).toBe(true);
      expect(EDITABLE_SUPPLIER_FIELDS.has('notes')).toBe(true);
    });

    it('does not contain non-editable fields', () => {
      expect(EDITABLE_SUPPLIER_FIELDS.has('eId')).toBe(false);
      expect(EDITABLE_SUPPLIER_FIELDS.has('roles')).toBe(false);
      expect(EDITABLE_SUPPLIER_FIELDS.has('legal.legalName')).toBe(false);
      expect(EDITABLE_SUPPLIER_FIELDS.has('legal.taxId')).toBe(false);
    });

    it('has expected size', () => {
      expect(EDITABLE_SUPPLIER_FIELDS.size).toBe(5);
    });
  });

  describe('enhanceEditableSupplierColumnDefs', () => {
    it('adds editable flag to editable columns', () => {
      const defs = [
        { field: 'name', colId: 'name', headerName: 'Name' },
        { field: 'roles', colId: 'roles', headerName: 'Roles' },
      ];

      const enhanced = enhanceEditableSupplierColumnDefs(defs as any);

      expect(enhanced[0]!.editable).toBe(true);
      expect(enhanced[1]!.editable).toBeUndefined();
    });

    it('preserves original column configuration', () => {
      const defs = [{ field: 'name', colId: 'name', headerName: 'Name', width: 250 }];

      const enhanced = enhanceEditableSupplierColumnDefs(defs as any);

      expect(enhanced[0]!.headerName).toBe('Name');
      expect(enhanced[0]!.width).toBe(250);
    });

    it('adds valueGetter to editable columns', () => {
      const defs = [{ field: 'name', colId: 'name', headerName: 'Name' }];

      const enhanced = enhanceEditableSupplierColumnDefs(defs as any);

      expect(typeof enhanced[0]!.valueGetter).toBe('function');
    });

    it('adds valueSetter to editable columns', () => {
      const defs = [{ field: 'name', colId: 'name', headerName: 'Name' }];

      const enhanced = enhanceEditableSupplierColumnDefs(defs as any);

      expect(typeof enhanced[0]!.valueSetter).toBe('function');
    });

    it('respects enabled option', () => {
      const defs = [{ field: 'name', colId: 'name', headerName: 'Name' }];

      const enhanced = enhanceEditableSupplierColumnDefs(defs as any, { enabled: false });

      expect(enhanced[0]!.editable).toBeUndefined();
    });

    it('enhances contact.lastName column by colId', () => {
      const defs = [{ field: 'contact', colId: 'contact.lastName', headerName: 'Contact' }];

      const enhanced = enhanceEditableSupplierColumnDefs(defs as any);

      expect(enhanced[0]!.editable).toBe(true);
      expect(typeof enhanced[0]!.valueGetter).toBe('function');
    });

    it('enhances notes column', () => {
      const defs = [{ field: 'notes', colId: 'notes', headerName: 'Notes' }];

      const enhanced = enhanceEditableSupplierColumnDefs(defs as any);

      expect(enhanced[0]!.editable).toBe(true);
    });
  });

  describe('suppliersColumnDefs', () => {
    it('has expected number of columns', () => {
      expect(suppliersColumnDefs.length).toBe(12);
    });

    it('has select column first', () => {
      expect(suppliersColumnDefs[0]!.colId).toBe('select');
    });

    it('has name column', () => {
      const nameCol = suppliersColumnDefs.find((col) => col.colId === 'name');
      expect(nameCol).toBeDefined();
      expect(nameCol?.headerName).toBe('Name');
    });

    it('has legal name column', () => {
      const legalNameCol = suppliersColumnDefs.find((col) => col.colId === 'legal.legalName');
      expect(legalNameCol).toBeDefined();
      expect(legalNameCol?.headerName).toBe('Legal Name');
    });

    it('has roles column', () => {
      const rolesCol = suppliersColumnDefs.find((col) => col.colId === 'roles');
      expect(rolesCol).toBeDefined();
      expect(rolesCol?.headerName).toBe('Roles');
    });

    it('has contact column', () => {
      const contactCol = suppliersColumnDefs.find((col) => col.colId === 'contact.lastName');
      expect(contactCol).toBeDefined();
      expect(contactCol?.headerName).toBe('Contact');
    });

    it('has email column', () => {
      const emailCol = suppliersColumnDefs.find((col) => col.colId === 'contact.email');
      expect(emailCol).toBeDefined();
      expect(emailCol?.headerName).toBe('Email');
    });

    it('has phone column', () => {
      const phoneCol = suppliersColumnDefs.find((col) => col.colId === 'contact.phone');
      expect(phoneCol).toBeDefined();
      expect(phoneCol?.headerName).toBe('Phone');
    });

    it('has country column', () => {
      const countryCol = suppliersColumnDefs.find((col) => col.colId === 'legal.country');
      expect(countryCol).toBeDefined();
      expect(countryCol?.headerName).toBe('Country');
    });

    it('has tax ID column', () => {
      const taxIdCol = suppliersColumnDefs.find((col) => col.colId === 'legal.taxId');
      expect(taxIdCol).toBeDefined();
      expect(taxIdCol?.headerName).toBe('Tax ID');
    });

    it('has location column', () => {
      const locationCol = suppliersColumnDefs.find((col) => col.colId === 'mainAddress');
      expect(locationCol).toBeDefined();
      expect(locationCol?.headerName).toBe('Location');
    });

    it('has notes column', () => {
      const notesCol = suppliersColumnDefs.find((col) => col.colId === 'notes');
      expect(notesCol).toBeDefined();
      expect(notesCol?.headerName).toBe('Notes');
    });

    it('has quick actions column', () => {
      const quickActionsCol = suppliersColumnDefs.find((col) => col.colId === 'quickActions');
      expect(quickActionsCol).toBeDefined();
      expect(quickActionsCol?.headerName).toBe('Quick Actions');
    });

    it('all columns have headerName or custom header', () => {
      suppliersColumnDefs.forEach((col) => {
        if (col.colId !== 'select') {
          expect(col.headerName).toBeDefined();
        }
      });
    });

    it('select column has custom header component', () => {
      const selectCol = suppliersColumnDefs[0]!;
      expect(selectCol.headerComponent).toBeDefined();
    });
  });

  describe('suppliersDefaultColDef', () => {
    it('has sortable enabled', () => {
      expect(suppliersDefaultColDef.sortable).toBe(true);
    });

    it('has filter disabled', () => {
      expect(suppliersDefaultColDef.filter).toBe(false);
    });

    it('has resizable enabled', () => {
      expect(suppliersDefaultColDef.resizable).toBe(true);
    });

    it('has movable enabled', () => {
      expect(suppliersDefaultColDef.suppressMovable).toBe(false);
    });
  });
});
