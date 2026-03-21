import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/canary/primitives/button';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './card';

const meta = {
  title: 'Components/Canary/Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card container with header, content, footer, and action slots. ' +
          'Compose with CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  argTypes: {
    className: { control: 'text' },
  },
  args: {
    className: 'w-80',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Card body content.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
        <Button size="sm" className="ml-2">
          Confirm
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Inventory Summary</CardTitle>
        <CardDescription>Overview of current stock levels.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">You have 142 items across 8 locations.</p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Order Queue</CardTitle>
        <CardDescription>Pending purchase orders.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">3 orders awaiting approval.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Delete Item</CardTitle>
        <CardDescription>This action cannot be undone.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>WDG-4420-BLK</strong>?
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
        <Button size="sm" variant="destructive" className="ml-2">
          Delete
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          Header + Content
        </span>
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description text.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Body content.</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          With Action
        </span>
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description text.</CardDescription>
            <CardAction>
              <Button size="sm" variant="outline">
                Action
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Body content.</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          With Footer
        </span>
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Body content.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
            <Button size="sm" className="ml-2">
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  ),
};
