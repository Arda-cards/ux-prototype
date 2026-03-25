import { createElement } from 'react';
import type { ColDef, ICellRendererParams, ValueSetterParams } from 'ag-grid-community';

import type { Item } from '@/types/extras';
import { TypeaheadCellEditor, type TypeaheadOption } from './typeahead-cell-editor';
import { SelectCellEditor } from '../../atoms/grid/select/select-cell-editor';
import { DragHeader } from './drag-header';
import { ImageCellDisplay } from '../../atoms/grid/image';
import { ITEM_IMAGE_CONFIG } from '@/components/canary/__mocks__/image-story-data';

// --- Shared formatters ---

function formatOrderMechanism(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function formatCurrencyValue(value: unknown): string {
  if (value === null || value === undefined) return '\u2014';
  return `$${Number(value).toFixed(2)}`;
}

// --- Cell renderers ---

function NotesCellRenderer(params: ICellRendererParams<Item>) {
  const hasNotes = !!params.data?.notes;
  const onNotesClick = params.colDef?.cellRendererParams?.onNotesClick as
    | ((item: Item) => void)
    | undefined;

  return createElement(
    'button',
    {
      style: {
        color: hasNotes ? 'var(--foreground)' : 'var(--muted-foreground)',
        opacity: hasNotes ? 1 : 0.6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        borderRadius: 4,
      },
      className:
        'hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      title: hasNotes ? params.data?.notes : 'Add a note',
      'aria-label': hasNotes
        ? `View notes for ${params.data?.name}`
        : `Add note to ${params.data?.name}`,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onNotesClick && params.data) onNotesClick(params.data);
      },
    },
    createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: 16,
        height: 16,
        viewBox: '0 0 24 24',
        fill: hasNotes ? 'var(--muted-foreground)' : 'none',
        fillOpacity: hasNotes ? 0.15 : 0,
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

function OrderMethodRenderer(params: ICellRendererParams<Item>) {
  const value = params.data?.primarySupply?.orderMechanism;
  if (!value)
    return createElement('span', { style: { color: 'var(--muted-foreground)' } }, '\u2014');

  const label = formatOrderMechanism(value);
  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      },
    },
    createElement(
      'span',
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: 6,
          border: '1px solid var(--base-border)',
          color: 'var(--foreground)',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        },
      },
      label,
    ),
  );
}

function BooleanRenderer(params: ICellRendererParams<Item>) {
  const value = params.value;
  const isChecked = !!value;

  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        cursor: 'pointer',
      },
      onClick: () => {
        if (!params.node || !params.colDef?.field) return;
        params.node.setDataValue(params.colDef.field, !value);
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!params.node || !params.colDef?.field) return;
          params.node.setDataValue(params.colDef.field, !value);
        }
      },
      tabIndex: 0,
      role: 'checkbox',
      'aria-checked': isChecked,
      'aria-label': `Taxable: ${isChecked ? 'Yes' : 'No'}`,
      className:
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm',
    },
    createElement(
      'div',
      {
        style: {
          width: 18,
          height: 18,
          borderRadius: 4,
          border: isChecked ? 'none' : '2px solid var(--base-border)',
          backgroundColor: isChecked ? 'var(--base-primary)' : 'var(--base-background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s, border-color 0.15s',
        },
      },
      isChecked
        ? createElement(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              width: 12,
              height: 12,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'var(--base-primary-foreground)',
              strokeWidth: 3,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              'aria-hidden': 'true',
            },
            createElement('path', { d: 'M20 6 9 17l-5-5' }),
          )
        : null,
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

const monoStyle = { fontFamily: 'var(--font-geist-mono)' };
const tabularNumsStyle = { fontVariantNumeric: 'tabular-nums' };

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

/** Factory — pass lookups and callbacks to get fully-configured columns. */
export function createItemGridColumnDefs(
  lookups?: ItemGridLookups,
  options?: { onNotesClick?: (item: Item) => void },
): ColDef<Item>[] {
  return [
    {
      headerName: 'Image',
      field: 'imageUrl',
      headerClass: 'sr-only',
      width: 60,
      sortable: false,
      resizable: false,
      editable: false,
      cellRenderer: ImageCellDisplay,
      cellRendererParams: { config: ITEM_IMAGE_CONFIG },
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 3,
      minWidth: 200,
      editable: true,
      tooltipField: 'name',
    },
    {
      headerName: 'SKU',
      field: 'internalSKU',
      width: 160,
      editable: true,
      cellStyle: monoStyle,
      tooltipField: 'internalSKU',
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
              placeholder: 'Search classifications\u2026',
            },
            cellEditorPopup: true,
          }
        : {}),
      valueGetter: (params) => {
        const c = params.data?.classification;
        if (!c?.type) return null;
        return c.subType ? `${c.type} \u2013 ${c.subType}` : c.type;
      },
      tooltipValueGetter: (params) => params.value || undefined,
      valueFormatter: (params) => params.value || '\u2014',
    },
    {
      headerName: 'Supplier',
      field: 'primarySupply.supplier',
      flex: 2,
      minWidth: 180,
      tooltipValueGetter: (params) => params.data?.primarySupply?.supplier || undefined,
      editable: true,
      ...(lookups?.supplier
        ? {
            singleClickEdit: true,
            cellEditor: TypeaheadCellEditor,
            cellEditorParams: {
              lookup: lookups.supplier,
              allowCreate: true,
              placeholder: 'Search suppliers\u2026',
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
      cellRenderer: OrderMethodRenderer,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: [
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
      valueFormatter: (params) => (params.value ? formatOrderMechanism(params.value) : '\u2014'),
    },
    {
      headerName: 'Unit Cost',
      field: 'primarySupply.unitCost',
      width: 120,
      type: 'rightAligned',
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0, precision: 2 },
      cellStyle: tabularNumsStyle,
      valueGetter: (params) => params.data?.primarySupply?.unitCost?.value,
      valueSetter: moneyValueSetter('unitCost'),
      valueFormatter: (params) => formatCurrencyValue(params.value),
    },
    {
      headerName: 'Order Cost',
      field: 'primarySupply.orderCost',
      width: 120,
      type: 'rightAligned',
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0, precision: 2 },
      cellStyle: tabularNumsStyle,
      valueGetter: (params) => params.data?.primarySupply?.orderCost?.value,
      valueSetter: moneyValueSetter('orderCost'),
      valueFormatter: (params) => formatCurrencyValue(params.value),
    },
    {
      headerName: 'Taxable',
      field: 'taxable',
      width: 80,
      editable: false,
      cellRenderer: BooleanRenderer,
    },
    {
      headerName: 'Notes',
      field: 'notes',
      headerClass: 'sr-only',
      width: 52,
      sortable: false,
      resizable: false,
      editable: false,
      cellRenderer: NotesCellRenderer,
      ...(options?.onNotesClick !== undefined
        ? { cellRendererParams: { onNotesClick: options.onNotesClick } }
        : {}),
    },
  ];
}
