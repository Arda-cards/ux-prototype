'use client';

import { useState } from 'react';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { RequiredAsterisk } from '@frontend/components/common/RequiredAsterisk';
import { Eye, EyeOff } from 'lucide-react';
import { 
  validatePassword, 
  getPasswordValidationDetails, 
  PASSWORD_REQUIREMENTS_TEXT 
} from '@frontend/lib/passwordValidation';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showRealTimeValidation?: boolean;
  error?: string;
  className?: string;
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = 'Password',
  required = false,
  showRealTimeValidation = false,
  error,
  className = '',
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const validationDetails = showRealTimeValidation ? getPasswordValidationDetails(value) : null;
  const hasError = !!error;
  const showValidation = showRealTimeValidation && value.length > 0 && !validatePassword(value);

  const getValidationItemClass = (isValid: boolean) => {
    return `text-[12px] ${isValid ? 'text-green-600' : 'text-red-500'}`;
  };

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? '✓' : '✗';
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={id}
        className='text-[14px] font-medium'
        style={{
          fontFamily: 'Geist',
          color: 'var(--base-foreground, #0A0A0A)',
        }}
      >
        {label} {required && <RequiredAsterisk />}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-9 px-3 py-1 pr-10 rounded-lg shadow-sm text-[14px] placeholder:text-[#737373] ${
            hasError
              ? 'border border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
              : 'border'
          }`}
          style={{
            fontFamily: 'Geist',
            borderColor: hasError ? undefined : 'var(--base-border, #E5E5E5)',
            color: 'var(--base-muted-foreground, #737373)',
          }}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Error message or requirements */}
      {hasError ? (
        <p className='text-[12px] text-red-500' style={{ fontFamily: 'Geist' }}>
          {error}
        </p>
      ) : showValidation && validationDetails ? (
        <div className='space-y-1'>
          <p className='text-[12px] text-[#737373]' style={{ fontFamily: 'Geist' }}>
            {PASSWORD_REQUIREMENTS_TEXT}
          </p>
          <div className='space-y-1 text-[11px]'>
            <div className={getValidationItemClass(validationDetails.minLength)}>
              {getValidationIcon(validationDetails.minLength)} At least 8 characters
            </div>
            <div className={getValidationItemClass(validationDetails.hasUppercase)}>
              {getValidationIcon(validationDetails.hasUppercase)} One uppercase letter
            </div>
            <div className={getValidationItemClass(validationDetails.hasLowercase)}>
              {getValidationIcon(validationDetails.hasLowercase)} One lowercase letter
            </div>
            <div className={getValidationItemClass(validationDetails.hasNumber)}>
              {getValidationIcon(validationDetails.hasNumber)} One number
            </div>
            <div className={getValidationItemClass(validationDetails.hasSpecialChar)}>
              {getValidationIcon(validationDetails.hasSpecialChar)} One special character
            </div>
            <div className={getValidationItemClass(validationDetails.noSpaces)}>
              {getValidationIcon(validationDetails.noSpaces)} No spaces
            </div>
          </div>
        </div>
      ) : (
        <p className='text-[12px] text-[#737373]' style={{ fontFamily: 'Geist' }}>
          {PASSWORD_REQUIREMENTS_TEXT}
        </p>
      )}
    </div>
  );
}
