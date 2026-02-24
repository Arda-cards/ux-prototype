'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@frontend/components/ui/input';
import { Button } from '@frontend/components/ui/button';
import { Label } from '@frontend/components/ui/label';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { RequiredAsterisk } from '@frontend/components/common/RequiredAsterisk';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);

    try {
      await forgotPassword(email);
      router.push(`/reset-password/email-sent`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
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
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4' noValidate>
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-[14px] font-medium'
                style={{
                  fontFamily: 'Geist',
                  color: 'var(--base-foreground, #0A0A0A)',
                }}
              >
                Email <RequiredAsterisk />
              </Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email address'
                autoComplete='email'
                aria-invalid={!!error}
                className={`h-9 px-3 py-1 rounded-lg shadow-sm ${
                  error
                    ? 'border border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
                    : 'border'
                } text-[14px] placeholder:text-[#737373]`}
                style={{
                  borderColor: error
                    ? undefined
                    : 'var(--base-border, #E5E5E5)',
                  color: 'var(--base-muted-foreground, #737373)',
                }}
              />
              {error && <p className='text-red-500 text-sm'>{error}</p>}
            </div>

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
                  Send reset link
                </div>
              ) : (
                'Send reset link'
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
