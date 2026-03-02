/**
 * Centralised configuration for the Items AG Grid table.
 *
 * Extracted from ItemTableAGGrid so that column mappings and other
 * grid-level configuration can be reused across future entity grids
 * (Suppliers, Locations, Orders, …) without coupling them to the
 * Items-specific component file.
 */

/**
 * Maps a view-key (used by the columnVisibility prop / UI toggle) to
 * the AG Grid field string that identifies the column in the grid API.
 *
 * Used in two places inside ItemTableAGGrid:
 *  1. handleGridReady — applies initial visibility before the grid is revealed.
 *  2. The columnVisibility useEffect — applies subsequent prop-driven changes.
 */
export const VIEW_KEY_TO_FIELD: Record<string, string> = {
  sku: 'internalSKU',
  glCode: 'generalLedgerCode',
  name: 'name',
  image: 'imageUrl',
  classification: 'classification.type',
  subType: 'classification.subType',
  supplier: 'primarySupply.supplier',
  location: 'locator.location',
  subLocation: 'locator.subLocation',
  department: 'locator.department',
  facility: 'locator.facility',
  useCase: 'useCase',
  unitCost: 'primarySupply.unitCost',
  created: 'createdCoordinates',
  minQuantityAmount: 'minQuantityAmount',
  minQuantityUnit: 'minQuantityUnit',
  orderQuantityAmount: 'orderQuantityAmount',
  orderQuantityUnit: 'orderQuantityUnit',
  orderMethod: 'primarySupply.orderMechanism',
  cardSize: 'cardCount',
  notes: 'notes',
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
  actions: 'quickActions',
};
