import { Item } from '@frontend/types/items';
import { nowTimeCoordinates } from '@frontend/types/general';

// Example data using the correct Item type
export const publishedItems: Item[] = [
  {
    entityId: 'TASK-0001',
    recordId: 'rec-001',
    author: 'system',
    timeCoordinates: nowTimeCoordinates(),
    createdCoordinates: nowTimeCoordinates(),
    name: 'Generating synthetic data',
    primarySupply: {
      supplier: 'Amazon',
      orderMechanism: 'ONLINE',
      url: 'https://amazon.com/gp/aw/d/B0CJYM576Y',
      orderQuantity: { amount: 12, unit: 'Pkg' },
      unitCost: { value: 4.99, currency: 'USD' },
      orderCost: { value: 59.88, currency: 'USD' },
    },
    locator: { facility: 'Main', location: 'Warehouse' },
    cardSize: 'MEDIUM',
    defaultSupply: 'Amazon',
    color: 'GRAY',
  },
  {
    entityId: 'TASK-0002',
    recordId: 'rec-002',
    author: 'system',
    timeCoordinates: nowTimeCoordinates(),
    createdCoordinates: nowTimeCoordinates(),
    name: 'Refactoring legacy codebase',
    primarySupply: {
      supplier: 'Mouser',
      orderMechanism: 'ONLINE',
      url: 'https://www.mouser.com/ProductDetail/12345',
      orderQuantity: { amount: 12, unit: 'Pkg' },
      unitCost: { value: 5.29, currency: 'USD' },
      orderCost: { value: 63.48, currency: 'USD' },
    },
    locator: { facility: 'Main', location: 'Back Shelf' },
    cardSize: 'MEDIUM',
    defaultSupply: 'Mouser',
    color: 'GRAY',
  },
  {
    entityId: 'TASK-0003',
    recordId: 'rec-003',
    author: 'system',
    timeCoordinates: nowTimeCoordinates(),
    createdCoordinates: nowTimeCoordinates(),
    name: 'Configuring deployment pipeline',
    primarySupply: {
      supplier: 'Digikey',
      orderMechanism: 'ONLINE',
      url: 'https://www.digikey.com/en/products/detail/67890',
      orderQuantity: { amount: 10, unit: 'Pkg' },
      unitCost: { value: 3.49, currency: 'USD' },
      orderCost: { value: 34.9, currency: 'USD' },
    },
    locator: { facility: 'Main', location: 'Upper Shelf' },
    cardSize: 'MEDIUM',
    defaultSupply: 'Digikey',
    color: 'GRAY',
  },
  {
    entityId: 'TASK-0004',
    recordId: 'rec-004',
    author: 'system',
    timeCoordinates: nowTimeCoordinates(),
    createdCoordinates: nowTimeCoordinates(),
    name: 'Implementing UI components',
    primarySupply: {
      supplier: 'BestBuy',
      orderMechanism: 'ONLINE',
      url: 'https://www.bestbuy.com/site/11111',
      orderQuantity: { amount: 8, unit: 'Pkg' },
      unitCost: { value: 4.75, currency: 'USD' },
      orderCost: { value: 38.0, currency: 'USD' },
    },
    locator: { facility: 'Main', location: 'Lower Bins' },
    cardSize: 'MEDIUM',
    defaultSupply: 'BestBuy',
    color: 'GRAY',
  },
  {
    entityId: 'TASK-0005',
    recordId: 'rec-005',
    author: 'system',
    timeCoordinates: nowTimeCoordinates(),
    createdCoordinates: nowTimeCoordinates(),
    name: 'Optimizing database queries',
    primarySupply: {
      supplier: 'Amazon',
      orderMechanism: 'ONLINE',
      url: 'https://amazon.com/gp/aw/d/B0CJYM576Y',
      orderQuantity: { amount: 15, unit: 'Pkg' },
      unitCost: { value: 4.99, currency: 'USD' },
      orderCost: { value: 74.85, currency: 'USD' },
    },
    locator: { facility: 'Main', location: '14A' },
    cardSize: 'MEDIUM',
    defaultSupply: 'Amazon',
    color: 'GRAY',
  },
  ...Array.from({ length: 45 }, (_, i) => {
    const id = String(i + 6).padStart(4, '0');
    const suppliers = ['Amazon', 'Mouser', 'Digikey', 'BestBuy'];
    const locations = [
      'Warehouse',
      'Back Shelf',
      'Upper Shelf',
      'Lower Bins',
      '14A',
    ];
    const supplier = suppliers[i % 4];
    const location = locations[i % 5];

    return {
      entityId: `TASK-${id}`,
      recordId: `rec-${id}`,
      author: 'system',
      timeCoordinates: nowTimeCoordinates(),
      createdCoordinates: nowTimeCoordinates(),
      name: `Generated task ${id}`,
      primarySupply: {
        supplier,
        orderMechanism: 'ONLINE',
        url: 'https://amazon.com/gp/aw/d/B0CJYM576Y',
        orderQuantity: { amount: 12, unit: 'Pkg' },
        unitCost: { value: 4.99, currency: 'USD' },
        orderCost: { value: 59.88, currency: 'USD' },
      },
      locator: { facility: 'Main', location },
      cardSize: 'MEDIUM',
      defaultSupply: supplier,
      color: 'GRAY',
    } as Item;
  }),
];

export const draftItems: Item[] = [
  {
    entityId: 'TASK-7181',
    recordId: 'rec-7181',
    author: 'system',
    timeCoordinates: nowTimeCoordinates(),
    createdCoordinates: nowTimeCoordinates(),
    name: 'We need to bypass the...',
    primarySupply: {
      supplier: 'Mouser',
      orderMechanism: 'ONLINE',
      url: 'https://www.mouser.com/ProductDetail/12345',
      orderQuantity: { amount: 12, unit: 'Pkg' },
      unitCost: { value: 4.99, currency: 'USD' },
      orderCost: { value: 59.88, currency: 'USD' },
    },
    locator: { facility: 'Main', location: 'Upper Shelf' },
    cardSize: 'MEDIUM',
    defaultSupply: 'Mouser',
    color: 'GRAY',
  },
];

export const recentlyUploaded: Item[] = [
  {
    entityId: 'TASK-9202',
    recordId: 'rec-9202',
    author: 'system',
    timeCoordinates: nowTimeCoordinates(),
    createdCoordinates: nowTimeCoordinates(),
    name: 'The UTF8 application...',
    primarySupply: {
      supplier: 'Mouser',
      orderMechanism: 'ONLINE',
      url: 'https://www.mouser.com/ProductDetail/12345',
      orderQuantity: { amount: 12, unit: 'Pkg' },
      unitCost: { value: 4.99, currency: 'USD' },
      orderCost: { value: 59.88, currency: 'USD' },
    },
    locator: { facility: 'Main', location: 'Warehouse' },
    cardSize: 'MEDIUM',
    defaultSupply: 'Mouser',
    color: 'GRAY',
  },
];
