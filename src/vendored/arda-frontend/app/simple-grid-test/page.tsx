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

// Simple test data
const testItems: items.Item[] = [
  {
    entityId: '1',
    recordId: '1',
    author: 'test',
    timeCoordinates: { recordedAsOf: Date.now(), effectiveAsOf: Date.now() },
    createdCoordinates: { recordedAsOf: Date.now(), effectiveAsOf: Date.now() },
    name: 'Test Item',
    internalSKU: 'TEST-001',
    primarySupply: {
      supplier: 'Test Supplier',
      unitCost: { value: 10.0, currency: 'USD' },
      orderQuantity: { amount: 5, unit: 'each' },
      orderCost: { value: 50.0, currency: 'USD' },
    },
    minQuantity: { amount: 2, unit: 'each' },
  },
];

export default function SimpleGridTest() {
  return (
    <div className='h-screen p-4'>
      <h1 className='text-2xl font-bold mb-4'>Simple Grid Test</h1>
      <div className='h-[calc(100vh-120px)]'>
        <ArdaGrid
          rowData={testItems}
          columnDefs={itemsColumnDefs}
          defaultColDef={itemsDefaultColDef}
          enableRowSelection={true}
          enableMultiRowSelection={true}
          className='h-full'
        />
      </div>
    </div>
  );
}






