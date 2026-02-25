'use client';

import React from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import {
  ArdaGrid,
  itemsColumnDefs,
  itemsDefaultColDef,
} from '@frontend/components/table';
import * as items from '@frontend/types/items';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Mock data for testing
const mockItems: items.Item[] = [
  {
    entityId: '1',
    recordId: '1',
    author: 'test',
    timeCoordinates: { recordedAsOf: Date.now(), effectiveAsOf: Date.now() },
    createdCoordinates: { recordedAsOf: Date.now(), effectiveAsOf: Date.now() },
    name: '#4 x 3/8" Stainless Steel Wood Screws',
    internalSKU: 'SSWS-4-38',
    primarySupply: {
      supplier: 'Amazon',
      unitCost: { value: 0.02, currency: 'USD' },
      orderQuantity: { amount: 30, unit: 'each' },
      orderCost: { value: 0.6, currency: 'USD' },
    },
    minQuantity: { amount: 30, unit: 'each' },
    notes: 'High quality stainless steel screws',
  },
  {
    entityId: '2',
    recordId: '2',
    author: 'test',
    timeCoordinates: { recordedAsOf: Date.now(), effectiveAsOf: Date.now() },
    createdCoordinates: { recordedAsOf: Date.now(), effectiveAsOf: Date.now() },
    name: '#6 x 1/2" Stainless Steel Wood Screws',
    internalSKU: 'SSWS-6-12',
    primarySupply: {
      supplier: "Lowe's",
      unitCost: { value: 0.06, currency: 'USD' },
      orderQuantity: { amount: 50, unit: 'each' },
      orderCost: { value: 3.0, currency: 'USD' },
    },
    minQuantity: { amount: 50, unit: 'each' },
  },
  {
    entityId: '3',
    recordId: '3',
    author: 'test',
    timeCoordinates: { recordedAsOf: Date.now(), effectiveAsOf: Date.now() },
    createdCoordinates: { recordedAsOf: Date.now(), effectiveAsOf: Date.now() },
    name: '1" Raw Aluminum Stock',
    internalSKU: 'ALUM-1-RAW',
    primarySupply: {
      supplier: 'Amazon',
      unitCost: { value: 0.5, currency: 'USD' },
      orderQuantity: { amount: 10, unit: 'each' },
      orderCost: { value: 5.0, currency: 'USD' },
    },
    minQuantity: { amount: 10, unit: 'each' },
  },
];

export default function ItemsGridTest() {
  const handleRowClick = (item: items.Item) => {
    console.log('Row clicked:', item);
  };

  const handleSelectionChange = (selectedItems: items.Item[]) => {
    console.log('Selected items:', selectedItems);
  };

  return (
    <div className='h-screen p-4'>
      <h1 className='text-2xl font-bold mb-4'>Items Grid Test</h1>
      <div className='h-[calc(100vh-120px)]'>
        <ArdaGrid
          rowData={mockItems}
          columnDefs={itemsColumnDefs}
          defaultColDef={itemsDefaultColDef}
          onRowClicked={handleRowClick}
          onSelectionChanged={handleSelectionChange}
          enableRowSelection={true}
          enableMultiRowSelection={true}
          enableRowActions={true}
          rowActions={[
            {
              label: 'View',
              icon: '👁️',
              onClick: (item) => console.log('View:', item),
            },
            {
              label: 'Edit',
              icon: '✏️',
              onClick: (item) => console.log('Edit:', item),
            },
          ]}
          className='h-full'
        />
      </div>
    </div>
  );
}
