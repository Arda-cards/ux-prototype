import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import {
  createArdaEntityViewer,
  type DesignConfig,
} from '@/extras/components/organisms/shared/entity-viewer';
import type { BusinessAffiliate } from '@/extras/types/reference/business-affiliates/business-affiliate';

import { ArdaSupplierViewer, supplierFieldDescriptors } from './arda-supplier-viewer';
import { supplierTabs } from './configs/stepped-layout';
import { supplierFieldOrder } from './configs/continuous-scroll-layout';
import { getSupplier, updateSupplier, createSupplierInstance } from './mocks/supplier-data';

// ============================================================================
// Error Viewer Instance (hoisted — must not be created inside render)
// ============================================================================

const errorDesignConfig: DesignConfig<BusinessAffiliate> = {
  validate: () => ({
    fieldErrors: [{ message: 'Name is invalid.', fieldPath: 'name' }],
    entityErrors: [{ message: 'Entity validation failed.' }],
  }),
  get: getSupplier,
  update: updateSupplier,
  newInstance: createSupplierInstance,
};

const { Component: ErrorArdaSupplierViewer } = createArdaEntityViewer<BusinessAffiliate>(
  errorDesignConfig,
  supplierFieldDescriptors,
);

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof ArdaSupplierViewer> = {
  title: 'Components/Extras/Organisms/Reference/Business Affiliates/ArdaSupplierViewer',
  component: ArdaSupplierViewer,
  parameters: {
    layout: 'padded',
  },
};
export default meta;

type Story = StoryObj<typeof ArdaSupplierViewer>;

// ============================================================================
// Stories
// ============================================================================

/** Display mode with stepped (tabbed) layout. Click Edit to enter edit mode. */
export const DisplayModeStepped: Story = {
  render: () => (
    <ArdaSupplierViewer
      title="Supplier Details"
      entityId="ba-001"
      layoutMode="stepped"
      editable
      tabs={supplierTabs}
    />
  ),
};

/** Edit mode with stepped layout — auto-clicks Edit via play function. */
export const EditModeStepped: Story = {
  render: () => (
    <ArdaSupplierViewer
      title="Supplier Details"
      entityId="ba-001"
      layoutMode="stepped"
      editable
      tabs={supplierTabs}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editButton = await canvas.findByRole('button', { name: /edit/i });
    await userEvent.click(editButton);
  },
};

/** Create flow — no entityId, starts in edit mode automatically. */
export const CreateFlow: Story = {
  render: () => (
    <ArdaSupplierViewer title="New Supplier" layoutMode="stepped" editable tabs={supplierTabs} />
  ),
};

/**
 * Error states — uses an always-failing validator.
 * Click Edit, then Submit to see validation errors.
 * (Play function omitted — the entity viewer's async load + edit mode
 * transition is not reliably automatable in the CI test-runner.)
 */
export const ErrorStates: Story = {
  render: () => (
    <ErrorArdaSupplierViewer
      title="Error Demo"
      entityId="ba-001"
      layoutMode="continuous-scroll"
      editable
      fieldOrder={supplierFieldOrder}
    />
  ),
};

/** Continuous-scroll layout in edit mode. */
export const ContinuousScrollEdit: Story = {
  render: () => (
    <ArdaSupplierViewer
      title="Supplier Details"
      entityId="ba-001"
      layoutMode="continuous-scroll"
      editable
      fieldOrder={supplierFieldOrder}
    />
  ),
};

/** Sub-viewer expansion — display-only continuous-scroll showing nested sub-viewers. */
export const SubViewerExpansion: Story = {
  render: () => (
    <ArdaSupplierViewer
      title="Full Supplier Data"
      entityId="ba-001"
      layoutMode="continuous-scroll"
      editable={false}
      fieldOrder={supplierFieldOrder}
    />
  ),
};
