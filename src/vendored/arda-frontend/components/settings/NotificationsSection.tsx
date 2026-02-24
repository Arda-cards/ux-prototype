'use client';

import React from 'react';
import { Button } from '@frontend/components/ui/button';
import { Label } from '@frontend/components/ui/label';
import { Switch } from '@frontend/components/ui/switch';

export function NotificationsSection() {
  // Hide Notifications section in production
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
          Notifications
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
          Decide how you are notified of new messages, and what you want to
          receive by email.
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
        {/* Messages Section */}
        <div className='flex flex-col gap-4'>
          <h4
            className='font-medium'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            }}
          >
            Messages
          </h4>
          <div className='flex flex-col gap-3'>
            <div className='flex items-center space-x-3'>
              <input
                type='radio'
                id='all-messages'
                name='notifications'
                defaultChecked
                className='w-4 h-4'
                style={{
                  accentColor: 'var(--base-primary, #fc5a29)',
                }}
              />
              <Label
                htmlFor='all-messages'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                All new messages
              </Label>
            </div>
            <div className='flex items-center space-x-3'>
              <input
                type='radio'
                id='direct-messages'
                name='notifications'
                className='w-4 h-4'
                style={{
                  accentColor: 'var(--base-primary, #fc5a29)',
                }}
              />
              <Label
                htmlFor='direct-messages'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                Direct messages
              </Label>
            </div>
            <div className='flex items-center space-x-3'>
              <input
                type='radio'
                id='nothing'
                name='notifications'
                className='w-4 h-4'
                style={{
                  accentColor: 'var(--base-primary, #fc5a29)',
                }}
              />
              <Label
                htmlFor='nothing'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                }}
              >
                Nothing
              </Label>
            </div>
          </div>
        </div>

        {/* Email Notifications Section */}
        <div className='flex flex-col gap-4'>
          <h4
            className='font-medium'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            }}
          >
            Email notifications
          </h4>
          <div className='flex flex-col gap-4'>
            <div
              className='flex items-center justify-between p-4 rounded-lg shadow-sm border'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: 'var(--base-border, #e5e5e5)',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className='flex flex-col'>
                <Label
                  style={{
                    color: 'var(--base-foreground, #0a0a0a)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: '500',
                  }}
                >
                  Communication emails
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
                  Send notifications to device.
                </p>
              </div>
              <Switch
                defaultChecked
                className='data-[state=checked]:bg-orange-500'
                style={
                  {
                    '--switch-checked-bg': 'var(--base-primary, #fc5a29)',
                  } as React.CSSProperties
                }
              />
            </div>
            <div
              className='flex items-center justify-between p-4 rounded-lg shadow-sm border'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: 'var(--base-border, #e5e5e5)',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className='flex flex-col'>
                <Label
                  style={{
                    color: 'var(--base-foreground, #0a0a0a)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: '500',
                  }}
                >
                  Marketing emails
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
                  Receive emails about new products, features, and more.
                </p>
              </div>
              <Switch
                defaultChecked
                className='data-[state=checked]:bg-orange-500'
                style={
                  {
                    '--switch-checked-bg': 'var(--base-primary, #fc5a29)',
                  } as React.CSSProperties
                }
              />
            </div>
            <div
              className='flex items-center justify-between p-4 rounded-lg shadow-sm border'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: 'var(--base-border, #e5e5e5)',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className='flex flex-col'>
                <Label
                  style={{
                    color: 'var(--base-foreground, #0a0a0a)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: '500',
                  }}
                >
                  Security emails
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
                  Receive emails about your account activity and security.
                </p>
              </div>
              <Switch
                defaultChecked
                className='data-[state=checked]:bg-orange-500'
                style={
                  {
                    '--switch-checked-bg': 'var(--base-primary, #fc5a29)',
                  } as React.CSSProperties
                }
              />
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
        Update notifications
      </Button>
    </div>
  );
}
