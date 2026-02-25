'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { Button } from '@frontend/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { PasswordInput } from '@frontend/components/common/PasswordInput';
import {
  validatePassword,
  PASSWORD_ERROR_MESSAGE,
} from '@frontend/lib/passwordValidation';

export default function CreateNewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';
  const { confirmNewPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    let valid = true;

    if (!validatePassword(newPassword)) {
      setNewPasswordError(PASSWORD_ERROR_MESSAGE);
      valid = false;
    }

    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Ensure new password matches exactly.');
      valid = false;
    }

    if (!valid) return;

    setIsLoading(true);

    try {
      //TODO: Implement confirmNewPassword function in useAuth hook
      await confirmNewPassword(email, code, newPassword);
      router.push('/reset-password/success');
    } catch (err) {
      console.error(err);
      setGeneralError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden'>
      {/* Left Panel */}
      <div className='hidden md:flex relative overflow-hidden bg-[#FC5A29]'>
        {/* Background solid layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#FC5A29',
            zIndex: 0,
          }}
        />

        {/* Diagonal gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: -600,
            width: 613,
            height: 1025,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(252, 90, 41, 0.20) 68%)',
            transform: 'skewX(-35deg)',
            transformOrigin: 'top right',
            zIndex: 1,
          }}
        />

        {/* Logo */}
        <div className='relative z-10 p-8'>
          <Image
            src='/images/ArdaLogoV1.svg'
            alt='Logo'
            width={40}
            height={40}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className='flex items-center justify-center px-6 py-10 bg-white'>
        <div className='w-full max-w-sm'>
          {/* Mobile logo */}
          <div className='mb-8 md:hidden'>
            <Image
              src='/images/ArdaLogoMobileV1.svg'
              alt='Logo'
              width={40}
              height={40}
              className='mb-4'
            />
          </div>

          <div className='flex flex-col items-start gap-3'>
            <h2
              className='text-[30px] font-bold leading-[36px]'
              style={{
                fontFamily: 'Geist',
                color: 'var(--base-foreground, #0A0A0A)',
              }}
            >
              Reset your password
            </h2>
            <p
              className='text-[14px] leading-5'
              style={{
                fontFamily: 'Geist',
                color: 'var(--base-muted-foreground, #737373)',
              }}
            >
              Create a new, secure password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4' noValidate>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-[14px] font-medium'
                  style={{
                    fontFamily: 'Geist',
                    color: 'var(--base-foreground, #0A0A0A)',
                  }}
                >
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  disabled
                  className='h-9 px-3 py-1 rounded-lg shadow-sm text-[14px] opacity-50'
                  style={{
                    fontFamily: 'Geist',
                    borderColor: 'var(--base-border, #E5E5E5)',
                    color: 'var(--base-muted-foreground, #737373)',
                  }}
                />
              </div>

              <PasswordInput
                id='new-password'
                label='New password'
                value={newPassword}
                onChange={setNewPassword}
                placeholder='New password'
                required={true}
                error={newPasswordError}
              />

              <PasswordInput
                id='confirm-password'
                label='Confirm password'
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder='Confirm password'
                required={true}
                error={confirmPasswordError}
              />
            </div>

            {generalError && (
              <p
                className='text-sm text-red-500'
                style={{ fontFamily: 'Geist' }}
              >
                {generalError}
              </p>
            )}

            <Button
              type='submit'
              className='w-full text-sm'
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--base-primary, #FC5A29)',
                color: 'var(--base-primary-foreground, #FAFAFA)',
              }}
            >
              {isLoading ? (
                <div className='flex items-center justify-center gap-2'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Reset password
                </div>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>

          <div
            className='mt-6 flex flex-col items-center gap-2 text-[14px] leading-5'
            style={{ fontFamily: 'Geist' }}
          >
            <p className='text-sm text-muted-foreground'>
              Remembered your password?{' '}
              <Link
                href='/signin'
                className='underline hover:opacity-80'
                style={{ color: 'var(--base-primary, #FC5A29)' }}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
