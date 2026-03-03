import type { AtomProps } from '@/lib/data-types/atom-types';
import type { BusinessAffiliate } from '@/extras/types/reference/business-affiliates/business-affiliate';
import {
  createArdaEntityViewer,
  type DesignConfig,
  type FieldDescriptor,
} from '@/extras/components/organisms/shared/entity-viewer';
import { ArdaTextFieldInteractive } from '@/extras/components/atoms/form/text';
import { ArdaCustomFieldInteractive } from '@/extras/components/atoms/form/custom';

import {
  validateBusinessAffiliate,
  getSupplier,
  updateSupplier,
  createSupplierInstance,
} from './mocks/supplier-data';
import { renderRolesField } from './configs/roles-custom-field';
import {
  ContactSubViewer,
  PostalAddressSubViewer,
  CompanyInfoSubViewer,
} from './configs/sub-viewers';

// ============================================================================
// Design-Time Configuration
// ============================================================================

const designConfig: DesignConfig<BusinessAffiliate> = {
  validate: validateBusinessAffiliate,
  get: getSupplier,
  update: updateSupplier,
  newInstance: createSupplierInstance,
  onExitWithSuccess: (_entity) => {
    /* placeholder: handle save */
  },
  onExitWithErrors: (errors) => console.warn('[ArdaSupplierViewer] Errors', errors),
};

// ============================================================================
// Field Descriptors
// ============================================================================

// Type alias for the atom component expected by FieldDescriptor<unknown>.
// Atoms may accept extra static-config props beyond AtomProps<V>, which makes
// them not directly assignable to ComponentType<AtomProps<unknown>>.
// This cast is safe because the entity-viewer shell only passes AtomProps props.
type AtomComponent = React.ComponentType<AtomProps<unknown>>;

/**
 * Custom wrapper for the roles field.
 * Injects the render function into ArdaCustomFieldInteractive.
 */
function RolesFieldWrapper(props: AtomProps<unknown>) {
  return <ArdaCustomFieldInteractive {...props} render={renderRolesField} />;
}
RolesFieldWrapper.displayName = 'RolesFieldWrapper';

const fieldDescriptors: Partial<Record<keyof BusinessAffiliate, FieldDescriptor<unknown>>> = {
  eId: {
    component: ArdaTextFieldInteractive as AtomComponent,
    label: 'ID',
    editable: false,
    visible: true,
    tabName: 'identity',
  },
  name: {
    component: ArdaTextFieldInteractive as AtomComponent,
    label: 'Name',
    editable: true,
    visible: true,
    tabName: 'identity',
    validate: (value: unknown) => {
      const name = value as string | undefined;
      if (!name || name.trim() === '') return 'Name is required.';
      return undefined;
    },
  },
  roles: {
    component: RolesFieldWrapper,
    label: 'Roles',
    editable: true,
    visible: true,
    tabName: 'identity',
    validate: (value: unknown) => {
      const roles = value as { role: string }[] | undefined;
      if (!roles || roles.length === 0) return 'At least one business role is required.';
      return undefined;
    },
  },
  contact: {
    component: ContactSubViewer as AtomComponent,
    label: 'Contact Information',
    editable: true,
    visible: true,
    tabName: 'contact',
  },
  mainAddress: {
    component: PostalAddressSubViewer as AtomComponent,
    label: 'Primary Address',
    editable: true,
    visible: true,
    tabName: 'address-legal',
  },
  legal: {
    component: CompanyInfoSubViewer as AtomComponent,
    label: 'Legal Information',
    editable: true,
    visible: true,
    tabName: 'address-legal',
  },
  notes: {
    component: ArdaTextFieldInteractive as AtomComponent,
    label: 'Notes',
    editable: true,
    visible: true,
    tabName: 'notes',
  },
};

// ============================================================================
// Factory Export
// ============================================================================

export const { Component: ArdaSupplierViewer } = createArdaEntityViewer<BusinessAffiliate>(
  designConfig,
  fieldDescriptors,
);

// Re-export for advanced usage
export { designConfig as supplierDesignConfig, fieldDescriptors as supplierFieldDescriptors };
