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
import {
  ArdaGrid,
  ArdaGridRef,
  itemsColumnDefs,
  itemsDefaultColDef,
} from '@frontend/components/table';
import * as items from '@frontend/types/items';
import type { KanbanCardResult } from '@frontend/types/kanban';
import { createDraftItem, updateItem } from '@frontend/lib/ardaClient';
import { toast } from 'sonner';
import { isAuthenticationError } from '@frontend/lib/utils';
import { ChevronDown } from 'lucide-react';
import { orderMethodOptions, cardSizeOptions, labelSizeOptions, breadcrumbSizeOptions } from '@frontend/constants/constants';
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
  columnOrder?: string[]; // order keys from View -> fields mapping
  onRowClick?: (item: items.Item) => void;
  onSelectionChange?: (selectedItems: items.Item[]) => void;
  onColumnVisibilityChange?: (
    columnVisibility: Record<string, boolean>
  ) => void;
  totalSelectedCount?: number; // Total count of selected items across all pages
  maxItemsSeen?: number; // Maximum number of items seen across all pages (for accumulated range display)
  // Server-side pagination props - using cursor-based pagination
  paginationData?: {
    currentIndex?: number; // Optional for backward compatibility
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
  itemCardsMap?: Record<string, KanbanCardResult[]>; // Map of item eid to cards array
  refreshCardsForItem?: (itemEntityId: string) => Promise<void>; // Function to refresh cards for a specific item
  ensureCardsForItem?: (itemEntityId: string) => Promise<void>; // Function to lazily load cards for a specific item
  emptyStateComponent?: React.ReactNode;
  hasActiveSearch?: boolean;
  // In-table cell editing (draft → publish)
  enableCellEditing?: boolean;
  onRefreshRequested?: () => void | Promise<void>;
  onAuthError?: (err: unknown) => void;
  onUnsavedChangesChange?: (has: boolean) => void;
  /** When true, do not auto-publish on row/field change (e.g. while unsaved-changes modal is open). Avoids "Cannot update without a draft" when user continues editing. */
  isUnsavedModalOpen?: boolean;
  /** Open the item details panel. Single-click on a row opens it; double-click on a cell edits that field. */
  onOpenItemDetails?: (item: items.Item) => void;
};

export interface ItemTableAGGridRef {
  saveAllDrafts: () => Promise<void>;
  getHasUnsavedChanges: () => boolean;
  discardAllDrafts: () => void;
  /** Items in the order they are displayed in the grid (respects sort/filter). */
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

// Color options for the color editor - must match exactly the values in input-wrapper.tsx
// These are the same colors available in the ItemFormPanel
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

// Custom cell editor for color field
// Shows a dropdown with color options
class ColorCellEditor {
  private eGui: HTMLDivElement | null = null;
  private selectElement: HTMLSelectElement | null = null;
  private params: ICellEditorParams | null = null;
  private currentValue: string = '';
  private _focusHandler: (() => void) | null = null;

  init(params: ICellEditorParams) {
    this.params = params;
    
    // Get the value from params.value (which comes from valueGetter)
    // This ensures we use the same value that AG Grid is using
    const valueFromParams = params.value as string | undefined;
    
    const options = COLOR_EDITOR_OPTIONS.map(opt => ({
      value: opt.value,
      label: opt.name,
    }));
    const validValues = options.map(opt => opt.value);
    this.currentValue =
      valueFromParams === '' || (valueFromParams && validValues.includes(valueFromParams))
        ? (valueFromParams ?? '')
        : '';

    // Create container
    this.eGui = document.createElement('div');
    this.eGui.className = 'flex items-center gap-2 h-full w-full px-2';
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.gap = '8px';
    this.eGui.style.padding = '0 8px';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    // Create select dropdown
    this.selectElement = document.createElement('select');
    this.selectElement.className = 'w-full h-8 px-2 border border-gray-300 rounded text-sm';
    this.selectElement.style.width = '100%';
    this.selectElement.style.height = '32px';
    this.selectElement.style.padding = '0 8px';
    this.selectElement.style.border = '1px solid #d1d5db';
    this.selectElement.style.borderRadius = '4px';
    this.selectElement.style.fontSize = '14px';
    this.selectElement.style.backgroundColor = 'white';
    this.selectElement.style.cursor = 'pointer';
    
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '—';
    this.selectElement?.appendChild(emptyOpt);
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
    });
    this.eGui.appendChild(this.selectElement);

    // Commit the value and stop editing when the user selects an option.
    // Without this, popupParent:document.body causes the OS dropdown to blur
    // the cell before the value is committed (stopEditingWhenCellsLoseFocus fires early).
    this.selectElement.addEventListener('change', () => {
      if (this.selectElement) {
        this.currentValue = this.selectElement.value;
      }
      this.params?.stopEditing();
    });

    setTimeout(() => {
      this.selectElement?.focus();
    }, 0);
  }

  getGui() {
    if (!this.eGui) {
      this.eGui = document.createElement('div');
    }
    return this.eGui;
  }

  getValue(): string {
    return this.selectElement?.value ?? this.currentValue;
  }

  isPopup(): boolean {
    return true;
  }

  isCancelBeforeStart() {
    return false;
  }

  isCancelAfterEnd() {
    return false;
  }

  focusIn() {
    this.selectElement?.focus();
  }

  focusOut() {}

  afterGuiAttached() {
    if (this.selectElement) {
      this._focusHandler = () => {
        setTimeout(() => { this.selectElement?.click(); }, 0);
      };
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

// Custom cell editor for order mechanism field
class OrderMechanismCellEditor {
  private eGui: HTMLDivElement | null = null;
  private selectElement: HTMLSelectElement | null = null;
  private params: ICellEditorParams | null = null;
  private currentValue: string = '';
  private _focusHandler: (() => void) | null = null;

  init(params: ICellEditorParams) {
    this.params = params;
    
    // Get the value from params.value (which comes from valueGetter)
    // This ensures we use the same value that AG Grid is using
    const valueFromParams = params.value as string | undefined;
    
    const options = orderMethodOptions;
    const validValues = options.map(opt => opt.value);
    this.currentValue =
      valueFromParams === '' || (valueFromParams && validValues.includes(valueFromParams))
        ? (valueFromParams ?? '')
        : '';

    this.eGui = document.createElement('div');
    this.eGui.className = 'flex items-center gap-2 h-full w-full px-2';
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.gap = '8px';
    this.eGui.style.padding = '0 8px';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    this.selectElement = document.createElement('select');
    this.selectElement.className = 'w-full h-8 px-2 border border-gray-300 rounded text-sm';
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '—';
    this.selectElement?.appendChild(emptyOpt);
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      this.selectElement?.appendChild(optionEl);
    });

    this.selectElement.value = this.currentValue;
    this.selectElement.addEventListener('change', () => {
      this.currentValue = this.selectElement?.value ?? '';
      notifyDropdownChange(this.params, 'primarySupply.orderMechanism', this.currentValue);
    });
    this.eGui.appendChild(this.selectElement);

    this.selectElement.addEventListener('change', () => {
      if (this.selectElement) {
        this.currentValue = this.selectElement.value;
      }
      this.params?.stopEditing();
    });

    setTimeout(() => {
      this.selectElement?.focus();
    }, 0);
  }

  getGui() {
    if (!this.eGui) {
      this.eGui = document.createElement('div');
    }
    return this.eGui;
  }

  getValue(): string {
    return this.selectElement?.value ?? this.currentValue;
  }

  isPopup(): boolean {
    return true;
  }

  isCancelBeforeStart() {
    return false;
  }

  isCancelAfterEnd() {
    return false;
  }

  focusIn() {
    this.selectElement?.focus();
  }

  focusOut() {}

  afterGuiAttached() {
    if (this.selectElement) {
      this._focusHandler = () => {
        setTimeout(() => { this.selectElement?.click(); }, 0);
      };
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

function notifyDropdownChange(params: ICellEditorParams | null, fieldPath: string, value: string): void {
  const rowId = (params?.data as { entityId?: string })?.entityId;
  const setDropdown = (params?.context as { setDropdownValueForRow?: (id: string, path: string, v: string) => void })?.setDropdownValueForRow;
  if (rowId && setDropdown) setDropdown(rowId, fieldPath, value);
}

// Custom cell editor for card size field
class CardSizeCellEditor {
  private eGui: HTMLDivElement | null = null;
  private selectElement: HTMLSelectElement | null = null;
  private params: ICellEditorParams | null = null;
  private currentValue: string = '';
  private _focusHandler: (() => void) | null = null;

  init(params: ICellEditorParams) {
    this.params = params;
    
    // Get the value from params.value (which comes from valueGetter)
    // This ensures we use the same value that AG Grid is using
    const valueFromParams = params.value as string | undefined;
    
    const options = cardSizeOptions;
    const validValues = options.map(opt => opt.value);
    this.currentValue =
      valueFromParams === '' || (valueFromParams && validValues.includes(valueFromParams))
        ? (valueFromParams ?? '')
        : '';

    // Create container
    this.eGui = document.createElement('div');
    this.eGui.className = 'flex items-center gap-2 h-full w-full px-2';
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.gap = '8px';
    this.eGui.style.padding = '0 8px';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    // Create select dropdown
    this.selectElement = document.createElement('select');
    this.selectElement.className = 'w-full h-8 px-2 border border-gray-300 rounded text-sm';
    this.selectElement.style.width = '100%';
    this.selectElement.style.height = '32px';
    this.selectElement.style.padding = '0 8px';
    this.selectElement.style.border = '1px solid #d1d5db';
    this.selectElement.style.borderRadius = '4px';
    this.selectElement.style.fontSize = '14px';
    this.selectElement.style.backgroundColor = 'white';
    this.selectElement.style.cursor = 'pointer';
    
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '—';
    this.selectElement?.appendChild(emptyOpt);
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      this.selectElement?.appendChild(optionEl);
    });
    this.selectElement.value = this.currentValue;
    this.selectElement.addEventListener('change', () => {
      this.currentValue = this.selectElement?.value ?? '';
      notifyDropdownChange(this.params, 'cardSize', this.currentValue);
    });
    this.eGui.appendChild(this.selectElement);

    this.selectElement.addEventListener('change', () => {
      if (this.selectElement) {
        this.currentValue = this.selectElement.value;
      }
      this.params?.stopEditing();
    });

    setTimeout(() => {
      this.selectElement?.focus();
    }, 0);
  }

  getGui() {
    if (!this.eGui) {
      this.eGui = document.createElement('div');
    }
    return this.eGui;
  }

  getValue(): string {
    return this.selectElement?.value ?? this.currentValue;
  }

  isPopup(): boolean {
    return true;
  }

  isCancelBeforeStart() {
    return false;
  }

  isCancelAfterEnd() {
    return false;
  }

  focusIn() {
    this.selectElement?.focus();
  }

  focusOut() {}

  afterGuiAttached() {
    if (this.selectElement) {
      this._focusHandler = () => {
        setTimeout(() => { this.selectElement?.click(); }, 0);
      };
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

// Custom cell editor for label size field
class LabelSizeCellEditor {
  private eGui: HTMLDivElement | null = null;
  private selectElement: HTMLSelectElement | null = null;
  private params: ICellEditorParams | null = null;
  private currentValue: string = '';
  private _focusHandler: (() => void) | null = null;

  init(params: ICellEditorParams) {
    this.params = params;
    
    // Get the value from params.value (which comes from valueGetter)
    // This ensures we use the same value that AG Grid is using
    const valueFromParams = params.value as string | undefined;
    
    const options = labelSizeOptions;
    const validValues = options.map(opt => opt.value);
    this.currentValue =
      valueFromParams === '' || (valueFromParams && validValues.includes(valueFromParams))
        ? (valueFromParams ?? '')
        : '';

    // Create container
    this.eGui = document.createElement('div');
    this.eGui.className = 'flex items-center gap-2 h-full w-full px-2';
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.gap = '8px';
    this.eGui.style.padding = '0 8px';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    // Create select dropdown
    this.selectElement = document.createElement('select');
    this.selectElement.className = 'w-full h-8 px-2 border border-gray-300 rounded text-sm';
    this.selectElement.style.width = '100%';
    this.selectElement.style.height = '32px';
    this.selectElement.style.padding = '0 8px';
    this.selectElement.style.border = '1px solid #d1d5db';
    this.selectElement.style.borderRadius = '4px';
    this.selectElement.style.fontSize = '14px';
    this.selectElement.style.backgroundColor = 'white';
    this.selectElement.style.cursor = 'pointer';
    
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '—';
    this.selectElement?.appendChild(emptyOpt);
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      this.selectElement?.appendChild(optionEl);
    });
    this.selectElement.value = this.currentValue;
    this.selectElement.addEventListener('change', () => {
      this.currentValue = this.selectElement?.value ?? '';
      notifyDropdownChange(this.params, 'labelSize', this.currentValue);
    });
    this.eGui.appendChild(this.selectElement);

    this.selectElement.addEventListener('change', () => {
      if (this.selectElement) {
        this.currentValue = this.selectElement.value;
      }
      this.params?.stopEditing();
    });

    setTimeout(() => {
      this.selectElement?.focus();
    }, 0);
  }

  getGui() {
    if (!this.eGui) {
      this.eGui = document.createElement('div');
    }
    return this.eGui;
  }

  getValue(): string {
    return this.selectElement?.value ?? this.currentValue;
  }

  isPopup(): boolean {
    return true;
  }

  isCancelBeforeStart() {
    return false;
  }

  isCancelAfterEnd() {
    return false;
  }

  focusIn() {
    this.selectElement?.focus();
  }

  focusOut() {}

  afterGuiAttached() {
    if (this.selectElement) {
      this._focusHandler = () => {
        setTimeout(() => { this.selectElement?.click(); }, 0);
      };
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

// Custom cell editor for breadcrumb size field
class BreadcrumbSizeCellEditor {
  private eGui: HTMLDivElement | null = null;
  private selectElement: HTMLSelectElement | null = null;
  private params: ICellEditorParams | null = null;
  private currentValue: string = '';
  private _focusHandler: (() => void) | null = null;

  init(params: ICellEditorParams) {
    this.params = params;
    
    // Get the value from params.value (which comes from valueGetter)
    // This ensures we use the same value that AG Grid is using
    const valueFromParams = params.value as string | undefined;
    
    const options = breadcrumbSizeOptions;
    const validValues = options.map(opt => opt.value);
    this.currentValue =
      valueFromParams === '' || (valueFromParams && validValues.includes(valueFromParams))
        ? (valueFromParams ?? '')
        : '';

    // Create container
    this.eGui = document.createElement('div');
    this.eGui.className = 'flex items-center gap-2 h-full w-full px-2';
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.gap = '8px';
    this.eGui.style.padding = '0 8px';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    this.selectElement = document.createElement('select');
    this.selectElement.className = 'w-full h-8 px-2 border border-gray-300 rounded text-sm';
    this.selectElement.style.width = '100%';
    this.selectElement.style.height = '32px';
    this.selectElement.style.padding = '0 8px';
    this.selectElement.style.border = '1px solid #d1d5db';
    this.selectElement.style.borderRadius = '4px';
    this.selectElement.style.fontSize = '14px';
    this.selectElement.style.backgroundColor = 'white';
    this.selectElement.style.cursor = 'pointer';

    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '—';
    this.selectElement?.appendChild(emptyOpt);
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      this.selectElement?.appendChild(optionEl);
    });
    this.selectElement.value = this.currentValue;
    this.selectElement.addEventListener('change', () => {
      this.currentValue = this.selectElement?.value ?? '';
      notifyDropdownChange(this.params, 'breadcrumbSize', this.currentValue);
    });
    this.eGui.appendChild(this.selectElement);

    // Commit the value and stop editing when the user selects an option.
    // Without this, popupParent:document.body causes the OS dropdown to blur
    // the cell before the value is committed (stopEditingWhenCellsLoseFocus fires early).
    this.selectElement.addEventListener('change', () => {
      if (this.selectElement) {
        this.currentValue = this.selectElement.value;
      }
      this.params?.stopEditing();
    });

    setTimeout(() => {
      this.selectElement?.focus();
    }, 0);
  }

  getGui() {
    if (!this.eGui) {
      this.eGui = document.createElement('div');
    }
    return this.eGui;
  }

  getValue(): string {
    return this.selectElement?.value ?? this.currentValue;
  }

  isPopup(): boolean {
    return true;
  }

  isCancelBeforeStart() {
    return false;
  }

  isCancelAfterEnd() {
    return false;
  }

  focusIn() {
    this.selectElement?.focus();
  }

  focusOut() {}

  afterGuiAttached() {
    if (this.selectElement) {
      this._focusHandler = () => {
        setTimeout(() => { this.selectElement?.click(); }, 0);
      };
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

type PendingCellValuesRef = React.MutableRefObject<Record<string, Record<string, unknown>>>;

function enhanceEditableColumnDefs(
  defs: ColDef<items.Item>[],
  refs?: { pendingCellValuesRef: PendingCellValuesRef }
): ColDef<items.Item>[] {
  return defs.map((col) => {
    const key = (col.colId as string) || (col.field as string);
    if (!key || !EDITABLE_FIELDS.has(key)) return col;

    const path = key;

    const simpleCellRenderer = (params: { value?: unknown }) => {
      const value = params.value ?? '';
      return value ? <span className='text-black'>{String(value)}</span> : '-';
    };

    const dropdownLabelWithArrow = (
      params: { value?: unknown; api?: { startEditingCell: (p: { rowIndex: number; colKey: string }) => void }; node?: { rowIndex: number }; column?: { getColId: () => string } },
      label: string
    ) => {
      const onArrowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const api = params.api;
        const node = params.node;
        const column = params.column;
        if (api && node != null && column) {
          api.startEditingCell({
            rowIndex: node.rowIndex,
            colKey: column.getColId(),
          });
        }
      };
      return (
        <div className='cell-dropdown-display'>
          <span>{label}</span>
          <button
            type='button'
            onClick={onArrowClick}
            onMouseDown={(e) => e.stopPropagation()}
            title='Open dropdown'
          >
            <ChevronDown className='w-4 h-4' />
          </button>
        </div>
      );
    };

    const sizeOrColorDisplayRenderer = (
      params: { value?: unknown; api?: { startEditingCell: (p: { rowIndex: number; colKey: string }) => void }; node?: { rowIndex: number }; column?: { getColId: () => string } }
    ) => {
      const value = String(params.value ?? '').trim();
      if (!value) return <span className='text-black'>-</span>;
      if (path === 'primarySupply.orderMechanism') {
        const label = orderMethodOptions.find((o) => o.value === value)?.label ?? value;
        return dropdownLabelWithArrow(params, label);
      }
      if (path === 'cardSize') {
        const label = cardSizeOptions.find((o) => o.value === value)?.label ?? value;
        return dropdownLabelWithArrow(params, label);
      }
      if (path === 'labelSize') {
        const label = labelSizeOptions.find((o) => o.value === value)?.label ?? value;
        return dropdownLabelWithArrow(params, label);
      }
      if (path === 'breadcrumbSize') {
        const label = breadcrumbSizeOptions.find((o) => o.value === value)?.label ?? value;
        return dropdownLabelWithArrow(params, label);
      }
      if (path === 'color') {
        const label = COLOR_EDITOR_OPTIONS.find((o) => o.value === value)?.name ?? value;
        return dropdownLabelWithArrow(params, label);
      }
      return simpleCellRenderer(params);
    };

    const displayRenderer =
      path === 'primarySupply.orderMechanism' ||
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
        // Quantity columns (amount and unit as separate editable fields)
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
        // Quantity columns: update amount or unit within the quantity object
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
      ...(path === 'primarySupply.supplier' && {
        cellEditor: SupplierCellEditor,
      }),
      ...(path === 'classification.type' && {
        cellEditor: TypeCellEditor,
      }),
      ...(path === 'classification.subType' && {
        cellEditor: SubTypeCellEditor,
      }),
      ...(path === 'useCase' && {
        cellEditor: UseCaseCellEditor,
      }),
      ...(path === 'locator.facility' && {
        cellEditor: FacilityCellEditor,
      }),
      ...(path === 'locator.department' && {
        cellEditor: DepartmentCellEditor,
      }),
      ...(path === 'locator.location' && {
        cellEditor: LocationCellEditor,
      }),
      ...(path === 'locator.subLocation' && {
        cellEditor: SublocationCellEditor,
      }),
      ...(path === 'minQuantityUnit' && {
        cellEditor: UnitCellEditor,
      }),
      ...(path === 'orderQuantityUnit' && {
        cellEditor: UnitCellEditor,
      }),
      ...(path === 'primarySupply.orderMechanism' && {
        cellEditor: OrderMechanismCellEditor,
      }),
      ...(path === 'color' && {
        cellEditor: ColorCellEditor,
      }),
      ...(path === 'cardSize' && {
        cellEditor: CardSizeCellEditor,
      }),
      ...(path === 'labelSize' && {
        cellEditor: LabelSizeCellEditor,
      }),
      ...(path === 'breadcrumbSize' && {
        cellEditor: BreadcrumbSizeCellEditor,
      }),
    } as ColDef<items.Item>;
  });
}

/**
 * Converts the raw localStorage value for a grid tab into an AG Grid GridState
 * suitable for `gridOptions.initialState`.
 *
 * Handles two on-disk formats:
 *  - New: the object returned by `api.getState()` — detected by presence of
 *         `columnSizing`, `columnOrder`, `sort`, or `version` keys.
 *  - Legacy: `{ columnState: ColumnState[], sortModel: [...] }` written by
 *            our earlier `api.getColumnState()` persistence code.
 *
 * Column visibility is intentionally excluded — it is controlled by the
 * `columnVisibility` prop, not by localStorage.
 */
function buildGridStateFromStorage(raw: string): GridState | undefined {
  try {
    const saved = JSON.parse(raw) as Record<string, unknown>;

    // Very old bare-array format: [{colId, hide, width, sort, sortIndex}]
    // Written by the earliest ArdaGrid column-state persistence code before
    // the object format was introduced. Handle it so users who haven't
    // reconfigured since then still get their layout restored.
    if (Array.isArray(saved)) {
      type LegacyCol = { colId?: string; width?: number | null; sort?: string | null };
      const cols = saved as unknown as LegacyCol[];
      const orderedColIds = cols
        .map((c) => c.colId)
        .filter((id): id is string => Boolean(id));
      const columnSizingModel = cols
        .filter((c) => c.colId && c.width != null)
        .map((c) => ({ colId: c.colId as string, width: c.width as number }));
      const sortItems = cols
        .filter((c) => c.colId && (c.sort === 'asc' || c.sort === 'desc'))
        .map((c) => ({ colId: c.colId as string, sort: c.sort as 'asc' | 'desc' }));
      const result: GridState = { partialColumnState: true };
      if (orderedColIds.length > 0) result.columnOrder = { orderedColIds };
      if (columnSizingModel.length > 0) result.columnSizing = { columnSizingModel };
      if (sortItems.length > 0) result.sort = { sortModel: sortItems };
      return result;
    }

    // New GridState format (saved via api.getState()):
    if (
      saved.columnSizing !== undefined ||
      saved.columnOrder !== undefined ||
      saved.sort !== undefined ||
      saved.version !== undefined
    ) {
      // Strip columnVisibility — managed by props, not by localStorage
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { columnVisibility: _cv, ...rest } = saved;
      return rest as GridState;
    }

    // Legacy format: { columnState: ColState[], sortModel?: [...] }
    if (Array.isArray(saved.columnState)) {
      type LegacyCol = { colId?: string; width?: number | null; sort?: string | null };
      const cols = saved.columnState as LegacyCol[];

      const orderedColIds = cols
        .map((c) => c.colId)
        .filter((id): id is string => Boolean(id));

      const columnSizingModel = cols
        .filter((c) => c.colId && c.width != null)
        .map((c) => ({ colId: c.colId as string, width: c.width as number }));

      const sortItems = cols
        .filter((c) => c.colId && (c.sort === 'asc' || c.sort === 'desc'))
        .map((c) => ({ colId: c.colId as string, sort: c.sort as 'asc' | 'desc' }));

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
  // columnOrder is reserved for future explicit ordering from the View menu
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
  const gridRef = useRef<ArdaGridRef>(null);
  const prevItemsRef = useRef<items.Item[]>([]);
  // Per-instance shift-click anchor — kept in a ref so it survives re-renders
  // without triggering them, and is isolated from other grids on the same page.
  const lastSelectedRowIndexRef = useRef<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<items.Item[]>([]);
  const persistentSelectionRef = useRef<Set<string>>(new Set());
  const isRestoringSelectionRef = useRef<boolean>(false);

  // Draft lifecycle for in-table editing: draftEntityId per row, in-flight promises, dirty set
  const draftsMapRef = useRef<Record<string, { draftEntityId: string }>>({});
  const draftPromisesMapRef = useRef<Record<string, Promise<string>>>({});
  const dirtyRowIdsRef = useRef<Set<string>>(new Set());
  // Track rows currently being published to prevent concurrent updates
  const publishingRowsRef = useRef<Set<string>>(new Set());
  // Row we are "in" (clicked or editing); publish when leaving this row
  const editingRowIdRef = useRef<string | null>(null);
  const isAnyCellEditingRef = useRef(false);
  const rowClickCountRef = useRef(0);
  const lastClickedRowIdRef = useRef<string | null>(null);
  const CLICKS_TO_OPEN_PANEL = 3;
  const pendingCellValuesRef = useRef<Record<string, Record<string, unknown>>>({});
  const dropdownValuesByRowRef = useRef<Record<string, Record<string, string>>>({});
  const skipPublishRowIdRef = useRef<string | null>(null);
  // Row-level UI: saving / error (state so getRowClass re-renders)
  const [rowState, setRowState] = useState<Record<string, { saving?: boolean; error?: boolean }>>({});

  // Handle row selection - merge with persistent selection
  const handleSelectionChanged = useCallback(
    (selectedRows: items.Item[]) => {
      // Skip if we're in the middle of restoring selection
      if (isRestoringSelectionRef.current) {
        return;
      }

      const api = gridRef.current?.getGridApi?.();
      if (!api) return;

      const currentSelectedIds = new Set(
        selectedRows.map((item) => item.entityId).filter(Boolean)
      );
      const allItemsInGrid = api
        .getRenderedNodes()
        .map((node) => node.data as items.Item);
      const allItemIds = new Set(
        allItemsInGrid.map((item) => item.entityId).filter(Boolean)
      );

      // Update persistent selection: remove items that are no longer in current page
      // and add newly selected items from current page
      allItemIds.forEach((entityId) => {
        if (currentSelectedIds.has(entityId)) {
          persistentSelectionRef.current.add(entityId);
        } else {
          persistentSelectionRef.current.delete(entityId);
        }
      });

      setSelectedRows(selectedRows);
      // Pass all items from persistent selection that are available in current page
      // The parent will merge this with items from other pages
      const allSelectedItemsFromPersistent: items.Item[] = [];
      persistentSelectionRef.current.forEach((entityId) => {
        const item = itemsData.find((i) => i.entityId === entityId);
        if (item) {
          allSelectedItemsFromPersistent.push(item);
        }
      });
      onSelectionChange?.(allSelectedItemsFromPersistent);
    },
    [onSelectionChange, itemsData]
  );

  // Restore selection when items change (e.g., due to pagination)
  useEffect(() => {
    const api = gridRef.current?.getGridApi?.();
    if (!api) return;

    // Check if items have changed
    const itemsChanged =
      prevItemsRef.current.length !== itemsData.length ||
      prevItemsRef.current.some((prev, idx) => {
        const current = itemsData[idx];
        return !current || prev.entityId !== current.entityId;
      });

    if (itemsChanged) {
      // Restore selection for items that are in the persistent selection
      const itemsToSelect = itemsData.filter(
        (item) =>
          item.entityId && persistentSelectionRef.current.has(item.entityId)
      );

      // Wait for grid to render nodes before restoring selection
      const restoreSelection = () => {
        // Set flag to prevent handleSelectionChanged from interfering
        isRestoringSelectionRef.current = true;

        // Deselect all first
        api.deselectAll();

        // Use forEachNode to find and select nodes - more reliable
        const selectNodes = () => {
          const nodesToSelect: Array<{
            setSelected: (selected: boolean) => void;
          }> = [];

          // Use forEachNode to iterate through all nodes
          api.forEachNode((node) => {
            const item = node.data as items.Item;
            if (
              item?.entityId &&
              persistentSelectionRef.current.has(item.entityId)
            ) {
              nodesToSelect.push(node);
            }
          });

          // Select all found nodes
          if (nodesToSelect.length > 0) {
            nodesToSelect.forEach((node) => {
              node.setSelected(true);
            });
          }

          // Update selectedRows state to match current page selection
          const currentPageSelected = itemsToSelect.filter(
            (item) =>
              item.entityId && persistentSelectionRef.current.has(item.entityId)
          );
          setSelectedRows(currentPageSelected);

          // Notify parent of restored selection
          const allSelectedItemsFromPersistent: items.Item[] = [];
          persistentSelectionRef.current.forEach((entityId) => {
            const item = itemsData.find((i) => i.entityId === entityId);
            if (item) {
              allSelectedItemsFromPersistent.push(item);
            }
          });

          // Clear the flag after a short delay to allow selection events to process
          setTimeout(() => {
            isRestoringSelectionRef.current = false;
            // Notify parent after flag is cleared
            onSelectionChange?.(allSelectedItemsFromPersistent);
          }, 100);
        };

        // Wait for grid to be ready
        if (api.getDisplayedRowCount() > 0) {
          // Grid already has rows, try immediately with a small delay
          setTimeout(selectNodes, 50);
        } else {
          // Wait for rows to be rendered
          let attempts = 0;
          const maxAttempts = 20;
          const checkRows = () => {
            attempts++;
            if (api.getDisplayedRowCount() > 0) {
              selectNodes();
            } else if (attempts < maxAttempts) {
              setTimeout(checkRows, 50);
            } else {
              // Give up and clear flag
              isRestoringSelectionRef.current = false;
            }
          };
          setTimeout(checkRows, 0);
        }
      };

      restoreSelection();
      prevItemsRef.current = itemsData;
    }
  }, [itemsData, onSelectionChange]);

  // ----- In-table cell editing: draft lifecycle, publish, saveAllDrafts -----
  const getOrCreateDraft = useCallback(
    async (rowId: string): Promise<string> => {
      // Check if we already have a draft for this row
      const existing = draftsMapRef.current[rowId]?.draftEntityId;
      if (existing) {
        return existing;
      }
      
      // Check if there's already a promise in flight for creating a draft
      const existingPromise = draftPromisesMapRef.current[rowId];
      if (existingPromise) {
        return existingPromise;
      }

      // Create a new draft
      const promise = createDraftItem(rowId)
        .then((draft) => {
          const draftEntityId = draft.entityId;
          
          // Double-check that we don't already have a draft (race condition protection)
          if (!draftsMapRef.current[rowId]?.draftEntityId) {
            draftsMapRef.current[rowId] = { draftEntityId };
          }
          
          delete draftPromisesMapRef.current[rowId];
          return draftsMapRef.current[rowId]?.draftEntityId || draftEntityId;
        })
        .catch((err) => {
          delete draftPromisesMapRef.current[rowId];
          console.error(`[getOrCreateDraft] Failed to create draft for row ${rowId}:`, err);
          toast.error(err instanceof Error ? err.message : 'Failed to create draft');
          throw err;
        });
      draftPromisesMapRef.current[rowId] = promise;
      return promise;
    },
    []
  );

  const publishRow = useCallback(
    async (rowId: string, opts?: { skipRefresh?: boolean }) => {
      // Prevent concurrent updates for the same row
      if (publishingRowsRef.current.has(rowId)) {
        return;
      }
      
      if (!dirtyRowIdsRef.current.has(rowId)) return;
      dirtyRowIdsRef.current.delete(rowId);
      
      const api = gridRef.current?.getGridApi?.();
      if (!api) {
        dirtyRowIdsRef.current.add(rowId);
        onUnsavedChangesChange?.(true);
        return;
      }
      const node = api.getRowNode(rowId);
      const rowData = node?.data as items.Item | undefined;
      if (!node || !rowData) {
        dirtyRowIdsRef.current.add(rowId);
        onUnsavedChangesChange?.(true);
        return;
      }

      publishingRowsRef.current.add(rowId);

      try {
        const draftEntityId = await getOrCreateDraft(rowId);
        const orderMethodColKey = 'primarySupply.orderMechanism';
        const orderMethodValue =
          typeof api.getCellValue === 'function'
            ? (api.getCellValue({ rowNode: node, colKey: orderMethodColKey }) as string | undefined)
            : undefined;
        const snapshot: Partial<items.Item> = {
          ...rowData,
          entityId: draftEntityId,
          primarySupply: rowData.primarySupply ? { ...rowData.primarySupply } : undefined,
          secondarySupply: rowData.secondarySupply ? { ...rowData.secondarySupply } : undefined,
        };
        const dropdownByRow = dropdownValuesByRowRef.current[rowId];
        if (dropdownByRow) {
          const snap = snapshot as Record<string, unknown>;
          Object.entries(dropdownByRow).forEach(([path, value]) => {
            if (path === 'primarySupply.orderMechanism' && value != null && value !== '') {
              const prev = snapshot.primarySupply ?? rowData.primarySupply;
              const supplier = prev?.supplier ?? '';
              const orderCost = prev?.orderCost ?? { value: 0, currency: 'USD' };
              snapshot.primarySupply = { ...(prev ?? {}), supplier, orderMechanism: value as items.OrderMechanism, orderCost } as items.Supply;
            } else {
              setNested(snap, path, value);
            }
          });
          delete dropdownValuesByRowRef.current[rowId];
        } else if (orderMethodValue !== undefined && orderMethodValue !== null && snapshot.primarySupply) {
          snapshot.primarySupply = { ...snapshot.primarySupply, orderMechanism: orderMethodValue as items.OrderMechanism };
        }
        const pending = pendingCellValuesRef.current[rowId];
        if (pending) {
          const snap = snapshot as Record<string, unknown>;
          Object.entries(pending).forEach(([path, value]) => {
            if (PENDING_COMPLEX_PATHS.has(path)) {
              return;
            }
            if (path === 'primarySupply.orderMechanism' && value != null && value !== '') {
              const prev = snapshot.primarySupply ?? rowData.primarySupply;
              const supplier = prev?.supplier ?? '';
              const orderCost = prev?.orderCost ?? { value: 0, currency: 'USD' };
              snapshot.primarySupply = { ...(prev ?? {}), supplier, orderMechanism: String(value) as items.OrderMechanism, orderCost } as items.Supply;
            } else {
              setNested(snap, path, value);
            }
          });
          delete pendingCellValuesRef.current[rowId];
        }

        setRowState((s) => ({ ...s, [rowId]: { saving: true, error: false } }));
        await updateItem(draftEntityId, snapshot);

        delete draftsMapRef.current[rowId];
        onUnsavedChangesChange?.(dirtyRowIdsRef.current.size > 0);
        setRowState((s) => {
          const next = { ...s };
          delete next[rowId];
          return next;
        });
        toast.success('Item updated');
        if (!opts?.skipRefresh) await onRefreshRequested?.();
      } catch (err) {
        console.error(`[publishRow] Error updating item for rowId ${rowId}:`, err);
        dirtyRowIdsRef.current.add(rowId);
        onUnsavedChangesChange?.(true);
        if (isAuthenticationError(err)) {
          onAuthError?.(err);
          throw err;
        }
        setRowState((s) => ({ ...s, [rowId]: { saving: false, error: true } }));
        const msg = err instanceof Error ? err.message : 'Failed to save item';
        toast.error(msg);
        throw err;
      } finally {
        // Always remove from publishing set, even on error
        publishingRowsRef.current.delete(rowId);
      }
    },
    [getOrCreateDraft, onRefreshRequested, onAuthError, onUnsavedChangesChange]
  );

  // Handle clicks outside the grid to publish dirty rows
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const api = gridRef.current?.getGridApi?.();
      if (!api) return;
      
      const target = event.target as Node;
      // Find the grid container element
      const gridContainer = document.querySelector('.ag-theme-arda');
      if (!gridContainer || gridContainer.contains(target)) {
        // Click is inside the grid, don't do anything
        return;
      }
      
      // Click is outside the grid
      // AG Grid will automatically stop editing when clicking outside, so we just need to publish
      // Wait a moment for AG Grid to process the stop editing
      setTimeout(() => {
        const prev = editingRowIdRef.current;
        if (prev && dirtyRowIdsRef.current.has(prev) && !isUnsavedModalOpen) {
          void publishRow(prev);
        }
      }, 150);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [publishRow, isUnsavedModalOpen]);

  useEffect(() => {
    const handleQuickActionMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell =
        target.closest?.('.ag-cell[col-id="quickActions"]') ||
        target.closest?.('.ag-cell[col-id="actions"]');
      if (!cell) return;
      const rowEl = cell.closest?.('.ag-row');
      if (!rowEl) return;
      const api = gridRef.current?.getGridApi?.();
      if (!api) return;
      const aria = rowEl.getAttribute('aria-rowindex');
      const rowIndex = aria != null ? parseInt(aria, 10) - 1 : -1;
      if (rowIndex < 0) return;
      const node = api.getDisplayedRowAtIndex(rowIndex);
      const rowId = (node?.data as items.Item)?.entityId;
      if (rowId) skipPublishRowIdRef.current = rowId;
    };
    document.addEventListener('mousedown', handleQuickActionMouseDown, true);
    return () =>
      document.removeEventListener('mousedown', handleQuickActionMouseDown, true);
  }, []);

  const handleRowClick = useCallback(
    (item: items.Item) => {
      const id = item?.entityId;
      if (!id) return;

      const prev = editingRowIdRef.current;
      if (prev && prev !== id) {
        const api = gridRef.current?.getGridApi?.();
        api?.stopEditing(false);
        const rowToPublish = prev;
        // Do NOT unconditionally add to dirtyRowIdsRef — only publish if
        // the row was genuinely dirtied by handleCellValueChanged.
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

  const handleRowDoubleClick = useCallback(() => {
    rowClickCountRef.current = 0;
    lastClickedRowIdRef.current = null;
  }, []);

  const handleCellEditingStarted = useCallback(
    (event: { data: items.Item; node: { data: items.Item }; column: { getColId: () => string } }) => {
      isAnyCellEditingRef.current = true;
      rowClickCountRef.current = 0;
      lastClickedRowIdRef.current = null;
      const rowId = (event.data?.entityId || event.node?.data?.entityId) as string | undefined;
      if (!rowId) return;
      editingRowIdRef.current = rowId;
      getOrCreateDraft(rowId);
    },
    [getOrCreateDraft]
  );

  const handleCellValueChanged = useCallback(
    (event: {
      data: items.Item;
      oldValue: unknown;
      newValue: unknown;
      node: { data: items.Item };
      column: { getColId: () => string; getColDef?: () => { field?: string } };
    }) => {
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

  // When cell editing stops, publish the row if it has unsaved changes.
  // Dropdown editors: selection syncs input (see typeahead selectValue) so getValue() returns the new value and cellValueChanged marks the row dirty.
  const handleCellEditingStopped = useCallback(
    (event: { data: items.Item; node: { data: items.Item }; column: { getColId: () => string } }) => {
      const api = gridRef.current?.getGridApi?.();
      const editingCells = api?.getEditingCells?.() ?? [];
      isAnyCellEditingRef.current = editingCells.length > 0;
      const rowId = (event.data?.entityId || event.node?.data?.entityId) as string | undefined;
      if (!rowId) return;
      if (skipPublishRowIdRef.current === rowId) {
        skipPublishRowIdRef.current = null;
        return;
      }
      if (editingCells.length === 0 && dirtyRowIdsRef.current.has(rowId) && !isUnsavedModalOpen) {
        setTimeout(() => {
          if (dirtyRowIdsRef.current.has(rowId)) {
            void publishRow(rowId);
          }
        }, 50);
      } else if (dirtyRowIdsRef.current.has(rowId)) {
        onUnsavedChangesChange?.(true);
      }
    },
    [onUnsavedChangesChange, publishRow, isUnsavedModalOpen]
  );

  const handleCellFocused = useCallback(
    (event: { api: { getFocusedCell: () => { rowIndex: number; column?: { getColId?: () => string } } | null; getDisplayedRowAtIndex: (i: number) => { data?: items.Item } | undefined } }) => {
      const fc = event.api?.getFocusedCell?.();
      if (!fc) return;
      const node = event.api.getDisplayedRowAtIndex(fc.rowIndex);
      const newRowId = node?.data?.entityId;
      if (!newRowId) return;
      const colId = fc.column?.getColId?.();
      if (colId && QUICK_ACTIONS_COL_IDS.includes(colId)) {
        skipPublishRowIdRef.current = newRowId;
      } else {
        skipPublishRowIdRef.current = null;
      }
      const prev = editingRowIdRef.current;

      if (prev && prev !== newRowId) {
        const api = gridRef.current?.getGridApi?.();
        api?.stopEditing(false);
        const rowToPublish = prev;
        // Do NOT unconditionally add to dirtyRowIdsRef — that would publish
        // clean rows on every focus change. Only publish if the row was
        // genuinely dirtied by handleCellValueChanged.
        setTimeout(() => {
          if (dirtyRowIdsRef.current.has(rowToPublish) && !isUnsavedModalOpen) void publishRow(rowToPublish);
          editingRowIdRef.current = newRowId;
        }, 200);
      } else if (prev !== newRowId) {
        editingRowIdRef.current = newRowId;
      }
    },
    [publishRow, isUnsavedModalOpen]
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
        if (api) {
          api.refreshCells({ columns: ['notes'], force: true });
        }
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
        if (api) {
          api.refreshCells({ columns: ['cardNotesDefault'], force: true });
        }
      }
    },
    [onUnsavedChangesChange]
  );

  const gridContext = useMemo(
    () => ({
      onNotesSave,
      onCardNotesSave,
      // Shift-click anchor — a stable ref, so it's safe to include here without
      // adding it to the deps array (refs never change identity).
      lastSelectedRowIndexRef,
      setDropdownValueForRow: (rowId: string, fieldPath: string, value: string) => {
        if (!dropdownValuesByRowRef.current[rowId]) dropdownValuesByRowRef.current[rowId] = {};
        dropdownValuesByRowRef.current[rowId][fieldPath] = value;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onNotesSave, onCardNotesSave]
  );

  useImperativeHandle(
    ref,
    () => ({
      saveAllDrafts: async () => {
        const ids = Array.from(dirtyRowIdsRef.current);
        
        // Process drafts sequentially to avoid race conditions
        // Use a Set to ensure we don't process the same rowId twice
        const processedIds = new Set<string>();
        for (const rowId of ids) {
          // Skip if already processed (shouldn't happen, but safety check)
          if (processedIds.has(rowId)) {
            console.warn(`[saveAllDrafts] Skipping duplicate rowId: ${rowId}`);
            continue;
          }
          processedIds.add(rowId);
          
          try {
            await publishRow(rowId, { skipRefresh: true });
          } catch (err) {
            console.error(`[saveAllDrafts] Error publishing row ${rowId}:`, err);
            // Continue with other rows even if one fails
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

  // Row actions for the grid
  // No row actions - column removed per latest requirements

  // Field -> view key mapping
  const fieldMapping: Record<string, string> = {
    name: 'name',
    internalSKU: 'sku',
    generalLedgerCode: 'glCode',
    imageUrl: 'image',
    quickActions: 'actions',
    'primarySupply.supplier': 'supplier',
    'primarySupply.unitCost': 'unitCost',
    createdCoordinates: 'created',
    minQuantityAmount: 'minQuantityAmount',
    minQuantityUnit: 'minQuantityUnit',
    orderQuantityAmount: 'orderQuantityAmount',
    orderQuantityUnit: 'orderQuantityUnit',
    'primarySupply.orderMechanism': 'orderMethod',
    'classification.type': 'classification',
    'classification.subType': 'subType',
    'locator.location': 'location',
    'locator.subLocation': 'subLocation',
    'locator.department': 'department',
    'locator.facility': 'facility',
    useCase: 'useCase',
    cardSize: 'cardSizeOption', // columna "Card Size" <-> menú View "Card Size"
    cardCount: 'cardSize', // columna "# of Cards" <-> menú View "# of Cards"
    notes: 'notes',
    cardNotesDefault: 'cardNotes',
    taxable: 'taxable',
    'primarySupply.url': 'supplierUrl',
    'primarySupply.sku': 'supplierSku',
    'primarySupply.averageLeadTime': 'leadTime',
    'primarySupply.orderCost': 'orderCost',
    labelSize: 'labelSize',
    breadcrumbSize: 'breadcrumbSize',
    color: 'color',
  };

  // Check if all columns (except select) are hidden
  const allOtherColumnsHidden = Object.keys(fieldMapping).every((field) => {
    const visibilityKey = fieldMapping[field];
    return columnVisibility[visibilityKey] === false;
  });

  // Include all columns but set initial visibility based on columnVisibility prop
  // This allows columns to be dragged and reordered even if hidden
  const baseColumnDefs = itemsColumnDefs.map((col) => {
    const identifier = (col.colId as string) || (col.field as string);

    // Hide select column if all other columns are hidden
    if (identifier === 'select' || col.headerName === '') {
      return {
        ...col,
        suppressMovable: true, // Don't allow moving the select column
        hide: allOtherColumnsHidden, // Hide if all other columns are hidden
      };
    }

    const visibilityKey = fieldMapping[identifier];
    const isVisible = visibilityKey
      ? columnVisibility[visibilityKey] !== false
      : true;

    // For all other columns, explicitly set suppressMovable to false to enable reordering
    // This ensures columns can be dragged and reordered
    return {
      ...col,
      hide: !isVisible,
      suppressMovable: false, // Explicitly enable column reordering
    };
  });

  // Get persisted column order from localStorage and apply it before rendering
  const getOrderedColumnDefs = () => {
    try {
      const savedState = localStorage.getItem(`items-grid-${activeTab}`);
      if (savedState) {
        const persistedState = JSON.parse(savedState);
        let persistedOrder: string[] = [];

        if (Array.isArray(persistedState)) {
          // Old format: array of column states
          persistedOrder = persistedState
            .map((col: { colId?: string }) => col.colId)
            .filter((id: string | undefined): id is string => !!id);
        } else if (
          persistedState.columnState &&
          Array.isArray(persistedState.columnState)
        ) {
          // Legacy format: object with columnState array
          persistedOrder = persistedState.columnState
            .map((col: { colId?: string }) => col.colId)
            .filter((id: string | undefined): id is string => !!id);
        } else if (
          persistedState.columnOrder &&
          Array.isArray(persistedState.columnOrder.orderedColIds)
        ) {
          // New GridState format (api.getState() / stateUpdated): { columnOrder: { orderedColIds: [...] } }
          persistedOrder = (persistedState.columnOrder.orderedColIds as unknown[])
            .filter((id): id is string => typeof id === 'string' && !!id);
        }

        if (persistedOrder.length > 0) {
          // Build a width map from the saved columnSizing state so that column
          // widths are embedded in the column defs — same belt-and-suspenders
          // approach as column order. This ensures resize persists even if
          // initialState.columnSizing is applied after a columnDefs re-render.
          const savedWidths = new Map<string, number>();
          const sizingModel = (persistedState as { columnSizing?: { columnSizingModel?: Array<{ colId?: string; width?: number }> } })
            .columnSizing?.columnSizingModel;
          if (Array.isArray(sizingModel)) {
            sizingModel.forEach(({ colId, width }) => {
              if (colId && width != null) savedWidths.set(colId, width);
            });
          }

          // Build a sort map from the saved sort state so that sort direction and
          // index are embedded in the column defs. colDef.sort / colDef.sortIndex
          // are the colDef-level way to set initial sort; they persist across
          // columnDefs re-renders the same way colDef.width does for resize.
          const savedSort = new Map<string, { sort: 'asc' | 'desc'; sortIndex: number }>();
          const sortModel = (persistedState as { sort?: { sortModel?: Array<{ colId?: string; sort?: string }> } })
            .sort?.sortModel;
          if (Array.isArray(sortModel)) {
            sortModel.forEach(({ colId, sort }, index) => {
              if (colId && (sort === 'asc' || sort === 'desc')) {
                savedSort.set(colId, { sort, sortIndex: index });
              }
            });
          }

          // Create a map of column definitions by identifier
          const colMap = new Map<string, (typeof baseColumnDefs)[number]>();
          baseColumnDefs.forEach((col) => {
            const identifier = (col.colId as string) || (col.field as string);
            if (identifier) {
              colMap.set(identifier, col);
            }
          });

          // Helper: apply saved width and sort overrides to a colDef
          const applyOverrides = (col: (typeof baseColumnDefs)[number], id: string) => {
            const savedWidth = savedWidths.get(id);
            const sortState = savedSort.get(id);
            if (savedWidth == null && !sortState) return col;
            return {
              ...col,
              ...(savedWidth != null ? { width: savedWidth } : {}),
              ...(sortState ? { sort: sortState.sort, sortIndex: sortState.sortIndex } : {}),
            };
          };

          // Build ordered array based on persisted order, applying saved overrides
          const ordered: (typeof baseColumnDefs)[number][] = [];
          const added = new Set<string>();

          // First, add columns in persisted order
          persistedOrder.forEach((colId) => {
            const col = colMap.get(colId);
            if (col) {
              ordered.push(applyOverrides(col, colId));
              added.add(colId);
            }
          });

          // Then, add any remaining columns that weren't in persisted order
          baseColumnDefs.forEach((col) => {
            const identifier = (col.colId as string) || (col.field as string);
            if (identifier && !added.has(identifier)) {
              ordered.push(applyOverrides(col, identifier));
            }
          });

          return ordered;
        }
      }
    } catch {
      // If there's an error reading localStorage, fall back to original order
    }

    // Fall back to original order if no persisted state or error
    return baseColumnDefs;
  };

  const filteredColumnDefs = enableCellEditing
    ? enhanceEditableColumnDefs(getOrderedColumnDefs(), { pendingCellValuesRef })
    : getOrderedColumnDefs();

  // Track if we're updating visibility from props to avoid circular updates
  const isUpdatingFromPropsRef = useRef(false);
  // Track if user is interacting with columns (moving, resizing, etc.)
  const isUserInteractingRef = useRef(false);
  // Track if grid is ready and persisted state has been loaded
  const isGridReadyRef = useRef(false);
  // Track previous columnVisibility to detect actual changes from dropdown
  const prevColumnVisibilityRef =
    useRef<Record<string, boolean>>(columnVisibility);
  // Track the persisted column order to preserve it when saving
  const persistedColumnOrderRef = useRef<
    Array<{ colId: string; order: number }>
  >([]);
  // Ref keeps activeTab current inside event listener closures registered at mount time
  const activeTabRef = useRef(activeTab);

  // On tab switch: reset flags, keep activeTabRef current, restore column state for the new tab.
  // initialState only applies at grid creation (page load); this useEffect covers all
  // subsequent tab switches on the same mounted grid instance.
  // Uses api.setState() with propertiesToIgnore=['columnVisibility'] so that visibility
  // (controlled by the columnVisibility prop) is never overridden by localStorage data.
  useEffect(() => {
    isGridReadyRef.current = false;
    prevColumnVisibilityRef.current = { ...columnVisibility };
    activeTabRef.current = activeTab;

    const api = gridRef.current?.getGridApi?.();
    if (!api) return;

    const savedStateRaw = localStorage.getItem(`items-grid-${activeTab}`);
    if (!savedStateRaw) return;

    try {
      const state = buildGridStateFromStorage(savedStateRaw);
      if (state) {
        // 'columnVisibility' is controlled by the columnVisibility prop — never
        // override it from localStorage during a tab switch.
        api.setState(state, ['columnVisibility']);
      }
    } catch (err) {
      console.warn('Failed to restore column state on tab switch:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Track user interactions with columns (moving, resizing)
  useEffect(() => {
    const api = gridRef.current?.getGridApi?.();
    if (!api) return;

    const handleUserInteraction = () => {
      isUserInteractingRef.current = true;
      // Reset flag after a delay to allow save to complete
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 200);
    };

    api.addEventListener('columnMoved', handleUserInteraction);
    api.addEventListener('columnResized', handleUserInteraction);

    return () => {
      api.removeEventListener('columnMoved', handleUserInteraction);
      api.removeEventListener('columnResized', handleUserInteraction);
    };
  }, []);

  // Sync AG Grid column visibility changes back to parent
  useEffect(() => {
    const api = gridRef.current?.getGridApi?.();
    if (!api || !onColumnVisibilityChange) return;

    // Field -> view key mapping for syncing visibility
    const fieldToViewKey: Record<string, string> = {
      internalSKU: 'sku',
      generalLedgerCode: 'glCode',
      name: 'name',
      imageUrl: 'image',
      'classification.type': 'classification',
      'classification.subType': 'subType',
      'primarySupply.supplier': 'supplier',
      'locator.location': 'location',
      'locator.subLocation': 'subLocation',
      'locator.department': 'department',
      'locator.facility': 'facility',
      useCase: 'useCase',
      'primarySupply.unitCost': 'unitCost',
      createdCoordinates: 'created',
      minQuantityAmount: 'minQuantityAmount',
      minQuantityUnit: 'minQuantityUnit',
      orderQuantityAmount: 'orderQuantityAmount',
      orderQuantityUnit: 'orderQuantityUnit',
      'primarySupply.orderMechanism': 'orderMethod',
      cardCount: 'cardSize',
      notes: 'notes',
      cardNotesDefault: 'cardNotes',
      taxable: 'taxable',
      'primarySupply.url': 'supplierUrl',
      'primarySupply.sku': 'supplierSku',
      'primarySupply.averageLeadTime': 'leadTime',
      'primarySupply.orderCost': 'orderCost',
      cardSize: 'cardSizeOption',
      labelSize: 'labelSize',
      breadcrumbSize: 'breadcrumbSize',
      color: 'color',
      quickActions: 'actions',
    };

    const handleColumnVisibilityChange = () => {
      // Skip if we're updating from props to avoid circular updates
      if (isUpdatingFromPropsRef.current) {
        return;
      }

      // Small delay to ensure column state is fully updated after visibility changes
      // This ensures we get the correct visibility state for all columns
      setTimeout(() => {
        const columnState = api.getColumnState();
        if (!columnState || columnState.length === 0) return;

        const newVisibility: Record<string, boolean> = {};

        columnState.forEach((col) => {
          const colId = col.colId;
          if (colId && colId !== 'select') {
            const viewKey = fieldToViewKey[colId];
            if (viewKey) {
              newVisibility[viewKey] = !col.hide;
            }
          }
        });

        onColumnVisibilityChange(newVisibility);
      }, 150);
    };

    api.addEventListener('columnVisible', handleColumnVisibilityChange);

    return () => {
      api.removeEventListener('columnVisible', handleColumnVisibilityChange);
    };
  }, [onColumnVisibilityChange]);

  // Apply column visibility from props (only when visibility changes from dropdown)
  // This runs when columnVisibility prop changes, but preserves column order from persisted state
  useEffect(() => {
    const api = gridRef.current?.getGridApi?.();
    if (!api || !isGridReadyRef.current) return;

    // Check if visibility actually changed (not just a reference change)
    const visibilityChanged =
      JSON.stringify(prevColumnVisibilityRef.current) !==
      JSON.stringify(columnVisibility);
    if (!visibilityChanged) return;

    const viewKeyToField: Record<string, string> = {
      sku: 'internalSKU',
      glCode: 'generalLedgerCode',
      name: 'name',
      image: 'imageUrl',
      classification: 'classification.type',
      supplier: 'primarySupply.supplier',
      location: 'locator.location',
      subLocation: 'locator.subLocation',
      unitCost: 'primarySupply.unitCost',
      created: 'createdCoordinates',
      minQuantityAmount: 'minQuantityAmount',
      minQuantityUnit: 'minQuantityUnit',
      orderQuantityAmount: 'orderQuantityAmount',
      orderQuantityUnit: 'orderQuantityUnit',
      orderMethod: 'primarySupply.orderMechanism',
      cardSize: 'cardCount',
      notes: 'notes',
      actions: 'quickActions',
      subType: 'classification.subType',
      useCase: 'useCase',
      department: 'locator.department',
      facility: 'locator.facility',
      cardNotes: 'cardNotesDefault',
      taxable: 'taxable',
      supplierUrl: 'primarySupply.url',
      supplierSku: 'primarySupply.sku',
      leadTime: 'primarySupply.averageLeadTime',
      orderCost: 'primarySupply.orderCost',
      cardSizeOption: 'cardSize',
      labelSize: 'labelSize',
      breadcrumbSize: 'breadcrumbSize',
      color: 'color',
    };

    // Check if all columns (except select) are hidden
    const allOtherColumnsHidden = Object.values(columnVisibility).every(
      (visible) => visible === false
    );

    // Apply visibility using setColumnsVisible for each column individually
    // This method doesn't affect column order
    isUpdatingFromPropsRef.current = true;

    // Apply all column visibility changes
    Object.entries(columnVisibility).forEach(([viewKey, visible]) => {
      const field = viewKeyToField[viewKey];
      if (field) {
        api.setColumnsVisible([field], visible);
      }
    });

    // Hide/show select column based on other columns visibility
    // Do this immediately after other columns to ensure proper state
    api.setColumnsVisible(['select'], !allOtherColumnsHidden);

    // Force save grid state after all visibility changes are applied
    // Use multiple timeouts to ensure state is saved even if one fails
    const saveGridState = () => {
      const currentApi = gridRef.current?.getGridApi?.();
      if (!currentApi) return;

      const columnState = currentApi.getColumnState();
      if (columnState && columnState.length > 0) {
        const gridState = {
          columnState: columnState.map((col) => ({
            colId: col.colId,
            hide: col.hide,
            width: col.width,
            sort: col.sort,
            sortIndex: col.sortIndex,
            pinned: null,
          })),
          sortModel: columnState
            .filter((col) => col.sort !== null && col.sort !== undefined)
            .map((col) => ({
              colId: col.colId,
              sort: col.sort,
              sortIndex: col.sortIndex,
            })),
        };
        
        try {
          localStorage.setItem(`items-grid-${activeTab}`, JSON.stringify(gridState));
        } catch (error) {
          console.error('Failed to save grid state to localStorage:', error);
        }
      }
    };

    // Save multiple times to ensure persistence
    setTimeout(saveGridState, 300);
    setTimeout(() => {
      saveGridState();
      // Reset flag after saving to allow events to process
      // The flag prevents circular updates (grid -> parent -> grid) but allows persistence
      isUpdatingFromPropsRef.current = false;
    }, 500);

    // Update previous visibility reference
    prevColumnVisibilityRef.current = columnVisibility;
  }, [columnVisibility, activeTab]);

  // Read persisted column state once at mount and convert to AG Grid GridState format.
  // Passed as a direct initialState prop on <ArdaGrid> so AG Grid applies it
  // synchronously at grid creation — before the first render and before any
  // useEffect fires. This is immune to all timing races.
  const initialGridState = useMemo((): GridState | undefined => {
    if (typeof localStorage === 'undefined') return undefined;
    const raw = localStorage.getItem(`items-grid-${activeTab}`);
    if (!raw) return undefined;
    return buildGridStateFromStorage(raw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] intentional — only read at mount; activeTab is stable at that point

  // Pass context through gridOptions. initialState is passed as a direct prop on
  // <ArdaGrid> below so it reaches <AgGridReact initialState={...}> without any
  // risk of being overshadowed by the gridOptions merging logic.
  const gridOptionsWithPersistence = useMemo(
    () => ({ context: gridContext }),
    [gridContext]
  );

  // ArdaGrid forwards the GridReadyEvent from params directly — use params.api in a
  // closure so the 200ms setTimeout never needs to go through React state (getGridApi
  // reads useState which may not be committed yet at the moment onGridReady fires).
  const handleGridReady = useCallback((params: { api: GridApi }) => {
    const api = params.api; // captured directly; always valid, no async state needed
    setTimeout(() => {
      if (!api) return;

      isGridReadyRef.current = true;

      // Initialise persistedColumnOrderRef from the default column order
      // initialState is applied synchronously at grid creation, so by the time
      // onGridReady fires (and this 200ms timeout runs), the column order is already
      // the restored order — safe to snapshot here.
      const defaultState = api.getColumnState();
      persistedColumnOrderRef.current = defaultState
        .map((col, index) => ({ colId: col.colId || '', order: index }))
        .filter((col) => col.colId);

      const viewKeyToField: Record<string, string> = {
        sku: 'internalSKU',
        glCode: 'generalLedgerCode',
        name: 'name',
        image: 'imageUrl',
        classification: 'classification.type',
        subType: 'classification.subType',
        supplier: 'primarySupply.supplier',
        location: 'locator.location',
        subLocation: 'locator.subLocation',
        department: 'locator.department',
        facility: 'locator.facility',
        useCase: 'useCase',
        unitCost: 'primarySupply.unitCost',
        created: 'createdCoordinates',
        minQuantityAmount: 'minQuantityAmount',
        minQuantityUnit: 'minQuantityUnit',
        orderQuantityAmount: 'orderQuantityAmount',
        orderQuantityUnit: 'orderQuantityUnit',
        orderMethod: 'primarySupply.orderMechanism',
        cardSize: 'cardCount',
        notes: 'notes',
        cardNotes: 'cardNotesDefault',
        taxable: 'taxable',
        supplierUrl: 'primarySupply.url',
        supplierSku: 'primarySupply.sku',
        leadTime: 'primarySupply.averageLeadTime',
        orderCost: 'primarySupply.orderCost',
        cardSizeOption: 'cardSize',
        labelSize: 'labelSize',
        breadcrumbSize: 'breadcrumbSize',
        color: 'color',
        actions: 'quickActions',
      };

      // Apply column visibility from props (source of truth for show/hide)
      const allOtherColumnsHidden = Object.values(columnVisibility).every(
        (visible) => visible === false
      );

      isUpdatingFromPropsRef.current = true;
      Object.entries(columnVisibility).forEach(([viewKey, visible]) => {
        const field = viewKeyToField[viewKey];
        if (field) api.setColumnsVisible([field], visible);
      });
      api.setColumnsVisible(['select'], !allOtherColumnsHidden);
      prevColumnVisibilityRef.current = columnVisibility;

      // Reset flag after visibility events have been processed
      setTimeout(() => {
        isUpdatingFromPropsRef.current = false;
      }, 300);

      // Register a stateUpdated listener to persist column widths, order, and sort.
      // stateUpdated is the AG Grid v31+ native event for all grid state changes.
      // We filter to only save when relevant parts change (columnSizing, columnOrder,
      // sort) and skip columnVisibility (controlled by the columnVisibility prop).
      // Debounce 300ms to coalesce rapid events during column resize dragging.
      let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
      api.addEventListener('stateUpdated', (event: { sources: string[]; state: GridState }) => {
        const relevant = ['columnSizing', 'columnOrder', 'sort'];
        if (!event.sources.some((s) => relevant.includes(s))) return;

        if (saveDebounceTimer !== null) clearTimeout(saveDebounceTimer);
        saveDebounceTimer = setTimeout(() => {
          // Strip columnVisibility — controlled by props, not localStorage.
          // Set partialColumnState:true because we removed a column-state property
          // (columnVisibility). Without it AG Grid would treat the absent property
          // as "reset to default" on the next initialState restore.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { columnVisibility: _cv, ...rest } = event.state;
          const stateToSave: GridState = { ...rest, partialColumnState: true };
          try {
            localStorage.setItem(
              `items-grid-${activeTabRef.current}`,
              JSON.stringify(stateToSave)
            );
          } catch (err) {
            console.error('Failed to save grid state:', err);
          }
        }, 300);
      });
    }, 200);
  }, [columnVisibility]);


  // Prevent any visible drag image by setting a 0x0 image on the grid root
  // Only apply to row drags, not column drags
  useEffect(() => {
    const gridRoot = document.querySelector('.ag-theme-arda');
    if (!gridRoot) return;

    const preventDragImage = (e: Event) => {
      const dragEvent = e as DragEvent;
      const target = dragEvent.target as HTMLElement;

      // Only prevent drag image for row drags, not column header drags
      // Column headers have the class 'ag-header-cell' or are inside it
      if (target?.closest('.ag-header-cell')) {
        return; // Allow column drags to work normally
      }

      if (dragEvent.dataTransfer) {
        dragEvent.dataTransfer.setDragImage(new Image(), 0, 0);
      }
    };

    gridRoot.addEventListener('dragstart', preventDragImage, true);
    return () =>
      gridRoot.removeEventListener('dragstart', preventDragImage, true);
  }, []);

  return (
    <ItemCardsContext.Provider
      value={{ itemCardsMap, refreshCardsForItem, ensureCardsForItem, onOpenItemDetails }}
    >
      <div className='h-full flex flex-col min-h-0'>
        {/* Grid with integrated pagination */}
        <ArdaGrid
          ref={gridRef}
          rowData={itemsData}
          columnDefs={filteredColumnDefs}
          defaultColDef={{
            ...itemsDefaultColDef,
            suppressMovable: false, // Ensure columns are movable by default
          }}
          loading={isLoading}
          // Use default height inherited from parent container
          enableRowSelection={true}
          enableMultiRowSelection={true}
          onSelectionChanged={handleSelectionChanged}
          selectedItems={selectedRows}
          totalSelectedCount={totalSelectedCount}
          maxItemsSeen={maxItemsSeen}
          enableRowActions={false}
          onRowClicked={handleRowClick}
          onRowDoubleClicked={handleRowDoubleClick}
          enableCellEditing={enableCellEditing}
          onCellEditingStarted={handleCellEditingStarted}
          onCellValueChanged={handleCellValueChanged}
          onCellEditingStopped={handleCellEditingStopped}
          onCellFocused={handleCellFocused}
          getRowClass={getRowClass}
          enableColumnStatePersistence={false}
          className='h-full'
          paginationData={paginationData}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          onFirstPage={onFirstPage}
          onGridReady={handleGridReady}
          emptyStateComponent={emptyStateComponent}
          hasActiveSearch={hasActiveSearch}
          gridOptions={gridOptionsWithPersistence}
          initialState={initialGridState}
        />
      </div>
    </ItemCardsContext.Provider>
  );
});
