'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';
import { useJWT } from '@frontend/store/hooks/useJWT';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@frontend/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Package, CheckCircle } from 'lucide-react';
import { Badge } from '@frontend/components/ui/badge';
import { EmptyOrdersState } from '@frontend/components/common/EmptyOrdersState';
import { OnlineOrderIcon } from '@frontend/components/common/OnlineOrderIcon';
import { EmailOrderIcon } from '@frontend/components/common/EmailOrderIcon';
import { PhoneOrderIcon } from '@frontend/components/common/PhoneOrderIcon';
import { PurchaseOrderIcon } from '@frontend/components/common/PurchaseOrderIcon';
import { InStoreIcon } from '@frontend/components/common/InStoreIcon';
import { RFQIcon } from '@frontend/components/common/RFQIcon';
import { ProductionIcon } from '@frontend/components/common/ProductionIcon';
import { ThirdPartyIcon } from '@frontend/components/common/ThirdPartyIcon';
import { CardStateDropdown } from '@frontend/components/common/CardStateDropdown';
import { toast } from 'sonner';
import { getKanbanCard } from '@frontend/lib/ardaClient';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import { KanbanCardStatus, KanbanCardPrintStatus } from '@frontend/types/kanban-cards';
import type { Currency } from '@frontend/types/domain';
import { defaultCurrency } from '@frontend/types/domain';
import type { TimeUnit } from '@frontend/types/general';
import { defaultTimeUnit } from '@frontend/types/general';
import {
  WaitingToBeReceivedIcon,
  ReceivedIcon,
  RecentlyFulfilledIcon,
} from '@frontend/components/common/TabIcons';
import { mapApiStatusToDisplay } from '@frontend/lib/cardStateUtils';
import type * as items from '@frontend/types/items';

const ItemDetailsPanel = dynamic(
  () =>
    import('@/components/items/ItemDetailsPanel').then(
      (mod) => mod.ItemDetailsPanel,
    ),
  {
    loading: () => (
      <div className='p-4 text-sm text-muted-foreground'>
        Loading item details...
      </div>
    ),
    ssr: false,
  },
);

const ItemFormPanel = dynamic(
  () =>
    import('@/components/items/ItemFormPanel').then((mod) => mod.ItemFormPanel),
  {
    loading: () => (
      <div className='p-4 text-sm text-muted-foreground'>
        Loading item form...
      </div>
    ),
    ssr: false,
  },
);

// Import kanban types
import { KanbanCardResponse, KanbanCardResponseData } from '@frontend/types';

interface ReceivingItem {
  id: string;
  name: string;
  quantity: string;
  orderMethod:
    | 'Online'
    | 'Purchase order'
    | 'Phone'
    | 'Email'
    | 'In store'
    | 'Request for quotation (RFQ)'
    | 'Production'
    | '3rd party';
  status: 'in_proccess' | 'Received' | 'Fulfilled';
  supplier: string;
  orderedAt?: string;
  fulfilledAt?: string;
  link?: string;
  notes?: string;
}

interface SupplierGroup {
  name: string;
  orderMethod:
    | 'Online'
    | 'Purchase order'
    | 'Phone'
    | 'Email'
    | 'In store'
    | 'Request for quotation (RFQ)'
    | 'Production'
    | '3rd party';
  items: ReceivingItem[];
  expanded: boolean;
}

interface OrderMethodGroup {
  name: string;
  orderMethod:
    | 'Online'
    | 'Purchase order'
    | 'Phone'
    | 'Email'
    | 'In store'
    | 'Request for quotation (RFQ)'
    | 'Production'
    | '3rd party';
  items: ReceivingItem[];
  expanded: boolean;
}

// Function to map order method from API to UI format
const mapOrderMethod = (
  apiOrderMethod: string,
): ReceivingItem['orderMethod'] => {
  switch (apiOrderMethod) {
    case 'ONLINE':
      return 'Online';
    case 'PURCHASE_ORDER':
      return 'Purchase order';
    case 'PHONE':
      return 'Phone';
    case 'EMAIL':
      return 'Email';
    case 'IN_STORE':
      return 'In store';
    case 'RFQ':
      return 'Request for quotation (RFQ)';
    case 'PRODUCTION':
      return 'Production';
    case 'THIRD_PARTY':
      return '3rd party';
    default:
      return 'Online';
  }
};

const getOrderMethodIcon = (method: string) => {
  switch (method) {
    case 'Online':
      return <OnlineOrderIcon width={32} height={32} />;
    case 'Purchase order':
      return <PurchaseOrderIcon width={32} height={32} />;
    case 'Phone':
      return <PhoneOrderIcon width={32} height={32} />;
    case 'Email':
      return <EmailOrderIcon width={32} height={32} />;
    case 'In store':
      return <InStoreIcon width={32} height={32} />;
    case 'Request for quotation (RFQ)':
      return <RFQIcon width={32} height={32} />;
    case 'Production':
      return <ProductionIcon width={32} height={32} />;
    case '3rd party':
      return <ThirdPartyIcon width={32} height={32} />;
    default:
      return <OnlineOrderIcon width={32} height={32} />;
  }
};

// Helper function to convert ReceivingItem to KanbanCard for CardStateDropdown
function receivingItemToKanbanCard(item: ReceivingItem) {
  return {
    entityId: item.id,
    recordId: item.id,
    author: 'system',
    timeCoordinates: {
      recordedAsOf: Date.now(),
      effectiveAsOf: Date.now(),
    },
    createdCoordinates: {
      recordedAsOf: Date.now(),
      effectiveAsOf: Date.now(),
    },
    status: (item.status === 'in_proccess'
      ? 'IN_PROCESS'
      : item.status === 'Fulfilled'
        ? 'FULFILLED'
        : item.status === 'Received'
          ? 'FULFILLED'
          : 'UNKNOWN') as KanbanCardStatus,
    serialNumber: item.id,
    item: {
      entityId: item.id,
      recordId: item.id,
      author: 'system',
      timeCoordinates: {
        recordedAsOf: Date.now(),
        effectiveAsOf: Date.now(),
      },
      createdCoordinates: {
        recordedAsOf: Date.now(),
        effectiveAsOf: Date.now(),
      },
      name: item.name,
    },
    printStatus: 'PRINTED' as KanbanCardPrintStatus,
  };
}

export default function ReceivingPage() {
  const { handleAuthError } = useAuthErrorHandler();
  const { user, loading: authLoading } = useAuth();
  // Tab definitions:
  // - inTransit: Items with status 'in_proccess' (waiting to be received)
  // - received: Items with status 'fulfilled' (already received and fulfilled)
  // - fulfilled: Items with status 'fulfilled' (recently fulfilled)
  const [activeTab, setActiveTab] = useState<
    'inTransit' | 'received' | 'fulfilled'
  >('inTransit');

  const [searchTerm, setSearchTerm] = useState('');
  // Separate state for each tab to prevent data loss when switching tabs
  const [inTransitSupplierGroups, setInTransitSupplierGroups] = useState<
    SupplierGroup[]
  >([]);

  // Current active tab data (computed from the above states)
  const [supplierGroups, setSupplierGroups] = useState<SupplierGroup[]>([]);
  const [orderMethodGroups, setOrderMethodGroups] = useState<
    OrderMethodGroup[]
  >([]);
  const [originalApiData, setOriginalApiData] = useState<
    KanbanCardResponse['results']
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isItemDetailsPanelOpen, setIsItemDetailsPanelOpen] = useState(false);
  const [isItemFormPanelOpen, setIsItemFormPanelOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<{
    eid: string;
    title: string;
    minQty: string;
    minUnit: string;
    orderQty: string;
    orderUnit: string;
    location: string;
    supplier: string;
    sku: string;
    image: string;
    link: string;
    unitPrice: number;
    notes: string;
    classification: Record<string, unknown>;
    locator: Record<string, unknown>;
    cardSize: string;
    labelSize: string;
    breadcrumbSize: string;
    itemColor: string;
    internalSKU: string;
    useCase: string;
    taxable: boolean;
    cardNotesDefault: string;
    defaultSupply: string;
    secondarySupply: Record<string, unknown> | null;
    orderMechanism?: items.OrderMechanism;
  } | null>(null);

  const initialLoadTokenRef = useRef<string | null>(null);

  // Get JWT token from context
  const { token, isTokenValid } = useJWT();

  // Function to fetch kanban card details for a specific status with pagination
  const fetchKanbanCardDetails = useCallback(
    async (
      status: 'in-process' | 'fulfilled',
      pageIndex: number = 0,
      pageSize: number = 50,
    ): Promise<{
      supplierGroups: SupplierGroup[];
      orderMethodGroups: OrderMethodGroup[];
      hasMore: boolean;
      totalFetched: number;
    }> => {
      try {
        const requestBody = {
          filter: true,
          paginate: {
            index: pageIndex,
            size: pageSize,
          },
        };

        // For fulfilled status, use the general query endpoint with status filter
        // since there's no dedicated /details/fulfilled endpoint in the backend
        let response;
        if (status === 'fulfilled') {
          const queryRequestBody = {
            filter: {
              eq: 'FULFILLED',
              locator: 'status',
            },
            paginate: {
              index: pageIndex,
              size: pageSize,
            },
          };

          response = await fetch(`/api/arda/kanban/kanban-card/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(queryRequestBody),
          });
        } else {
          // For in-process, use the dedicated endpoint
          response = await fetch(
            `/api/arda/kanban/kanban-card/details/${status}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            },
          );
        }

        if (!response.ok) {
          console.error(`${status} cards response not ok:`, response.status);
          if (response.status === 401) {
            console.error(
              `Authentication failed for ${status} cards - JWT token missing or invalid`,
            );
          }
          throw new Error(`HTTP error! ${status}: ${response.status}`);
        }

        const data: KanbanCardResponseData = await response.json();

        // Handle both query endpoint format and details endpoint format
        // Query endpoint might return data.data directly as an array
        // Details endpoint returns data.data.results
        let results;
        if (Array.isArray(data.data)) {
          results = data.data;
        } else if (data.data?.results && Array.isArray(data.data.results)) {
          results = data.data.results;
        } else {
          console.warn(
            `No valid results found for ${status} status. Data structure:`,
            data,
          );
          return {
            supplierGroups: [],
            orderMethodGroups: [],
            hasMore: false,
            totalFetched: 0,
          };
        }

        // Store original API data
        setOriginalApiData(results);

        // Group items by supplier
        const supplierMap = new Map<string, ReceivingItem[]>();
        // Group items by order method
        const orderMethodMap = new Map<string, ReceivingItem[]>();

        // Check if results exist and is an array
        if (!results || !Array.isArray(results) || results.length === 0) {
          return {
            supplierGroups: [],
            orderMethodGroups: [],
            hasMore: false,
            totalFetched: 0,
          };
        }

        results.forEach((result: KanbanCardResponse['results'][0]) => {
          try {
            // Handle both query endpoint format and details endpoint format
            const payload = result.payload || result;
            const itemDetails =
              payload.itemDetails ||
              ((payload as Record<string, unknown>)
                .item as typeof payload.itemDetails);

            // Check if itemDetails exists
            if (!itemDetails) {
              console.warn(`Skipping card with no item details:`, result);
              return;
            }

            // Extract card ID from various possible locations
            const cardId =
              ((payload as unknown as Record<string, unknown>).eId as string) ||
              ((result as unknown as Record<string, unknown>).eId as string) ||
              'unknown-id';

            // Check if primarySupply exists in itemDetails
            const primarySupply = itemDetails.primarySupply;

            if (!primarySupply) {
              // Use default values when primarySupply is not available
              const orderItem: ReceivingItem = {
                id: cardId,
                name: itemDetails?.name || 'Unknown Item',
                quantity: `${
                  itemDetails?.primarySupply?.orderQuantity?.amount || 0
                }${
                  itemDetails?.primarySupply?.orderQuantity?.unit
                    ? ` ${itemDetails.primarySupply.orderQuantity.unit}`
                    : ' each'
                }`,
                orderMethod: 'Online', // Default order method
                status: 'in_proccess', // Default status for receiving
                supplier: 'Unknown Supplier', // Default supplier
                link: itemDetails?.primarySupply?.url || '',
                notes:
                  (result.payload as { notes?: string })?.notes ||
                  itemDetails?.cardNotesDefault ||
                  '',
              };

              // Add to default supplier group
              if (supplierMap.has('Unknown Supplier')) {
                supplierMap.get('Unknown Supplier')!.push(orderItem);
              } else {
                supplierMap.set('Unknown Supplier', [orderItem]);
              }

              // Add to default order method group
              if (orderMethodMap.has('Online')) {
                orderMethodMap.get('Online')!.push(orderItem);
              } else {
                orderMethodMap.set('Online', [orderItem]);
              }
              return;
            }

            const supplier = primarySupply.supplier;
            const orderMethod = mapOrderMethod(primarySupply.orderMethod);

            // Determine status based on the API response status using new mapping
            let itemStatus: ReceivingItem['status'] = 'in_proccess';

            const mappedStatus = mapApiStatusToDisplay(payload.status);

            // Map our standardized statuses to ReceivingItem statuses
            switch (mappedStatus) {
              case 'REQUESTING':
                itemStatus = 'in_proccess';
                break;
              case 'REQUESTED':
                itemStatus = 'in_proccess';
                break;
              case 'IN_PROCESS':
                itemStatus = 'in_proccess';
                break;
              case 'FULFILLED':
                itemStatus = 'Fulfilled';
                break;
              default:
                itemStatus = 'in_proccess';
            }

            const orderItem: ReceivingItem = {
              id: cardId,
              name: itemDetails?.name || 'Unknown Item',
              quantity: `${
                itemDetails?.primarySupply?.orderQuantity?.amount || 0
              }${
                itemDetails?.primarySupply?.orderQuantity?.unit
                  ? ` ${itemDetails.primarySupply.orderQuantity.unit}`
                  : ' each'
              }`,
              orderMethod,
              status: itemStatus,
              supplier,
              link: itemDetails?.primarySupply?.url || '',
              notes:
                (result.payload as { notes?: string })?.notes ||
                itemDetails?.cardNotesDefault ||
                '',
            };

            // Add to supplier group
            if (supplierMap.has(supplier)) {
              supplierMap.get(supplier)!.push(orderItem);
            } else {
              supplierMap.set(supplier, [orderItem]);
            }

            // Add to order method group
            if (orderMethodMap.has(orderMethod)) {
              orderMethodMap.get(orderMethod)!.push(orderItem);
            } else {
              orderMethodMap.set(orderMethod, [orderItem]);
            }
          } catch (error) {
            const errorPayload = (result as unknown as Record<string, unknown>)
              .payload as Record<string, unknown> | undefined;
            const errorCardId =
              (errorPayload?.eId as string) ||
              ((result as unknown as Record<string, unknown>).eId as string) ||
              'unknown';
            console.error(`Error processing card ${errorCardId}:`, error);
            // Continue with next item
          }
        });

        // Convert supplier map to array format
        const supplierGroups: SupplierGroup[] = Array.from(
          supplierMap.entries(),
        ).map(([supplier, items]) => ({
          name: supplier,
          orderMethod: items[0].orderMethod, // Use first item's order method for group
          items,
          expanded: true,
        }));

        // Convert order method map to array format
        const orderMethodGroups: OrderMethodGroup[] = Array.from(
          orderMethodMap.entries(),
        ).map(([orderMethod, items]) => ({
          name: orderMethod,
          orderMethod: items[0].orderMethod,
          items,
          expanded: true,
        }));

        // Determine if there are more items to fetch
        const hasMoreItems = results.length === pageSize;

        return {
          supplierGroups,
          orderMethodGroups,
          hasMore: hasMoreItems,
          totalFetched: results.length,
        };
      } catch (error) {
        console.error('Error fetching kanban card details:', error);
        if (handleAuthError(error)) {
          return {
            supplierGroups: [],
            orderMethodGroups: [],
            hasMore: false,
            totalFetched: 0,
          };
        }
        // Return empty arrays as fallback
        return {
          supplierGroups: [],
          orderMethodGroups: [],
          hasMore: false,
          totalFetched: 0,
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token],
  );

  // Helper function to merge supplier/order method groups
  const mergeGroups = (
    existing: SupplierGroup[] | OrderMethodGroup[],
    newData: SupplierGroup[] | OrderMethodGroup[],
  ): SupplierGroup[] | OrderMethodGroup[] => {
    const mergedMap = new Map<string, SupplierGroup | OrderMethodGroup>();

    // Add existing groups
    existing.forEach((group) => {
      mergedMap.set(group.name, { ...group });
    });

    // Merge new groups
    newData.forEach((group) => {
      if (mergedMap.has(group.name)) {
        const existingGroup = mergedMap.get(group.name)!;
        // Merge items, avoiding duplicates
        const existingIds = new Set(existingGroup.items.map((item) => item.id));
        const newItems = group.items.filter(
          (item) => !existingIds.has(item.id),
        );
        existingGroup.items = [...existingGroup.items, ...newItems];
      } else {
        mergedMap.set(group.name, { ...group });
      }
    });

    return Array.from(mergedMap.values());
  };

  // Function to load more items (pagination)
  const loadMoreItems = useCallback(async () => {
    if (!token || !isTokenValid || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const pageSize = 50;

      if (activeTab === 'inTransit') {
        const result = await fetchKanbanCardDetails(
          'in-process',
          nextPage,
          pageSize,
        );

        // Get fulfilled items to exclude duplicates
        const fulfilledResult = await fetchKanbanCardDetails(
          'fulfilled',
          0,
          1000,
        );
        const fulfilledItemIds = new Set(
          fulfilledResult.supplierGroups.flatMap((group) =>
            group.items.map((item) => item.id),
          ),
        );

        // Filter for items with status 'in_proccess' only AND exclude items that are already fulfilled
        const inProgressSupplierData = result.supplierGroups
          .map((group) => ({
            ...group,
            items: group.items.filter(
              (item) =>
                item.status === 'in_proccess' && !fulfilledItemIds.has(item.id),
            ),
          }))
          .filter((group) => group.items.length > 0);

        const inProgressOrderMethodData = result.orderMethodGroups
          .map((group) => ({
            ...group,
            items: group.items.filter(
              (item) =>
                item.status === 'in_proccess' && !fulfilledItemIds.has(item.id),
            ),
          }))
          .filter((group) => group.items.length > 0);

        // Merge with existing data
        setInTransitSupplierGroups(
          (prev) =>
            mergeGroups(prev, inProgressSupplierData) as SupplierGroup[],
        );
        setSupplierGroups(
          (prev) =>
            mergeGroups(prev, inProgressSupplierData) as SupplierGroup[],
        );
        setOrderMethodGroups(
          (prev) =>
            mergeGroups(prev, inProgressOrderMethodData) as OrderMethodGroup[],
        );

        setHasMore(result.hasMore);
        setCurrentPage(nextPage);
      } else if (activeTab === 'fulfilled') {
        const result = await fetchKanbanCardDetails(
          'fulfilled',
          nextPage,
          pageSize,
        );

        // Merge with existing data
        setSupplierGroups(
          (prev) => mergeGroups(prev, result.supplierGroups) as SupplierGroup[],
        );
        setOrderMethodGroups(
          (prev) =>
            mergeGroups(prev, result.orderMethodGroups) as OrderMethodGroup[],
        );

        setHasMore(result.hasMore);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
      if (handleAuthError(error)) {
        return;
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    token,
    isTokenValid,
    isLoadingMore,
    hasMore,
    currentPage,
    activeTab,
    fetchKanbanCardDetails,
    handleAuthError,
  ]);

  // Function to load data based on active tab
  // Strategy:
  // Function to load data for a specific tab without updating global states
  const loadDataForTabWithoutGlobalUpdate = useCallback(
    async (
      tab: 'inTransit' | 'fulfilled',
      cachedFulfilledData?: {
        supplierGroups: SupplierGroup[];
        orderMethodGroups: OrderMethodGroup[];
      },
      pageIndex: number = 0,
    ) => {
      if (!token || !isTokenValid) {
        return { supplierGroups: [], orderMethodGroups: [] };
      }

      try {
        if (tab === 'inTransit') {
          // For "Waiting to be received" tab, fetch in-process data and filter for items with in_proccess status
          const {
            supplierGroups: supplierData,
            orderMethodGroups: orderMethodData,
            hasMore: hasMoreData,
          } = await fetchKanbanCardDetails('in-process', pageIndex, 50);

          // Get fulfilled items to exclude duplicates
          // Use cached data if available to avoid unnecessary API calls
          let fulfilledData: SupplierGroup[];
          if (cachedFulfilledData) {
            fulfilledData = cachedFulfilledData.supplierGroups;
          } else {
            try {
              const result = await fetchKanbanCardDetails('fulfilled');
              fulfilledData = result.supplierGroups;
            } catch (error) {
              console.warn(
                'Failed to fetch fulfilled data for filtering, continuing without it:',
                error,
              );
              fulfilledData = [];
            }
          }

          const fulfilledItemIds = new Set(
            fulfilledData.flatMap((group: SupplierGroup) =>
              group.items.map((item: ReceivingItem) => item.id),
            ),
          );

          // Filter for items with status 'in_proccess' only AND exclude items that are already fulfilled
          const inProgressSupplierData = supplierData
            .map((group) => ({
              ...group,
              items: group.items.filter(
                (item) =>
                  item.status === 'in_proccess' &&
                  !fulfilledItemIds.has(item.id),
              ),
            }))
            .filter((group) => group.items.length > 0);

          const inProgressOrderMethodData = orderMethodData
            .map((group) => ({
              ...group,
              items: group.items.filter(
                (item) =>
                  item.status === 'in_proccess' &&
                  !fulfilledItemIds.has(item.id),
              ),
            }))
            .filter((group) => group.items.length > 0);

          return {
            supplierGroups: inProgressSupplierData,
            orderMethodGroups: inProgressOrderMethodData,
            hasMore: hasMoreData,
          };
        } else if (tab === 'fulfilled') {
          // For "Recently Received" tab, fetch fulfilled data and show the most recently added items
          const {
            supplierGroups: supplierData,
            orderMethodGroups: orderMethodData,
            hasMore: hasMoreData,
          } = await fetchKanbanCardDetails('fulfilled', pageIndex, 50);

          // Show the most recently added items (last 10 items)
          const allFulfilledItems = [
            ...supplierData.flatMap((group) => group.items),
            ...orderMethodData.flatMap((group) => group.items),
          ];

          // Sort by creation time (most recent first) and take the last 10
          const recentItems = allFulfilledItems
            .sort((a, b) => {
              // Use fulfilledAt if available, otherwise use a default recent time
              const timeA = a.fulfilledAt
                ? new Date(a.fulfilledAt).getTime()
                : Date.now();
              const timeB = b.fulfilledAt
                ? new Date(b.fulfilledAt).getTime()
                : Date.now();
              return timeB - timeA; // Most recent first
            })
            .slice(0, 10); // Take only the 10 most recent

          const recentItemIds = new Set(recentItems.map((item) => item.id));

          const recentFulfilledSupplierData = supplierData
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => recentItemIds.has(item.id)),
            }))
            .filter((group) => group.items.length > 0);

          const recentFulfilledOrderMethodData = orderMethodData
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => recentItemIds.has(item.id)),
            }))
            .filter((group) => group.items.length > 0);

          // If no recent items found, show all fulfilled items
          if (
            recentFulfilledSupplierData.length === 0 &&
            recentFulfilledOrderMethodData.length === 0
          ) {
            return {
              supplierGroups: supplierData,
              orderMethodGroups: orderMethodData,
              hasMore: hasMoreData,
            };
          }

          return {
            supplierGroups: recentFulfilledSupplierData,
            orderMethodGroups: recentFulfilledOrderMethodData,
            hasMore: hasMoreData,
          };
        }
      } catch (error) {
        console.error('Failed to load kanban data:', error);
        if (handleAuthError(error)) {
          return {
            supplierGroups: [],
            orderMethodGroups: [],
            hasMore: false,
          };
        }
        return {
          supplierGroups: [],
          orderMethodGroups: [],
          hasMore: false,
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, isTokenValid, fetchKanbanCardDetails],
  );

  // - inTransit: Fetch from 'in-process' API (items with in_proccess status)
  // - fulfilled: Fetch from 'fulfilled' API (most recently added items)
  const loadDataForTab = useCallback(
    async (tab: 'inTransit' | 'fulfilled') => {
      try {
        if (!token || !isTokenValid) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        const data = await loadDataForTabWithoutGlobalUpdate(tab);

        if (!data) return;

        if (tab === 'inTransit') {
          // Store data in inTransit-specific state
          setInTransitSupplierGroups(data.supplierGroups);
        }

        // Update current active tab data
        setSupplierGroups(data.supplierGroups);
        setOrderMethodGroups(data.orderMethodGroups);
      } catch (error) {
        console.error('Failed to load kanban data:', error);
        if (handleAuthError(error)) {
          return;
        }
        // Keep empty array as fallback
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, isTokenValid, loadDataForTabWithoutGlobalUpdate],
  );

  // Function to load all tabs data
  const loadAllTabsData = useCallback(async () => {
    if (!token || !isTokenValid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Reset pagination state
    setCurrentPage(0);
    setHasMore(true);
    try {
      // First fetch fulfilled data once
      const fulfilledData = await loadDataForTabWithoutGlobalUpdate(
        'fulfilled',
        undefined,
        0,
      );

      // Then fetch inTransit data and pass cached fulfilled data to avoid duplicate call
      const inTransitData = await loadDataForTabWithoutGlobalUpdate(
        'inTransit',
        fulfilledData,
        0,
      );

      // Set the data for each tab's specific state
      if (inTransitData) {
        setInTransitSupplierGroups(inTransitData.supplierGroups);
      }

      // Set the current active tab data
      if (activeTab === 'inTransit' && inTransitData) {
        setSupplierGroups(inTransitData.supplierGroups);
        setOrderMethodGroups(inTransitData.orderMethodGroups);
        setHasMore(inTransitData.hasMore ?? false);
      } else if (activeTab === 'fulfilled' && fulfilledData) {
        setSupplierGroups(fulfilledData.supplierGroups);
        setOrderMethodGroups(fulfilledData.orderMethodGroups);
        setHasMore(fulfilledData.hasMore ?? false);
      }
    } catch (error) {
      console.error('Error loading all tabs data:', error);
      if (handleAuthError(error)) {
        return;
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isTokenValid, activeTab, loadDataForTabWithoutGlobalUpdate]);

  // Fetch kanban card details on component mount and when token changes
  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      return;
    }

    // If no user, AuthGuard should handle redirect - don't do anything here
    if (!user) {
      setIsLoading(false);
      initialLoadTokenRef.current = null;
      return;
    }

    if (!token || !isTokenValid) {
      setIsLoading(false);
      initialLoadTokenRef.current = null;
      return;
    }

    if (initialLoadTokenRef.current === token) {
      return;
    }

    initialLoadTokenRef.current = token;
    loadAllTabsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isTokenValid, user, authLoading]);

  // Handle tab switching - update global states with tab-specific data
  useEffect(() => {
    if (activeTab === 'inTransit') {
      setSupplierGroups(inTransitSupplierGroups);
      setOrderMethodGroups([]); // inTransit doesn't use orderMethodGroups
    } else if (activeTab === 'fulfilled') {
      // For fulfilled tab, we need to load fresh data since we don't store it separately
      if (token && isTokenValid) {
        loadDataForTab('fulfilled');
      }
    }
  }, [activeTab, inTransitSupplierGroups, token, isTokenValid, loadDataForTab]);

  const refreshKanbanData = useCallback(async () => {
    try {
      if (!token || !isTokenValid) return;

      // Reset pagination state
      setCurrentPage(0);
      setHasMore(true);

      // First fetch fulfilled data once
      const fulfilledData = await loadDataForTabWithoutGlobalUpdate(
        'fulfilled',
        undefined,
        0,
      );

      // Then fetch inTransit data and pass cached fulfilled data to avoid duplicate call
      const inTransitData = await loadDataForTabWithoutGlobalUpdate(
        'inTransit',
        fulfilledData,
        0,
      );

      // Update tab-specific states
      if (inTransitData) {
        setInTransitSupplierGroups(inTransitData.supplierGroups);
      }

      // Update current active tab data
      if (activeTab === 'inTransit' && inTransitData) {
        setSupplierGroups(inTransitData.supplierGroups);
        setOrderMethodGroups(inTransitData.orderMethodGroups);
        setHasMore(inTransitData.hasMore ?? false);
      } else if (activeTab === 'fulfilled' && fulfilledData) {
        setSupplierGroups(fulfilledData.supplierGroups);
        setOrderMethodGroups(fulfilledData.orderMethodGroups);
        setHasMore(fulfilledData.hasMore ?? false);
      }
    } catch (error) {
      console.error('Failed to refresh kanban data:', error);
      if (handleAuthError(error)) {
        return;
      }
    }
  }, [
    token,
    isTokenValid,
    activeTab,
    loadDataForTabWithoutGlobalUpdate,
    handleAuthError,
  ]);

  // Refresh data when window gains focus (user returns to tab/window)
  useEffect(() => {
    const handleFocus = () => {
      if (token && isTokenValid && !authLoading) {
        refreshKanbanData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [token, isTokenValid, authLoading, refreshKanbanData]);

  const inTransitCount = useMemo(
    () =>
      inTransitSupplierGroups.reduce(
        (total, group) => total + group.items.length,
        0,
      ),
    [inTransitSupplierGroups],
  );

  // Trigger function for forcing data refresh (must be after refreshKanbanData and loadDataForTab)
  const triggerDataRefresh = async () => {
    await refreshKanbanData();
    // Also force reload the current tab data specifically
    if (activeTab === 'inTransit') {
      await loadDataForTab('inTransit');
    } else if (activeTab === 'fulfilled') {
      await loadDataForTab('fulfilled');
    }
  };

  const handleMarkAsReceived = async (item: ReceivingItem) => {
    try {
      // Use JWT token from context
      if (!token || !isTokenValid) {
        return;
      }

      // Call the API to mark as received (using fulfill endpoint)
      const response = await fetch(
        `/api/arda/kanban/kanban-card/${item.id}/event/fulfill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.ok) {
          toast.success('Item marked as received successfully');
          await triggerDataRefresh();
        } else {
          console.error('Failed to mark as received:', data);
          toast.error('Failed to mark as received');
        }
      } else {
        console.error('Failed to mark as received:', response.status);
        toast.error('Failed to mark as received');
      }
    } catch (error) {
      console.error('Error marking as received:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error marking as received');
    }
  };

  const handleMarkAsFulfilled = async (item: ReceivingItem) => {
    try {
      // Use JWT token from context
      if (!token || !isTokenValid) {
        return;
      }

      // Call the API to mark as fulfilled
      const response = await fetch(
        `/api/arda/kanban/kanban-card/${item.id}/event/fulfill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          toast.success('Item marked as fulfilled successfully');
          await triggerDataRefresh();
        } else {
          console.error('Failed to mark as fulfilled:', data);
          toast.error('Failed to mark as fulfilled');
        }
      } else {
        console.error('Failed to mark as fulfilled:', response.status);
        toast.error('Failed to mark as fulfilled');
      }
    } catch (error) {
      console.error('Error marking as fulfilled:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error marking as fulfilled');
    }
  };

  const handleReceiveAll = async () => {
    try {
      // Get all items that are ready to be received (in_proccess status)
      const itemsToReceive = getFilteredItems.filter(
        (item) => item.status === 'in_proccess',
      );

      if (itemsToReceive.length === 0) {
        toast.info('No items to receive');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading(
        `Receiving ${itemsToReceive.length} items...`,
      );

      // Process each item
      const results = await Promise.allSettled(
        itemsToReceive.map(async (item) => {
          try {
            // Use JWT token from context (same as individual handleMarkAsReceived)
            if (!token || !isTokenValid) {
              throw new Error('No valid JWT token found');
            }

            const response = await fetch(
              `/api/arda/kanban/kanban-card/${item.id}/event/fulfill`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                `API Error for item ${item.id}:`,
                response.status,
                errorText,
              );
              throw new Error(
                `HTTP error! status: ${response.status} - ${errorText}`,
              );
            }

            await response.json();

            return { success: true, item };
          } catch (error) {
            console.error(`Error receiving item ${item.id}:`, error);
            return {
              success: false,
              item,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }),
      );

      // Count successes and failures
      const successful = results.filter(
        (r) => r.status === 'fulfilled' && r.value.success,
      ).length;
      const failed = results.filter(
        (r) =>
          r.status === 'rejected' ||
          (r.status === 'fulfilled' && !r.value.success),
      );

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show results
      if (successful > 0) {
        toast.success(`Successfully received ${successful} items`);
      }
      if (failed.length > 0) {
        toast.error(`Failed to receive ${failed.length} items`);
        console.error('Failed items details:', failed);
      }

      // Refresh data from API to ensure consistency
      if (successful > 0) {
        // Add a small delay to ensure API has processed all requests
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Force a complete refresh
        await triggerDataRefresh();
      }
    } catch (error) {
      console.error('Error in handleReceiveAll:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Failed to process receive all');
    }
  };

  const getFilteredItems = useMemo(() => {
    const allItems: ReceivingItem[] = [];
    const itemIds = new Set<string>();

    // Add items from supplier groups
    supplierGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (!itemIds.has(item.id)) {
          itemIds.add(item.id);
          allItems.push(item);
        }
      });
    });

    // Add items from order method groups (avoid duplicates by ID)
    orderMethodGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (!itemIds.has(item.id)) {
          itemIds.add(item.id);
          allItems.push(item);
        }
      });
    });

    // Apply search filter if exists
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearchTerm) ||
          item.supplier.toLowerCase().includes(lowerSearchTerm) ||
          item.orderMethod.toLowerCase().includes(lowerSearchTerm),
      );
    }

    return allItems;
  }, [supplierGroups, orderMethodGroups, searchTerm]);

  const mapOrderMethodToMechanism = (
    apiOrderMethod: string | null | undefined
  ): items.OrderMechanism => {
    if (!apiOrderMethod || typeof apiOrderMethod !== 'string') return 'ONLINE';
    const u = apiOrderMethod.toUpperCase();
    const valid: items.OrderMechanism[] = [
      'PURCHASE_ORDER', 'EMAIL', 'PHONE', 'IN_STORE', 'ONLINE',
      'RFQ', 'PRODUCTION', 'THIRD_PARTY', 'OTHER',
    ];
    return valid.includes(u as items.OrderMechanism) ? (u as items.OrderMechanism) : 'ONLINE';
  };

  const mapApiDataToItemDetails = (
    apiData: KanbanCardResponse['results'][0],
  ) => {
    const itemDetails = apiData?.payload?.itemDetails;
    const primarySupply = itemDetails?.primarySupply;

    return {
      eid: itemDetails?.eId || '',
      title: itemDetails?.name || 'Unknown Item',
      minQty: itemDetails?.minQuantity?.amount?.toString() || '',
      minUnit: itemDetails?.minQuantity?.unit || '',
      orderQty: primarySupply?.orderQuantity?.amount?.toString() || '',
      orderUnit: primarySupply?.orderQuantity?.unit || '',
      location: itemDetails?.locator?.location || '',
      supplier: primarySupply?.supplier || '',
      sku: primarySupply?.sku || '',
      image: itemDetails?.imageUrl || '',
      link: primarySupply?.url || '',
      unitPrice: primarySupply?.unitCost?.value || 0.0,
      notes: itemDetails?.notes || '',
      classification: itemDetails?.classification || {},
      locator: itemDetails?.locator || {},
      cardSize: itemDetails?.cardSize || '',
      labelSize: itemDetails?.labelSize || '',
      breadcrumbSize: itemDetails?.breadcrumbSize || '',
      itemColor: itemDetails?.itemColor || '',
      internalSKU: itemDetails?.internalSKU || '',
      generalLedgerCode: itemDetails?.generalLedgerCode || '',
      useCase: itemDetails?.useCase || '',
      taxable: itemDetails?.taxable || false,
      cardNotesDefault: itemDetails?.cardNotesDefault || '',
      defaultSupply: itemDetails?.defaultSupply || '',
      secondarySupply: itemDetails?.secondarySupply || null,
      orderMechanism: mapOrderMethodToMechanism(primarySupply?.orderMethod),
    };
  };

  // Handler for opening item details panel
  const handleViewCardDetails = async (item: ReceivingItem) => {
    try {
      // Prefer fetching by ID to avoid relying on tab-specific caches
      const card = await getKanbanCard(item.id);

      // Map fetched payload to ItemDetailsPanel format
      const mappedItem = mapApiDataToItemDetails({
        payload: card?.payload || {},
      } as unknown as KanbanCardResponse['results'][0]);

      setSelectedItemForDetails(mappedItem);
      setIsItemDetailsPanelOpen(true);
      return;
    } catch (error) {
      console.error('Failed to fetch kanban card by ID, falling back:', error);
      toast.error('Could not load full card details. Showing cached info.');
    }

    // Fallback to cached API data if direct fetch fails
    try {
      const apiData = originalApiData.find(
        (apiItem) => apiItem?.payload?.eId === item.id,
      );

      if (apiData) {
        const mappedItem = mapApiDataToItemDetails(apiData);
        setSelectedItemForDetails(mappedItem);
        setIsItemDetailsPanelOpen(true);
      }
    } catch (fallbackError) {
      console.error('Fallback mapping failed:', fallbackError);
      toast.error('Unable to open card details.');
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className='w-full pt-20 px-4 pb-4 md:pt-24 md:pb-8 flex flex-col gap-6'>
          {/* Header */}
          <div className='flex flex-col gap-3'>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>Receiving</h1>
              <p className='text-muted-foreground'>
                Incoming! Manage what comes in, then make sure it gets where it
                needs to be.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex border-b border-border'>
            <button
              onClick={() => {
                setActiveTab('inTransit');
                loadDataForTab('inTransit');
              }}
              className={`px-6 py-3 font-medium relative transition-colors ${
                activeTab === 'inTransit'
                  ? 'text-foreground border-b-2 border-orange-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-2'>
                Receiving
                {inTransitCount > 0 && (
                  <Badge className='bg-white text-black border border-gray-300 rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs'>
                    {inTransitCount}
                  </Badge>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('fulfilled');
                loadDataForTab('fulfilled');
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'fulfilled'
                  ? 'text-foreground border-b-2 border-orange-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-2'>Recently Received</div>
            </button>
          </div>

          {/* Controls */}
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='relative max-w-xs w-full'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  placeholder='Search Items'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Receive All Button - Only show on inTransit tab when there are items to receive */}
            {activeTab === 'inTransit' &&
              getFilteredItems.some(
                (item) => item.status === 'in_proccess',
              ) && (
                <div className='flex justify-start'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleReceiveAll}
                    className='bg-white border-black text-black hover:bg-gray-100 flex items-center gap-2'
                  >
                    <Package className='w-4 h-4' />
                    Receive All
                  </Button>
                </div>
              )}
          </div>

          {/* Receiving List */}
          <div className='space-y-4'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4'></div>
                  <p className='text-muted-foreground'>
                    Loading receiving data...
                  </p>
                </div>
              </div>
            ) : getFilteredItems.length === 0 ? (
              <EmptyOrdersState
                title={
                  activeTab === 'fulfilled'
                    ? 'No fulfilled items'
                    : activeTab === 'received'
                      ? 'No received items'
                      : 'No items to receive'
                }
                subtitle={
                  activeTab === 'fulfilled'
                    ? 'There are no fulfilled items to display'
                    : activeTab === 'received'
                      ? 'There are no received items to display'
                      : 'There are no items in transit or ready for receiving'
                }
              />
            ) : (
              // Show all items in a flat list
              <div className='space-y-2'>
                {getFilteredItems.map((item) => (
                  <div
                    key={item.id}
                    className='border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted/30 transition-colors bg-card shadow-sm'
                  >
                    <div className='flex items-center gap-4 flex-1'>
                      <div className={`p-2.5 rounded-lg `}>
                        {item.status === 'in_proccess' ? (
                          <WaitingToBeReceivedIcon width={50} height={50} />
                        ) : item.status === 'Received' ? (
                          <ReceivedIcon width={50} height={50} />
                        ) : item.status === 'Fulfilled' ? (
                          activeTab === 'received' ? (
                            <ReceivedIcon width={50} height={50} />
                          ) : (
                            <RecentlyFulfilledIcon width={50} height={50} />
                          )
                        ) : (
                          getOrderMethodIcon(item.orderMethod)
                        )}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-1'>
                          <span className='font-semibold text-[var(--colors-link-light)]'>
                            {item.name}
                          </span>
                          <span className='text-sm text-[var(--base-muted-foreground)]'>
                            {item.quantity}
                          </span>
                          {item.status === 'Fulfilled' && (
                            <Badge
                              variant='secondary'
                              className='bg-white text-black border border-black flex items-center gap-2'
                            >
                              <CheckCircle className='w-4 h-4' />
                              Restocked
                            </Badge>
                          )}
                        </div>
                        <p className='text-sm text-[var(--base-muted-foreground)]'>
                          Order method:{' '}
                          <span className='font-semibold'>
                            {item.orderMethod}
                          </span>
                          {item.notes && (
                            <>
                              {' • '}
                              Note: <span>{item.notes}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {item.status === 'in_proccess' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleMarkAsReceived(item)}
                          className='bg-white border-black text-black hover:bg-gray-100'
                        >
                          <Package className='w-4 h-4 mr-2' />
                          Receive
                        </Button>
                      )}
                      {item.status === 'Fulfilled' &&
                        activeTab !== 'fulfilled' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleMarkAsFulfilled(item)}
                            className='bg-white border-black text-black hover:bg-gray-100'
                          >
                            <CheckCircle className='w-4 h-4 mr-2' />
                            Mark as fulfilled
                          </Button>
                        )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='outline' size='sm' className='p-2'>
                            <MoreHorizontal className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => handleViewCardDetails(item)}
                          >
                            View card details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <CardStateDropdown
                            card={receivingItemToKanbanCard(item)}
                            onTriggerRefresh={triggerDataRefresh}
                            showToast={(message) => toast.success(message)}
                            orderMethod={item.orderMethod}
                            link={item.link}
                            onOpenEmailPanel={() => {
                              // For Receiving, we don't have email panel functionality
                            }}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && !isLoading && (
                  <div className='flex justify-center pt-4'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={loadMoreItems}
                      disabled={isLoadingMore}
                      className='bg-white border-black text-black hover:bg-gray-100'
                    >
                      {isLoadingMore ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2'></div>
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}

                {/* Loading More Indicator */}
                {isLoadingMore && (
                  <div className='flex justify-center py-4'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500'></div>
                      <span className='text-sm'>Loading more items...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Item Details Panel */}
      {selectedItemForDetails && (
        <ItemDetailsPanel
          item={selectedItemForDetails}
          isOpen={isItemDetailsPanelOpen}
          onClose={() => setIsItemDetailsPanelOpen(false)}
          onOpenChange={() => setIsItemDetailsPanelOpen(false)}
          onEditItem={() => {
            // Close the details panel and open the edit panel
            setIsItemDetailsPanelOpen(false);
            setIsItemFormPanelOpen(true);
          }}
        />
      )}

      {/* Item Form Panel for editing */}
      <ItemFormPanel
        isOpen={isItemFormPanelOpen}
        onClose={() => {
          setIsItemFormPanelOpen(false);
        }}
        itemToEdit={
          selectedItemForDetails
            ? {
                entityId: selectedItemForDetails.eid,
                recordId: selectedItemForDetails.eid,
                author: 'system',
                timeCoordinates: {
                  recordedAsOf: Date.now(),
                  effectiveAsOf: Date.now(),
                },
                createdCoordinates: {
                  recordedAsOf: Date.now(),
                  effectiveAsOf: Date.now(),
                },
                name: selectedItemForDetails.title,
                minQuantity: {
                  amount: parseFloat(selectedItemForDetails.minQty) || 0,
                  unit: selectedItemForDetails.minUnit,
                },
                locator: {
                  location: selectedItemForDetails.location,
                  facility: '',
                  department: '',
                },
                primarySupply: {
                  supplier: selectedItemForDetails.supplier,
                  url: selectedItemForDetails.link,
                  sku: selectedItemForDetails.sku,
                  unitCost: {
                    value: selectedItemForDetails.unitPrice,
                    currency: 'USD',
                  },
                  minimumQuantity: {
                    amount: parseFloat(selectedItemForDetails.minQty) || 0,
                    unit: selectedItemForDetails.minUnit,
                  },
                  orderQuantity: {
                    amount: parseFloat(selectedItemForDetails.orderQty) || 0,
                    unit: selectedItemForDetails.orderUnit,
                  },
                  orderMechanism: selectedItemForDetails.orderMechanism ?? 'ONLINE',
                  orderCost: {
                    value: selectedItemForDetails.unitPrice,
                    currency: 'USD',
                  },
                  averageLeadTime: { length: 0, unit: 'DAY' },
                },
                notes: selectedItemForDetails.notes,
                classification: {
                  type:
                    ((
                      selectedItemForDetails.classification as Record<
                        string,
                        unknown
                      >
                    )?.type as string) || '',
                  subType:
                    ((
                      selectedItemForDetails.classification as Record<
                        string,
                        unknown
                      >
                    )?.subType as string) || '',
                },
                cardSize:
                  (selectedItemForDetails.cardSize as
                    | 'SMALL'
                    | 'MEDIUM'
                    | 'LARGE') || 'MEDIUM',
                labelSize:
                  (selectedItemForDetails.labelSize as
                    | 'SMALL'
                    | 'MEDIUM'
                    | 'LARGE'
                    | 'X_LARGE') || 'MEDIUM',
                breadcrumbSize:
                  (selectedItemForDetails.breadcrumbSize as
                    | 'SMALL'
                    | 'MEDIUM'
                    | 'LARGE'
                    | 'X_LARGE') || 'MEDIUM',
                internalSKU: selectedItemForDetails.internalSKU,
                useCase: selectedItemForDetails.useCase,
                taxable: selectedItemForDetails.taxable,
                cardNotesDefault: selectedItemForDetails.cardNotesDefault,
                defaultSupply: selectedItemForDetails.defaultSupply,
                secondarySupply: selectedItemForDetails.secondarySupply
                  ? (() => {
                      const secSupply =
                        selectedItemForDetails.secondarySupply as Record<
                          string,
                          unknown
                        >;
                      const unitCostObj = secSupply?.unitCost as
                        | { value: number; currency: Currency | string }
                        | undefined;
                      const minQtyObj = secSupply?.minimumQuantity as
                        | { amount: number; unit: string }
                        | undefined;
                      const orderQtyObj = secSupply?.orderQuantity as
                        | { amount: number; unit: string }
                        | undefined;
                      const leadTimeObj = secSupply?.averageLeadTime as
                        | { length: number; unit: string }
                        | undefined;
                      const orderMethod =
                        (secSupply?.orderMethod as string) || 'ONLINE';

                      return {
                        supplier: (secSupply?.supplier as string) || '',
                        url: (secSupply?.url as string) || '',
                        sku: (secSupply?.sku as string) || '',
                        unitCost: unitCostObj
                          ? {
                              value: unitCostObj.value,
                              currency:
                                (unitCostObj.currency as Currency) ||
                                defaultCurrency,
                            }
                          : { value: 0, currency: defaultCurrency },
                        minimumQuantity: minQtyObj
                          ? {
                              amount: minQtyObj.amount,
                              unit: minQtyObj.unit,
                            }
                          : { amount: 0, unit: 'each' },
                        orderQuantity: orderQtyObj
                          ? {
                              amount: orderQtyObj.amount,
                              unit: orderQtyObj.unit,
                            }
                          : { amount: 0, unit: 'each' },
                        orderMechanism:
                          (orderMethod.toUpperCase() as
                            | 'PURCHASE_ORDER'
                            | 'EMAIL'
                            | 'PHONE'
                            | 'IN_STORE'
                            | 'ONLINE'
                            | 'RFQ'
                            | 'PRODUCTION'
                            | 'THIRD_PARTY'
                            | 'OTHER') || 'ONLINE',
                        orderCost:
                          unitCostObj && orderQtyObj
                            ? {
                                value: unitCostObj.value * orderQtyObj.amount,
                                currency:
                                  (unitCostObj.currency as Currency) ||
                                  defaultCurrency,
                              }
                            : { value: 0, currency: defaultCurrency },
                        averageLeadTime: leadTimeObj
                          ? {
                              length: leadTimeObj.length,
                              unit:
                                (leadTimeObj.unit.toUpperCase() as TimeUnit) ||
                                defaultTimeUnit,
                            }
                          : { length: 0, unit: defaultTimeUnit },
                      };
                    })()
                  : undefined,
                imageUrl: selectedItemForDetails.image,
              }
            : null
        }
        onSuccess={async () => {
          setIsItemFormPanelOpen(false);
          // Small delay to ensure backend has processed the update
          await new Promise((resolve) => setTimeout(resolve, 500));
          // Refresh the data after successful edit
          await refreshKanbanData();
        }}
      />
    </SidebarProvider>
  );
}
