// Main component
export { ArdaSupplierViewer, supplierDesignConfig, supplierFieldDescriptors } from './ArdaSupplierViewer';

// Layout configs
export { supplierTabs } from './configs/stepped-layout';
export { supplierFieldOrder } from './configs/continuous-scroll-layout';

// Sub-viewers (for advanced usage / testing)
export { ContactSubViewer, PostalAddressSubViewer, CompanyInfoSubViewer } from './configs/sub-viewers';

// Roles field
export { renderRolesField, rolesFieldDescriptor } from './configs/roles-custom-field';

// Mock data (for stories / testing)
export {
  mockSupplier,
  createSupplierInstance,
  validateBusinessAffiliate,
  getSupplier,
  updateSupplier,
} from './mocks/supplier-data';
