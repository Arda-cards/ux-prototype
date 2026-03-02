/**
 * AG Grid column definitions for the Suppliers list view.
 *
 * Follows the same ColDef pattern as the vendored itemsColumnDefs
 * but lives outside the vendored tree so it can evolve independently.
 */
import React from 'react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import {
  SelectAllHeaderComponent,
  SelectionCheckboxCell,
} from '@/extras/components/molecules/data-grid/presets/common/common-cell-renderers';
import type { BusinessAffiliateWithRoles } from './types';
import type { BusinessRoleType } from './types';

const roleBadgeColors: Record<BusinessRoleType, string> = {
  VENDOR: 'bg-blue-100 text-blue-800',
  CUSTOMER: 'bg-green-100 text-green-800',
  CARRIER: 'bg-amber-100 text-amber-800',
  OPERATOR: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export const suppliersColumnDefs: ColDef<BusinessAffiliateWithRoles>[] = [
  {
    colId: 'select',
    headerName: '',
    width: 50,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    suppressMovable: true,
    headerComponent: SelectAllHeaderComponent,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    },
    headerClass: 'flex items-center justify-start p-0 w-full cursor-pointer',
    cellRenderer: (params: ICellRendererParams<BusinessAffiliateWithRoles>) => (
      <SelectionCheckboxCell node={params.node} />
    ),
  },
  {
    headerName: 'Name',
    field: 'name',
    flex: 2,
    minWidth: 180,
    editable: true,
  },
  {
    headerName: 'Contact',
    field: 'contact',
    flex: 1.5,
    minWidth: 150,
    valueGetter: (params) => params.data?.contact?.name ?? '',
    cellRenderer: (params: { data: BusinessAffiliateWithRoles | undefined }) => {
      const contact = params.data?.contact;
      if (!contact) return null;
      return (
        <div className="flex flex-col leading-tight py-1">
          <span className="text-sm font-medium">{contact.name}</span>
          {contact.email && (
            <span className="text-xs text-muted-foreground">{contact.email}</span>
          )}
        </div>
      );
    },
  },
  {
    headerName: 'Phone',
    colId: 'phone',
    flex: 1,
    minWidth: 130,
    editable: true,
    valueGetter: (params) => params.data?.contact?.phone ?? '',
    valueSetter: (params) => {
      if (params.data.contact) {
        params.data.contact = { ...params.data.contact, phone: params.newValue };
      } else {
        params.data.contact = { name: '', phone: params.newValue };
      }
      return true;
    },
  },
  {
    headerName: 'City',
    colId: 'city',
    flex: 1,
    minWidth: 120,
    editable: true,
    valueGetter: (params) => params.data?.mainAddress?.city ?? '',
    valueSetter: (params) => {
      if (params.data.mainAddress) {
        params.data.mainAddress = { ...params.data.mainAddress, city: params.newValue };
      } else {
        params.data.mainAddress = { addressLine1: '', city: params.newValue };
      }
      return true;
    },
  },
  {
    headerName: 'State',
    colId: 'state',
    flex: 0.6,
    minWidth: 70,
    editable: true,
    valueGetter: (params) => params.data?.mainAddress?.state ?? '',
    valueSetter: (params) => {
      if (params.data.mainAddress) {
        params.data.mainAddress = { ...params.data.mainAddress, state: params.newValue };
      } else {
        params.data.mainAddress = { addressLine1: '', state: params.newValue };
      }
      return true;
    },
  },
  {
    headerName: 'Roles',
    colId: 'roles',
    flex: 1.2,
    minWidth: 140,
    valueGetter: (params) => params.data?.roles?.join(', ') ?? '',
    cellRenderer: (params: { data: BusinessAffiliateWithRoles | undefined }) => {
      const roles = params.data?.roles;
      if (!roles?.length) return null;
      return (
        <div className="flex gap-1 items-center py-1">
          {roles.map((role) => (
            <span
              key={role}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColors[role]}`}
            >
              {role.charAt(0) + role.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      );
    },
  },
];

export const suppliersDefaultColDef: ColDef<BusinessAffiliateWithRoles> = {
  sortable: true,
  resizable: true,
  suppressMovable: false,
};
