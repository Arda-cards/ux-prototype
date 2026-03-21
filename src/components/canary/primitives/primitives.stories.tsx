import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from './button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Input } from './input';
import { Label } from './label';
import { Separator } from './separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { Skeleton } from './skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Textarea } from './textarea';
import { Toggle } from './toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

// Sidebar is excluded — it requires SidebarProvider context and is better
// demonstrated in the Sidebar organism stories.

// --- Composed primitives demo ---

function PrimitivesDemo() {
  const [toggleOn, setToggleOn] = useState(false);

  return (
    <TooltipProvider>
      <div className="space-y-8 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold">Canary Primitives Import Check</h2>
        <p className="text-sm text-muted-foreground">
          Verifies that all 13 stock shadcn primitives can be imported and rendered. Sidebar is
          excluded (requires SidebarProvider context).
        </p>

        <Separator />

        {/* 1. Button */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">1. Button</h3>
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              Default
            </Button>
            <Button variant="destructive" size="sm">
              Destructive
            </Button>
            <Button variant="outline" size="sm">
              Outline
            </Button>
            <Button variant="ghost" size="sm">
              Ghost
            </Button>
          </div>
        </section>

        <Separator />

        {/* 2. Collapsible */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">2. Collapsible</h3>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <ChevronDown className="mr-1 h-4 w-4" />
                Toggle collapsible
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="mt-2 text-sm text-muted-foreground rounded border p-3">
                Collapsible content is visible.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </section>

        <Separator />

        {/* 3. DropdownMenu */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">3. DropdownMenu</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Open menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Action A</DropdownMenuItem>
              <DropdownMenuItem>Action B</DropdownMenuItem>
              <DropdownMenuItem>Action C</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        <Separator />

        {/* 4. Input + 5. Label */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">4. Input + 5. Label</h3>
          <div className="space-y-1">
            <Label htmlFor="demo-input">Email address</Label>
            <Input id="demo-input" placeholder="user@example.com" />
          </div>
        </section>

        <Separator />

        {/* 6. Separator — already used above as dividers */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            6. Separator (used throughout)
          </h3>
        </section>

        <Separator />

        {/* 7. Sheet */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">7. Sheet</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Open sheet
              </Button>
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
        </section>

        <Separator />

        {/* 8. Skeleton */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">8. Skeleton</h3>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </section>

        <Separator />

        {/* 9. Table */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">9. Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Surgical Gloves</TableCell>
                <TableCell className="font-mono text-sm">GLV-001</TableCell>
                <TableCell className="text-right">$12.50</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Disinfectant Spray</TableCell>
                <TableCell className="font-mono text-sm">DSF-042</TableCell>
                <TableCell className="text-right">$8.75</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        <Separator />

        {/* 10. Tabs */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">10. Tabs</h3>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground pt-2">Overview content.</p>
            </TabsContent>
            <TabsContent value="details">
              <p className="text-sm text-muted-foreground pt-2">Details content.</p>
            </TabsContent>
            <TabsContent value="history">
              <p className="text-sm text-muted-foreground pt-2">History content.</p>
            </TabsContent>
          </Tabs>
        </section>

        <Separator />

        {/* 11. Textarea */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">11. Textarea</h3>
          <Textarea placeholder="Enter notes here..." rows={3} />
        </section>

        <Separator />

        {/* 12. Toggle */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">12. Toggle</h3>
          <Toggle pressed={toggleOn} onPressedChange={setToggleOn} size="sm" aria-label="Bold">
            <strong>B</strong>
          </Toggle>
          <span className="text-sm text-muted-foreground ml-2">
            {toggleOn ? 'Pressed' : 'Not pressed'}
          </span>
        </section>

        <Separator />

        {/* 13. Tooltip */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">13. Tooltip</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                Hover for tooltip
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Tooltip from primitives/tooltip</TooltipContent>
          </Tooltip>
        </section>
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
          'Integration smoke test — verifies that all 13 canary primitives (excluding Sidebar which requires SidebarProvider) can be imported and rendered. Stock shadcn components are documented on https://ui.shadcn.com.',
      },
    },
  },
} satisfies Meta<typeof PrimitivesDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPrimitives: Story = {};
