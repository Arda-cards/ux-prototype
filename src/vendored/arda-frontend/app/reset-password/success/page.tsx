'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ResetPasswordSuccessPage() {
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
              Password Reset Successful
            </h2>
            <p
              className='text-[14px] leading-5'
              style={{
                fontFamily: 'Geist',
                color: 'var(--base-muted-foreground, #737373)',
              }}
            >
              Your password was successfully reset. You can now{' '}
              <Link
                href='/signin'
                className='underline hover:opacity-80'
                style={{ color: 'var(--base-primary, #FC5A29)' }}
              >
                log in
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
