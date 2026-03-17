import { createElement } from 'react';
import type { ColDef, ICellRendererParams, ValueSetterParams } from 'ag-grid-community';

import type { Item } from '@/types/extras';
import { TypeaheadCellEditor, type TypeaheadOption } from './typeahead-cell-editor';
import { SelectCellEditor } from './select-cell-editor';
import { DragHeader } from './drag-header';

// --- Cell renderers ---

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const imgStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 4,
  objectFit: 'cover',
  backgroundColor: 'var(--secondary)',
};

const fallbackStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 4,
  backgroundColor: 'var(--secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted-foreground)',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.04em',
};

const cellWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
};

function ImageCellRenderer(params: ICellRendererParams<Item>) {
  if (!params.data) return null;
  const { imageUrl, name } = params.data;

  const inner = imageUrl
    ? createElement('img', {
        src: imageUrl,
        alt: name,
        style: imgStyle,
        onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
          const target = e.currentTarget;
          const fallback = document.createElement('div');
          Object.assign(fallback.style, fallbackStyle);
          fallback.textContent = getInitials(name);
          target.replaceWith(fallback);
        },
      })
    : createElement(
        'div',
        { style: fallbackStyle, role: 'img', 'aria-label': `${name} thumbnail` },
        getInitials(name),
      );

  return createElement('div', { style: cellWrapStyle }, inner);
}

function NotesCellRenderer(params: ICellRendererParams<Item>) {
  if (!params.data?.notes) return null;

  return createElement(
    'div',
    {
      style: {
        color: 'var(--muted-foreground)',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      },
      title: params.data.notes,
      'aria-label': 'Has notes',
      role: 'img',
    },
    createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: 16,
        height: 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      createElement('path', { d: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z' }),
    ),
  );
}

function SelectCellRenderer(params: ICellRendererParams<Item>) {
  const text = params.valueFormatted ?? params.value ?? '\u2014';
  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
      },
    },
    createElement('span', null, text),
    createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: 14,
        height: 14,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'var(--muted-foreground)',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style: { flexShrink: 0 },
        'aria-hidden': 'true',
      },
      createElement('path', { d: 'm6 9 6 6 6-6' }),
    ),
  );
}

// --- Value setters for nested fields ---

function moneyValueSetter(field: 'unitCost' | 'orderCost') {
  return (params: ValueSetterParams<Item>): boolean => {
    const num = parseFloat(params.newValue);
    if (isNaN(num)) return false;
    if (!params.data.primarySupply) return false;
    params.data.primarySupply[field] = { value: num, currency: 'USD' };
    return true;
  };
}

function supplierValueSetter(params: ValueSetterParams<Item>): boolean {
  if (!params.data.primarySupply) {
    params.data.primarySupply = {
      supplier: params.newValue,
      orderCost: { value: 0, currency: 'USD' },
    };
  } else {
    params.data.primarySupply.supplier = params.newValue;
  }
  return true;
}

function orderMechanismValueSetter(params: ValueSetterParams<Item>): boolean {
  if (!params.data.primarySupply) return false;
  params.data.primarySupply.orderMechanism = params.newValue;
  return true;
}

// --- Shared cell style using CSS var for mono font ---

const monoStyle: React.CSSProperties = { fontFamily: 'var(--font-geist-mono)' };

// --- Typeahead lookup config ---

export interface ItemGridLookups {
  supplier?: (search: string) => Promise<TypeaheadOption[]>;
  classificationType?: (search: string) => Promise<TypeaheadOption[]>;
}

// --- Defaults ---

export const itemGridDefaultColDef: ColDef<Item> = {
  sortable: true,
  resizable: true,
  headerComponentParams: {
    innerHeaderComponent: DragHeader,
  },
};

// --- Column definitions ---

/** Static columns (no lookups needed). Used as default. */
export const itemGridColumnDefs: ColDef<Item>[] = createItemGridColumnDefs();

/** Factory — pass lookups to get typeahead-enabled columns. */
export function createItemGridColumnDefs(lookups?: ItemGridLookups): ColDef<Item>[] {
  return [
    {
      headerName: '',
      field: 'imageUrl',
      width: 60,
      sortable: false,
      resizable: false,
      editable: false,
      cellRenderer: ImageCellRenderer,
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 3,
      minWidth: 200,
      editable: true,
    },
    {
      headerName: 'SKU',
      field: 'internalSKU',
      width: 160,
      editable: true,
      cellStyle: monoStyle,
      valueFormatter: (params) => params.value || '\u2014',
    },
    {
      headerName: 'GL Code',
      field: 'generalLedgerCode',
      width: 120,
      editable: true,
      cellStyle: monoStyle,
      valueFormatter: (params) => params.value || '\u2014',
    },
    {
      headerName: 'Classification',
      field: 'classification.type',
      flex: 2,
      minWidth: 180,
      editable: !!lookups?.classificationType,
      ...(lookups?.classificationType
        ? {
            singleClickEdit: true,
            cellEditor: TypeaheadCellEditor,
            cellEditorParams: {
              lookup: lookups.classificationType,
              allowCreate: true,
              placeholder: 'Search classifications…',
            },
            cellEditorPopup: true,
          }
        : {}),
      valueGetter: (params) => {
        const c = params.data?.classification;
        if (!c?.type) return null;
        return c.subType ? `${c.type} \u2013 ${c.subType}` : c.type;
      },
      valueFormatter: (params) => params.value || '\u2014',
    },
    {
      headerName: 'Supplier',
      field: 'primarySupply.supplier',
      flex: 2,
      minWidth: 180,
      editable: true,
      ...(lookups?.supplier
        ? {
            singleClickEdit: true,
            cellEditor: TypeaheadCellEditor,
            cellEditorParams: {
              lookup: lookups.supplier,
              allowCreate: true,
              placeholder: 'Search suppliers…',
            },
            cellEditorPopup: true,
          }
        : {}),
      valueGetter: (params) => params.data?.primarySupply?.supplier,
      valueSetter: supplierValueSetter,
      valueFormatter: (params) => params.value || '\u2014',
    },
    {
      headerName: 'Order Method',
      field: 'primarySupply.orderMechanism',
      width: 180,
      editable: true,
      singleClickEdit: true,
      cellRenderer: SelectCellRenderer,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        values: [
          { label: 'Purchase Order', value: 'PURCHASE_ORDER' },
          { label: 'Email', value: 'EMAIL' },
          { label: 'Phone', value: 'PHONE' },
          { label: 'In Store', value: 'IN_STORE' },
          { label: 'Online', value: 'ONLINE' },
          { label: 'RFQ', value: 'RFQ' },
          { label: 'Production', value: 'PRODUCTION' },
          { label: 'Third Party', value: 'THIRD_PARTY' },
          { label: 'Other', value: 'OTHER' },
        ],
      },
      cellEditorPopup: true,
      valueGetter: (params) => params.data?.primarySupply?.orderMechanism,
      valueSetter: orderMechanismValueSetter,
      valueFormatter: (params) => {
        if (!params.value) return '\u2014';
        return params.value.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      },
    },
    {
      headerName: 'Unit Cost',
      field: 'primarySupply.unitCost',
      width: 120,
      type: 'rightAligned',
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0, precision: 2 },
      cellStyle: { fontVariantNumeric: 'tabular-nums' },
      valueGetter: (params) => params.data?.primarySupply?.unitCost?.value,
      valueSetter: moneyValueSetter('unitCost'),
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '\u2014';
        return `$${Number(params.value).toFixed(2)}`;
      },
    },
    {
      headerName: 'Order Cost',
      field: 'primarySupply.orderCost',
      width: 120,
      type: 'rightAligned',
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0, precision: 2 },
      cellStyle: { fontVariantNumeric: 'tabular-nums' },
      valueGetter: (params) => params.data?.primarySupply?.orderCost?.value,
      valueSetter: moneyValueSetter('orderCost'),
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '\u2014';
        return `$${Number(params.value).toFixed(2)}`;
      },
    },
    {
      headerName: 'Taxable',
      field: 'taxable',
      width: 100,
      editable: true,
      singleClickEdit: true,
      cellRenderer: SelectCellRenderer,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        values: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      },
      cellEditorPopup: true,
      valueSetter: (params: ValueSetterParams<Item>): boolean => {
        params.data.taxable = params.newValue === 'true';
        return true;
      },
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '\u2014';
        return params.value ? 'Yes' : 'No';
      },
    },
    {
      headerName: '',
      field: 'notes',
      width: 52,
      sortable: false,
      resizable: false,
      editable: false,
      cellRenderer: NotesCellRenderer,
    },
  ];
}
