import type { LucideIcon } from 'lucide-react';

import { cn } from '@/types/canary/utils';
import { ArdaButton as Button } from '@/components/canary/atoms/button';
import { Separator } from '@/components/canary/primitives/separator';
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
  children,
  ...props
}: ArdaAppHeaderProps) {
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
        {visibleActions?.map((action) => (
          <ArdaIconButton
            key={action.key}
            icon={action.icon}
            label={action.label}
            {...(action.badgeCount !== undefined ? { badgeCount: action.badgeCount } : {})}
            {...(action.onClick ? { onClick: action.onClick } : {})}
          />
        ))}
      </div>
    </header>
  );
}
