import type { ColDef, ICellRendererParams } from 'ag-grid-community';

import type { BusinessAffiliate } from '@/extras/types/reference/business-affiliates/business-affiliate';
import { getContactDisplayName } from '@/extras/types/model/assets/contact';

import {
  SelectAllHeaderComponent,
  SelectionCheckboxCell,
  RolesBadgesCell,
  ContactCell,
  LocationCell,
  SupplierNotesCell,
  SupplierQuickActionsCell,
} from './suppliers-cell-renderers';

/**
 * Typed setter for editable BusinessAffiliate fields.
 * Handles each known editable path explicitly to avoid untyped casts.
 */
function setNestedValue(affiliate: BusinessAffiliate, path: string, value: unknown): boolean {
  switch (path) {
    case 'name':
      affiliate.name = String(value ?? '').trim() || '';
      return true;
    case 'contact.lastName': {
      if (!affiliate.contact) affiliate.contact = {};
      if (value === null || value === undefined || value === '') {
        delete affiliate.contact.lastName;
      } else {
        affiliate.contact.lastName = String(value).trim();
      }
      return true;
    }
    case 'contact.email': {
      if (!affiliate.contact) affiliate.contact = {};
      if (value === null || value === undefined || value === '') {
        delete affiliate.contact.email;
      } else {
        affiliate.contact.email = String(value).trim();
      }
      return true;
    }
    case 'contact.phone': {
      if (!affiliate.contact) affiliate.contact = {};
      if (value === null || value === undefined || value === '') {
        delete affiliate.contact.phone;
      } else {
        affiliate.contact.phone = String(value).trim();
      }
      return true;
    }
    case 'notes':
      if (value === null || value === undefined || value === '') {
        delete affiliate.notes;
      } else {
        affiliate.notes = String(value).trim();
      }
      return true;
    default:
      return false;
  }
}

/**
 * Which fields support editing.
 * Used by enhanceEditableSupplierColumnDefs.
 */
export const EDITABLE_SUPPLIER_FIELDS = new Set([
  'name',
  'contact.lastName',
  'contact.email',
  'contact.phone',
  'notes',
]);

/**
 * Enhance column definitions with editing capabilities.
 * Adds editable flag, value getters/setters for specified fields.
 */
export function enhanceEditableSupplierColumnDefs(
  defs: ColDef<BusinessAffiliate>[],
  options?: { enabled?: boolean },
): ColDef<BusinessAffiliate>[] {
  const enabled = options?.enabled !== false;

  if (!enabled) {
    return defs;
  }

  return defs.map((col) => {
    const key = (col.colId as string) || (col.field as string);
    if (!key || !EDITABLE_SUPPLIER_FIELDS.has(key)) return col;

    const path = key;

    return {
      ...col,
      editable: true,
      valueGetter: (params) => {
        const d = params.data as BusinessAffiliate | undefined;
        if (!d) return '';
        if (path === 'name') return d.name ?? '';
        if (path === 'contact.lastName') return d.contact?.lastName ?? '';
        if (path === 'contact.email') return d.contact?.email ?? '';
        if (path === 'contact.phone') return d.contact?.phone ?? '';
        if (path === 'notes') return d.notes ?? '';
        return '';
      },
      valueSetter: (params) => {
        if (!params.data) return false;
        return setNestedValue(params.data, path, params.newValue);
      },
    } as ColDef<BusinessAffiliate>;
  });
}

/**
 * Default column configuration for Suppliers grid.
 */
export const suppliersDefaultColDef: ColDef<BusinessAffiliate> = {
  sortable: true,
  filter: false,
  resizable: true,
  suppressMovable: false,
};

/**
 * Full column definitions for Suppliers grid.
 * Includes select, name, legal name, roles, contact, email, phone,
 * country, tax ID, location, notes, and quick actions.
 */
export const suppliersColumnDefs: ColDef<BusinessAffiliate>[] = [
  {
    colId: 'select',
    headerName: '',
    field: 'select' as any,
    width: 50,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    wrapHeaderText: false,
    autoHeaderHeight: false,
    checkboxSelection: false,
    headerCheckboxSelection: false,
    suppressMovable: true,
    headerComponent: SelectAllHeaderComponent,
    cellStyle: {
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    },
    headerClass: 'flex items-center justify-start p-0 w-full cursor-pointer',
    cellRenderer: (params: ICellRendererParams<BusinessAffiliate>) => (
      <SelectionCheckboxCell node={params.node} />
    ),
  },
  {
    headerName: 'Name',
    field: 'name',
    colId: 'name',
    width: 250,
    sortable: true,
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      return (
        <div className="flex items-center text-sm h-full overflow-hidden text-ellipsis whitespace-nowrap text-blue-600 cursor-pointer">
          {affiliate.name}
        </div>
      );
    },
  },
  {
    headerName: 'Legal Name',
    field: 'legal.legalName',
    colId: 'legal.legalName',
    width: 220,
    valueGetter: (params) => params.data?.legal?.legalName,
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      return <span className="text-gray-900">{affiliate.legal?.legalName || '\u2014'}</span>;
    },
  },
  {
    headerName: 'Roles',
    field: 'roles',
    colId: 'roles',
    width: 200,
    sortable: false,
    cellStyle: {
      overflow: 'visible',
      display: 'flex',
      alignItems: 'center',
    },
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      return <RolesBadgesCell affiliate={affiliate} />;
    },
  },
  {
    headerName: 'Contact',
    field: 'contact',
    colId: 'contact.lastName',
    width: 200,
    cellStyle: {
      overflow: 'visible',
      display: 'flex',
      alignItems: 'center',
    },
    valueGetter: (params) => getContactDisplayName(params.data?.contact),
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      return <ContactCell affiliate={affiliate} />;
    },
  },
  {
    headerName: 'Email',
    field: 'contact.email',
    colId: 'contact.email',
    width: 200,
    valueGetter: (params) => params.data?.contact?.email,
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      const email = affiliate.contact?.email;
      return email ? (
        <span className="text-gray-900 text-sm">{email}</span>
      ) : (
        <span className="text-gray-400">{'\u2014'}</span>
      );
    },
  },
  {
    headerName: 'Phone',
    field: 'contact.phone',
    colId: 'contact.phone',
    width: 150,
    valueGetter: (params) => params.data?.contact?.phone,
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      const phone = affiliate.contact?.phone;
      return phone ? (
        <span className="text-gray-900 text-sm">{phone}</span>
      ) : (
        <span className="text-gray-400">{'\u2014'}</span>
      );
    },
  },
  {
    headerName: 'Country',
    field: 'legal.country',
    colId: 'legal.country',
    width: 120,
    valueGetter: (params) => params.data?.legal?.country,
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      const country = affiliate.legal?.country;
      return country ? (
        <span className="text-gray-900">{country}</span>
      ) : (
        <span className="text-gray-400">{'\u2014'}</span>
      );
    },
  },
  {
    headerName: 'Tax ID',
    field: 'legal.taxId',
    colId: 'legal.taxId',
    width: 140,
    valueGetter: (params) => params.data?.legal?.taxId,
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      const taxId = affiliate.legal?.taxId;
      return taxId ? (
        <span className="text-gray-900 font-mono text-xs">{taxId}</span>
      ) : (
        <span className="text-gray-400">{'\u2014'}</span>
      );
    },
  },
  {
    headerName: 'Location',
    field: 'mainAddress',
    colId: 'mainAddress',
    width: 200,
    valueGetter: (params) => {
      const address = params.data?.mainAddress;
      if (!address) return '';
      return [address.city, address.state].filter(Boolean).join(', ');
    },
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      return <LocationCell affiliate={affiliate} />;
    },
  },
  {
    headerName: 'Notes',
    field: 'notes',
    colId: 'notes',
    width: 100,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      return <SupplierNotesCell affiliate={affiliate} />;
    },
  },
  {
    headerName: 'Quick Actions',
    field: 'quickActions' as any,
    colId: 'quickActions',
    width: 123,
    cellStyle: {
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    },
    cellRenderer: (params: any) => {
      const affiliate = params.data as BusinessAffiliate;
      return <SupplierQuickActionsCell affiliate={affiliate} />;
    },
  },
];
