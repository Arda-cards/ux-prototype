import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { sampleItemSupplies } from '@/types/reference/business-affiliates/item-supply';

import { ArdaItemDrawer, sampleItem } from './item-drawer';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta: Meta<typeof ArdaItemDrawer> = {
  title: 'Components/Organisms/Reference/Items/Item Drawer',
  component: ArdaItemDrawer,
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A right-side slide-in panel for viewing, adding, and editing inventory items. Supports view, add, and edit modes with a confirmation dialog for unsaved changes.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Override the drawer header title. Defaults to mode-appropriate text.',
      table: { category: 'Static' },
    },
    classificationTypes: {
      control: false,
      description: 'Classification type options for the form select dropdown.',
      table: { category: 'Static' },
    },
    orderMechanismLabels: {
      control: false,
      description: 'Override labels for order mechanism options.',
      table: { category: 'Static' },
    },
    open: {
      control: 'boolean',
      description: 'Whether the drawer is open.',
      table: { category: 'Runtime' },
    },
    mode: {
      control: 'select',
      options: ['view', 'add', 'edit'],
      description: 'Current operating mode.',
      table: { category: 'Runtime' },
    },
    item: {
      control: false,
      description: 'Item data for view/edit modes.',
      table: { category: 'Runtime' },
    },
    onClose: {
      action: 'closed',
      table: { category: 'Events' },
    },
    onSubmit: {
      action: 'submitted',
      table: { category: 'Events' },
    },
    onEdit: {
      action: 'edit-clicked',
      table: { category: 'Events' },
    },
  },
  args: {
    open: true,
    onClose: fn(),
    onSubmit: fn(),
    onEdit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaItemDrawer>;

/* ------------------------------------------------------------------ */
/*  Static Stories                                                     */
/* ------------------------------------------------------------------ */

export const ViewMode: Story = {
  args: {
    mode: 'view',
    item: sampleItem,
  },
};

export const AddMode: Story = {
  args: {
    mode: 'add',
  },
};

export const EditMode: Story = {
  args: {
    mode: 'edit',
    item: sampleItem,
  },
};

export const Closed: Story = {
  args: {
    open: false,
    mode: 'view',
    item: sampleItem,
  },
};

export const ViewWithSupplies: Story = {
  args: {
    open: true,
    mode: 'view',
    item: sampleItem,
    itemSupplies: sampleItemSupplies,
    supplyDesignations: {
      'is-001': ['PRIMARY'],
      'is-002': ['SECONDARY'],
    },
    supplySupplierNames: {
      'is-001': 'Fastenal Corp.',
      'is-002': 'Parker Hannifin',
    },
    onClose: fn(),
  },
};

/* ------------------------------------------------------------------ */
/*  Interactive Stories                                                 */
/* ------------------------------------------------------------------ */

export const FillAndSubmit: Story = {
  args: {
    mode: 'add',
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Scene 1: Drawer is open in add mode with empty form
    await delay(1500);

    // Scene 2: Fill item name and SKU
    const nameInput = canvas.getByLabelText('Name');
    await userEvent.type(nameInput, 'Hydraulic Pump HP-200');
    const skuInput = canvas.getByLabelText('Internal SKU');
    await userEvent.type(skuInput, 'HYD-PMP-HP200');
    await delay(1500);

    // Scene 3: Fill supplier and unit cost
    const supplierInput = canvas.getByLabelText('Supplier', { selector: '#primary-supplier' });
    await userEvent.type(supplierInput, 'Parker Hannifin');
    const unitCostInput = canvas.getByLabelText('Unit Cost', { selector: '#primary-unitcost' });
    await userEvent.clear(unitCostInput);
    await userEvent.type(unitCostInput, '245.50');
    await delay(1500);

    // Scene 4: Click submit, verify onSubmit called
    const submitButton = canvas.getByRole('button', { name: 'Add Item' });
    await userEvent.click(submitButton);
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const ViewToEdit: Story = {
  args: {
    mode: 'view',
    item: sampleItem,
    onEdit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Scene 1: Drawer is open in view mode with sample item data
    const nameElements = canvas.getAllByText('Hydraulic Cylinder HC-500');
    await expect(nameElements.length).toBeGreaterThanOrEqual(1);
    await expect(canvas.getByText('HYD-CYL-HC500')).toBeInTheDocument();
    await delay(1500);

    // Scene 2: Click Edit button
    const editButton = canvas.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
    await delay(1500);

    // Scene 3: Verify the edit callback was invoked (parent would switch to edit mode)
    // In a real app, the parent would re-render with mode='edit' and the form pre-populated.
    // We verify the callback was called with the right context.
    await expect(args.onEdit).toHaveBeenCalled();
  },
};

export const EditWithCancel: Story = {
  args: {
    mode: 'edit',
    item: sampleItem,
    onEdit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Scene 1: Drawer is open in edit mode with pre-populated form
    const nameInput = canvas.getByLabelText('Name');
    await expect(nameInput).toHaveValue('Hydraulic Cylinder HC-500');
    await delay(1500);

    // Scene 2: Modify a field to make the form dirty
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Modified Item Name');
    await delay(1500);

    // Scene 3: Click Cancel -- confirm dialog appears
    const cancelButton = canvas.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);
    await delay(500);
    const discardDialog = canvas.getByRole('alertdialog');
    await expect(discardDialog).toBeInTheDocument();
    await expect(canvas.getByText('Discard changes?')).toBeInTheDocument();
    await delay(1500);

    // Scene 4: Click Discard -- confirm dialog closes, onEdit called to return to view mode
    const discardButton = canvas.getByRole('button', { name: 'Discard' });
    await userEvent.click(discardButton);
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
  },
};
