'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@frontend/components/ui/avatar';
import { Trash2, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useJWT } from '@frontend/store/hooks/useJWT';
import { ChangePasswordSection } from './ChangePasswordSection';

export function AccountSection() {
  const { user, checkAuth } = useAuth();
  const { payload, refreshTokenData, updatePayloadAttributes } = useJWT();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (payload) {
      setFirstName(payload.given_name || '');
      setMiddleName(payload.middle_name || '');
      setLastName(payload.family_name || '');
    }
  }, [payload]);

  const getDisplayName = () => {
    const hasNameParts = firstName || middleName || lastName;
    if (hasNameParts) {
      return [firstName, middleName, lastName].filter(Boolean).join(' ');
    }
    return user?.name || '';
  };

  const getInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const handleUpdateAccount = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const jwtToken = localStorage.getItem('idToken');
      const accessToken = localStorage.getItem('accessToken');

      if (!jwtToken || !accessToken) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const clientMetadata: Record<string, string> = {};
      if (firstName.trim()) {
        clientMetadata.given_name = firstName.trim();
      }
      if (middleName.trim()) {
        clientMetadata.middle_name = middleName.trim();
      }
      if (lastName.trim()) {
        clientMetadata.family_name = lastName.trim();
      }

      let updatedAttributes: Record<string, string> | null = null;
      if (Object.keys(clientMetadata).length > 0) {
        const updateAttributesResponse = await fetch(
          '/api/user/update-attributes',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken,
              ClientMetadata: clientMetadata,
            }),
          }
        );

        if (!updateAttributesResponse.ok) {
          const errorData = await updateAttributesResponse
            .json()
            .catch(() => ({}));
          throw new Error(
            errorData.error || 'Failed to update Cognito attributes'
          );
        }

        const updateData = await updateAttributesResponse.json();
        if (updateData.ok && updateData.attributes) {
          updatedAttributes = updateData.attributes;
        }
      }

      const updateLegacyAccountResponse = await fetch(
        '/api/user/updatelegacyaccount',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            firstName: firstName.trim() || undefined,
            middleName: middleName.trim() || undefined,
            lastName: lastName.trim() || undefined,
          }),
        }
      );

      if (!updateLegacyAccountResponse.ok) {
        const errorData = await updateLegacyAccountResponse
          .json()
          .catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user account');
      }

      const updateData = await updateLegacyAccountResponse.json();

      if (!updateData.ok) {
        throw new Error(updateData.error || 'Failed to update user account');
      }

      if (updatedAttributes && payload) {
        const updatedPayloadAttrs: Partial<typeof payload> = {};

        if (updatedAttributes.given_name !== undefined) {
          updatedPayloadAttrs.given_name =
            updatedAttributes.given_name || undefined;
        }
        if (updatedAttributes.middle_name !== undefined) {
          updatedPayloadAttrs.middle_name =
            updatedAttributes.middle_name || undefined;
        }
        if (updatedAttributes.family_name !== undefined) {
          updatedPayloadAttrs.family_name =
            updatedAttributes.family_name || undefined;
        }

        if (Object.keys(updatedPayloadAttrs).length > 0) {
          updatePayloadAttributes(updatedPayloadAttrs);
        }
      }

      await refreshTokenData();
      await checkAuth();

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (err) {
      setUpdateError(
        err instanceof Error ? err.message : 'Failed to update account'
      );
    } finally {
      setIsUpdating(false);
    }
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
          Account
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
          Update your account settings. Set your preferred language and
          timezone.
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
        {/* Name Input - Read Only */}
        <div className='flex flex-col gap-2'>
          <Label
            htmlFor='name'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            Name
          </Label>
          <div className='flex flex-col gap-2'>
            <Input
              id='name'
              value={getDisplayName()}
              readOnly
              disabled
              className='h-9 rounded-lg border shadow-sm'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: 'var(--base-border, #e5e5e5)',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
            />
            <p
              className='text-sm'
              style={{
                color: 'var(--base-muted-foreground, #737373)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '20px',
              }}
            >
              This is the name that will be displayed on your profile and in
              emails.
            </p>
          </div>
        </div>

        {/* First Name Input */}
        <div className='flex flex-col gap-2'>
          <Label
            htmlFor='firstName'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            First name
          </Label>
          <Input
            id='firstName'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder='First name'
            className='h-9 rounded-lg border shadow-sm'
            style={{
              backgroundColor: 'var(--base-background, #fff)',
              borderColor: 'var(--base-border, #e5e5e5)',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '20px',
            }}
          />
        </div>

        {/* Middle Name Input */}
        <div className='flex flex-col gap-2'>
          <Label
            htmlFor='middleName'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            Middle name
          </Label>
          <Input
            id='middleName'
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder='Middle name'
            className='h-9 rounded-lg border shadow-sm'
            style={{
              backgroundColor: 'var(--base-background, #fff)',
              borderColor: 'var(--base-border, #e5e5e5)',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '20px',
            }}
          />
        </div>

        {/* Last Name Input */}
        <div className='flex flex-col gap-2'>
          <Label
            htmlFor='lastName'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            Last name
          </Label>
          <Input
            id='lastName'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder='Last name'
            className='h-9 rounded-lg border shadow-sm'
            style={{
              backgroundColor: 'var(--base-background, #fff)',
              borderColor: 'var(--base-border, #e5e5e5)',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '20px',
            }}
          />
        </div>

        {/* Email Field */}
        <div className='flex flex-col gap-2'>
          <Label
            style={{
              color: 'var(--base-muted-foreground, #737373)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '20px',
            }}
          >
            Email
          </Label>
          <div className='flex items-center gap-1'>
            <span
              className='font-semibold'
              style={{
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '16px',
                fontFamily: 'Geist',
                lineHeight: '100%',
              }}
            >
              {user?.email || 'No email available'}
            </span>
            <div
              className='flex items-center justify-center px-2 py-0.5 rounded-full border gap-1'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: 'var(--base-border, #e5e5e5)',
                fontSize: '12px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              }}
            >
              <Check className='w-3 h-3 text-green-600' />
              <span
                className='font-semibold'
                style={{
                  color: 'var(--base-foreground, #0a0a0a)',
                  lineHeight: '16px',
                }}
              >
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Profile Image */}
        <div className='flex flex-col gap-2'>
          <Label
            className='relative inline-flex items-center'
            style={{
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '100%',
            }}
          >
            Profile image
            {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-12px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '1px solid #fff',
                }}
              />
            )}
          </Label>
          <div
            className='relative w-48 h-40 rounded-lg border overflow-hidden'
            style={{
              backgroundColor: 'var(--base-background, #fff)',
              borderColor: 'var(--base-border, #e5e5e5)',
            }}
          >
            <Avatar className='w-full h-full rounded-lg'>
              <AvatarImage
                src='/images/SidebarFooter.svg'
                alt='Profile'
                className='object-cover'
              />
              <AvatarFallback className='text-lg'>
                {getDisplayName() ? getInitials(getDisplayName()) : 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant='ghost'
              size='icon'
              className='absolute top-2 right-2 h-6 w-6 rounded-full border shadow-sm hover:bg-gray-50'
              style={{
                backgroundColor: 'var(--base-background, #fff)',
                borderColor: 'var(--base-border, #e5e5e5)',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Trash2
                className='h-3 w-3'
                style={{ color: 'var(--base-foreground, #0a0a0a)' }}
              />
            </Button>
          </div>
        </div>

        {/* Change Password Section */}
        <ChangePasswordSection />

        {/* Language Selector - Hidden only in production */}
        {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
          <div className='flex flex-col gap-2'>
            <Label
              style={{
                color: 'var(--base-foreground, #0a0a0a)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                lineHeight: '100%',
              }}
            >
              Language
            </Label>
            <div className='flex flex-col gap-2'>
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
                  English (US)
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
                This is the language that will be used in the app.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {updateError && (
          <div
            className='px-4 py-2 rounded-lg'
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            }}
          >
            {updateError}
          </div>
        )}

        {/* Success Message */}
        {updateSuccess && (
          <div
            className='px-4 py-2 rounded-lg'
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              fontSize: '14px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            }}
          >
            Account updated successfully! Please sign out and sign in again to
            see the changes reflected in your profile.
          </div>
        )}

        <Button
          onClick={handleUpdateAccount}
          disabled={isUpdating}
          className='w-fit px-4 py-2 rounded-lg shadow-sm mt-4 mb-30'
          style={{
            backgroundColor: 'var(--base-primary, #fc5a29)',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            height: '36px',
            color: 'var(--base-primary-foreground, #fafafa)',
            fontSize: '14px',
            fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            lineHeight: '20px',
            opacity: isUpdating ? 0.7 : 1,
            cursor: isUpdating ? 'not-allowed' : 'pointer',
          }}
        >
          {isUpdating ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='w-4 h-4 animate-spin' />
              Updating...
            </div>
          ) : (
            'Update account'
          )}
        </Button>
      </div>
    </div>
  );
}
