import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './input';
import { Label } from './label';
import { Separator } from './separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';

// --- Composed primitives demo ---

function PrimitivesDemo() {
  return (
    <TooltipProvider>
      <div className="space-y-8 p-6 max-w-lg">
        {/* Input + Label */}
        <div className="space-y-2">
          <Label htmlFor="demo-input">Label + Input</Label>
          <Input id="demo-input" placeholder="Type something..." />
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Details</TabsTrigger>
            <TabsTrigger value="tab3">History</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="text-sm text-muted-foreground pt-2">Overview content panel.</p>
          </TabsContent>
          <TabsContent value="tab2">
            <p className="text-sm text-muted-foreground pt-2">Details content panel.</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p className="text-sm text-muted-foreground pt-2">History content panel.</p>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Tooltip */}
        <div className="flex gap-4 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-sm underline underline-offset-2 text-primary cursor-pointer">
                Hover for tooltip
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Tooltip from primitives/tooltip</TooltipContent>
          </Tooltip>

          {/* DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm border border-input rounded-md px-3 py-1.5 cursor-pointer">
                Open menu
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Action A</DropdownMenuItem>
              <DropdownMenuItem>Action B</DropdownMenuItem>
              <DropdownMenuItem>Action C</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-sm border border-input rounded-md px-3 py-1.5 cursor-pointer">
                Open sheet
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Sheet from primitives/sheet</SheetTitle>
              </SheetHeader>
              <p className="text-sm text-muted-foreground mt-4">
                This sheet is rendered from the canary primitives directory.
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </TooltipProvider>
  );
}

const meta = {
  title: 'Components/Canary/Primitives/ImportCheck',
  component: PrimitivesDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Integration smoke test — verifies that all canary primitives can be imported and rendered together. Not a documentation story; stock shadcn components are documented on https://ui.shadcn.com.',
      },
    },
  },
} satisfies Meta<typeof PrimitivesDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPrimitives: Story = {};
