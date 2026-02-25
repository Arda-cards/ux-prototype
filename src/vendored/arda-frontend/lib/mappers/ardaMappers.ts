import * as items from '@frontend/types/items';
import * as domain from '@frontend/types/domain';
import * as general from '@frontend/types/general';
import * as ardaApi from '@frontend/types/arda-api';

/**
 * Maps ARDA API order method to our internal OrderMechanism enum
 */
function mapOrderMethod(orderMethod?: string): items.OrderMechanism {
  switch (orderMethod) {
    case 'PURCHASE_ORDER':
      return 'PURCHASE_ORDER';
    case 'EMAIL':
      return 'EMAIL';
    case 'PHONE':
      return 'PHONE';
    case 'IN_STORE':
      return 'IN_STORE';
    case 'ONLINE':
      return 'ONLINE';
    case 'RFQ':
      return 'RFQ';
    case 'PRODUCTION':
      return 'PRODUCTION';
    case 'THIRD_PARTY':
      return 'THIRD_PARTY';
    default:
      return 'OTHER';
  }
}

/**
 * Maps ARDA API currency to our internal Currency type
 */
function mapCurrency(currency?: string): domain.Currency {
  switch (currency) {
    case 'USD':
    case 'CAD':
    case 'EUR':
    case 'GBP':
    case 'JPY':
    case 'AUD':
    case 'CNY':
    case 'INR':
    case 'RUB':
    case 'BRL':
    case 'ZAR':
    case 'MXN':
    case 'KRW':
    case 'SGD':
    case 'HKD':
    case 'NZD':
    case 'CHF':
      return currency;
    default:
      return domain.defaultCurrency;
  }
}

/**
 * Maps ARDA API time unit to our internal TimeUnit
 */
function mapTimeUnit(unit?: string): general.TimeUnit {
  switch (unit?.toUpperCase()) {
    case 'SECOND':
      return 'SECOND';
    case 'MINUTE':
      return 'MINUTE';
    case 'HOUR':
      return 'HOUR';
    case 'DAY':
      return 'DAY';
    case 'WEEK':
      return 'WEEK';
    default:
      return general.defaultTimeUnit;
  }
}

/**
 * Maps ARDA API card size to our internal CardSize
 */
function mapCardSize(size?: string): items.CardSize {
  switch (size?.toUpperCase()) {
    case 'SMALL':
      return 'SMALL';
    case 'MEDIUM':
      return 'MEDIUM';
    case 'LARGE':
      return 'LARGE';
    case 'EXTRA_LARGE':
    case 'X_LARGE':
      return 'X_LARGE';
    default:
      return items.defaultCardSize;
  }
}

/**
 * Maps ARDA API label size to our internal LabelSize
 */
function mapLabelSize(size?: string): items.LabelSize {
  switch (size?.toUpperCase()) {
    case 'SMALL':
      return 'SMALL';
    case 'MEDIUM':
      return 'MEDIUM';
    case 'LARGE':
      return 'LARGE';
    case 'EXTRA_LARGE':
    case 'X_LARGE':
      return 'X_LARGE';
    default:
      return items.defaultLabelSize;
  }
}

/**
 * Maps ARDA API breadcrumb size to our internal BreadcrumbSize
 */
function mapBreadcrumbSize(size?: string): items.BreadcrumbSize {
  switch (size?.toUpperCase()) {
    case 'SMALL':
      return 'SMALL';
    case 'MEDIUM':
      return 'MEDIUM';
    case 'LARGE':
      return 'LARGE';
    case 'EXTRA_LARGE':
    case 'X_LARGE':
      return 'X_LARGE';
    default:
      return items.defaultBreadcrumbSize;
  }
}

/**
 * Maps ARDA API item color to our internal ItemColor
 */
function mapItemColor(color?: string): items.ItemColor {
  switch (color?.toUpperCase()) {
    case 'RED':
    case 'GREEN':
    case 'BLUE':
    case 'YELLOW':
    case 'BLACK':
    case 'WHITE':
    case 'GRAY':
    case 'ORANGE':
    case 'PURPLE':
    case 'PINK':
      return color.toUpperCase() as items.ItemColor;
    default:
      return items.defaultItemColor;
  }
}

/**
 * Maps ARDA API supply object to our internal Supply type
 */
function mapSupply(
  supply?: ardaApi.ArdaItemPayload['primarySupply']
): items.Supply | undefined {
  if (!supply) return undefined;

  const unitCost: domain.Money = supply.unitCost
    ? {
      value: supply.unitCost.value,
      currency: mapCurrency(supply.unitCost.currency),
    }
    : domain.defaultMoney;

  const orderQuantity: items.Quantity = supply.orderQuantity
    ? {
      amount: supply.orderQuantity.amount,
      unit: supply.orderQuantity.unit,
    }
    : items.defaultQuantity;

  const minimumQuantity: items.Quantity = supply.minimumQuantity
    ? {
      amount: supply.minimumQuantity.amount,
      unit: supply.minimumQuantity.unit,
    }
    : items.defaultQuantity;

  const averageLeadTime: general.Duration = supply.averageLeadTime
    ? {
      length: supply.averageLeadTime.length,
      unit: mapTimeUnit(supply.averageLeadTime.unit),
    }
    : general.defaultDuration;

  return {
    supplyEId: supply.supplyEId,
    supplier: supply.supplier,
    name: supply.name,
    sku: supply.sku,
    orderMechanism: mapOrderMethod(supply.orderMethod),
    url: supply.url,
    minimumQuantity,
    orderQuantity,
    unitCost,
    averageLeadTime,
    orderCost: unitCost, // For now, using unitCost as orderCost
  };
}

/**
 * Converts ARDA Item payload to our internal Item type
 * This is the main mapper for transforming ARDA API responses to our domain types
 */
export function mapArdaItemToItem(
  ardaItem: ardaApi.ArdaItem | ardaApi.ArdaDraftItem
): items.Item {
  // Handle different response structures for regular items vs drafts
  let payload: ardaApi.ArdaItemPayload;
  let entityId: string;
  let recordId: string;
  let author: string;
  let asOf: { effective: number; recorded: number };

  if ('payload' in ardaItem) {
    // Regular item response
    payload = ardaItem.payload;
    entityId = payload.eId;
    recordId = ardaItem.rId;
    author = ardaItem.author;
    asOf = ardaItem.asOf;
  } else {
    // Draft item response
    payload = ardaItem.value;
    // For drafts, check if the payload has an eId (the draft's actual entityId)
    // If not, use the entityId from the draft item structure
          // The entityId field in ArdaDraftItem might be the original item's entityId,
          // so we should prefer payload.eId if available
          if (payload?.eId) {
            entityId = payload.eId;
          } else {
            entityId = ardaItem.entityId;
          }
    recordId = ardaItem.entityId; // Draft items might not have rId
    author = ardaItem.author;
    asOf = { effective: Date.now(), recorded: Date.now() }; // Default timestamps for drafts
  }

  const result = {
    // Entity fields
    entityId: entityId,
    recordId: recordId,
    author: author,
    timeCoordinates: {
      recordedAsOf: asOf.recorded,
      effectiveAsOf: asOf.effective,
    },
    createdCoordinates: {
      recordedAsOf: asOf.recorded,
      effectiveAsOf: asOf.effective,
    },

    // Item fields
    name: payload.name,
    imageUrl: payload.imageUrl,
    classification: payload.classification
      ? {
        type: payload.classification.type,
        subType: payload.classification.subType,
      }
      : undefined,
    useCase: payload.useCase,
    locator: payload.locator
      ? {
          facility: payload.locator.facility,
          department: payload.locator.department,
          location: payload.locator.location,
          subLocation: payload.locator.subLocation,
        }
      : undefined,
    internalSKU:
      payload.internalSKU ??
      (payload as unknown as { sku?: string }).sku,
    generalLedgerCode: payload.generalLedgerCode ?? payload.glCode,
    minQuantity: payload.minQuantity
      ? {
        amount: payload.minQuantity.amount,
        unit: payload.minQuantity.unit,
      }
      : undefined,
    notes: payload.notes,
    cardNotesDefault: payload.cardNotesDefault,
    taxable: payload.taxable,
    primarySupply: mapSupply(payload.primarySupply),
    secondarySupply: mapSupply(payload.secondarySupply),
    defaultSupply: payload.defaultSupply,
    cardSize: mapCardSize(payload.cardSize),
    labelSize: mapLabelSize(payload.labelSize),
    breadcrumbSize: mapBreadcrumbSize(payload.breadcrumbSize),
    color: mapItemColor(payload.itemColor),
  };

  return result;
}

/**
 * Converts our internal Item type to ARDA Create Item request payload
 * This is used when sending data to the ARDA API
 */
export function mapItemToArdaCreateRequest(
  item: Partial<items.Item>
): ardaApi.ArdaCreateItemRequest {
  const payload = {
    name: item.name || '',
    imageUrl:
      item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : undefined,
    classification: item.classification
      ? {
        type: item.classification.type,
        subType: item.classification.subType,
      }
      : undefined,
    useCase: item.useCase,
    locator: (() => {
      const l = item.locator;
      return {
        facility: l?.facility ?? '',
        department: l?.department ?? '',
        location: l?.location ?? '',
        subLocation: l?.subLocation ?? '',
      };
    })(),
    internalSKU: item.internalSKU,
    generalLedgerCode: item.generalLedgerCode?.trim() || undefined,
    glCode: item.generalLedgerCode?.trim() || undefined,
    minQuantity: item.minQuantity
      ? {
        amount: item.minQuantity.amount,
        unit: item.minQuantity.unit,
      }
      : undefined,
    notes: item.notes,
    cardNotesDefault: item.cardNotesDefault,
    taxable: item.taxable ?? true,
    primarySupply: item.primarySupply && (
      (item.primarySupply.supplier && item.primarySupply.supplier.trim() !== '') ||
      item.primarySupply.orderMechanism
    )
      ? {
          // supplyEId is generated by the backend on create; do not send it
          name: item.primarySupply.name ?? 'Primary',
          supplier: (item.primarySupply.supplier && item.primarySupply.supplier.trim() !== '')
            ? item.primarySupply.supplier
            : '',
          sku: item.primarySupply.sku || undefined,
          orderMethod: item.primarySupply.orderMechanism ?? 'ONLINE',
          url:
            item.primarySupply.url && item.primarySupply.url.trim() !== ''
              ? item.primarySupply.url.startsWith('http')
                ? item.primarySupply.url
                : `https://${item.primarySupply.url}`
              : undefined,
          minimumQuantity: item.primarySupply.minimumQuantity
            ? {
                amount: item.primarySupply.minimumQuantity.amount,
                unit: item.primarySupply.minimumQuantity.unit,
              }
            : undefined,
        orderQuantity: item.primarySupply.orderQuantity
          ? {
            amount: item.primarySupply.orderQuantity.amount,
            unit: item.primarySupply.orderQuantity.unit,
          }
          : undefined,
        unitCost: item.primarySupply.unitCost
          ? {
            value: item.primarySupply.unitCost.value,
            currency: item.primarySupply.unitCost.currency,
          }
          : undefined,
        averageLeadTime: item.primarySupply.averageLeadTime
          ? {
            length: item.primarySupply.averageLeadTime.length,
            unit: item.primarySupply.averageLeadTime.unit,
          }
          : undefined,
      }
      : undefined,
    secondarySupply: item.secondarySupply && (
      (item.secondarySupply.supplier && item.secondarySupply.supplier.trim() !== '') ||
      item.secondarySupply.orderMechanism
    )
      ? {
          // supplyEId is generated by the backend on create; do not send it
          name: item.secondarySupply.name ?? 'Secondary',
          supplier: (item.secondarySupply.supplier && item.secondarySupply.supplier.trim() !== '')
            ? item.secondarySupply.supplier
            : '',
          sku: item.secondarySupply.sku || undefined,
          orderMethod: item.secondarySupply.orderMechanism ?? 'ONLINE',
          url:
            item.secondarySupply.url && item.secondarySupply.url.trim() !== ''
              ? item.secondarySupply.url.startsWith('http')
                ? item.secondarySupply.url
                : `https://${item.secondarySupply.url}`
              : undefined,
          minimumQuantity: item.secondarySupply.minimumQuantity
            ? {
                amount: item.secondarySupply.minimumQuantity.amount,
                unit: item.secondarySupply.minimumQuantity.unit,
              }
            : undefined,
        orderQuantity: item.secondarySupply.orderQuantity
          ? {
            amount: item.secondarySupply.orderQuantity.amount,
            unit: item.secondarySupply.orderQuantity.unit,
          }
          : undefined,
        unitCost: item.secondarySupply.unitCost
          ? {
            value: item.secondarySupply.unitCost.value,
            currency: item.secondarySupply.unitCost.currency,
          }
          : undefined,
        averageLeadTime: item.secondarySupply.averageLeadTime
          ? {
            length: item.secondarySupply.averageLeadTime.length,
            unit: item.secondarySupply.averageLeadTime.unit,
          }
          : undefined,
      }
      : undefined,
    defaultSupply: item.defaultSupply,
    cardSize: item.cardSize,
    labelSize: item.labelSize,
    breadcrumbSize: item.breadcrumbSize,
    itemColor: item.color,
  };

  if (process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION') {
    console.log('[mapItemToArdaCreateRequest] Mapped payload:', {
      taxable: payload.taxable,
      primarySupplyOrderMethod: payload.primarySupply?.orderMethod,
      secondarySupplyOrderMethod: payload.secondarySupply?.orderMethod,
      fullPayload: payload,
    });
  }

  return payload;
}

/**
 * Converts our internal Item type to ARDA Update Item request payload
 * Similar to mapItemToArdaCreateRequest but excludes 'name' field from supplies
 * to avoid backend treating it as creating a new supply
 */
function emptyToNull(s: string | undefined): string | null {
  if (s === undefined) return null;
  if (typeof s === 'string' && s.trim() === '') return null;
  return s as string;
}

function nullToUndefined<T>(v: T | null): T | undefined {
  return v === null ? undefined : v;
}

function supplyToUpdatePayload(supply: items.Supply): ardaApi.ArdaCreateItemRequest['primarySupply'] {
  const u = emptyToNull(supply.url);
  const supplier = supply.supplier?.trim() ?? '';
  return {
    ...(supply.supplyEId && { supplyEId: supply.supplyEId }),
    ...(supply.supplyEId && { name: supplier || (supply.name?.trim() ?? '') }),
    supplier,
    sku: nullToUndefined(emptyToNull(supply.sku)),
    orderMethod: supply.orderMechanism ?? 'ONLINE',
    url: u === null ? undefined : !u ? undefined : u.startsWith('http') ? u : `https://${u}`,
    minimumQuantity: supply.minimumQuantity
      ? { amount: supply.minimumQuantity.amount, unit: supply.minimumQuantity.unit }
      : undefined,
    orderQuantity: supply.orderQuantity
      ? { amount: supply.orderQuantity.amount, unit: supply.orderQuantity.unit }
      : undefined,
    unitCost: supply.unitCost
      ? { value: supply.unitCost.value, currency: supply.unitCost.currency }
      : undefined,
    averageLeadTime: supply.averageLeadTime
      ? { length: supply.averageLeadTime.length, unit: supply.averageLeadTime.unit }
      : undefined,
  };
}

export function mapItemToArdaUpdateRequest(
  item: Partial<items.Item>
): ardaApi.ArdaCreateItemRequest {
  const loc = item.locator;
  const payload: ardaApi.ArdaCreateItemRequest = {
    name: item.name ?? '',
    imageUrl:
      item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : undefined,
    classification:
      item.classification != null
        ? {
            type: (emptyToNull(item.classification?.type) ?? item.classification?.type) ?? '',
            subType: nullToUndefined(emptyToNull(item.classification?.subType)) ?? item.classification?.subType ?? undefined,
          }
        : undefined,
    useCase: nullToUndefined(emptyToNull(item.useCase)),
    locator: {
      facility: loc?.facility ?? '',
      department: nullToUndefined(emptyToNull(loc?.department)),
      location: nullToUndefined(emptyToNull(loc?.location)),
      subLocation: nullToUndefined(emptyToNull(loc?.subLocation)),
    },
    internalSKU: nullToUndefined(emptyToNull(item.internalSKU)),
    generalLedgerCode: nullToUndefined(emptyToNull(item.generalLedgerCode)),
    glCode: nullToUndefined(emptyToNull(item.generalLedgerCode)),
    minQuantity: item.minQuantity
      ? { amount: item.minQuantity.amount, unit: item.minQuantity.unit }
      : undefined,
    notes: nullToUndefined(emptyToNull(item.notes)),
    cardNotesDefault: nullToUndefined(emptyToNull(item.cardNotesDefault)),
    taxable: item.taxable ?? true,
    primarySupply: item.primarySupply != null ? supplyToUpdatePayload(item.primarySupply) : undefined,
    secondarySupply: item.secondarySupply != null ? supplyToUpdatePayload(item.secondarySupply) : undefined,
    defaultSupply: nullToUndefined(emptyToNull(item.defaultSupply)),
    cardSize: nullToUndefined(emptyToNull(item.cardSize)),
    labelSize: nullToUndefined(emptyToNull(item.labelSize)),
    breadcrumbSize: nullToUndefined(emptyToNull(item.breadcrumbSize)),
    itemColor: nullToUndefined(emptyToNull(item.color)),
  };

  return payload;
}
