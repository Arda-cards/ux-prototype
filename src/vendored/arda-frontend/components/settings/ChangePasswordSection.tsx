'use client';

import React, { useState } from 'react';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { debugLog, debugError } from '@frontend/lib/utils';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function ChangePasswordSection() {
  const { changePassword, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  // Validate password strength
  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  // Handle input changes with defensive programming
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear previous errors when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }

    // Validate new password in real-time
    if (field === 'newPassword') {
      setValidation(validatePassword(value));
      // Check if passwords match when new password changes
      if (formData.confirmPassword) {
        setPasswordsMatch(value === formData.confirmPassword);
      }
    }

    // Check password matching in real-time when confirm password changes
    if (field === 'confirmPassword') {
      if (formData.newPassword) {
        setPasswordsMatch(value === formData.newPassword);
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Validate form with defensive checks
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Check for required fields with defensive programming
    if (!formData.currentPassword?.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword?.trim()) {
      errors.newPassword = 'New password is required';
    } else {
      // Check password strength
      const passwordValidation = validatePassword(formData.newPassword);
      const isValidPassword = Object.values(passwordValidation).every(Boolean);
      
      if (!isValidPassword) {
        errors.newPassword = 'Password does not meet all requirements';
      }
    }

    if (!formData.confirmPassword?.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Additional defensive checks
    if (formData.currentPassword === formData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      debugLog('[CHANGE_PASSWORD] Attempting to change password');
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      debugLog('[CHANGE_PASSWORD] Password changed successfully');
      // Reset form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setValidation({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      setSuccessMessage('Password changed successfully!');
      setFormErrors({});
    } catch (err) {
      // Error is handled by AuthContext
      debugError('[CHANGE_PASSWORD] Password change failed:', err);
    }
  };

  const isPasswordValid = Object.values(validation).every(Boolean);

  return (
    <div className='w-full flex flex-col gap-6'>
      {/* Header Section */}
      <div className='flex flex-col gap-2'>
        <h3
          className='text-lg font-semibold'
          style={{
            color: 'var(--base-foreground, #0a0a0a)',
            fontSize: '18px',
            fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            lineHeight: '28px',
          }}
        >
          Change Password
        </h3>
        <p
          className='text-sm'
          style={{
            color: 'var(--base-muted-foreground, #737373)',
            fontSize: '14px',
            fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            lineHeight: '20px',
          }}
        >
          Update your password to keep your account secure.
        </p>
      </div>

      {/* Separator */}
      <div
        className='w-full h-px'
        style={{
          borderTop: '1px solid var(--base-border, #e5e5e5)',
        }}
      />

      {/* Form Section */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        {/* Current Password */}
        <div className='flex flex-col gap-2'>
          <Label
            htmlFor='currentPassword'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            Current Password
          </Label>
          <div className='relative'>
            <Input
              id='currentPassword'
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className='h-9 rounded-lg border shadow-sm pr-10'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: formErrors.currentPassword ? '#ef4444' : 'var(--base-border, #e5e5e5)',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
              }}
              placeholder='Enter your current password'
            />
            <button
              type='button'
              onClick={() => togglePasswordVisibility('current')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
            >
              {showPasswords.current ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {formErrors.currentPassword && (
            <p className='text-sm text-red-600'>{formErrors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div className='flex flex-col gap-2'>
          <Label
            htmlFor='newPassword'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            New Password
          </Label>
          <div className='relative'>
            <Input
              id='newPassword'
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className='h-9 rounded-lg border shadow-sm pr-10'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: formErrors.newPassword ? '#ef4444' : 'var(--base-border, #e5e5e5)',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
              }}
              placeholder='Enter your new password'
            />
            <button
              type='button'
              onClick={() => togglePasswordVisibility('new')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
            >
              {showPasswords.new ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {formErrors.newPassword && (
            <p className='text-sm text-red-600'>{formErrors.newPassword}</p>
          )}
        </div>

        {/* Password Requirements */}
        {formData.newPassword && (
          <div className='flex flex-col gap-2'>
            <p
              className='text-sm font-medium'
              style={{
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
              }}
            >
              Password Requirements:
            </p>
            <div className='flex flex-col gap-1'>
              {[
                { key: 'minLength', text: 'At least 8 characters' },
                { key: 'hasUppercase', text: 'One uppercase letter' },
                { key: 'hasLowercase', text: 'One lowercase letter' },
                { key: 'hasNumber', text: 'One number' },
                { key: 'hasSpecialChar', text: 'One special character' },
              ].map(({ key, text }) => (
                <div key={key} className='flex items-center gap-2'>
                  <CheckCircle
                    className={`w-4 h-4 ${
                      validation[key as keyof PasswordValidation] ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      validation[key as keyof PasswordValidation] ? 'text-green-600' : 'text-gray-500'
                    }`}
                    style={{
                      fontSize: '14px',
                      fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                      lineHeight: '20px',
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div className='flex flex-col gap-2'>
          <Label
            htmlFor='confirmPassword'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            Confirm New Password
          </Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className='h-9 rounded-lg border shadow-sm pr-10'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: formErrors.confirmPassword 
                  ? '#ef4444' 
                  : passwordsMatch === true 
                    ? '#22c55e' 
                    : passwordsMatch === false && formData.confirmPassword
                      ? '#ef4444'
                      : 'var(--base-border, #e5e5e5)',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
              }}
              placeholder='Confirm your new password'
            />
            <button
              type='button'
              onClick={() => togglePasswordVisibility('confirm')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
            >
              {showPasswords.confirm ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className='text-sm text-red-600'>{formErrors.confirmPassword}</p>
          )}
          {/* Real-time password matching feedback */}
          {formData.confirmPassword && formData.newPassword && passwordsMatch !== null && (
            <div className='flex items-center gap-2'>
              <CheckCircle 
                className={`w-4 h-4 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`} 
              />
              <p className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className='flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200'>
            <Lock className='w-4 h-4 text-red-600' />
            <p className='text-sm text-red-600'>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className='flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200'>
            <CheckCircle className='w-4 h-4 text-green-600' />
            <p className='text-sm text-green-600'>{successMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type='submit'
          disabled={loading || !isPasswordValid || !formData.currentPassword || !formData.confirmPassword || passwordsMatch === false}
          className='w-fit px-4 py-2 rounded-lg shadow-sm'
          style={{
            backgroundColor: loading || !isPasswordValid || !formData.currentPassword || !formData.confirmPassword || passwordsMatch === false
              ? 'var(--base-muted, #f5f5f5)' 
              : 'var(--base-primary, #fc5a29)',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            height: '36px',
            color: loading || !isPasswordValid || !formData.currentPassword || !formData.confirmPassword || passwordsMatch === false
              ? 'var(--base-muted-foreground, #737373)'
              : 'var(--base-primary-foreground, #fafafa)',
            fontSize: '14px',
            fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            lineHeight: '20px',
          }}
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
}
