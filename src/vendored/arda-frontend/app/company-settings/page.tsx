'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@frontend/components/ui/breadcrumb';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { Textarea } from '@frontend/components/ui/textarea';
import { Badge } from '@frontend/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@frontend/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@frontend/components/ui/avatar';
import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';
import {
  ChevronDown,
  Trash2,
  ImageUp,
  Send,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import { useAuth } from '@frontend/store/hooks/useAuth';
import type { TenantPayload, AgentForQueryRequest } from '@frontend/types/tenant';
import type {
  UserAccountQueryRequest,
  UserAccountResult,
} from '@frontend/types/user-account';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleValue: string;
  avatar: string | null;
  initials?: string;
  status: 'active' | 'invite-sent';
}

export default function CompanySettingsPage() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  const { handleAuthError } = useAuthErrorHandler();
  const { loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('company-info');
  const isStage = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'STAGE';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    legalName: '',
    country: '',
    taxId: '',
    registrationId: '',
    naicsCode: '',
  });
  const [logoError, setLogoError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState<TenantPayload | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    // Map specific users to their colors based on the design
    const userColorMap: Record<string, string> = {
      'Lucas Green': 'bg-pink-100 text-pink-700',
      'Liam Grant': 'bg-green-100 text-green-700',
      'Grace Hall': 'bg-purple-100 text-purple-700',
    };

    if (userColorMap[name]) {
      return userColorMap[name];
    }

    // Default color mapping for other users
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-yellow-100 text-yellow-700',
      'bg-indigo-100 text-indigo-700',
      'bg-pink-100 text-pink-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'logo') {
      setLogoError(false);
    }
  };

  const handleLogoDelete = () => {
    setFormData((prev) => ({ ...prev, logo: '' }));
    setLogoError(false);
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!url || url === '' || url === 'undefined') return false;
    try {
      const urlObj = new URL(url);
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        !url.includes('this.is.com') &&
        !url.includes('example.com') &&
        urlObj.hostname !== 'localhost'
      );
    } catch {
      return false;
    }
  };

  const isUploadedFile = (url: string): boolean => {
    return url.startsWith('data:') || url.includes('abrafersrl.com.ar');
  };

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!tenantId) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const jwtToken = localStorage.getItem('idToken');

        if (!jwtToken) {
          setError('No authentication token found. Please sign in.');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/arda/tenant/${tenantId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.ok && data.data?.payload) {
          const payload = data.data.payload;
          setTenantData(payload);
          setFormData({
            name: payload.company?.name || '',
            email: '',
            phone: '',
            address: '',
            logo: '',
            legalName: payload.company?.legalName || '',
            country: payload.company?.country || '',
            taxId: payload.company?.taxId || '',
            registrationId: payload.company?.registrationId || '',
            naicsCode: payload.company?.naicsCode || '',
          });
        } else {
          setError(data.error || 'Failed to load company data');
        }
      } catch (err) {
        if (handleAuthError(err)) {
          return;
        }
        setError(
          err instanceof Error ? err.message : 'Failed to load company data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantData();
  }, [tenantId, handleAuthError]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (authLoading || !tenantId) {
        return;
      }

      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        setIsLoadingUsers(false);
        setUsersError('No authentication token found. Please sign in.');
        return;
      }

      try {
        setIsLoadingUsers(true);
        setUsersError(null);

        const agentForRequestBody: AgentForQueryRequest = {
          filter: {
            eq: tenantId,
            locator: 'tenant_local',
          },
          paginate: {
            index: 0,
            size: 20,
          },
        };

        const agentForResponse = await fetch(
          '/api/arda/tenant/agent-for/query',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(agentForRequestBody),
          }
        );

        if (!agentForResponse.ok) {
          const errorData = await agentForResponse.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `HTTP error! status: ${agentForResponse.status}`;
          throw new Error(errorMessage);
        }

        const agentForData = await agentForResponse.json();

        if (
          !agentForData.ok ||
          !agentForData.data?.results ||
          agentForData.data.results.length === 0
        ) {
          setUsers([]);
          setIsLoadingUsers(false);
          return;
        }

        const visibleUserEIds = agentForData.data.results.map(
          (result: { payload: { userAccount: { local: string } } }) =>
            result.payload.userAccount.local
        );

        const userAccountRequestBody: UserAccountQueryRequest = {
          filter: {
            in: {
              locator: 'eId',
              values: visibleUserEIds,
            },
          },
          paginate: {
            index: 0,
            size: 10,
          },
        };

        const userAccountResponse = await fetch(
          '/api/arda/user-account/query',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(userAccountRequestBody),
          }
        );

        if (!userAccountResponse.ok) {
          const errorData = await userAccountResponse.json().catch(() => ({}));
          const errorMessage =
            errorData.error ||
            `HTTP error! status: ${userAccountResponse.status}`;
          throw new Error(errorMessage);
        }

        const userAccountData = await userAccountResponse.json();

        if (userAccountData.ok && userAccountData.data?.results) {
          const mappedUsers: User[] = userAccountData.data.results.map(
            (result: UserAccountResult) => {
              const identity = result.payload.identity;
              const fullName = [
                identity.firstName,
                identity.middleName,
                identity.lastName,
              ]
                .filter(Boolean)
                .join(' ');

              return {
                id: result.payload.eId,
                name: fullName || identity.email,
                email: identity.email,
                role: 'User',
                roleValue: 'User',
                avatar: null,
                status: 'active' as const,
              };
            }
          );
          setUsers(mappedUsers);
        } else {
          setUsersError(userAccountData.error || 'Failed to load users');
        }
      } catch (err) {
        const isAuthError = handleAuthError(err);
        if (isAuthError) {
          return;
        }
        setUsersError(
          err instanceof Error ? err.message : 'Failed to load users'
        );
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, tenantId]);

  const handleSave = async () => {
    if (!tenantId || !tenantData) {
      setError('No tenant data available to save');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const jwtToken = localStorage.getItem('idToken');

      if (!jwtToken) {
        setError('No authentication token found. Please sign in.');
        setIsSaving(false);
        return;
      }

      const payload = {
        eId: tenantData.eId,
        tenantName: tenantData.tenantName,
        company: {
          name: formData.name,
          legalName: formData.legalName,
          country: formData.country,
          taxId: formData.taxId,
          registrationId: formData.registrationId,
          naicsCode: formData.naicsCode,
        },
        plan: tenantData.plan || 'Personal',
        settings: tenantData.settings,
        subscriptionReference: tenantData.subscriptionReference,
      };

      const response = await fetch(`/api/arda/tenant/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.ok) {
        if (data.data?.payload) {
          const payload = data.data.payload;
          setTenantData(payload);
          setFormData({
            name: payload.company?.name || '',
            email: '',
            phone: '',
            address: '',
            logo: '',
            legalName: payload.company?.legalName || '',
            country: payload.company?.country || '',
            taxId: payload.company?.taxId || '',
            registrationId: payload.company?.registrationId || '',
            naicsCode: payload.company?.naicsCode || '',
          });
          setShowSuccessToast(true);
          setTimeout(() => {
            setShowSuccessToast(false);
          }, 5000);
        }
      } else {
        setError(data.error || 'Failed to save company data');
      }
    } catch (err) {
      if (handleAuthError(err)) {
        return;
      }
      setError(
        err instanceof Error ? err.message : 'Failed to save company data'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'company-info':
        return (
          <div className='w-full flex flex-col gap-8'>
            {isLoading && (
              <div className='text-sm text-muted-foreground'>Loading...</div>
            )}
            {error && (
              <div className='text-sm text-red-500'>Error: {error}</div>
            )}
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
                Company
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
                Company-wide defaults live here. One change, system-wide impact.
              </p>
            </div>

            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-2'>
                <Label
                  htmlFor='name'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: 500,
                    color: 'var(--base-foreground, #0a0a0a)',
                  }}
                >
                  Name
                </Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder='Company Name'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
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
                  This is the name that will be displayed throughout your Arda
                  app and in emails.
                </p>
              </div>

              {isStage && (
                <>
                  <div className='flex flex-col gap-2'>
                    <Label
                      htmlFor='email'
                      style={{
                        fontSize: '14px',
                        fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                        fontWeight: 500,
                        color: 'var(--base-foreground, #0a0a0a)',
                      }}
                    >
                      Email <span className='text-red-500'>*</span>
                    </Label>
                    <div className='relative'>
                      <Input
                        id='email'
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        placeholder='Email Address'
                        style={{
                          fontSize: '14px',
                          fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                          paddingRight: '40px',
                        }}
                      />
                      <button
                        type='button'
                        className='absolute inset-y-0 right-0 flex items-center px-3'
                        style={{
                          color: 'var(--base-foreground, #0a0a0a)',
                        }}
                      >
                        <ChevronDown className='w-4 h-4' />
                      </button>
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
                      This is the email used to send and receive order emails.
                    </p>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label
                      htmlFor='phone'
                      style={{
                        fontSize: '14px',
                        fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                        fontWeight: 500,
                        color: 'var(--base-foreground, #0a0a0a)',
                      }}
                    >
                      Phone <span className='text-red-500'>*</span>
                    </Label>
                    <div className='relative'>
                      <Input
                        id='phone'
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        placeholder='Phone Number'
                        style={{
                          fontSize: '14px',
                          fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                          paddingRight: '40px',
                        }}
                      />
                      <button
                        type='button'
                        className='absolute inset-y-0 right-0 flex items-center px-3'
                        style={{
                          color: 'var(--base-foreground, #0a0a0a)',
                        }}
                      >
                        <ChevronDown className='w-4 h-4' />
                      </button>
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
                      Phone number for order & receiving contact.
                    </p>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label
                      htmlFor='address'
                      style={{
                        fontSize: '14px',
                        fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                        fontWeight: 500,
                        color: 'var(--base-foreground, #0a0a0a)',
                      }}
                    >
                      Address <span className='text-red-500'>*</span>
                    </Label>
                    <Textarea
                      id='address'
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange('address', e.target.value)
                      }
                      placeholder='Address'
                      rows={3}
                      style={{
                        fontSize: '14px',
                        fontFamily: 'var(--font-geist, "Geist", sans-serif)',
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
                      The address for receiving orders
                    </p>
                  </div>
                </>
              )}

              <div className='flex flex-col gap-2'>
                <Label
                  htmlFor='legalName'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: 500,
                    color: 'var(--base-foreground, #0a0a0a)',
                  }}
                >
                  Legal Name
                </Label>
                <Input
                  id='legalName'
                  value={formData.legalName}
                  onChange={(e) =>
                    handleInputChange('legalName', e.target.value)
                  }
                  placeholder='Legal Name'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label
                  htmlFor='country'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: 500,
                    color: 'var(--base-foreground, #0a0a0a)',
                  }}
                >
                  Country
                </Label>
                <Input
                  id='country'
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder='Country'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label
                  htmlFor='taxId'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: 500,
                    color: 'var(--base-foreground, #0a0a0a)',
                  }}
                >
                  Tax ID
                </Label>
                <Input
                  id='taxId'
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder='Tax ID'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label
                  htmlFor='registrationId'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: 500,
                    color: 'var(--base-foreground, #0a0a0a)',
                  }}
                >
                  Registration ID
                </Label>
                <Input
                  id='registrationId'
                  value={formData.registrationId}
                  onChange={(e) =>
                    handleInputChange('registrationId', e.target.value)
                  }
                  placeholder='Registration ID'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label
                  htmlFor='naicsCode'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    fontWeight: 500,
                    color: 'var(--base-foreground, #0a0a0a)',
                  }}
                >
                  NAICS Code
                </Label>
                <Input
                  id='naicsCode'
                  value={formData.naicsCode}
                  onChange={(e) =>
                    handleInputChange('naicsCode', e.target.value)
                  }
                  placeholder='NAICS Code'
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                />
              </div>

              {isStage && (
                <div className='flex flex-col gap-2'>
                  <Label
                    style={{
                      fontSize: '14px',
                      fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                      fontWeight: 500,
                      color: 'var(--base-foreground, #0a0a0a)',
                    }}
                  >
                    Company logo (square){' '}
                    <span className='text-red-500'>*</span>
                  </Label>

                  {formData.logo &&
                    !logoError &&
                    isValidImageUrl(formData.logo) && (
                      <div className='relative w-32 h-32 rounded-lg border overflow-hidden mb-4'>
                        <div className='relative w-full h-full'>
                          {isUploadedFile(formData.logo) ? (
                            <Image
                              src={formData.logo}
                              alt='Company logo'
                              fill
                              className='object-cover'
                              onError={() => setLogoError(true)}
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={formData.logo}
                              alt='Company logo'
                              className='w-full h-full object-cover'
                              onError={() => setLogoError(true)}
                              onLoad={() => setLogoError(false)}
                            />
                          )}
                        </div>
                        <button
                          type='button'
                          onClick={handleLogoDelete}
                          className='absolute top-2 right-2 w-6 h-6 rounded bg-white border flex items-center justify-center hover:bg-gray-50 transition-colors'
                          style={{
                            borderColor: 'var(--base-border, #e5e5e5)',
                            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <Trash2
                            className='w-3 h-3'
                            style={{ color: '#0a0a0a' }}
                          />
                        </button>
                      </div>
                    )}

                  {formData.logo && logoError && (
                    <div className='relative w-32 h-32 rounded-lg border-2 border-red-300 bg-red-50 flex flex-col justify-center items-center gap-2 p-4 mb-4'>
                      <p className='text-xs text-red-600 font-medium text-center'>
                        Failed to load image
                      </p>
                      <p className='text-xs text-red-500 text-center'>
                        Please check the URL and try again
                      </p>
                      <button
                        type='button'
                        onClick={handleLogoDelete}
                        className='absolute top-2 right-2 w-6 h-6 rounded bg-white border flex items-center justify-center hover:bg-gray-50 transition-colors'
                        style={{
                          borderColor: 'var(--base-border, #e5e5e5)',
                          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <Trash2
                          className='w-3 h-3'
                          style={{ color: '#0a0a0a' }}
                        />
                      </button>
                    </div>
                  )}

                  <div className='w-full max-w-md bg-white border border-dashed border-[#737373] rounded-lg p-4'>
                    <div className='flex flex-col items-center justify-center gap-2 mb-4'>
                      <ImageUp className='w-14 h-14 text-[#737373]' />
                    </div>

                    <div className='my-4 text-center'>
                      <p className='text-sm text-[#737373]'>Enter image URL</p>
                    </div>

                    <div
                      className={`flex border rounded-lg overflow-hidden ${
                        logoError ? 'border-red-300' : 'border-[#E5E5E5]'
                      }`}
                    >
                      <div className='px-3 py-2 bg-[#F3F4F6] text-sm text-[#737373] border-r border-[#E5E5E5]'>
                        https://
                      </div>
                      <Input
                        placeholder='www.url/...'
                        value={
                          formData.logo.startsWith('data:') ? '' : formData.logo
                        }
                        onChange={(e) => {
                          let value = e.target.value;
                          if (
                            value &&
                            !value.startsWith('http://') &&
                            !value.startsWith('https://')
                          ) {
                            value = `https://${value}`;
                          }
                          handleInputChange('logo', value);
                        }}
                        className='flex-1 border-none rounded-none text-sm placeholder:text-[#737373] text-[#0A0A0A]'
                      />
                    </div>
                    {logoError && (
                      <p className='text-xs text-red-500 mt-1'>
                        Unable to load image from this URL
                      </p>
                    )}
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
                    This is the logo that will be displayed on your profile and
                    in emails.
                  </p>
                </div>
              )}

              <div className='pt-4 pb-8'>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !tenantId || !tenantData}
                  style={{
                    backgroundColor: 'var(--base-primary, #fc5a29)',
                    color: 'var(--base-primary-foreground, #fafafa)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    height: '36px',
                    padding: '8px 16px',
                    opacity: isSaving || !tenantId || !tenantData ? 0.6 : 1,
                    cursor:
                      isSaving || !tenantId || !tenantData
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save company'}
                </Button>
              </div>

              {showSuccessToast && (
                <div
                  className='fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]'
                  style={{
                    animation: 'slideIn 0.3s ease-out',
                  }}
                >
                  <div className='w-full max-w-[400px] relative shadow-[0px_4px_12px_-1px_rgba(0,0,0,0.1)] rounded-lg bg-white border border-[#e5e5e5] box-border flex flex-row items-center justify-start p-4 gap-6 text-left text-sm text-[#0a0a0a] font-geist'>
                    <div className='w-5 h-5 relative overflow-hidden flex-shrink-0'>
                      <div className='absolute h-[80%] w-full top-[10%] right-[10%] bottom-[10%] left-[10%] max-w-full overflow-hidden max-h-full bg-black rounded-full flex items-center justify-center'>
                        <Check className='w-3 h-3 text-white' />
                      </div>
                    </div>

                    <div className='flex-1 flex flex-col items-start justify-start gap-0.5'>
                      <div className='self-stretch relative leading-5 font-medium'>
                        Update company success
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'users':
        return (
          <div className='w-full flex flex-col gap-8'>
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
                Users
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
                Manage who&apos;s on your team and what they can do. Add users,
                update roles, and keep your crew aligned.
              </p>
            </div>

            {/* Invite User Section */}
            {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
              <div className='flex gap-2'>
                <Input
                  type='email'
                  placeholder='Email'
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                  }}
                  className='flex-1'
                />
                <Button
                  onClick={() => {
                    // TODO: Implement invite functionality
                    if (inviteEmail.trim()) {
                      setInviteEmail('');
                    }
                  }}
                  className='relative flex items-center'
                  style={{
                    backgroundColor: 'var(--base-primary, #fc5a29)',
                    color: 'var(--base-primary-foreground, #fafafa)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                    height: '36px',
                    padding: '8px 16px',
                  }}
                >
                  <div className='relative mr-2'>
                    <Send className='w-4 h-4' />
                    <div
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        border: '1px solid #fff',
                      }}
                    />
                  </div>
                  Send invite
                </Button>
              </div>
            )}

            {/* Loading and Error States */}
            {isLoadingUsers && (
              <div className='text-sm text-muted-foreground'>
                Loading users...
              </div>
            )}
            {usersError && (
              <div className='text-sm text-red-500'>Error: {usersError}</div>
            )}

            {/* Users List */}
            <div className='flex flex-col gap-3 pb-8'>
              {users.length === 0 && !isLoadingUsers && !usersError && (
                <div className='text-sm text-muted-foreground'>
                  No users found.
                </div>
              )}
              {users.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center gap-4 p-4 rounded-lg border bg-white'
                  style={{
                    borderColor: 'var(--base-border, #e5e5e5)',
                    boxShadow:
                      '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {/* Avatar */}
                  <Avatar className='w-10 h-10'>
                    <AvatarFallback
                      className={`${getAvatarColor(
                        user.name
                      )} text-sm font-medium`}
                    >
                      {user.initials || getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className='flex-1 flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span
                        className='font-semibold'
                        style={{
                          fontSize: '14px',
                          fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                          color: 'var(--base-foreground, #0a0a0a)',
                        }}
                      >
                        {user.name}
                      </span>
                      {user.role === 'Admin' ? (
                        <Badge
                          style={{
                            backgroundColor: 'var(--base-primary, #fc5a29)',
                            color: 'var(--base-primary-foreground, #fafafa)',
                            fontSize: '12px',
                            fontFamily:
                              'var(--font-geist, "Geist", sans-serif)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: 'none',
                          }}
                        >
                          {user.role}
                        </Badge>
                      ) : (
                        <span
                          className='text-sm'
                          style={{
                            color: 'var(--base-muted-foreground, #737373)',
                            fontSize: '14px',
                            fontFamily:
                              'var(--font-geist, "Geist", sans-serif)',
                          }}
                        >
                          {user.role}
                        </span>
                      )}
                      {user.status === 'invite-sent' && (
                        <Badge
                          variant='outline'
                          style={{
                            fontSize: '12px',
                            fontFamily:
                              'var(--font-geist, "Geist", sans-serif)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#f5f5f5',
                            color: '#737373',
                            borderColor: '#e5e5e5',
                          }}
                        >
                          Invite sent
                        </Badge>
                      )}
                    </div>
                    <span
                      className='text-sm'
                      style={{
                        color: 'var(--base-muted-foreground, #737373)',
                        fontSize: '14px',
                        fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                      }}
                    >
                      {user.email}
                    </span>
                  </div>

                  {/* Actions Menu */}
                  {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-md relative'
                          style={{
                            color: 'var(--base-foreground, #0a0a0a)',
                            border: '1px solid var(--base-border, #e5e5e5)',
                            borderRadius: '6px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef7f5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div className='relative'>
                            <MoreHorizontal className='w-4 h-4' />
                            <div
                              style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#ef4444',
                                borderRadius: '50%',
                                border: '1px solid #fff',
                              }}
                            />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      {isStage && (
                        <>
                          <DropdownMenuItem
                            className='cursor-pointer'
                            style={{
                              fontSize: '14px',
                              fontFamily:
                                'var(--font-geist, "Geist", sans-serif)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef7f5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'transparent';
                            }}
                          >
                            Resend invitation
                            <span className='text-red-500'>*</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='cursor-pointer'
                            style={{
                              fontSize: '14px',
                              fontFamily:
                                'var(--font-geist, "Geist", sans-serif)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef7f5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'transparent';
                            }}
                          >
                            Revoke invitation
                            <span className='text-red-500'>*</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger
                          className='cursor-pointer'
                          style={{
                            fontSize: '14px',
                            fontFamily:
                              'var(--font-geist, "Geist", sans-serif)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef7f5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                          }}
                        >
                          Role
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup
                            value={user.roleValue || 'User'}
                          >
                            <DropdownMenuRadioItem
                              value='User'
                              className='cursor-pointer'
                              style={{
                                fontSize: '14px',
                                fontFamily:
                                  'var(--font-geist, "Geist", sans-serif)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  '#fef7f5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  'transparent';
                              }}
                            >
                              User
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value='Area Admin'
                              className='cursor-pointer'
                              style={{
                                fontSize: '14px',
                                fontFamily:
                                  'var(--font-geist, "Geist", sans-serif)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  '#fef7f5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  'transparent';
                              }}
                            >
                              Area Admin
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value='System Admin'
                              className='cursor-pointer'
                              style={{
                                fontSize: '14px',
                                fontFamily:
                                  'var(--font-geist, "Geist", sans-serif)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  '#fef7f5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  'transparent';
                              }}
                            >
                              System Admin
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value='Owner'
                              className='cursor-pointer'
                              style={{
                                fontSize: '14px',
                                fontFamily:
                                  'var(--font-geist, "Geist", sans-serif)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  '#fef7f5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  'transparent';
                              }}
                            >
                              Owner
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      {isStage && (
                        <DropdownMenuItem
                          className='cursor-pointer'
                          style={{
                            fontSize: '14px',
                            fontFamily:
                              'var(--font-geist, "Geist", sans-serif)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef7f5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                          }}
                        >
                          Remove user <span className='text-red-500'>*</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'subscription':
        return <div>Subscription section - Coming soon</div>;
      case 'billing':
        return <div>Billing section - Coming soon</div>;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />

        <div className='w-full flex flex-col gap-6 pt-20 md:pt-24'>
          <div className='px-4 pt-4 pb-2 md:px-8 md:pt-6'>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/'>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href='/settings'>Settings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href='/settings?section=companies'>
                    Companies
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Company Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className='flex w-full items-center justify-between pb-6 md:py-2 pb-4 border-b'>
            <div className='px-10 pb-6 md:px-8'>
              <h2 className='text-3xl font-bold text-[#0A0A0A]'>
                Company Settings
              </h2>
              <p className='text-muted-foreground text-sm'>
                This is the control room for the company. Manage roles,
                permissions, and how your whole team runs Arda.
              </p>
            </div>
          </div>

          <div className='flex gap-8 px-10 md:px-8'>
            <div className='w-48 space-y-1'>
              <button
                onClick={() => setActiveSection('company-info')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === 'company-info'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Company info
              </button>
              <button
                onClick={() => setActiveSection('users')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === 'users'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveSection('subscription')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === 'subscription'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Subscription
              </button>
              <button
                onClick={() => setActiveSection('billing')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === 'billing'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Billing
              </button>
            </div>

            <div className='flex-1 max-w-2xl'>{renderContent()}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
