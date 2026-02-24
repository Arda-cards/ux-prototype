'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  PackageOpen,
  FileText,
  MoreHorizontal,
  SlidersHorizontal,
  ChevronDown,
  Loader,
  Check,
} from 'lucide-react';
import { getKanbanCard } from '@frontend/lib/ardaClient';
import { toast, Toaster } from 'sonner';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import {
  canAddToOrderQueue,
  CARD_STATE_CONFIG,
  getAllCardStates,
} from '@frontend/lib/cardStateUtils';
import { ItemDetailsPanel } from '@frontend/components/items/ItemDetailsPanel';
import { ItemFormPanel } from '@frontend/components/items/ItemFormPanel';
import type { ItemCard } from '@frontend/constants/types';
import { orderMethodOptions } from '@frontend/constants/constants';
import * as items from '@frontend/types/items';
import {
  defaultOrderMechanism,
  defaultQuantity,
  defaultCardSize,
  defaultLabelSize,
  defaultBreadcrumbSize,
} from '@frontend/types/items';
import { defaultMoney, type Currency } from '@frontend/types/domain';
import { defaultDuration } from '@frontend/types/general';
import { ArdaGrid, ArdaGridRef, itemsDefaultColDef } from '@frontend/components/table';
import { ColDef, IHeaderParams } from 'ag-grid-community';
import { Button } from '@frontend/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@frontend/components/ui/dropdown-menu';
import {
  formatCurrency,
  formatDateTime,
  formatQuantity,
} from '@frontend/components/table/columnPresets';
import Image from 'next/image';

interface KanbanCardData {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: {
    eId: string;
    rId: string;
    lookupUrlId: string;
    serialNumber: string;
    item: {
      type: string;
      eId: string;
      name: string;
    };
    itemDetails: {
      eId: string;
      name: string;
      imageUrl?: string;
      internalSKU?: string;
      locator?: {
        facility: string;
        location: string;
      };
      notes: string;
      cardNotesDefault: string;
      minQuantity?: {
        amount: number;
        unit: string;
      };
      primarySupply: {
        supplyEId?: string;
        supplier: string;
        name?: string;
        sku?: string;
        url?: string;
        orderQuantity?: {
          amount: number;
          unit: string;
        };
        unitCost?: {
          value: number;
          currency: string;
        };
      };
      defaultSupply: string;
      cardSize: string;
      labelSize: string;
      breadcrumbSize: string;
      itemColor: string;
    };
    cardQuantity: {
      amount: number;
      unit: string;
    };
    status: string;
    printStatus: string;
  };
  metadata: {
    tenantId: string;
  };
  author: string;
  retired: boolean;
}

interface ScannedItem {
  id: string;
  cardData: KanbanCardData;
}

interface DesktopScanViewProps {
  isOpen: boolean;
  onClose: () => void;
  onScan?: (scannedData: string) => void;
  initialCardId?: string; // Optional cardId to pre-populate the scan view
}

// Track last selected row index for shift-click range selection
let lastSelectedRowIndex: number | null = null;

// Select All Header Component
const SelectAllHeader = React.memo((params: IHeaderParams<ScannedItem>) => {
  const [isAllSelected, setIsAllSelected] = useState(false);
  const api = params.api;

  const updateSelectionState = useCallback(() => {
    if (!api) {
      setIsAllSelected(false);
      return;
    }

    try {
      const displayedRows = api.getDisplayedRowCount();
      if (displayedRows === 0) {
        setIsAllSelected(false);
        return;
      }

      let selectedCount = 0;
      api.forEachNodeAfterFilterAndSort((node) => {
        if (node.isSelected()) {
          selectedCount++;
        }
      });

      setIsAllSelected(selectedCount === displayedRows && displayedRows > 0);
    } catch (error) {
      console.error('Error updating selection state:', error);
      setIsAllSelected(false);
    }
  }, [api]);

  useEffect(() => {
    if (!api) return;

    // Update state when selection changes
    const selectionChangedHandler = () => {
      updateSelectionState();
    };
    const filterChangedHandler = () => {
      updateSelectionState();
    };
    const sortChangedHandler = () => {
      updateSelectionState();
    };

    api.addEventListener('selectionChanged', selectionChangedHandler);
    api.addEventListener('filterChanged', filterChangedHandler);
    api.addEventListener('sortChanged', sortChangedHandler);

    // Initial state check after a short delay to ensure grid is ready
    const timeoutId = setTimeout(() => {
      updateSelectionState();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      try {
        if (api) {
          api.removeEventListener('selectionChanged', selectionChangedHandler);
          api.removeEventListener('filterChanged', filterChangedHandler);
          api.removeEventListener('sortChanged', sortChangedHandler);
        }
      } catch (error) {
        console.error('Error removing event listeners:', error);
      }
    };
  }, [api, updateSelectionState]);

  const handleSelectAll = useCallback(
    (checked: boolean | 'indeterminate' | undefined) => {
      if (!api) return;

      try {
        if (checked === true) {
          // Select all displayed/filtered rows
          // Use a batch approach: select all without suppressing events
          // AG Grid will handle the selectionChanged event properly
          api.forEachNodeAfterFilterAndSort((node) => {
            if (node.data) {
              // Select each node without suppressing events
              // This ensures all nodes are selected and events fire correctly
              node.setSelected(true, false);
            }
          });
        } else {
          // Deselect all rows (this automatically triggers selection changed event)
          api.deselectAll();
        }
      } catch (error) {
        console.error('Error selecting/deselecting all:', error);
      }
    },
    [api]
  );

  // Render the checkbox header - always visible
  // Show checkbox even if API is not available yet
  const boxSize = 14;
  const checkMarkW = 3;
  const checkMarkH = 6;

  if (!api) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          minHeight: '48px',
        }}
      >
        <div
          style={{
            width: boxSize,
            height: boxSize,
            flexShrink: 0,
            border: '1.5px solid #e5e5e5',
            borderRadius: '3px',
            backgroundColor: '#ffffff',
            boxShadow:
              '0px 1px 2px rgba(0, 0, 0, 0.08), 0px 1px 1px -1px rgba(0, 0, 0, 0.06)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: '48px',
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        style={{
          display: 'inline-block',
          width: boxSize,
          height: boxSize,
          minWidth: boxSize,
          maxWidth: boxSize,
          minHeight: boxSize,
          maxHeight: boxSize,
          flexShrink: 0,
          border: '1.5px solid #e5e5e5',
          borderRadius: '3px',
          backgroundColor: isAllSelected ? '#fc5a29' : '#ffffff',
          borderColor: isAllSelected ? '#fc5a29' : '#e5e5e5',
          cursor: 'pointer',
          position: 'relative',
          boxShadow:
            '0px 1px 2px rgba(0, 0, 0, 0.08), 0px 1px 1px -1px rgba(0, 0, 0, 0.06)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleSelectAll(!isAllSelected);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        {isAllSelected && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              width: checkMarkW,
              height: checkMarkH,
              borderRight: '2px solid #ffffff',
              borderBottom: '2px solid #ffffff',
              borderTop: 'none',
              borderLeft: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
});

SelectAllHeader.displayName = 'SelectAllHeader';

type OnScanItemUpdated = (updated: ScannedItem) => void;

function applyScanEdit(
  item: ScannedItem,
  colId: string,
  newValue: unknown,
  onUpdated: OnScanItemUpdated
): void {
  const payload = item.cardData.payload;
  const details = payload.itemDetails;
  const str = (v: unknown) => (v == null ? '' : String(v).trim());

  if (colId === 'sku') {
    const updated: ScannedItem = {
      ...item,
      cardData: {
        ...item.cardData,
        payload: {
          ...payload,
          itemDetails: { ...details, internalSKU: str(newValue) },
        },
      },
    };
    onUpdated(updated);
    return;
  }
  if (colId === 'name') {
    const updated: ScannedItem = {
      ...item,
      cardData: {
        ...item.cardData,
        payload: {
          ...payload,
          itemDetails: { ...details, name: str(newValue) },
        },
      },
    };
    onUpdated(updated);
    return;
  }
  if (colId === 'supplier') {
    const supply = details.primarySupply ?? {};
    const updated: ScannedItem = {
      ...item,
      cardData: {
        ...item.cardData,
        payload: {
          ...payload,
          itemDetails: {
            ...details,
            primarySupply: { ...supply, supplier: str(newValue) },
          },
        },
      },
    };
    onUpdated(updated);
    return;
  }
  if (colId === 'facility') {
    const locator = details.locator ?? { facility: '', location: '' };
    const updated: ScannedItem = {
      ...item,
      cardData: {
        ...item.cardData,
        payload: {
          ...payload,
          itemDetails: {
            ...details,
            locator: { ...locator, facility: str(newValue) },
          },
        },
      },
    };
    onUpdated(updated);
    return;
  }
  if (colId === 'location') {
    const locator = details.locator ?? { facility: '', location: '' };
    const updated: ScannedItem = {
      ...item,
      cardData: {
        ...item.cardData,
        payload: {
          ...payload,
          itemDetails: {
            ...details,
            locator: { ...locator, location: str(newValue) },
          },
        },
      },
    };
    onUpdated(updated);
    return;
  }
  if (colId === 'unitCost') {
    const n = typeof newValue === 'number' ? newValue : parseFloat(String(newValue ?? ''));
    const supply = details.primarySupply ?? {};
    const cost = supply.unitCost ?? { value: 0, currency: 'USD' };
    const updated: ScannedItem = {
      ...item,
      cardData: {
        ...item.cardData,
        payload: {
          ...payload,
          itemDetails: {
            ...details,
            primarySupply: {
              ...supply,
              unitCost: { ...cost, value: Number.isNaN(n) ? 0 : n },
            },
          },
        },
      },
    };
    onUpdated(updated);
    return;
  }
  if (colId === 'notes') {
    const updated: ScannedItem = {
      ...item,
      cardData: {
        ...item.cardData,
        payload: {
          ...payload,
          itemDetails: { ...details, notes: str(newValue) },
        },
      },
    };
    onUpdated(updated);
  }
}

// Column definitions for scanned items - matching itemsColumnDefs structure
const createScannedItemsColumnDefs = (
  columnVisibility: Record<string, boolean>,
  onScanItemUpdated?: OnScanItemUpdated
): ColDef<ScannedItem>[] => {
  const allColumns: ColDef<ScannedItem>[] = [
    {
      headerName: '',
      colId: 'select',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'select' as any,
      width: 32,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      wrapHeaderText: false,
      autoHeaderHeight: true,
      headerComponent: SelectAllHeader,
      headerComponentParams: {},
      cellStyle: {
        overflow: 'visible',
        textOverflow: 'clip',
        whiteSpace: 'normal',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
      },
      headerStyle: {
        overflow: 'visible',
        textOverflow: 'clip',
        whiteSpace: 'normal',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        minHeight: '48px',
        height: '48px',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const handleMouseEvent = (e: React.MouseEvent) => {
          e.stopPropagation();
        };

        const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
          e.stopPropagation();
          e.preventDefault();

          const currentRowIndex = params.node.rowIndex ?? -1;
          const api = params.api;
          const currentSelection = params.node.isSelected();
          const newNodeState = !currentSelection;

          // Check for modifier keys
          const isShiftKey = e.shiftKey;
          const isMetaKey = e.metaKey;
          const isCtrlKey = e.ctrlKey;
          const isModifierKey = isMetaKey || isCtrlKey;

          if (
            isShiftKey &&
            lastSelectedRowIndex !== null &&
            lastSelectedRowIndex >= 0 &&
            currentRowIndex >= 0
          ) {
            // Range selection with Shift key
            const startIndex = Math.min(lastSelectedRowIndex, currentRowIndex);
            const endIndex = Math.max(lastSelectedRowIndex, currentRowIndex);

            // Collect all displayed nodes in the range
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const nodesInRange: any[] = [];
            for (let i = startIndex; i <= endIndex; i++) {
              const node = api.getDisplayedRowAtIndex(i);
              if (node && node.setSelected) {
                nodesInRange.push(node);
              }
            }

            // Apply the same state to all nodes in range
            nodesInRange.forEach((node) => {
              node.setSelected(newNodeState, false);
            });

            lastSelectedRowIndex = currentRowIndex;
          } else if (isModifierKey) {
            // Command/Ctrl click - toggle individual row
            params.node.setSelected(newNodeState, false);
            lastSelectedRowIndex = currentRowIndex;
          } else {
            // Regular click - toggle single row
            params.node.setSelected(newNodeState, false);
            lastSelectedRowIndex = currentRowIndex;
          }
        };

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
            onClick={handleMouseEvent}
            onMouseDown={handleMouseEvent}
          >
            <input
              type='checkbox'
              className='rounded'
              checked={params.node.isSelected()}
              onChange={(e) => {
                e.stopPropagation();
              }}
              onClick={handleCheckboxClick}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
        );
      },
    },
    {
      headerName: 'SKU',
      colId: 'sku',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'sku' as any,
      width: 140,
      editable: !!onScanItemUpdated,
      valueGetter: (params) =>
        (params.data as ScannedItem)?.cardData?.payload?.itemDetails?.internalSKU ??
        (params.data as ScannedItem)?.cardData?.payload?.serialNumber ??
        '',
      valueSetter:
        onScanItemUpdated &&
        ((params) => {
          const item = params.data as ScannedItem;
          if (item) applyScanEdit(item, 'sku', params.newValue, onScanItemUpdated);
          return true;
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const p = item?.cardData?.payload;
        return p?.itemDetails?.internalSKU ?? p?.serialNumber ?? '';
      },
    },
    {
      headerName: 'Item',
      colId: 'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'name' as any,
      width: 300,
      sortable: true,
      filter: false,
      resizable: true,
      editable: !!onScanItemUpdated,
      valueGetter: (params) => (params.data as ScannedItem)?.cardData?.payload?.itemDetails?.name ?? '',
      valueSetter:
        onScanItemUpdated &&
        ((params) => {
          const item = params.data as ScannedItem;
          if (item) applyScanEdit(item, 'name', params.newValue, onScanItemUpdated);
          return true;
        }),
      cellStyle: {
        padding: '0 16px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        return (
          <div
            style={{
              width: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              fontSize: '14px',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            <div
              style={{
                height: '41px',
                flex: 1,
                position: 'relative',
                lineHeight: '41px',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#0a68f3',
                cursor: 'pointer',
              }}
            >
              {item.cardData.payload.itemDetails.name}
            </div>
          </div>
        );
      },
    },
    {
      headerName: 'Image',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'imageUrl' as any,
      width: 80,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const imageUrl = item.cardData.payload.itemDetails.imageUrl;
        if (!imageUrl) return <div className='w-8 h-8 rounded' />;

        // Check if it's an uploaded file (data URL)
        const isUploadedFile = imageUrl.startsWith('data:');

        if (isUploadedFile) {
          return (
            <Image
              src={imageUrl}
              alt={item.cardData.payload.itemDetails.name}
              width={32}
              height={32}
              className='w-8 h-8 object-contain rounded'
            />
          );
        }

        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.cardData.payload.itemDetails.name}
            className='w-8 h-8 object-contain rounded'
          />
        );
      },
    },
    {
      headerName: 'Classification',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'classification' as any,
      width: 150,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const itemDetails = item?.cardData?.payload?.itemDetails as { classification?: { type?: string; subType?: string } } | undefined;
        const classification = itemDetails?.classification;
        if (!classification?.type && !classification?.subType) return '-';
        const parts = [classification.type, classification.subType].filter(Boolean);
        return <span className='text-black'>{parts.join(' / ') || '-'}</span>;
      },
    },
    {
      headerName: 'Supplier',
      colId: 'supplier',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'supplier' as any,
      width: 180,
      editable: !!onScanItemUpdated,
      valueGetter: (params) =>
        (params.data as ScannedItem)?.cardData?.payload?.itemDetails?.primarySupply?.supplier ?? '',
      valueSetter:
        onScanItemUpdated &&
        ((params) => {
          const item = params.data as ScannedItem;
          if (item) applyScanEdit(item, 'supplier', params.newValue, onScanItemUpdated);
          return true;
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const supplier =
          item.cardData.payload.itemDetails.primarySupply?.supplier;
        if (!supplier) return '-';
        return <span className='text-black'>{supplier}</span>;
      },
    },
    {
      headerName: 'Facility',
      colId: 'facility',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'facility' as any,
      width: 160,
      editable: !!onScanItemUpdated,
      valueGetter: (params) =>
        (params.data as ScannedItem)?.cardData?.payload?.itemDetails?.locator?.facility ?? '',
      valueSetter:
        onScanItemUpdated &&
        ((params) => {
          const item = params.data as ScannedItem;
          if (item) applyScanEdit(item, 'facility', params.newValue, onScanItemUpdated);
          return true;
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const facility = item.cardData.payload.itemDetails.locator?.facility;
        return <span className='text-black'>{facility || '-'}</span>;
      },
    },
    {
      headerName: 'Location',
      colId: 'location',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'location' as any,
      width: 160,
      editable: !!onScanItemUpdated,
      valueGetter: (params) => {
        const locator = (params.data as ScannedItem)?.cardData?.payload?.itemDetails?.locator as { location?: string; subLocation?: string } | undefined;
        return locator?.location ?? locator?.subLocation ?? '';
      },
      valueSetter:
        onScanItemUpdated &&
        ((params) => {
          const item = params.data as ScannedItem;
          if (item) applyScanEdit(item, 'location', params.newValue, onScanItemUpdated);
          return true;
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const locator = item.cardData.payload.itemDetails.locator as { location?: string; subLocation?: string } | undefined;
        const location = locator?.location ?? locator?.subLocation;
        return <span className='text-black'>{location || '-'}</span>;
      },
    },
    {
      headerName: 'Unit Price',
      colId: 'unitCost',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'unitCost' as any,
      width: 120,
      editable: !!onScanItemUpdated,
      valueGetter: (params) => {
        const item = params.data as ScannedItem;
        const unitCost =
          item?.cardData?.payload?.itemDetails?.primarySupply?.unitCost;
        return unitCost?.value != null ? String(unitCost.value) : '';
      },
      valueSetter:
        onScanItemUpdated &&
        ((params) => {
          const item = params.data as ScannedItem;
          if (item) applyScanEdit(item, 'unitCost', params.newValue, onScanItemUpdated);
          return true;
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const unitCost =
          item.cardData.payload.itemDetails.primarySupply?.unitCost;
        if (!unitCost) return '-';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return formatCurrency(unitCost as any);
      },
    },
    {
      headerName: 'Created',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'created' as any,
      width: 150,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const created = item.cardData.asOf?.recorded;
        if (!created) return '-';
        return formatDateTime(new Date(created).toISOString());
      },
    },
    {
      headerName: 'Order Method',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'orderMethod' as any,
      width: 120,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const orderMethod = (item?.cardData?.payload?.itemDetails?.primarySupply as { orderMethod?: string })?.orderMethod;
        if (!orderMethod) return '-';
        const label = orderMethodOptions.find((o) => o.value === orderMethod)?.label ?? orderMethod;
        return <span className='text-black'>{label}</span>;
      },
    },
    {
      headerName: 'Order Units',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'orderQuantity' as any,
      width: 120,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        return formatQuantity(
          item.cardData.payload.itemDetails.primarySupply?.orderQuantity
        );
      },
    },
    {
      headerName: 'Min Units',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'minQuantity' as any,
      width: 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        return formatQuantity(item.cardData.payload.itemDetails.minQuantity);
      },
    },
    {
      headerName: 'Card Size',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'cardSize' as any,
      width: 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        return item.cardData.payload.itemDetails.cardSize || '-';
      },
    },
    {
      headerName: '# of Cards',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'cardCount' as any,
      width: 100,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const qty = item?.cardData?.payload?.cardQuantity;
        if (!qty || qty.amount == null) return '-';
        return formatQuantity(qty);
      },
    },

    {
      headerName: 'Notes',
      colId: 'notes',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field: 'notes' as any,
      width: 100,
      editable: !!onScanItemUpdated,
      valueGetter: (params) =>
        (params.data as ScannedItem)?.cardData?.payload?.itemDetails?.notes ?? '',
      valueSetter:
        onScanItemUpdated &&
        ((params) => {
          const item = params.data as ScannedItem;
          if (item) applyScanEdit(item, 'notes', params.newValue, onScanItemUpdated);
          return true;
        }),
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const item = params.data as ScannedItem;
        const notes = item.cardData.payload.itemDetails.notes;
        return notes || '-';
      },
    },
  ];

  // Field -> view key mapping (same as ItemTableAGGrid)
  const fieldMapping: Record<string, string> = {
    select: 'select',
    sku: 'sku',
    imageUrl: 'image',
    name: 'item',
    classification: 'classification',
    supplier: 'supplier',
    facility: 'facility',
    location: 'location',
    unitCost: 'unitCost',
    created: 'created',
    orderMethod: 'orderMethod',
    orderQuantity: 'orderQty',
    minQuantity: 'minUnits',
    cardSize: 'cardSize',
    cardCount: 'cardCount',
    notes: 'notes',
  };

  // Filter columns based on visibility (same logic as ItemTableAGGrid)
  return allColumns.filter((col) => {
    // Always show the checkbox/select column
    if ((col.field as string) === 'select' || col.headerName === '') {
      return true;
    }

    const visibilityKey = fieldMapping[col.field as string];

    if (visibilityKey) {
      return columnVisibility[visibilityKey] !== false;
    }

    // Default: visible
    return true;
  });
};

export function DesktopScanView({
  isOpen,
  onClose,
  onScan,
  initialCardId,
}: DesktopScanViewProps) {
  const { handleAuthError } = useAuthErrorHandler();
  const { refreshOrderQueueData } = useOrderQueue();
  const LOG_PREFIX = '[DesktopScan]';
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [initialCardLoaded, setInitialCardLoaded] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set(Object.keys(CARD_STATE_CONFIG).filter((key) => key !== 'UNKNOWN'))
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    sku: true,
    image: true,
    item: true,
    classification: true,
    supplier: true,
    facility: true,
    location: true,
    unitCost: true,
    created: true,
    orderMethod: true,
    orderQty: true,
    minUnits: true,
    cardSize: true,
    cardCount: true,
    actions: true,
    notes: true,
  });
  const [isItemDetailsPanelOpen, setIsItemDetailsPanelOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] =
    useState<ItemCard | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<items.Item | null>(null);
  const [isClearItemsModalOpen, setIsClearItemsModalOpen] = useState(false);
  const [isCantAddCardsModalOpen, setIsCantAddCardsModalOpen] = useState(false);
  const [isCantReceiveCardsModalOpen, setIsCantReceiveCardsModalOpen] =
    useState(false);
  const [cardsCantAddCount, setCardsCantAddCount] = useState(0);
  const [cardsCantReceiveCount, setCardsCantReceiveCount] = useState(0);
  const gridRef = useRef<ArdaGridRef>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef<string>('');
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const extractCardIdFromQR = useCallback((qrText: string): string | null => {
    try {
      const urlMatch = qrText.match(/\/kanban\/cards\/([a-f0-9-]+)/i);
      if (urlMatch) return urlMatch[1];

      const uuidMatch = qrText.match(
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
      );
      if (uuidMatch) return qrText;

      return null;
    } catch (err) {
      console.error('Error extracting card ID:', err);
      return null;
    }
  }, []);

  const handleScannerInput = useCallback(
    async (scannedText: string) => {
      console.info(LOG_PREFIX, 'Scanner input received', scannedText);
      try {
        const cardId = extractCardIdFromQR(scannedText);
        if (!cardId) {
          console.warn(LOG_PREFIX, 'Invalid QR detected', scannedText);
          toast.error('Not a valid Arda QR code');
          return;
        }

        // Check if already scanned
        const existingItem = scannedItems.find(
          (item) => item.cardData.payload.eId === cardId
        );
        if (existingItem) {
          console.info(LOG_PREFIX, 'Card already scanned, ignoring', cardId);
          toast.info('Card already scanned');
          return;
        }

        console.info(LOG_PREFIX, 'Fetching card data for', cardId);
        const fetchedCardData = await getKanbanCard(cardId);
        const newItem: ScannedItem = {
          id: fetchedCardData.payload.eId,
          cardData: fetchedCardData,
        };

        setScannedItems((prev) => [...prev, newItem]);
        console.info(
          LOG_PREFIX,
          'Card added to list',
          fetchedCardData.payload.eId
        );

        if (onScan) {
          onScan(scannedText);
        }
      } catch (err) {
        console.error('Error processing scanned code:', err);
        if (handleAuthError(err)) {
          return;
        }
        toast.error('Card not found');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extractCardIdFromQR, scannedItems, onScan]
  );

  // Load initial card if provided
  useEffect(() => {
    if (!isOpen || !initialCardId || initialCardLoaded) return;

    const loadInitialCard = async () => {
      try {
        console.info(LOG_PREFIX, 'Loading initial card', initialCardId);
        const cardData = await getKanbanCard(initialCardId);
        const newItem: ScannedItem = {
          id: cardData.payload.eId,
          cardData: cardData,
        };

        setScannedItems([newItem]);
        setInitialCardLoaded(true);
        console.info(LOG_PREFIX, 'Initial card loaded', cardData.payload.eId);

        if (onScan) {
          onScan(initialCardId);
        }
      } catch (err) {
        console.error('Error loading initial card:', err);
        if (handleAuthError(err)) {
          return;
        }
        toast.error('Failed to load card');
      }
    };

    loadInitialCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCardId, initialCardLoaded, onScan]);

  // Reset initialCardLoaded when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInitialCardLoaded(false);
      setScannedItems([]);
      setSelectedItems(new Set());
    }
  }, [isOpen]);

  // Handle keyboard input from physical scanner
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      console.debug(LOG_PREFIX, 'Keyboard event', {
        key: event.key,
        target:
          event.target instanceof HTMLElement
            ? event.target.tagName
            : 'unknown',
      });
      // Ignore if user is typing in an input field
      const isOurHiddenInput =
        event.target instanceof HTMLInputElement &&
        event.target === scanInputRef.current;
      const isOtherTextInput =
        (event.target instanceof HTMLInputElement && !isOurHiddenInput) ||
        event.target instanceof HTMLTextAreaElement;
      if (isOtherTextInput) {
        console.debug(LOG_PREFIX, 'Key event ignored (other input focused)');
        return;
      }

      // Clear timeout if it exists
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // If Enter is pressed, process the scanned code
      if (event.key === 'Enter') {
        event.preventDefault();
        const scannedCode = scanBufferRef.current.trim();
        console.info(
          LOG_PREFIX,
          'Enter pressed, processing buffer',
          scannedCode
        );
        if (scannedCode.length > 0) {
          handleScannerInput(scannedCode);
          scanBufferRef.current = '';
        }
      } else if (event.key.length === 1) {
        console.debug(LOG_PREFIX, 'Accumulating scan buffer', event.key);
        // Accumulate characters (scanners typically send characters very quickly)
        scanBufferRef.current += event.key;

        // Set timeout to clear buffer if no more input comes (handles slow typing)
        scanTimeoutRef.current = setTimeout(() => {
          scanBufferRef.current = '';
        }, 100);
      }
    };

    // Focus a hidden input to capture scanner input
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [isOpen, handleScannerInput]);

  // Handle selection change from grid
  const handleSelectionChanged = useCallback((selectedRows: ScannedItem[]) => {
    setSelectedItems(new Set(selectedRows.map((item) => item.id)));
    console.info(
      LOG_PREFIX,
      'Selection changed',
      selectedRows.map((item) => item.id)
    );
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mapScannedItemToItemCard = (scannedItem: ScannedItem): ItemCard => {
    return {
      eid: scannedItem.cardData.payload.item.eId,
      title: scannedItem.cardData.payload.itemDetails.name,
      supplier:
        scannedItem.cardData.payload.itemDetails.primarySupply?.supplier || '',
      image: scannedItem.cardData.payload.itemDetails.imageUrl || '',
      link: '',
      sku:
        scannedItem.cardData.payload.itemDetails?.internalSKU ??
        scannedItem.cardData.payload.serialNumber,
      serialNumber: scannedItem.cardData.payload.serialNumber,
      unitPrice:
        scannedItem.cardData.payload.itemDetails.primarySupply?.unitCost
          ?.value || 0,
      minQty:
        scannedItem.cardData.payload.itemDetails.minQuantity?.amount.toString() ||
        '',
      minUnit: scannedItem.cardData.payload.itemDetails.minQuantity?.unit || '',
      location: scannedItem.cardData.payload.itemDetails.locator
        ? `${scannedItem.cardData.payload.itemDetails.locator.facility} ${scannedItem.cardData.payload.itemDetails.locator.location}`.trim()
        : '',
      orderQty:
        scannedItem.cardData.payload.itemDetails.primarySupply?.orderQuantity?.amount.toString() ||
        '',
      orderUnit:
        scannedItem.cardData.payload.itemDetails.primarySupply?.orderQuantity
          ?.unit || '',
    };
  };

  const handleViewItemDetails = () => {
    if (selectedItems.size === 1) {
      const itemId = Array.from(selectedItems)[0];
      const item = scannedItems.find((i) => i.id === itemId);
      if (item) {
        setSelectedItemForDetails(mapScannedItemToItemCard(item));
        setIsItemDetailsPanelOpen(true);
        setIsActionsMenuOpen(false);
      }
    }
  };

  // Function to handle edit item
  const handleEditItem = () => {
    if (selectedItems.size === 1) {
      const itemId = Array.from(selectedItems)[0];
      const item = scannedItems.find((i) => i.id === itemId);
      if (item?.cardData?.payload?.itemDetails) {
        const currentCardData = item.cardData;

        // Convert KanbanCardData to Item format for editing with all required fields
        const itemData: items.Item = {
          // Required JournalledEntity fields - using placeholder values since we're only editing
          entityId: currentCardData.payload.item.eId,
          recordId: currentCardData.rId,
          author: currentCardData.author || 'system',
          timeCoordinates: {
            recordedAsOf: currentCardData.asOf.recorded,
            effectiveAsOf: currentCardData.asOf.effective,
          },
          createdCoordinates: {
            recordedAsOf: currentCardData.asOf.recorded,
            effectiveAsOf: currentCardData.asOf.effective,
          },

          // Item-specific fields
          name: currentCardData.payload.itemDetails.name,
          imageUrl: currentCardData.payload.itemDetails.imageUrl,
          classification: {
            type: '',
            subType: '',
          },
          useCase: '',
          locator: currentCardData.payload.itemDetails.locator
            ? {
                facility:
                  currentCardData.payload.itemDetails.locator.facility || '',
                department: '', // Not available in card data
                location:
                  currentCardData.payload.itemDetails.locator.location || '',
              }
            : {
                facility: '',
                department: '',
                location: '',
              },
          internalSKU:
            currentCardData.payload.itemDetails?.internalSKU ??
            currentCardData.payload.serialNumber ??
            '',
          minQuantity:
            currentCardData.payload.itemDetails?.minQuantity || defaultQuantity,
          notes: currentCardData.payload.itemDetails.notes || '',
          cardNotesDefault:
            currentCardData.payload.itemDetails.cardNotesDefault || '',
          taxable: true, // Default to true as per form
          primarySupply:
            currentCardData.payload.itemDetails.primarySupply &&
            currentCardData.payload.itemDetails.primarySupply.supplier
              ? {
                  supplyEId:
                    currentCardData.payload.itemDetails.primarySupply.supplyEId,
                  name:
                    currentCardData.payload.itemDetails.primarySupply.name,
                  supplier:
                    currentCardData.payload.itemDetails.primarySupply
                      .supplier || '',
                  sku:
                    currentCardData.payload.itemDetails.primarySupply.sku ?? '',
                  url:
                    currentCardData.payload.itemDetails.primarySupply.url ?? '',
                  orderQuantity:
                    currentCardData.payload.itemDetails.primarySupply
                      .orderQuantity || defaultQuantity,
                  unitCost: currentCardData.payload.itemDetails.primarySupply
                    .unitCost
                    ? {
                        value:
                          currentCardData.payload.itemDetails.primarySupply
                            .unitCost.value,
                        currency: currentCardData.payload.itemDetails
                          .primarySupply.unitCost.currency as Currency,
                      }
                    : defaultMoney,
                  minimumQuantity:
                    currentCardData.payload.itemDetails.minQuantity ||
                    defaultQuantity,
                  orderMechanism:
                    (currentCardData.payload.itemDetails.primarySupply as { orderMethod?: string })
                      ?.orderMethod as items.OrderMechanism ?? defaultOrderMechanism,
                  averageLeadTime: defaultDuration,
                  orderNotes: '',
                  orderCost: {
                    value:
                      (currentCardData.payload.itemDetails.primarySupply
                        .unitCost?.value ?? 0.0) *
                      (currentCardData.payload.itemDetails.primarySupply
                        .orderQuantity?.amount ?? 0.0),
                    currency:
                      (currentCardData.payload.itemDetails.primarySupply
                        .unitCost?.currency as Currency) ??
                      defaultMoney.currency,
                  },
                }
              : {
                  supplier: '',
                  unitCost: defaultMoney,
                  minimumQuantity: defaultQuantity,
                  orderQuantity: defaultQuantity,
                  orderMechanism:
                    (currentCardData.payload.itemDetails.primarySupply as { orderMethod?: string })
                      ?.orderMethod as items.OrderMechanism ?? defaultOrderMechanism,
                  averageLeadTime: defaultDuration,
                  orderNotes: '',
                  orderCost: defaultMoney,
                },
          defaultSupply:
            currentCardData.payload.itemDetails.defaultSupply || '',
          cardSize:
            (currentCardData.payload.itemDetails.cardSize as items.CardSize) ||
            defaultCardSize,
          labelSize:
            (currentCardData.payload.itemDetails
              .labelSize as items.LabelSize) || defaultLabelSize,
          breadcrumbSize:
            (currentCardData.payload.itemDetails
              .breadcrumbSize as items.BreadcrumbSize) || defaultBreadcrumbSize,
          color:
            (currentCardData.payload.itemDetails
              .itemColor as items.ItemColor) || 'GRAY',
        };

        setItemToEdit(itemData);
        setIsItemDetailsPanelOpen(false);
        setIsEditFormOpen(true);
      }
    }
  };

  // Function to close edit form
  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setItemToEdit(null);
  };

  const handleEditSuccess = async () => {
    const editedEntityId = itemToEdit?.entityId;
    setIsEditFormOpen(false);
    setItemToEdit(null);

    if (!editedEntityId) return;
    const scannedItem = scannedItems.find(
      (i) => i.cardData?.payload?.item?.eId === editedEntityId
    );
    if (!scannedItem) return;
    try {
      const refreshedData = await getKanbanCard(scannedItem.id);
      setScannedItems((prev) =>
        prev.map((i) =>
          i.id === scannedItem.id ? { ...i, cardData: refreshedData } : i
        )
      );
    } catch {
      // Refresh failed; table still shows previous data
    }
  };

  const handleAddToOrderQueue = async () => {
    if (selectedItems.size === 0) return;

    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) return;

      const selectedItemsArray = Array.from(selectedItems);
      const itemsCanAdd: string[] = [];
      const itemsCantAdd: string[] = [];

      selectedItemsArray.forEach((itemId) => {
        const item = scannedItems.find((i) => i.id === itemId);
        if (item) {
          const itemStatus =
            item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
          if (canAddToOrderQueue(itemStatus)) {
            itemsCanAdd.push(itemId);
          } else {
            itemsCantAdd.push(itemId);
          }
        }
      });

      // If there are items that can't be added, show modal
      if (itemsCantAdd.length > 0) {
        setCardsCantAddCount(itemsCantAdd.length);
        setIsCantAddCardsModalOpen(true);
        setIsActionsMenuOpen(false);
        return;
      }

      // If all can be added, proceed directly
      await addItemsToOrderQueue(itemsCanAdd, jwtToken);
      setIsActionsMenuOpen(false);
    } catch (error) {
      console.error('Error adding to order queue:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error adding to order queue');
    }
  };

  const addItemsToOrderQueue = async (itemIds: string[], jwtToken: string) => {
    const successfulItemIds: string[] = [];

    for (const itemId of itemIds) {
      const item = scannedItems.find((i) => i.id === itemId);
      if (!item) continue;

      try {
        const response = await fetch(
          `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/request`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            successfulItemIds.push(itemId);
          }
        }
      } catch (error) {
        console.error('Error adding item to order queue:', error);
      }
    }

    if (successfulItemIds.length > 0) {
      setScannedItems((prev) =>
        prev.filter((item) => !successfulItemIds.includes(item.id))
      );
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        successfulItemIds.forEach((id) => newSet.delete(id));
        return newSet;
      });

      // Update order queue count after adding cards
      await refreshOrderQueueData();

      toast.success(
        <div className='flex flex-col gap-0.5'>
          <div className='font-semibold text-[#0a0a0a]'>
            Cards sent to order queue
          </div>
          <div className='text-sm text-[#737373]'>
            They will be waiting for you in the order queue.
          </div>
        </div>,
        {
          icon: <ShoppingCart className='w-4 h-4' />,
        }
      );
    }
  };

  const handleReceiveCard = async () => {
    if (selectedItems.size === 0) return;

    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) return;

      const selectedItemsArray = Array.from(selectedItems);

      // Separate items that can and cannot be received
      const itemsCanReceive: string[] = [];
      const itemsCantReceive: string[] = [];

      selectedItemsArray.forEach((itemId) => {
        const item = scannedItems.find((i) => i.id === itemId);
        if (item) {
          const itemStatus =
            item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
          // Items that are already FULFILLED cannot be received again
          if (itemStatus !== 'FULFILLED') {
            itemsCanReceive.push(itemId);
          } else {
            itemsCantReceive.push(itemId);
          }
        }
      });

      // If there are items that can't be received, show modal
      if (itemsCantReceive.length > 0) {
        setCardsCantReceiveCount(itemsCantReceive.length);
        setIsCantReceiveCardsModalOpen(true);
        setIsActionsMenuOpen(false);
        return;
      }

      // If all can be received, proceed directly
      await receiveItems(itemsCanReceive, jwtToken);
      setIsActionsMenuOpen(false);
    } catch (error) {
      console.error('Error receiving card:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error receiving card');
    }
  };

  const receiveItems = async (itemIds: string[], jwtToken: string) => {
    const successfulItemIds: string[] = [];

    for (const itemId of itemIds) {
      const item = scannedItems.find((i) => i.id === itemId);
      if (!item) continue;

      try {
        const response = await fetch(
          `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/fulfill`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            successfulItemIds.push(itemId);
          }
        }
      } catch (error) {
        console.error('Error receiving item:', error);
      }
    }

    if (successfulItemIds.length > 0) {
      setScannedItems((prev) =>
        prev.filter((item) => !successfulItemIds.includes(item.id))
      );
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        successfulItemIds.forEach((id) => newSet.delete(id));
        return newSet;
      });

      toast.success(
        <div className='flex flex-col gap-0.5'>
          <div className='font-semibold text-[#0a0a0a]'>Receive card</div>
          <div className='text-sm text-[#737373]'>
            Cards have been received and restocked.
          </div>
        </div>,
        {
          icon: <PackageOpen className='w-4 h-4' />,
        }
      );
    }
  };

  const handleSetCardState = async (newState: string) => {
    if (selectedItems.size === 0) return;

    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        console.error('Authentication token not found');
        return;
      }

      // Validate state
      if (
        !['REQUESTING', 'REQUESTED', 'IN_PROCESS', 'FULFILLED'].includes(
          newState
        )
      ) {
        console.error('Unknown state change');
        return;
      }

      // Get success message based on state
      const successMessages: Record<string, string> = {
        REQUESTING: 'Card status changed to In Order Queue',
        REQUESTED: 'Card status changed to In Progress',
        IN_PROCESS: 'Card status changed to Receiving',
        FULFILLED: 'Card status changed to Restocked',
      };

      // Update state for all selected items
      const selectedItemsArray = Array.from(selectedItems);
      let successCount = 0;

      for (const itemId of selectedItemsArray) {
        const item = scannedItems.find((i) => i.id === itemId);
        if (!item) {
          continue;
        }

        let stateEndpoint = '';
        switch (newState) {
          case 'REQUESTING':
            stateEndpoint = `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/request`;
            break;
          case 'REQUESTED':
            stateEndpoint = `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/accept`;
            break;
          case 'IN_PROCESS':
            stateEndpoint = `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/start-processing`;
            break;
          case 'FULFILLED':
            stateEndpoint = `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/fulfill`;
            break;
        }

        if (stateEndpoint) {
          try {
            const response = await fetch(stateEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.ok) {
                // Update the item's status in scannedItems
                setScannedItems((prev) =>
                  prev.map((scannedItem) =>
                    scannedItem.id === itemId
                      ? {
                          ...scannedItem,
                          cardData: {
                            ...scannedItem.cardData,
                            payload: {
                              ...scannedItem.cardData.payload,
                              status: newState,
                            },
                          },
                        }
                      : scannedItem
                  )
                );
                successCount++;
              }
            }
          } catch (error) {
            console.error('Error changing card state:', error);
          }
        }
      }

      setIsActionsMenuOpen(false);

      const totalCount = selectedItemsArray.length;
      if (successCount > 0) {
        const message =
          successCount === totalCount
            ? successMessages[newState]
            : `${successMessages[newState]} (${successCount}/${totalCount} cards)`;
        toast.success(message);
      } else {
        toast.error('Failed to change card state');
      }
    } catch (error) {
      console.error('Error changing card state:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error changing card state');
    }
  };

  const filteredItems = scannedItems.filter((item) => {
    const status = item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
    return selectedFilters.has(status);
  });

  const handleScanItemUpdated = useCallback((updated: ScannedItem) => {
    setScannedItems((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  }, []);

  const columnDefs = createScannedItemsColumnDefs(
    columnVisibility,
    handleScanItemUpdated
  );

  // Force grid remount when visible columns change
  const gridRemountKey = `desktop-scan-grid-${Object.entries(columnVisibility)
    .filter((entry) => entry[1] !== false)
    .map(([key]) => key)
    .sort()
    .join('_')}`;

  if (!isOpen) return null;

  return (
    <>
      <div
        className='fixed inset-0 z-50 flex items-center justify-center'
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(0px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className='relative w-full max-w-6xl mx-4 bg-white rounded-lg shadow-lg flex flex-col h-[90vh]'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hidden input to capture scanner input */}
          <input
            ref={scanInputRef}
            type='text'
            autoFocus
            data-scan-input
            tabIndex={-1}
            className='absolute opacity-0 pointer-events-none'
            style={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
            }}
            onBlur={(e) => {
              if (!isOpen) return;
              setTimeout(() => {
                const active = document.activeElement;
                if (active?.closest?.('.ag-theme-arda') ?? active?.closest?.('.ag-grid')) {
                  return;
                }
                if (e.target instanceof HTMLInputElement) e.target.focus();
              }, 0);
            }}
          />

          {/* Header */}
          <div className='px-6 pt-6 pb-4 '>
            <div className='flex items-start justify-between'>
              <div>
                <b className='text-xl font-semibold text-[#0a0a0a] block mb-1'>
                  Scan cards
                </b>
                <div className='text-sm text-[#737373]'>
                  Scan one card or an entire stack.
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={onClose}
                  className='text-[#0a0a0a] opacity-70 hover:opacity-100'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className='px-6 py-3  mb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  onClick={handleAddToOrderQueue}
                  disabled={selectedItems.size === 0}
                  className='flex items-center gap-2 min-w-[140px] h-10'
                >
                  <ShoppingCart className='h-4 w-4' />
                  Add to order queue
                </Button>
                <Button
                  variant='outline'
                  onClick={handleReceiveCard}
                  disabled={selectedItems.size === 0}
                  className='flex items-center gap-2 min-w-[140px] h-10'
                >
                  <PackageOpen className='h-4 w-4' />
                  Receive card
                </Button>
                <Button
                  variant='outline'
                  onClick={handleViewItemDetails}
                  disabled={selectedItems.size !== 1}
                  className='flex items-center gap-2 min-w-[140px] h-10'
                >
                  <FileText className='h-4 w-4' />
                  View/Edit details
                </Button>
                <div className='relative' ref={actionsMenuRef}>
                  <Button
                    variant='outline'
                    onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                    className='flex items-center justify-center w-10 h-10 p-0'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                  {isActionsMenuOpen && (
                    <div
                      className='absolute top-full left-0 mt-1 w-full min-w-[284px] shadow-lg rounded-lg bg-white border border-[#e5e5e5] flex flex-col items-start p-1 z-50'
                      style={{
                        boxShadow:
                          '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {/* Selection Section */}
                      <div className='w-full flex flex-col items-start py-1.5 px-2'>
                        <div className='w-full text-sm font-semibold text-[#0a0a0a] leading-5'>
                          Selection
                        </div>
                      </div>

                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => {
                            const api = gridRef.current?.getGridApi();
                            if (api) {
                              api.deselectAll();
                            }
                            setIsActionsMenuOpen(false);
                          }}
                          className='w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 hover:bg-gray-50'
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Deselect all
                          </span>
                          <div className='w-4 h-4 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center absolute left-2'>
                            <X className='w-2.5 h-2.5 text-[#0a0a0a]' />
                          </div>
                        </button>
                      </div>

                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => {
                            if (selectedItems.size > 0) {
                              setIsClearItemsModalOpen(true);
                              setIsActionsMenuOpen(false);
                            }
                          }}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Remove selected from list
                          </span>
                          <X className='w-4 h-4 text-[#0a0a0a] absolute left-2' />
                        </button>
                      </div>

                      {/* Separator */}
                      <div className='w-full h-px bg-[#e5e5e5] my-1 mx-0' />

                      {/* Set state Section */}
                      <div className='w-full flex flex-col items-start py-1.5 px-2'>
                        <div className='w-full text-sm font-semibold text-[#0a0a0a] leading-5'>
                          Set state
                        </div>
                      </div>

                      {/* In Order Queue */}
                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => handleSetCardState('REQUESTING')}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            In Order Queue
                          </span>
                        </button>
                      </div>

                      {/* In Progress */}
                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => handleSetCardState('REQUESTED')}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            In Progress
                          </span>
                        </button>
                      </div>

                      {/* Receiving */}
                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => handleSetCardState('IN_PROCESS')}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Receiving
                          </span>
                        </button>
                      </div>

                      {/* Restocked */}
                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => handleSetCardState('FULFILLED')}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Restocked
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='flex items-center gap-2 min-w-[100px] h-10'
                  >
                    <SlidersHorizontal className='h-4 w-4' />
                    Filter
                    <ChevronDown className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='min-w-[200px]'>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setColumnVisibility({
                        sku: true,
                        image: true,
                        item: true,
                        classification: true,
                        supplier: true,
                        facility: true,
                        location: true,
                        unitCost: true,
                        created: true,
                        orderMethod: true,
                        orderQty: true,
                        minUnits: true,
                        cardSize: true,
                        cardCount: true,
                        actions: true,
                        notes: true,
                      });
                    }}
                  >
                    Show all
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setColumnVisibility({
                        sku: false,
                        image: false,
                        item: false,
                        classification: false,
                        supplier: false,
                        facility: false,
                        location: false,
                        unitCost: false,
                        created: false,
                        orderMethod: false,
                        orderQty: false,
                        minUnits: false,
                        cardSize: false,
                        cardCount: false,
                        actions: false,
                        notes: false,
                      });
                    }}
                  >
                    Hide all
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* State Section */}
                  <div className='w-full flex flex-col items-start py-1.5 px-2'>
                    <div className='w-full text-sm font-semibold text-[#0a0a0a] leading-5'>
                      State
                    </div>
                  </div>

                  {getAllCardStates()
                    .filter((stateConfig) => stateConfig.status !== 'UNKNOWN')
                    .map((stateConfig) => {
                      const isSelected = selectedFilters.has(
                        stateConfig.status
                      );
                      return (
                        <div
                          key={stateConfig.status}
                          className='w-full flex flex-col items-start'
                        >
                          <button
                            onClick={() => {
                              setSelectedFilters((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(stateConfig.status)) {
                                  newSet.delete(stateConfig.status);
                                } else {
                                  newSet.add(stateConfig.status);
                                }
                                return newSet;
                              });
                            }}
                            className='w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 hover:bg-gray-50'
                          >
                            <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                              {stateConfig.label}
                            </span>
                            {isSelected && (
                              <Check className='w-4 h-4 text-[#0a0a0a] absolute left-2' />
                            )}
                          </button>
                        </div>
                      );
                    })}

                  {/* Separator */}
                  <div className='w-full h-px bg-[#e5e5e5] my-1 mx-0' />

                  <div className='px-2 py-1.5 text-sm font-medium text-muted-foreground'>
                    Show
                  </div>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.sku}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        sku: checked,
                      }))
                    }
                  >
                    SKU
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.image}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        image: checked,
                      }))
                    }
                  >
                    Image
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.item}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        item: checked,
                      }))
                    }
                  >
                    Item
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.classification}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        classification: checked,
                      }))
                    }
                  >
                    Classification
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.supplier}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        supplier: checked,
                      }))
                    }
                  >
                    Supplier
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.facility}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        facility: checked,
                      }))
                    }
                  >
                    Facility
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.location}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        location: checked,
                      }))
                    }
                  >
                    Location
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.unitCost}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        unitCost: checked,
                      }))
                    }
                  >
                    Unit Cost
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.created}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        created: checked,
                      }))
                    }
                  >
                    Created
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.orderMethod}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        orderMethod: checked,
                      }))
                    }
                  >
                    Order Method
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.orderQty}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        orderQty: checked,
                      }))
                    }
                  >
                    Order Qty
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.minUnits}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        minUnits: checked,
                      }))
                    }
                  >
                    Min Units
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.cardSize}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        cardSize: checked,
                      }))
                    }
                  >
                    Card Size
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.cardCount}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        cardCount: checked,
                      }))
                    }
                  >
                    # of Cards
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.notes}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        notes: checked,
                      }))
                    }
                  >
                    Notes
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          <div className='flex-1 w-full min-h-[400px] overflow-hidden relative p-5'>
            <ArdaGrid
              key={gridRemountKey}
              ref={gridRef}
              rowData={filteredItems.length > 0 ? filteredItems : []}
              columnDefs={columnDefs}
              defaultColDef={itemsDefaultColDef}
              enableRowSelection={true}
              enableMultiRowSelection={true}
              onSelectionChanged={handleSelectionChanged}
              selectedItems={filteredItems.filter((item) =>
                selectedItems.has(item.id)
              )}
              className='h-full min-h-[400px]'
              height='100%'
              enableColumnStatePersistence={false}
              enableCellEditing={true}
              gridOptions={{
                getRowId: (params) => {
                  const item = params.data as ScannedItem;
                  if (item?.id) return item.id;
                  return `row-${Math.random().toString(36).substr(2, 9)}`;
                },
                suppressNoRowsOverlay: true,
                domLayout: 'normal',
                singleClickEdit: true,
              }}
            />
            {scannedItems.length === 0 && (
              <div
                className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10'
                style={{ top: '48px' }}
              >
                <Loader className='w-[130px] h-[130px] text-gray-300' />
                <div className='mt-4 text-sm text-[#737373]'>
                  Waiting for first scan...
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='px-6 py-4  flex justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 rounded-md text-sm font-medium bg-white border border-[#e5e5e5] hover:bg-gray-50 text-[#0a0a0a]'
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Item Details Panel */}
      {isItemDetailsPanelOpen && selectedItemForDetails && (
        <ItemDetailsPanel
          item={selectedItemForDetails}
          isOpen={isItemDetailsPanelOpen}
          onClose={() => {
            const itemId = selectedItemForDetails?.eid;
            setIsItemDetailsPanelOpen(false);
            setSelectedItemForDetails(null);
            if (itemId) {
              const scanned = scannedItems.find(
                (i) =>
                  i.cardData?.payload?.item?.eId === itemId ||
                  i.id === itemId
              );
              if (scanned) {
                getKanbanCard(scanned.id)
                  .then((refreshed) => {
                    setScannedItems((prev) =>
                      prev.map((i) =>
                        i.id === scanned.id
                          ? { ...i, cardData: refreshed }
                          : i
                      )
                    );
                  })
                  .catch(() => {});
              }
            }
          }}
          onOpenChange={() =>
            setIsItemDetailsPanelOpen(!isItemDetailsPanelOpen)
          }
          onEditItem={handleEditItem}
        />
      )}

      {/* Item Edit Form Panel */}
      <ItemFormPanel
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        itemToEdit={itemToEdit}
        onSuccess={handleEditSuccess}
      />

      {/* Can't Add Cards Modal */}
      {isCantAddCardsModalOpen && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCantAddCardsModalOpen(false);
          }}
        >
          <div
            className='relative w-[353px] max-w-[425px] rounded-[10px] bg-white border border-[#e5e5e5] shadow-lg p-6 flex flex-col items-end gap-4'
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Close Icon */}
            <button
              onClick={() => {
                // Deselect items that can't be added
                const selectedItemsArray = Array.from(selectedItems);
                const itemsCantAdd = selectedItemsArray.filter((itemId) => {
                  const item = scannedItems.find((i) => i.id === itemId);
                  if (item) {
                    const itemStatus =
                      item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
                    return !canAddToOrderQueue(itemStatus);
                  }
                  return false;
                });
                // Remove items that can't be added from selection
                setSelectedItems((prev) => {
                  const newSet = new Set(prev);
                  itemsCantAdd.forEach((id) => newSet.delete(id));
                  return newSet;
                });
                setIsCantAddCardsModalOpen(false);
              }}
              className='absolute top-4 right-4 w-4 h-4 flex items-center justify-center'
            >
              <X className='w-4 h-4 text-[#0a0a0a] opacity-70' />
            </button>

            {/* Header */}
            <div className='w-full flex flex-col items-start gap-1.5'>
              <b className='w-full text-base leading-6 text-[#0a0a0a] font-semibold'>
                Can&apos;t add some cards to order queue
              </b>
              <div className='w-full text-sm leading-5 text-[#737373] font-normal'>
                <b>{cardsCantAddCount} cards</b>
                <span>
                  {' '}
                  are in a state that won&apos;t allow them to be added to the
                  order queue. Would you like to add the rest?
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className='w-full flex items-center justify-end gap-2'>
              <button
                onClick={() => {
                  // Deselect items that can't be added
                  const selectedItemsArray = Array.from(selectedItems);
                  const itemsCantAdd = selectedItemsArray.filter((itemId) => {
                    const item = scannedItems.find((i) => i.id === itemId);
                    if (item) {
                      const itemStatus =
                        item.cardData.payload.status?.toUpperCase() ||
                        'UNKNOWN';
                      return !canAddToOrderQueue(itemStatus);
                    }
                    return false;
                  });
                  // Remove items that can't be added from selection
                  setSelectedItems((prev) => {
                    const newSet = new Set(prev);
                    itemsCantAdd.forEach((id) => newSet.delete(id));
                    return newSet;
                  });
                  setIsCantAddCardsModalOpen(false);
                }}
                className='h-9 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center px-4 text-sm leading-5 text-[#0a0a0a]'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const jwtToken = localStorage.getItem('idToken');
                  if (!jwtToken) return;

                  const selectedItemsArray = Array.from(selectedItems);
                  const itemsCanAdd = selectedItemsArray.filter((itemId) => {
                    const item = scannedItems.find((i) => i.id === itemId);
                    if (item) {
                      const itemStatus =
                        item.cardData.payload.status?.toUpperCase() ||
                        'UNKNOWN';
                      return canAddToOrderQueue(itemStatus);
                    }
                    return false;
                  });

                  // Deselect items that can't be added before processing
                  const itemsCantAdd = selectedItemsArray.filter((itemId) => {
                    const item = scannedItems.find((i) => i.id === itemId);
                    if (item) {
                      const itemStatus =
                        item.cardData.payload.status?.toUpperCase() ||
                        'UNKNOWN';
                      return !canAddToOrderQueue(itemStatus);
                    }
                    return false;
                  });

                  // Remove items that can't be added from selection
                  setSelectedItems((prev) => {
                    const newSet = new Set(prev);
                    itemsCantAdd.forEach((id) => newSet.delete(id));
                    return newSet;
                  });

                  await addItemsToOrderQueue(itemsCanAdd, jwtToken);
                  setIsCantAddCardsModalOpen(false);
                }}
                className='h-9 rounded-lg bg-[#fc5a29] flex items-center justify-center px-4 text-sm leading-5 text-white'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Add the rest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Can't Receive Cards Modal */}
      {isCantReceiveCardsModalOpen && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setIsCantReceiveCardsModalOpen(false);
          }}
        >
          <div
            className='relative w-[353px] max-w-[425px] rounded-[10px] bg-white border border-[#e5e5e5] shadow-lg p-6 flex flex-col items-end gap-4'
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Close Icon */}
            <button
              onClick={() => {
                // Deselect items that can't be received
                const selectedItemsArray = Array.from(selectedItems);
                const itemsCantReceive = selectedItemsArray.filter((itemId) => {
                  const item = scannedItems.find((i) => i.id === itemId);
                  if (item) {
                    const itemStatus =
                      item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
                    return itemStatus === 'FULFILLED';
                  }
                  return false;
                });
                // Remove items that can't be received from selection
                setSelectedItems((prev) => {
                  const newSet = new Set(prev);
                  itemsCantReceive.forEach((id) => newSet.delete(id));
                  return newSet;
                });
                setIsCantReceiveCardsModalOpen(false);
              }}
              className='absolute top-4 right-4 w-4 h-4 flex items-center justify-center'
            >
              <X className='w-4 h-4 text-[#0a0a0a] opacity-70' />
            </button>

            {/* Header */}
            <div className='w-full flex flex-col items-start gap-1.5'>
              <b className='w-full text-base leading-6 text-[#0a0a0a] font-semibold'>
                Can&apos;t receive some cards
              </b>
              <div className='w-full text-sm leading-5 text-[#737373] font-normal'>
                <b>{cardsCantReceiveCount} cards</b>
                <span>
                  {' '}
                  are in a state that won&apos;t allow them to be received.
                  Would you like to receive the rest?
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className='w-full flex items-center justify-end gap-2'>
              <button
                onClick={() => {
                  // Deselect items that can't be received
                  const selectedItemsArray = Array.from(selectedItems);
                  const itemsCantReceive = selectedItemsArray.filter(
                    (itemId) => {
                      const item = scannedItems.find((i) => i.id === itemId);
                      if (item) {
                        const itemStatus =
                          item.cardData.payload.status?.toUpperCase() ||
                          'UNKNOWN';
                        return itemStatus === 'FULFILLED';
                      }
                      return false;
                    }
                  );
                  // Remove items that can't be received from selection
                  setSelectedItems((prev) => {
                    const newSet = new Set(prev);
                    itemsCantReceive.forEach((id) => newSet.delete(id));
                    return newSet;
                  });
                  setIsCantReceiveCardsModalOpen(false);
                }}
                className='h-9 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center px-4 text-sm leading-5 text-[#0a0a0a]'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const jwtToken = localStorage.getItem('idToken');
                  if (!jwtToken) return;

                  const selectedItemsArray = Array.from(selectedItems);
                  const itemsCanReceive = selectedItemsArray.filter(
                    (itemId) => {
                      const item = scannedItems.find((i) => i.id === itemId);
                      if (item) {
                        const itemStatus =
                          item.cardData.payload.status?.toUpperCase() ||
                          'UNKNOWN';
                        return itemStatus !== 'FULFILLED';
                      }
                      return false;
                    }
                  );

                  // Deselect items that can't be received before processing
                  const itemsCantReceive = selectedItemsArray.filter(
                    (itemId) => {
                      const item = scannedItems.find((i) => i.id === itemId);
                      if (item) {
                        const itemStatus =
                          item.cardData.payload.status?.toUpperCase() ||
                          'UNKNOWN';
                        return itemStatus === 'FULFILLED';
                      }
                      return false;
                    }
                  );

                  // Remove items that can't be received from selection
                  setSelectedItems((prev) => {
                    const newSet = new Set(prev);
                    itemsCantReceive.forEach((id) => newSet.delete(id));
                    return newSet;
                  });

                  await receiveItems(itemsCanReceive, jwtToken);
                  setIsCantReceiveCardsModalOpen(false);
                }}
                className='h-9 rounded-lg bg-[#fc5a29] flex items-center justify-center px-4 text-sm leading-5 text-white'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Receive the rest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Scanned Items Modal */}
      {isClearItemsModalOpen && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsClearItemsModalOpen(false);
          }}
        >
          <div
            className='relative w-[425px] max-w-[425px] rounded-[10px] bg-white border border-[#e5e5e5] shadow-lg p-6 flex flex-col items-end gap-4'
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Close Icon */}
            <button
              onClick={() => setIsClearItemsModalOpen(false)}
              className='absolute top-4 right-4 w-4 h-4 flex items-center justify-center'
            >
              <X className='w-4 h-4 text-[#0a0a0a] opacity-70' />
            </button>

            {/* Header */}
            <div className='w-full flex flex-col items-start gap-1.5'>
              <b className='w-full text-base leading-6 text-[#0a0a0a] font-semibold'>
                Clear scanned items?
              </b>
              <div className='w-full text-sm leading-5 text-[#737373] font-normal'>
                Are you sure you want to remove all selected scanned items?
              </div>
            </div>

            {/* Footer */}
            <div className='w-full flex items-center justify-end gap-2'>
              <button
                onClick={() => setIsClearItemsModalOpen(false)}
                className='h-9 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center px-4 text-sm leading-5 text-[#0a0a0a]'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Just kidding
              </button>
              <button
                onClick={() => {
                  if (selectedItems.size > 0) {
                    setScannedItems((prev) =>
                      prev.filter((item) => !selectedItems.has(item.id))
                    );
                    setSelectedItems(new Set());
                    const api = gridRef.current?.getGridApi();
                    if (api) {
                      api.deselectAll();
                    }
                    setIsClearItemsModalOpen(false);
                  }
                }}
                className='h-9 rounded-lg bg-[#fc5a29] flex items-center justify-center px-4 text-sm leading-5 text-white'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Yup, clear &apos;em
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position='top-center' />
    </>
  );
}
