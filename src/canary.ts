// Canary exports — in-development components not yet promoted to stable.
// Consumers: import { ... } from '@arda-cards/design-system/canary';

// --- Utilities and Types ---

export { getInitials } from './types/canary/utilities/get-initials';
export { getCroppedImage } from './types/canary/utilities/get-cropped-image';
export { setNestedField } from './types/canary/utilities/set-nested-field';
export { useDraft } from './types/canary/utilities/use-draft';
export type { UseDraftOptions, DraftState } from './types/canary/utilities/use-draft';
export type {
  FieldError,
  ValidationResult,
  Validator,
  EditPhase,
  EditLifecycleCallbacks,
  EditableComponentProps,
} from './types/canary/utilities/edit-lifecycle';
export type {
  ImageMimeType,
  ImageFieldStaticConfig,
  ImageFieldInitConfig,
  ImageFieldConfig,
  ImageInput,
  ImageInputFile,
  ImageInputUrl,
  ImageInputError,
  ImageUploadResult,
  PixelCrop,
  CropData,
} from './types/canary/utilities/image-field-config';

// --- Atoms ---

export { Badge, ArdaBadge } from './components/canary/atoms/badge/badge';
export type {
  BadgeProps,
  ArdaBadgeProps,
  ArdaBadgeStaticConfig,
  ArdaBadgeRuntimeConfig,
} from './components/canary/atoms/badge/badge';

export { Button, ArdaButton, buttonVariants } from './components/canary/atoms/button/button';
export type {
  ButtonProps,
  ArdaButtonProps,
  ArdaButtonStaticConfig,
  ArdaButtonRuntimeConfig,
} from './components/canary/atoms/button/button';

export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  ArdaDrawer,
  ArdaDrawerHeader,
  ArdaDrawerTitle,
  ArdaDrawerDescription,
  ArdaDrawerBody,
  ArdaDrawerFooter,
} from './components/canary/atoms/drawer/drawer';
export type {
  DrawerProps,
  ArdaDrawerProps,
  ArdaDrawerStaticConfig,
  ArdaDrawerRuntimeConfig,
} from './components/canary/atoms/drawer/drawer';

export { IconButton, ArdaIconButton } from './components/canary/atoms/icon-button/icon-button';
export type {
  IconButtonProps,
  ArdaIconButtonProps,
  ArdaIconButtonStaticConfig,
  ArdaIconButtonRuntimeConfig,
} from './components/canary/atoms/icon-button/icon-button';

export { BrandLogo, BrandIcon } from './components/canary/atoms/brand-logo/brand-logo';
export type {
  BrandLogoProps,
  BrandIconProps,
} from './components/canary/atoms/brand-logo/brand-logo';

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

// Cell atoms: select
export {
  SelectCellDisplay,
  SelectCellEditor,
  createSelectCellEditor,
} from './components/canary/atoms/grid/select';
export type {
  SelectCellDisplayProps,
  SelectCellDisplayStaticConfig,
  SelectCellDisplayRuntimeConfig,
  SelectCellEditorProps,
  SelectCellEditorStaticConfig,
  SelectCellEditorHandle,
  SelectOption,
  SelectOptions,
} from './components/canary/atoms/grid/select';

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

// Cell atoms: image
export {
  ImageCellDisplay,
  ImageCellEditor,
  createImageCellEditor,
} from './components/canary/atoms/grid/image';
export type {
  ImageCellDisplayProps,
  ImageCellEditorProps,
  ImageCellEditorConfig,
  ImageCellEditorHandle,
} from './components/canary/atoms/grid/image';

// Atoms: CopyrightAcknowledgment
export { CopyrightAcknowledgment } from './components/canary/atoms/copyright-acknowledgment';
export type { CopyrightAcknowledgmentProps } from './components/canary/atoms/copyright-acknowledgment';

// Atoms: ColorPicker
export { ColorPicker, getColorHex } from './components/canary/atoms/color-picker/color-picker';
export type { ColorPickerProps } from './components/canary/atoms/color-picker/color-picker';

// Cell atoms: action
export { ActionCellRenderer } from './components/canary/atoms/grid/action';
export type {
  RowAction,
  ActionCellRendererStaticConfig,
  ActionCellRendererRuntimeConfig,
  ActionCellRendererProps,
} from './components/canary/atoms/grid/action';

// --- Molecules ---

// Molecules: Image components
export { ImageDisplay } from './components/canary/molecules/image-display';
export type { ImageDisplayProps } from './components/canary/molecules/image-display';

export { ImageDropZone } from './components/canary/molecules/image-drop-zone';
export type { ImageDropZoneProps } from './components/canary/molecules/image-drop-zone';

export { ImagePreviewEditor } from './components/canary/molecules/image-preview-editor';
export type { ImagePreviewEditorProps } from './components/canary/molecules/image-preview-editor';

export { ImageHoverPreview } from './components/canary/molecules/image-hover-preview';
export type { ImageHoverPreviewProps } from './components/canary/molecules/image-hover-preview';

export { ImageInspectorOverlay } from './components/canary/molecules/image-inspector-overlay';
export type { ImageInspectorOverlayProps } from './components/canary/molecules/image-inspector-overlay';

export { ImageComparisonLayout } from './components/canary/molecules/image-comparison-layout';
export type { ImageComparisonLayoutProps } from './components/canary/molecules/image-comparison-layout';

export { ImageFormField } from './components/canary/molecules/form/image';
export type { ImageFormFieldProps } from './components/canary/molecules/form/image';

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

export {
  SidebarHeader,
  ArdaSidebarHeader,
} from './components/canary/molecules/sidebar/sidebar-header';
export type {
  SidebarHeaderProps,
  ArdaSidebarHeaderProps,
  ArdaSidebarHeaderStaticConfig,
  ArdaSidebarHeaderRuntimeConfig,
  TeamOption,
} from './components/canary/molecules/sidebar/sidebar-header';

export { SidebarNav } from './components/canary/molecules/sidebar/sidebar-nav';
export type { SidebarNavProps } from './components/canary/molecules/sidebar/sidebar-nav';

export { SidebarNavItem } from './components/canary/molecules/sidebar/sidebar-nav-item';
export type {
  SidebarNavItemProps,
  SidebarNavItemStaticConfig,
  SidebarNavItemRuntimeConfig,
} from './components/canary/molecules/sidebar/sidebar-nav-item';

export { SidebarNavGroup } from './components/canary/molecules/sidebar/sidebar-nav-group';
export type { SidebarNavGroupProps } from './components/canary/molecules/sidebar/sidebar-nav-group';

export { SidebarUserMenu } from './components/canary/molecules/sidebar/sidebar-user-menu';
export type {
  SidebarUserMenuProps,
  UserMenuAction,
} from './components/canary/molecules/sidebar/sidebar-user-menu';

// --- Molecules — ItemGrid ---

export {
  itemGridColumnDefs,
  itemGridDefaultColDef,
  createItemGridColumnDefs,
} from './components/canary/molecules/item-grid/item-grid-columns';
export type {
  ItemGridLookups,
  ItemGridEditorHooks,
} from './components/canary/molecules/item-grid/item-grid-columns';

export { itemGridFixtures } from './components/canary/molecules/item-grid/item-grid-fixtures';

// --- Organisms ---

export {
  createEntityDataGrid,
  useDirtyTracking,
  useRowAutoPublish,
} from './components/canary/organisms/shared/entity-data-grid';
export type {
  EntityDataGridConfig,
  EntityDataGridModelProps,
  EntityDataGridViewProps,
  EntityDataGridProps,
  EntityDataGridRef,
  PaginationMode,
  PendingChanges,
  RowEditState,
  RowAutoPublishHandle,
  UseRowAutoPublishOptions,
  DirtyTrackingOptions,
  DirtyTrackingResult,
} from './components/canary/organisms/shared/entity-data-grid';

// Organisms: ImageUploadDialog
export { ImageUploadDialog } from './components/canary/organisms/shared/image-upload-dialog';
export type { ImageUploadDialogProps } from './components/canary/organisms/shared/image-upload-dialog';

// Image upload abstraction (4.11.7+): single uploader interface + Context provider
// replaces the previous per-callback props (onUpload/onUploadFromUrl/
// onCheckReachability). See types/canary/utilities/image-uploader.
export {
  ImageUploadProvider,
  useImageUploader,
  defaultImageUploader,
} from './types/canary/utilities/image-uploader';
export type {
  ImageUploader,
  ImageUploadProviderProps,
} from './types/canary/utilities/image-uploader';

export { createEntityDataGridShim } from './components/canary/organisms/shared/entity-data-grid-shim';
export type {
  EntityDataGridShimViewProps,
  EntityDataGridShimProps,
  EntityDataGridShimRef,
} from './components/canary/organisms/shared/entity-data-grid-shim';

// --- Organisms — Sidebar ---

export { Sidebar, ArdaSidebar } from './components/canary/organisms/sidebar/sidebar';
export type {
  SidebarProps,
  ArdaSidebarProps,
  ArdaSidebarStaticConfig,
  ArdaSidebarRuntimeConfig,
} from './components/canary/organisms/sidebar/sidebar';

// --- Organisms — AppHeader ---

export { AppHeader, ArdaAppHeader } from './components/canary/organisms/app-header/app-header';
export type {
  AppHeaderProps,
  ArdaAppHeaderProps,
  ArdaAppHeaderStaticConfig,
  ArdaAppHeaderRuntimeConfig,
  HeaderAction,
  HeaderButtonAction,
} from './components/canary/organisms/app-header/app-header';

// --- Organisms — ItemDetails ---

export {
  ItemDetails,
  ArdaItemDetails,
} from './components/canary/organisms/item-details/item-details';
export type {
  ItemDetailsProps,
  ArdaItemDetailsProps,
  ArdaItemDetailsStaticConfig,
  ArdaItemDetailsRuntimeConfig,
  ItemDetailsTab,
} from './components/canary/organisms/item-details/item-details';

// --- Molecules — TypeaheadInput ---

export { TypeaheadInput } from './components/canary/molecules/typeahead-input/typeahead-input';
export type {
  TypeaheadOption,
  TypeaheadInputProps,
} from './components/canary/molecules/typeahead-input/typeahead-input';

export { createTypeaheadCellEditor } from './components/canary/molecules/typeahead-input/typeahead-cell-editor';
export type { TypeaheadCellEditorConfig } from './components/canary/molecules/typeahead-input/typeahead-cell-editor';

// --- Organisms — ItemCardEditor ---

export {
  ItemCardEditor,
  EMPTY_ITEM_CARD_FIELDS,
} from './components/canary/organisms/item-card-editor/item-card-editor';
export type {
  ItemCardFields,
  ItemCardEditorProps,
  ItemCardEditorInitProps,
  ItemCardEditorRuntimeProps,
} from './components/canary/organisms/item-card-editor/item-card-editor';

// --- Organisms — ItemGrid ---

export { ItemGrid } from './components/canary/organisms/item-grid/item-grid';
export type {
  ItemGridProps,
  ItemGridStaticConfig,
  ItemGridRuntimeConfig,
  ItemGridHandle,
  ItemGridEditingHandle,
} from './components/canary/organisms/item-grid/item-grid';
