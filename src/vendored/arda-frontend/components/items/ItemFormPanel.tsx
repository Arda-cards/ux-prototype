'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XIcon, ChevronDown, AlertCircle, List, Info } from 'lucide-react';
import { cn } from '@frontend/lib/utils';
import { ItemCard } from './itemCard';
import type { ItemCardForm } from './itemCard';
import InputWrapper from '../input-wrapper';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { Textarea } from '@frontend/components/ui/textarea';
import { Button } from '@frontend/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@frontend/components/ui/select';
import { Switch } from '@frontend/components/ui/switch';
import { SupplierTypeahead } from './SupplierTypeahead';
import { TypeTypeahead } from './TypeTypeahead';
import { SubTypeTypeahead } from './SubTypeTypeahead';
import { UseCaseTypeahead } from './UseCaseTypeahead';
import { FacilityTypeahead } from './FacilityTypeahead';
import { DepartmentTypeahead } from './DepartmentTypeahead';
import { LocationTypeahead } from './LocationTypeahead';
import { SublocationTypeahead } from './SublocationTypeahead';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@frontend/components/ui/tooltip';
import type { ItemFormState } from '@frontend/constants/types';
import type { Item } from '@frontend/types/items';
import { createItem, createDraftItem, updateItem } from '@frontend/lib/ardaClient';
import { isItemFormValidForPublish } from '@frontend/lib/validators/itemFormValidator';
import { toast } from 'sonner';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import {
  defaultCardSize,
  defaultLabelSize,
  defaultBreadcrumbSize,
  defaultOrderMechanism,
  defaultQuantity,
} from '@frontend/types/items';
import { defaultMoney } from '@frontend/types/domain';
import { defaultDuration } from '@frontend/types/general';

import {
  orderMethodOptions,
  cardSizeOptions,
  labelSizeOptions,
  breadcrumbSizeOptions,
  currencyOptions,
} from '@frontend/constants/constants';

const initialFormState: ItemFormState = {
  name: '',
  imageUrl: '',
  classification: {
    type: '',
    subType: '',
  },
  useCase: '',
  locator: {
    facility: '',
    department: '',
    location: '',
    subLocation: '',
  },
  internalSKU: '',
  generalLedgerCode: '',
  minQuantity: defaultQuantity,
  notes: '',
  cardNotesDefault: '',
  taxable: true,
  primarySupply: {
    supplier: '',
    sku: '',
    orderMechanism: defaultOrderMechanism,
    url: '',
    minimumQuantity: defaultQuantity,
    orderQuantity: defaultQuantity,
    unitCost: defaultMoney,
    averageLeadTime: defaultDuration,
    orderCost: defaultMoney,
    isDefault: false,
  },
  secondarySupply: {
    supplier: '',
    sku: '',
    orderMechanism: defaultOrderMechanism,
    url: '',
    minimumQuantity: defaultQuantity,
    orderQuantity: defaultQuantity,
    unitCost: defaultMoney,
    averageLeadTime: defaultDuration,
    orderCost: defaultMoney,
    isDefault: false,
  },
  cardSize: defaultCardSize,
  labelSize: defaultLabelSize,
  breadcrumbSize: defaultBreadcrumbSize,
  color: 'BLUE',
};

// Move these components outside to prevent recreation on each render

const FormField = ({
  label,
  children,
  description,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
  required?: boolean;
}) => (
  <div className='flex flex-col gap-1'>
    <div className='flex items-center gap-1'>
      <Label className='text-sm font-medium leading-4 text-[var(--form-text-primary)]'>
        {label}
      </Label>
      {required && <span className='text-red-500'>*</span>}
      {description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              className='inline-flex p-0.5 rounded text-[var(--form-text-secondary)] hover:text-[var(--form-text-primary)] focus:outline-none focus:ring-1 focus:ring-gray-300'
              aria-label='More information'
            >
              <Info className='h-3.5 w-3.5 shrink-0' />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side='top'
            className='max-w-[280px] text-left'
            sideOffset={4}
          >
            {description}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    {children}
  </div>
);

const InputField = ({
  label,
  placeholder,
  value,
  onChange,
  description,
  prefix,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  prefix?: string;
}) => (
  <FormField label={label} description={description}>
    <div className='flex overflow-hidden rounded-lg shadow-sm border border-[var(--form-border)]'>
      {prefix && (
        <div className='flex items-center px-3 py-1 bg-[var(--form-background-secondary)] rounded-l-lg h-9'>
          <span className='text-sm text-[var(--form-text-secondary)]'>
            {prefix}
          </span>
        </div>
      )}
      <Input
        value={value || ''}
        onChange={(e) => {
          let newValue = e.target.value;
          // For URL fields with https:// prefix, ensure the value doesn't duplicate the prefix
          if (prefix === 'https://' && newValue.startsWith('https://')) {
            newValue = newValue.substring(8); // Remove the https:// part
          }
          onChange(newValue);
        }}
        placeholder={placeholder}
        className={`flex-1 border-none shadow-none rounded-none ${
          prefix ? 'rounded-r-lg' : 'rounded-lg'
        } h-9 text-sm text-[var(--form-text-secondary)] placeholder:text-[var(--form-text-secondary)]`}
      />
    </div>
  </FormField>
);

const SwitchField = ({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className='flex items-center gap-3'>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className='data-[state=checked]:bg-[var(--form-switch-active)] data-[state=unchecked]:bg-[var(--form-switch-inactive)] shrink-0'
    />
    <div className='flex items-center gap-1 flex-1 min-w-0'>
      <div className='text-sm font-medium leading-4 text-[var(--form-text-primary)]'>
        {label}
      </div>
      {description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              className='inline-flex p-0.5 rounded text-[var(--form-text-secondary)] hover:text-[var(--form-text-primary)] focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
              aria-label='More information'
            >
              <Info className='h-3.5 w-3.5' />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side='top'
            className='max-w-[280px] text-left'
            sideOffset={4}
          >
            {description}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  </div>
);

interface ItemFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void; // Optional callback for Cancel button (different from X button)
  itemToEdit?: Item | null;
  onSuccess?: () => void;
  /** When "Publish & add another" is used from edit: refresh list, close details panel, keep form open empty. */
  onPublishAndAddAnotherFromEdit?: () => void | Promise<void>;
  /** When "Publish & add another" is used from add item: refresh list, keep form open empty. */
  onPublishAndAddAnotherFromAddItem?: () => void | Promise<void>;
  isDuplicating?: boolean;
}

export const ItemFormPanel = ({
  isOpen,
  onClose,
  onCancel,
  itemToEdit,
  onSuccess,
  onPublishAndAddAnotherFromEdit,
  onPublishAndAddAnotherFromAddItem,
  isDuplicating = false,
}: ItemFormPanelProps) => {
  const { handleAuthError } = useAuthErrorHandler();
  const [form, setForm] = useState<ItemFormState>(initialFormState);
  const [errors, setErrors] = useState<string[]>([]);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usingDefaultImage, setUsingDefaultImage] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [imageFieldError, setImageFieldError] = useState<string | null>(null);

  // Refs for table of contents navigation
  const primarySupplierRef = useRef<HTMLDivElement>(null);
  const secondarySupplierRef = useRef<HTMLDivElement>(null);
  const orderingDetailsRef = useRef<HTMLDivElement>(null);
  const shopUsageRef = useRef<HTMLDivElement>(null);
  const cardSizingRef = useRef<HTMLDivElement>(null);
  const additionalInfoRef = useRef<HTMLDivElement>(null);

  // Ref to track if we just loaded from localStorage (to avoid immediate save)
  const justLoadedFromStorage = useRef(false);

  // LocalStorage key for draft form data
  const DRAFT_STORAGE_KEY = 'itemFormDraft';

  // Get localStorage key for edit drafts (includes entityId)
  const getEditDraftKey = (entityId: string | undefined) => {
    return entityId ? `itemFormEditDraft_${entityId}` : null;
  };

  // Function to scroll to section – center the section in view so the full container is framed and not cut off
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      setShowTableOfContents(false);
    }
  };

  // Function to save form to localStorage (for both new items and editing)
  const saveFormToLocalStorage = useCallback(
    (formData: ItemFormState, defaultImage: boolean) => {
      if (typeof window !== 'undefined') {
        try {
          const draftData = {
            form: formData,
            usingDefaultImage: defaultImage,
          };

          if (itemToEdit) {
            // Save edit draft with entityId-specific key
            const editKey = getEditDraftKey(itemToEdit.entityId);
            if (editKey) {
              localStorage.setItem(editKey, JSON.stringify(draftData));
            }
          } else {
            // Save new item draft
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
          }
        } catch (error) {
          console.error('Failed to save form draft to localStorage:', error);
        }
      }
    },
    [itemToEdit],
  );

  // Function to load form from localStorage
  const loadFormFromLocalStorage = useCallback(
    (
      entityId?: string,
    ): {
      form: ItemFormState | null;
      usingDefaultImage: boolean;
    } | null => {
      if (typeof window !== 'undefined') {
        try {
          let key = DRAFT_STORAGE_KEY;
          if (entityId || itemToEdit?.entityId) {
            const editKey = getEditDraftKey(entityId || itemToEdit?.entityId);
            if (editKey) {
              key = editKey;
            }
          }
          const saved = localStorage.getItem(key);
          if (saved) {
            return JSON.parse(saved);
          }
        } catch (error) {
          console.error('Failed to load form draft from localStorage:', error);
        }
      }
      return null;
    },
    [itemToEdit],
  );

  // Function to clear form from localStorage
  const clearFormFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        if (itemToEdit) {
          const editKey = getEditDraftKey(itemToEdit.entityId);
          if (editKey) {
            localStorage.removeItem(editKey);
          }
        } else {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to clear form draft from localStorage:', error);
      }
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';

    // Reset error states when panel opens/closes
    if (!isOpen) {
      // Don't reset form state here - we want to preserve draft in localStorage
      setErrors([]);
      setShowAllErrors(false);
      setImageFieldError(null);
    }
  }, [isOpen]);

  // Save form state when window loses focus (user switches windows/tabs)
  useEffect(() => {
    if (!isOpen) return;

    const handleBeforeUnload = () => {
      if (!justLoadedFromStorage.current) {
        saveFormToLocalStorage(form, usingDefaultImage);
      }
    };

    const handleBlur = () => {
      if (!justLoadedFromStorage.current) {
        saveFormToLocalStorage(form, usingDefaultImage);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isOpen, form, usingDefaultImage, saveFormToLocalStorage]);

  // Save form to localStorage when form changes (for both new items and editing)
  useEffect(() => {
    if (!isOpen || justLoadedFromStorage.current) return;
    if (itemToEdit && !form.name) return;
    const timeoutId = setTimeout(() => {
      saveFormToLocalStorage(form, usingDefaultImage);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [form, isOpen, itemToEdit, usingDefaultImage, saveFormToLocalStorage]);

  // Load item data when editing or duplicating, or restore draft for new items.
  // When editing: always use item data (source of truth). localStorage only for new-item drafts.
  useEffect(() => {
    if (isOpen && itemToEdit) {
      setForm({
        name: itemToEdit.name || '',
        imageUrl: (() => {
          // Helper function to validate image URL
          const isValidImageUrl = (url: string) => {
            if (!url || url === '' || url === 'undefined') return false;
            try {
              const urlObj = new URL(url);
              return (
                (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
                !url.includes('this.is.com') && // Block placeholder URLs
                !url.includes('example.com') && // Block example URLs
                urlObj.hostname !== 'localhost'
              ); // Block localhost URLs
            } catch {
              return false;
            }
          };

          const originalImageUrl = itemToEdit.imageUrl || '';

          if (isDuplicating) {
            // For duplication, use default image if original is invalid
            const hasValidImage = isValidImageUrl(originalImageUrl);
            setUsingDefaultImage(!hasValidImage);
            return hasValidImage
              ? originalImageUrl
              : '/images/imageExampleCard.png';
          } else {
            // For editing, preserve original URL even if invalid
            setUsingDefaultImage(false);
            return originalImageUrl;
          }
        })(),
        classification: {
          type: itemToEdit.classification?.type || '',
          subType: itemToEdit.classification?.subType || '',
        },
        useCase: itemToEdit.useCase || '',
        locator: {
          facility: itemToEdit.locator?.facility || '',
          department: itemToEdit.locator?.department || '',
          location: itemToEdit.locator?.location || '',
          subLocation: itemToEdit.locator?.subLocation || '',
        },
        internalSKU: itemToEdit.internalSKU || '',
        generalLedgerCode: itemToEdit.generalLedgerCode || '',
        minQuantity: itemToEdit.minQuantity || defaultQuantity,
        notes: itemToEdit.notes || '',
        cardNotesDefault: itemToEdit.cardNotesDefault || '',
        taxable: itemToEdit.taxable ?? true,
        primarySupply: {
          supplyEId: itemToEdit.primarySupply?.supplyEId,
          name: itemToEdit.primarySupply?.name,
          supplier: itemToEdit.primarySupply?.supplier || '',
          url: itemToEdit.primarySupply?.url || '',
          sku: itemToEdit.primarySupply?.sku || '',
          unitCost: itemToEdit.primarySupply?.unitCost || defaultMoney,
          minimumQuantity:
            itemToEdit.primarySupply?.minimumQuantity || defaultQuantity,
          orderQuantity:
            itemToEdit.primarySupply?.orderQuantity || defaultQuantity,
          orderMechanism:
            itemToEdit.primarySupply?.orderMechanism ?? defaultOrderMechanism,
          orderCost: itemToEdit.primarySupply?.orderCost || defaultMoney,
          averageLeadTime:
            itemToEdit.primarySupply?.averageLeadTime || defaultDuration,
          isDefault: true,
        },
        secondarySupply: {
          supplyEId: itemToEdit.secondarySupply?.supplyEId,
          name: itemToEdit.secondarySupply?.name,
          supplier: itemToEdit.secondarySupply?.supplier || '',
          url: itemToEdit.secondarySupply?.url || '',
          sku: itemToEdit.secondarySupply?.sku || '',
          unitCost: itemToEdit.secondarySupply?.unitCost || defaultMoney,
          minimumQuantity:
            itemToEdit.secondarySupply?.minimumQuantity || defaultQuantity,
          orderQuantity:
            itemToEdit.secondarySupply?.orderQuantity || defaultQuantity,
          orderMechanism:
            itemToEdit.secondarySupply?.orderMechanism ?? defaultOrderMechanism,
          orderCost: itemToEdit.secondarySupply?.orderCost || defaultMoney,
          averageLeadTime:
            itemToEdit.secondarySupply?.averageLeadTime || defaultDuration,
          isDefault: false,
        },
        cardSize: itemToEdit.cardSize || defaultCardSize,
        labelSize: itemToEdit.labelSize || defaultLabelSize,
        breadcrumbSize: itemToEdit.breadcrumbSize || defaultBreadcrumbSize,
        color: itemToEdit.color || 'BLUE',
      });
      // Don't clear localStorage when editing - we want to preserve drafts
      // Only clear when explicitly canceling or successfully saving
    } else if (isOpen && !itemToEdit) {
      // Try to restore draft from localStorage when creating new item
      const savedDraft = loadFormFromLocalStorage();
      if (savedDraft && savedDraft.form) {
        // Mark that we just loaded from localStorage to avoid immediate save
        justLoadedFromStorage.current = true;
        setForm(savedDraft.form);
        if (savedDraft.usingDefaultImage !== undefined) {
          setUsingDefaultImage(savedDraft.usingDefaultImage);
        }
        // Reset flag after a short delay to allow save on next change
        setTimeout(() => {
          justLoadedFromStorage.current = false;
        }, 1000);
      } else {
        // No saved draft, use initial state
        setForm(initialFormState);
        justLoadedFromStorage.current = false;
      }
    }
  }, [isOpen, itemToEdit, isDuplicating, loadFormFromLocalStorage]);

  const handleFormChange = (
    field: keyof ItemFormState,
    value: unknown,
    nestedField?: string,
    subField?: string,
  ) => {
    setForm((prev) => {
      if (nestedField && subField) {
        const fieldValue = prev[field] as unknown as Record<string, unknown>;
        return {
          ...prev,
          [field]: {
            ...fieldValue,
            [nestedField]: {
              ...(fieldValue[nestedField] as Record<string, unknown>),
              [subField]: value,
            },
          },
        };
      } else if (nestedField) {
        const fieldValue = prev[field] as unknown as Record<string, unknown>;
        return {
          ...prev,
          [field]: {
            ...fieldValue,
            [nestedField]: value,
          },
        };
      } else {
        return {
          ...prev,
          [field]: value,
        };
      }
    });
  };

  // Helper function to handle both onChange and onBlur for input fields
  const handleInputChange = (
    field: keyof ItemFormState,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    nestedField?: string,
    subField?: string,
  ) => {
    const value = event.target.value;
    handleFormChange(field, value, nestedField, subField);
  };

  const handleInputBlur = (
    field: keyof ItemFormState,
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    nestedField?: string,
    subField?: string,
  ) => {
    const value = event.target.value;
    handleFormChange(field, value, nestedField, subField);
  };

  const handleItemCardChange = (newForm: Partial<ItemCardForm>) => {
    // Clear image error if image URL is being changed
    if (newForm.imageUrl !== undefined && newForm.imageUrl !== form.imageUrl) {
      setImageFieldError(null);
      setErrors((prevErrors) =>
        prevErrors.filter((error) => error !== 'Incompatible image format'),
      );
    }

    // Update form with changes from ItemCard
    setForm({
      ...form,
      name: newForm.name !== undefined ? newForm.name : form.name,
      imageUrl:
        newForm.imageUrl !== undefined ? newForm.imageUrl : form.imageUrl,
      locator: {
        ...form.locator,
        location:
          newForm.locator?.location !== undefined
            ? newForm.locator.location
            : form.locator.location,
      },
      minQuantity: {
        amount:
          newForm.primarySupply?.minimumQuantity?.amount !== undefined
            ? newForm.primarySupply.minimumQuantity.amount
            : form.minQuantity?.amount || 0,
        unit:
          newForm.primarySupply?.minimumQuantity?.unit !== undefined
            ? newForm.primarySupply.minimumQuantity.unit
            : form.minQuantity?.unit || '',
      },
      primarySupply: {
        ...form.primarySupply,
        supplier:
          newForm.primarySupply?.supplier !== undefined
            ? newForm.primarySupply.supplier
            : form.primarySupply.supplier,
        minimumQuantity: {
          amount:
            newForm.primarySupply?.minimumQuantity?.amount !== undefined
              ? newForm.primarySupply.minimumQuantity.amount
              : form.primarySupply.minimumQuantity?.amount || 0,
          unit:
            newForm.primarySupply?.minimumQuantity?.unit !== undefined
              ? newForm.primarySupply.minimumQuantity.unit
              : form.primarySupply.minimumQuantity?.unit || '',
        },
        orderQuantity: {
          amount:
            newForm.primarySupply?.orderQuantity?.amount !== undefined
              ? newForm.primarySupply.orderQuantity.amount
              : form.primarySupply.orderQuantity?.amount || 0,
          unit:
            newForm.primarySupply?.orderQuantity?.unit !== undefined
              ? newForm.primarySupply.orderQuantity.unit
              : form.primarySupply.orderQuantity?.unit || '',
        },
      },
    });
  };

  // Convert ItemFormState to ItemCardForm for ItemCard
  const itemFormForCard = {
    name: form.name,
    imageUrl: form.imageUrl,
    classification: form.classification,
    useCase: form.useCase,
    locator: form.locator,
    internalSKU: form.internalSKU,
    notes: form.notes,
    cardNotesDefault: form.cardNotesDefault,
    taxable: form.taxable,
    primarySupply: {
      supplier: form.primarySupply.supplier,
      sku: form.primarySupply.sku,
      orderMechanism: form.primarySupply.orderMechanism,
      url: form.primarySupply.url,
      minimumQuantity: form.minQuantity, // Use root-level minQuantity
      orderQuantity: form.primarySupply.orderQuantity,
      unitCost: form.primarySupply.unitCost,
      averageLeadTime: form.primarySupply.averageLeadTime,
      orderCost: form.primarySupply.orderCost,
    },
    secondarySupply: {
      supplier: form.secondarySupply.supplier,
      sku: form.secondarySupply.sku,
      orderMechanism: form.secondarySupply.orderMechanism,
      url: form.secondarySupply.url,
      minimumQuantity: form.secondarySupply.minimumQuantity,
      orderQuantity: form.secondarySupply.orderQuantity,
      unitCost: form.secondarySupply.unitCost,
      averageLeadTime: form.secondarySupply.averageLeadTime,
      orderCost: form.secondarySupply.orderCost,
    },
    cardSize: form.cardSize,
    labelSize: form.labelSize,
    breadcrumbSize: form.breadcrumbSize,
  };

  const resetFormState = (clearDraft: boolean = false) => {
    setForm(initialFormState);
    setErrors([]);
    setShowAllErrors(false);
    setUsingDefaultImage(false);
    if (clearDraft) {
      clearFormFromLocalStorage();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).id === 'item-panel-overlay') {
      // Don't clear localStorage when closing via overlay - preserve draft
      setErrors([]);
      setShowAllErrors(false);
      onClose();
    }
  };

  // Reusable validator: used to disable Publish/Update until required fields pass
  const canSubmit = isItemFormValidForPublish(form);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!form.name.trim()) {
      newErrors.push('Check your card details');
    }

    setErrors(newErrors);

    // If there are errors, show all error states
    if (newErrors.length > 0) {
      setShowAllErrors(true);
    }

    return newErrors.length === 0;
  };

  const handleCreateItem = async (
    createDraft: boolean = false,
    addAnother: boolean = false,
  ) => {
    // Validate required fields
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create item using all form data
      const newItem: Partial<Item> = {
        name: form.name,
        imageUrl: form.imageUrl?.trim() === '' ? undefined : form.imageUrl,
        classification:
          form.classification.type || form.classification.subType
            ? {
                type: form.classification.type,
                subType: form.classification.subType,
              }
            : undefined,
        useCase: form.useCase,
        locator:
          form.locator.department ||
          form.locator.location ||
          form.locator.subLocation ||
          form.locator.facility
            ? {
                facility: form.locator.facility || 'Default Facility',
                department: form.locator.department,
                location: form.locator.location,
                subLocation: form.locator.subLocation,
              }
            : undefined,
        internalSKU: form.internalSKU,
        generalLedgerCode: form.generalLedgerCode,
        minQuantity:
          form.minQuantity.amount > 0
            ? {
                amount: form.minQuantity.amount,
                unit: form.minQuantity.unit,
              }
            : undefined,
        notes: form.notes,
        cardNotesDefault: form.cardNotesDefault,
        taxable: form.taxable ?? true,
        primarySupply:
          (form.primarySupply.supplier &&
            form.primarySupply.supplier.trim() !== '') ||
          form.primarySupply.orderMechanism ||
          (itemToEdit?.primarySupply?.supplier &&
            itemToEdit.primarySupply.supplier.trim() !== '')
            ? {
                supplyEId:
                  form.primarySupply.supplyEId ??
                  itemToEdit?.primarySupply?.supplyEId,
                name:
                  form.primarySupply.name ?? itemToEdit?.primarySupply?.name,
                supplier:
                  form.primarySupply.supplier &&
                  form.primarySupply.supplier.trim() !== ''
                    ? form.primarySupply.supplier
                    : itemToEdit?.primarySupply?.supplier &&
                        itemToEdit.primarySupply.supplier.trim() !== ''
                      ? itemToEdit.primarySupply.supplier
                      : '',
                sku: form.primarySupply.sku,
                orderMechanism:
                  form.primarySupply.orderMechanism ??
                  itemToEdit?.primarySupply?.orderMechanism ??
                  defaultOrderMechanism,
                url: form.primarySupply.url,
                minimumQuantity:
                  form.primarySupply.minimumQuantity.amount > 0
                    ? {
                        amount: form.primarySupply.minimumQuantity.amount,
                        unit: form.primarySupply.minimumQuantity.unit,
                      }
                    : itemToEdit?.primarySupply?.minimumQuantity
                      ? {
                          amount:
                            itemToEdit.primarySupply.minimumQuantity.amount,
                          unit: itemToEdit.primarySupply.minimumQuantity.unit,
                        }
                      : undefined,
                orderQuantity:
                  form.primarySupply.orderQuantity.amount > 0
                    ? {
                        amount: form.primarySupply.orderQuantity.amount,
                        unit: form.primarySupply.orderQuantity.unit,
                      }
                    : itemToEdit?.primarySupply?.orderQuantity
                      ? {
                          amount: itemToEdit.primarySupply.orderQuantity.amount,
                          unit: itemToEdit.primarySupply.orderQuantity.unit,
                        }
                      : undefined,
                unitCost:
                  form.primarySupply.unitCost.value > 0
                    ? {
                        value: form.primarySupply.unitCost.value,
                        currency: form.primarySupply.unitCost.currency,
                      }
                    : itemToEdit?.primarySupply?.unitCost
                      ? {
                          value: itemToEdit.primarySupply.unitCost.value,
                          currency: itemToEdit.primarySupply.unitCost.currency,
                        }
                      : undefined,
                averageLeadTime:
                  form.primarySupply.averageLeadTime.length > 0
                    ? {
                        length: form.primarySupply.averageLeadTime.length,
                        unit: form.primarySupply.averageLeadTime.unit,
                      }
                    : itemToEdit?.primarySupply?.averageLeadTime
                      ? {
                          length:
                            itemToEdit.primarySupply.averageLeadTime.length,
                          unit: itemToEdit.primarySupply.averageLeadTime.unit,
                        }
                      : undefined,
                orderCost:
                  form.primarySupply.orderCost.value > 0 ||
                  itemToEdit?.primarySupply?.orderCost
                    ? {
                        value:
                          form.primarySupply.orderCost.value > 0
                            ? form.primarySupply.orderCost.value
                            : itemToEdit?.primarySupply?.orderCost?.value || 0,
                        currency:
                          form.primarySupply.orderCost.currency ||
                          itemToEdit?.primarySupply?.orderCost?.currency ||
                          'USD',
                      }
                    : {
                        value: 0,
                        currency: 'USD',
                      },
              }
            : undefined,
        secondarySupply:
          (form.secondarySupply.supplier &&
            form.secondarySupply.supplier.trim() !== '') ||
          form.secondarySupply.orderMechanism ||
          (itemToEdit?.secondarySupply?.supplier &&
            itemToEdit.secondarySupply.supplier.trim() !== '')
            ? {
                supplyEId:
                  form.secondarySupply.supplyEId ??
                  itemToEdit?.secondarySupply?.supplyEId,
                name:
                  form.secondarySupply.name ??
                  itemToEdit?.secondarySupply?.name,
                supplier:
                  form.secondarySupply.supplier &&
                  form.secondarySupply.supplier.trim() !== ''
                    ? form.secondarySupply.supplier
                    : itemToEdit?.secondarySupply?.supplier &&
                        itemToEdit.secondarySupply.supplier.trim() !== ''
                      ? itemToEdit.secondarySupply.supplier
                      : '',
                sku: form.secondarySupply.sku,
                orderMechanism:
                  form.secondarySupply.orderMechanism ??
                  itemToEdit?.secondarySupply?.orderMechanism ??
                  defaultOrderMechanism,
                url: form.secondarySupply.url,
                minimumQuantity:
                  form.secondarySupply.minimumQuantity.amount > 0
                    ? {
                        amount: form.secondarySupply.minimumQuantity.amount,
                        unit: form.secondarySupply.minimumQuantity.unit,
                      }
                    : itemToEdit?.secondarySupply?.minimumQuantity
                      ? {
                          amount:
                            itemToEdit.secondarySupply.minimumQuantity.amount,
                          unit: itemToEdit.secondarySupply.minimumQuantity.unit,
                        }
                      : undefined,
                orderQuantity:
                  form.secondarySupply.orderQuantity.amount > 0
                    ? {
                        amount: form.secondarySupply.orderQuantity.amount,
                        unit: form.secondarySupply.orderQuantity.unit,
                      }
                    : itemToEdit?.secondarySupply?.orderQuantity
                      ? {
                          amount:
                            itemToEdit.secondarySupply.orderQuantity.amount,
                          unit: itemToEdit.secondarySupply.orderQuantity.unit,
                        }
                      : undefined,
                unitCost:
                  form.secondarySupply.unitCost.value > 0
                    ? {
                        value: form.secondarySupply.unitCost.value,
                        currency: form.secondarySupply.unitCost.currency,
                      }
                    : itemToEdit?.secondarySupply?.unitCost
                      ? {
                          value: itemToEdit.secondarySupply.unitCost.value,
                          currency:
                            itemToEdit.secondarySupply.unitCost.currency,
                        }
                      : undefined,
                averageLeadTime:
                  form.secondarySupply.averageLeadTime.length > 0
                    ? {
                        length: form.secondarySupply.averageLeadTime.length,
                        unit: form.secondarySupply.averageLeadTime.unit,
                      }
                    : itemToEdit?.secondarySupply?.averageLeadTime
                      ? {
                          length:
                            itemToEdit.secondarySupply.averageLeadTime.length,
                          unit: itemToEdit.secondarySupply.averageLeadTime.unit,
                        }
                      : undefined,
                orderCost:
                  form.secondarySupply.orderCost.value > 0 ||
                  itemToEdit?.secondarySupply?.orderCost
                    ? {
                        value:
                          form.secondarySupply.orderCost.value > 0
                            ? form.secondarySupply.orderCost.value
                            : itemToEdit?.secondarySupply?.orderCost?.value ||
                              0,
                        currency:
                          form.secondarySupply.orderCost.currency ||
                          itemToEdit?.secondarySupply?.orderCost?.currency ||
                          'USD',
                      }
                    : {
                        value: 0,
                        currency: 'USD',
                      },
              }
            : undefined,
        defaultSupply: (() => {
          const primary = form.primarySupply.supplier?.trim();
          const secondary = form.secondarySupply.supplier?.trim();
          if (!primary && !secondary) return undefined;
          if (form.primarySupply.isDefault) return 'Primary';
          if (form.secondarySupply.isDefault) return 'Secondary';
          return primary ? 'Primary' : 'Secondary';
        })(),
        cardSize: form.cardSize,
        labelSize: form.labelSize,
        breadcrumbSize: form.breadcrumbSize,
        color: form.color,
      };

      let resultItem: Item;

      if (itemToEdit && !isDuplicating) {
        try {
          const draftItem = await createDraftItem(itemToEdit.entityId);
          const mergedForPut: Partial<Item> = { ...draftItem };
          (
            Object.keys(newItem) as Array<keyof Partial<Item>>
          ).forEach((key) => {
            (mergedForPut as Record<string, unknown>)[key] = (newItem as Record<string, unknown>)[key];
          });
          resultItem = await updateItem(
            draftItem.entityId,
            mergedForPut as Item
          );

          toast.success('Item updated successfully');
        } catch (error) {
          console.error('Failed to update item:', error);
          if (handleAuthError(error)) {
            return;
          }
          toast.error(
            error instanceof Error
              ? `Failed to update item: ${error.message}`
              : 'Failed to update item - could not create draft',
          );
          setIsLoading(false);
          return;
        }
      } else {
        // Create new item
        resultItem = await createItem(newItem);

        // Create a draft version only if requested

        if (createDraft) {
          try {
            await createDraftItem(resultItem.entityId);
            toast.success('Item created successfully and saved as draft');
          } catch {
            toast.success('Item created successfully (draft creation failed)');
          }
        } else {
          // Backend creates the first kanban card when the item is published
          toast.success('Item published successfully');
        }
      }

      // Clear localStorage when item is successfully saved
      clearFormFromLocalStorage();
      setForm(initialFormState);
      resetFormState(true);
      setIsLoading(false);
      if (addAnother && itemToEdit) {
        // Publish & add another from edit: close details, refresh list, keep form open empty.
        await onPublishAndAddAnotherFromEdit?.();
      } else if (addAnother && !itemToEdit) {
        // Publish & add another from add item: refresh list, keep form open empty.
        await onPublishAndAddAnotherFromAddItem?.();
      } else {
        onSuccess?.();
        if (!addAnother) {
          onClose();
        }
      }
    } catch (err) {
      console.error('ARDA create item failed:', err);
      if (handleAuthError(err)) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : String(err);
      const isImageFormatError = errorMessage.includes(
        'unknown protocol: data',
      );

      if (isImageFormatError) {
        setImageFieldError(
          'Incompatible image format. Please use a valid image URL or upload an image file.',
        );
        setErrors(['Incompatible image format']);
        setShowAllErrors(true);
      } else {
        setImageFieldError(null);
        setErrors([
          itemToEdit && !isDuplicating
            ? 'Failed to update item'
            : 'Failed to create item',
        ]);
        setShowAllErrors(true);
      }
      setIsLoading(false);
    }
  };

  return (
    <div
      id='item-panel-overlay'
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex justify-end transition-all duration-300',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0',
      )}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(0px)',
      }}
    >
      <div
        className={cn(
          'relative w-full sm:max-w-[480px] h-full max-h-[100dvh] bg-white border-l border-border py-0 flex flex-col gap-0 shadow-xl transition-transform duration-300 overflow-hidden select-none',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className='flex-1 min-h-0 overflow-y-auto'>
          {/* Header */}
          <div className='sticky top-0 z-50 bg-white px-4 sm:px-6 py-5 pb-4 border-b'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl sm:text-2xl font-semibold text-base-foreground font-geist leading-6'>
                {itemToEdit && !isDuplicating ? 'Edit item' : 'Add new item'}
              </h2>
              <button
                className='text-foreground opacity-70 hover:opacity-100'
                onClick={() => {
                  // Don't clear localStorage when closing via X - preserve draft
                  setErrors([]);
                  setShowAllErrors(false);
                  onClose();
                }}
              >
                <XIcon className='h-5 w-5' />
              </button>
            </div>
          </div>

          {/* Error Alert Section */}
          {errors.length > 0 && (
            <div className='px-4 sm:px-6'>
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <div className='flex-shrink-0'>
                    <AlertCircle className='h-5 w-5 text-red-400' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-sm font-medium text-red-800'>
                      Unable to create new item.
                    </h3>
                    <p className='text-sm text-red-700 mt-1'>
                      Verify the following fields and try again.
                    </p>
                    <div className='mt-2 text-sm text-red-700'>
                      <ul className='list-disc pl-5 space-y-1'>
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Item Card */}
          <div className='relative w-full bg-[var(--accent-light)]  px-4 sm:px-6 pt-6 pb-2 flex flex-col items-center gap-2'>
            <div className='max-w-[396px] w-full flex justify-center'>
              <ItemCard
                form={itemFormForCard}
                onFormChange={handleItemCardChange}
                showAllErrors={showAllErrors}
                imageFieldError={imageFieldError}
                onImageErrorClear={() => {
                  setImageFieldError(null);
                  setErrors((prevErrors) =>
                    prevErrors.filter(
                      (error) => error !== 'Incompatible image format',
                    ),
                  );
                }}
              />
            </div>

            {/* Default image notification for duplication */}
            {isDuplicating && usingDefaultImage && (
              <div className='mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md max-w-[396px] w-full'>
                <p className='text-sm text-blue-800'>
                  <span className='font-medium'>Note:</span> The original item
                  had an invalid image URL, so a default image has been used.
                  You can change this by uploading a new image.
                </p>
              </div>
            )}

            <div className='w-[1px] h-2 bg-gray-300' />
            <div className='absolute bottom-0 left-0 bg-slate-50 border-t border-r border-slate-200 rounded-tr-md px-2 py-[2px] text-[12px] leading-4 text-slate-400 font-geist'>
              Card preview
            </div>
          </div>

          {/* Form Content - 4px between sections (4x section outline thickness); allow selecting text in inputs/textareas */}
          <div className='flex-1 px-4 sm:px-6 pb-4 mt-4 relative space-y-1 [&_input]:select-text [&_textarea]:select-text'>
            {/* Table of Contents - opens on hover, closes when mouse leaves; icon sticks to top when scrolling */}
            <div className='sticky top-2 pt-1 z-40 h-8 -mb-8 flex justify-end items-start pr-0 sm:pr-2'>
              <div
                className='inline-flex'
                onMouseEnter={() => setShowTableOfContents(true)}
                onMouseLeave={() => setShowTableOfContents(false)}
              >
                {showTableOfContents ? (
                  <div className='flex'>
                    <button
                      type='button'
                      onClick={() =>
                        setShowTableOfContents(!showTableOfContents)
                      }
                      className='bg-white border border-gray-200 border-r-0 rounded-l-md p-1 flex items-center justify-center shadow-sm w-8 h-8'
                    >
                      <List className='h-4 w-4 text-gray-600' />
                    </button>
                    <div className='w-[194px] bg-white rounded-r-lg shadow-lg border border-gray-200 border-l-0 p-2 flex flex-col'>
                      <div className='px-2 py-1 text-sm text-gray-500'>
                        Jump to:
                      </div>
                      <div className='space-y-0'>
                        <button
                          type='button'
                          onClick={() => scrollToSection(orderingDetailsRef)}
                          className='block w-full text-left px-2 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded'
                        >
                          Ordering Details
                        </button>
                        <button
                          type='button'
                          onClick={() => scrollToSection(primarySupplierRef)}
                          className='block w-full text-left px-2 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded'
                        >
                          Primary Supplier
                        </button>
                        <button
                          type='button'
                          onClick={() => scrollToSection(secondarySupplierRef)}
                          className='block w-full text-left px-2 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded'
                        >
                          Secondary Supplier
                        </button>
                        <button
                          type='button'
                          onClick={() => scrollToSection(cardSizingRef)}
                          className='block w-full text-left px-2 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded'
                        >
                          Card Details
                        </button>
                        <button
                          type='button'
                          onClick={() => scrollToSection(shopUsageRef)}
                          className='block w-full text-left px-2 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded'
                        >
                          Shop Usage
                        </button>
                        <button
                          type='button'
                          onClick={() => scrollToSection(additionalInfoRef)}
                          className='block w-full text-left px-2 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded'
                        >
                          Additional Info
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={() => setShowTableOfContents(!showTableOfContents)}
                    className='bg-white border border-gray-200 rounded-md p-1 flex items-center justify-center shadow-sm w-8 h-8'
                  >
                    <List className='h-4 w-4 text-gray-600' />
                  </button>
                )}
              </div>
            </div>
            {/* Ordering Details Section */}
            <div
              ref={orderingDetailsRef}
              className='bg-white border border-gray-200 rounded-xl p-4 space-y-2 scroll-mt-1 scroll-mb-1'
            >
              <div className='flex items-center gap-3 mb-2'>
                <div className='flex items-center justify-center'>
                  <svg
                    width='60'
                    height='50'
                    viewBox='0 0 54 45'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M36.7072 40.701C29.0026 45.0902 12.7372 44.576 6.81476 33.7919C0.892293 23.0078 3.89113 1.79134 15.37 1.84832C19.1604 1.86816 23.0919 5.86583 28.9292 11.3158C31.852 14.0483 36.1325 10.1548 40.8513 16.9858C47.8319 27.0953 44.4119 36.3119 36.7121 40.6982L36.7072 40.701Z'
                      fill='#E0F2FE'
                    />
                    <path
                      d='M19.5156 18.75C19.8522 18.75 20.125 18.4772 20.125 18.1406C20.125 17.8041 19.8522 17.5312 19.5156 17.5312C19.1791 17.5312 18.9062 17.8041 18.9062 18.1406C18.9062 18.4772 19.1791 18.75 19.5156 18.75Z'
                      fill='#0A0A0A'
                    />
                    <path
                      d='M25.7142 12.1517C25.2572 11.6945 24.6373 11.4376 23.9909 11.4375H15.25C14.6035 11.4375 13.9835 11.6943 13.5264 12.1514C13.0693 12.6085 12.8125 13.2285 12.8125 13.875V22.6159C12.8126 23.2623 13.0695 23.8822 13.5267 24.3392L24.1347 34.9472C24.6886 35.4976 25.4378 35.8066 26.2188 35.8066C26.9997 35.8066 27.7489 35.4976 28.3028 34.9472L36.3222 26.9278C36.8726 26.3739 37.1816 25.6247 37.1816 24.8438C37.1816 24.0628 36.8726 23.3136 36.3222 22.7597L25.7142 12.1517Z'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M19.5156 18.75C19.8522 18.75 20.125 18.4772 20.125 18.1406C20.125 17.8041 19.8522 17.5312 19.5156 17.5312C19.1791 17.5312 18.9062 17.8041 18.9062 18.1406C18.9062 18.4772 19.1791 18.75 19.5156 18.75Z'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M17.5156 17.625C17.8522 17.625 18.125 17.3522 18.125 17.0156C18.125 16.6791 17.8522 16.4062 17.5156 16.4062C17.1791 16.4062 16.9062 16.6791 16.9062 17.0156C16.9062 17.3522 17.1791 17.625 17.5156 17.625Z'
                      fill='#0A0A0A'
                    />
                    <path
                      d='M23.7142 11.0267C23.2572 10.5695 22.6373 10.3126 21.9909 10.3125H13.25C12.6035 10.3125 11.9835 10.5693 11.5264 11.0264C11.0693 11.4835 10.8125 12.1035 10.8125 12.75V21.4909C10.8126 22.1373 11.0695 22.7572 11.5267 23.2142L22.1347 33.8222C22.6886 34.3726 23.4378 34.6816 24.2188 34.6816C24.9997 34.6816 25.7489 34.3726 26.3028 33.8222L34.3222 25.8028C34.8726 25.2489 35.1816 24.4997 35.1816 23.7188C35.1816 22.9378 34.8726 22.1886 34.3222 21.6347L23.7142 11.0267Z'
                      stroke='#0A0A0A'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M17.5156 17.625C17.8522 17.625 18.125 17.3522 18.125 17.0156C18.125 16.6791 17.8522 16.4062 17.5156 16.4062C17.1791 16.4062 16.9062 16.6791 16.9062 17.0156C16.9062 17.3522 17.1791 17.625 17.5156 17.625Z'
                      stroke='#0A0A0A'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <div className='flex items-center gap-1'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Ordering Details
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Item ordering details and pricing.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <FormField
                label='Order method'
                description='How you will order the item.'
              >
                <Select
                  value={form.primarySupply.orderMechanism}
                  onValueChange={(value) =>
                    handleFormChange('primarySupply', value, 'orderMechanism')
                  }
                >
                  <SelectTrigger className='w-full h-9 px-3 bg-[var(--form-background)] border border-[var(--form-border)] rounded-lg shadow-sm'>
                    <SelectValue placeholder='Select order method' />
                  </SelectTrigger>
                  <SelectContent>
                    {orderMethodOptions.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label='Unit price'>
                <div className='flex overflow-hidden rounded-lg shadow-sm border border-[var(--form-border)]'>
                  <div className='flex items-center gap-1 px-3 py-1 bg-[var(--form-background-secondary)] rounded-l-lg h-9'>
                    <span className='text-sm text-[var(--form-text-secondary)]'>
                      $
                    </span>
                    <Select
                      value={form.primarySupply.unitCost.currency}
                      onValueChange={(value) =>
                        handleFormChange(
                          'primarySupply',
                          value,
                          'unitCost',
                          'currency',
                        )
                      }
                    >
                      <SelectTrigger className='border-none shadow-none p-0 h-auto text-sm text-[var(--form-text-secondary)]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type='number'
                    step='0.01'
                    min='0'
                    value={form.primarySupply.unitCost.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? 0 : parseFloat(value);
                      if (!isNaN(numValue)) {
                        handleFormChange(
                          'primarySupply',
                          numValue,
                          'unitCost',
                          'value',
                        );
                      }
                    }}
                    placeholder='Unit price'
                    className='flex-1 border-none shadow-none rounded-r-lg h-9 text-sm text-[var(--form-text-secondary)] placeholder:text-[var(--form-text-secondary)]'
                  />
                </div>
              </FormField>

              <SwitchField
                label='Taxable'
                description='Whether tax needs to be applied to purchases.'
                checked={form.taxable}
                onCheckedChange={(checked) =>
                  handleFormChange('taxable', checked)
                }
              />

              <FormField
                label='Average order time (in hours)'
                description='How long it takes to obtain the item, from time of order to time of use. Leave as 0 to use Computed Average Time.'
              >
                <Input
                  type='number'
                  value={form.primarySupply.averageLeadTime.length || ''}
                  onChange={(e) =>
                    handleFormChange(
                      'primarySupply',
                      parseInt(e.target.value) || 0,
                      'averageLeadTime',
                      'length',
                    )
                  }
                  placeholder='0'
                  className='h-9 px-3 bg-[var(--form-background)] border border-[var(--form-border)] rounded-lg shadow-sm text-sm text-[var(--form-text-secondary)] placeholder:text-[var(--form-text-secondary)]'
                />
              </FormField>

              <FormField
                label='Ordering notes'
                description='Enter any additional details about the ordering process.'
              >
                <Textarea
                  value={form.cardNotesDefault}
                  onChange={(e) =>
                    handleFormChange('cardNotesDefault', e.target.value)
                  }
                  placeholder='Type your notes here'
                  className='min-h-[60px] w-full resize-none rounded-lg border border-[#e5e5e5] shadow-sm px-3 py-2 text-sm text-[#737373] placeholder:text-[#737373]'
                />
              </FormField>
            </div>

            {/* Primary Supplier Section */}
            <div
              ref={primarySupplierRef}
              className='bg-white border border-gray-200 rounded-xl p-4 space-y-2 relative scroll-mt-1 scroll-mb-1'
            >
              {/* Section Header with Factory Icon */}
              <div className='flex items-center gap-3 mb-2'>
                <div className='flex items-center justify-center'>
                  <svg
                    width='60'
                    height='50'
                    viewBox='0 0 54 45'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M36.7072 40.701C29.0026 45.0902 12.7372 44.576 6.81476 33.7919C0.892293 23.0078 3.89113 1.79134 15.37 1.84832C19.1604 1.86816 23.0919 5.86583 28.9292 11.3158C31.852 14.0483 36.1325 10.1548 40.8513 16.9858C47.8319 27.0953 44.4119 36.3119 36.7121 40.6982L36.7072 40.701Z'
                      fill='#E0F2FE'
                    />
                    <path
                      d='M31.0938 30.9375H32.3125M25 30.9375H26.2188M18.9062 30.9375H20.125M12.8125 33.375C12.8125 34.0215 13.0693 34.6415 13.5264 35.0986C13.9835 35.5557 14.6035 35.8125 15.25 35.8125H34.75C35.3965 35.8125 36.0165 35.5557 36.4736 35.0986C36.9307 34.6415 37.1875 34.0215 37.1875 33.375V18.75L28.6562 24.8438V18.75L20.125 24.8438V13.875C20.125 13.2285 19.8682 12.6085 19.4111 12.1514C18.954 11.6943 18.334 11.4375 17.6875 11.4375H15.25C14.6035 11.4375 13.9835 11.6943 13.5264 12.1514C13.0693 12.6085 12.8125 13.2285 12.8125 13.875V33.375Z'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M29.0938 29.8125H30.3125M23 29.8125H24.2188M16.9062 29.8125H18.125M10.8125 32.25C10.8125 32.8965 11.0693 33.5165 11.5264 33.9736C11.9835 34.4307 12.6035 34.6875 13.25 34.6875H32.75C33.3965 34.6875 34.0165 34.4307 34.4736 33.9736C34.9307 33.5165 35.1875 32.8965 35.1875 32.25V17.625L26.6562 23.7188V17.625L18.125 23.7188V12.75C18.125 12.1035 17.8682 11.4835 17.4111 11.0264C16.954 10.5693 16.334 10.3125 15.6875 10.3125H13.25C12.6035 10.3125 11.9835 10.5693 11.5264 11.0264C11.0693 11.4835 10.8125 12.1035 10.8125 12.75V32.25Z'
                      stroke='#0A0A0A'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <div className='flex items-center gap-1'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Primary Supplier
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Details for the primary supplier.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Primary supplier input with type-ahead */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-900'>
                  Primary supplier
                </label>
                <SupplierTypeahead
                  value={form.primarySupply.supplier}
                  onChange={(v) =>
                    handleFormChange('primarySupply', v, 'supplier')
                  }
                  placeholder='Search or type supplier name'
                />
              </div>

              {/* Item URL input */}
              <div className='space-y-1'>
                <div className='flex items-center gap-1'>
                  <label className='text-sm font-medium text-gray-900'>
                    Item URL
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Enter the item&apos;s URL from the primary supplier.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
                  <div className='px-3 py-2 bg-gray-100 text-sm text-gray-600 border-r border-gray-300'>
                    https://
                  </div>
                  <input
                    type='text'
                    placeholder='URL'
                    value={form.primarySupply.url}
                    onChange={(e) =>
                      handleInputChange('primarySupply', e, 'url')
                    }
                    onBlur={(e) => handleInputBlur('primarySupply', e, 'url')}
                    className='flex-1 px-3 py-2 text-sm border-none outline-none'
                  />
                </div>
              </div>

              {/* SKU input */}
              <div className='space-y-1'>
                <div className='flex items-center gap-1'>
                  <label className='text-sm font-medium text-gray-900'>
                    SKU
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      SKU from the primary supplier
                    </TooltipContent>
                  </Tooltip>
                </div>
                <input
                  type='text'
                  placeholder='UPC'
                  value={form.primarySupply.sku}
                  onChange={(e) => handleInputChange('primarySupply', e, 'sku')}
                  onBlur={(e) => handleInputBlur('primarySupply', e, 'sku')}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                />
              </div>

              {/* Toggle switch */}
              <div className='flex items-start gap-3'>
                <div className='relative'>
                  <button
                    onClick={() => {
                      const newPrimaryValue = !form.primarySupply.isDefault;
                      handleFormChange(
                        'primarySupply',
                        newPrimaryValue,
                        'isDefault',
                      );
                      // If primary is being set as default, unset secondary
                      if (newPrimaryValue) {
                        handleFormChange('secondarySupply', false, 'isDefault');
                      } else {
                        // If primary is being unset, set secondary as default
                        handleFormChange('secondarySupply', true, 'isDefault');
                      }
                    }}
                    className={`w-9 h-5 rounded-full transition-colors ${
                      form.primarySupply.isDefault
                        ? 'bg-orange-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        form.primarySupply.isDefault
                          ? 'translate-x-4'
                          : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </button>
                </div>
                <div className='flex-1 flex items-center gap-1'>
                  <label className='text-sm font-medium text-gray-900'>
                    Set as default supplier
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Make the primary supplier the default supplier.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Secondary Supplier Section */}
            <div
              ref={secondarySupplierRef}
              className='bg-white border border-gray-200 rounded-xl p-4 space-y-2 scroll-mt-1 scroll-mb-1'
            >
              {/* Section Header with Factory Icon */}
              <div className='flex items-center gap-3 mb-2'>
                <div className='flex items-center justify-center'>
                  <svg
                    width='60'
                    height='50'
                    viewBox='0 0 54 45'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M36.7072 40.701C29.0026 45.0902 12.7372 44.576 6.81476 33.7919C0.892293 23.0078 3.89113 1.79134 15.37 1.84832C19.1604 1.86816 23.0919 5.86583 28.9292 11.3158C31.852 14.0483 36.1325 10.1548 40.8513 16.9858C47.8319 27.0953 44.4119 36.3119 36.7121 40.6982L36.7072 40.701Z'
                      fill='#E0F2FE'
                    />
                    <path
                      d='M31.0938 30.9375H32.3125M25 30.9375H26.2188M18.9062 30.9375H20.125M12.8125 33.375C12.8125 34.0215 13.0693 34.6415 13.5264 35.0986C13.9835 35.5557 14.6035 35.8125 15.25 35.8125H34.75C35.3965 35.8125 36.0165 35.5557 36.4736 35.0986C36.9307 34.6415 37.1875 34.0215 37.1875 33.375V18.75L28.6562 24.8438V18.75L20.125 24.8438V13.875C20.125 13.2285 19.8682 12.6085 19.4111 12.1514C18.954 11.6943 18.334 11.4375 17.6875 11.4375H15.25C14.6035 11.4375 13.9835 11.6943 13.5264 12.1514C13.0693 12.6085 12.8125 13.2285 12.8125 13.875V33.375Z'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M29.0938 29.8125H30.3125M23 29.8125H24.2188M16.9062 29.8125H18.125M10.8125 32.25C10.8125 32.8965 11.0693 33.5165 11.5264 33.9736C11.9835 34.4307 12.6035 34.6875 13.25 34.6875H32.75C33.3965 34.6875 34.0165 34.4307 34.4736 33.9736C34.9307 33.5165 35.1875 32.8965 35.1875 32.25V17.625L26.6562 23.7188V17.625L18.125 23.7188V12.75C18.125 12.1035 17.8682 11.4835 17.4111 11.0264C16.954 10.5693 16.334 10.3125 15.6875 10.3125H13.25C12.6035 10.3125 11.9835 10.5693 11.5264 11.0264C11.0693 11.4835 10.8125 12.1035 10.8125 12.75V32.25Z'
                      stroke='#0A0A0A'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <div className='flex items-center gap-1'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Secondary Supplier
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Details for the secondary supplier.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Secondary supplier input with type-ahead */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-900'>
                  Secondary supplier
                </label>
                <SupplierTypeahead
                  value={form.secondarySupply.supplier}
                  onChange={(v) =>
                    handleFormChange('secondarySupply', v, 'supplier')
                  }
                  placeholder='Search or type supplier name'
                />
              </div>

              {/* Item URL input */}
              <div className='space-y-1'>
                <div className='flex items-center gap-1'>
                  <label className='text-sm font-medium text-gray-900'>
                    Item URL
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Enter the item&apos;s URL from the secondary supplier.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
                  <div className='px-3 py-2 bg-gray-100 text-sm text-gray-600 border-r border-gray-300'>
                    https://
                  </div>
                  <input
                    type='text'
                    placeholder='URL'
                    value={form.secondarySupply.url}
                    onChange={(e) =>
                      handleFormChange('secondarySupply', e.target.value, 'url')
                    }
                    className='flex-1 px-3 py-2 text-sm border-none outline-none'
                  />
                </div>
              </div>

              {/* SKU input */}
              <div className='space-y-1'>
                <div className='flex items-center gap-1'>
                  <label className='text-sm font-medium text-gray-900'>
                    SKU
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      SKU from the secondary supplier
                    </TooltipContent>
                  </Tooltip>
                </div>
                <input
                  type='text'
                  placeholder='SKU'
                  value={form.secondarySupply.sku}
                  onChange={(e) =>
                    handleFormChange('secondarySupply', e.target.value, 'sku')
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                />
              </div>

              {/* Toggle switch */}
              <div className='flex items-start gap-3'>
                <div className='relative'>
                  <button
                    onClick={() => {
                      const newSecondaryValue = !form.secondarySupply.isDefault;
                      handleFormChange(
                        'secondarySupply',
                        newSecondaryValue,
                        'isDefault',
                      );
                      // If secondary is being set as default, unset primary
                      if (newSecondaryValue) {
                        handleFormChange('primarySupply', false, 'isDefault');
                      } else {
                        // If secondary is being unset, set primary as default
                        handleFormChange('primarySupply', true, 'isDefault');
                      }
                    }}
                    className={`w-9 h-5 rounded-full transition-colors ${
                      form.secondarySupply.isDefault
                        ? 'bg-orange-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        form.secondarySupply.isDefault
                          ? 'translate-x-4'
                          : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </button>
                </div>
                <div className='flex-1 flex items-center gap-1'>
                  <label className='text-sm font-medium text-gray-900'>
                    Set as default supplier
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Make the secondary supplier the default supplier.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Default Supplier Section */}
            <div className='bg-white border border-gray-200 rounded-xl p-4 space-y-2'>
              <div className='flex items-center gap-1'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Default Supplier
                </h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                      aria-label='More information'
                    >
                      <Info className='h-3.5 w-3.5' />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side='top'
                    className='max-w-[280px] text-left'
                    sideOffset={4}
                  >
                    The default supplier is auto-selected when only one is
                    filled, or based on the &quot;Set as default&quot; toggle.
                    You can change it here.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-900'>
                  Default supplier
                </label>
                <Select
                  value={(() => {
                    const primary = form.primarySupply.supplier?.trim();
                    const secondary = form.secondarySupply.supplier?.trim();
                    if (!primary && !secondary) return '__none__';
                    const defaultSupplier = form.primarySupply.isDefault
                      ? primary
                      : form.secondarySupply.isDefault
                        ? secondary
                        : primary || secondary;
                    return defaultSupplier || '__none__';
                  })()}
                  onValueChange={(selected) => {
                    if (selected === '__none__') return;
                    if (selected === form.primarySupply.supplier?.trim()) {
                      handleFormChange('primarySupply', true, 'isDefault');
                      handleFormChange('secondarySupply', false, 'isDefault');
                    } else if (
                      selected === form.secondarySupply.supplier?.trim()
                    ) {
                      handleFormChange('secondarySupply', true, 'isDefault');
                      handleFormChange('primarySupply', false, 'isDefault');
                    }
                  }}
                  disabled={
                    !form.primarySupply.supplier?.trim() &&
                    !form.secondarySupply.supplier?.trim()
                  }
                >
                  <SelectTrigger className='w-full h-9 px-3 bg-[var(--form-background)] border border-[var(--form-border)] rounded-lg shadow-sm'>
                    <SelectValue placeholder='Select default supplier' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value='__none__'
                      className='text-sm text-gray-500'
                    >
                      No default
                    </SelectItem>
                    {form.primarySupply.supplier?.trim() && (
                      <SelectItem
                        value={form.primarySupply.supplier.trim()}
                        className='text-sm'
                      >
                        {form.primarySupply.supplier}
                      </SelectItem>
                    )}
                    {form.secondarySupply.supplier?.trim() &&
                      form.secondarySupply.supplier.trim() !==
                        form.primarySupply.supplier?.trim() && (
                        <SelectItem
                          value={form.secondarySupply.supplier.trim()}
                          className='text-sm'
                        >
                          {form.secondarySupply.supplier}
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Card Details Section */}
            <div
              ref={cardSizingRef}
              className='bg-white border border-gray-200 rounded-xl p-4 space-y-2 scroll-mt-1 scroll-mb-1'
            >
              <div className='flex items-center gap-3 mb-2'>
                <div className='flex items-center justify-center'>
                  <svg
                    width='60'
                    height='50'
                    viewBox='0 0 54 45'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M36.7072 40.701C29.0026 45.0902 12.7372 44.576 6.81476 33.7919C0.892293 23.0078 3.89113 1.79134 15.37 1.84832C19.1604 1.86816 23.0919 5.86583 28.9292 11.3158C31.852 14.0483 36.1325 10.1548 40.8513 16.9858C47.8319 27.0953 44.4119 36.3119 36.7121 40.6982L36.7072 40.701Z'
                      fill='#E0F2FE'
                    />
                    <path
                      d='M28.0469 24.2343L30.4844 21.7968M24.3906 20.578L26.8281 18.1405M20.7344 16.9218L23.1719 14.4843M31.7031 27.8905L34.1406 25.453M36.3344 27.6468C36.6071 27.9186 36.8235 28.2415 36.9711 28.597C37.1187 28.9525 37.1947 29.3337 37.1947 29.7187C37.1947 30.1037 37.1187 30.4848 36.9711 30.8404C36.8235 31.1959 36.6071 31.5188 36.3344 31.7906L33.1657 34.9593C32.8939 35.232 32.571 35.4484 32.2155 35.596C31.86 35.7436 31.4788 35.8196 31.0938 35.8196C30.7088 35.8196 30.3277 35.7436 29.9721 35.596C29.6166 35.4484 29.2937 35.232 29.0219 34.9593L13.6657 19.6031C13.1179 19.0527 12.8104 18.3077 12.8104 17.5312C12.8104 16.7547 13.1179 16.0097 13.6657 15.4593L16.8344 12.2906C17.3848 11.7428 18.1298 11.4353 18.9063 11.4353C19.6828 11.4353 20.4278 11.7428 20.9782 12.2906L36.3344 27.6468Z'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M26.0469 23.1093L28.4844 20.6718M22.3906 19.453L24.8281 17.0155M18.7344 15.7968L21.1719 13.3593M29.7031 26.7655L32.1406 24.328M34.3344 26.5218C34.6071 26.7936 34.8235 27.1165 34.9711 27.472C35.1187 27.8275 35.1947 28.2087 35.1947 28.5937C35.1947 28.9787 35.1187 29.3598 34.9711 29.7154C34.8235 30.0709 34.6071 30.3938 34.3344 30.6656L31.1657 33.8343C30.8939 34.107 30.571 34.3234 30.2155 34.471C29.86 34.6186 29.4788 34.6946 29.0938 34.6946C28.7088 34.6946 28.3277 34.6186 27.9721 34.471C27.6166 34.3234 27.2937 34.107 27.0219 33.8343L11.6657 18.4781C11.1179 17.9277 10.8104 17.1827 10.8104 16.4062C10.8104 15.6297 11.1179 14.8847 11.6657 14.3343L14.8344 11.1656C15.3848 10.6178 16.1298 10.3103 16.9063 10.3103C17.6828 10.3103 18.4278 10.6178 18.9782 11.1656L34.3344 26.5218Z'
                      stroke='#0A0A0A'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <div className='flex items-center gap-1'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Card Details
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Additional details about cards and labels.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <FormField
                label='Card size'
                description='Size of the printed card.'
              >
                <Select
                  value={form.cardSize}
                  onValueChange={(value) => handleFormChange('cardSize', value)}
                >
                  <SelectTrigger className='w-full h-9 px-3 bg-[var(--form-background)] border border-[var(--form-border)] rounded-lg shadow-sm'>
                    <SelectValue placeholder='Select card size' />
                  </SelectTrigger>
                  <SelectContent>
                    {cardSizeOptions.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label='Label size'
                description='Size of the printed label.'
              >
                <Select
                  value={form.labelSize}
                  onValueChange={(value) =>
                    handleFormChange('labelSize', value)
                  }
                >
                  <SelectTrigger className='w-full h-9 px-3 bg-[var(--form-background)] border border-[var(--form-border)] rounded-lg shadow-sm'>
                    <SelectValue placeholder='Select label size' />
                  </SelectTrigger>
                  <SelectContent>
                    {labelSizeOptions.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label='Breadcrumb size'
                description='Size of the breadcrumb field on the printed card.'
              >
                <Select
                  value={form.breadcrumbSize}
                  onValueChange={(value) =>
                    handleFormChange('breadcrumbSize', value)
                  }
                >
                  <SelectTrigger className='w-full h-9 px-3 bg-[var(--form-background)] border border-[var(--form-border)] rounded-lg shadow-sm'>
                    <SelectValue placeholder='Select breadcrumb size' />
                  </SelectTrigger>
                  <SelectContent>
                    {breadcrumbSizeOptions.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label='Card color'
                description='Color indicator for the printed card.'
              >
                <InputWrapper
                  value={form.color}
                  onChange={(color) => handleFormChange('color', color)}
                />
              </FormField>
            </div>

            {/* Shop Usage Section */}
            <div
              ref={shopUsageRef}
              className='bg-white border border-gray-200 rounded-xl p-4 space-y-2 scroll-mt-1 scroll-mb-1'
            >
              <div className='flex items-center gap-3 mb-2'>
                <div className='flex items-center justify-center'>
                  <svg
                    width='60'
                    height='50'
                    viewBox='0 0 54 45'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M36.7072 40.701C29.0026 45.0902 12.7372 44.576 6.81476 33.7919C0.892293 23.0078 3.89113 1.79134 15.37 1.84832C19.1604 1.86816 23.0919 5.86583 28.9292 11.3158C31.852 14.0483 36.1325 10.1548 40.8513 16.9858C47.8319 27.0953 44.4119 36.3119 36.7121 40.6982L36.7072 40.701Z'
                      fill='#E0F2FE'
                    />
                    <path
                      d='M17.6875 30.9376H32.3125M17.6875 26.0626H32.3125M37.1875 19.1766V33.375C37.1875 34.0215 36.9307 34.6414 36.4736 35.0986C36.0165 35.5557 35.3965 35.8125 34.75 35.8125H15.25C14.6035 35.8125 13.9835 35.5557 13.5264 35.0986C13.0693 34.6414 12.8125 34.0215 12.8125 33.375V19.1766C12.8145 18.6904 12.9617 18.216 13.2354 17.8143C13.509 17.4125 13.8965 17.1017 14.3481 16.9219L24.0981 13.0219C24.6773 12.7912 25.3227 12.7912 25.9019 13.0219L35.6519 16.9219C36.1035 17.1017 36.491 17.4125 36.7646 17.8143C37.0383 18.216 37.1855 18.6904 37.1875 19.1766ZM17.6875 21.1876H32.3125V35.8126H17.6875V21.1876Z'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M15.6875 29.8126H30.3125M15.6875 24.9376H30.3125M35.1875 18.0516V32.25C35.1875 32.8965 34.9307 33.5164 34.4736 33.9736C34.0165 34.4307 33.3965 34.6875 32.75 34.6875H13.25C12.6035 34.6875 11.9835 34.4307 11.5264 33.9736C11.0693 33.5164 10.8125 32.8965 10.8125 32.25V18.0516C10.8145 17.5654 10.9617 17.091 11.2354 16.6893C11.509 16.2875 11.8965 15.9767 12.3481 15.7969L22.0981 11.8969C22.6773 11.6662 23.3227 11.6662 23.9019 11.8969L33.6519 15.7969C34.1035 15.9767 34.491 16.2875 34.7646 16.6893C35.0383 17.091 35.1855 17.5654 35.1875 18.0516ZM15.6875 20.0626H30.3125V34.6876H15.6875V20.0626Z'
                      stroke='#0A0A0A'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <div className='flex items-center gap-1'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Shop Usage
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Enter details to help keep things organized in the shop.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <FormField
                label='Location'
                description='Where the item will be used.'
              >
                <LocationTypeahead
                  value={form.locator.location || ''}
                  onChange={(value) =>
                    handleFormChange('locator', value, 'location')
                  }
                  placeholder='Search for location'
                />
              </FormField>

              <FormField
                label='Sub-location'
                description='An optional sub-location for the item.'
              >
                <SublocationTypeahead
                  value={form.locator.subLocation || ''}
                  onChange={(value) =>
                    handleFormChange('locator', value, 'subLocation')
                  }
                  placeholder='Search for sub-location'
                />
              </FormField>

              <FormField
                label='Department'
                description='Department where the item is used.'
              >
                <DepartmentTypeahead
                  value={form.locator.department || ''}
                  onChange={(value) =>
                    handleFormChange('locator', value, 'department')
                  }
                  placeholder='Search for department'
                />
              </FormField>

              <FormField
                label='Facility'
                description='Facility where the item is used.'
              >
                <FacilityTypeahead
                  value={form.locator.facility || ''}
                  onChange={(value) =>
                    handleFormChange('locator', value, 'facility')
                  }
                  placeholder='Search for facility'
                />
              </FormField>

              <FormField label='Type' description='Select the type of item'>
                <TypeTypeahead
                  value={form.classification.type}
                  onChange={(value) =>
                    handleFormChange('classification', value, 'type')
                  }
                  placeholder='Search for type'
                />
              </FormField>

              <FormField
                label='Sub-type'
                description='Select the sub-type of item'
              >
                <SubTypeTypeahead
                  value={form.classification.subType}
                  onChange={(value) =>
                    handleFormChange('classification', value, 'subType')
                  }
                  placeholder='Search for sub-type'
                />
              </FormField>

              <FormField
                label='Use case'
                description="A process-specific label for items, depending on your shop's needs."
              >
                <UseCaseTypeahead
                  value={form.useCase}
                  onChange={(value) => handleFormChange('useCase', value)}
                  placeholder='Search for use case'
                />
              </FormField>

              <InputField
                label='Internal SKU'
                placeholder='Internal SKU'
                value={form.internalSKU || ''}
                onChange={(value) => handleFormChange('internalSKU', value)}
                description='A unique ID for the item for use within your organization.'
              />

              <InputField
                label='General Ledger Code'
                placeholder='GL Code'
                value={form.generalLedgerCode || ''}
                onChange={(value) =>
                  handleFormChange('generalLedgerCode', value)
                }
                description='The general ledger code for accounting and financial reporting.'
              />
            </div>

            {/* Additional Info Section */}
            <div
              ref={additionalInfoRef}
              className='bg-white border border-gray-200 rounded-xl p-4 space-y-2 scroll-mt-1 scroll-mb-1'
            >
              <div className='flex items-center gap-3 mb-2'>
                <div className='flex items-center justify-center'>
                  <svg
                    width='60'
                    height='50'
                    viewBox='0 0 54 45'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M36.7072 40.701C29.0026 45.0902 12.7372 44.576 6.81476 33.7919C0.892293 23.0078 3.89113 1.79134 15.37 1.84832C19.1604 1.86816 23.0919 5.86583 28.9292 11.3158C31.852 14.0483 36.1325 10.1548 40.8513 16.9858C47.8319 27.0953 44.4119 36.3119 36.7121 40.6982L36.7072 40.701Z'
                      fill='#E0F2FE'
                    />
                    <path
                      d='M25 28.5V23.625M25 18.75H25.0122M37.1875 23.625C37.1875 30.356 31.731 35.8125 25 35.8125C18.269 35.8125 12.8125 30.356 12.8125 23.625C12.8125 16.894 18.269 11.4375 25 11.4375C31.731 11.4375 37.1875 16.894 37.1875 23.625Z'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M23 27.375V22.5M23 17.625H23.0122M35.1875 22.5C35.1875 29.231 29.731 34.6875 23 34.6875C16.269 34.6875 10.8125 29.231 10.8125 22.5C10.8125 15.769 16.269 10.3125 23 10.3125C29.731 10.3125 35.1875 15.769 35.1875 22.5Z'
                      stroke='#0A0A0A'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <div className='flex items-center gap-1'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Additional Info
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='inline-flex p-0.5 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0'
                        aria-label='More information'
                      >
                        <Info className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-[280px] text-left'
                      sideOffset={4}
                    >
                      Add as many (or as little) details as you need.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <FormField label='Card Notes'>
                <Textarea
                  value={form.cardNotesDefault}
                  onChange={(e) => handleInputChange('cardNotesDefault', e)}
                  onBlur={(e) => handleInputBlur('cardNotesDefault', e)}
                  placeholder='Type card notes here'
                  className='min-h-[60px] w-full resize-none rounded-lg border border-[#e5e5e5] shadow-sm px-3 py-2 text-sm text-[#737373] placeholder:text-[#737373]'
                />
              </FormField>

              <FormField label='Note'>
                <Textarea
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e)}
                  onBlur={(e) => handleInputBlur('notes', e)}
                  placeholder='Type your notes here'
                  className='min-h-[60px] w-full resize-none rounded-lg border border-[#e5e5e5] shadow-sm px-3 py-2 text-sm text-[#737373] placeholder:text-[#737373]'
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Footer buttons - fuera del scroll para que siempre se vean */}
        <div className='shrink-0 w-full border-t border-[var(--form-border)] bg-[var(--form-background)] px-6 py-4 z-50 flex justify-between items-center'>
          <Button
            variant='outline'
            className='text-sm font-medium text-[var(--form-text-primary)] px-4 py-2 h-10 rounded-md border border-[var(--form-border)]'
            onClick={() => {
              // Clear localStorage when explicitly canceling
              resetFormState(true);
              // Use onCancel if provided (returns to details view), otherwise use onClose (closes everything)
              if (onCancel) {
                onCancel();
              } else {
                onClose();
              }
            }}
          >
            Cancel
          </Button>

          <div
            className={cn(
              'inline-flex items-center overflow-hidden rounded-md border border-[#171717] bg-[#171717] text-white text-sm font-medium shadow-sm h-10',
              (!canSubmit || isLoading) && 'opacity-60 cursor-not-allowed',
            )}
          >
            <button
              type='button'
              className='px-4 h-full disabled:pointer-events-none disabled:cursor-not-allowed'
              onClick={() => {
                if (validateForm()) {
                  handleCreateItem(isCreatingDraft); // Use current draft state
                }
              }}
              disabled={isLoading || !canSubmit}
            >
              {isCreatingDraft
                ? 'Save as Draft'
                : itemToEdit && !isDuplicating
                  ? 'Update'
                  : 'Publish'}
            </button>
            <div className='h-6 w-px bg-white/30' />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className='px-3 h-full disabled:pointer-events-none disabled:cursor-not-allowed'
                  disabled={isLoading || !canSubmit}
                >
                  <ChevronDown className='h-4 w-4' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-[200px] rounded-md border border-[var(--form-border)] bg-[var(--form-background)] py-2 shadow-md'
              >
                <DropdownMenuItem
                  className='text-sm text-[var(--form-text-primary)] px-4 py-2 hover:bg-[var(--form-background-secondary)] cursor-pointer'
                  onClick={() => {
                    if (validateForm()) {
                      handleCreateItem(false, true);
                    }
                  }}
                  disabled={isLoading || !canSubmit}
                >
                  Publish & add another
                </DropdownMenuItem>
                {!isCreatingDraft ? (
                  <DropdownMenuItem
                    className='text-sm text-[var(--form-text-primary)] px-4 py-2 hover:bg-[var(--form-background-secondary)] cursor-pointer'
                    onClick={() => {
                      setIsCreatingDraft(true);
                    }}
                    disabled={isLoading}
                  >
                    Save as draft
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className='text-sm text-[var(--form-text-primary)] px-4 py-2 hover:bg-[var(--form-background-secondary)] cursor-pointer'
                    onClick={() => {
                      setIsCreatingDraft(false);
                    }}
                    disabled={isLoading}
                  >
                    Publish
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
