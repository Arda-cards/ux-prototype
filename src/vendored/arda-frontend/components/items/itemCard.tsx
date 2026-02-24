'use client';

import Image from 'next/image';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Input } from '@frontend/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@frontend/components/ui/select';
import {
  PackageMinus,
  Package,
  ImageUp,
  Trash2Icon,
  ShoppingCart,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@frontend/lib/utils';
import { UnitTypeahead } from './UnitTypeahead';
import type {
  Supply,
  ItemClassification,
  CardSize,
  LabelSize,
  BreadcrumbSize,
} from '@frontend/types/items';
import type { Locator } from '@frontend/types/domain';

// Type for ItemCard that matches the form structure
export type ItemCardForm = {
  name: string;
  imageUrl: string;
  classification: ItemClassification;
  useCase: string;
  locator: Locator;
  internalSKU: string;
  notes: string;
  cardNotesDefault: string;
  taxable: boolean;
  primarySupply: Supply & {
    minimumQuantity: { amount: number; unit: string };
    orderQuantity: { amount: number; unit: string };
  };
  secondarySupply: Supply & {
    minimumQuantity: { amount: number; unit: string };
    orderQuantity: { amount: number; unit: string };
  };
  cardSize: CardSize;
  labelSize: LabelSize;
  breadcrumbSize: BreadcrumbSize;
};

type ItemCardProps = {
  form: ItemCardForm;
  onFormChange: (form: ItemCardForm) => void;
  showAllErrors?: boolean;
  imageFieldError?: string | null;
  onImageErrorClear?: () => void;
};

// ComboboxSelect component for editable dropdowns in the card
const ComboboxSelect = ({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when value prop changes
  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    setInputValue(selectedOption ? selectedOption.label : value);
  }, [value, options]);

  // Filter options based on input
  useEffect(() => {
    if (inputValue) {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()),
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (selectedValue: string, selectedLabel: string) => {
    setInputValue(selectedLabel);
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      // Check if the inputValue matches any option label
      const matchingOption = options.find(
        (option) => option.label.toLowerCase() === inputValue.toLowerCase(),
      );
      if (matchingOption) {
        onChange(matchingOption.value);
      } else {
        // Use the input value as is if no match found
        onChange(inputValue);
      }
    }, 150);
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            inputValue ? 'text-[#0A0A0A]' : 'text-[#737373]',
          )}
        />
        <button
          type='button'
          onClick={handleToggleDropdown}
          className='absolute inset-y-0 right-0 flex items-center px-2'
        >
          <ChevronDown className='h-4 w-4 opacity-50' />
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className='absolute z-50 w-full mt-1 bg-white border border-input rounded-md shadow-lg max-h-60 overflow-auto'>
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              type='button'
              className='w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground'
              onMouseDown={(e) => {
                e.preventDefault();
                handleOptionSelect(option.value, option.label);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export function ItemCard({
  form,
  onFormChange,
  showAllErrors = false,
  imageFieldError = null,
  onImageErrorClear,
}: ItemCardProps) {
  const [imageError, setImageError] = useState(false);

  const isFilled =
    form.name &&
    form.primarySupply.minimumQuantity?.amount &&
    form.primarySupply.minimumQuantity?.unit &&
    form.primarySupply.orderQuantity?.amount &&
    form.primarySupply.orderQuantity?.unit &&
    form.locator.location &&
    form.primarySupply.supplier &&
    form.imageUrl;

  // Helper function to determine if we should use Next.js Image or regular img
  const isUploadedFile = (url: string) => {
    return url.startsWith('data:') || url.includes('abrafersrl.com.ar');
  };

  // Reset image error when URL changes
  const handleImageUrlChange = (newUrl: string) => {
    setImageError(false);
    onImageErrorClear?.();
    onFormChange({ ...form, imageUrl: newUrl });
  };

  // Handle updates to card fields
  const handleCardFieldChange = (key: string, value: string) => {
    const newForm = { ...form };

    switch (key) {
      case 'minQty':
        // Update both root-level minQuantity and primarySupply.minimumQuantity for compatibility
        const minQtyAmount = parseFloat(value) || 0;
        const minQtyUnit = newForm.primarySupply.minimumQuantity.unit;
        newForm.primarySupply = {
          ...newForm.primarySupply,
          minimumQuantity: {
            amount: minQtyAmount,
            unit: minQtyUnit,
          },
        };
        break;
      case 'orderQty':
        newForm.primarySupply = {
          ...newForm.primarySupply,
          orderQuantity: {
            amount: parseFloat(value) || 0,
            unit: newForm.primarySupply.orderQuantity.unit,
          },
        };
        break;
      case 'minUnit':
        // Update both root-level minQuantity and primarySupply.minimumQuantity for compatibility
        const minUnitAmount = newForm.primarySupply.minimumQuantity.amount;
        newForm.primarySupply = {
          ...newForm.primarySupply,
          minimumQuantity: {
            amount: minUnitAmount,
            unit: value,
          },
        };
        break;
      case 'orderUnit':
        newForm.primarySupply = {
          ...newForm.primarySupply,
          orderQuantity: {
            amount: newForm.primarySupply.orderQuantity.amount,
            unit: value,
          },
        };
        break;
      case 'location':
        newForm.locator = {
          ...newForm.locator,
          location: value,
        };
        break;
      case 'supplier':
        newForm.primarySupply = {
          ...newForm.primarySupply,
          supplier: value,
        };
        break;
      default:
        // For other fields that exist on the form type
        if (key in newForm) {
          (newForm as Record<string, unknown>)[key] = value;
        }
        break;
    }

    onFormChange(newForm);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setImageError(false);
          onImageErrorClear?.();
          onFormChange({ ...form, imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    },
    [form, onFormChange, onImageErrorClear],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'] },
    multiple: false,
    disabled: true, // Disable image upload functionality
  });

  return (
    <div className='w-full max-w-[374px] rounded-xl border border-[#E5E5E5] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] px-4 py-5 flex flex-col gap-4 font-geist bg-white'>
      <div className='flex items-start justify-between'>
        <div className='flex-1 relative'>
          <Input
            placeholder='Title *'
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            className={`font-bold text-[18px] h-[44px] rounded-lg ${
              form.name ? 'text-[#0A0A0A]' : 'placeholder:text-[#737373] '
            } ${
              !form.name && showAllErrors
                ? 'border-red-300 focus:border-red-500'
                : ''
            }`}
          />
          {!form.name && showAllErrors && (
            <div className='absolute -bottom-5 left-0 text-xs text-red-500'>
              Name is required
            </div>
          )}
        </div>
        <Image
          src='/images/QRC.svg'
          alt='QR'
          width={40}
          height={40}
          className='object-contain ml-3'
        />
      </div>

      {/* Divider */}
      <div
        className={`w-full h-[6px] ${
          isFilled ? 'bg-[#3B82F6]' : 'bg-[#CBD5E1]'
        }`}
      />

      {/* Section Blocks */}
      {[
        {
          icon: PackageMinus,
          label: 'Minimum',
          inputs: [
            {
              type: 'input',
              placeholder: 'Min qty',
              value: form.primarySupply.minimumQuantity.amount.toString(),
              key: 'minQty',
            },
            {
              type: 'input',
              value: form.primarySupply.minimumQuantity.unit,
              key: 'minUnit',
              placeholder: 'Units',
            },
          ],
        },
        {
          icon: Package,
          label: 'Order',
          inputs: [
            {
              type: 'input',
              placeholder: 'Order qty',
              value: form.primarySupply.orderQuantity.amount.toString(),
              key: 'orderQty',
            },
            {
              type: 'input',
              value: form.primarySupply.orderQuantity.unit,
              key: 'orderUnit',
              placeholder: 'Units',
            },
          ],
        },
        // Supplier - Only show if populated
        ...(form.primarySupply.supplier
          ? [
              {
                icon: ShoppingCart,
                label: 'Supplier',
                inputs: [
                  {
                    type: 'static',
                    value: form.primarySupply.supplier,
                    key: 'supplier',
                  },
                ],
              },
            ]
          : []),
      ].map((section, idx) => (
        <div key={idx} className='flex gap-2 items-center'>
          <div className='w-10 flex flex-col items-center'>
            <section.icon className='w-5 h-5 text-black' />
            <span className='text-[10px] text-black font-medium'>
              {section.label}
            </span>
          </div>
          {section.inputs.map((input, i) => {
            if (input.type === 'static') {
              return (
                <div
                  key={i}
                  className={`${
                    'full' in input && input.full ? 'w-full' : 'flex-1'
                  } rounded-lg px-3 py-2 text-sm text-[#0A0A0A] bg-gray-50 border border-gray-200`}
                >
                  {input.value}
                </div>
              );
            }

            if (input.key === 'minUnit' || input.key === 'orderUnit') {
              return (
                <UnitTypeahead
                  key={i}
                  value={input.value}
                  onChange={(val) => handleCardFieldChange(input.key, val)}
                  placeholder={
                    'placeholder' in input ? input.placeholder || '' : ''
                  }
                />
              );
            }

            if (input.type === 'input') {
              return (
                <Input
                  key={i}
                  placeholder={
                    'placeholder' in input ? input.placeholder || '' : ''
                  }
                  value={input.value}
                  onChange={(e) =>
                    handleCardFieldChange(input.key, e.target.value)
                  }
                  className={`${
                    'full' in input && input.full ? 'w-full' : 'flex-1'
                  } rounded-lg ${
                    input.value ? 'text-[#0A0A0A]' : 'text-[#737373]'
                  }`}
                />
              );
            }

            if (input.key === 'location' || input.key === 'supplier') {
              return (
                <ComboboxSelect
                  key={i}
                  value={input.value}
                  onChange={(val) => handleCardFieldChange(input.key, val)}
                  options={
                    Array.isArray(
                      'options' in input ? input.options : undefined,
                    )
                      ? (
                          ('options' in input ? input.options : []) as (
                            | string
                            | { value: string; label: string }
                          )[]
                        ).map(
                          (opt: string | { value: string; label: string }) =>
                            typeof opt === 'string'
                              ? { value: opt, label: opt }
                              : opt,
                        )
                      : []
                  }
                  placeholder={
                    'placeholder' in input ? input.placeholder || '' : ''
                  }
                  className={`${
                    'full' in input && input.full ? 'w-full' : 'flex-1'
                  }`}
                />
              );
            }

            return (
              <Select
                key={i}
                value={input.value}
                onValueChange={(val) => handleCardFieldChange(input.key, val)}
              >
                <SelectTrigger
                  className={`${
                    'full' in input && input.full ? 'w-full' : 'flex-1'
                  }  rounded-lg`}
                >
                  <SelectValue
                    placeholder={
                      'placeholder' in input ? input.placeholder || '' : ''
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(
                    'options' in input ? input.options : undefined,
                  ) &&
                    (
                      ('options' in input ? input.options : []) as (
                        | string
                        | { value: string; label: string }
                      )[]
                    ).map((opt: string | { value: string; label: string }) => (
                      <SelectItem
                        key={typeof opt === 'string' ? opt : opt.value}
                        value={typeof opt === 'string' ? opt : opt.value}
                      >
                        {typeof opt === 'string' ? opt : opt.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            );
          })}
        </div>
      ))}

      <div className='w-full'>
        {form.imageUrl && !imageError && !imageFieldError ? (
          <div className='relative w-full max-h-[300px] overflow-hidden rounded-md border border-[#E5E5E5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center bg-white'>
            {isUploadedFile(form.imageUrl) ? (
              <Image
                src={form.imageUrl}
                alt='Preview'
                width={0}
                height={0}
                sizes='100vw'
                className='w-full h-auto max-h-[300px] object-contain rounded-md'
                onError={() => setImageError(true)}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imageUrl}
                alt='Preview'
                className='w-full h-auto max-h-[300px] object-contain rounded-md'
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            )}
            <button
              onClick={() => handleImageUrlChange('')}
              className='absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white border border-[#E5E5E5] rounded-md shadow-sm'
            >
              <Trash2Icon className='w-4 h-4 text-black' />
            </button>
          </div>
        ) : form.imageUrl && (imageError || imageFieldError) ? (
          <div className='relative w-full min-h-[120px] max-h-[300px] overflow-hidden rounded-md border-2 border-red-300 bg-red-50 flex flex-col justify-center items-center gap-2 p-4'>
            <div className='text-center'>
              <p className='text-sm text-red-600 font-medium'>
                {imageFieldError
                  ? 'Incompatible image format'
                  : 'Failed to load image'}
              </p>
              <p className='text-xs text-red-500 mt-1'>
                {imageFieldError || 'Please check the URL and try again'}
              </p>
            </div>
            <button
              onClick={() => handleImageUrlChange('')}
              className='absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white border border-[#E5E5E5] rounded-md shadow-sm'
            >
              <Trash2Icon className='w-4 h-4 text-black' />
            </button>
          </div>
        ) : (
          <div className='w-full bg-white border border-dashed border-[#737373] rounded-lg p-4'>
            {/* Image Upload/Selection Area */}
            <div
              {...getRootProps()}
              className='flex flex-col items-center justify-center gap-2 cursor-not-allowed opacity-50'
            >
              <input {...getInputProps()} />
              <ImageUp className='w-14 h-14 text-[#737373] mb-2' />
            </div>

            {/* Separator */}
            <div className='my-4 text-center'>
              <p className='text-sm text-[#737373]'> Enter image URL</p>
            </div>

            {/* Image URL Input Area */}
            <div
              className={`flex border rounded-lg overflow-hidden ${
                imageError || imageFieldError
                  ? 'border-red-300'
                  : 'border-[#E5E5E5]'
              }`}
            >
              <div className='px-3 py-2 bg-[#F3F4F6] text-sm text-[#737373] border-r border-[#E5E5E5]'>
                https://
              </div>
              <Input
                placeholder='www.url/...'
                value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className='flex-1 border-none rounded-none text-sm placeholder:text-[#737373] text-[#0A0A0A]'
              />
            </div>
            {imageFieldError && (
              <p className='text-xs text-red-500 mt-1'>{imageFieldError}</p>
            )}
            {imageError && !imageFieldError && (
              <p className='text-xs text-red-500 mt-1'>
                Unable to load image from this URL
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className={`w-full h-[10px] ${
          isFilled ? 'bg-[#3B82F6]' : 'bg-[#CBD5E1]'
        }`}
      />
      <div className='text-center'>
        <Image
          src='/images/logoArdaCards.svg'
          alt='Arda'
          width={90}
          height={20}
          className='mx-auto'
        />
      </div>
    </div>
  );
}
