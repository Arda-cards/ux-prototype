'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { perfLogger } from '@frontend/utils/performanceLogger';
import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';
import { useJWT } from '@frontend/store/hooks/useJWT';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import { SquareCheckBig } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@frontend/components/ui/dropdown-menu';
import {
  Search,
  ChevronDown,
  MoreHorizontal,
  ChevronsUpDown,
  ExternalLink,
  X,
} from 'lucide-react';
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
import { toast } from 'sonner';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import type { Currency } from '@frontend/types/domain';
import { defaultCurrency } from '@frontend/types/domain';
import type { TimeUnit } from '@frontend/types/general';
import { defaultTimeUnit } from '@frontend/types/general';

// Import kanban types
import { KanbanCardResponse, KanbanCardResponseData } from '@frontend/types';
import { mapApiStatusToDisplay } from '@frontend/lib/cardStateUtils';
import { CardStateDropdown } from '@frontend/components/common/CardStateDropdown';
import { KanbanCardStatus, KanbanCardPrintStatus } from '@frontend/types/kanban-cards';

const ItemDetailsPanel = dynamic(
  () =>
    import('@/components/items/ItemDetailsPanel').then(
      (mod) => mod.ItemDetailsPanel
    ),
  {
    loading: () => (
      <div className='p-4 text-sm text-muted-foreground'>
        Loading item details...
      </div>
    ),
    ssr: false,
  }
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
  }
);

const EmailPanel = dynamic(() => import('@/components/EmailPanel'), {
  loading: () => (
    <div className='p-4 text-sm text-muted-foreground'>
      Loading email panel...
    </div>
  ),
  ssr: false,
});

// Helper function to get status display info
function getStatusDisplayInfo(status: OrderItem['status']) {
  const statusMap: Record<
    OrderItem['status'],
    { label: string; color: string; bgColor: string }
  > = {
    'Ready to order': {
      label: 'Ready to order',
      color: '#6B7280',
      bgColor: '#F9FAFB',
    },
    Requesting: {
      label: 'In Order Queue',
      color: '#FF6B35',
      bgColor: '#FFF4F0',
    },
    Requested: { label: 'In Progress', color: '#F59E0B', bgColor: '#FFFBEB' },
    'In progress': { label: 'Receiving', color: '#3B82F6', bgColor: '#EFF6FF' },
    Ordered: { label: 'Ordered', color: '#8B5CF6', bgColor: '#F3E8FF' },
    'In transit': { label: 'In Transit', color: '#06B6D4', bgColor: '#ECFEFF' },
    Received: { label: 'Received', color: '#10B981', bgColor: '#ECFDF5' },
    Fulfilled: { label: 'Restocked', color: '#10B981', bgColor: '#ECFDF5' },
  };

  return statusMap[status] || statusMap['Ready to order'];
}

// Helper function to convert OrderItem to KanbanCard for CardStateDropdown
function orderItemToKanbanCard(item: OrderItem) {
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
    status: (item.status === 'In progress'
      ? 'IN_PROCESS'
      : item.status === 'Requested'
      ? 'REQUESTED'
      : item.status === 'Requesting'
      ? 'REQUESTING'
      : item.status === 'Fulfilled'
      ? 'FULFILLED'
      : 'UNKNOWN') as KanbanCardStatus,
    serialNumber: item.id, // Use ID as serial number
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

interface OrderItem {
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
  status:
    | 'Ready to order'
    | 'In progress'
    | 'Requesting'
    | 'Requested'
    | 'Ordered'
    | 'In transit'
    | 'Received'
    | 'Fulfilled';
  supplier: string;
  orderedAt?: string;
  link?: string;
  image?: string;
  taxable?: boolean;
  sku?: string;
  unitPrice?: number;
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
  items: OrderItem[];
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
  items: OrderItem[];
  expanded: boolean;
}

// Initial empty state for supplier groups
const initialSupplierGroups: SupplierGroup[] = [];

// Function to map order method from API to UI format
const mapOrderMethod = (
  apiOrderMethod: string | null | undefined
): OrderItem['orderMethod'] => {
  if (!apiOrderMethod || typeof apiOrderMethod !== 'string') {
    return 'Online'; // Default fallback
  }

  switch (apiOrderMethod.toUpperCase()) {
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

// Function to map order method from API to OrderMechanism format (for form)
const mapOrderMethodToMechanism = (
  apiOrderMethod: string | null | undefined
):
  | 'PURCHASE_ORDER'
  | 'EMAIL'
  | 'PHONE'
  | 'IN_STORE'
  | 'ONLINE'
  | 'RFQ'
  | 'PRODUCTION'
  | 'THIRD_PARTY'
  | 'OTHER' => {
  if (!apiOrderMethod || typeof apiOrderMethod !== 'string') {
    return 'ONLINE'; // Default fallback
  }

  const upperMethod = apiOrderMethod.toUpperCase();
  if (
    upperMethod === 'PURCHASE_ORDER' ||
    upperMethod === 'EMAIL' ||
    upperMethod === 'PHONE' ||
    upperMethod === 'IN_STORE' ||
    upperMethod === 'ONLINE' ||
    upperMethod === 'RFQ' ||
    upperMethod === 'PRODUCTION' ||
    upperMethod === 'THIRD_PARTY' ||
    upperMethod === 'OTHER'
  ) {
    return upperMethod as
      | 'PURCHASE_ORDER'
      | 'EMAIL'
      | 'PHONE'
      | 'IN_STORE'
      | 'ONLINE'
      | 'RFQ'
      | 'PRODUCTION'
      | 'THIRD_PARTY'
      | 'OTHER';
  }

  return 'ONLINE';
};

const getOrderMethodBackgroundColor = (method: string) => {
  switch (method) {
    case 'Online':
      return 'bg-[#FEE2E2]';
    case 'Purchase order':
      return 'bg-[#FFEBE5]';
    case 'Phone':
      return 'bg-[#E0F2FE]';
    case 'Email':
      return 'bg-[#DCFCE7]';
    case 'In store':
      return 'bg-[#E0E7FF]';
    case 'Production':
      return 'bg-[#FEF3C7]';
    case '3rd party':
      return 'bg-[#CCFBF1]';
    case 'Request for quotation (RFQ)':
      return 'bg-[#ECFCCB]';
    default:
      return 'bg-orange-100';
  }
};

export default function OrderQueuePage() {
  const { handleAuthError } = useAuthErrorHandler();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'ready' | 'recent'>('ready');
  const [groupBy, setGroupBy] = useState<'none' | 'supplier' | 'orderMethod'>(
    'supplier'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierGroups, setSupplierGroups] = useState<SupplierGroup[]>(
    initialSupplierGroups
  );

  const [orderMethodGroups, setOrderMethodGroups] = useState<
    OrderMethodGroup[]
  >([]);
  const [originalApiData, setOriginalApiData] = useState<
    KanbanCardResponse['results']
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemDetailsPanelOpen, setIsItemDetailsPanelOpen] = useState(false);
  const [isEmailPanelOpen, setIsEmailPanelOpen] = useState(false);
  const [isItemFormPanelOpen, setIsItemFormPanelOpen] = useState(false);
  const [selectedItemsForEmail, setSelectedItemsForEmail] = useState<
    OrderItem[]
  >([]);
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
    orderMechanism:
      | 'PURCHASE_ORDER'
      | 'EMAIL'
      | 'PHONE'
      | 'IN_STORE'
      | 'ONLINE'
      | 'RFQ'
      | 'PRODUCTION'
      | 'THIRD_PARTY'
      | 'OTHER';
  } | null>(null);

  // Modal state for missing URLs
  const [isMissingUrlModalOpen, setIsMissingUrlModalOpen] = useState(false);
  const [missingUrlCount, setMissingUrlCount] = useState(0);
  const [itemsWithUrls, setItemsWithUrls] = useState<OrderItem[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState(0);

  const initialLoadTokenRef = useRef<string | null>(null);

  // Get JWT token and user context from context
  const { token, isTokenValid, userContext } = useJWT();

  // Get order queue context
  const { updateOrderCounts, refreshOrderQueueData } = useOrderQueue();

  // Function to fetch kanban card details
  const fetchKanbanCardDetails = useCallback(async (): Promise<{
    supplierGroups: SupplierGroup[];
    orderMethodGroups: OrderMethodGroup[];
  }> => {
    perfLogger.start('fetchKanbanCardDetails');
    try {
      const requestBody = {
        filter: true,
        paginate: {
          index: 0,
          size: 200,
        },
      };

      // Fetch requested cards first
      const requestedResponse = await fetch(
        '/api/arda/kanban/kanban-card/details/requested',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!requestedResponse.ok) {
        console.error(
          'Requested cards response not ok:',
          requestedResponse.status,
          requestedResponse.statusText
        );
        const errorText = await requestedResponse.text();
        console.error('Requested cards error body:', errorText);
        if (requestedResponse.status === 401) {
          console.error(
            'Authentication failed for requested cards - JWT token missing or invalid'
          );
        }
        throw new Error(
          `HTTP error! requested: ${requestedResponse.status} - ${errorText}`
        );
      }

      // Fetch in-process cards
      const inProcessResponse = await fetch(
        '/api/arda/kanban/kanban-card/details/in-process',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!inProcessResponse.ok) {
        console.error(
          'In-process cards response not ok:',
          inProcessResponse.status,
          inProcessResponse.statusText
        );
        const errorText = await inProcessResponse.text();
        console.error('In-process cards error body:', errorText);
        if (inProcessResponse.status === 401) {
          console.error(
            'Authentication failed for in-process cards - JWT token missing or invalid'
          );
        }
        throw new Error(
          `HTTP error! in-process: ${inProcessResponse.status} - ${errorText}`
        );
      }

      // Fetch requesting cards
      const requestingResponse = await fetch(
        '/api/arda/kanban/kanban-card/details/requesting',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!requestingResponse.ok) {
        console.error(
          'Requesting cards response not ok:',
          requestingResponse.status,
          requestingResponse.statusText
        );
        const errorText = await requestingResponse.text();
        console.error('Requesting cards error body:', errorText);
        if (requestingResponse.status === 401) {
          console.error(
            'Authentication failed for requesting cards - JWT token missing or invalid'
          );
        }
        throw new Error(
          `HTTP error! requesting: ${requestingResponse.status} - ${errorText}`
        );
      }

      const requestedData: KanbanCardResponseData =
        await requestedResponse.json();
      const inProcessData: KanbanCardResponseData =
        await inProcessResponse.json();
      const requestingData: KanbanCardResponseData =
        await requestingResponse.json();

      // Combine all datasets
      const allResults = [
        ...(requestedData.data?.results || []),
        ...(inProcessData.data?.results || []),
        ...(requestingData.data?.results || []),
      ];

      // Store original API data
      setOriginalApiData(allResults);

      // Create lookup maps for O(1) status checking instead of O(n) .some() calls
      perfLogger.start('createStatusLookupSets', {
        totalItems: allResults.length,
      });
      const inProcessEIds = new Set(
        (inProcessData.data?.results || []).map((card) => card?.payload?.eId)
      );
      const requestingEIds = new Set(
        (requestingData.data?.results || []).map((card) => card?.payload?.eId)
      );
      const requestedEIds = new Set(
        (requestedData.data?.results || []).map((card) => card?.payload?.eId)
      );
      perfLogger.end('createStatusLookupSets', {
        inProcessCount: inProcessEIds.size,
        requestingCount: requestingEIds.size,
        requestedCount: requestedEIds.size,
      });

      // Group items by supplier
      const supplierMap = new Map<string, OrderItem[]>();
      // Group items by order method
      const orderMethodMap = new Map<string, OrderItem[]>();

      // Check if results exist and is an array
      if (!allResults || !Array.isArray(allResults)) {
        return { supplierGroups: [], orderMethodGroups: [] };
      }

      perfLogger.start('processItems', { itemCount: allResults.length });
      allResults.forEach((result: KanbanCardResponse['results'][0]) => {
        try {
          // Check if primarySupply exists in itemDetails
          const primarySupply = result.payload?.itemDetails?.primarySupply;
          const eId = result.payload?.eId;

          if (!primarySupply) {
            // Use default values when primarySupply is not available
            // But still determine status based on endpoint using O(1) lookup
            let status: OrderItem['status'] = 'Ready to order';

            if (eId && inProcessEIds.has(eId)) {
              status = 'In progress';
            } else if (eId && requestingEIds.has(eId)) {
              status = 'Requesting';
            } else if (eId && requestedEIds.has(eId)) {
              status = 'Requested';
            }

            const orderItem: OrderItem = {
              id: result.payload?.eId || 'unknown-id',
              name: result.payload?.itemDetails?.name || 'Unknown Item',
              quantity: `${
                result.payload?.itemDetails?.primarySupply?.orderQuantity
                  ?.amount || 0
              }${
                result.payload?.itemDetails?.primarySupply?.orderQuantity?.unit
                  ? ` ${result.payload.itemDetails.primarySupply.orderQuantity.unit}`
                  : ' each'
              }`,
              orderMethod: 'Online',
              status,
              supplier: 'No supplier',
              link: result.payload?.itemDetails?.primarySupply?.url || '',
              image: result.payload?.itemDetails?.imageUrl || '',
              taxable: result.payload?.itemDetails?.taxable || false,
              sku: result.payload?.itemDetails?.primarySupply?.sku || '',
              unitPrice:
                result.payload?.itemDetails?.primarySupply?.unitCost?.value ||
                0,
              notes:
                (result.payload as { notes?: string })?.notes ||
                result.payload?.itemDetails?.cardNotesDefault ||
                '',
            };

            // Add to default supplier group
            if (supplierMap.has('No supplier')) {
              supplierMap.get('No supplier')!.push(orderItem);
            } else {
              supplierMap.set('No supplier', [orderItem]);
            }

            // Add to default order method group
            if (orderMethodMap.has('Online')) {
              orderMethodMap.get('Online')!.push(orderItem);
            } else {
              orderMethodMap.set('Online', [orderItem]);
            }
            return;
          }

          const supplier = primarySupply.supplier || 'No supplier';
          const orderMethod = mapOrderMethod(
            primarySupply.orderMethod || 'ONLINE'
          );

          // Determine status based on which API response the card came from and the actual status from API
          // Use O(1) lookup instead of O(n) .some() calls
          let status: OrderItem['status'] = 'Ready to order';

          if (eId && inProcessEIds.has(eId)) {
            status = 'In progress';
          } else if (eId && requestingEIds.has(eId)) {
            status = 'Requesting';
          } else if (eId && requestedEIds.has(eId)) {
            status = 'Requested';
          }

          // Map API status to display status using the new utility
          const apiStatus = result.payload?.status;
          if (apiStatus) {
            const mappedStatus = mapApiStatusToDisplay(apiStatus);

            // Map our standardized statuses to OrderItem statuses
            switch (mappedStatus) {
              case 'REQUESTING':
                status = 'Requesting';
                break;
              case 'REQUESTED':
                status = 'Requested';
                break;
              case 'IN_PROCESS':
                status = 'In progress';
                break;
              case 'FULFILLED':
                status = 'Fulfilled';
                break;
              default:
                status = 'Ready to order';
            }
          }

          const orderItem: OrderItem = {
            id: result.payload?.eId || 'unknown-id',
            name: result.payload?.itemDetails?.name || 'Unknown Item',
            quantity: `${
              result.payload?.itemDetails?.primarySupply?.orderQuantity
                ?.amount || 0
            }${
              result.payload?.itemDetails?.primarySupply?.orderQuantity?.unit
                ? ` ${result.payload.itemDetails.primarySupply.orderQuantity.unit}`
                : ' each'
            }`,
            orderMethod,
            status,
            supplier,
            link: result.payload?.itemDetails?.primarySupply?.url || '',
            image: result.payload?.itemDetails?.imageUrl || '',
            taxable: result.payload?.itemDetails?.taxable || false,
            sku: result.payload?.itemDetails?.primarySupply?.sku || '',
            unitPrice:
              result.payload?.itemDetails?.primarySupply?.unitCost?.value || 0,
            notes:
              (result.payload as { notes?: string })?.notes ||
              result.payload?.itemDetails?.cardNotesDefault ||
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
          console.error(
            `Error processing card ${result?.payload?.eId || 'unknown'}:`,
            error
          );
          // Continue with next item
        }
      });
      perfLogger.end('processItems', {
        processedCount: allResults.length,
        supplierGroups: supplierMap.size,
        orderMethodGroups: orderMethodMap.size,
      });

      // Convert supplier map to array format
      perfLogger.start('convertMapsToArrays');
      const supplierGroups: SupplierGroup[] = Array.from(
        supplierMap.entries()
      ).map(([supplier, items]) => ({
        name: supplier,
        orderMethod: items[0].orderMethod, // Use first item's order method for group
        items,
        expanded: true,
      }));

      // Convert order method map to array format
      const orderMethodGroups: OrderMethodGroup[] = Array.from(
        orderMethodMap.entries()
      ).map(([orderMethod, items]) => ({
        name: orderMethod,
        orderMethod: items[0].orderMethod,
        items,
        expanded: true,
      }));
      perfLogger.end('convertMapsToArrays');

      perfLogger.end('fetchKanbanCardDetails', {
        itemCount: allResults.length,
        supplierGroups: supplierGroups.length,
        orderMethodGroups: orderMethodGroups.length,
      });

      return { supplierGroups, orderMethodGroups };
    } catch (error) {
      console.error('Error fetching kanban card details:', error);
      if (handleAuthError(error)) {
        return { supplierGroups: [], orderMethodGroups: [] };
      }
      perfLogger.end('fetchKanbanCardDetails', { error: true });
      // Return empty arrays as fallback
      return { supplierGroups: [], orderMethodGroups: [] };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch kanban card details on component mount
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

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        perfLogger.start('loadInitialData');
        const {
          supplierGroups: supplierData,
          orderMethodGroups: orderMethodData,
        } = await fetchKanbanCardDetails();

        setSupplierGroups(supplierData);
        setOrderMethodGroups(orderMethodData);

        // Update global order counts
        const readyToOrderCount = supplierData.reduce(
          (total, group) =>
            total +
            group.items.filter(
              (item) =>
                item.status === 'Requesting' || item.status === 'Requested'
            ).length,
          0
        );
        updateOrderCounts({ readyToOrder: readyToOrderCount });
        perfLogger.end('loadInitialData', {
          supplierGroupsCount: supplierData.length,
          totalItems: supplierData.reduce((sum, g) => sum + g.items.length, 0),
        });
      } catch (error) {
        // Check if this is an authentication error
        if (handleAuthError(error)) {
          return;
        }
        console.error('Failed to load kanban data:', error);
        perfLogger.end('loadInitialData', { error: true });
        // Keep empty array as fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isTokenValid, user, authLoading]);

  const readyToOrderCount = useMemo(
    () =>
      supplierGroups.reduce(
        (total, group) =>
          total +
          group.items.filter(
            (item) =>
              item.status === 'Requesting' || item.status === 'Requested'
          ).length,
        0
      ),
    [supplierGroups]
  );

  const toggleSupplierExpansion = (groupName: string) => {
    if (groupBy === 'supplier') {
      setSupplierGroups((prev) =>
        prev.map((group) =>
          group.name === groupName
            ? { ...group, expanded: !group.expanded }
            : group
        )
      );
    } else if (groupBy === 'orderMethod') {
      setOrderMethodGroups((prev) =>
        prev.map((group) =>
          group.name === groupName
            ? { ...group, expanded: !group.expanded }
            : group
        )
      );
    }
  };

  const refreshKanbanData = useCallback(async () => {
    try {
      if (!token || !isTokenValid) return;

      const {
        supplierGroups: supplierData,
        orderMethodGroups: orderMethodData,
      } = await fetchKanbanCardDetails();

      setSupplierGroups(supplierData);
      setOrderMethodGroups(orderMethodData);
    } catch (error) {
      console.error('Failed to refresh kanban data:', error);
      if (handleAuthError(error)) {
        return;
      }
    }
  }, [token, isTokenValid, fetchKanbanCardDetails, handleAuthError]);

  // Trigger function for forcing data refresh (must be after refreshKanbanData)
  const triggerDataRefresh = useCallback(async () => {
    await refreshKanbanData();
    await refreshOrderQueueData();
  }, [refreshKanbanData, refreshOrderQueueData]);

  useEffect(() => {
    if (!token || !isTokenValid || !user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerDataRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, isTokenValid, user, triggerDataRefresh]);

  // Comprehensive function to check if item has sufficient information to order
  const canOrderItem = (item: OrderItem): boolean => {
    // Must have a supplier
    if (!item.supplier || item.supplier.trim() === '') {
      return false;
    }

    // For Online orders, must have a URL
    if (item.orderMethod === 'Online') {
      if (!item.link || item.link.trim() === '') {
        return false;
      }
    }

    // For Email orders, supplier is sufficient
    // For other methods, supplier is the minimum requirement
    // Additional validations can be added here if needed

    return true;
  };

  const handleStartOrder = async (item: OrderItem) => {
    try {
      // Use JWT token from context
      if (!token || !isTokenValid) {
        return;
      }

      // Check if item has sufficient information to order
      if (!canOrderItem(item)) {
        const missingInfo = [];
        if (!item.supplier || item.supplier.trim() === '') {
          missingInfo.push('supplier');
        }
        if (
          item.orderMethod === 'Online' &&
          (!item.link || item.link.trim() === '')
        ) {
          missingInfo.push('URL');
        }
        toast.error(
          `This item cannot be ordered because it's missing: ${missingInfo.join(
            ', '
          )}. Please add the missing information first.`
        );
        return;
      }

      // If order method is Email, open the email panel
      if (item.orderMethod === 'Email') {
        setSelectedItemsForEmail([item]);
        setIsEmailPanelOpen(true);
        return;
      }

      // If order method is not Email and there's a link, open it in a new tab
      if (item.link) {
        window.open(item.link, '_blank');
      }

      // Call the API to accept the card
      const response = await fetch(
        `/api/arda/kanban/kanban-card/${item.id}/event/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          toast.success('Order started successfully');
          await triggerDataRefresh();
        } else {
          console.error('Failed to start order:', data);
          toast.error('Failed to start order');
        }
      } else {
        console.error('Failed to start order:', response.status);
        toast.error('Failed to start order');
      }
    } catch (error) {
      console.error('Error starting order:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error starting order');
    }
  };

  const handleSendEmail = async (itemIds: string[]) => {
    try {
      // Use JWT token from context
      if (!token || !isTokenValid) {
        toast.error('Authentication token not found or invalid');
        return;
      }

      // Prepare items array for email template
      const emailItems: Array<{ name: string; quantity: string }> = [];
      let supplierName = '';

      // Collect all items data
      for (const itemId of itemIds) {
        const apiData = originalApiData.find(
          (apiItem) => apiItem?.payload?.eId === itemId
        );

        if (!apiData) {
          console.warn(`Item data not found for ${itemId}`);
          continue;
        }

        const itemDetails = apiData.payload?.itemDetails;
        const primarySupply = itemDetails?.primarySupply;

        if (!itemDetails || !primarySupply) {
          console.warn(`Item details not found for ${itemId}`);
          continue;
        }

        // Set supplier name from first item
        if (!supplierName) {
          supplierName = primarySupply.supplier;
        }

        emailItems.push({
          name: itemDetails.name || 'Unknown Item',
          quantity: `${primarySupply.orderQuantity?.amount || 0}${
            primarySupply.orderQuantity?.unit
              ? ` ${primarySupply.orderQuantity.unit}`
              : ' each'
          }`,
        });
      }

      if (emailItems.length === 0) {
        toast.error('No valid items found for email');
        return;
      }

      // Prepare email data according to the template specification
      const emailData = {
        itemIds: itemIds,
        supplierContactName: supplierName,
        supplierEmail: undefined, // Not available in current data structure
        tenantCompanyName: undefined, // Not available in current data structure
        tenantCompanyAddress: undefined, // Not available in current data structure
        userContext: userContext, // Include user context for email template
        items: emailItems,
      };

      // Call the email API to generate the email content
      const emailResponse = await fetch('/api/email/send-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      });

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json();

        if (emailResult.ok) {
          // Now call the API to accept all cards
          const processingResults = await Promise.allSettled(
            itemIds.map(async (itemId) => {
              const response = await fetch(
                `/api/arda/kanban/kanban-card/${itemId}/event/accept`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!response.ok) {
                throw new Error(`Failed to accept item ${itemId}`);
              }

              return await response.json();
            })
          );

          // Check if all succeeded
          const allSucceeded = processingResults.every(
            (result) => result.status === 'fulfilled'
          );

          if (allSucceeded) {
            // Show success message with email details
            toast.success(
              `Email sent successfully! ${itemIds.length} item${
                itemIds.length > 1 ? 's' : ''
              } accepted.`
            );

            // Refresh the data to ensure state is in sync with API
            await triggerDataRefresh();
          } else {
            console.error('Failed to accept some orders:', processingResults);
            toast.error('Failed to accept some items');
          }
        } else {
          console.error('Failed to generate email:', emailResult);
          toast.error('Failed to generate email content');
        }
      } else {
        console.error('Failed to call email API:', emailResponse.status);
        toast.error('Failed to generate email content');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error sending email');
    }
  };

  const handleCopyToClipboard = async (itemIds: string[]) => {
    try {
      if (!token || !isTokenValid) {
        toast.error('Authentication token not found or invalid');
        return;
      }
      const processingResults = await Promise.allSettled(
        itemIds.map(async (itemId) => {
          const response = await fetch(
            `/api/arda/kanban/kanban-card/${itemId}/event/accept`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) throw new Error(`Failed to accept item ${itemId}`);
          return await response.json();
        })
      );
      const allSucceeded = processingResults.every(
        (r) => r.status === 'fulfilled'
      );
      if (allSucceeded) {
        await triggerDataRefresh();
        setIsEmailPanelOpen(false);
        setSelectedItemsForEmail([]);
      } else {
        toast.error('Failed to accept some items');
      }
    } catch (error) {
      console.error('Error accepting items after copy:', error);
      if (handleAuthError(error)) return;
      toast.error('Failed to update card status');
    }
  };

  const handleCompleteOrder = async (item: OrderItem) => {
    try {
      // Use JWT token from context
      if (!token || !isTokenValid) {
        return;
      }

      // Call the API to complete the order (using start-processing endpoint)
      const response = await fetch(
        `/api/arda/kanban/kanban-card/${item.id}/event/start-processing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          toast.success('Order completed successfully');
          await triggerDataRefresh();
        } else {
          toast.error('Failed to complete order');
        }
      } else {
        toast.error('Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error completing order');
    }
  };

  // Helper function to process items status change
  const processItemsStatusChange = async (
    items: OrderItem[],
    action: 'order' | 'complete',
    loadingToast?: string | number
  ) => {
    // Process each item
    const results = await Promise.allSettled(
      items.map(async (item) => {
        try {
          const token = localStorage.getItem('idToken');
          if (!token) {
            throw new Error('No JWT token found');
          }

          // Use different endpoints based on action
          const endpoint =
            action === 'complete'
              ? `/api/arda/kanban/kanban-card/${item.id}/event/start-processing`
              : `/api/arda/kanban/kanban-card/${item.id}/event/accept`;

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return { success: true, item };
        } catch (error) {
          console.error(`Error processing item ${item.id}:`, error);
          return {
            success: false,
            item,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    // Count successes and failures
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failed = results.length - successful;

    // Dismiss loading toast if provided
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }

    // Show results
    if (successful > 0) {
      const actionText = action === 'order' ? 'ordered' : 'completed';
      toast.success(`Successfully ${actionText} ${successful} items`);
    }
    if (failed > 0) {
      toast.error(`Failed to process ${failed} items`);
    }

    // Refresh data from API to ensure consistency
    if (successful > 0) {
      await refreshKanbanData();
      await refreshOrderQueueData();
    }

    return { successful, failed };
  };

  const handleOrderAll = async (
    groupName: string,
    action: 'order' | 'complete'
  ) => {
    try {
      // Get the group items that are ready to order
      let itemsToProcess: OrderItem[] = [];

      if (groupBy === 'supplier') {
        const group = supplierGroups.find((g) => g.name === groupName);
        if (group) {
          itemsToProcess = group.items.filter((item) => {
            if (action === 'order') {
              // For "Order All": process Requesting items
              return item.status === 'Requesting';
            } else {
              // For "Complete All Order": process Requested items
              return item.status === 'Requested';
            }
          });
        }
      } else if (groupBy === 'orderMethod') {
        const group = orderMethodGroups.find((g) => g.name === groupName);
        if (group) {
          itemsToProcess = group.items.filter((item) => {
            if (action === 'order') {
              // For "Order All": process Requesting items
              return item.status === 'Requesting';
            } else {
              // For "Complete All Order": process Requested items
              return item.status === 'Requested';
            }
          });
        }
      }

      if (itemsToProcess.length === 0) {
        const message =
          action === 'order'
            ? 'No Requesting items to order in this group'
            : 'No Requested items to complete in this group';
        toast.info(message);
        return;
      }

      // Check for items without sufficient information (only for 'order' action)
      if (action === 'order') {
        const itemsWithoutInfo = itemsToProcess.filter(
          (item) => !canOrderItem(item)
        );
        const itemsWithInfo = itemsToProcess.filter((item) =>
          canOrderItem(item)
        );

        // If there are items without sufficient information, show modal
        if (itemsWithoutInfo.length > 0) {
          setMissingUrlCount(itemsWithoutInfo.length);
          setItemsWithUrls(itemsWithInfo);
          setTotalItemsCount(itemsToProcess.length); // Store total items count
          setIsMissingUrlModalOpen(true);
          return;
        }
      }

      // Process items - only process items with sufficient information
      const itemsToActuallyProcess =
        action === 'order'
          ? itemsToProcess.filter((item) => canOrderItem(item))
          : itemsToProcess;

      if (itemsToActuallyProcess.length === 0) {
        toast.info(
          'No items to process (all items are missing required information)'
        );
        return;
      }

      // Separate Email orders from other orders (only for 'order' action)
      if (action === 'order') {
        const emailOrders = itemsToActuallyProcess.filter(
          (item) => item.orderMethod === 'Email'
        );
        const nonEmailOrders = itemsToActuallyProcess.filter(
          (item) => item.orderMethod !== 'Email'
        );

        // Process both types simultaneously:
        // 1. Open email panel for Email orders FIRST
        // 2. Open links and process non-Email orders

        // Open email panel for Email orders FIRST (before processing non-Email)
        // This ensures the panel opens even if there are issues with non-Email processing
        // Store a copy of email orders to preserve them after data refresh
        const emailOrdersToProcess = [...emailOrders];
        if (emailOrdersToProcess.length > 0) {
          // Close any open modals first
          setIsMissingUrlModalOpen(false);

          // Set email panel state immediately
          setSelectedItemsForEmail(emailOrdersToProcess);
          setIsEmailPanelOpen(true);
          // Email orders will be processed when the email is sent (via handleSendEmail)
        }

        // Process non-Email orders immediately (open links and change status)
        if (nonEmailOrders.length > 0) {
          // Show loading toast for non-Email orders
          const loadingToast = toast.loading(
            `Processing ${nonEmailOrders.length} item${
              nonEmailOrders.length > 1 ? 's' : ''
            }...`
          );

          // Open all links for non-Email orders with proper delays
          nonEmailOrders.forEach((item, index) => {
            if (item.link) {
              setTimeout(() => {
                const newWindow = window.open(item.link, '_blank');
                // If popup was blocked, show a message
                if (
                  !newWindow ||
                  newWindow.closed ||
                  typeof newWindow.closed === 'undefined'
                ) {
                  console.warn(`Popup blocked for item: ${item.name}`);
                }
              }, index * 150); // 150ms delay between each link to ensure they all open
            }
          });

          // Process non-Email orders (change status)
          // This will refresh data, but we've already set the email panel state
          await processItemsStatusChange(nonEmailOrders, action, loadingToast);

          // After refresh, ensure email panel is still open with the preserved items
          if (emailOrdersToProcess.length > 0) {
            // Use setTimeout to ensure this happens after the state updates from refresh
            setTimeout(() => {
              setSelectedItemsForEmail(emailOrdersToProcess);
              setIsEmailPanelOpen(true);
            }, 500); // Longer delay to ensure refresh completes
          }
        }

        // Return here - Email orders will be processed when email is sent
        return;
      }

      // For 'complete' action, process all items normally
      // At this point, action can only be 'complete' because 'order' returns earlier
      if (action === 'complete') {
        // Show loading toast
        const loadingToast = toast.loading(
          `Processing ${itemsToActuallyProcess.length} items...`
        );

        // Process each item
        const results = await Promise.allSettled(
          itemsToActuallyProcess.map(async (item) => {
            try {
              const token = localStorage.getItem('idToken');
              if (!token) {
                throw new Error('No JWT token found');
              }

              // Use start-processing endpoint for complete action
              const endpoint = `/api/arda/kanban/kanban-card/${item.id}/event/start-processing`;

              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              return { success: true, item };
            } catch (error) {
              console.error(`Error processing item ${item.id}:`, error);
              return {
                success: false,
                item,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          })
        );

        // Count successes and failures
        const successful = results.filter(
          (r) => r.status === 'fulfilled' && r.value.success
        ).length;
        const failed = results.length - successful;

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show results
        if (successful > 0) {
          toast.success(`Successfully completed ${successful} items`);
        }
        if (failed > 0) {
          toast.error(`Failed to process ${failed} items`);
        }

        // Refresh data from API to ensure consistency
        if (successful > 0) {
          await refreshKanbanData();
          await refreshOrderQueueData();
        }
      }
    } catch (error) {
      console.error('Error in handleOrderAll:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Failed to process order all');
    }
  };

  const getFilteredGroups = useMemo(() => {
    perfLogger.start('getFilteredGroups');
    let groups: SupplierGroup[] | OrderMethodGroup[] = [];

    if (groupBy === 'supplier') {
      groups = supplierGroups;
    } else if (groupBy === 'orderMethod') {
      groups = orderMethodGroups;
    } else {
      // No grouping - return empty array for groups
      return [];
    }

    // Filter groups by tab
    const tabFilteredGroups = groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (activeTab === 'ready') {
            // Ready to order tab: show items with status "Requesting" and "Requested"
            return item.status === 'Requesting' || item.status === 'Requested';
          } else if (activeTab === 'recent') {
            // Recently ordered tab: show only items with status "In progress"
            return item.status === 'In progress';
          }
          return true;
        }),
      }))
      .filter((group) => group.items.length > 0); // Remove empty groups

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return tabFilteredGroups.filter((group) => {
        return (
          group.name.toLowerCase().includes(lowerSearchTerm) ||
          group.items.some((item) =>
            item.name.toLowerCase().includes(lowerSearchTerm)
          )
        );
      });
    }

    const result = tabFilteredGroups;
    perfLogger.end('getFilteredGroups', {
      groupBy,
      activeTab,
      hasSearchTerm: !!searchTerm,
      resultCount: result.length,
    });
    return result;
  }, [groupBy, supplierGroups, orderMethodGroups, activeTab, searchTerm]);

  const getFilteredItems = useMemo(() => {
    if (groupBy === 'none') {
      const allItems: OrderItem[] = [];
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

      // Filter by tab
      const tabFilteredItems = allItems.filter((item) => {
        if (activeTab === 'ready') {
          // Ready to order tab: show items with status "Requesting" and "Requested"
          return item.status === 'Requesting' || item.status === 'Requested';
        } else if (activeTab === 'recent') {
          // Recently ordered tab: show only items with status "In progress"
          return item.status === 'In progress';
        }
        return true;
      });

      // Apply search filter if exists
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return tabFilteredItems.filter(
          (item) =>
            item.name.toLowerCase().includes(lowerSearchTerm) ||
            item.supplier.toLowerCase().includes(lowerSearchTerm) ||
            item.orderMethod.toLowerCase().includes(lowerSearchTerm)
        );
      }

      return tabFilteredItems;
    }
    return [];
  }, [groupBy, supplierGroups, orderMethodGroups, activeTab, searchTerm]);

  // Function to map API data to ItemDetailsPanel format
  const mapApiDataToItemDetails = (
    apiData: KanbanCardResponse['results'][0]
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
  const handleViewCardDetails = (item: OrderItem) => {
    // Find the corresponding API data for this item
    const apiData = originalApiData.find(
      (apiItem) => apiItem?.payload?.eId === item.id
    );

    if (apiData) {
      const mappedItem = mapApiDataToItemDetails(apiData);

      setSelectedItemForDetails(mappedItem);
      setIsItemDetailsPanelOpen(true);
    }
  };

  // Handler for editing an item
  const handleEditItem = (item: OrderItem) => {
    // Find the corresponding API data for this item
    const apiData = originalApiData.find(
      (apiItem) => apiItem?.payload?.eId === item.id
    );

    if (apiData) {
      const mappedItem = mapApiDataToItemDetails(apiData);

      setSelectedItemForDetails(mappedItem);
      setIsItemFormPanelOpen(true);
    } else {
      toast.error('Item data not found for editing');
    }
  };

  // Handler for changing card state
  const handleCardStateChange = async (item: OrderItem, newState: string) => {
    try {
      const jwtToken = localStorage.getItem('idToken');
      let endpoint = '';
      let successMessage = '';

      // Determine the correct endpoint and message based on the new state
      switch (newState) {
        case 'REQUESTING':
          endpoint = `/api/arda/kanban/kanban-card/${item.id}/event/request`;
          successMessage = 'Card status changed to In Order Queue';
          break;
        case 'REQUESTED':
          endpoint = `/api/arda/kanban/kanban-card/${item.id}/event/accept`;
          successMessage = 'Card status changed to In Progress';
          break;
        case 'IN_PROCESS':
          endpoint = `/api/arda/kanban/kanban-card/${item.id}/event/start-processing`;
          successMessage = 'Card status changed to Receiving';
          break;
        case 'FULFILLED':
          endpoint = `/api/arda/kanban/kanban-card/${item.id}/event/fulfill`;
          successMessage = 'Card status changed to Restocked';
          break;
        default:
          console.error('Unknown state change:', newState);
          toast.error('Unknown state change');
          return;
      }

      // For REQUESTED state (In Progress), also handle email panel and links
      if (newState === 'REQUESTED') {
        // If order method is Email, open the email panel
        if (item.orderMethod === 'Email') {
          setSelectedItemsForEmail([item]);
          setIsEmailPanelOpen(true);
          return; // Don't proceed with API call, email panel will handle it
        }

        // If order method is not Email and there's a link, open it in a new tab
        if (item.link) {
          window.open(item.link, '_blank');
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          toast.success(successMessage);
          await triggerDataRefresh();
        } else {
          console.error('Failed to change card state:', data);
          toast.error('Failed to change card state');
        }
      } else {
        console.error('Failed to change card state:', response.status);
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

  const filteredGroups = getFilteredGroups;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className='w-full pt-20 px-4 pb-4 md:pt-24 md:pb-8 flex flex-col gap-6'>
          {/* Header */}
          <div className='flex flex-col gap-3'>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>
                Order Queue
              </h1>
              <p className='text-muted-foreground'>
                The shelves won&apos;t stock themselves. Let&apos;s fix that.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex border-b border-border'>
            <button
              onClick={() => setActiveTab('ready')}
              className={`px-6 py-3 font-medium relative transition-colors ${
                activeTab === 'ready'
                  ? 'text-foreground border-b-2 border-orange-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-2'>
                Ready to Order
                {readyToOrderCount > 0 && (
                  <Badge className='bg-orange-500 text-white rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs'>
                    {readyToOrderCount}
                  </Badge>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'text-foreground border-b-2 border-orange-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-2'>Recently Ordered</div>
            </button>
          </div>

          {/* Controls */}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='flex items-center gap-2 bg-background text-foreground border-border hover:bg-[var(--destructive-foreground-light-hover)] data-[state=open]:bg-[var(--destructive-foreground-light-hover)] data-[state=open]:border-[var(--destructive-foreground-light-hover)]'
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <rect
                      x='2'
                      y='2'
                      width='5'
                      height='5'
                      rx='1'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      fill='none'
                    />
                    <rect
                      x='9'
                      y='9'
                      width='5'
                      height='5'
                      rx='1'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      fill='none'
                    />
                  </svg>
                  Group by
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-[200px]'>
                <DropdownMenuItem
                  onClick={() => setGroupBy('none')}
                  className={
                    groupBy === 'none'
                      ? 'bg-accent text-foreground'
                      : 'text-foreground'
                  }
                >
                  <div className='w-6 flex justify-center'>
                    {groupBy === 'none' && (
                      <div className='w-2 h-2 bg-foreground rounded-full' />
                    )}
                  </div>
                  <span>(No grouping)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setGroupBy('supplier')}
                  className={
                    groupBy === 'supplier'
                      ? 'bg-accent text-foreground'
                      : 'text-foreground'
                  }
                >
                  <div className='w-6 flex justify-center'>
                    {groupBy === 'supplier' && (
                      <div className='w-2 h-2 bg-foreground rounded-full' />
                    )}
                  </div>
                  <span>Supplier</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setGroupBy('orderMethod')}
                  className={
                    groupBy === 'orderMethod'
                      ? 'bg-accent text-foreground'
                      : 'text-foreground'
                  }
                >
                  <div className='w-6 flex justify-center'>
                    {groupBy === 'orderMethod' && (
                      <div className='w-2 h-2 bg-foreground rounded-full' />
                    )}
                  </div>
                  <span>Order method</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Order List */}
          <div className='space-y-4'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4'></div>
                  <p className='text-muted-foreground'>
                    Loading kanban data...
                  </p>
                </div>
              </div>
            ) : (groupBy === 'none' && getFilteredItems.length === 0) ||
              (groupBy !== 'none' && filteredGroups.length === 0) ? (
              <div className='space-y-4'>
                <EmptyOrdersState
                  title='No orders today'
                  subtitle='There are no recent orders for today'
                />
                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className='p-4 bg-gray-100 rounded-lg text-sm'>
                    <p>Debug Info:</p>
                    <p>• Active tab: {activeTab}</p>
                    <p>• Group by: {groupBy}</p>
                    <p>• Supplier groups: {supplierGroups.length}</p>
                    <p>• Order method groups: {orderMethodGroups.length}</p>
                    <p>• Filtered groups: {filteredGroups.length}</p>
                    <p>• Filtered items: {getFilteredItems.length}</p>
                  </div>
                )}
              </div>
            ) : groupBy === 'none' ? (
              // No grouping - show all items in a flat list
              <div className='space-y-2'>
                {getFilteredItems.map((item) => {
                  const getSafeImageSrc = () => {
                    if (!item.image) {
                      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMO8Hx4yf371x17IlJUS6moXsaptQp9vEWbw&s';
                    }
                    if (
                      item.image.startsWith('http://') ||
                      item.image.startsWith('https://')
                    ) {
                      return item.image;
                    }
                    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMO8Hx4yf371x17IlJUS6moXsaptQp9vEWbw&s';
                  };

                  return (
                    <div
                      key={item.id}
                      className={`border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted/30 transition-colors bg-card shadow-sm ${
                        !canOrderItem(item) ? 'opacity-60' : ''
                      }`}
                    >
                      <div className='flex items-center gap-4 flex-1'>
                        {/* Item Image */}
                        <div className='relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden'>
                          {(() => {
                            const imageSrc = getSafeImageSrc();
                            const isUploadedFile = imageSrc.startsWith('data:');

                            if (isUploadedFile) {
                              return (
                                <Image
                                  src={imageSrc}
                                  alt={item.name}
                                  width={64}
                                  height={64}
                                  className='w-full h-full object-contain'
                                />
                              );
                            }

                            return (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageSrc}
                                alt={item.name}
                                className='w-full h-full object-contain'
                              />
                            );
                          })()}
                        </div>

                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-1'>
                            <div className='flex items-center gap-2'>
                              <span className='font-semibold text-[var(--colors-link-light)]'>
                                {item.name}
                              </span>
                              {!canOrderItem(item) && (
                                <div
                                  className='w-2 h-2 bg-red-500 rounded-full'
                                  title={
                                    item.orderMethod === 'Online' &&
                                    (!item.link || item.link.trim() === '')
                                      ? 'This item is missing a URL and cannot be ordered'
                                      : !item.supplier ||
                                        item.supplier.trim() === ''
                                      ? 'This item is missing supplier information and cannot be ordered'
                                      : 'This item is missing required information and cannot be ordered'
                                  }
                                />
                              )}
                            </div>
                            <span className='text-sm text-[var(--base-muted-foreground)]'>
                              {item.quantity}
                            </span>
                            {item.status === 'In progress' && (
                              <Badge
                                variant='secondary'
                                className='bg-background text-foreground border-border'
                              >
                                <span className='text-xs font-medium'>
                                  {getStatusDisplayInfo(item.status).label}
                                </span>
                              </Badge>
                            )}
                            {item.status === 'Requested' && (
                              <Badge
                                variant='secondary'
                                className='bg-background text-foreground border-border'
                              >
                                <span className='text-xs font-medium'>
                                  {getStatusDisplayInfo(item.status).label}
                                </span>
                              </Badge>
                            )}
                            {item.status === 'Ordered' && (
                              <Badge
                                variant='secondary'
                                className='bg-background text-foreground border-border flex items-center gap-1'
                              >
                                <svg
                                  width='12'
                                  height='12'
                                  viewBox='0 0 16 16'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M5 8.5L7.5 11L11 6'
                                    stroke='currentColor'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                </svg>
                                Ordered
                              </Badge>
                            )}
                          </div>
                          <p className='text-sm text-[var(--base-muted-foreground)]'>
                            {item.status === 'Ordered' ? (
                              <>Ordered: {item.orderedAt}</>
                            ) : (
                              <>
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
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {item.status === 'Requesting' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleStartOrder(item)}
                            disabled={!canOrderItem(item)}
                            className='bg-background text-foreground border-border disabled:opacity-50 disabled:cursor-not-allowed'
                            title={
                              !canOrderItem(item)
                                ? item.orderMethod === 'Online' &&
                                  (!item.link || item.link.trim() === '')
                                  ? 'Missing URL - cannot order'
                                  : !item.supplier ||
                                    item.supplier.trim() === ''
                                  ? 'Missing supplier - cannot order'
                                  : 'Missing required information - cannot order'
                                : 'Start order'
                            }
                          >
                            Start order
                          </Button>
                        )}
                        {item.status === 'Requested' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleCompleteOrder(item)}
                            className='bg-background text-foreground border-border flex items-center gap-2'
                          >
                            <SquareCheckBig className='h-4 w-4' />
                            Complete order
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='outline' size='sm' className='p-2'>
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem>
                              View card details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditItem(item)}
                            >
                              Edit item
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <CardStateDropdown
                              card={orderItemToKanbanCard(item)}
                              onAddToOrderQueue={() =>
                                handleCardStateChange(item, 'REQUESTING')
                              }
                              onStateChange={(newState) =>
                                handleCardStateChange(item, newState)
                              }
                              orderMethod={item.orderMethod}
                              link={item.link}
                              onOpenEmailPanel={() => {
                                setSelectedItemsForEmail([item]);
                                setIsEmailPanelOpen(true);
                              }}
                              onTriggerRefresh={triggerDataRefresh}
                              showToast={(message) => toast.success(message)}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Grouped view - show items grouped by supplier
              filteredGroups.map((group) => (
                <div key={group.name} className='relative bg-transparent'>
                  {/* Background stripe - starts from button level, extends to cover last item */}
                  <div
                    className={`absolute left-0 top-[2.5rem] bottom-0 w-10 ${getOrderMethodBackgroundColor(
                      group.orderMethod
                    )} rounded-bl-[14px] z-0`}
                  />

                  {/* Supplier Header */}
                  <div className='relative z-20'>
                    {/* HEADER */}
                    <div
                      className={`h-14 flex items-center ${
                        !group.expanded
                          ? `${(() => {
                              switch (group.orderMethod) {
                                case 'Online':
                                  return 'border-b-[#FEE2E2]';
                                case 'Purchase order':
                                  return 'border-b-[#FFEBE5]';
                                case 'Phone':
                                  return 'border-b-[#E0F2FE]';
                                case 'Email':
                                  return 'border-b-[#DCFCE7]';
                                case 'In store':
                                  return 'border-b-[#E0E7FF]';
                                case 'Production':
                                  return 'border-b-[#FEF3C7]';
                                case '3rd party':
                                  return 'border-b-[#CCFBF1]';
                                case 'Request for quotation (RFQ)':
                                  return 'border-b-[#ECFCCB]';
                                default:
                                  return 'border-b-orange-200';
                              }
                            })()} border-b-[10px]`
                          : ''
                      }`}
                    >
                      {/* Flush button */}
                      <button
                        onClick={() => toggleSupplierExpansion(group.name)}
                        aria-label='Expand/Collapse'
                        className='m-0 p-0 h-9 w-10 rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] grid place-items-center relative z-10'
                      >
                        <ChevronsUpDown className='w-4 h-4 text-gray-700' />
                      </button>

                      {/* Label */}
                      <div className='flex items-center text-sm px-3'>
                        <div className='mr-2 flex items-center'>
                          {(() => {
                            const method = group.orderMethod;
                            switch (method) {
                              case 'Online':
                                return (
                                  <OnlineOrderIcon width={40} height={40} />
                                );
                              case 'Purchase order':
                                return (
                                  <PurchaseOrderIcon width={40} height={40} />
                                );
                              case 'Phone':
                                return (
                                  <PhoneOrderIcon width={40} height={40} />
                                );
                              case 'Email':
                                return (
                                  <EmailOrderIcon width={40} height={40} />
                                );
                              case 'In store':
                                return <InStoreIcon width={40} height={40} />;
                              case 'Request for quotation (RFQ)':
                                return <RFQIcon width={40} height={40} />;
                              case 'Production':
                                return (
                                  <ProductionIcon width={40} height={40} />
                                );
                              case '3rd party':
                                return (
                                  <ThirdPartyIcon width={40} height={40} />
                                );
                              default:
                                return (
                                  <OnlineOrderIcon width={40} height={40} />
                                );
                            }
                          })()}
                        </div>
                        <span className='text-gray-600'>
                          {groupBy === 'orderMethod'
                            ? 'Order method'
                            : 'Supplier'}
                        </span>
                        <span className='mx-1 text-gray-600'>:</span>
                        <span className='font-semibold text-gray-900'>
                          {group.name}
                        </span>
                      </div>

                      {/* Dynamic button based on group status */}
                      <div className='pr-3'>
                        {(() => {
                          const requestingCount = group.items.filter(
                            (item) => item.status === 'Requesting'
                          ).length;
                          const requestedCount = group.items.filter(
                            (item) => item.status === 'Requested'
                          ).length;
                          const readyToOrderCount =
                            requestingCount + requestedCount;

                          if (readyToOrderCount > 0) {
                            // Show "Complete All Order" if all items are Requested, otherwise "Order All"
                            const allRequested =
                              requestingCount === 0 && requestedCount > 0;
                            return (
                              <button
                                onClick={async () =>
                                  await handleOrderAll(
                                    group.name,
                                    allRequested ? 'complete' : 'order'
                                  )
                                }
                                className='h-9 px-3 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm inline-flex items-center gap-2'
                              >
                                {allRequested ? (
                                  <>
                                    <SquareCheckBig className='h-4 w-4' />
                                    Complete All Order
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className='h-4 w-4' />
                                    Order All
                                  </>
                                )}
                              </button>
                            );
                          } else {
                            // No action needed when all items are ordered
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  {group.expanded && group.items.length > 0 && (
                    <div className='relative z-20 space-y-2 pl-4 pb-0'>
                      {group.items.map((item, index) => {
                        const getSafeImageSrc = () => {
                          if (!item.image) {
                            return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMO8Hx4yf371x17IlJUS6moXsaptQp9vEWbw&s';
                          }
                          if (
                            item.image.startsWith('http://') ||
                            item.image.startsWith('https://')
                          ) {
                            return item.image;
                          }
                          return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMO8Hx4yf371x17IlJUS6moXsaptQp9vEWbw&s';
                        };

                        const isLastItem = index === group.items.length - 1;
                        const getBorderBottomColor = (method: string) => {
                          switch (method) {
                            case 'Online':
                              return 'border-b-[#FEE2E2]';
                            case 'Purchase order':
                              return 'border-b-[#FFEBE5]';
                            case 'Phone':
                              return 'border-b-[#E0F2FE]';
                            case 'Email':
                              return 'border-b-[#DCFCE7]';
                            case 'In store':
                              return 'border-b-[#E0E7FF]';
                            case 'Production':
                              return 'border-b-[#FEF3C7]';
                            case '3rd party':
                              return 'border-b-[#CCFBF1]';
                            case 'Request for quotation (RFQ)':
                              return 'border-b-[#ECFCCB]';
                            default:
                              return 'border-b-orange-200';
                          }
                        };
                        const borderBottomClass = isLastItem
                          ? `${getBorderBottomColor(
                              group.orderMethod
                            )} border-b-[10px]`
                          : '';

                        return (
                          <div
                            key={`${group.name}-${item.id}-${index}`}
                            className={`px-4 md:px-4 py-2 border border-gray-200 ${borderBottomClass} ${
                              isLastItem ? 'rounded-bl-none mb-0' : 'rounded-lg'
                            } rounded-t-lg bg-white transition-colors flex items-center justify-between ${
                              !canOrderItem(item) ? 'opacity-60' : ''
                            }`}
                          >
                            <div className='pl-0 flex items-center gap-4'>
                              {/* Item Image */}
                              <div className='relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden'>
                                {(() => {
                                  const imageSrc = getSafeImageSrc();
                                  const isUploadedFile =
                                    imageSrc.startsWith('data:');

                                  if (isUploadedFile) {
                                    return (
                                      <Image
                                        src={imageSrc}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className='w-full h-full object-contain'
                                      />
                                    );
                                  }

                                  return (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={imageSrc}
                                      alt={item.name}
                                      className='w-full h-full object-contain'
                                    />
                                  );
                                })()}
                              </div>

                              <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-1'>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-blue-600 text-sm'>
                                      {item.name}
                                    </span>
                                    {!canOrderItem(item) && (
                                      <div
                                        className='w-2 h-2 bg-red-500 rounded-full'
                                        title={
                                          item.orderMethod === 'Online' &&
                                          (!item.link ||
                                            item.link.trim() === '')
                                            ? 'This item is missing a URL and cannot be ordered'
                                            : !item.supplier ||
                                              item.supplier.trim() === ''
                                            ? 'This item is missing supplier information and cannot be ordered'
                                            : 'This item is missing required information and cannot be ordered'
                                        }
                                      />
                                    )}
                                  </div>
                                  <span className='text-sm text-gray-700'>
                                    {item.quantity}
                                  </span>
                                  {item.status === 'In progress' && (
                                    <Badge
                                      variant='secondary'
                                      className='bg-background text-foreground border-border flex items-center gap-1'
                                    >
                                      <svg
                                        width='12'
                                        height='12'
                                        viewBox='0 0 16 16'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                      >
                                        <path
                                          d='M5 8.5L7.5 11L11 6'
                                          stroke='currentColor'
                                          strokeWidth='1.5'
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                        />
                                      </svg>
                                      Ordered
                                    </Badge>
                                  )}
                                  {item.status === 'Requested' && (
                                    <Badge
                                      variant='secondary'
                                      className='bg-[var(--base-primary)] text-white'
                                    >
                                      Order in Progress
                                    </Badge>
                                  )}
                                  {item.status === 'Ordered' && (
                                    <Badge
                                      variant='secondary'
                                      className='bg-background text-foreground border-border flex items-center gap-1'
                                    >
                                      <svg
                                        width='12'
                                        height='12'
                                        viewBox='0 0 16 16'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                      >
                                        <path
                                          d='M5 8.5L7.5 11L11 6'
                                          stroke='currentColor'
                                          strokeWidth='1.5'
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                        />
                                      </svg>
                                      Ordered
                                    </Badge>
                                  )}
                                </div>
                                <p className='text-sm text-gray-700'>
                                  {item.status === 'Ordered' ? (
                                    <>Ordered: {item.orderedAt}</>
                                  ) : (
                                    <>
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
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              {item.status === 'Requesting' && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleStartOrder(item)}
                                  disabled={!canOrderItem(item)}
                                  className='bg-background text-foreground border-border disabled:opacity-50 disabled:cursor-not-allowed'
                                  title={
                                    !canOrderItem(item)
                                      ? item.orderMethod === 'Online' &&
                                        (!item.link || item.link.trim() === '')
                                        ? 'Missing URL - cannot order'
                                        : !item.supplier ||
                                          item.supplier.trim() === ''
                                        ? 'Missing supplier - cannot order'
                                        : 'Missing required information - cannot order'
                                      : 'Start order'
                                  }
                                >
                                  Start order
                                </Button>
                              )}
                              {item.status === 'Requested' && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleCompleteOrder(item)}
                                  className='bg-background text-foreground border-border flex items-center gap-2'
                                >
                                  <SquareCheckBig className='h-4 w-4' />
                                  Complete order
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='p-2'
                                  >
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
                                  <DropdownMenuItem
                                    onClick={() => handleEditItem(item)}
                                  >
                                    Edit item
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <CardStateDropdown
                                    card={orderItemToKanbanCard(item)}
                                    onAddToOrderQueue={() =>
                                      handleCardStateChange(item, 'REQUESTING')
                                    }
                                    onStateChange={(newState) =>
                                      handleCardStateChange(item, newState)
                                    }
                                    orderMethod={item.orderMethod}
                                    link={item.link}
                                    onOpenEmailPanel={() => {
                                      setSelectedItemsForEmail([item]);
                                      setIsEmailPanelOpen(true);
                                    }}
                                    onTriggerRefresh={triggerDataRefresh}
                                    showToast={(message) =>
                                      toast.success(message)
                                    }
                                  />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Cards Preview Modal */}
      {/* Removed */}

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

      {/* Email Panel */}
      {selectedItemsForEmail.length > 0 && (
        <EmailPanel
          isOpen={isEmailPanelOpen}
          onClose={() => {
            setIsEmailPanelOpen(false);
            setSelectedItemsForEmail([]);
          }}
          items={selectedItemsForEmail}
          onSendEmail={handleSendEmail}
          onCopyToClipboard={handleCopyToClipboard}
          userContext={userContext || undefined}
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
                  orderMechanism:
                    selectedItemForDetails.orderMechanism || 'ONLINE',
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
                        | { length: number; unit: TimeUnit | string }
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
          setSelectedItemForDetails(null);
          // Small delay to ensure backend has processed the update
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // Refresh the data after successful edit
          await refreshKanbanData();
          await refreshOrderQueueData();
        }}
      />

      {/* Missing Information Modal */}
      {isMissingUrlModalOpen && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMissingUrlModalOpen(false);
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
                setIsMissingUrlModalOpen(false);
              }}
              className='absolute top-4 right-4 w-4 h-4 flex items-center justify-center'
            >
              <X className='w-4 h-4 text-[#0a0a0a] opacity-70' />
            </button>

            {/* Header */}
            <div className='w-full flex flex-col items-start gap-1.5'>
              <b className='w-full text-base leading-6 text-[#0a0a0a] font-semibold'>
                Can&apos;t order some items
              </b>
              <div className='w-full text-sm leading-5 text-[#737373] font-normal'>
                <b>{missingUrlCount}</b>
                <span>
                  {' '}
                  out of <b>{totalItemsCount}</b> selected items are missing
                  required information (such as supplier or URL). Only items
                  with complete information will be processed. Do you want to
                  proceed?
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className='w-full flex items-center justify-end gap-2'>
              <button
                onClick={() => {
                  setIsMissingUrlModalOpen(false);
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
                  if (!token || !isTokenValid) {
                    setIsMissingUrlModalOpen(false);
                    return;
                  }

                  // Process only items with URLs
                  if (itemsWithUrls.length > 0) {
                    // Separate Email orders from other orders
                    const emailOrders = itemsWithUrls.filter(
                      (item) => item.orderMethod === 'Email'
                    );
                    const nonEmailOrders = itemsWithUrls.filter(
                      (item) => item.orderMethod !== 'Email'
                    );

                    // Close modal first
                    setIsMissingUrlModalOpen(false);

                    // Open email panel for Email orders FIRST
                    if (emailOrders.length > 0) {
                      setSelectedItemsForEmail(emailOrders);
                      setIsEmailPanelOpen(true);
                    }

                    // Process non-Email orders (open links and change status)
                    if (nonEmailOrders.length > 0) {
                      // Show loading toast for non-Email orders
                      const loadingToast = toast.loading(
                        `Processing ${nonEmailOrders.length} item${
                          nonEmailOrders.length > 1 ? 's' : ''
                        }...`
                      );

                      // Open links for non-Email orders with proper delays
                      nonEmailOrders.forEach((item, index) => {
                        if (item.link) {
                          setTimeout(() => {
                            window.open(item.link, '_blank');
                          }, index * 150);
                        }
                      });

                      // Process each non-Email item
                      const results = await Promise.allSettled(
                        nonEmailOrders.map(async (item) => {
                          try {
                            const response = await fetch(
                              `/api/arda/kanban/kanban-card/${item.id}/event/accept`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );

                            if (!response.ok) {
                              throw new Error(
                                `HTTP error! status: ${response.status}`
                              );
                            }

                            return { success: true, item };
                          } catch (error) {
                            console.error(
                              `Error processing item ${item.id}:`,
                              error
                            );
                            return {
                              success: false,
                              item,
                              error:
                                error instanceof Error
                                  ? error.message
                                  : 'Unknown error',
                            };
                          }
                        })
                      );

                      // Count successes and failures
                      const successful = results.filter(
                        (r) => r.status === 'fulfilled' && r.value.success
                      ).length;
                      const failed = results.length - successful;

                      // Dismiss loading toast
                      toast.dismiss(loadingToast);

                      // Show results
                      if (successful > 0) {
                        toast.success(
                          `Successfully ordered ${successful} items`
                        );
                      }
                      if (failed > 0) {
                        toast.error(`Failed to process ${failed} items`);
                      }

                      // Refresh data
                      if (successful > 0) {
                        await triggerDataRefresh();

                        // After refresh, ensure email panel is still open with the preserved items
                        if (emailOrders.length > 0) {
                          setTimeout(() => {
                            setSelectedItemsForEmail(emailOrders);
                            setIsEmailPanelOpen(true);
                          }, 500);
                        }
                      }
                    }
                  }
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
    </SidebarProvider>
  );
}
