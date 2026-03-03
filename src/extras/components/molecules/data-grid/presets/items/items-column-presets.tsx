import type { ColDef, ICellRendererParams } from 'ag-grid-community';

import type {
  Item,
  ItemColor,
  CardSize,
  LabelSize,
  BreadcrumbSize,
  OrderMechanism,
} from '@/extras/types/reference/items/item-domain';
import type { Money } from '@/extras/types/model';

import { createSelectCellEditor } from '@/extras/components/atoms/select-cell-editor/select-cell-editor';
import { createTypeaheadCellEditor } from '@/extras/components/atoms/typeahead-cell-editor/typeahead-cell-editor';

import {
  cardSizeOptions,
  labelSizeOptions,
  breadcrumbSizeOptions,
  colorOptions,
  orderMethodOptions,
  unitOptions,
} from './items-options';
import {
  SelectAllHeaderComponent,
  SelectionCheckboxCell,
  NotesCell,
  CardCountCell,
  QuickActionsCell,
} from './items-cell-renderers';

/**
 * Formatter: Formats Money object as currency string.
 */
export function formatCurrency(value?: Money): string {
  if (!value) return '-';
  return `$${value.value.toFixed(2)} ${value.currency}`;
}

/**
 * Formatter: Formats Unix timestamp (milliseconds) as date string.
 */
export function formatDate(value?: number): string {
  if (value === undefined || value === null) return '-';
  return new Date(value).toLocaleDateString();
}

/**
 * Formatter: Formats Quantity object as amount + unit string.
 */
export function formatQuantity(value?: { amount: number; unit: string }): string {
  if (!value) return '-';
  return `${value.amount} ${value.unit}`;
}

/**
 * Typed setter for editable Item fields.
 * Handles each known editable path explicitly to avoid untyped casts.
 */
function setNestedValue(item: Item, path: string, value: unknown): boolean {
  switch (path) {
    case 'internalSKU':
      if (value === null || value === undefined || value === '') {
        delete item.internalSKU;
      } else {
        item.internalSKU = String(value).trim();
      }
      return true;
    case 'name':
      item.name = String(value ?? '').trim() || '';
      return true;
    case 'primarySupply.orderMechanism':
      if (item.primarySupply) {
        item.primarySupply.orderMechanism = String(value ?? '').trim() as OrderMechanism;
      }
      return true;
    case 'primarySupply.orderQuantity.unit': {
      const current = item.primarySupply?.orderQuantity || { amount: 1, unit: 'EACH' as const };
      if (item.primarySupply) {
        item.primarySupply.orderQuantity = {
          ...current,
          unit: (String(value ?? '').trim() || 'EACH') as typeof current.unit,
        };
      }
      return true;
    }
    case 'cardSize':
      item.cardSize = (String(value ?? '').trim() || cardSizeOptions[0]?.value || '') as CardSize;
      return true;
    case 'labelSize':
      item.labelSize = (String(value ?? '').trim() ||
        labelSizeOptions[0]?.value ||
        '') as LabelSize;
      return true;
    case 'breadcrumbSize':
      item.breadcrumbSize = (String(value ?? '').trim() ||
        breadcrumbSizeOptions[0]?.value ||
        '') as BreadcrumbSize;
      return true;
    case 'color':
      item.color = (String(value ?? '').trim() || colorOptions[0]?.value || 'BLUE') as ItemColor;
      return true;
    default:
      return false;
  }
}

/**
 * Which fields support editing.
 * Used by enhanceEditableColumnDefs.
 */
export const EDITABLE_FIELDS = new Set([
  'internalSKU',
  'name',
  'primarySupply.orderMechanism',
  'primarySupply.orderQuantity.unit',
  'cardSize',
  'labelSize',
  'breadcrumbSize',
  'color',
]);

/**
 * Enhance column definitions with editing capabilities.
 * Adds editable flag, value getters/setters, and cell editors for specified fields.
 */
export function enhanceEditableColumnDefs(
  defs: ColDef<Item>[],
  options?: { enabled?: boolean },
): ColDef<Item>[] {
  const enabled = options?.enabled !== false;

  if (!enabled) {
    return defs;
  }

  return defs.map((col) => {
    const key = (col.colId as string) || (col.field as string);
    if (!key || !EDITABLE_FIELDS.has(key)) return col;

    const path = key;

    return {
      ...col,
      editable: true,
      valueGetter: (params) => {
        const d = params.data as Item | undefined;
        if (!d) return '';
        if (path === 'internalSKU') return d.internalSKU ?? '';
        if (path === 'name') return d.name ?? '';
        if (path === 'primarySupply.orderMechanism') {
          const value = d.primarySupply?.orderMechanism;
          const validValues = orderMethodOptions.map((opt) => opt.value);
          if (!value || !validValues.includes(value)) {
            return orderMethodOptions[0]?.value || '';
          }
          return value;
        }
        if (path === 'primarySupply.orderQuantity.unit')
          return d.primarySupply?.orderQuantity?.unit ?? '';
        if (path === 'cardSize') {
          const value = d.cardSize;
          const validValues = cardSizeOptions.map((opt) => opt.value);
          if (!value) return validValues[0] || '';
          return validValues.includes(value) ? value : validValues[0] || '';
        }
        if (path === 'labelSize') {
          const value = d.labelSize;
          const validValues = labelSizeOptions.map((opt) => opt.value);
          if (!value) return validValues[0] || '';
          return validValues.includes(value) ? value : validValues[0] || '';
        }
        if (path === 'breadcrumbSize') {
          const value = d.breadcrumbSize;
          const validValues = breadcrumbSizeOptions.map((opt) => opt.value);
          if (!value) return validValues[0] || '';
          return validValues.includes(value) ? value : validValues[0] || '';
        }
        if (path === 'color') {
          const value = d.color;
          if (!value) return colorOptions[0]?.value || 'BLUE';
          const validValues = colorOptions.map((opt) => opt.value);
          return validValues.includes(value) ? value : colorOptions[0]?.value || 'BLUE';
        }
        return '';
      },
      valueSetter: (params) => {
        if (!params.data) return false;
        return setNestedValue(params.data, path, params.newValue);
      },
      ...(path === 'primarySupply.orderMechanism' && {
        cellEditor: createSelectCellEditor(orderMethodOptions),
      }),
      ...(path === 'primarySupply.orderQuantity.unit' && {
        cellEditor: createTypeaheadCellEditor({ dataSource: unitOptions }),
      }),
      ...(path === 'cardSize' && {
        cellEditor: createSelectCellEditor(cardSizeOptions),
      }),
      ...(path === 'labelSize' && {
        cellEditor: createSelectCellEditor(labelSizeOptions),
      }),
      ...(path === 'breadcrumbSize' && {
        cellEditor: createSelectCellEditor(breadcrumbSizeOptions),
      }),
      ...(path === 'color' && {
        cellEditor: createSelectCellEditor(colorOptions),
      }),
    } as ColDef<Item>;
  });
}

/**
 * Default column configuration for Items grid.
 */
export const itemsDefaultColDef: ColDef<Item> = {
  sortable: true,
  filter: false,
  resizable: true,
  suppressMovable: false,
};

/**
 * Full column definitions for Items grid.
 * Includes select, image, name, SKU, classification, locator, supply details,
 * card/label/breadcrumb sizes, color, notes, taxable, and quick actions.
 */
export const itemsColumnDefs: ColDef<Item>[] = [
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
    cellRenderer: (params: ICellRendererParams<Item>) => (
      <SelectionCheckboxCell node={params.node} />
    ),
  },
  {
    headerName: 'Image',
    field: 'imageUrl',
    width: 80,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      if (!item.imageUrl) {
        return <div className="w-8 h-8 bg-gray-100 rounded" />;
      }
      return <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain rounded" />;
    },
  },
  {
    headerName: 'Name',
    field: 'name',
    width: 300,
    sortable: true,
    filter: false,
    resizable: true,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return (
        <div className="flex flex-col items-start text-left text-sm">
          <div className="h-[41px] flex-1 flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-blue-600 cursor-pointer">
            {item.name}
          </div>
        </div>
      );
    },
  },
  {
    headerName: 'SKU',
    field: 'internalSKU',
    width: 140,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return item.internalSKU || '-';
    },
  },
  {
    headerName: 'GL Code',
    field: 'generalLedgerCode',
    width: 140,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return item.generalLedgerCode || '-';
    },
  },
  {
    headerName: 'Classification',
    field: 'classification.type',
    width: 150,
    valueGetter: (params) => params.data?.classification?.type,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      const classification = item.classification;
      if (!classification?.type) return '-';
      const display = classification.subType
        ? `${classification.type} - ${classification.subType}`
        : classification.type;
      return <span className="text-black">{display}</span>;
    },
  },
  {
    headerName: 'Sub-Type',
    field: 'classification.subType',
    width: 150,
    valueGetter: (params) => params.data?.classification?.subType,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return <span className="text-black">{item.classification?.subType || '-'}</span>;
    },
  },
  {
    headerName: 'Use Case',
    field: 'useCase',
    width: 150,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return <span className="text-black">{item.useCase || '-'}</span>;
    },
  },
  {
    headerName: 'Facility',
    field: 'locator.facility',
    width: 150,
    valueGetter: (params) => params.data?.locator?.facility,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return <span className="text-black">{item.locator?.facility || '-'}</span>;
    },
  },
  {
    headerName: 'Department',
    field: 'locator.department',
    width: 150,
    valueGetter: (params) => params.data?.locator?.department,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return <span className="text-black">{item.locator?.department || '-'}</span>;
    },
  },
  {
    headerName: 'Location',
    field: 'locator.location',
    width: 150,
    valueGetter: (params) => params.data?.locator?.location,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      const locator = item.locator;
      if (!locator) return '-';
      const parts = [locator.facility, locator.department, locator.location].filter(Boolean);
      const display = parts.join(' / ') || '-';
      return (
        <span className="text-black" title={display}>
          {display}
        </span>
      );
    },
  },
  {
    headerName: 'Supplier',
    field: 'primarySupply.supplier',
    width: 150,
    valueGetter: (params) => params.data?.primarySupply?.supplier,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      const supplier = item.primarySupply?.supplier;
      if (!supplier) return '-';
      return <span className="text-black">{supplier}</span>;
    },
  },
  {
    headerName: 'Order Method',
    field: 'primarySupply.orderMechanism',
    colId: 'primarySupply.orderMechanism',
    width: 140,
    valueGetter: (params) => params.data?.primarySupply?.orderMechanism,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      const orderMechanism = item.primarySupply?.orderMechanism;
      if (!orderMechanism) return '-';

      const orderMethodMap: Record<string, string> = {
        EMAIL: 'Email',
        PURCHASE_ORDER: 'Purchase order',
        PHONE: 'Phone',
        IN_STORE: 'In store',
        ONLINE: 'Online',
        RFQ: 'Request for quotation (RFQ)',
        PRODUCTION: 'Production',
        THIRD_PARTY: '3rd party',
        OTHER: 'Other',
      };

      return <span className="text-black">{orderMethodMap[orderMechanism] || orderMechanism}</span>;
    },
  },
  {
    headerName: 'Unit Cost',
    field: 'primarySupply.unitCost',
    width: 120,
    valueGetter: (params) => params.data?.primarySupply?.unitCost,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return formatCurrency(item.primarySupply?.unitCost);
    },
  },
  {
    headerName: 'Order Amount',
    field: 'primarySupply.orderQuantity.amount',
    colId: 'orderQuantityAmount',
    width: 150,
    minWidth: 100,
    suppressSizeToFit: true,
    valueGetter: (params) => params.data?.primarySupply?.orderQuantity?.amount,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return item.primarySupply?.orderQuantity?.amount ?? '-';
    },
  },
  {
    headerName: 'Order Unit',
    field: 'primarySupply.orderQuantity.unit',
    colId: 'primarySupply.orderQuantity.unit',
    width: 130,
    minWidth: 90,
    suppressSizeToFit: true,
    valueGetter: (params) => params.data?.primarySupply?.orderQuantity?.unit,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return item.primarySupply?.orderQuantity?.unit ?? '-';
    },
  },
  {
    headerName: 'Order Cost',
    field: 'primarySupply.orderCost',
    width: 120,
    valueGetter: (params) => params.data?.primarySupply?.orderCost,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return formatCurrency(item.primarySupply?.orderCost);
    },
  },
  {
    headerName: 'Card Size',
    field: 'cardSize',
    colId: 'cardSize',
    width: 150,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      const cardSize = item.cardSize;
      if (!cardSize) return '-';
      const cardSizeMap: Record<string, string> = {
        SMALL: 'Half-Index',
        MEDIUM: 'Business Card Stock',
        LARGE: '3 x 5',
        X_LARGE: '4 x 6',
      };
      return <span className="text-black">{cardSizeMap[cardSize] || cardSize}</span>;
    },
  },
  {
    headerName: 'Label Size',
    field: 'labelSize',
    colId: 'labelSize',
    width: 120,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      const labelSize = item.labelSize;
      if (!labelSize) return '-';
      const labelSizeMap: Record<string, string> = {
        SMALL: 'Quarter-Index',
        MEDIUM: 'Half-Index',
        LARGE: '1 x 3',
        X_LARGE: 'Business Card Stock',
      };
      return <span className="text-black">{labelSizeMap[labelSize] || labelSize}</span>;
    },
  },
  {
    headerName: 'Breadcrumb Size',
    field: 'breadcrumbSize',
    colId: 'breadcrumbSize',
    width: 150,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      const breadcrumbSize = item.breadcrumbSize;
      if (!breadcrumbSize) return '-';
      const breadcrumbSizeMap: Record<string, string> = {
        SMALL: '1 x 1',
        MEDIUM: '1 x 3',
        LARGE: 'Quarter-Index',
        X_LARGE: 'Half-Index',
      };
      return (
        <span className="text-black">{breadcrumbSizeMap[breadcrumbSize] || breadcrumbSize}</span>
      );
    },
  },
  {
    headerName: 'Color',
    field: 'color',
    colId: 'color',
    width: 120,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      const color = item.color;
      if (!color) return '-';
      const colorMap: Record<string, { hex: string; name: string }> = {
        RED: { hex: '#EF4444', name: 'Red' },
        GREEN: { hex: '#22C55E', name: 'Green' },
        BLUE: { hex: '#3B82F6', name: 'Blue' },
        YELLOW: { hex: '#FDE047', name: 'Yellow' },
        ORANGE: { hex: '#F97316', name: 'Orange' },
        PURPLE: { hex: '#A855F7', name: 'Purple' },
        PINK: { hex: '#EC4899', name: 'Pink' },
        GRAY: { hex: '#6B7280', name: 'Gray' },
        BLACK: { hex: '#000000', name: 'Black' },
        WHITE: { hex: '#FFFFFF', name: 'White' },
      };
      const colorInfo = colorMap[color] || { hex: '#6B7280', name: color };
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: colorInfo.hex }}
          />
          <span className="text-black">{colorInfo.name}</span>
        </div>
      );
    },
  },
  {
    headerName: 'Notes',
    field: 'notes',
    width: 100,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return <NotesCell item={item} />;
    },
  },
  {
    headerName: 'Card Notes',
    field: 'cardNotesDefault',
    width: 100,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      if (!item.cardNotesDefault) {
        return <span>-</span>;
      }
      return <NotesCell item={item} />;
    },
  },
  {
    headerName: 'Taxable',
    field: 'taxable',
    width: 100,
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return <span className="text-black">{item.taxable ? 'Yes' : 'No'}</span>;
    },
  },
  {
    headerName: '# of Cards',
    field: 'cardCount' as any,
    colId: 'cardCount',
    width: 100,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const item = params.data as Item;
      return <CardCountCell item={item} />;
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
      const item = params.data as Item;
      return <QuickActionsCell item={item} />;
    },
  },
];
