import type { Meta, StoryObj } from '@storybook/react';
import { useState, useRef, useMemo } from 'react';

import {
  ArdaItemsDataGrid,
  ArdaItemsDataGridRef,
} from '@/components/organisms/items-data-grid/items-data-grid';
import { ArdaConfirmDialog } from '@/components/atoms/confirm-dialog/confirm-dialog';
import {
  mockPublishedItems,
  mockDraftItems,
} from '@/components/molecules/data-grid/presets/items/items-mock-data';
import type { Item } from '@/types/reference/items/item-domain';

const meta: Meta = {
  title: 'Applications/Design/Items Data Grid',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// Helper Components
// ============================================================================

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-orange-500 text-orange-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder = 'Search items...',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
      <svg
        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// Stories
// ============================================================================

export const PublishedItems: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'published' | 'draft' | 'recent'>('published');
    const [searchTerm, setSearchTerm] = useState('');

    const items = useMemo(() => {
      let dataset = activeTab === 'draft' ? mockDraftItems : mockPublishedItems;

      if (searchTerm) {
        dataset = dataset.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      return dataset;
    }, [activeTab, searchTerm]);

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
          <TabButton active={activeTab === 'published'} onClick={() => setActiveTab('published')}>
            Published ({mockPublishedItems.length})
          </TabButton>
          <TabButton active={activeTab === 'draft'} onClick={() => setActiveTab('draft')}>
            Draft ({mockDraftItems.length})
          </TabButton>
          <TabButton active={activeTab === 'recent'} onClick={() => setActiveTab('recent')}>
            Recently Uploaded (0)
          </TabButton>
        </div>

        {/* Search bar */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="max-w-md">
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 px-6 py-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow">
            <ArdaItemsDataGrid items={items} activeTab={activeTab} />
          </div>
        </div>
      </div>
    );
  },
};

export const EmptyState: Story = {
  render: () => {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
          <TabButton active={true} onClick={() => {}}>
            Published (0)
          </TabButton>
          <TabButton active={false} onClick={() => {}}>
            Draft (0)
          </TabButton>
          <TabButton active={false} onClick={() => {}}>
            Recently Uploaded (0)
          </TabButton>
        </div>

        {/* Search bar */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="max-w-md">
            <SearchInput value="" onChange={() => {}} />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 px-6 py-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow">
            <ArdaItemsDataGrid items={[]} activeTab="published" />
          </div>
        </div>
      </div>
    );
  },
};

export const CellEditing: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');
    const [items, setItems] = useState(mockPublishedItems.slice(0, 10));
    const [editedCount, setEditedCount] = useState(0);

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
            <div className="text-sm text-gray-600">
              Edited: <span className="font-semibold">{editedCount}</span> items
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
          <TabButton active={activeTab === 'published'} onClick={() => setActiveTab('published')}>
            Published ({items.length})
          </TabButton>
          <TabButton active={activeTab === 'draft'} onClick={() => setActiveTab('draft')}>
            Draft (0)
          </TabButton>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <p className="text-sm text-blue-800">
            Double-click cells to edit. Try editing the Name, SKU, or Card Size columns.
          </p>
        </div>

        {/* Grid */}
        <div className="flex-1 px-6 py-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow">
            <ArdaItemsDataGrid
              items={items}
              activeTab={activeTab}
              enableCellEditing={true}
              onItemUpdated={() => setEditedCount((c) => c + 1)}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const UnsavedChanges: Story = {
  render: () => {
    const gridRef = useRef<ArdaItemsDataGridRef>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [items] = useState(mockPublishedItems.slice(0, 10));

    const handleSave = () => {
      gridRef.current?.saveAllDrafts();
      setHasUnsavedChanges(false);
    };

    const handleDiscard = () => {
      gridRef.current?.discardAllDrafts();
      setShowConfirmDialog(false);
      setHasUnsavedChanges(false);
    };

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-orange-600 font-medium">
                  You have unsaved changes
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
          <TabButton active={true} onClick={() => {}}>
            Published ({items.length})
          </TabButton>
          <TabButton active={false} onClick={() => {}}>
            Draft (0)
          </TabButton>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <p className="text-sm text-blue-800">
            Edit cells to see unsaved changes banner. Try saving or discarding changes.
          </p>
        </div>

        {/* Grid */}
        <div className="flex-1 px-6 py-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow">
            <ArdaItemsDataGrid
              ref={gridRef}
              items={items}
              activeTab="published"
              enableCellEditing={true}
              onUnsavedChangesChange={setHasUnsavedChanges}
            />
          </div>
        </div>

        {/* Confirm Dialog */}
        <ArdaConfirmDialog
          open={showConfirmDialog}
          title="Discard unsaved changes?"
          message="All unsaved changes will be lost. This action cannot be undone."
          confirmLabel="Discard"
          cancelLabel="Cancel"
          confirmVariant="destructive"
          onConfirm={handleDiscard}
          onCancel={() => setShowConfirmDialog(false)}
        />
      </div>
    );
  },
};

export const Paginated: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const allItems = mockPublishedItems;
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentItems = allItems.slice(startIndex, endIndex);

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
          <TabButton active={true} onClick={() => {}}>
            Published ({totalItems})
          </TabButton>
          <TabButton active={false} onClick={() => {}}>
            Draft (0)
          </TabButton>
        </div>

        {/* Grid */}
        <div className="flex-1 px-6 py-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow">
            <ArdaItemsDataGrid
              items={currentItems}
              activeTab="published"
              paginationData={{
                currentPage: page,
                currentPageSize: pageSize,
                totalItems,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
              }}
              onNextPage={() => setPage((p) => Math.min(p + 1, totalPages))}
              onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
              onFirstPage={() => setPage(1)}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const items = useMemo(() => {
      if (!searchTerm) return mockPublishedItems;
      return mockPublishedItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }, [searchTerm]);

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
            <div className="flex items-center gap-4">
              {selectedItems.length > 0 && (
                <>
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} item(s) selected
                  </span>
                  <button className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600">
                    Add to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
          <TabButton active={true} onClick={() => {}}>
            Published ({items.length})
          </TabButton>
          <TabButton active={false} onClick={() => {}}>
            Draft (0)
          </TabButton>
        </div>

        {/* Search bar */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="max-w-md">
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 px-6 py-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow">
            <ArdaItemsDataGrid
              items={items}
              activeTab="published"
              onSelectionChange={setSelectedItems}
            />
          </div>
        </div>
      </div>
    );
  },
};
