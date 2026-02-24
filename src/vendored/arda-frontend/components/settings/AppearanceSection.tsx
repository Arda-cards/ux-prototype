'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@frontend/components/ui/button';
import { Label } from '@frontend/components/ui/label';
import { ChevronsUpDown } from 'lucide-react';

export function AppearanceSection() {
  const [selectedTheme, setSelectedTheme] = useState('light');

  // Hide Appearance section in production
  if (process.env.NEXT_PUBLIC_DEPLOY_ENV === 'PRODUCTION') {
    return null;
  }

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
          Appearance
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
          Match your mood: light mode, dark mode, or automatic.
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
      <div className='flex flex-col gap-8'>
        {/* Font Selector */}
        <div className='flex flex-col gap-2'>
          <Label
            htmlFor='font'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            Font
          </Label>
          <div
            className='flex items-center justify-between px-4 py-2 rounded-lg border gap-2'
            style={{
              backgroundColor: 'var(--base-background, #fff)',
              borderColor: 'var(--base-border, #e5e5e5)',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              height: '36px',
              width: '228px',
            }}
          >
            <span
              style={{
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
              }}
            >
              Inter
            </span>
            <ChevronsUpDown
              className='w-4 h-4 opacity-50'
              style={{ color: 'var(--base-foreground, #0a0a0a)' }}
            />
          </div>
          <p
            className='text-sm'
            style={{
              color: 'var(--base-muted-foreground, #737373)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '20px',
            }}
          >
            Set the font you want to use in the dashboard.
          </p>
        </div>

        {/* Theme Selector */}
        <div className='flex flex-col gap-4'>
          <div>
            <Label
              style={{
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '100%',
              }}
            >
              Theme
            </Label>
            <p
              className='text-sm'
              style={{
                color: 'var(--base-muted-foreground, #737373)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
              }}
            >
              Select the theme for the dashboard.
            </p>
          </div>
          <div className='flex gap-4'>
            {/* Light Theme */}
            <div className='flex flex-col items-center gap-2'>
              <div
                className={`relative cursor-pointer rounded-lg overflow-hidden ${
                  selectedTheme === 'light' ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => setSelectedTheme('light')}
              >
                <Image
                  src='/images/theme-light.svg'
                  alt='Light theme'
                  width={200}
                  height={136}
                  className='w-40 h-28 object-cover'
                />
              </div>
              <span
                className='text-sm'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                Light
              </span>
            </div>

            {/* Dark Theme */}
            <div className='flex flex-col items-center gap-2'>
              <div
                className={`relative cursor-pointer rounded-lg overflow-hidden ${
                  selectedTheme === 'dark' ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => setSelectedTheme('dark')}
              >
                <Image
                  src='/images/theme-dark.svg'
                  alt='Dark theme'
                  width={200}
                  height={136}
                  className='w-40 h-28 object-cover'
                />
              </div>
              <span
                className='text-sm'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                Dark
              </span>
            </div>

            {/* System Theme */}
            <div className='flex flex-col items-center gap-2'>
              <div
                className={`relative cursor-pointer rounded-lg overflow-hidden ${
                  selectedTheme === 'system' ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => setSelectedTheme('system')}
              >
                <Image
                  src='/images/theme-system.svg'
                  alt='System theme'
                  width={208}
                  height={144}
                  className='w-40 h-28 object-cover'
                />
              </div>
              <span
                className='text-sm'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                System (Auto)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Update Button */}
      <Button
        className='w-fit px-4 py-2 rounded-lg shadow-sm mt-4'
        style={{
          backgroundColor: 'var(--base-primary, #fc5a29)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          height: '36px',
          color: 'var(--base-primary-foreground, #fafafa)',
          fontSize: '14px',
          fontFamily: 'var(--font-geist, "Geist", sans-serif)',
          lineHeight: '20px',
        }}
      >
        Update appearance
      </Button>
    </div>
  );
}
