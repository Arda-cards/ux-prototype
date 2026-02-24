'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@frontend/components/ui/dropdown-menu';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';
import {
  SearchIcon,
  ChevronDown,
  Plus,
  CircleCheckIcon,
  SlidersHorizontal,
  Loader2,
  Dock,
} from 'lucide-react';
import { Skeleton } from '@frontend/components/ui/skeleton';
import Image from 'next/image';
import { ItemTableAGGrid, type ItemTableAGGridRef } from './ItemTableAGGrid';
import { UnsavedChangesModal } from '@frontend/components/common/UnsavedChangesModal';
// Note: Legacy demo data - will be removed

import { ItemFormPanel } from '@frontend/components/items/ItemFormPanel';
import { ItemDetailsPanel } from '@frontend/components/items/ItemDetailsPanel';
import { CardsPreviewModal } from '@frontend/components/items/CardsPreviewModal';
import type { ItemCard } from '@frontend/constants/types';
import { ImportItemsModal } from '@frontend/components/items/ImportItemsModal';
import { queryItems, getItemById } from '@frontend/lib/ardaClient';
import * as items from '@frontend/types/items';
import * as ardaApi from '@frontend/types/arda-api';
import type { KanbanCardResult } from '@frontend/types/kanban';
import { toast, Toaster } from 'sonner';
import { DeleteConfirmationModal } from '@frontend/components/common/DeleteConfirmationModal';
import { isAuthenticationError } from '@frontend/lib/utils';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import { registerBlocker } from '@frontend/lib/unsavedNavigation';
import { getAdjacentItem } from '@frontend/lib/itemListNavigation';

const allTabs = [
  { label: 'Published Items', key: 'published' },
  { label: 'Draft Items', key: 'draft' },
  { label: 'Recently Uploaded', key: 'uploaded' },
];

// Filter tabs based on environment - hide Draft Items and Recently Uploaded in production
const isProduction = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'PRODUCTION';

const tabs = isProduction
  ? allTabs.filter((tab) => tab.key === 'published')
  : allTabs;

const isDevOrStage = process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION';
const devLog = (...args: unknown[]) => {
  if (isDevOrStage) console.log(...args);
};
const devWarn = (...args: unknown[]) => {
  if (isDevOrStage) console.warn(...args);
};

export default function ItemsPage() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { handleAuthError } = useAuthErrorHandler();

  // Check if we're on a bookmarkable item URL (/item/[itemId])
  // Extract itemId from pathname or params
  // params.itemId is available when ItemsPage is rendered from /item/[itemId] route
  // pathname check is a fallback
  const itemIdFromParams = params?.itemId as string | undefined;
  const itemIdFromPathname = pathname?.match(/^\/item\/([^/]+)$/)?.[1];
  const itemIdFromPath = itemIdFromParams || itemIdFromPathname;

  const [activeTab, setActiveTab] = useState('published');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [managePanelOpen, setManagePanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<items.Item | null>(null);
  const [itemToEdit, setItemToEdit] = useState<items.Item | null>(null); // New state for editing
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [ardaItems, setArdaItems] = useState<items.Item[]>([]);
  const [loadingArdaItems, setLoadingArdaItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<items.Item[]>([]);
  const selectedItemsMapRef = useRef<Map<string, items.Item>>(new Map());
  const maxItemsSeenRef = useRef<number>(0);
  const [maxItemsSeen, setMaxItemsSeen] = useState<number>(0);
  const [itemCardsMap, setItemCardsMap] = useState<
    Record<string, KanbanCardResult[]>
  >({});
  const cardFetchPromisesRef = useRef<
    Partial<Record<string, Promise<KanbanCardResult[] | null>>>
  >({});
  const [isPrintingCards, setIsPrintingCards] = useState(false);
  const [isPrintingLabels, setIsPrintingLabels] = useState(false);
  const [isPrintingBreadcrumbs, setIsPrintingBreadcrumbs] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewCards, setPreviewCards] = useState<ItemCard[]>([]);
  const [previewItem, setPreviewItem] = useState<ItemCard | null>(null);
  const [previewCardList, setPreviewCardList] = useState<KanbanCardResult[]>(
    [],
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<items.Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<items.Item[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [itemToDuplicate, setItemToDuplicate] = useState<items.Item | null>(
    null,
  );
  const [isLoadingCardsToDelete, setIsLoadingCardsToDelete] = useState(false);
  const [cardsToDeleteMap, setCardsToDeleteMap] = useState<
    Record<string, KanbanCardResult[]>
  >({});
  const hasLoadedRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const isNavigatingBackRef = useRef(false);

  // In-table editing: unsaved changes and modal for leave/refresh
  const itemsGridRef = useRef<ItemTableAGGridRef>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasUnsavedChangesRef = useRef(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isSavingUnsaved, setIsSavingUnsaved] = useState(false);
  const pendingNavigateRef = useRef<string | null>(null);

  // Page size is fixed at 50
  const getInitialPageSize = () => {
    return 50;
  };

  // Pagination state for API - using index-based pagination
  const [paginationData, setPaginationData] = useState<{
    currentPageSize: number;
    totalItems: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    thisPage?: string;
    nextPage?: string;
    previousPage?: string;
  }>({
    currentPageSize: getInitialPageSize(),
    totalItems: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Default column visibility configuration
  const defaultColumnVisibility: Record<string, boolean> = {
    sku: true,
    glCode: true,
    image: true,
    name: true,
    classification: true,
    supplier: true,
    location: true,
    subLocation: false,
    unitCost: true,
    created: true,
    minQuantityAmount: true,
    minQuantityUnit: true,
    orderQuantityAmount: true,
    orderQuantityUnit: true,
    orderMethod: true,
    cardSize: true,
    notes: true,
    actions: true,
    subType: false,
    useCase: false,
    department: false,
    facility: false,
    cardNotes: false,
    taxable: false,
    supplierUrl: false,
    supplierSku: false,
    leadTime: false,
    orderCost: false,
    cardSizeOption: false,
    labelSize: false,
    breadcrumbSize: false,
    color: false,
  };

  // Load column visibility from localStorage
  const loadColumnVisibility = (): Record<string, boolean> => {
    if (typeof window === 'undefined') {
      return defaultColumnVisibility;
    }

    try {
      const saved = localStorage.getItem('itemsColumnVisibility');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all columns are present
        return { ...defaultColumnVisibility, ...parsed };
      }
    } catch (error) {
      console.error(
        'Failed to load column visibility from localStorage:',
        error,
      );
    }

    return defaultColumnVisibility;
  };

  // Save column visibility to localStorage
  const saveColumnVisibility = (visibility: Record<string, boolean>) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('itemsColumnVisibility', JSON.stringify(visibility));

      // Also update items-grid-${activeTab} with the new visibility
      const gridStateKey = `items-grid-${activeTab}`;
      const existingGridState = localStorage.getItem(gridStateKey);

      if (existingGridState) {
        try {
          const gridState = JSON.parse(existingGridState);

          // Mapping from viewKey to field name
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

          // Update visibility in grid state
          if (gridState.columnState && Array.isArray(gridState.columnState)) {
            interface ColumnStateItem {
              colId?: string;
              hide?: boolean;
              [key: string]: unknown;
            }

            gridState.columnState = gridState.columnState.map(
              (col: ColumnStateItem) => {
                const viewKey = Object.entries(viewKeyToField).find(
                  ([, field]) => field === col.colId,
                )?.[0];

                if (viewKey && visibility.hasOwnProperty(viewKey)) {
                  return {
                    ...col,
                    hide: !visibility[viewKey],
                  };
                }

                return col;
              },
            );

            // Save updated grid state
            localStorage.setItem(gridStateKey, JSON.stringify(gridState));
          }
        } catch (error) {
          console.error('Failed to update grid state:', error);
        }
      }
    } catch (error) {
      console.error('Failed to save column visibility to localStorage:', error);
    }
  };

  // State to control column visibility - load from localStorage on mount
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() => loadColumnVisibility());

  // Draft state for column view dropdown (stays open until Save/Cancel)
  const [columnViewOpen, setColumnViewOpen] = useState(false);
  const [columnVisibilityDraft, setColumnVisibilityDraft] = useState<
    Record<string, boolean>
  >(() => loadColumnVisibility());

  // Track if this is the initial mount to avoid saving on first render
  const isInitialMount = useRef(true);

  // Save to localStorage whenever columnVisibility changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveColumnVisibility(columnVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnVisibility]);

  const getKanbanCardsForItem = useCallback(
    async (itemEntityId: string): Promise<KanbanCardResult[] | null> => {
      devLog('[getKanbanCardsForItem] Called for item:', itemEntityId);
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        console.error('[getKanbanCardsForItem] No JWT token');
        return null;
      }

      try {
        const requestBody = {
          filter: {
            eq: itemEntityId,
            locator: 'ITEM_REFERENCE_entity_id',
          },
          paginate: {
            index: 0,
            size: 100,
          },
        };

        devLog(
          '[getKanbanCardsForItem] Request body:',
          JSON.stringify(requestBody, null, 2),
        );

        const response = await fetch(
          `/api/arda/kanban/kanban-card/query-details-by-item`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(requestBody),
          },
        );

        devLog(
          '[getKanbanCardsForItem] Response status:',
          response.status,
          response.ok,
        );

        if (response.ok) {
          const data = await response.json();
          devLog(
            '[getKanbanCardsForItem] Response data:',
            JSON.stringify(data, null, 2),
          );
          devLog('[getKanbanCardsForItem] data.ok:', data.ok);
          devLog('[getKanbanCardsForItem] data.data:', data.data);
          devLog(
            '[getKanbanCardsForItem] data.data.results:',
            data.data?.results,
          );

          let results = null;
          if (data.ok && data.data?.results) {
            results = data.data.results;
            devLog(
              '[getKanbanCardsForItem] Found results in data.data.results:',
              results.length,
            );
          } else if (data.ok && data.results) {
            results = data.results;
            devLog(
              '[getKanbanCardsForItem] Found results in data.results:',
              results.length,
            );
          } else if (data.ok && Array.isArray(data.data)) {
            results = data.data;
            devLog(
              '[getKanbanCardsForItem] Found results as data.data array:',
              results.length,
            );
          }

          if (results && Array.isArray(results) && results.length > 0) {
            devLog(
              '[getKanbanCardsForItem] Returning',
              results.length,
              'cards',
            );
            devLog('[getKanbanCardsForItem] First card structure:', results[0]);
            return results;
          } else {
            devWarn(
              '[getKanbanCardsForItem] No results found in response. Structure:',
              {
                hasData: !!data.data,
                hasResults: !!data.data?.results,
                hasDataResults: !!data.results,
                isDataArray: Array.isArray(data.data),
                dataKeys: data.data ? Object.keys(data.data) : [],
                allKeys: Object.keys(data),
              },
            );
            return null;
          }
        } else {
          // Don't log 500 errors - they might be expected for items without cards
          if (response.status !== 500) {
            console.error(
              '[getKanbanCardsForItem] Response not OK:',
              response.status,
            );
          }
          // Return null for 500 errors instead of throwing
          return null;
        }
      } catch (error) {
        // Only log non-500 errors
        if (error instanceof Error && !error.message.includes('500')) {
          console.error(
            `[getKanbanCardsForItem] Error fetching cards for item ${itemEntityId}:`,
            error,
          );
        }
        // Return null instead of throwing
        return null;
      }
    },
    [],
  );

  // Function to refresh cards for a specific item
  const refreshCardsForItem = useCallback(
    async (itemEntityId: string) => {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) return;

      try {
        const cards = await getKanbanCardsForItem(itemEntityId);
        if (cards) {
          setItemCardsMap((prev) => ({
            ...prev,
            [itemEntityId]: cards,
          }));
        }
      } catch (error) {
        console.error(
          `Error refreshing cards for item ${itemEntityId}:`,
          error,
        );
      }
    },
    [getKanbanCardsForItem],
  );

  const ensureCardsForItem = useCallback(
    async (itemEntityId: string) => {
      if (!itemEntityId) return;

      if (itemCardsMap[itemEntityId]) {
        return;
      }

      if (cardFetchPromisesRef.current[itemEntityId]) {
        await cardFetchPromisesRef.current[itemEntityId];
        return;
      }

      const fetchPromise = (async () => {
        const cards = await getKanbanCardsForItem(itemEntityId);
        if (cards) {
          setItemCardsMap((prev) => ({
            ...prev,
            [itemEntityId]: cards,
          }));
        }
        return cards;
      })();

      cardFetchPromisesRef.current[itemEntityId] = fetchPromise;

      try {
        await fetchPromise;
      } finally {
        delete cardFetchPromisesRef.current[itemEntityId];
      }
    },
    [getKanbanCardsForItem, itemCardsMap],
  );

  // Function to fetch real data from ARDA with index-based pagination
  const fetchArdaItems = useCallback(
    async (
      pageSize: number = 50,
      pageIndex: number = 0,
      searchQuery?: string,
      showLoading: boolean = true,
    ): Promise<items.Item[] | undefined> => {
      try {
        if (showLoading) {
          setLoadingArdaItems(true);
        }
        devLog(
          '[PAGINATION] Fetching items with index:',
          pageIndex,
          'size:',
          pageSize,
          'search:',
          searchQuery || 'none',
        );

        let queryRequest: ardaApi.ArdaQueryItemsRequest;

        if (searchQuery && searchQuery.trim()) {
          // Ensure searchValue is always treated as a string, regardless of content
          const searchValue = String(searchQuery.trim());
          // Escape special regex characters to prevent regex injection and ensure proper matching
          const escapedSearchValue = searchValue.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
          );

          // Build filter conditions
          const filterConditions: Array<{
            locator: string;
            eq?: string;
            regex?: string;
          }> = [];

          // Check if the value is a pure number (only digits)
          const isPureNumber = /^\d+$/.test(searchValue);

          // For pure numbers, only use regex to avoid type mismatch errors
          // The API tries to compare string fields with numbers when using eq with pure numbers
          if (isPureNumber) {
            // For pure numbers, use only regex (no eq) to avoid type casting issues
            // The API backend has issues comparing character varying with bigint
            filterConditions.push({
              locator: 'item_name',
              regex: `.*${searchValue}.*`,
            });
          } else {
            // For mixed content, use both eq and regex for better matching
            filterConditions.push({ locator: 'item_name', eq: searchValue });
            filterConditions.push({
              locator: 'item_name',
              regex: `(?i).*${escapedSearchValue}.*`,
            });
          }

          queryRequest = {
            filter: {
              and: [
                {
                  or: filterConditions,
                },
              ],
            },
            paginate: {
              index: pageIndex,
              size: pageSize,
            },
          };
        } else {
          queryRequest = {
            filter: true,
            paginate: {
              index: pageIndex,
              size: pageSize,
            },
          };
        }

        devLog(
          '[PAGINATION] Request body:',
          JSON.stringify(queryRequest, null, 2),
        );
        const result = await queryItems(queryRequest);
        devLog('[PAGINATION] Received', result.items.length, 'items');
        devLog('[PAGINATION] First item ID:', result.items[0]?.entityId);
        devLog(
          '[PAGINATION] Last item ID:',
          result.items[result.items.length - 1]?.entityId,
        );
        devLog('[PAGINATION] Pagination tokens:', {
          thisPage: result.pagination.thisPage,
          nextPage: result.pagination.nextPage,
          previousPage: result.pagination.previousPage,
        });

        // Check for empty page BEFORE setting items to avoid showing empty state
        // If we received 0 items and we're not on page 1, and we're not already navigating back,
        // we've navigated to a non-existent page - navigate back automatically
        if (
          result.items.length === 0 &&
          pageIndex > 0 &&
          !isNavigatingBackRef.current
        ) {
          const previousPageIndex = Math.max(0, pageIndex - pageSize);
          isNavigatingBackRef.current = true;
          devLog(
            '[PAGINATION] Empty page detected at index',
            pageIndex,
            '- automatically navigating back to index',
            previousPageIndex,
          );

          // Stop loading immediately without showing empty state
          setLoadingArdaItems(false);

          // Don't show loading state during automatic navigation
          // Fetch the previous page without showing loading
          setTimeout(() => {
            fetchArdaItems(
              pageSize,
              previousPageIndex,
              searchQuery,
              false,
            ).finally(() => {
              isNavigatingBackRef.current = false;
            });
          }, 0);

          // Exit early - don't update state with empty page
          return;
        }

        setArdaItems(result.items);
        setItemCardsMap((prev) => {
          const allowedIds = new Set(
            result.items
              .map((item) => item.entityId)
              .filter((entityId): entityId is string => Boolean(entityId)),
          );

          const nextEntries = Object.entries(prev).filter(([entityId]) =>
            allowedIds.has(entityId),
          );

          return Object.fromEntries(nextEntries);
        });

        // Update max items seen (accumulated across all pages visited)
        const currentMaxItemsSeen = pageIndex * pageSize + result.items.length;
        if (currentMaxItemsSeen > maxItemsSeenRef.current) {
          maxItemsSeenRef.current = currentMaxItemsSeen;
          setMaxItemsSeen(currentMaxItemsSeen);
        } else if (pageIndex === 0 && result.items.length > 0) {
          // Reset when starting from the beginning
          maxItemsSeenRef.current = result.items.length;
          setMaxItemsSeen(result.items.length);
        }

        // Reset navigation flag if we successfully got items
        if (result.items.length > 0) {
          isNavigatingBackRef.current = false;
        }

        // Determine if there are more pages based on nextPage token and items count
        // If we received 0 items, there are no more pages (even if backend returns nextPage token)
        // Also check if nextPage token exists and is not empty
        const hasNextPage =
          result.items.length > 0 &&
          Boolean(
            result.pagination.nextPage &&
            result.pagination.nextPage.trim() !== '',
          );
        const hasPreviousPage = Boolean(
          result.pagination.previousPage &&
          result.pagination.previousPage.trim() !== '',
        );

        // Calculate current page number from index
        // Index 0 = Page 1, Index 50 = Page 2, Index 100 = Page 3, etc.
        const newCurrentPage = Math.floor(pageIndex / pageSize) + 1;

        devLog('[PAGINATION] Updating pagination state:', {
          pageIndex,
          newCurrentPage,
          hasNextPage,
          hasPreviousPage,
          itemsCount: result.items.length,
        });

        // Update pagination data
        setPaginationData({
          currentPageSize: pageSize,
          totalItems: result.items.length,
          currentPage: newCurrentPage,
          hasNextPage,
          hasPreviousPage,
          thisPage: result.pagination.thisPage,
          nextPage: result.pagination.nextPage,
          previousPage: result.pagination.previousPage,
        });

        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
        return result.items;
      } catch (err) {
        console.error('Failed to fetch ARDA items:', err);

        // Check if this is an authentication error
        if (isAuthenticationError(err)) {
          // Don't redirect here - let AuthGuard handle it
          // Just reset the loading state and return
          hasLoadedRef.current = false;
          return;
        }

        toast.error('Failed to fetch ARDA items - using fallback data');
        setArdaItems([]);
        setPaginationData({
          currentPageSize: pageSize,
          totalItems: 0,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        return [];
      } finally {
        if (showLoading) {
          setLoadingArdaItems(false);
        }
      }
    },
    [],
  );

  const getItems = (): items.Item[] => {
    // If there are no items at all, return empty for all tabs
    if (ardaItems.length === 0) {
      return [];
    }

    let itemsToReturn: items.Item[] = [];

    switch (activeTab) {
      case 'published':
        itemsToReturn = ardaItems; // Use real ARDA data for published
        break;
      case 'draft':
        // Return the same items but mark them as draft
        itemsToReturn = ardaItems.map((item) => ({
          ...item,
          state: 'draft',
        }));
        break;
      case 'uploaded':
        // Return the same items but mark them as recently uploaded
        itemsToReturn = ardaItems.map((item) => ({
          ...item,
          state: 'uploaded',
        }));
        break;
      default:
        itemsToReturn = ardaItems;
    }

    return itemsToReturn;
  };

  // Refresh current page (used after in-table save and for UnsavedChangesModal Save)
  const refreshCurrentPage = useCallback(() => {
    const pageIndex =
      (paginationData.currentPage - 1) * paginationData.currentPageSize;
    fetchArdaItems(
      paginationData.currentPageSize,
      pageIndex,
      debouncedSearch,
      false,
    );
  }, [paginationData, fetchArdaItems, debouncedSearch]);

  // Pagination handlers - using index-based pagination
  // Index represents the starting item index (0, 50, 100, etc.)
  const handleNextPage = useCallback(() => {
    if (paginationData.hasNextPage && !loadingArdaItems) {
      // Calculate next index: currentPage * pageSize
      // Page 1 (index 0) -> Page 2 (index 50) -> Page 3 (index 100)
      const nextPageIndex =
        paginationData.currentPage * paginationData.currentPageSize;
      devLog(
        '[PAGINATION] Next page - currentPage:',
        paginationData.currentPage,
        'nextIndex:',
        nextPageIndex,
      );
      fetchArdaItems(
        paginationData.currentPageSize,
        nextPageIndex,
        debouncedSearch,
      );
    }
  }, [paginationData, fetchArdaItems, loadingArdaItems, debouncedSearch]);

  const handlePreviousPage = useCallback(() => {
    if (paginationData.hasPreviousPage && !loadingArdaItems) {
      // Calculate previous index: (currentPage - 2) * pageSize
      // Page 3 (index 100) -> Page 2 (index 50) -> Page 1 (index 0)
      const previousPageIndex = Math.max(
        0,
        (paginationData.currentPage - 2) * paginationData.currentPageSize,
      );
      devLog(
        '[PAGINATION] Previous page - currentPage:',
        paginationData.currentPage,
        'previousIndex:',
        previousPageIndex,
      );
      fetchArdaItems(
        paginationData.currentPageSize,
        previousPageIndex,
        debouncedSearch,
      );
    }
  }, [paginationData, fetchArdaItems, loadingArdaItems, debouncedSearch]);

  const handleFirstPage = useCallback(() => {
    // Go to first page (index 0)
    if (!loadingArdaItems) {
      fetchArdaItems(paginationData.currentPageSize, 0, debouncedSearch);
    }
  }, [
    paginationData.currentPageSize,
    fetchArdaItems,
    loadingArdaItems,
    debouncedSearch,
  ]);

  // Load items immediately on component mount
  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      return;
    }

    // If no user, AuthGuard should handle redirect - don't do anything here
    if (!user) {
      // Reset hasLoadedRef when user is not available
      hasLoadedRef.current = false;
      return;
    }

    // Only fetch once - check if already loaded or currently loading
    if (hasLoadedRef.current) {
      return;
    }

    // Mark as loaded before making the request to prevent duplicate calls
    hasLoadedRef.current = true;
    isInitialLoadRef.current = true;
    fetchArdaItems(getInitialPageSize(), 0, debouncedSearch);
    // Only depend on user and authLoading for initial load, debouncedSearch is handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Function to trigger search immediately (for Enter key and blur)
  const triggerSearch = useCallback(() => {
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Update debounced search immediately
    if (search.trim() === '') {
      setIsSearching(false);
      setDebouncedSearch('');
    } else {
      setIsSearching(false);
      setDebouncedSearch(search);
    }
  }, [search]);

  // Debounce search input - wait 500ms after user stops typing
  useEffect(() => {
    // Don't set searching state if search is empty
    if (search.trim() === '') {
      setIsSearching(false);
      setDebouncedSearch('');
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setIsSearching(false);
      searchTimeoutRef.current = null;
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [search]);

  // Handle debounced search changes - reset to first page when search changes
  useEffect(() => {
    // Don't fetch if auth is still loading or user is not available
    if (authLoading || !user) {
      return;
    }

    // Only fetch if we've already loaded initially
    if (!hasLoadedRef.current) {
      return;
    }

    // Reset to first page when search changes
    fetchArdaItems(getInitialPageSize(), 0, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Listen for item deletion events from ItemDetailsPanel
  useEffect(() => {
    const handleItemDeleted = () => {
      // Refresh the items list when an item is deleted (stay on current page)
      // Calculate index: (currentPage - 1) * pageSize
      const currentPageIndex =
        (paginationData.currentPage - 1) * paginationData.currentPageSize;
      fetchArdaItems(
        paginationData.currentPageSize,
        currentPageIndex,
        debouncedSearch,
      );
    };

    const handleRefreshItemCards = (event: Event) => {
      const customEvent = event as CustomEvent<{ itemEntityId: string }>;
      const { itemEntityId } = customEvent.detail;
      if (itemEntityId) {
        // Refresh cards for the specific item
        refreshCardsForItem(itemEntityId);
      }
    };

    window.addEventListener('itemDeleted', handleItemDeleted);
    window.addEventListener('refreshItemCards', handleRefreshItemCards);
    return () => {
      window.removeEventListener('itemDeleted', handleItemDeleted);
      window.removeEventListener('refreshItemCards', handleRefreshItemCards);
    };
  }, [
    fetchArdaItems,
    paginationData.currentPageSize,
    paginationData.currentPage,
    refreshCardsForItem,
    debouncedSearch,
  ]);

  // Keep ref in sync for use in blockers and popstate (avoids stale closure)
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // beforeunload: warn when leaving/refreshing with unsaved in-table edits
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  // Blocker for in-app navigation (sidebar, router.push): show modal and block when hasUnsavedChanges
  useEffect(() => {
    const unregister = registerBlocker((url) => {
      if (!hasUnsavedChangesRef.current) return false;
      pendingNavigateRef.current = url;
      setShowUnsavedModal(true);
      return true;
    });
    return unregister;
  }, []);

  // Browser back/forward: if we navigated away from /items with unsaved changes, undo and show modal
  useEffect(() => {
    const onPopState = () => {
      if (!hasUnsavedChangesRef.current) return;
      const path = window.location.pathname || '';
      const onItems =
        path === '/items' ||
        path.startsWith('/items/') ||
        /^\/item\/[^/]+$/.test(path);
      if (onItems) return;
      const target = `${path}${window.location.search || ''}${window.location.hash || ''}`;
      history.forward();
      pendingNavigateRef.current = target;
      setShowUnsavedModal(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // In-app navigation: when user clicks a link to leave /items with unsaved changes, show UnsavedChangesModal
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.(
        'a[href]',
      ) as HTMLAnchorElement | null;
      if (!a?.href) return;
      try {
        const url = new URL(a.href);
        const path = url.pathname || '';
        const onItems =
          path === '/items' ||
          path.startsWith('/items/') ||
          path.match(/^\/item\/[^/]+$/);
        if (onItems) return;
        // Only intercept in-app (same-origin) navigation; for external, beforeunload handles it
        if (url.origin !== window.location.origin) return;
        e.preventDefault();
        e.stopPropagation();
        pendingNavigateRef.current = `${url.pathname}${url.search || ''}${url.hash || ''}`;
        setShowUnsavedModal(true);
      } catch {
        // ignore invalid URLs
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasUnsavedChanges]);

  // Handle bookmarkable item URL - auto-open panel if itemId is in URL
  // This only runs when someone directly navigates to /item/[itemId]
  useEffect(() => {
    // Only proceed if we have an itemId from the URL and user is authenticated
    if (!itemIdFromPath || !user || authLoading) {
      return;
    }

    // Don't open if panel is already open with the same item
    if (managePanelOpen && selectedItem?.entityId === itemIdFromPath) {
      return;
    }

    // Fetch and open the item
    const fetchAndOpenItem = async () => {
      try {
        const item = await getItemById(itemIdFromPath);
        setSelectedItem(item);
        setManagePanelOpen(true);
      } catch (err) {
        console.error('Error fetching item for bookmarkable URL:', err);
        if (!isAuthenticationError(err)) {
          toast.error('Failed to load item');
          // Redirect to items page if item not found
          if (pathname?.startsWith('/item/')) {
            router.replace('/items');
          }
        }
      }
    };

    fetchAndOpenItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIdFromPath, user, authLoading]);

  // Clear selection and reset max items seen when tab changes
  useEffect(() => {
    selectedItemsMapRef.current.clear();
    setSelectedItems([]);
    maxItemsSeenRef.current = 0;
    setMaxItemsSeen(0);
  }, [activeTab]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Command+O (Open item)
      if ((event.metaKey || event.ctrlKey) && event.key === 'o') {
        event.preventDefault();
        if (selectedItems.length === 1) {
          setSelectedItem(selectedItems[0]);
          setManagePanelOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItems]);

  // Up/down arrows to move through table rows when detail panel is open (uses displayed order = sort order)
  useEffect(() => {
    if (!managePanelOpen || !selectedItem?.entityId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const displayedItems =
        itemsGridRef.current?.getDisplayedItems?.() ?? ardaItems;
      if (displayedItems.length === 0) return;
      const direction = event.key === 'ArrowDown' ? 'down' : 'up';
      const next = getAdjacentItem(
        displayedItems,
        selectedItem.entityId,
        direction
      );
      if (next) {
        event.preventDefault();
        setSelectedItem(next);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [managePanelOpen, selectedItem?.entityId, ardaItems]);

  // Handle delete item functionality
  const handleDeleteMultipleItems = async (itemsToDelete: items.Item[]) => {
    try {
      setIsLoadingCardsToDelete(true);

      // Set items to delete
      if (itemsToDelete.length === 1) {
        setItemToDelete(itemsToDelete[0]);
      } else {
        setItemsToDelete(itemsToDelete);
      }

      // First, fetch all cards for all items
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        toast.error('Authentication token not found');
        setIsDeleteModalOpen(false);
        return;
      }

      const cardsMap: Record<string, KanbanCardResult[]> = {};

      // Fetch cards for each item
      const cardFetchPromises = itemsToDelete.map(async (item) => {
        try {
          const response = await fetch(
            `/api/arda/kanban/kanban-card/query-by-item?eId=${item.entityId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            devLog(
              `Cards response for item ${item.entityId}:`,
              data.ok,
              data.data?.records?.length || 0,
            );
            if (data.ok && data.data?.records) {
              // Map the API response to KanbanCardResult format
              const cards = data.data.records.map(
                (record: {
                  payload: {
                    eId: string;
                    serialNumber: string;
                    item: {
                      eId: string;
                      name: string;
                    };
                    cardQuantity: {
                      amount: number;
                      unit: string;
                    };
                    status: string;
                  };
                  rId: string;
                }) => ({
                  payload: {
                    eId: record.payload.eId,
                    serialNumber: record.payload.serialNumber,
                    item: {
                      eId: record.payload.item.eId,
                      name: record.payload.item.name,
                    },
                    cardQuantity: record.payload.cardQuantity,
                    status: record.payload.status,
                  },
                  rId: record.rId,
                }),
              );
              devLog(`Found ${cards.length} card(s) for item ${item.entityId}`);
              cardsMap[item.entityId] = cards;
            } else {
              devLog(
                `No cards found for item ${item.entityId} (ok: ${
                  data.ok
                }, records: ${data.data?.records?.length || 0})`,
              );
              cardsMap[item.entityId] = [];
            }
          } else {
            console.error(
              `Failed to fetch cards for item ${item.entityId}:`,
              response.status,
            );
            cardsMap[item.entityId] = [];
          }
        } catch (error) {
          console.error(
            `Error fetching cards for item ${item.entityId}:`,
            error,
          );
          if (handleAuthError(error)) {
            setIsDeleteModalOpen(false);
            return;
          }
          cardsMap[item.entityId] = [];
        }
      });

      await Promise.all(cardFetchPromises);
      setCardsToDeleteMap(cardsMap);
      setIsDeleteModalOpen(true);
    } catch (error) {
      console.error('Error fetching cards for deletion:', error);
      if (handleAuthError(error)) {
        setIsDeleteModalOpen(false);
        return;
      }
      toast.error('Error fetching cards');
    } finally {
      setIsLoadingCardsToDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setItemsToDelete([]);
    setCardsToDeleteMap({});
  };

  // Handle duplicate item functionality
  const handleDuplicateItem = (item: items.Item) => {
    setItemToDuplicate(item);
    setPanelOpen(true);
  };

  const handleConfirmDelete = async () => {
    const itemsToDeleteList = itemToDelete ? [itemToDelete] : itemsToDelete;

    if (itemsToDeleteList.length === 0) return;

    try {
      if (itemsToDeleteList.length === 1) {
        setIsDeleting(true);
      } else {
        setIsBulkDeleting(true);
      }

      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        toast.error('Authentication token not found');
        return;
      }

      // First, delete all cards associated with all items
      let totalCardsDeleted = 0;
      let totalCardsFailed = 0;

      for (const item of itemsToDeleteList) {
        const cardsToDelete = cardsToDeleteMap[item.entityId] || [];

        devLog(
          `Item ${item.entityId} has ${cardsToDelete.length} card(s) to delete`,
        );

        if (cardsToDelete.length > 0) {
          devLog(
            `Deleting ${cardsToDelete.length} card(s) for item ${item.entityId}`,
          );

          const cardDeletePromises = cardsToDelete.map(async (card) => {
            try {
              const response = await fetch(
                `/api/arda/kanban/kanban-card/${card.payload.eId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                  },
                },
              );

              if (response.ok) {
                const data = await response.json();
                // Consider it successful if response status is 200
                // The API route returns { ok: upstream.ok, status: upstream.status, data }
                // So if response.ok is true, the deletion was successful
                const success = response.status === 200;
                devLog(
                  `Card ${card.payload.eId} deletion: status=${response.status}, data.ok=${data.ok}, success=${success}`,
                );
                if (!success) {
                  devWarn(
                    `Unexpected response for card ${card.payload.eId}:`,
                    data,
                  );
                }
                return { success, cardId: card.payload.eId };
              }
              const errorText = await response.text();
              console.error(
                `Failed to delete card ${card.payload.eId}:`,
                response.status,
                errorText,
              );
              return { success: false, cardId: card.payload.eId };
            } catch (error) {
              console.error(`Error deleting card ${card.payload.eId}:`, error);
              if (handleAuthError(error)) {
                throw error;
              }
              return { success: false, cardId: card.payload.eId };
            }
          });

          const cardResults = await Promise.all(cardDeletePromises);
          const successfulCards = cardResults.filter((r) => r.success);
          const failedCards = cardResults.filter((r) => !r.success);

          totalCardsDeleted += successfulCards.length;
          totalCardsFailed += failedCards.length;

          if (failedCards.length > 0) {
            devWarn(
              `Failed to delete ${failedCards.length} of ${cardsToDelete.length} cards for item ${item.entityId}`,
            );
            devWarn(
              'Failed card IDs:',
              failedCards.map((f) => f.cardId),
            );
          }

          if (successfulCards.length > 0) {
            devLog(
              `Successfully deleted ${successfulCards.length} card(s) for item ${item.entityId}`,
            );
          }
        } else {
          devLog(`No cards found for item ${item.entityId}`);
        }
      }

      devLog(
        `Total cards deleted: ${totalCardsDeleted}, failed: ${totalCardsFailed}`,
      );

      // Then, delete all items
      const deletePromises = itemsToDeleteList.map(async (item) => {
        const response = await fetch(`/api/arda/items/${item.entityId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return { success: data.ok, item };
        }
        return { success: false, item };
      });

      const results = await Promise.all(deletePromises);
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      // Show success message with card deletion info
      if (successful.length === itemsToDeleteList.length) {
        const cardMessage =
          totalCardsDeleted > 0
            ? ` and ${totalCardsDeleted} associated card${
                totalCardsDeleted > 1 ? 's' : ''
              }`
            : '';
        toast.success(
          `Successfully deleted ${successful.length} item${
            successful.length > 1 ? 's' : ''
          }${cardMessage}`,
        );
      } else if (successful.length > 0) {
        const cardMessage =
          totalCardsDeleted > 0
            ? ` (${totalCardsDeleted} card${
                totalCardsDeleted > 1 ? 's' : ''
              } deleted)`
            : '';
        toast.warning(
          `Deleted ${successful.length} of ${itemsToDeleteList.length} items${cardMessage}. ${failed.length} failed.`,
        );
      } else {
        const cardMessage =
          totalCardsDeleted > 0
            ? ` (${totalCardsDeleted} card${
                totalCardsDeleted > 1 ? 's' : ''
              } were deleted before failure)`
            : '';
        toast.error(`Failed to delete items${cardMessage}`);
      }

      // Show warning if some cards failed to delete
      if (totalCardsFailed > 0) {
        toast.warning(
          `Warning: ${totalCardsFailed} card${
            totalCardsFailed > 1 ? 's' : ''
          } failed to delete. The items were still deleted.`,
        );
      }

      // Refresh the items list (stay on current page)
      // Calculate index: (currentPage - 1) * pageSize
      const currentPageIndex =
        (paginationData.currentPage - 1) * paginationData.currentPageSize;
      fetchArdaItems(
        paginationData.currentPageSize,
        currentPageIndex,
        debouncedSearch,
      );

      // Clear selection for deleted items
      const deletedItemIds = successful.map((r) => r.item.entityId);
      deletedItemIds.forEach((entityId) => {
        selectedItemsMapRef.current.delete(entityId);
      });
      const allSelectedItems = Array.from(selectedItemsMapRef.current.values());
      setSelectedItems(allSelectedItems);
    } catch (error) {
      console.error('Error deleting items:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error deleting items');
    } finally {
      setIsDeleting(false);
      setIsBulkDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setItemsToDelete([]);
      setCardsToDeleteMap({});
    }
  };

  const mockItem: ItemCard = {
    eid: '02938402-1930-1092',
    title: 'M8 × 1 - 50',
    supplier: 'Amazon',
    image: '/images/imageExampleCard.png',
    link: 'https://amazon.com',
    sku: '02938402-1930-1092',
    unitPrice: 0.02,
  };

  // Function to convert ARDA Item to ItemCard for the panel
  const convertItemToItemCard = (item: items.Item): ItemCard => {
    return {
      eid: item.entityId,
      title: item.name,
      supplier: item.primarySupply?.supplier || '',
      image: item.imageUrl || '',
      link: item.primarySupply?.url || '#',
      sku: item.internalSKU || '',
      unitPrice: item.primarySupply?.unitCost?.value || 0,
      minQty: item.minQuantity?.amount.toString() || '1',
      minUnit: item.minQuantity?.unit || 'unit',
      location: item.locator?.location || '',
      orderQty: item.primarySupply?.orderQuantity?.amount?.toString() || '1',
      orderUnit: item.primarySupply?.orderQuantity?.unit || 'unit',
      generalLedgerCode: item.generalLedgerCode,
    };
  };

  // Function to handle creating a new item
  const handleCreateNewItem = () => {
    setItemToEdit(null); // Ensure we're creating a new item
    setPanelOpen(true);
  };

  // Function to handle closing the panel (X button - closes everything)
  const handleClosePanel = () => {
    setPanelOpen(false);
    setItemToEdit(null); // Clear itemToEdit when panel closes
    setItemToDuplicate(null); // Clear itemToDuplicate when panel closes
    setManagePanelOpen(false); // Close details panel too
    setSelectedItem(null); // Clear selected item
  };

  // Function to handle cancel (Cancel button - returns to details view)
  const handleCancelEdit = () => {
    setPanelOpen(false);
    setItemToEdit(null); // Clear itemToEdit when panel closes
    setItemToDuplicate(null); // Clear itemToDuplicate when panel closes
    // If there's a selected item, reopen the details panel
    if (selectedItem) {
      setManagePanelOpen(true);
    }
  };

  // Publish & add another from edit: close details panel, clear selection, refresh list, keep form open empty
  const handlePublishAndAddAnotherFromEdit = async () => {
    setManagePanelOpen(false);
    setItemToEdit(null);
    setItemToDuplicate(null);
    setSelectedItem(null);
    const currentPageIndex =
      (paginationData.currentPage - 1) * paginationData.currentPageSize;
    await fetchArdaItems(
      paginationData.currentPageSize,
      currentPageIndex,
      debouncedSearch,
    );
  };

  // Publish & add another from add item: refresh list, keep form open empty
  const handlePublishAndAddAnotherFromAddItem = async () => {
    const currentPageIndex =
      (paginationData.currentPage - 1) * paginationData.currentPageSize;
    await fetchArdaItems(
      paginationData.currentPageSize,
      currentPageIndex,
      debouncedSearch,
    );
  };

  const handlePrintSelectedCards = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to print cards');
      return;
    }

    try {
      setIsPrintingCards(true);
      const jwtToken = localStorage.getItem('idToken');

      // Fetch cards for all selected items and group by template (cardSize)
      // The API requires all cards in a batch to have the same template
      const cardsByTemplate = new Map<string, string[]>();

      for (const item of selectedItems) {
        if (!item.entityId) {
          continue;
        }

        try {
          // Use the same endpoint as handlePreviewSelectedCards which we know works
          const response = await fetch(
            `/api/arda/kanban/kanban-card/query-by-item?eId=${item.entityId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            // Handle both possible response structures: data.data.records or data.data.results
            const records = data.data?.records || data.data?.results || [];

            if (data.ok && records.length > 0) {
              // Group cards by template (cardSize from itemDetails)
              records.forEach(
                (result: {
                  payload: {
                    eId: string;
                    itemDetails?: {
                      cardSize?: string;
                    };
                  };
                }) => {
                  const cardId = result.payload.eId;
                  // Use cardSize as template, default to 'UNKNOWN' if not available
                  const template =
                    result.payload.itemDetails?.cardSize || 'UNKNOWN';

                  if (!cardsByTemplate.has(template)) {
                    cardsByTemplate.set(template, []);
                  }
                  cardsByTemplate.get(template)!.push(cardId);
                },
              );
            }
          }
        } catch (error) {
          console.error(
            `Error fetching cards for item ${item.entityId}:`,
            error,
          );
        }
      }

      // Get total count of all cards
      const totalCards = Array.from(cardsByTemplate.values()).reduce(
        (sum, ids) => sum + ids.length,
        0,
      );

      if (totalCards === 0) {
        toast.error('No cards found for the selected items');
        setIsPrintingCards(false);
        return;
      }

      // Print cards grouped by template (one batch per template)
      const printPromises: Promise<void>[] = [];
      let successCount = 0;
      let errorCount = 0;
      let templateErrorShown = false;

      for (const [template, cardIds] of cardsByTemplate.entries()) {
        const printPromise = fetch('/api/arda/kanban/kanban-card/print-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            ids: cardIds,
          }),
        })
          .then(async (printResponse) => {
            if (printResponse.ok) {
              const data = await printResponse.json();

              if (data.ok && data.data && data.data.url) {
                window.open(data.data.url, '_blank', 'noopener,noreferrer');
                successCount += cardIds.length;
              } else {
                errorCount += cardIds.length;
                console.error(
                  `Failed to print cards for template ${template} - invalid response structure:`,
                  data,
                );
              }
            } else {
              errorCount += cardIds.length;
              const errorData = await printResponse.json().catch(() => ({}));

              // Check if it's the template error and show user-friendly message
              if (
                errorData?.data?.responseMessage?.includes(
                  'All cards in a print batch must have the same template',
                ) &&
                !templateErrorShown
              ) {
                templateErrorShown = true;
                toast.error(
                  'Cannot print cards with different sizes together. Please select cards with the same size.',
                );
              } else if (!templateErrorShown) {
                // Show generic error message if not template error
                const errorMessage =
                  errorData?.data?.responseMessage ||
                  errorData?.error ||
                  'Failed to print cards';
                toast.error(errorMessage);
              }

              console.error(
                `Failed to print cards for template ${template}:`,
                printResponse.status,
                errorData,
              );
            }
          })
          .catch((error) => {
            errorCount += cardIds.length;
            console.error(
              `Error printing cards for template ${template}:`,
              error,
            );
            if (!templateErrorShown) {
              toast.error('Error printing cards');
            }
          });

        printPromises.push(printPromise);
      }

      // Wait for all print requests to complete
      await Promise.all(printPromises);

      // Show success/error message (only if template error wasn't already shown)
      if (successCount > 0 && errorCount === 0) {
        toast.success(
          `Successfully printed ${successCount} card${
            successCount > 1 ? 's' : ''
          } from ${selectedItems.length} item${
            selectedItems.length > 1 ? 's' : ''
          }!`,
        );
      } else if (successCount > 0 && errorCount > 0 && !templateErrorShown) {
        toast.warning(
          `Printed ${successCount} card${
            successCount > 1 ? 's' : ''
          }, but failed to print ${errorCount} card${errorCount > 1 ? 's' : ''}`,
        );
      } else if (errorCount > 0 && !templateErrorShown) {
        toast.error('Failed to print cards');
      }
    } catch (error) {
      console.error('Error printing cards:', error);
      toast.error('Error printing cards');
    } finally {
      setIsPrintingCards(false);
    }
  };

  const handlePrintSelectedLabels = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to print labels');
      return;
    }

    try {
      setIsPrintingLabels(true);
      const jwtToken = localStorage.getItem('idToken');

      const recordIds: string[] = [];

      for (const item of selectedItems) {
        try {
          const response = await fetch(`/api/arda/items/${item.entityId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.ok && data.data?.rId) {
              recordIds.push(data.data.rId);
            }
          }
        } catch (error) {
          console.error(
            `Error fetching record ID for item ${item.entityId}:`,
            error,
          );
        }
      }

      if (recordIds.length === 0) {
        toast.error('No record IDs found for the selected items');
        return;
      }

      const printResponse = await fetch('/api/arda/item/item/print-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          ids: recordIds,
        }),
      });

      if (printResponse.ok) {
        const data = await printResponse.json();

        if (data.ok && data.data && data.data.url) {
          window.open(data.data.url, '_blank', 'noopener,noreferrer');

          toast.success(
            `Successfully printed ${recordIds.length} label${
              recordIds.length > 1 ? 's' : ''
            } from ${selectedItems.length} item${
              selectedItems.length > 1 ? 's' : ''
            }!`,
          );
        } else {
          console.error(
            'Failed to print labels - invalid response structure:',
            data,
          );
          toast.error('Failed to print labels - invalid response');
        }
      } else {
        const errorData = await printResponse.json().catch(() => ({}));
        console.error(
          'Failed to print labels:',
          printResponse.status,
          errorData,
        );

        // Check if it's the template error and show user-friendly message
        if (
          errorData?.data?.responseMessage?.includes(
            'All cards in a print batch must have the same template',
          )
        ) {
          toast.error(
            'Cannot print labels with different sizes together. Please select items with the same label size.',
          );
        } else {
          const errorMessage =
            errorData?.data?.responseMessage ||
            errorData?.error ||
            'Failed to print labels';
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error printing labels:', error);
      toast.error('Error printing labels');
    } finally {
      setIsPrintingLabels(false);
    }
  };

  const handlePrintSelectedBreadcrumbs = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to print breadcrumbs');
      return;
    }

    try {
      setIsPrintingBreadcrumbs(true);
      const jwtToken = localStorage.getItem('idToken');

      const recordIds: string[] = [];

      for (const item of selectedItems) {
        try {
          const response = await fetch(`/api/arda/items/${item.entityId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.ok && data.data?.rId) {
              recordIds.push(data.data.rId);
            }
          }
        } catch (error) {
          console.error(
            `Error fetching record ID for item ${item.entityId}:`,
            error,
          );
        }
      }

      if (recordIds.length === 0) {
        toast.error('No record IDs found for the selected items');
        return;
      }

      const printResponse = await fetch(
        '/api/arda/item/item/print-breadcrumb',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            ids: recordIds,
          }),
        },
      );

      if (printResponse.ok) {
        const data = await printResponse.json();

        if (data.ok && data.data && data.data.url) {
          window.open(data.data.url, '_blank', 'noopener,noreferrer');

          toast.success(
            `Successfully printed ${recordIds.length} breadcrumb${
              recordIds.length > 1 ? 's' : ''
            } from ${selectedItems.length} item${
              selectedItems.length > 1 ? 's' : ''
            }!`,
          );
        } else {
          console.error(
            'Failed to print breadcrumbs - invalid response structure:',
            data,
          );
          toast.error('Failed to print breadcrumbs - invalid response');
        }
      } else {
        const errorData = await printResponse.json().catch(() => ({}));
        console.error(
          'Failed to print breadcrumbs:',
          printResponse.status,
          errorData,
        );

        // Check if it's the template error and show user-friendly message
        if (
          errorData?.data?.responseMessage?.includes(
            'All cards in a print batch must have the same template',
          )
        ) {
          toast.error(
            'Cannot print breadcrumbs with different sizes together. Please select items with the same breadcrumb size.',
          );
        } else {
          const errorMessage =
            errorData?.data?.responseMessage ||
            errorData?.error ||
            'Failed to print breadcrumbs';
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error printing breadcrumbs:', error);
      toast.error('Error printing breadcrumbs');
    } finally {
      setIsPrintingBreadcrumbs(false);
    }
  };

  const handlePreviewSelectedCards = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to preview cards');
      return;
    }

    try {
      setIsLoadingPreview(true);
      const jwtToken = localStorage.getItem('idToken');

      // Fetch cards for all selected items
      const allCards: ItemCard[] = [];
      const allCardList: KanbanCardResult[] = [];

      for (const item of selectedItems) {
        if (!item.entityId) {
          continue;
        }

        try {
          const response = await fetch(
            `/api/arda/kanban/kanban-card/query-by-item?eId=${item.entityId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            // Handle both possible response structures: data.data.records or data.data.results
            const records = data.data?.records || data.data?.results || [];

            if (data.ok && records.length > 0) {
              // Store original card list for status
              allCardList.push(...records);

              // Map the API response to ItemCard format using the same logic as convertItemToItemCard
              const mappedCards = records.map(
                (result: {
                  payload: {
                    eId: string;
                    item: { name: string };
                    cardQuantity?: { amount?: number; unit?: string };
                    serialNumber?: string;
                  };
                }) => ({
                  eid: result.payload.eId,
                  title: result.payload.item.name || '',
                  supplier: item.primarySupply?.supplier || '',
                  image: item.imageUrl || '',
                  link: item.primarySupply?.url || '#',
                  sku: result.payload.serialNumber || '',
                  unitPrice: item.primarySupply?.unitCost?.value || 0,
                  minQty: item.minQuantity?.amount?.toString() || '1',
                  minUnit: item.minQuantity?.unit || 'unit',
                  location: item.locator?.location || '',
                  orderQty:
                    result.payload.cardQuantity?.amount?.toString() || '',
                  orderUnit: result.payload.cardQuantity?.unit || '',
                }),
              );
              allCards.push(...mappedCards);
            }
          }
        } catch (error) {
          console.error(
            `Error fetching cards for item ${item.entityId}:`,
            error,
          );
        }
      }

      if (allCards.length === 0) {
        toast.error('No cards found for the selected items');
        return;
      }

      // Use the first item as the base item for the modal
      const firstItem = convertItemToItemCard(selectedItems[0]);
      setPreviewItem(firstItem);
      setPreviewCards(allCards);
      setPreviewCardList(allCardList);
      setPreviewModalOpen(true);
    } catch (error) {
      console.error('Error loading cards for preview:', error);
      toast.error('Error loading cards for preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='overflow-hidden'>
        <AppHeader />
        <div className='w-full px-10 pt-4 mt-16 md:px-8 md:pt-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden'>
          <div>
            <h1 className='text-[24px] font-semibold leading-8 text-black font-inter'>
              Items
            </h1>
            <p className='text-[16px] leading-6 font-normal text-black font-inter'>
              Create new items, print Kanban Cards, and add to order queue
            </p>
            {/* <div className='flex items-center gap-2 mt-2'>
              <span className='text-sm text-muted-foreground'>
                Connected to ARDA API{' '}
                {loadingArdaItems
                  ? '⏳ Loading...'
                  : `(${ardaItems.length} items loaded)`}
              </span>
            </div> */}
          </div>
          {loadingArdaItems && isInitialLoadRef.current ? (
            <div className='border border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-4'>
              <div className='w-10 h-10 flex items-center justify-center rounded-md border border-border shadow-sm'>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-foreground'></div>
              </div>
              <div className='text-center'>
                <h2 className='text-base font-semibold text-foreground'>
                  Loading items...
                </h2>
                <p className='text-sm text-muted-foreground'>
                  Please wait while we fetch your items
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className='flex border-b'>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 font-medium ${
                      activeTab === tab.key
                        ? 'border-b-2 border-black text-black'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-2 gap-2 sm:gap-0'>
                <div className='relative w-full sm:max-w-xs'>
                  <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10' />
                  <Input
                    type='text'
                    placeholder='Search by name'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        triggerSearch();
                      }
                    }}
                    onBlur={triggerSearch}
                    className='pl-8 h-9 sm:h-10 text-sm sm:text-base'
                  />
                  {isSearching && (
                    <div className='absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-b-md'>
                      <Skeleton className='h-full w-full bg-muted-foreground/20' />
                    </div>
                  )}
                </div>

                <div className='flex flex-wrap gap-2'>
                  <DropdownMenu
                    open={columnViewOpen}
                    onOpenChange={(open) => {
                      setColumnViewOpen(open);
                      if (open)
                        setColumnVisibilityDraft({ ...columnVisibility });
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        className='flex items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[100px] h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-3'
                      >
                        <SlidersHorizontal className='h-3 w-3 sm:h-4 sm:w-4' />
                        <span className='hidden sm:inline'>View</span>
                        <ChevronDown className='h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='end'
                      className='min-w-[200px] max-h-[50vh] flex flex-col overflow-hidden p-0'
                    >
                      <div className='flex-1 min-h-0 overflow-y-auto p-1'>
                        {/* Reorder coming soon - disabled to avoid native drag UI */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          onClick={() => {
                            setColumnVisibilityDraft({
                              sku: true,
                              glCode: true,
                              image: true,
                              name: true,
                              classification: true,
                              supplier: true,
                              location: true,
                              subLocation: true,
                              unitCost: true,
                              created: true,
                              minQuantityAmount: true,
                              minQuantityUnit: true,
                              orderQuantityAmount: true,
                              orderQuantityUnit: true,
                              orderMethod: true,
                              cardSize: true,
                              notes: true,
                              actions: true,
                              subType: true,
                              useCase: true,
                              department: true,
                              facility: true,
                              cardNotes: true,
                              taxable: true,
                              supplierUrl: true,
                              supplierSku: true,
                              leadTime: true,
                              orderCost: true,
                              cardSizeOption: true,
                              labelSize: true,
                              breadcrumbSize: true,
                              color: true,
                            });
                          }}
                        >
                          Show all
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          onClick={() => {
                            setColumnVisibilityDraft({
                              sku: false,
                              glCode: false,
                              image: false,
                              name: false,
                              classification: false,
                              supplier: false,
                              location: false,
                              subLocation: false,
                              unitCost: false,
                              created: false,
                              minQuantityAmount: false,
                              minQuantityUnit: false,
                              orderQuantityAmount: false,
                              orderQuantityUnit: false,
                              orderMethod: false,
                              cardSize: false,
                              notes: false,
                              actions: false,
                              subType: false,
                              useCase: false,
                              department: false,
                              facility: false,
                              cardNotes: false,
                              taxable: false,
                              supplierUrl: false,
                              supplierSku: false,
                              leadTime: false,
                              orderCost: false,
                              cardSizeOption: false,
                              labelSize: false,
                              breadcrumbSize: false,
                              color: false,
                            });
                          }}
                        >
                          Hide all
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div className='px-2 py-1.5 text-sm font-medium text-muted-foreground'>
                          Show
                        </div>

                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.sku}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              sku: checked,
                            }))
                          }
                        >
                          SKU
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.glCode}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              glCode: checked,
                            }))
                          }
                        >
                          GL Code
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.image}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              image: checked,
                            }))
                          }
                        >
                          Image
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.name}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              name: checked,
                            }))
                          }
                        >
                          Item
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.classification}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              classification: checked,
                            }))
                          }
                        >
                          Classification
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.supplier}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              supplier: checked,
                            }))
                          }
                        >
                          Supplier
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.location}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              location: checked,
                            }))
                          }
                        >
                          Location
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.subLocation}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              subLocation: checked,
                            }))
                          }
                        >
                          Sub-location
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.unitCost}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              unitCost: checked,
                            }))
                          }
                        >
                          Unit Cost
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.created}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              created: checked,
                            }))
                          }
                        >
                          Created
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.orderMethod}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              orderMethod: checked,
                            }))
                          }
                        >
                          Order Method
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.minQuantityAmount}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              minQuantityAmount: checked,
                            }))
                          }
                        >
                          Min Qty
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.minQuantityUnit}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              minQuantityUnit: checked,
                            }))
                          }
                        >
                          Min Unit
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.orderQuantityAmount}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              orderQuantityAmount: checked,
                            }))
                          }
                        >
                          Order Amount
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.orderQuantityUnit}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              orderQuantityUnit: checked,
                            }))
                          }
                        >
                          Order Unit
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.cardSize}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              cardSize: checked,
                            }))
                          }
                        >
                          # of Cards
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.actions}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              actions: checked,
                            }))
                          }
                        >
                          Quick Actions
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.notes}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              notes: checked,
                            }))
                          }
                        >
                          Notes
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.subType}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              subType: checked,
                            }))
                          }
                        >
                          Sub-Type
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.useCase}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              useCase: checked,
                            }))
                          }
                        >
                          Use Case
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.department}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              department: checked,
                            }))
                          }
                        >
                          Department
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.facility}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              facility: checked,
                            }))
                          }
                        >
                          Facility
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.cardNotes}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              cardNotes: checked,
                            }))
                          }
                        >
                          Card Notes
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.taxable}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              taxable: checked,
                            }))
                          }
                        >
                          Taxable
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.supplierUrl}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              supplierUrl: checked,
                            }))
                          }
                        >
                          Supplier URL
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.supplierSku}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              supplierSku: checked,
                            }))
                          }
                        >
                          Supplier SKU
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.leadTime}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              leadTime: checked,
                            }))
                          }
                        >
                          Lead Time
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.orderCost}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              orderCost: checked,
                            }))
                          }
                        >
                          Order Cost
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.cardSizeOption}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              cardSizeOption: checked,
                            }))
                          }
                        >
                          Card Size
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.labelSize}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              labelSize: checked,
                            }))
                          }
                        >
                          Label Size
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.breadcrumbSize}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              breadcrumbSize: checked,
                            }))
                          }
                        >
                          Breadcrumb Size
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onSelect={(e) => e.preventDefault()}
                          checked={columnVisibilityDraft.color}
                          onCheckedChange={(checked) =>
                            setColumnVisibilityDraft((prev) => ({
                              ...prev,
                              color: checked,
                            }))
                          }
                        >
                          Color
                        </DropdownMenuCheckboxItem>
                      </div>
                      <div className='sticky bottom-0 shrink-0 border-t bg-popover p-1.5'>
                        <div className='flex gap-1'>
                          <Button
                            size='sm'
                            className='flex-1'
                            onClick={() => {
                              setColumnVisibility(columnVisibilityDraft);
                              setColumnViewOpen(false);
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            className='flex-1'
                            onClick={() => setColumnViewOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        className='flex items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[140px] h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-3'
                      >
                        <CircleCheckIcon className='h-3 w-3 sm:h-4 sm:w-4' />
                        <span className='hidden sm:inline'>Actions</span>
                        <ChevronDown className='h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='min-w-[220px]'>
                      {/* TODO: Implement export all functionality */}
                      {/* <DropdownMenuItem>Export all…</DropdownMenuItem> */}

                      {/* TODO: Implement publish items functionality */}
                      {/* <DropdownMenuItem>Publish item(s)</DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={() => {
                          if (
                            selectedItems.length === 1 &&
                            selectedItems[0].entityId
                          ) {
                            setSelectedItem(selectedItems[0]);
                            setManagePanelOpen(true);
                            // Don't update URL - keep current page URL
                          }
                        }}
                        disabled={selectedItems.length !== 1}
                        className={
                          selectedItems.length !== 1
                            ? 'text-muted-foreground cursor-not-allowed'
                            : ''
                        }
                      >
                        <span className='flex-1'>Open item</span>
                        {/* <span className='text-xs text-muted-foreground'>
                          ⌘O
                        </span> */}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handlePrintSelectedCards}
                        disabled={isPrintingCards || selectedItems.length === 0}
                      >
                        <span className='flex-1 flex items-center gap-2'>
                          {isPrintingCards ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : null}
                          {isPrintingCards
                            ? 'Printing cards...'
                            : 'Print cards…'}
                        </span>
                        {/* <span className='text-xs text-muted-foreground'>
                          ⌘P
                        </span> */}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handlePrintSelectedLabels}
                        disabled={isPrintingLabels}
                      >
                        <span className='flex-1 flex items-center gap-2'>
                          {isPrintingLabels ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : null}
                          {isPrintingLabels
                            ? 'Printing labels...'
                            : 'Print labels…'}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handlePrintSelectedBreadcrumbs}
                        disabled={isPrintingBreadcrumbs}
                      >
                        <span className='flex-1 flex items-center gap-2'>
                          {isPrintingBreadcrumbs ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : null}
                          {isPrintingBreadcrumbs
                            ? 'Printing breadcrumbs...'
                            : 'Print breadcrumbs…'}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handlePreviewSelectedCards}
                        disabled={isLoadingPreview}
                      >
                        <span className='flex-1 flex items-center gap-2'>
                          {isLoadingPreview ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : null}
                          {isLoadingPreview
                            ? 'Loading cards...'
                            : 'Preview card(s)'}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (selectedItems.length === 0) {
                            toast.error(
                              'Please select at least one item to duplicate',
                            );
                            return;
                          }
                          if (selectedItems.length > 1) {
                            toast.error(
                              'Please select only one item to duplicate',
                            );
                            return;
                          }
                          handleDuplicateItem(selectedItems[0]);
                        }}
                        disabled={
                          selectedItems.length === 0 || selectedItems.length > 1
                        }
                        className={
                          selectedItems.length !== 1
                            ? 'text-muted-foreground cursor-not-allowed'
                            : ''
                        }
                      >
                        <span className='flex-1'>Duplicate item(s)</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className='text-black'
                        onClick={() => {
                          if (selectedItems.length > 0) {
                            handleDeleteMultipleItems(selectedItems);
                          }
                        }}
                        disabled={selectedItems.length === 0}
                      >
                        Delete{' '}
                        {selectedItems.length > 1
                          ? `${selectedItems.length} items`
                          : 'item'}
                        …
                      </DropdownMenuItem>

                      {/* TODO: Implement print labels functionality */}
                      {/* <DropdownMenuItem>
                        <span className='flex-1'>Print label(s)…</span>
                        <span className='text-xs text-muted-foreground'>
                          ⌘P
                        </span>
                      </DropdownMenuItem> */}

                      {/* TODO: Implement add to order queue functionality */}
                      {/* <DropdownMenuItem>
                        <span className='flex-1'>Add to order queue</span>
                        <span className='text-xs text-muted-foreground'>
                          ⌘+
                        </span>
                      </DropdownMenuItem> */}

                      {/* TODO: Implement export selected functionality */}
                      {/* <DropdownMenuItem>Export selected…</DropdownMenuItem> */}

                      {/* TODO: Implement view related tasks functionality */}
                      {/* <DropdownMenuItem>View related tasks</DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className='flex items-center rounded-lg overflow-hidden bg-[#171717] h-9 sm:h-10'>
                    <Button
                      onClick={handleCreateNewItem}
                      className='flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-9 sm:h-10 bg-[var(--base-primary)] text-[#FAFAFA] text-xs sm:text-[14px] font-medium font-geist rounded-none hover:bg-[#0f0f0]'
                    >
                      <Plus className='h-3 w-3 sm:h-4 sm:w-4 text-[#FAFAFA]' />
                      <span className='hidden sm:inline'>Add item</span>
                      <span className='sm:hidden'>Add</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className='w-9 h-9 sm:w-10 sm:h-10 px-0 bg-[var(--base-primary)] text-[#FAFAFA] rounded-none hover:bg-[var(--base-primary)] border-l border-[#FAFAFA]'
                          aria-label='Open item options'
                        >
                          <ChevronDown className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='min-w-[200px]'
                      >
                        <DropdownMenuItem>Scan new items</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setImportModalOpen(true)}
                        >
                          <span className='flex-1'>Import items…</span>
                          {/* <span className='text-xs text-muted-foreground'>
                            ⌘⇧I
                          </span> */}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className='flex-1 w-full min-h-0'>
                <ItemTableAGGrid
                  ref={itemsGridRef}
                  items={getItems()}
                  activeTab={activeTab}
                  columnVisibility={columnVisibility}
                  onRefreshRequested={refreshCurrentPage}
                  onAuthError={handleAuthError}
                  onUnsavedChangesChange={setHasUnsavedChanges}
                  isUnsavedModalOpen={showUnsavedModal}
                  onColumnVisibilityChange={(newVisibility) => {
                    setColumnVisibility(newVisibility);
                  }}
                  hasActiveSearch={
                    debouncedSearch.trim().length > 0 &&
                    getItems().length === 0 &&
                    !loadingArdaItems
                  }
                  emptyStateComponent={
                    <div
                      className='w-full flex flex-col items-center box-border px-6 py-6 sm:px-10 md:px-24 lg:px-32 rounded-[10px]'
                      style={{
                        border: '1px dashed #E5E5E5',
                        borderStyle: 'dashed',
                        borderWidth: '1px',
                        borderColor: '#E5E5E5',
                        borderRadius: '20px',
                        gap: '24px',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 1,
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <div className='flex flex-col items-center gap-2 w-full'>
                        <div className='w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2 relative'>
                          <div className='absolute inset-0 flex items-center justify-center z-0'>
                            <Image
                              src='/images/Puddle1.svg'
                              alt=''
                              width={75}
                              height={48.6}
                              className='w-full h-full object-contain'
                            />
                          </div>
                          <Dock className='w-[42px] h-[42px] sm:w-[52px] sm:h-[52px] text-[#0A0A0A] absolute left-[calc(50%-21px)] sm:left-[calc(50%-26px)] top-[20%] z-10' />
                        </div>
                        <h2 className='text-lg sm:text-xl font-semibold text-[#0A0A0A] leading-7 text-center'>
                          No items... yet
                        </h2>
                        <p className='text-xs sm:text-sm text-[#737373] leading-5 text-center'>
                          Let&apos;s create some!
                        </p>
                      </div>
                      <div
                        className='flex flex-col sm:flex-row items-stretch sm:items-center justify-center w-full'
                        style={{ gap: '12px' }}
                      >
                        <Button
                          className='h-9 bg-[#FC5A29] text-[#FAFAFA] hover:bg-[#FC5A29] font-geist shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2 text-sm sm:text-base w-full sm:w-auto'
                          onClick={handleCreateNewItem}
                        >
                          Add item
                        </Button>
                        <button
                          className='h-9 bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2 text-xs sm:text-sm leading-5 font-geist flex items-center justify-center box-border w-full sm:w-auto'
                          onClick={() => setImportModalOpen(true)}
                        >
                          <span className='leading-5'>Import items...</span>
                        </button>
                      </div>
                    </div>
                  }
                  onOpenItemDetails={(item: items.Item) => {
                    if (!item?.entityId) {
                      toast.error(
                        'Cannot open item details: missing entity ID',
                      );
                      return;
                    }
                    setSelectedItem(item);
                    setManagePanelOpen(true);
                  }}
                  onSelectionChange={(newSelectedItems) => {
                    // Update the persistent map with new selections
                    const currentPageItemIds = new Set(
                      ardaItems.map((item) => item.entityId).filter(Boolean),
                    );

                    // Remove items from current page that are no longer selected
                    currentPageItemIds.forEach((entityId) => {
                      const isStillSelected = newSelectedItems.some(
                        (item) => item.entityId === entityId,
                      );
                      if (!isStillSelected) {
                        selectedItemsMapRef.current.delete(entityId);
                      }
                    });

                    // Add or update selected items from current page
                    newSelectedItems.forEach((item) => {
                      if (item.entityId) {
                        selectedItemsMapRef.current.set(item.entityId, item);
                      }
                    });

                    // Update state with all selected items
                    const allSelectedItems = Array.from(
                      selectedItemsMapRef.current.values(),
                    );
                    setSelectedItems(allSelectedItems);
                  }}
                  totalSelectedCount={selectedItems.length}
                  maxItemsSeen={maxItemsSeen}
                  paginationData={paginationData}
                  onNextPage={handleNextPage}
                  onPreviousPage={handlePreviousPage}
                  onFirstPage={handleFirstPage}
                  isLoading={loadingArdaItems}
                  itemCardsMap={itemCardsMap}
                  ensureCardsForItem={ensureCardsForItem}
                  refreshCardsForItem={refreshCardsForItem}
                />
              </div>

              {/* Minimal spacer below the table (~10px) */}
              <div style={{ height: 10 }} />
            </>
          )}
          <ImportItemsModal
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            onRefresh={() => {
              // Calculate index: (currentPage - 1) * pageSize
              const currentPageIndex =
                (paginationData.currentPage - 1) *
                paginationData.currentPageSize;
              fetchArdaItems(
                paginationData.currentPageSize,
                currentPageIndex,
                debouncedSearch,
              );
            }}
          />
          <ItemFormPanel
            isOpen={panelOpen}
            onClose={handleClosePanel}
            onCancel={handleCancelEdit}
            itemToEdit={itemToEdit || itemToDuplicate}
            onPublishAndAddAnotherFromEdit={handlePublishAndAddAnotherFromEdit}
            onPublishAndAddAnotherFromAddItem={
              handlePublishAndAddAnotherFromAddItem
            }
            onSuccess={async () => {
              const currentPageIndex =
                (paginationData.currentPage - 1) *
                paginationData.currentPageSize;
              const freshItems = await fetchArdaItems(
                paginationData.currentPageSize,
                currentPageIndex,
                debouncedSearch,
              );
              setPanelOpen(false);
              setItemToEdit(null);
              setItemToDuplicate(null);
              const entityIdToRefresh = selectedItem?.entityId;
              if (entityIdToRefresh && Array.isArray(freshItems)) {
                const updatedItem = freshItems.find(
                  (item) => item.entityId === entityIdToRefresh,
                );
                if (updatedItem) {
                  setSelectedItem(updatedItem);
                }
                setManagePanelOpen(true);
              }
            }}
            isDuplicating={!!itemToDuplicate}
          />
          <ItemDetailsPanel
            item={selectedItem ? convertItemToItemCard(selectedItem) : mockItem}
            isOpen={managePanelOpen}
            onClose={async () => {
              setManagePanelOpen(false);
              // Refresh cards for the selected item if it exists
              if (selectedItem?.entityId) {
                await refreshCardsForItem(selectedItem.entityId);
              }
              // Don't change URL - keep the current URL (whether /items or /item/[itemId])
            }}
            onOpenChange={() => {
              setSelectedItem(null);
            }}
            onEditItem={() => {
              if (selectedItem) {
                setItemToEdit(selectedItem);
                setManagePanelOpen(false);
                setPanelOpen(true);
              }
            }}
            onDuplicateItem={() => {
              if (selectedItem) {
                handleDuplicateItem(selectedItem);
                setManagePanelOpen(false);
              }
            }}
          />
          {previewItem && (
            <CardsPreviewModal
              isOpen={previewModalOpen}
              onClose={() => setPreviewModalOpen(false)}
              item={previewItem}
              cards={previewCards}
              cardList={previewCardList}
            />
          )}
          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting || isBulkDeleting || isLoadingCardsToDelete}
            title={
              itemsToDelete.length > 1
                ? `Delete ${itemsToDelete.length} items?`
                : 'You sure about that?'
            }
            message={
              isLoadingCardsToDelete
                ? 'Loading cards...'
                : (() => {
                    const itemsToDeleteList = itemToDelete
                      ? [itemToDelete]
                      : itemsToDelete;
                    const totalCards = Object.values(cardsToDeleteMap).reduce(
                      (sum, cards) => sum + cards.length,
                      0,
                    );

                    if (itemsToDeleteList.length > 1) {
                      return totalCards > 0
                        ? `Delete it like you mean it! Deleting ${
                            itemsToDeleteList.length
                          } items will also remove all ${totalCards} associated card${
                            totalCards > 1 ? 's' : ''
                          }, so make sure you're ready to say goodbye forever.`
                        : `Delete it like you mean it! Deleting ${itemsToDeleteList.length} items will also remove all of their cards, so make sure you're ready to say goodbye forever.`;
                    } else {
                      return totalCards > 0
                        ? `Delete it like you mean it! Deleting this item will also remove all ${totalCards} associated card${
                            totalCards > 1 ? 's' : ''
                          }, so make sure you're ready to say goodbye forever.`
                        : "Delete it like you mean it! Deleting an item also removes all of its cards, so make sure you're ready to say goodbye forever.";
                    }
                  })()
            }
            confirmText={itemsToDelete.length > 1 ? 'Delete all' : 'Delete it'}
          />
          <UnsavedChangesModal
            isOpen={showUnsavedModal}
            onClose={() => {
              setShowUnsavedModal(false);
              pendingNavigateRef.current = null;
            }}
            onSave={async () => {
              setIsSavingUnsaved(true);
              try {
                await itemsGridRef.current?.saveAllDrafts();
                setShowUnsavedModal(false);
                if (pendingNavigateRef.current) {
                  router.push(pendingNavigateRef.current);
                  pendingNavigateRef.current = null;
                }
              } catch {
                // saveAllDrafts failed; publishRow already showed toast, keep modal open
              } finally {
                setIsSavingUnsaved(false);
              }
            }}
            onLeaveWithoutSaving={() => {
              const url = pendingNavigateRef.current;
              setShowUnsavedModal(false);
              pendingNavigateRef.current = null;
              itemsGridRef.current?.discardAllDrafts();
              if (url) router.push(url);
            }}
            isLoading={isSavingUnsaved}
            title='You have unsaved changes'
            message='If you leave now, your changes will not be saved. Do you want to save before leaving?'
            saveText='Save'
            continueEditingText='Continue editing'
            leaveWithoutSavingText='Leave without saving'
          />
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
