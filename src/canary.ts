// Canary exports — in-development components not yet promoted to stable.
// Consumers: import { ... } from '@arda-cards/design-system/canary';

// --- Atoms ---

export { ArdaBadge } from './components/canary/atoms/badge/badge';
export type { ArdaBadgeProps } from './components/canary/atoms/badge/badge';

export { BrandLogo, BrandIcon } from './components/canary/atoms/brand-logo/brand-logo';

export { IconLabel } from './components/canary/atoms/icon-label/icon-label';
export type { IconLabelProps } from './components/canary/atoms/icon-label/icon-label';

export {
  ReadOnlyField,
  readOnlyFieldVariants,
} from './components/canary/atoms/read-only-field/read-only-field';
export type {
  ReadOnlyFieldProps,
  ReadOnlyFieldStaticConfig,
  ReadOnlyFieldRuntimeConfig,
} from './components/canary/atoms/read-only-field/read-only-field';

// Cell atoms: text
export {
  TextCellDisplay,
  TextCellEditor,
  createTextCellEditor,
} from './components/canary/atoms/grid/text';
export type {
  TextCellDisplayProps,
  TextCellDisplayStaticConfig,
  TextCellEditorProps,
  TextCellEditorStaticConfig,
  TextCellEditorHandle,
} from './components/canary/atoms/grid/text';

// Cell atoms: number
export {
  NumberCellDisplay,
  NumberCellEditor,
  createNumberCellEditor,
} from './components/canary/atoms/grid/number';
export type {
  NumberCellDisplayProps,
  NumberCellDisplayStaticConfig,
  NumberCellEditorProps,
  NumberCellEditorStaticConfig,
  NumberCellEditorHandle,
} from './components/canary/atoms/grid/number';

// Cell atoms: boolean
export {
  BooleanCellDisplay,
  BooleanCellEditor,
  createBooleanCellEditor,
} from './components/canary/atoms/grid/boolean';
export type {
  BooleanCellDisplayProps,
  BooleanCellDisplayStaticConfig,
  BooleanCellEditorProps,
  BooleanCellEditorStaticConfig,
  BooleanCellEditorHandle,
} from './components/canary/atoms/grid/boolean';

// Cell atoms: date
export {
  DateCellDisplay,
  DateCellEditor,
  createDateCellEditor,
} from './components/canary/atoms/grid/date';
export type {
  DateCellDisplayProps,
  DateCellDisplayStaticConfig,
  DateCellEditorProps,
  DateCellEditorStaticConfig,
  DateCellEditorHandle,
} from './components/canary/atoms/grid/date';

// Cell atoms: enum
export {
  EnumCellDisplay,
  EnumCellEditor,
  createEnumCellEditor,
} from './components/canary/atoms/grid/enum';
export type {
  EnumCellDisplayProps,
  EnumCellDisplayStaticConfig,
  EnumCellEditorProps,
  EnumCellEditorStaticConfig,
  EnumCellEditorHandle,
} from './components/canary/atoms/grid/enum';

// Cell atoms: memo
export {
  MemoCellDisplay,
  MemoCellEditor,
  createMemoCellEditor,
  MemoButtonCell,
  createMemoButtonCellEditor,
} from './components/canary/atoms/grid/memo';
export type {
  MemoCellDisplayProps,
  MemoCellDisplayStaticConfig,
  MemoCellDisplayRuntimeConfig,
  MemoCellEditorProps,
  MemoCellEditorStaticConfig,
  MemoCellEditorHandle,
  MemoButtonCellProps,
  MemoButtonCellEditorConfig,
  MemoButtonCellEditorProps,
  MemoButtonCellEditorHandle,
} from './components/canary/atoms/grid/memo';

// Cell atoms: color
export {
  ColorCellDisplay,
  ColorCellEditor,
  createColorCellEditor,
  DEFAULT_COLOR_MAP,
} from './components/canary/atoms/grid/color';
export type {
  ColorCellDisplayProps,
  ColorCellDisplayStaticConfig,
  ColorCellDisplayRuntimeConfig,
  ColorOption,
  ColorCellEditorProps,
  ColorCellEditorStaticConfig,
  ColorCellEditorHandle,
} from './components/canary/atoms/grid/color';

// Cell atoms: action
export { ActionCellRenderer } from './components/canary/atoms/grid/action';
export type {
  RowAction,
  ActionCellRendererStaticConfig,
  ActionCellRendererRuntimeConfig,
  ActionCellRendererProps,
} from './components/canary/atoms/grid/action';

// --- Molecules ---

export { DataGrid, GridImage, useColumnPersistence } from './components/canary/molecules/data-grid';
export type {
  DataGridRef,
  DataGridProps,
  DataGridStaticConfig,
  DataGridInitConfig,
  DataGridRuntimeConfig,
  PaginationData,
} from './components/canary/molecules/data-grid';

// --- Molecules — Sidebar ---

export { ArdaSidebarHeader } from './components/canary/molecules/sidebar/sidebar-header';
export type {
  ArdaSidebarHeaderProps,
  TeamOption,
} from './components/canary/molecules/sidebar/sidebar-header';

export { SidebarNav } from './components/canary/molecules/sidebar/sidebar-nav';

export { SidebarNavItem } from './components/canary/molecules/sidebar/sidebar-nav-item';
export type { SidebarNavItemProps } from './components/canary/molecules/sidebar/sidebar-nav-item';

export { SidebarNavGroup } from './components/canary/molecules/sidebar/sidebar-nav-group';
export type { SidebarNavGroupProps } from './components/canary/molecules/sidebar/sidebar-nav-group';

export { SidebarUserMenu } from './components/canary/molecules/sidebar/sidebar-user-menu';
export type {
  SidebarUserMenuProps,
  UserMenuAction,
} from './components/canary/molecules/sidebar/sidebar-user-menu';

// --- Organisms ---

export {
  createEntityDataGrid,
  useDirtyTracking,
} from './components/canary/organisms/shared/entity-data-grid';
export type {
  EntityDataGridConfig,
  EntityDataGridModelProps,
  EntityDataGridViewProps,
  EntityDataGridProps,
  EntityDataGridRef,
  DirtyTrackingOptions,
  DirtyTrackingResult,
} from './components/canary/organisms/shared/entity-data-grid';

export { createEntityDataGridShim } from './components/canary/organisms/shared/entity-data-grid-shim';
export type {
  EntityDataGridShimViewProps,
  EntityDataGridShimProps,
  EntityDataGridShimRef,
} from './components/canary/organisms/shared/entity-data-grid-shim';

// --- Organisms — Sidebar ---

export { ArdaSidebar } from './components/canary/organisms/sidebar/sidebar';
export type { ArdaSidebarProps } from './components/canary/organisms/sidebar/sidebar';

// --- Molecules — ItemGrid ---

export {
  itemGridColumnDefs,
  itemGridDefaultColDef,
} from './components/canary/molecules/item-grid/item-grid-columns';
export { itemGridFixtures } from './components/canary/molecules/item-grid/item-grid-fixtures';

// --- Organisms — ItemGrid ---

export { ItemGrid } from './components/canary/organisms/item-grid/item-grid';
export type {
  ItemGridProps,
  ItemGridStaticConfig,
  ItemGridRuntimeConfig,
} from './components/canary/organisms/item-grid/item-grid';
