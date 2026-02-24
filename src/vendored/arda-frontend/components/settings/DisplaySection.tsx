'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@frontend/components/ui/button';
import { Label } from '@frontend/components/ui/label';
import { Checkbox } from '@frontend/components/ui/checkbox';
import { useSidebarVisibility } from '@frontend/store/hooks/useSidebarVisibility';

export function DisplaySection() {
  const { visibility, setItemVisibility } = useSidebarVisibility();

  // Local state to hold temporary changes before saving
  const [localVisibility, setLocalVisibility] = useState(visibility);

  // Sync local state with global state when it changes
  useEffect(() => {
    setLocalVisibility(visibility);
  }, [visibility]);

  const handleToggle = (item: keyof typeof localVisibility) => {
    setLocalVisibility((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleUpdateDisplay = () => {
    // Apply all changes to global state
    Object.entries(localVisibility).forEach(([key, value]) => {
      setItemVisibility(key as keyof typeof localVisibility, value);
    });
    console.log('Display settings updated:', localVisibility);
  };

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
          Display
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
          Set what you see and where you see it — navigation, tooltips,
          tutorials, and more.
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
        {/* Sidebar Section */}
        <div className='flex flex-col gap-4'>
          <div>
            <h4
              className='font-medium'
              style={{
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              }}
            >
              Sidebar
            </h4>
            <p
              className='text-sm'
              style={{
                color: 'var(--base-muted-foreground, #737373)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
              }}
            >
              Select the items you want to display in the sidebar.
            </p>
          </div>
          <div className='flex flex-col gap-3'>
            {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='dashboard'
                  checked={localVisibility.dashboard}
                  onCheckedChange={() => handleToggle('dashboard')}
                  className='data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500'
                  style={
                    {
                      '--checkbox-checked-bg': 'var(--base-primary, #fc5a29)',
                      '--checkbox-checked-border':
                        'var(--base-primary, #fc5a29)',
                    } as React.CSSProperties
                  }
                />
                <Label
                  htmlFor='dashboard'
                  style={{
                    color: 'var(--base-foreground, #0a0a0a)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                >
                  Dashboard
                </Label>
              </div>
            )}
            <div className='flex items-center space-x-3'>
              <Checkbox
                id='items'
                checked={localVisibility.items}
                onCheckedChange={() => handleToggle('items')}
                className='data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500'
                style={
                  {
                    '--checkbox-checked-bg': 'var(--base-primary, #fc5a29)',
                    '--checkbox-checked-border': 'var(--base-primary, #fc5a29)',
                  } as React.CSSProperties
                }
              />
              <Label
                htmlFor='items'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                Items
              </Label>
            </div>
            <div className='flex items-center space-x-3'>
              <Checkbox
                id='order-queue'
                checked={localVisibility.orderQueue}
                onCheckedChange={() => handleToggle('orderQueue')}
                className='data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500'
                style={
                  {
                    '--checkbox-checked-bg': 'var(--base-primary, #fc5a29)',
                    '--checkbox-checked-border': 'var(--base-primary, #fc5a29)',
                  } as React.CSSProperties
                }
              />
              <Label
                htmlFor='order-queue'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                Order Queue
              </Label>
            </div>
            <div className='flex items-center space-x-3'>
              <Checkbox
                id='receiving'
                checked={localVisibility.receiving}
                onCheckedChange={() => handleToggle('receiving')}
                className='data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500'
                style={
                  {
                    '--checkbox-checked-bg': 'var(--base-primary, #fc5a29)',
                    '--checkbox-checked-border': 'var(--base-primary, #fc5a29)',
                  } as React.CSSProperties
                }
              />
              <Label
                htmlFor='receiving'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                Receiving
              </Label>
            </div>
          </div>
        </div>

        {/* Getting started Section - Hidden in production */}
        {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
          <div className='flex flex-col gap-4'>
            <div>
              <h4
                className='font-medium'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                Getting started
              </h4>
              <p
                className='text-sm'
                style={{
                  color: 'var(--base-muted-foreground, #737373)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  lineHeight: '20px',
                }}
              >
                Everyone needs a little help now and again.
              </p>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='show-tips'
                  defaultChecked
                  className='data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500'
                  style={
                    {
                      '--checkbox-checked-bg': 'var(--base-primary, #fc5a29)',
                      '--checkbox-checked-border':
                        'var(--base-primary, #fc5a29)',
                    } as React.CSSProperties
                  }
                />
                <Label
                  htmlFor='show-tips'
                  style={{
                    color: 'var(--base-foreground, #0a0a0a)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                >
                  Show tips
                </Label>
              </div>
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='show-tutorials'
                  defaultChecked
                  className='data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500'
                  style={
                    {
                      '--checkbox-checked-bg': 'var(--base-primary, #fc5a29)',
                      '--checkbox-checked-border':
                        'var(--base-primary, #fc5a29)',
                    } as React.CSSProperties
                  }
                />
                <Label
                  htmlFor='show-tutorials'
                  style={{
                    color: 'var(--base-foreground, #0a0a0a)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                >
                  Show guided tutorials
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Button */}
      <Button
        onClick={handleUpdateDisplay}
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
        Update display
      </Button>
    </div>
  );
}
