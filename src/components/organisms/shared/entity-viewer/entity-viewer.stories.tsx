import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import type { AtomProps } from '@/lib/data-types/atom-types';
import type {
  DesignConfig,
  FieldDescriptor,
  TabConfig,
  ValidationResult,
  UpdateResult,
} from './types';
import { createArdaEntityViewer } from './create-entity-viewer';

/* ------------------------------------------------------------------ */
/*  Mock Entity                                                        */
/* ------------------------------------------------------------------ */

interface MockSupplier {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  active: boolean;
}

const mockSupplier: MockSupplier = {
  name: 'Acme Supplies',
  email: 'contact@acme.com',
  phone: '+1-555-1234',
  city: 'Portland',
  country: 'US',
  active: true,
};

/* ------------------------------------------------------------------ */
/*  Mock Atom Components                                               */
/* ------------------------------------------------------------------ */

function MockTextField({ value, onChange, mode, errors, label, editable }: AtomProps<string>) {
  if (mode === 'display' || editable === false) {
    return (
      <div className="py-1">
        <span className="text-sm text-gray-500">{label}</span>: {value}
      </div>
    );
  }
  return (
    <div className="py-1">
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <input
        className="border rounded px-2 py-1 w-full"
        value={value ?? ''}
        onChange={(e) => onChange(value, e.target.value)}
      />
      {mode === 'error' &&
        errors?.map((err, i) => (
          <p key={i} className="text-red-600 text-xs mt-1">
            {err}
          </p>
        ))}
    </div>
  );
}
MockTextField.displayName = 'MockTextField';

function MockBooleanField({ value, onChange, mode, errors, label, editable }: AtomProps<boolean>) {
  if (mode === 'display' || editable === false) {
    return (
      <div className="py-1">
        <span className="text-sm text-gray-500">{label}</span>: {value ? 'Yes' : 'No'}
      </div>
    );
  }
  return (
    <div className="py-1">
      <label className="inline-flex items-center gap-2 text-sm text-gray-500">
        <input
          type="checkbox"
          checked={value ?? false}
          onChange={(e) => onChange(value, e.target.checked)}
        />
        {label}
      </label>
      {mode === 'error' &&
        errors?.map((err, i) => (
          <p key={i} className="text-red-600 text-xs mt-1">
            {err}
          </p>
        ))}
    </div>
  );
}
MockBooleanField.displayName = 'MockBooleanField';

/** Sub-viewer atom — name includes "Viewer" so the shell wraps it in SubViewerContainer. */
function MockAddressSubViewer({
  value,
  onChange,
  mode,
  editable,
}: AtomProps<{ street: string; zip: string }>) {
  const data = value ?? { street: '', zip: '' };
  if (mode === 'display' || editable === false) {
    return (
      <div className="py-1 space-y-1">
        <div>
          <span className="text-sm text-gray-500">Street</span>: {data.street}
        </div>
        <div>
          <span className="text-sm text-gray-500">ZIP</span>: {data.zip}
        </div>
      </div>
    );
  }
  return (
    <div className="py-1 space-y-2">
      <div>
        <label className="block text-sm text-gray-500 mb-1">Street</label>
        <input
          className="border rounded px-2 py-1 w-full"
          value={data.street}
          onChange={(e) => onChange(value, { ...data, street: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">ZIP</label>
        <input
          className="border rounded px-2 py-1 w-full"
          value={data.zip}
          onChange={(e) => onChange(value, { ...data, zip: e.target.value })}
        />
      </div>
    </div>
  );
}
MockAddressSubViewer.displayName = 'MockAddressSubViewer';

/* ------------------------------------------------------------------ */
/*  Mock Callbacks                                                     */
/* ------------------------------------------------------------------ */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockDesignConfig: DesignConfig<MockSupplier> = {
  get: async (_entityId: string): Promise<MockSupplier> => {
    await delay(300);
    return { ...mockSupplier };
  },
  update: async (
    _entityId: string,
    _original: MockSupplier,
    updated: MockSupplier,
  ): Promise<UpdateResult<MockSupplier>> => {
    await delay(500);
    return { entity: { ...updated } };
  },
  validate: (_previous: MockSupplier, updated: MockSupplier): ValidationResult => {
    const fieldErrors: { message: string; fieldPath: string }[] = [];
    const entityErrors: { message: string }[] = [];
    if (!updated.name.trim()) {
      fieldErrors.push({ message: 'Name is required', fieldPath: 'name' });
    }
    if (!updated.email.trim()) {
      fieldErrors.push({ message: 'Email is required', fieldPath: 'email' });
    }
    return { fieldErrors, entityErrors };
  },
  newInstance: (): MockSupplier => ({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    active: false,
  }),
};

/** Design config that always fails validation for the errored story. */
const erroredDesignConfig: DesignConfig<MockSupplier> = {
  ...mockDesignConfig,
  validate: (): ValidationResult => ({
    fieldErrors: [
      { message: 'Name is required', fieldPath: 'name' },
      { message: 'Invalid email format', fieldPath: 'email' },
    ],
    entityErrors: [{ message: 'Supplier must have at least one contact method' }],
  }),
};

/* ------------------------------------------------------------------ */
/*  Field Descriptors                                                  */
/* ------------------------------------------------------------------ */

const supplierFieldDescriptors: Partial<Record<keyof MockSupplier, FieldDescriptor<unknown>>> = {
  name: {
    component: MockTextField as React.ComponentType<AtomProps<unknown>>,
    label: 'Name',
    editable: true,
    visible: true,
    tabName: 'basic',
    validate: (v) => (!(v as string)?.trim() ? 'Name is required' : undefined),
  },
  email: {
    component: MockTextField as React.ComponentType<AtomProps<unknown>>,
    label: 'Email',
    editable: true,
    visible: true,
    tabName: 'basic',
    validate: (v) => (!(v as string)?.trim() ? 'Email is required' : undefined),
  },
  phone: {
    component: MockTextField as React.ComponentType<AtomProps<unknown>>,
    label: 'Phone',
    editable: true,
    visible: true,
    tabName: 'contact',
  },
  city: {
    component: MockTextField as React.ComponentType<AtomProps<unknown>>,
    label: 'City',
    editable: true,
    visible: true,
    tabName: 'location',
  },
  country: {
    component: MockTextField as React.ComponentType<AtomProps<unknown>>,
    label: 'Country',
    editable: true,
    visible: true,
    tabName: 'location',
  },
  active: {
    component: MockBooleanField as React.ComponentType<AtomProps<unknown>>,
    label: 'Active',
    editable: true,
    visible: true,
    tabName: 'location',
  },
};

/* ------------------------------------------------------------------ */
/*  Tab Configuration                                                  */
/* ------------------------------------------------------------------ */

const supplierTabs: readonly TabConfig[] = [
  { name: 'basic', label: 'Basic Info', fieldKeys: ['name', 'email'], order: 0 },
  { name: 'contact', label: 'Contact', fieldKeys: ['phone'], order: 1 },
  { name: 'location', label: 'Location', fieldKeys: ['city', 'country', 'active'], order: 2 },
];

/* ------------------------------------------------------------------ */
/*  Viewer Instances                                                   */
/* ------------------------------------------------------------------ */

const { Component: SupplierViewer } = createArdaEntityViewer<MockSupplier>(
  mockDesignConfig,
  supplierFieldDescriptors,
);

const { Component: ErroredSupplierViewer } = createArdaEntityViewer<MockSupplier>(
  erroredDesignConfig,
  supplierFieldDescriptors,
);

/* ------------------------------------------------------------------ */
/*  Sub-Viewer Entity (for composition story)                          */
/* ------------------------------------------------------------------ */

interface MockSupplierWithAddress extends MockSupplier {
  address: { street: string; zip: string };
}

const supplierWithAddressDescriptors: Partial<
  Record<keyof MockSupplierWithAddress, FieldDescriptor<unknown>>
> = {
  ...supplierFieldDescriptors,
  address: {
    component: MockAddressSubViewer as React.ComponentType<AtomProps<unknown>>,
    label: 'Address',
    editable: true,
    visible: true,
  },
};

const supplierWithAddressDesignConfig: DesignConfig<MockSupplierWithAddress> = {
  get: async () => {
    await delay(300);
    return { ...mockSupplier, address: { street: '123 Main St', zip: '97201' } };
  },
  update: async (_id, _orig, updated) => {
    await delay(500);
    return { entity: { ...updated } };
  },
  validate: () => ({ fieldErrors: [], entityErrors: [] }),
  newInstance: () => ({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    active: false,
    address: { street: '', zip: '' },
  }),
};

const { Component: SupplierWithAddressViewer } = createArdaEntityViewer<MockSupplierWithAddress>(
  supplierWithAddressDesignConfig,
  supplierWithAddressDescriptors,
);

/* ------------------------------------------------------------------ */
/*  Stories                                                            */
/* ------------------------------------------------------------------ */

const meta: Meta = {
  title: 'Components/Organisms/Shared/EntityViewer',
  parameters: {
    layout: 'padded',
  },
};
export default meta;

type ViewerStory = StoryObj;

/** Story 1: Edit flow with stepped (tabbed) layout. */
export const EditFlowStepped: ViewerStory = {
  render: () => (
    <SupplierViewer
      title="Supplier Details"
      layoutMode="stepped"
      editable
      entityId="supplier-001"
      tabs={supplierTabs}
      fieldOrder={['name', 'email', 'phone', 'city', 'country', 'active']}
    />
  ),
};

/** Story 2: Create flow with continuous-scroll layout. */
export const CreateFlowContinuous: ViewerStory = {
  render: () => (
    <SupplierViewer
      title="New Supplier"
      layoutMode="continuous-scroll"
      editable
      submitLabel="Create Supplier"
      fieldOrder={['name', 'email', 'phone', 'city', 'country', 'active']}
    />
  ),
};

/** Story 3: Errored mode showing field-level and entity-level errors. */
export const ErroredMode: ViewerStory = {
  render: () => {
    /**
     * This viewer is configured with a validate function that always returns errors.
     * Start in create mode (no entityId) so it opens in edit — then submit to see errors.
     */
    return (
      <ErroredSupplierViewer
        title="Supplier with Errors"
        layoutMode="continuous-scroll"
        editable
        submitLabel="Submit"
        fieldOrder={['name', 'email', 'phone', 'city', 'country', 'active']}
      />
    );
  },
};

/** Story 4: Sub-viewer composition with nested address entity. */
export const SubViewerComposition: ViewerStory = {
  render: () => (
    <SupplierWithAddressViewer
      title="Supplier with Address"
      layoutMode="continuous-scroll"
      editable
      entityId="supplier-002"
      fieldOrder={['name', 'email', 'phone', 'city', 'country', 'active', 'address']}
    />
  ),
};

// Hoisted outside render to avoid re-creating the component on every render.
const { Component: DirtyViewer } = createArdaEntityViewer<MockSupplier>(
  mockDesignConfig,
  supplierFieldDescriptors,
);

/** Story 5: Dirty check — modify a field to see dirty state. */
export const DirtyCheck: ViewerStory = {
  render: () => {
    const [navigateAttempted, setNavigateAttempted] = useState(false);
    const [discarded, setDiscarded] = useState(false);

    return (
      <div className="space-y-4">
        <DirtyViewer
          title="Supplier — Dirty Check Demo"
          layoutMode="continuous-scroll"
          editable
          entityId="supplier-003"
          fieldOrder={['name', 'email', 'phone', 'city', 'country', 'active']}
          onDirtyNavigate={(discard, cancel) => {
            setNavigateAttempted(true);
            const confirmed = window.confirm('You have unsaved changes. Discard them?');
            if (confirmed) {
              setDiscarded(true);
              discard();
            } else {
              cancel();
            }
          }}
        />
        {navigateAttempted && !discarded && (
          <div className="text-amber-600 text-sm p-2 bg-amber-50 rounded">
            Navigation was attempted with unsaved changes.
          </div>
        )}
        {discarded && (
          <div className="text-green-600 text-sm p-2 bg-green-50 rounded">
            Changes were discarded.
          </div>
        )}
      </div>
    );
  },
};

/** Story 6: Side-by-side layout comparison (stepped vs continuous-scroll). */
export const LayoutComparison: ViewerStory = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="border rounded-lg">
        <SupplierViewer
          title="Stepped Layout"
          layoutMode="stepped"
          editable
          entityId="supplier-004"
          tabs={supplierTabs}
          fieldOrder={['name', 'email', 'phone', 'city', 'country', 'active']}
        />
      </div>
      <div className="border rounded-lg">
        <SupplierViewer
          title="Continuous-Scroll Layout"
          layoutMode="continuous-scroll"
          editable
          entityId="supplier-004"
          fieldOrder={['name', 'email', 'phone', 'city', 'country', 'active']}
        />
      </div>
    </div>
  ),
};
