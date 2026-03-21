import type { Decorator } from '@storybook/react-vite';
import { SidebarProvider } from '@/components/canary/primitives/sidebar';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';

/**
 * Decorator that provides SidebarProvider + TooltipProvider context for
 * sidebar molecule stories. Renders the story in a dark sidebar-like
 * container with constrained width so molecules are visible in the
 * Storybook preview.
 *
 * This replaces wrapping with the full Sidebar organism, which creates a
 * fixed-position layout that renders off-screen in the story iframe.
 */
export const withSidebarContext: Decorator = (Story) => (
  <TooltipProvider>
    <SidebarProvider defaultOpen>
      <div
        className="dark flex w-64 flex-col bg-sidebar text-sidebar-foreground"
        data-slot="sidebar"
      >
        <Story />
      </div>
    </SidebarProvider>
  </TooltipProvider>
);
