import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, type ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  MOCK_BROKEN_IMAGE,
  type MockItem,
} from '@/components/canary/__mocks__/image-story-data';
import { ImageCellDisplay } from './image-cell-display';
import { createImageCellEditor } from './image-cell-editor';

// ============================================================================
// Column definitions
// ============================================================================

const columnDefs: ColDef<MockItem>[] = [
  {
    field: 'imageUrl',
    headerName: 'Image',
    cellRenderer: ImageCellDisplay,
    cellRendererParams: { config: ITEM_IMAGE_CONFIG },
    cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG),
    editable: true,
    width: 60,
    sortable: false,
    resizable: false,
  },
  { field: 'name', headerName: 'Name', editable: true, flex: 1 },
  { field: 'sku', headerName: 'SKU', width: 100 },
  { field: 'unitCost', headerName: 'Unit Cost', width: 110 },
];

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof ImageCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Image',
  component: ImageCellDisplay,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ImageCellDisplay>;

// ============================================================================
// Helper: mini AG Grid wrapper
// ============================================================================

function MiniGrid({ rows, height = 250 }: { rows: MockItem[]; height?: number }) {
  return (
    <div className="ag-theme-quartz" style={{ height, width: '100%' }}>
      <AgGridReact<MockItem>
        rowData={rows}
        columnDefs={columnDefs}
        rowHeight={40}
        headerHeight={36}
      />
    </div>
  );
}
export const GridDisplay: Story = {
  render: () => <MiniGrid rows={MOCK_ITEMS} />,
};

// ============================================================================
// 3. HoverPreview — hover instruction
// ============================================================================

export const HoverPreview: Story = {
  render: () => (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Hover over an image cell and wait ~500ms to see the large preview popover. Moving the mouse
        away immediately closes the popover.
      </p>
      <MiniGrid rows={MOCK_ITEMS.slice(0, 2)} height={150} />
    </div>
  ),
};

// ============================================================================
// 4. DoubleClickEdit — double-click to open ImageUploadDialog
// ============================================================================

export const DoubleClickEdit: Story = {
  render: () => (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Double-click an image cell to open the ImageUploadDialog. Double-click the Name cell to
        verify text editing works (proves AG Grid editing is active).
      </p>
      <div className="ag-theme-quartz" style={{ height: 150, width: '100%' }}>
        <AgGridReact<MockItem>
          rowData={MOCK_ITEMS.slice(0, 3)}
          columnDefs={[
            {
              field: 'imageUrl',
              headerName: 'Image',
              cellRenderer: ImageCellDisplay,
              cellRendererParams: { config: ITEM_IMAGE_CONFIG },
              cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG),
              editable: true,
              width: 60,
            },
            { field: 'name', headerName: 'Name', editable: true, flex: 1 },
            { field: 'sku', headerName: 'SKU', width: 100 },
          ]}
          rowHeight={40}
          headerHeight={36}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// 5. KeyboardEdit — Tab + Enter to open ImageUploadDialog
// ============================================================================

export const KeyboardEdit: Story = {
  render: () => (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Tab to an image cell and press Enter to open the ImageUploadDialog.
      </p>
      <div className="ag-theme-quartz" style={{ height: 150, width: '100%' }}>
        <AgGridReact<MockItem>
          rowData={MOCK_ITEMS.slice(0, 2)}
          columnDefs={[
            {
              field: 'imageUrl',
              headerName: 'Image',
              cellRenderer: ImageCellDisplay,
              cellRendererParams: { config: ITEM_IMAGE_CONFIG },
              cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG),
              editable: true,
              width: 60,
            },
            { field: 'name', headerName: 'Name', flex: 1 },
          ]}
          rowHeight={40}
          headerHeight={36}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// 6. ErrorStates — broken URL and null image rows
// ============================================================================

export const ErrorStates: Story = {
  render: () => {
    const errorRows: MockItem[] = [
      {
        id: 'e1',
        name: 'Broken Image Item',
        sku: 'ERR-001',
        imageUrl: MOCK_BROKEN_IMAGE,
        unitCost: 0,
      },
      { id: 'e2', name: 'No Image Item', sku: 'ERR-002', imageUrl: null, unitCost: 0 },
    ];
    return (
      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          Row 1 has a broken image URL &#8212; ImageDisplay shows an error badge. The Eye icon is
          still rendered (there is a URL, just broken). Row 2 has null imageUrl &#8212; Eye is
          suppressed.
        </p>
        <MiniGrid rows={errorRows} height={150} />
      </div>
    );
  },
};

// ============================================================================
// 9. EditorFactoryDemo — createImageCellEditor factory usage
// ============================================================================

export const EditorFactoryDemo: Story = {
  render: () => {
    const FactoryEditor = createImageCellEditor(ITEM_IMAGE_CONFIG);

    return (
      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          Demonstrates <code>createImageCellEditor(config)</code> factory. The returned component
          curries the config and can be passed directly to a column definition.
        </p>
        <div className="ag-theme-quartz" style={{ height: 150, width: '100%' }}>
          <AgGridReact<MockItem>
            rowData={MOCK_ITEMS.slice(0, 2)}
            columnDefs={[
              {
                field: 'imageUrl',
                headerName: 'Image',
                cellRenderer: ImageCellDisplay,
                cellRendererParams: { config: ITEM_IMAGE_CONFIG },
                cellEditor: FactoryEditor,
                editable: true,
                width: 60,
              },
              { field: 'name', headerName: 'Name', flex: 1 },
            ]}
            rowHeight={40}
            headerHeight={36}
          />
        </div>
        <pre className="mt-4 p-3 bg-muted rounded text-xs overflow-auto">
          {`const ImageEditor = createImageCellEditor(ITEM_IMAGE_CONFIG);\n// colDef: { cellEditor: ImageEditor, editable: true }`}
        </pre>
      </div>
    );
  },
};

// ============================================================================
// 1. Playground — controls on config fields
// ============================================================================

export const Playground: Story = {
  argTypes: {
    value: {
      control: 'text',
      description: 'Image URL (null for no image)',
      table: { category: 'Runtime' },
    },
  },
  args: {
    config: ITEM_IMAGE_CONFIG,
    value: MOCK_ITEMS[0]?.imageUrl ?? null,
    data: {},
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <MiniGrid
        rows={[
          {
            id: 'preview',
            name: 'Preview Row',
            sku: 'PX-0001',
            imageUrl: args.value ?? null,
            unitCost: 1.0,
          },
        ]}
        height={120}
      />
      <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
        <strong>Standalone cell:</strong>
        <div className="mt-2 border border-border rounded p-2 inline-flex">
          <ImageCellDisplay
            config={args.config}
            value={args.value ?? null}
            data={args.data ?? {}}
          />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// 2. GridDisplay — static grid with 4 visual states
// ============================================================================
