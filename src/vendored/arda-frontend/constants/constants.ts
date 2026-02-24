// Form options
export const unitOptions = [
  { value: 'each', label: 'Each' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'piece', label: 'Piece' },
  { value: 'unit', label: 'Unit' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'lb', label: 'Pound' },
  { value: 'm', label: 'Meter' },
  { value: 'ft', label: 'Foot' },
  { value: 'l', label: 'Liter' },
  { value: 'gal', label: 'Gallon' },
] as const;

export const locationOptions = [
  'Assembly Shelf',
  'Main Storage',
  'Receiving Dock',
];

export const supplierOptions = [
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Alibaba', label: 'Alibaba' },
  { value: 'Local Supplier', label: 'Local Supplier' },
];

export const orderMethodOptions = [
  { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'IN_STORE', label: 'In Store' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'RFQ', label: 'RFQ' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'THIRD_PARTY', label: '3rd Party' },
  { value: 'OTHER', label: 'Other' },
];

export const cardSizeOptions = [
  { value: 'SMALL', label: 'Half-Index' },
  { value: 'MEDIUM', label: 'Business Card Stock' },
  { value: 'LARGE', label: '3 x 5' },
  { value: 'X_LARGE', label: '4 x 6' },
];

export const labelSizeOptions = [
  { value: 'SMALL', label: 'Quarter-Index' },
  { value: 'MEDIUM', label: 'Half- Index' },
  { value: 'LARGE', label: '1 x 3' },
  { value: 'X_LARGE', label: 'Business Card Stock' },
];

export const breadcrumbSizeOptions = [
  { value: 'SMALL', label: '1 x 1' },
  { value: 'MEDIUM', label: '1 x 3' },
  { value: 'LARGE', label: 'Quarter-Index' },
  { value: 'X_LARGE', label: 'Half-Index' },
];

export const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'RUB', label: 'RUB (₽)' },
  { value: 'BRL', label: 'BRL (R$)' },
  { value: 'ZAR', label: 'ZAR (R)' },
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'KRW', label: 'KRW (₩)' },
  { value: 'SGD', label: 'SGD (S$)' },
  { value: 'HKD', label: 'HKD (HK$)' },
  { value: 'NZD', label: 'NZD (NZ$)' },
  { value: 'CHF', label: 'CHF (CHF)' },
];

export const timeUnitOptions = [
  { value: 'SECOND', label: 'Seconds' },
  { value: 'MINUTE', label: 'Minutes' },
  { value: 'HOUR', label: 'Hours' },
  { value: 'DAY', label: 'Days' },
  { value: 'WEEK', label: 'Weeks' },
];

export const colorOptions = [
  { value: 'BLUE', label: 'Blue' },
  { value: 'GREEN', label: 'Green' },
  { value: 'YELLOW', label: 'Yellow' },
  { value: 'ORANGE', label: 'Orange' },
  { value: 'RED', label: 'Red' },
  { value: 'PINK', label: 'Pink' },
  { value: 'PURPLE', label: 'Purple' },
  { value: 'GRAY', label: 'Gray' },
];

export const itemTypeOptions = [
  { value: 'Raw Material', label: 'Raw Material' },
  { value: 'Component', label: 'Component' },
  { value: 'Tool', label: 'Tool' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Consumable', label: 'Consumable' },
];

export const itemSubTypeOptions = [
  { value: 'Metal', label: 'Metal' },
  { value: 'Plastic', label: 'Plastic' },
  { value: 'Electronic', label: 'Electronic' },
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'Chemical', label: 'Chemical' },
];

export const departmentOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Quality Control', label: 'Quality Control' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Logistics', label: 'Logistics' },
];

export const locationOptionsExtended = [
  { value: 'Warehouse A', label: 'Warehouse A' },
  { value: 'Warehouse B', label: 'Warehouse B' },
  { value: 'Production Floor', label: 'Production Floor' },
  { value: 'Tool Room', label: 'Tool Room' },
  { value: 'Office', label: 'Office' },
];

export const useCaseOptions = [
  { value: 'Assembly', label: 'Assembly' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Production', label: 'Production' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Packaging', label: 'Packaging' },
];
