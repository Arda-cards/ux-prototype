import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

const meta = {
  title: 'Components/Canary/Primitives/Tabs (Image Context)',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tabs primitive as used in the image comparison workflow (Current vs New image).',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Current vs New tabs each with a colored placeholder simulating image content. */
export const CurrentVsNew: Story = {
  render: () => (
    <Tabs defaultValue="current" className="w-64">
      <TabsList>
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="new">New</TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <div className="mt-2 size-48 rounded bg-blue-200 flex items-center justify-center text-blue-700 text-sm font-medium">
          Current Image
        </div>
      </TabsContent>
      <TabsContent value="new">
        <div className="mt-2 size-48 rounded bg-green-200 flex items-center justify-center text-green-700 text-sm font-medium">
          New Image
        </div>
      </TabsContent>
    </Tabs>
  ),
};

/** "Current" tab shows initials placeholder; "New" tab shows a colored square. */
export const WithPlaceholder: Story = {
  render: () => (
    <Tabs defaultValue="current" className="w-64">
      <TabsList>
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="new">New</TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <div className="mt-2 size-48 rounded bg-muted flex items-center justify-center text-muted-foreground text-2xl font-semibold select-none">
          HB
        </div>
      </TabsContent>
      <TabsContent value="new">
        <div className="mt-2 size-48 rounded bg-orange-300" />
      </TabsContent>
    </Tabs>
  ),
};
