import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Printer,
  Download,
  Trash2,
  Plus,
  ShoppingCart,
  SlidersHorizontal,
  Tag,
  Copy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { OverflowToolbar } from './overflow-toolbar';

const meta = {
  title: 'Components/Canary/Molecules/OverflowToolbar',
  component: OverflowToolbar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Responsive toolbar that renders children inline and collapses overflow items into a dropdown menu. ' +
          'Uses ResizeObserver — no breakpoints needed. Resize the browser to see items move in and out of the overflow.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OverflowToolbar>;

export default meta;
type Story = StoryObj<typeof OverflowToolbar>;

/** All buttons fit — no overflow menu shown. */
export const Default: Story = {
  render: () => (
    <OverflowToolbar>
      <Button
        variant="outline"
        size="sm"
        data-overflow-label="Print"
        onClick={() => console.log('Print')}
      >
        <Printer className="mr-1.5 h-4 w-4" />
        Print cards
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-overflow-label="Export"
        onClick={() => console.log('Export')}
      >
        <Download className="mr-1.5 h-4 w-4" />
        Export
      </Button>
      <Button size="sm" data-overflow-label="Add item" onClick={() => console.log('Add')}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add item
      </Button>
    </OverflowToolbar>
  ),
};

/** Many buttons — resize the window to see items overflow. */
export const ManyItems: Story = {
  render: () => (
    <OverflowToolbar>
      <Button
        variant="outline"
        size="sm"
        data-overflow-label="Print cards"
        onClick={() => console.log('Print')}
      >
        <Printer className="mr-1.5 h-4 w-4" />
        Print cards
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-overflow-label="Add to queue"
        onClick={() => console.log('Queue')}
      >
        <ShoppingCart className="mr-1.5 h-4 w-4" />
        Add to queue
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-overflow-label="Export"
        onClick={() => console.log('Export')}
      >
        <Download className="mr-1.5 h-4 w-4" />
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-overflow-label="Duplicate"
        onClick={() => console.log('Duplicate')}
      >
        <Copy className="mr-1.5 h-4 w-4" />
        Duplicate
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-overflow-label="Print labels"
        onClick={() => console.log('Labels')}
      >
        <Tag className="mr-1.5 h-4 w-4" />
        Print labels
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-overflow-label="View columns"
        onClick={() => console.log('View')}
      >
        <SlidersHorizontal className="mr-1.5 h-4 w-4" />
        View
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        data-overflow-label="Delete"
        onClick={() => console.log('Delete')}
      >
        <Trash2 className="mr-1.5 h-4 w-4" />
        Delete
      </Button>
    </OverflowToolbar>
  ),
};

/** Constrained width — forces overflow. */
export const Constrained: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <OverflowToolbar>
        <Button
          variant="outline"
          size="sm"
          data-overflow-label="Print cards"
          onClick={() => console.log('Print')}
        >
          <Printer className="mr-1.5 h-4 w-4" />
          Print cards
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-overflow-label="Add to queue"
          onClick={() => console.log('Queue')}
        >
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          Add to queue
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-overflow-label="Export"
          onClick={() => console.log('Export')}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          data-overflow-label="Delete"
          onClick={() => console.log('Delete')}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete
        </Button>
      </OverflowToolbar>
    </div>
  ),
};
