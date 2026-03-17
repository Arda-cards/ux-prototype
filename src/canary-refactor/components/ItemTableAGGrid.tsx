'use client';

import React, {
  useRef,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import type { ColDef, GridApi, GridState, ICellEditorParams } from 'ag-grid-community';
// --- Canary integration: DataGrid replaces ArdaGrid ---
import { DataGrid } from '@/components/canary/molecules/data-grid';
import type { DataGridRef } from '@/components/canary/molecules/data-grid';
// --- Canary integration: column defs from forked columnPresets ---
import {
  itemsColumnDefs,
  itemsDefaultColDef,
} from './columnPresets';
import * as items from '@frontend/types/items';
import type { KanbanCardResult } from '@frontend/types/kanban';
import { createDraftItem, updateItem } from '@frontend/lib/ardaClient';
import { toast } from 'sonner';
import { isAuthenticationError } from '@frontend/lib/utils';
import { ChevronDown } from 'lucide-react';
import { orderMethodOptions, cardSizeOptions, labelSizeOptions, breadcrumbSizeOptions } from '@frontend/constants/constants';
import { VIEW_KEY_TO_FIELD } from '@frontend/app/items/itemTableConfig';
import { SupplierCellEditor } from '@frontend/components/items/SupplierCellEditor';
import { UnitCellEditor } from '@frontend/components/items/UnitCellEditor';
import { TypeCellEditor } from '@frontend/components/items/TypeCellEditor';
import { SubTypeCellEditor } from '@frontend/components/items/SubTypeCellEditor';
import { UseCaseCellEditor } from '@frontend/components/items/UseCaseCellEditor';
import { FacilityCellEditor } from '@frontend/components/items/FacilityCellEditor';
import { DepartmentCellEditor } from '@frontend/components/items/DepartmentCellEditor';
import { LocationCellEditor } from '@frontend/components/items/LocationCellEditor';
import { SublocationCellEditor } from '@frontend/components/items/SublocationCellEditor';

// Context for item cards map and item details
interface ItemCardsContextType {
  itemCardsMap: Record<string, KanbanCardResult[]>;
  refreshCardsForItem: (itemEntityId: string) => Promise<void>;
  ensureCardsForItem: (itemEntityId: string) => Promise<void>;
  onOpenItemDetails?: (item: items.Item) => void;
}

const ItemCardsContext = createContext<ItemCardsContextType>({
  itemCardsMap: {},
  refreshCardsForItem: async () => {},
  ensureCardsForItem: async () => {},
  onOpenItemDetails: undefined,
});

export const useItemCards = () => useContext(ItemCardsContext);

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  items: items.Item[];
  activeTab: string;
  columnVisibility?: Record<string, boolean>;
  columnOrder?: string[];
  onRowClick?: (item: items.Item) => void;
  onSelectionChange?: (selectedItems: items.Item[]) => void;
  onColumnVisibilityChange?: (
    columnVisibility: Record<string, boolean>
  ) => void;
  totalSelectedCount?: number;
  maxItemsSeen?: number;
  paginationData?: {
    currentIndex?: number;
    currentPageSize: number;
    totalItems: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    thisPage?: string;
    nextPage?: string;
    previousPage?: string;
  };
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onFirstPage?: () => void;
  isLoading?: boolean;
  itemCardsMap?: Record<string, KanbanCardResult[]>;
  refreshCardsForItem?: (itemEntityId: string) => Promise<void>;
  ensureCardsForItem?: (itemEntityId: string) => Promise<void>;
  emptyStateComponent?: React.ReactNode;
  hasActiveSearch?: boolean;
  enableCellEditing?: boolean;
  onRefreshRequested?: () => void | Promise<void>;
  onAuthError?: (err: unknown) => void;
  onUnsavedChangesChange?: (has: boolean) => void;
  isUnsavedModalOpen?: boolean;
  onOpenItemDetails?: (item: items.Item) => void;
};

export interface ItemTableAGGridRef {
  saveAllDrafts: () => Promise<void>;
  getHasUnsavedChanges: () => boolean;
  discardAllDrafts: () => void;
  getDisplayedItems: () => items.Item[];
}

// Helper to set nested value (e.g. 'primarySupply.supplier')
function setNested(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let o: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof o[k] !== 'object' || o[k] === null) o[k] = {};
    o = o[k] as Record<string, unknown>;
  }
  o[parts[parts.length - 1]] = value;
}

const QUICK_ACTIONS_COL_IDS = ['quickActions', 'actions'];

const EDITABLE_FIELDS = new Set([
  'internalSKU', 'generalLedgerCode', 'name', 'primarySupply.supplier', 'primarySupply.unitCost',
  'minQuantityAmount', 'minQuantityUnit', 'orderQuantityAmount', 'orderQuantityUnit',
  'primarySupply.orderMechanism', 'classification.type', 'classification.subType',
  'locator.location', 'locator.subLocation', 'locator.department', 'locator.facility', 'useCase', 'notes', 'cardNotesDefault',
  'taxable', 'primarySupply.url', 'primarySupply.sku', 'primarySupply.averageLeadTime', 'primarySupply.orderCost',
  'cardSize', 'labelSize', 'breadcrumbSize', 'color',
]);

const PENDING_COMPLEX_PATHS = new Set([
  'primarySupply.unitCost', 'primarySupply.orderCost', 'primarySupply.averageLeadTime',
  'minQuantityAmount', 'minQuantityUnit', 'orderQuantityAmount', 'orderQuantityUnit',
]);

// Color options for the color editor
const COLOR_EDITOR_OPTIONS = [
  { value: 'YELLOW', name: 'Yellow' },
  { value: 'RED', name: 'Red' },
  { value: 'GREEN', name: 'Green' },
  { value: 'BLUE', name: 'Blue' },
  { value: 'ORANGE', name: 'Orange' },
  { value: 'PURPLE', name: 'Purple' },
  { value: 'PINK', name: 'Pink' },
  { value: 'GRAY', name: 'Gray' },
  { value: 'BLACK', name: 'Black' },
  { value: 'WHITE', name: 'White' },
];

// notifyDropdownChange helper (mirrors vendored version)
function notifyDropdownChange(params: ICellEditorParams | null, fieldPath: string, value: string) {
  if (!params) return;
  const ctx = (params as any).context;
  if (ctx?.setDropdownValueForRow) {
    const rowId = (params.data as items.Item)?.entityId;
    if (rowId) ctx.setDropdownValueForRow(rowId, fieldPath, value);
  }
}

// Custom cell editor for color field (mirrors vendored implementation)
class ColorCellEditorVendored {
  private eGui: HTMLDivElement | null = null;
  private selectElement: HTMLSelectElement | null = null;
  private params: ICellEditorParams | null = null;
  private currentValue: string = '';
  private _focusHandler: (() => void) | null = null;

  init(params: ICellEditorParams) {
    this.params = params;
    const valueFromParams = params.value as string | undefined;
    const options = COLOR_EDITOR_OPTIONS.map(opt => ({ value: opt.value, label: opt.name }));
    const validValues = options.map(opt => opt.value);
    this.currentValue =
      valueFromParams === '' || (valueFromParams && validValues.includes(valueFromParams))
        ? (valueFromParams ?? '')
        : '';

    this.eGui = document.createElement('div');
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.padding = '0 8px';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    this.selectElement = document.createElement('select');
    this.selectElement.style.width = '100%';
    this.selectElement.style.height = '32px';
    this.selectElement.style.padding = '0 8px';
    this.selectElement.style.border = '1px solid #d1d5db';
    this.selectElement.style.borderRadius = '4px';
    this.selectElement.style.fontSize = '14px';
    this.selectElement.style.backgroundColor = 'white';

    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '—';
    this.selectElement.appendChild(emptyOpt);
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      this.selectElement?.appendChild(optionEl);
    });
    this.selectElement.value = this.currentValue;
    this.selectElement.addEventListener('change', () => {
      this.currentValue = this.selectElement?.value ?? '';
      notifyDropdownChange(this.params, 'color', this.currentValue);
      this.params?.stopEditing();
    });
    this.eGui.appendChild(this.selectElement);
    setTimeout(() => this.selectElement?.focus(), 0);
  }

  getGui() {
    if (!this.eGui) this.eGui = document.createElement('div');
    return this.eGui;
  }

  getValue(): string {
    return this.selectElement?.value ?? this.currentValue;
  }

  isPopup(): boolean { return true; }
  isCancelBeforeStart() { return false; }
  isCancelAfterEnd() { return false; }
  focusIn() { this.selectElement?.focus(); }
  focusOut() {}

  afterGuiAttached() {
    if (this.selectElement) {
      this._focusHandler = () => { setTimeout(() => this.selectElement?.click(), 0); };
      this.selectElement.addEventListener('focus', this._focusHandler);
    }
  }

  destroy() {
    if (this.selectElement && this._focusHandler) {
      this.selectElement.removeEventListener('focus', this._focusHandler);
    }
    this._focusHandler = null;
    this.selectElement = null;
    this.eGui = null;
    this.params = null;
  }
}

// Build a simple select-based class editor factory (for CardSize, LabelSize, BreadcrumbSize, OrderMechanism)
function buildSelectEditor(fieldPath: string, options: Array<{ value: string; label: string }>) {
  return class SelectCellEditorImpl {
    private eGui: HTMLDivElement | null = null;
    private selectElement: HTMLSelectElement | null = null;
    private params: ICellEditorParams | null = null;
    private currentValue: string = '';
    private _focusHandler: (() => void) | null = null;

    init(params: ICellEditorParams) {
      this.params = params;
      const valueFromParams = params.value as string | undefined;
      const validValues = options.map(opt => opt.value);
      this.currentValue =
        valueFromParams === '' || (valueFromParams && validValues.includes(valueFromParams))
          ? (valueFromParams ?? '')
          : '';

      this.eGui = document.createElement('div');
      this.eGui.style.display = 'flex';
      this.eGui.style.alignItems = 'center';
      this.eGui.style.padding = '0 8px';
      this.eGui.style.height = '100%';
      this.eGui.style.width = '100%';

      this.selectElement = document.createElement('select');
      this.selectElement.style.width = '100%';
      this.selectElement.style.height = '32px';
      this.selectElement.style.padding = '0 8px';
      this.selectElement.style.border = '1px solid #d1d5db';
      this.selectElement.style.borderRadius = '4px';
      this.selectElement.style.fontSize = '14px';
      this.selectElement.style.backgroundColor = 'white';

      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '—';
      this.selectElement.appendChild(emptyOpt);
      options.forEach((option) => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        this.selectElement?.appendChild(optionEl);
      });
      this.selectElement.value = this.currentValue;
      this.selectElement.addEventListener('change', () => {
        this.currentValue = this.selectElement?.value ?? '';
        notifyDropdownChange(this.params, fieldPath, this.currentValue);
        this.params?.stopEditing();
      });
      this.eGui.appendChild(this.selectElement);
      setTimeout(() => this.selectElement?.focus(), 0);
    }

    getGui() {
      if (!this.eGui) this.eGui = document.createElement('div');
      return this.eGui;
    }

    getValue(): string { return this.selectElement?.value ?? this.currentValue; }
    isPopup(): boolean { return true; }
    isCancelBeforeStart() { return false; }
    isCancelAfterEnd() { return false; }
    focusIn() { this.selectElement?.focus(); }
    focusOut() {}

    afterGuiAttached() {
      if (this.selectElement) {
        this._focusHandler = () => { setTimeout(() => this.selectElement?.click(), 0); };
        this.selectElement.addEventListener('focus', this._focusHandler);
      }
    }

    destroy() {
      if (this.selectElement && this._focusHandler) {
        this.selectElement.removeEventListener('focus', this._focusHandler);
      }
      this._focusHandler = null;
      this.selectElement = null;
      this.eGui = null;
      this.params = null;
    }
  };
}

const OrderMechanismCellEditor = buildSelectEditor('primarySupply.orderMechanism', orderMethodOptions);
const CardSizeCellEditor = buildSelectEditor('cardSize', cardSizeOptions);
const LabelSizeCellEditor = buildSelectEditor('labelSize', labelSizeOptions);
const BreadcrumbSizeCellEditor = buildSelectEditor('breadcrumbSize', breadcrumbSizeOptions);

/**
 * Returns a simple text-based display renderer for a path, used when not editing.
 */
function simpleCellRenderer(params: any): string {
  return params.value ?? '';
}

function sizeOrColorDisplayRenderer(params: any): string {
  return params.value ?? '';
}

/**
 * Enhances editable column defs by attaching editors, valueGetters, and valueSetters.
 */
function enhanceEditableColumnDefs(
  columnDefs: ColDef<items.Item>[],
  refs: { pendingCellValuesRef: React.RefObject<Record<string, Record<string, unknown>>> }
): ColDef<items.Item>[] {
  return columnDefs.map((col) => {
    const identifier = (col.colId as string) || (col.field as string);
    if (!identifier || !EDITABLE_FIELDS.has(identifier)) return col;

    const path = identifier;

    const displayRenderer =
      path === 'cardSize' ||
      path === 'labelSize' ||
      path === 'breadcrumbSize' ||
      path === 'color'
        ? sizeOrColorDisplayRenderer
        : simpleCellRenderer;

    const cellRenderer =
      path === 'notes' || path === 'cardNotesDefault'
        ? (col.cellRenderer as ColDef<items.Item>['cellRenderer'])
        : displayRenderer;

    return {
      ...col,
      cellRenderer,
      editable: path !== 'notes' && path !== 'cardNotesDefault',
      singleClickEdit: false,
      valueGetter: (params) => {
        const d = params.data as items.Item | undefined;
        if (!d) return '';
        if (path === 'internalSKU') return d.internalSKU ?? '';
        if (path === 'generalLedgerCode') return d.generalLedgerCode ?? '';
        if (path === 'name') return d.name ?? '';
        if (path === 'primarySupply.supplier') return d.primarySupply?.supplier ?? '';
        if (path === 'primarySupply.unitCost') return d.primarySupply?.unitCost?.value != null ? String(d.primarySupply.unitCost.value) : '';
        if (path === 'minQuantityAmount') return d.minQuantity?.amount != null ? String(d.minQuantity.amount) : '';
        if (path === 'minQuantityUnit') return d.minQuantity?.unit ?? '';
        if (path === 'orderQuantityAmount') return d.primarySupply?.orderQuantity?.amount != null ? String(d.primarySupply.orderQuantity.amount) : '';
        if (path === 'orderQuantityUnit') return d.primarySupply?.orderQuantity?.unit ?? '';
        if (path === 'primarySupply.orderMechanism') {
          const value = d.primarySupply?.orderMechanism;
          const validValues = orderMethodOptions.map(opt => opt.value);
          if (!value) return '';
          return validValues.includes(value) ? value : '';
        }
        if (path === 'classification.type') return d.classification?.type ?? '';
        if (path === 'classification.subType') return d.classification?.subType ?? '';
        if (path === 'locator.location') return d.locator?.location ?? '';
        if (path === 'locator.subLocation') return d.locator?.subLocation ?? '';
        if (path === 'locator.department') return d.locator?.department ?? '';
        if (path === 'locator.facility') return d.locator?.facility ?? '';
        if (path === 'useCase') return d.useCase ?? '';
        if (path === 'notes') return d.notes ?? '';
        if (path === 'cardNotesDefault') return d.cardNotesDefault ?? '';
        if (path === 'taxable') return d.taxable ? 'true' : 'false';
        if (path === 'primarySupply.url') return d.primarySupply?.url ?? '';
        if (path === 'primarySupply.sku') return d.primarySupply?.sku ?? '';
        if (path === 'primarySupply.averageLeadTime') return d.primarySupply?.averageLeadTime?.length != null ? String(d.primarySupply.averageLeadTime.length) : '';
        if (path === 'primarySupply.orderCost') return d.primarySupply?.orderCost?.value != null ? String(d.primarySupply.orderCost.value) : '';
        if (path === 'cardSize') {
          const value = d.cardSize;
          const validValues = cardSizeOptions.map(opt => opt.value);
          if (!value) return '';
          return validValues.includes(value) ? value : '';
        }
        if (path === 'labelSize') {
          const value = d.labelSize;
          const validValues = labelSizeOptions.map(opt => opt.value);
          if (!value) return '';
          return validValues.includes(value) ? value : '';
        }
        if (path === 'breadcrumbSize') {
          const value = d.breadcrumbSize;
          const validValues = breadcrumbSizeOptions.map(opt => opt.value);
          if (!value) return '';
          return validValues.includes(value) ? value : '';
        }
        if (path === 'color') {
          const value = d.color;
          if (!value) return '';
          const validValues = COLOR_EDITOR_OPTIONS.map(opt => opt.value);
          return validValues.includes(value) ? value : '';
        }
        return '';
      },
      valueSetter: (params) => {
        const d = params.data as unknown as Record<string, unknown>;
        const v = params.newValue;
        const rowId = (params.data as items.Item)?.entityId;
        if (refs?.pendingCellValuesRef?.current && rowId) {
          if (!refs.pendingCellValuesRef.current[rowId]) refs.pendingCellValuesRef.current[rowId] = {};
          refs.pendingCellValuesRef.current[rowId][path] = v;
        }
        if (path === 'primarySupply.unitCost') {
          const n = typeof v === 'number' ? v : parseFloat(String(v));
          if (!isNaN(n)) setNested(d, path, { value: n, currency: (params.data as items.Item).primarySupply?.unitCost?.currency || 'USD' });
          return true;
        }
        if (path === 'primarySupply.orderCost') {
          const n = typeof v === 'number' ? v : parseFloat(String(v));
          if (!isNaN(n)) setNested(d, path, { value: n, currency: (params.data as items.Item).primarySupply?.orderCost?.currency || 'USD' });
          return true;
        }
        if (path === 'minQuantityAmount') {
          const item = params.data as items.Item;
          const current = item.minQuantity || { amount: 1, unit: 'each' };
          const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
          setNested(d, 'minQuantity', { ...current, amount: isNaN(n) ? 1 : n });
          return true;
        }
        if (path === 'minQuantityUnit') {
          const item = params.data as items.Item;
          const current = item.minQuantity || { amount: 1, unit: 'each' };
          setNested(d, 'minQuantity', { ...current, unit: String(v ?? '').trim() || 'each' });
          return true;
        }
        if (path === 'orderQuantityAmount') {
          const item = params.data as items.Item;
          const current = item.primarySupply?.orderQuantity || { amount: 1, unit: 'each' };
          const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
          if (!d.primarySupply) setNested(d, 'primarySupply', {});
          const supply = (d.primarySupply || {}) as Record<string, unknown>;
          (d as Record<string, unknown>).primarySupply = { ...supply, orderQuantity: { ...current, amount: isNaN(n) ? 1 : n } };
          return true;
        }
        if (path === 'orderQuantityUnit') {
          const item = params.data as items.Item;
          const current = item.primarySupply?.orderQuantity || { amount: 1, unit: 'each' };
          if (!d.primarySupply) setNested(d, 'primarySupply', {});
          const supply = (d.primarySupply || {}) as Record<string, unknown>;
          (d as Record<string, unknown>).primarySupply = { ...supply, orderQuantity: { ...current, unit: String(v ?? '').trim() || 'each' } };
          return true;
        }
        if (path === 'taxable') {
          setNested(d, path, v === 'true' || v === true || String(v).toLowerCase() === 'yes');
          return true;
        }
        if (path === 'primarySupply.averageLeadTime') {
          const n = typeof v === 'number' ? v : parseFloat(String(v));
          if (!isNaN(n)) {
            setNested(d, path, { length: n, unit: (params.data as items.Item).primarySupply?.averageLeadTime?.unit || 'HOUR' });
          }
          return true;
        }
        if (path === 'color') {
          const colorValue = String(v ?? '').trim();
          setNested(d, path, colorValue || undefined);
          return true;
        }
        if (path === 'primarySupply.orderMechanism') {
          const item = params.data as items.Item;
          const current = item.primarySupply ?? {};
          (d as Record<string, unknown>).primarySupply = {
            ...current,
            orderMechanism: (v == null || v === '') ? undefined : (String(v).trim() as items.OrderMechanism),
          };
          return true;
        }
        setNested(d, path, v == null || v === '' ? undefined : String(v).trim());
        return true;
      },
      ...(path === 'primarySupply.supplier' && { cellEditor: SupplierCellEditor }),
      ...(path === 'classification.type' && { cellEditor: TypeCellEditor }),
      ...(path === 'classification.subType' && { cellEditor: SubTypeCellEditor }),
      ...(path === 'useCase' && { cellEditor: UseCaseCellEditor }),
      ...(path === 'locator.facility' && { cellEditor: FacilityCellEditor }),
      ...(path === 'locator.department' && { cellEditor: DepartmentCellEditor }),
      ...(path === 'locator.location' && { cellEditor: LocationCellEditor }),
      ...(path === 'locator.subLocation' && { cellEditor: SublocationCellEditor }),
      ...(path === 'minQuantityUnit' && { cellEditor: UnitCellEditor }),
      ...(path === 'orderQuantityUnit' && { cellEditor: UnitCellEditor }),
      ...(path === 'primarySupply.orderMechanism' && { cellEditor: OrderMechanismCellEditor }),
      ...(path === 'color' && { cellEditor: ColorCellEditorVendored }),
      ...(path === 'cardSize' && { cellEditor: CardSizeCellEditor }),
      ...(path === 'labelSize' && { cellEditor: LabelSizeCellEditor }),
      ...(path === 'breadcrumbSize' && { cellEditor: BreadcrumbSizeCellEditor }),
    } as ColDef<items.Item>;
  });
}

function buildGridStateFromStorage(raw: string): GridState | undefined {
  type LegacyCol = { colId?: string; width?: number | null; sort?: string | null };
  try {
    const saved = JSON.parse(raw) as Record<string, unknown>;

    if (Array.isArray(saved)) {
      const cols = saved as unknown as LegacyCol[];
      const orderedColIds = cols.map((c) => c.colId).filter((id): id is string => Boolean(id));
      const columnSizingModel = cols.filter((c) => c.colId && c.width != null).map((c) => ({ colId: c.colId as string, width: c.width as number }));
      const sortItems = cols.filter((c) => c.colId && (c.sort === 'asc' || c.sort === 'desc')).map((c) => ({ colId: c.colId as string, sort: c.sort as 'asc' | 'desc' }));
      const result: GridState = { partialColumnState: true };
      if (orderedColIds.length > 0) result.columnOrder = { orderedColIds };
      if (columnSizingModel.length > 0) result.columnSizing = { columnSizingModel };
      if (sortItems.length > 0) result.sort = { sortModel: sortItems };
      return result;
    }

    if (saved.columnSizing !== undefined || saved.columnOrder !== undefined || saved.sort !== undefined || saved.version !== undefined) {
      const { columnVisibility: _cv, ...rest } = saved as any;
      return rest as GridState;
    }

    if (Array.isArray(saved.columnState)) {
      const cols = saved.columnState as LegacyCol[];
      const orderedColIds = cols.map((c) => c.colId).filter((id): id is string => Boolean(id));
      const columnSizingModel = cols.filter((c) => c.colId && c.width != null).map((c) => ({ colId: c.colId as string, width: c.width as number }));
      const sortItems = cols.filter((c) => c.colId && (c.sort === 'asc' || c.sort === 'desc')).map((c) => ({ colId: c.colId as string, sort: c.sort as 'asc' | 'desc' }));
      const result: GridState = { partialColumnState: true };
      if (orderedColIds.length > 0) result.columnOrder = { orderedColIds };
      if (columnSizingModel.length > 0) result.columnSizing = { columnSizingModel };
      if (sortItems.length > 0) result.sort = { sortModel: sortItems };
      return result;
    }
  } catch {
    // Ignore malformed data
  }
  return undefined;
}

export const ItemTableAGGrid = forwardRef<ItemTableAGGridRef, Props>(function ItemTableAGGrid({
  items: itemsData,
  activeTab,
  columnVisibility = {},
  onRowClick,
  onSelectionChange,
  onColumnVisibilityChange,
  totalSelectedCount,
  maxItemsSeen,
  paginationData,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  isLoading = false,
  itemCardsMap = {},
  refreshCardsForItem = async () => {},
  ensureCardsForItem = async () => {},
  emptyStateComponent,
  hasActiveSearch = false,
  enableCellEditing = true,
  onRefreshRequested,
  onAuthError,
  onUnsavedChangesChange,
  isUnsavedModalOpen = false,
  onOpenItemDetails,
}: Props, ref) {
  // DataGrid ref — canary DataGrid uses DataGridRef<T>
  const gridRef = useRef<DataGridRef<items.Item>>(null);
  const prevItemsRef = useRef<items.Item[]>([]);
  const lastSelectedRowIndexRef = useRef<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<items.Item[]>([]);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const persistentSelectionRef = useRef<Set<string>>(new Set());
  const isRestoringSelectionRef = useRef<boolean>(false);

  const draftsMapRef = useRef<Record<string, { draftEntityId: string }>>({});
  const draftPromisesMapRef = useRef<Record<string, Promise<string>>>({});
  const dirtyRowIdsRef = useRef<Set<string>>(new Set());
  const publishingRowsRef = useRef<Set<string>>(new Set());
  const editingRowIdRef = useRef<string | null>(null);
  const isAnyCellEditingRef = useRef(false);
  const rowClickCountRef = useRef(0);
  const lastClickedRowIdRef = useRef<string | null>(null);
  const CLICKS_TO_OPEN_PANEL = 3;
  const pendingCellValuesRef = useRef<Record<string, Record<string, unknown>>>({});
  const dropdownValuesByRowRef = useRef<Record<string, Record<string, string>>>({});
  const skipPublishRowIdRef = useRef<string | null>(null);
  const [rowState, setRowState] = useState<Record<string, { saving?: boolean; error?: boolean }>>({});

  const getOrCreateDraft = useCallback(
    async (rowId: string): Promise<string> => {
      if (draftsMapRef.current[rowId]) return draftsMapRef.current[rowId].draftEntityId;
      if (draftPromisesMapRef.current[rowId]) return draftPromisesMapRef.current[rowId];

      const item = itemsData.find((i) => i.entityId === rowId);
      if (!item) throw new Error(`Item not found: ${rowId}`);

      const promise = (async () => {
        const jwtToken = localStorage.getItem('idToken');
        if (!jwtToken) throw new Error('No auth token');
        const draft = await createDraftItem(item.entityId, jwtToken);
        const draftId = draft.data?.entityId;
        if (!draftId) throw new Error('No draft entity ID');
        draftsMapRef.current[rowId] = { draftEntityId: draftId };
        return draftId;
      })();

      draftPromisesMapRef.current[rowId] = promise;
      return promise;
    },
    [itemsData]
  );

  const publishRow = useCallback(
    async (rowId: string, opts?: { skipRefresh?: boolean }) => {
      if (publishingRowsRef.current.has(rowId)) return;
      publishingRowsRef.current.add(rowId);

      const item = itemsData.find((i) => i.entityId === rowId);
      if (!item) {
        publishingRowsRef.current.delete(rowId);
        return;
      }

      setRowState((prev) => ({ ...prev, [rowId]: { saving: true } }));

      try {
        const draftId = await getOrCreateDraft(rowId);
        const jwtToken = localStorage.getItem('idToken');
        if (!jwtToken) throw new Error('No auth token');
        await updateItem(draftId, item, jwtToken);
        dirtyRowIdsRef.current.delete(rowId);
        delete draftsMapRef.current[rowId];
        delete draftPromisesMapRef.current[rowId];
        if (pendingCellValuesRef.current[rowId]) delete pendingCellValuesRef.current[rowId];
        setRowState((prev) => ({ ...prev, [rowId]: {} }));
        onUnsavedChangesChange?.(dirtyRowIdsRef.current.size > 0);
        if (!opts?.skipRefresh) await onRefreshRequested?.();
      } catch (err) {
        console.error(`Failed to publish row ${rowId}:`, err);
        setRowState((prev) => ({ ...prev, [rowId]: { error: true } }));
        if (isAuthenticationError(err)) onAuthError?.(err);
      } finally {
        publishingRowsRef.current.delete(rowId);
      }
    },
    [itemsData, getOrCreateDraft, onUnsavedChangesChange, onRefreshRequested, onAuthError]
  );

  const handleSelectionChanged = useCallback(
    (selectedRows: items.Item[]) => {
      if (isRestoringSelectionRef.current) return;

      const api = gridRef.current?.getGridApi?.();
      if (!api) return;

      const currentSelectedIds = new Set(selectedRows.map((item) => item.entityId).filter(Boolean));
      const allItemsInGrid = api.getRenderedNodes().map((node) => node.data as items.Item);
      const allItemIds = new Set(allItemsInGrid.map((item) => item.entityId).filter(Boolean));

      allItemIds.forEach((entityId) => {
        if (currentSelectedIds.has(entityId)) {
          persistentSelectionRef.current.add(entityId);
        } else {
          persistentSelectionRef.current.delete(entityId);
        }
      });

      setSelectedRows(selectedRows);
      const allSelectedItemsFromPersistent: items.Item[] = [];
      persistentSelectionRef.current.forEach((entityId) => {
        const item = itemsData.find((i) => i.entityId === entityId);
        if (item) allSelectedItemsFromPersistent.push(item);
      });
      onSelectionChange?.(allSelectedItemsFromPersistent);
    },
    [onSelectionChange, itemsData]
  );

  const handleRowClick = useCallback(
    (item: items.Item) => {
      const id = item?.entityId;
      if (!id) return;

      const prev = editingRowIdRef.current;
      if (prev && prev !== id) {
        const api = gridRef.current?.getGridApi?.();
        api?.stopEditing(false);
        const rowToPublish = prev;
        setTimeout(() => {
          if (dirtyRowIdsRef.current.has(rowToPublish) && !isUnsavedModalOpen) void publishRow(rowToPublish);
          editingRowIdRef.current = id;
        }, 200);
        rowClickCountRef.current = 0;
        lastClickedRowIdRef.current = null;
        return;
      }

      if (isAnyCellEditingRef.current) return;
      const api = gridRef.current?.getGridApi?.();
      const editingCells = api?.getEditingCells?.() ?? [];
      if (editingCells.length > 0) return;

      if (prev !== id) editingRowIdRef.current = id;

      if (lastClickedRowIdRef.current !== id) {
        rowClickCountRef.current = 0;
        lastClickedRowIdRef.current = id;
      }
      rowClickCountRef.current += 1;
      if (rowClickCountRef.current >= CLICKS_TO_OPEN_PANEL) {
        rowClickCountRef.current = 0;
        lastClickedRowIdRef.current = null;
        editingRowIdRef.current = null;
        (onOpenItemDetails ?? onRowClick)?.(item);
      }
    },
    [publishRow, onOpenItemDetails, onRowClick, isUnsavedModalOpen]
  );

  const handleCellValueChanged = useCallback(
    (event: any) => {
      if (event.oldValue === event.newValue) return;
      const rowId = (event.data?.entityId || event.node?.data?.entityId) as string | undefined;
      if (!rowId) return;
      const colId = event.column?.getColId?.();
      if (colId) {
        const fieldPath = (event.column?.getColDef?.()?.field as string) || colId;
        if (!pendingCellValuesRef.current[rowId]) pendingCellValuesRef.current[rowId] = {};
        pendingCellValuesRef.current[rowId][fieldPath] = event.newValue;
      }
      dirtyRowIdsRef.current.add(rowId);
      onUnsavedChangesChange?.(true);
    },
    [onUnsavedChangesChange]
  );

  const getRowClass = useCallback(
    (params: { data?: items.Item }) => {
      const id = params.data?.entityId;
      if (!id) return [];
      const s = rowState[id];
      if (s?.saving) return ['ag-row-saving'];
      if (s?.error) return ['ag-row-error'];
      return [];
    },
    [rowState]
  );

  const onNotesSave = useCallback(
    (item: items.Item, notes: string) => {
      item.notes = notes;
      const rowId = item.entityId;
      if (rowId) {
        dirtyRowIdsRef.current.add(rowId);
        onUnsavedChangesChange?.(true);
        const api = gridRef.current?.getGridApi?.();
        if (api) api.refreshCells({ columns: ['notes'], force: true });
      }
    },
    [onUnsavedChangesChange]
  );

  const onCardNotesSave = useCallback(
    (item: items.Item, notes: string) => {
      item.cardNotesDefault = notes;
      const rowId = item.entityId;
      if (rowId) {
        dirtyRowIdsRef.current.add(rowId);
        onUnsavedChangesChange?.(true);
        const api = gridRef.current?.getGridApi?.();
        if (api) api.refreshCells({ columns: ['cardNotesDefault'], force: true });
      }
    },
    [onUnsavedChangesChange]
  );

  const gridContext = useMemo(
    () => ({
      onNotesSave,
      onCardNotesSave,
      lastSelectedRowIndexRef,
      setDropdownValueForRow: (rowId: string, fieldPath: string, value: string) => {
        if (!dropdownValuesByRowRef.current[rowId]) dropdownValuesByRowRef.current[rowId] = {};
        dropdownValuesByRowRef.current[rowId][fieldPath] = value;
      },
    }),
    [onNotesSave, onCardNotesSave]
  );

  useImperativeHandle(
    ref,
    () => ({
      saveAllDrafts: async () => {
        const ids = Array.from(dirtyRowIdsRef.current);
        const processedIds = new Set<string>();
        for (const rowId of ids) {
          if (processedIds.has(rowId)) continue;
          processedIds.add(rowId);
          try {
            await publishRow(rowId, { skipRefresh: true });
          } catch (err) {
            console.error(`[saveAllDrafts] Error publishing row ${rowId}:`, err);
          }
        }
        if (ids.length > 0) await onRefreshRequested?.();
      },
      getHasUnsavedChanges: () => dirtyRowIdsRef.current.size > 0,
      discardAllDrafts: () => {
        dirtyRowIdsRef.current.clear();
        onUnsavedChangesChange?.(false);
      },
      getDisplayedItems: (): items.Item[] => {
        const api = gridRef.current?.getGridApi?.();
        if (!api) return [];
        const count = api.getDisplayedRowCount();
        const result: items.Item[] = [];
        for (let i = 0; i < count; i++) {
          const node = api.getDisplayedRowAtIndex(i);
          const data = node?.data;
          if (data) result.push(data as items.Item);
        }
        return result;
      },
    }),
    [publishRow, onUnsavedChangesChange, onRefreshRequested]
  );

  const baseColumnDefs = itemsColumnDefs.map((col) => ({
    ...col,
    suppressMovable: false,
  }));

  const orderedColumnDefs = useMemo(
    () => {
      try {
        const savedState = localStorage.getItem(`items-grid-${activeTab}`);
        if (savedState) {
          const persistedState = JSON.parse(savedState);
          let persistedOrder: string[] = [];
          if (Array.isArray(persistedState)) {
            persistedOrder = persistedState.map((col: { colId?: string }) => col.colId).filter((id: string | undefined): id is string => !!id);
          } else if (persistedState.columnState && Array.isArray(persistedState.columnState)) {
            persistedOrder = persistedState.columnState.map((col: { colId?: string }) => col.colId).filter((id: string | undefined): id is string => !!id);
          } else if (persistedState.columnOrder && Array.isArray(persistedState.columnOrder.orderedColIds)) {
            persistedOrder = (persistedState.columnOrder.orderedColIds as unknown[]).filter((id): id is string => typeof id === 'string' && !!id);
          }
          if (persistedOrder.length > 0) {
            const colMap = new Map<string, ColDef<items.Item>>();
            baseColumnDefs.forEach((col) => {
              const id = (col.colId as string) || (col.field as string);
              if (id) colMap.set(id, col);
            });
            const ordered: ColDef<items.Item>[] = [];
            const added = new Set<string>();
            persistedOrder.forEach((colId) => {
              const col = colMap.get(colId);
              if (col) {
                ordered.push(col);
                added.add(colId);
              }
            });
            baseColumnDefs.forEach((col) => {
              const id = (col.colId as string) || (col.field as string);
              if (id && !added.has(id)) ordered.push(col);
            });
            return ordered;
          }
        }
      } catch {
        // fall back
      }
      return baseColumnDefs;
    },
    [activeTab] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const filteredColumnDefs = useMemo(
    () =>
      enableCellEditing
        ? enhanceEditableColumnDefs(orderedColumnDefs, { pendingCellValuesRef })
        : orderedColumnDefs,
    [enableCellEditing, orderedColumnDefs]
  );

  const initialGridState = useMemo(() => {
    try {
      const savedState = localStorage.getItem(`items-grid-${activeTab}`);
      if (savedState) return buildGridStateFromStorage(savedState);
    } catch { /* ignore */ }
    return undefined;
  }, [activeTab]);

  const gridOptionsWithPersistence = useMemo(() => ({
    context: gridContext,
    getRowClass,
    popupParent: typeof document !== 'undefined' ? document.body : undefined,
    stopEditingWhenCellsLoseFocus: true,
  }), [gridContext, getRowClass]);

  return (
    <ItemCardsContext.Provider
      value={{ itemCardsMap, refreshCardsForItem, ensureCardsForItem, onOpenItemDetails }}
    >
      <div
        className='h-full flex flex-col min-h-0'
        style={{ visibility: isGridVisible ? 'visible' : 'hidden' }}
      >
        {/* Grid with integrated pagination — canary DataGrid */}
        <DataGrid
          ref={gridRef}
          rowData={itemsData}
          columnDefs={filteredColumnDefs}
          defaultColDef={{
            ...itemsDefaultColDef,
            suppressMovable: false,
          }}
          loading={isLoading}
          enableRowSelection={true}
          enableMultiRowSelection={true}
          onSelectionChanged={handleSelectionChanged}
          selectedItems={selectedRows}
          onRowClicked={(event: any) => handleRowClick(event.data)}
          enableCellEditing={enableCellEditing}
          onCellValueChanged={handleCellValueChanged}
          paginationData={paginationData}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          onFirstPage={onFirstPage}
          onGridReady={(params: any) => {
            // Reveal grid on ready
            setIsGridVisible(true);
          }}
          emptyStateComponent={emptyStateComponent}
          className='h-full'
        />
      </div>
    </ItemCardsContext.Provider>
  );
});
