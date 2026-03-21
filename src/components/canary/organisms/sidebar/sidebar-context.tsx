'use client';

// Re-export shadcn sidebar context hook as the canonical way to access sidebar state.
// This replaces our custom SidebarContext — shadcn handles state, mobile detection,
// keyboard shortcuts, and cookie persistence.
export { useSidebar } from '@/components/canary/primitives/sidebar';
