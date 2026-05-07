import type { LucideIcon } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { Button } from '@/components/canary/atoms/button';
import { Separator } from '@/components/canary/primitives/separator';
import { ArdaSearchInput } from '../../atoms/search-input/search-input';

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

/** Combined props for AppHeader. */
export interface AppHeaderProps
  extends
    ArdaAppHeaderStaticConfig,
    ArdaAppHeaderRuntimeConfig,
    React.HTMLAttributes<HTMLElement> {}

/** @deprecated Use AppHeaderProps */
export type ArdaAppHeaderProps = AppHeaderProps;

// --- Component ---

/**
 * AppHeader — top navigation bar with search, labeled actions, and icon actions.
 *
 * Composes ArdaSearchInput, Button, and Separator atoms.
 */
export function AppHeader({
  buttonActions,
  actions,
  searchPlaceholder = 'Search',
  showSearch = true,
  leading,
  searchValue,
  onSearchChange,
  className,
  children,
  ...props
}: AppHeaderProps) {
  const visibleActions = actions?.filter((a) => a.visible !== false);

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-1.5 bg-background px-3 sm:gap-2 sm:px-6',
        className,
      )}
      {...props}
    >
      {/* Leading content (sidebar trigger, breadcrumbs, etc.) */}
      {leading}

      {/* Center content (tabs, title, etc.) */}
      {children}

      {/* Right-aligned toolbar */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Search */}
        {showSearch && (
          <>
            <ArdaSearchInput
              placeholder={searchPlaceholder}
              {...(searchValue !== undefined ? { value: searchValue } : {})}
              {...(onSearchChange ? { onChange: onSearchChange } : {})}
            />
            <Separator orientation="vertical" className="h-5" />
          </>
        )}

        {/* Labeled button actions (e.g., Scan) */}
        {buttonActions?.map((action) => {
          const Icon = action.icon;
          return (
            <Button key={action.key} variant="outline" size="sm" onClick={action.onClick}>
              <Icon className="size-4 sm:mr-1" />
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          );
        })}

        {/* Icon actions (e.g., Help, Notifications) */}
        {visibleActions?.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.key}
              variant="ghost"
              size="icon"
              tooltip={action.label}
              aria-label={action.label}
              className="relative"
              {...(action.onClick ? { onClick: action.onClick } : {})}
            >
              <Icon className="size-5" />
              {action.badgeCount !== undefined && action.badgeCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold leading-none px-1"
                  role="status"
                  aria-label={`${action.badgeCount} notification${action.badgeCount === 1 ? '' : 's'}`}
                >
                  {action.badgeCount > 99 ? '99+' : action.badgeCount}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </header>
  );
}

/** @deprecated Use AppHeader */
export const ArdaAppHeader = AppHeader;
