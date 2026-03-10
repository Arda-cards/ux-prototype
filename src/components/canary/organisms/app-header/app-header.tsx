import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArdaSearchInput } from '../../atoms/search-input/search-input';
import { ArdaIconButton } from '../../atoms/icon-button/icon-button';

// --- Types ---

/** An action displayed in the header toolbar. */
export interface HeaderAction {
  /** Unique key for the action. */
  key: string;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Accessible label for the action. */
  label: string;
  /** Notification badge count. */
  badgeCount?: number;
  /** Called when the action is clicked. */
  onClick?: () => void;
  /** Whether this action is visible. Defaults to true. */
  visible?: boolean;
}

/** A labeled button with icon, displayed as a prominent action (e.g., "Scan"). */
export interface HeaderButtonAction {
  /** Unique key for the button. */
  key: string;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Button label text. */
  label: string;
  /** Called when the button is clicked. */
  onClick?: () => void;
}

/** Design-time configuration — structural properties set at composition time. */
export interface ArdaAppHeaderStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Labeled button actions (e.g., Scan). Rendered before icon actions. */
  buttonActions?: HeaderButtonAction[];
  /** Icon-only actions (e.g., Help, Notifications). Rendered after button actions. */
  actions?: HeaderAction[];
  /** Search placeholder text. */
  searchPlaceholder?: string;
  /** Whether to show the search field. Defaults to true. */
  showSearch?: boolean;
  /** Content rendered on the far left of the header (e.g., sidebar trigger, breadcrumbs). */
  leading?: React.ReactNode;
}

/** Runtime configuration — properties that change during component lifetime. */
export interface ArdaAppHeaderRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Controlled search value. */
  searchValue?: string;
  /** Called when the search value changes. */
  onSearchChange?: (value: string) => void;
}

/** Combined props for ArdaAppHeader. */
export interface ArdaAppHeaderProps
  extends
    ArdaAppHeaderStaticConfig,
    ArdaAppHeaderRuntimeConfig,
    React.HTMLAttributes<HTMLElement> {}

// --- Component ---

/**
 * ArdaAppHeader — top navigation bar with search, labeled actions, and icon actions.
 *
 * Composes ArdaSearchInput and ArdaIconButton atoms with shadcn/ui Button and Separator.
 */
export function ArdaAppHeader({
  buttonActions,
  actions,
  searchPlaceholder = 'Search',
  showSearch = true,
  leading,
  searchValue,
  onSearchChange,
  className,
  ...props
}: ArdaAppHeaderProps) {
  const visibleActions = actions?.filter((a) => a.visible !== false);

  return (
    <header
      className={cn('flex h-16 items-center border-b bg-background px-4 py-2', className)}
      {...props}
    >
      {/* Leading content (sidebar trigger, breadcrumbs, etc.) */}
      {leading}

      {/* Right-aligned toolbar */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Search */}
        {showSearch && (
          <>
            <ArdaSearchInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
            />
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Labeled button actions (e.g., Scan) */}
        {buttonActions?.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.key}
              variant="outline"
              size="default"
              className="bg-secondary text-foreground font-medium"
              onClick={action.onClick}
            >
              <Icon className="size-4" />
              {action.label}
            </Button>
          );
        })}

        {/* Icon actions (e.g., Help, Notifications) */}
        {visibleActions?.map((action) => (
          <ArdaIconButton
            key={action.key}
            icon={action.icon}
            label={action.label}
            badgeCount={action.badgeCount}
            onClick={action.onClick}
          />
        ))}
      </div>
    </header>
  );
}
