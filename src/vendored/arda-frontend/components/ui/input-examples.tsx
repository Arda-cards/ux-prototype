'use client';

import * as React from 'react';
import { DollarSign, Euro, PoundSterling } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import {
  UrlInputProps,
  UnitInputProps,
  CurrencyInputProps,
  DropdownOption,
} from '@frontend/types/input';

// Field container component matching Figma layout
function FieldContainer({
  label,
  children,
  description,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className='flex w-full max-w-[373px] flex-col items-start gap-2'>
      <Label className='text-sm font-medium text-gray-900'>{label}</Label>
      {children}
      {description && <p className='text-sm text-gray-600'>{description}</p>}
    </div>
  );
}

// URL Input Component - Static prefix example
export const UrlInput = React.forwardRef<HTMLInputElement, UrlInputProps>(
  ({ protocol = 'https://', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type='url'
        prefix={{
          content: protocol,
        }}
        placeholder='example.com'
        {...props}
      />
    );
  }
);
UrlInput.displayName = 'UrlInput';

// Unit Input Component - Static or dropdown suffix
export const UnitInput = React.forwardRef<HTMLInputElement, UnitInputProps>(
  ({ unit, unitValue, onUnitChange, ...props }, ref) => {
    const suffix = React.useMemo(() => {
      if (typeof unit === 'string') {
        // Static unit
        return {
          content: unit,
        };
      }

      if (Array.isArray(unit)) {
        // Dropdown unit
        return {
          options: unit,
          value: unitValue,
          onValueChange: onUnitChange,
          placeholder: 'Unit',
        };
      }

      return undefined;
    }, [unit, unitValue, onUnitChange]);

    return <Input ref={ref} type='number' suffix={suffix} {...props} />;
  }
);
UnitInput.displayName = 'UnitInput';

// Currency Input Component - Static or dropdown prefix
export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ currency, currencyValue, onCurrencyChange, ...props }, ref) => {
  const prefix = React.useMemo(() => {
    if (typeof currency === 'string') {
      // Static currency
      return {
        content: currency,
      };
    }

    if (Array.isArray(currency)) {
      // Dropdown currency
      return {
        options: currency,
        value: currencyValue,
        onValueChange: onCurrencyChange,
        placeholder: 'Currency',
      };
    }

    return undefined;
  }, [currency, currencyValue, onCurrencyChange]);

  return (
    <Input ref={ref} type='number' step='0.01' prefix={prefix} {...props} />
  );
});
CurrencyInput.displayName = 'CurrencyInput';

// Example usage with predefined options
export const weightUnits: DropdownOption[] = [
  { value: 'kg', label: 'kg' },
  { value: 'lbs', label: 'lbs' },
  { value: 'g', label: 'g' },
  { value: 'oz', label: 'oz' },
];

export const currencies: DropdownOption[] = [
  { value: 'USD', label: 'USD', icon: <DollarSign className='h-3 w-3' /> },
  { value: 'EUR', label: 'EUR', icon: <Euro className='h-3 w-3' /> },
  { value: 'GBP', label: 'GBP', icon: <PoundSterling className='h-3 w-3' /> },
];

// Example showcase component matching Figma design
export function InputExamples() {
  const [url, setUrl] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [weightUnit, setWeightUnit] = React.useState('kg');
  const [price, setPrice] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');

  return (
    <div className='space-y-8 max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Enhanced Input Components
        </h1>
        <p className='text-gray-600'>
          Figma design implementation with prefix and suffix support
        </p>
      </div>

      {/* Examples matching Figma layout */}
      <div className='space-y-6'>
        <FieldContainer
          label='Label'
          description='This is an input description.'
        >
          <UrlInput
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='Placeholder'
          />
        </FieldContainer>

        <FieldContainer
          label='Label'
          description='This is an input description.'
        >
          <UnitInput
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            unit={weightUnits}
            unitValue={weightUnit}
            onUnitChange={setWeightUnit}
            placeholder='Placeholder'
          />
        </FieldContainer>

        <FieldContainer
          label='Label'
          description='This is an input description.'
        >
          <CurrencyInput
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            currency='$'
            placeholder='Placeholder'
          />
        </FieldContainer>

        <FieldContainer
          label='Label'
          description='This is an input description.'
        >
          <CurrencyInput
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            currency={currencies}
            currencyValue={currency}
            onCurrencyChange={setCurrency}
            placeholder='Placeholder'
          />
        </FieldContainer>

        <FieldContainer
          label='Label'
          description='This is an input description.'
        >
          <Input
            error
            value=''
            placeholder='Placeholder'
            prefix={{
              options: currencies,
              value: currency,
              onValueChange: setCurrency,
            }}
          />
        </FieldContainer>

        <FieldContainer
          label='Label'
          description='This is an input description.'
        >
          <Input
            error
            value=''
            placeholder='Placeholder'
            suffix={{
              options: weightUnits,
              value: weightUnit,
              onValueChange: setWeightUnit,
            }}
          />
        </FieldContainer>

        {/* Compact layout examples */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FieldContainer
            label='Label'
            description='This is an input description.'
          >
            <Input
              placeholder='Placeholder'
              prefix={{
                options: currencies,
                value: currency,
                onValueChange: setCurrency,
              }}
            />
          </FieldContainer>

          <FieldContainer
            label='Label'
            description='This is an input description.'
          >
            <Input
              placeholder='Placeholder'
              suffix={{
                options: weightUnits,
                value: weightUnit,
                onValueChange: setWeightUnit,
              }}
            />
          </FieldContainer>
        </div>
      </div>
    </div>
  );
}
