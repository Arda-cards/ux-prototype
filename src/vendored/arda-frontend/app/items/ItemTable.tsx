'use client';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  HeaderContext,
} from '@tanstack/react-table';
import * as React from 'react';

import { Button } from '@frontend/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@frontend/components/ui/table';
import { Checkbox } from '@frontend/components/ui/checkbox';
import { Label } from '@frontend/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@frontend/components/ui/select';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
} from 'lucide-react';

import * as items from '@frontend/types/items';
import * as domain from '@frontend/types/domain';
import { cardSizeOptions } from '@frontend/constants/constants';

type Props = {
  items: items.Item[];
  activeTab: string;
  columnVisibility?: Record<string, boolean>;
  onRowClick?: (item: items.Item) => void;
  onSelectionChange?: (selectedItems: items.Item[]) => void;
  // Server-side pagination props - using index-based pagination
  paginationData?: {
    currentIndex: number;
    currentPageSize: number;
    totalItems: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
};

export const ItemTable = ({
  items,
  activeTab,
  columnVisibility = {},
  onRowClick,
  onSelectionChange,
  paginationData,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  isLoading = false,
}: Props) => {
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Direct mapping - dropdown names now match column IDs
  const columnMapping: Record<string, string> = {
    // The dropdown names now directly match the column IDs
    sku: 'internalSKU',
    name: 'name',
    classification: 'classification',
    supplier: 'primarySupply',
    location: 'locator',
    unitCost: 'unitCost',
    orderMethod: 'orderMethod',
    orderQuantity: 'orderQuantity',
    cardSize: 'cardSize',
    notes: 'notes',
  };

  // Function to check if a column should be visible
  const isColumnVisible = (columnId: string): boolean => {
    // Search in the mapping if it exists
    for (const [dropdownKey, mappedColumnId] of Object.entries(columnMapping)) {
      if (mappedColumnId === columnId) {
        return columnVisibility[dropdownKey] === true;
      }
    }
    // If not in the mapping, show by default
    return true;
  };

  const allColumns: ColumnDef<items.Item>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className='w-8 flex justify-center'>
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Select all'
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='w-8 flex justify-center'>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
    },

    {
      id: 'internalSKU',
      accessorKey: 'internalSKU',
      enableSorting: false,
      enableHiding: true,
      header: ({}: HeaderContext<items.Item, unknown>) => (
        <div className='w-20 flex items-center gap-1 select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist'>
          SKU
        </div>
      ),
      cell: ({ getValue, row }) => (
        <button
          className='w-20 min-w-0 truncate text-left underline text-black hover:text-gray-700 cursor-pointer'
          onClick={(e) => {
            e.stopPropagation();
            onRowClick?.(row.original);
          }}
          title={(getValue() as string) || row.original.internalSKU || ''}
        >
          {(getValue() as string) || row.original.internalSKU || ''}
        </button>
      ),
    },
    {
      id: 'name',
      accessorKey: 'name',
      enableHiding: true,
      header: ({ column }) => (
        <div
          className='w-40 flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const name = getValue() as string;
        return (
          <div
            className='w-40 min-w-0 truncate underline text-black hover:text-gray-700 cursor-pointer text-left'
            title={name}
          >
            {name}
          </div>
        );
      },
    },

    ...(activeTab === 'draft'
      ? [
          {
            id: 'state',
            accessorKey: 'state',
            header: 'State',
            enableSorting: false,
            enableHiding: true,
            cell: ({ getValue }) => (
              <span className='inline-flex items-center rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white'>
                {getValue() as string}
              </span>
            ),
          } as ColumnDef<items.Item>,
        ]
      : []),

    // Real ARDA data columns
    {
      id: 'classification',
      accessorKey: 'classification',
      enableHiding: true,
      header: ({ column }: HeaderContext<items.Item, unknown>) => (
        <div
          className='w-36 flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Classification
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const classification = getValue() as
          | items.ItemClassification
          | undefined;
        return (
          <div className='w-36 min-w-0 truncate'>
            {classification?.type || ''}
          </div>
        );
      },
    },
    {
      id: 'primarySupply',
      accessorKey: 'primarySupply',
      enableHiding: true,
      header: ({ column }: HeaderContext<items.Item, unknown>) => (
        <div
          className='w-40 flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Primary Supplier
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const supply = getValue() as items.Supply | undefined;
        return (
          <div className='w-40 min-w-0 truncate'>{supply?.supplier || ''}</div>
        );
      },
    },
    {
      id: 'locator',
      accessorKey: 'locator',
      enableHiding: true,
      header: ({ column }: HeaderContext<items.Item, unknown>) => (
        <div
          className='w-48 flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Location
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const locator = getValue() as domain.Locator | undefined;
        const txt = locator ? `${locator.location || ''}` : '';
        return (
          <div className='w-48 min-w-0 truncate' title={txt}>
            {txt}
          </div>
        );
      },
    },
    {
      accessorKey: 'primarySupply',
      id: 'unitCost',
      enableHiding: true,
      header: ({ column }: HeaderContext<items.Item, unknown>) => (
        <div
          className='w-28 text-right flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist justify-end'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Unit Cost
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const supply = getValue() as items.Supply | undefined;
        if (!supply?.unitCost?.value)
          return <div className='w-28 text-right'></div>;
        return (
          <div className='w-28 text-right font-medium'>
            ${supply.unitCost.value.toFixed(2)} {supply.unitCost.currency || ''}
          </div>
        );
      },
    },
    {
      accessorKey: 'primarySupply',
      id: 'orderMethod',
      enableHiding: true,
      header: ({ column }: HeaderContext<items.Item, unknown>) => (
        <div
          className='w-32 flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Order Method
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const supply = getValue() as items.Supply | undefined;
        const orderMechanism = supply?.orderMechanism || '';
        return (
          <div className='w-32 min-w-0 truncate' title={orderMechanism}>
            {orderMechanism}
          </div>
        );
      },
    },
    {
      accessorKey: 'primarySupply',
      id: 'orderQuantity',
      enableHiding: true,
      header: ({ column }: HeaderContext<items.Item, unknown>) => (
        <div
          className='w-28 text-center flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist justify-center'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Order Qty
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const supply = getValue() as items.Supply | undefined;
        if (!supply?.orderQuantity?.amount)
          return <div className='w-28 text-center'></div>;
        return (
          <div className='w-28 text-center truncate'>
            {supply.orderQuantity.amount} {supply.orderQuantity.unit || ''}
          </div>
        );
      },
    },
    {
      id: 'cardSize',
      accessorKey: 'cardSize',
      enableHiding: true,
      header: ({ column }: HeaderContext<items.Item, unknown>) => (
        <div
          className='w-24 flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Card Size
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const value = getValue() as string | undefined;
        if (!value) return <div className='w-24 min-w-0 truncate' />;
        const label = cardSizeOptions.find((o) => o.value === value)?.label ?? value;
        return <div className='w-24 min-w-0 truncate'>{label}</div>;
      },
    },
    {
      id: 'notes',
      accessorKey: 'notes',
      enableHiding: true,
      header: ({ column }: HeaderContext<items.Item, unknown>) => (
        <div
          className='w-40 flex items-center gap-1 cursor-pointer select-none text-[14px] font-medium leading-5 text-muted-foreground font-geist'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Notes
          <ChevronsUpDownIcon className='w-4 h-4' />
        </div>
      ),
      cell: ({ getValue }) => {
        const notes = getValue() as string;
        return notes ? (
          <div className='w-40 min-w-0 truncate' title={notes}>
            {notes}
          </div>
        ) : (
          ''
        );
      },
    },
  ];

  // Filter columns based on visibility
  const columns = allColumns.filter((column) => {
    const columnId = column.id;
    if (columnId) {
      const isVisible = isColumnVisible(columnId);
      return isVisible;
    }
    return true;
  });

  const table = useReactTable({
    data: items,
    columns,
    state: {
      rowSelection,
      sorting,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Disable client-side pagination since we're using server-side
    manualPagination: true,
    pageCount: -1, // Unknown page count for server-side pagination
  });

  // Notify parent component when selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const selectedItems = selectedRows.map((row) => row.original);
      onSelectionChange(selectedItems);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className='space-y-2 h-full flex flex-col min-h-0'>
      <div className='rounded-md border flex-1 overflow-hidden min-h-0'>
        <div className='overflow-x-auto overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
          <Table className='min-w-[1500px] w-full'>
            <TableHeader className='sticky top-0 z-10 bg-background border-b'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className='whitespace-nowrap truncate'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='cursor-pointer'
                    onClick={(e) => {
                      // Don't trigger row click if clicking on interactive elements
                      const target = e.target as HTMLElement;
                      if (
                        target.closest('button') ||
                        target.closest('input[type="checkbox"]') ||
                        target.closest('[role="button"]') ||
                        target.closest('select') ||
                        target.closest('[data-prevent-row-click]')
                      ) {
                        return;
                      }
                      onRowClick?.(row.original);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className='whitespace-nowrap truncate'
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className='flex items-center justify-between px-2 py-0.5 flex-shrink-0 border-t bg-background'>
        <div className='hidden flex-1 text-xs text-muted-foreground lg:flex'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className='flex w-full items-center gap-4 lg:gap-6 xl:gap-8 lg:w-fit'>
          <div className='hidden items-center gap-1 lg:gap-2 lg:flex'>
            <Label
              htmlFor='rows-per-page'
              className='text-xs lg:text-sm font-medium'
            >
              Rows per page
            </Label>
            <Select
              value={`${paginationData?.currentPageSize || 10}`}
              onValueChange={(value) => {
                onPageSizeChange?.(Number(value));
              }}
              disabled={isLoading}
            >
              <SelectTrigger
                className='w-16 lg:w-20 h-7 lg:h-8'
                id='rows-per-page'
              >
                <SelectValue
                  placeholder={paginationData?.currentPageSize || 10}
                />
              </SelectTrigger>
              <SelectContent side='top'>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div className='flex w-fit items-center justify-center text-xs lg:text-sm font-medium'>
            {isLoading ? (
              <span className='flex items-center gap-1'>
                <div className='animate-spin rounded-full h-3 w-3 border-b border-foreground'></div>
                Loading...
              </span>
            ) : (
              (() => {
                // Calculate pagination display values
                // X = number of selected items
                const X = table.getFilteredSelectedRowModel().rows.length;
                
                // PageNumber starts at 0, but currentPage starts at 1
                const pageNumber = (paginationData?.currentPage || 1) - 1;
                const pageSize = paginationData?.currentPageSize || 50;
                const numRecordsInPage = items.length;
                
                // Y = PageNumber * PageSize + NumRecordsInPage (last record index)
                const Y = pageNumber * pageSize + numRecordsInPage;
                
                return (
                  <span>
                    <span className='font-bold'>{X}</span> to{' '}
                    <span className='font-bold'>{Y}</span>
                  </span>
                );
              })()
            )}
          </div> */}
          <div className='ml-auto flex items-center gap-1 lg:gap-2 lg:ml-0'>
            <Button
              variant='outline'
              className='size-6 lg:size-8'
              size='icon'
              onClick={onPreviousPage}
              disabled={!paginationData?.hasPreviousPage || isLoading}
            >
              <ChevronLeftIcon className='h-3 w-3 lg:h-4 lg:w-4' />
            </Button>

            <Button
              variant='outline'
              className='size-6 lg:size-8'
              size='icon'
              onClick={onNextPage}
              disabled={!paginationData?.hasNextPage || isLoading}
            >
              <ChevronRightIcon className='h-3 w-3 lg:h-4 lg:w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
