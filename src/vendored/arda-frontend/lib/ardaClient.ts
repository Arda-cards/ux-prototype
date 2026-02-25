import * as items from '@frontend/types/items';
import * as ardaApi from '@frontend/types/arda-api';
import * as kanban from '@frontend/types/kanban';
import {
  mapItemToArdaCreateRequest,
  mapItemToArdaUpdateRequest,
  mapArdaItemToItem,
} from './mappers/ardaMappers';
import { ensureValidTokens } from './tokenRefresh';
import { handleAuthError } from './authErrorHandler';
import { isAuthenticationError } from './utils';
import { store } from '@frontend/store/store';
import { selectAccessToken, selectIdToken } from '@frontend/store/selectors/authSelectors';

/**
 * Maps OrderMechanism to the order method string used in the UI
 */
function mapOrderMechanismToOrderMethod(
  orderMechanism: string
):
  | 'Online'
  | 'Purchase order'
  | 'Phone'
  | 'Email'
  | 'In store'
  | 'Request for quotation (RFQ)'
  | 'Production'
  | '3rd party' {
  switch (orderMechanism) {
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
}

/**
 * Formats quantity for display
 */
function formatQuantity(quantity?: items.Quantity): string {
  if (!quantity) return '1 each';
  return `${quantity.amount} ${quantity.unit}`;
}

/**
 * Gets the JWT token from the Redux store for API requests with validation.
 * NOTE: We use access token for validation but ID token for user context.
 * Includes automatic token refresh before API calls.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  // Read tokens from Redux store (single source of truth)
  let accessToken = selectAccessToken(store.getState());
  let idToken = selectIdToken(store.getState());

  if (!accessToken) {
    console.error('[CLIENT] No access token found in Redux store');
    const error = new Error('No authentication token found. Please sign in.');
    handleAuthError(error);
    throw error;
  }

  if (!idToken) {
    console.error('[CLIENT] No ID token found in Redux store');
    const error = new Error('No ID token found. Please sign in again.');
    handleAuthError(error);
    throw error;
  }

  // Basic token format validation (3 parts separated by dots)
  if (accessToken.split('.').length !== 3) {
    console.error('[CLIENT] Invalid access token format - not 3 parts');
    const error = new Error('Invalid authentication token. Please sign in again.');
    handleAuthError(error);
    throw error;
  }

  if (idToken.split('.').length !== 3) {
    console.error('[CLIENT] Invalid ID token format - not 3 parts');
    const error = new Error('Invalid ID token. Please sign in again.');
    handleAuthError(error);
    throw error;
  }

  // Check access token expiration with 2-minute buffer
  try {
    const accessPayload = JSON.parse(atob(accessToken.split('.')[1]));
    const now = Date.now() / 1000;
    const twoMinutesBuffer = 2 * 60;

    if (accessPayload.exp && accessPayload.exp < now + twoMinutesBuffer) {
      console.warn(
        '[CLIENT] Access token expired or expiring soon, attempting refresh'
      );
      const refreshSuccess = await ensureValidTokens(accessToken);
      if (!refreshSuccess) {
        console.error('[CLIENT] Token refresh failed');
        const error = new Error(
          'Authentication token has expired. Please sign in again.'
        );
        handleAuthError(error);
        throw error;
      }
      // Re-read refreshed tokens from Redux store
      accessToken = selectAccessToken(store.getState());
      idToken = selectIdToken(store.getState());
      console.log(
        '[CLIENT] Tokens refreshed successfully, continuing with request'
      );
    }
  } catch (error) {
    console.error('[CLIENT] Error checking token expiration:', error);
    if (error instanceof Error && isAuthenticationError(error)) {
      handleAuthError(error);
      throw error;
    }
    const authError = new Error('Invalid authentication token. Please sign in again.');
    handleAuthError(authError);
    throw authError;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'X-ID-Token': idToken!,
  };
}

/**
 * Enhanced error handling for API responses
 */
async function handleApiResponse<T>(
  response: Response,
  operation: string
): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `${operation} failed: ${response.status}`;
    let parsedBody: Record<string, unknown> | null = null;

    try {
      // Clone the response to read it without consuming it
      const responseClone = response.clone();
      if (contentType?.includes('application/json')) {
        parsedBody = await responseClone.json();
        console.error(`[handleApiResponse] ${operation} error body:`, parsedBody);
        const bodyError =
          parsedBody &&
            typeof (parsedBody as { error?: unknown }).error === 'string'
            ? (parsedBody as { error?: string }).error
            : undefined;
        const bodyMessage =
          parsedBody &&
            typeof (parsedBody as { message?: unknown }).message === 'string'
            ? (parsedBody as { message?: string }).message
            : undefined;
        const bodyDetails =
          parsedBody &&
            typeof (parsedBody as { details?: unknown }).details === 'string'
            ? (parsedBody as { details?: string }).details
            : undefined;
        let bodyResponseMessage: string | undefined;
        if (parsedBody) {
          if (typeof (parsedBody as { responseMessage?: unknown }).responseMessage === 'string') {
            bodyResponseMessage = (parsedBody as { responseMessage?: string }).responseMessage;
          } else if (
            typeof (parsedBody as { data?: unknown }).data === 'object' &&
            parsedBody.data !== null
          ) {
            const dataObj = parsedBody.data as Record<string, unknown>;
            if (typeof dataObj.responseMessage === 'string') {
              bodyResponseMessage = dataObj.responseMessage;
            } else if (
              typeof dataObj.details === 'object' &&
              dataObj.details !== null &&
              typeof (dataObj.details as { cause?: unknown }).cause === 'object' &&
              (dataObj.details as { cause?: unknown }).cause !== null
            ) {
              const causeObj = (dataObj.details as { cause?: Record<string, unknown> }).cause;
              if (typeof causeObj?.responseMessage === 'string') {
                bodyResponseMessage = causeObj.responseMessage;
              }
            }
          }
        }
        errorMessage = bodyResponseMessage || bodyError || bodyMessage || bodyDetails || errorMessage;
      } else {
        const errorText = await responseClone.text();
        console.error(`[handleApiResponse] ${operation} error text:`, errorText);
        // Try to parse as JSON (some proxies strip Content-Type; our API always returns JSON)
        try {
          const parsed = JSON.parse(errorText) as Record<string, unknown>;
          if (parsed && typeof parsed === 'object') {
            const pe = typeof parsed.error === 'string' ? parsed.error : undefined;
            const pm = typeof parsed.message === 'string' ? parsed.message : undefined;
            const pd = parsed.data && typeof (parsed.data as Record<string, unknown>).responseMessage === 'string'
              ? (parsed.data as { responseMessage: string }).responseMessage
              : undefined;
            errorMessage = pd || pe || pm || errorText || errorMessage;
          } else {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch (e) {
      console.error(`[handleApiResponse] Error parsing response:`, e);
      // If we can't parse the error, use the default message
    }

    // Handle 401 only if it looks like an auth/JWT failure from our API layer
    // Upstream ARDA 401s (e.g., missing ARDA_API_KEY) should NOT clear user tokens
    if (response.status === 401) {
      const errorField = (parsedBody as { error?: unknown } | null)?.error;
      const bodyMsg =
        typeof errorField === 'string' ? errorField.toLowerCase() : '';
      const looksLikeJwtFailure =
        bodyMsg.includes('jwt') ||
        bodyMsg.includes('authentication required') ||
        bodyMsg.includes('no jwt token') ||
        bodyMsg.includes('invalid or expired');

      if (looksLikeJwtFailure) {
        const error = new Error('Authentication expired. Please sign in again.');
        handleAuthError(error);
        throw error;
      }

      // Otherwise, propagate the upstream 401 without clearing auth
      throw new Error(errorMessage);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.ok || !data.data) {
    const errorMessage = `${operation} failed: ${data.error || 'Unknown error'}`;
    const error = new Error(errorMessage);

    // Check if the error message indicates an auth failure
    if (isAuthenticationError(errorMessage)) {
      handleAuthError(error);
    }

    throw error;
  }

  return data.data;
}

/**
 * Creates a new item via ARDA API
 * @param item Partial item data using our internal types
 * @returns Promise resolving to the created item
 */
export async function createItem(
  item: Partial<items.Item>
): Promise<items.Item> {
  const payload = mapItemToArdaCreateRequest(item);

  const response = await fetch('/api/arda/items', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const ardaItem = await handleApiResponse<ardaApi.ArdaItem>(
    response,
    'Create item'
  );
  return mapArdaItemToItem(ardaItem);
}

/**
 * Queries items from ARDA API with pagination
 * @param request Query parameters
 * @returns Promise resolving to query response with mapped items
 */
export async function queryItems(
  request: ardaApi.ArdaQueryItemsRequest
): Promise<{
  items: items.Item[];
  pagination: {
    thisPage: string;
    nextPage: string;
    previousPage: string;
  };
}> {
  const response = await fetch('/api/arda/items/query', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(request),
  });

  const queryResult = await handleApiResponse<
    ardaApi.ArdaQueryResponse<ardaApi.ArdaItemPayload>
  >(response, 'Query items');

  const mappedItems = queryResult.results.map((result) =>
    mapArdaItemToItem({ ...result, payload: result.payload })
  );

  return {
    items: mappedItems,
    pagination: {
      thisPage: queryResult.thisPage,
      nextPage: queryResult.nextPage,
      previousPage: queryResult.previousPage,
    },
  };
}

/**
 * Fetches a single item by its entity ID from ARDA API
 * @param entityId The entity ID of the item to fetch
 * @returns Promise resolving to the item
 */
export async function getItemById(entityId: string): Promise<items.Item> {
  if (!entityId) {
    throw new Error('Entity ID is required');
  }

  const response = await fetch(
    `/api/arda/items/${encodeURIComponent(entityId)}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const ardaItem = await handleApiResponse<ardaApi.ArdaItem>(
    response,
    'Get item by ID'
  );
  return mapArdaItemToItem(ardaItem);
}

/**
 * Creates a draft version of an existing item
 * @param createdItemId The entity ID of the item to create a draft for
 * @returns Promise resolving to the draft item
 */
export async function createDraftItem(
  createdItemId: string
): Promise<items.Item> {
  if (!createdItemId) {
    throw new Error('Created item ID is required');
  }

  const response = await fetch(
    `/api/arda/items/${encodeURIComponent(createdItemId)}/draft`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const ardaItem = await handleApiResponse<ardaApi.ArdaItem | ardaApi.ArdaDraftItem>(
    response,
    'Create draft item'
  );


  const mapped = mapArdaItemToItem(ardaItem);
  return mapped;
}

/**
 * Lookup supplier names by fuzzy match from ARDA API
 * @param name Search string (fuzzy match)
 * @param effectiveasof Optional timestamp
 * @param recordedasof Optional timestamp
 * @returns Promise resolving to array of supplier name strings
 */
export async function lookupSuppliers(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-suppliers?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup suppliers failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.suppliers)) {
    return data.suppliers.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Lookup unit names by fuzzy match from ARDA API
 * @param name Search string (fuzzy match)
 * @param effectiveasof Optional timestamp
 * @param recordedasof Optional timestamp
 * @returns Promise resolving to array of unit names
 */
export async function lookupUnits(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-units?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup units failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.units)) {
    return data.units.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Lookup item type names by fuzzy match from ARDA API
 */
export async function lookupTypes(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-types?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup types failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.types)) {
    return data.types.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Lookup item subtype names by fuzzy match from ARDA API
 */
export async function lookupSubtypes(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-subtypes?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup subtypes failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.subtypes)) {
    return data.subtypes.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Lookup item use case names by fuzzy match from ARDA API
 */
export async function lookupUseCases(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-usecases?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup use cases failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.useCases)) {
    return data.useCases.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Lookup facility names by fuzzy match from ARDA API
 */
export async function lookupFacilities(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-facilities?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup facilities failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.facilities)) {
    return data.facilities.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Lookup department names by fuzzy match from ARDA API
 */
export async function lookupDepartments(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-departments?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup departments failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.departments)) {
    return data.departments.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Lookup location names by fuzzy match from ARDA API
 */
export async function lookupLocations(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-locations?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup locations failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.locations)) {
    return data.locations.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Lookup sublocation names by fuzzy match from ARDA API
 */
export async function lookupSublocations(
  name: string,
  effectiveasof?: string,
  recordedasof?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (effectiveasof) params.set('effectiveasof', effectiveasof);
  if (recordedasof) params.set('recordedasof', recordedasof);

  const response = await fetch(
    `/api/arda/items/lookup-sublocations?${params.toString()}`,
    {
      method: 'GET',
      headers: await getAuthHeaders(),
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json?.error || `Lookup sublocations failed: ${response.status}`
    );
  }

  const data = json?.data;
  if (Array.isArray(data)) {
    return data.filter((x: unknown) => typeof x === 'string');
  }
  if (data && Array.isArray(data.sublocations)) {
    return data.sublocations.filter((x: unknown) => typeof x === 'string');
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
      .map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name?: string })?.name
      )
      .filter(Boolean);
  }
  return [];
}

/**
 * Updates an existing item via ARDA API
 * @param entityId The entity ID of the item to update
 * @param item Partial item data using our internal types
 * @returns Promise resolving to the updated item
 */
export async function updateItem(
  entityId: string,
  item: Partial<items.Item>
): Promise<items.Item> {
  if (!entityId) {
    throw new Error('Entity ID is required');
  }

  const payload = mapItemToArdaUpdateRequest(item);

  const response = await fetch(
    `/api/arda/items/${encodeURIComponent(entityId)}`,
    {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[updateItem] Error response for entityId ${entityId}:`, errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { raw: errorText };
    }
    console.error('[updateItem] Parsed error data:', errorData);
    console.error(`[updateItem] Failed to update entityId: ${entityId}`);
  }

  const ardaItem = await handleApiResponse<ardaApi.ArdaItem>(
    response,
    'Update item'
  );
  return mapArdaItemToItem(ardaItem);
}

/**
 * Fetches order queue data from ARDA API
 * @returns Promise resolving to order queue data grouped by supplier
 */
export async function getOrderQueue(): Promise<{
  groups: Array<{
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
    items: Array<{
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
      | 'Ordered'
      | 'In transit'
      | 'Received';
      supplier: string;
      orderedAt?: string;
    }>;
    expanded: boolean;
  }>;
}> {
  try {
    // Query items that are ready to order or in progress
    const queryResponse = await queryItems({
      filter: true,
      paginate: {
        index: 0,
        size: 100,
      },
    });

    // Group items by supplier
    const supplierGroups = new Map<
      string,
      {
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
        items: Array<{
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
          | 'Ordered'
          | 'In transit'
          | 'Received';
          supplier: string;
          orderedAt?: string;
        }>;
        expanded: boolean;
      }
    >();

    queryResponse.items.forEach((item) => {
      const supplier = item.primarySupply?.supplier || 'Unknown Supplier';
      const orderMethod = item.primarySupply?.orderMechanism || 'ONLINE';

      if (!supplierGroups.has(supplier)) {
        supplierGroups.set(supplier, {
          name: supplier,
          orderMethod: mapOrderMechanismToOrderMethod(orderMethod),
          items: [],
          expanded: true,
        });
      }

      const group = supplierGroups.get(supplier)!;
      group.items.push({
        id: item.entityId || '',
        name: item.name || '',
        quantity: formatQuantity(item.primarySupply?.orderQuantity),
        orderMethod: mapOrderMechanismToOrderMethod(orderMethod),
        status: 'Ready to order', // Default status since Item doesn't have status
        supplier: supplier,
        orderedAt: undefined, // Item doesn't have orderedAt
      });
    });

    return {
      groups: Array.from(supplierGroups.values()),
    };
  } catch (error) {
    console.error('Error fetching order queue:', error);
    throw new Error('Failed to fetch order queue data');
  }
}

/**
 * Creates a new kanban card via ARDA API
 * @param request The kanban card creation request
 * @returns Promise resolving to the created kanban card
 */
export async function createKanbanCard(
  request: kanban.CreateKanbanCardRequest
): Promise<kanban.CreateKanbanCardResponse> {
  const response = await fetch('/api/arda/kanban/kanban-card', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(request),
  });

  const kanbanCard = await handleApiResponse<kanban.CreateKanbanCardResponse>(
    response,
    'Create kanban card'
  );
  return kanbanCard;
}

/**
 * Fetches a single kanban card by ID
 */
export async function getKanbanCard(cardId: string): Promise<{
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
      locator?: {
        facility: string;
        location: string;
      };
      notes: string;
      cardNotesDefault: string;
      primarySupply: {
        supplier: string;
        orderQuantity: {
          amount: number;
          unit: string;
        };
        unitCost: {
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
}> {
  console.log('[CLIENT] Fetching kanban card:', cardId);

  const response = await fetch(`/api/arda/kanban/kanban-card/${cardId}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const result = await response.json();
  console.log('[CLIENT] Kanban card response:', result);

  // Check for auth errors
  if (!response.ok || !result.ok) {
    const errorMessage = result.error || 'Failed to fetch kanban card';
    const error = new Error(errorMessage);

    // Handle 401 or auth-related errors
    if (response.status === 401 || isAuthenticationError(errorMessage)) {
      handleAuthError(error);
    }

    throw error;
  }

  // Handle the case where the API returns a records array
  const data = result.data;
  if (data?.records && Array.isArray(data.records) && data.records.length > 0) {
    return data.records[0]; // Return the first record
  }

  return result.data;
}

/**
 * Queries kanban card details by item ID
 * @param request Query parameters with filter and pagination
 * @returns Promise resolving to kanban card details response
 */
export async function queryKanbanCardDetailsByItem(
  request: kanban.QueryKanbanCardDetailsByItemRequest
): Promise<kanban.KanbanCardResponse> {
  const response = await fetch(
    '/api/arda/kanban/kanban-card/query-details-by-item',
    {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(request),
    }
  );

  const result = await response.json();
  console.log('[CLIENT] Kanban card details by item response:', result);

  // Check for auth errors
  if (!response.ok || !result.ok) {
    const errorMessage = result.error || 'Failed to query kanban card details by item';
    const error = new Error(errorMessage);

    // Handle 401 or auth-related errors
    if (response.status === 401 || isAuthenticationError(errorMessage)) {
      handleAuthError(error);
    }

    throw error;
  }

  return result.data;
}
