'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@frontend/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@frontend/components/ui/dropdown-menu';
import { Factory, X, MoreHorizontal, Plus } from 'lucide-react';
import type {
  TenantQueryRequest,
  TenantResult,
  AgentForQueryRequest,
} from '@frontend/types/tenant';
import type { UserAccountQueryRequest } from '@frontend/types/user-account';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { decodeJWTPayload } from '@frontend/lib/jwt';

interface Company {
  eId: string;
  name: string;
  tenantName: string;
}

export function CompaniesSection() {
  const router = useRouter();
  const { handleAuthError } = useAuthErrorHandler();
  const { loading: authLoading } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredButtons, setHoveredButtons] = useState<{
    [key: number]: { leave: boolean; ellipsis: boolean };
  }>({});

  useEffect(() => {
    const fetchTenants = async () => {
      if (authLoading) {
        return;
      }

      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        setIsLoading(false);
        setError('No authentication token found. Please sign in.');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const payload = decodeJWTPayload(jwtToken);
        if (!payload || !payload.sub) {
          throw new Error('Failed to decode JWT token');
        }

        const oidcSub = payload.sub;

        const userAccountRequestBody: UserAccountQueryRequest = {
          filter: {
            eq: oidcSub,
            locator: 'oidc_sub',
          },
          paginate: {
            index: 0,
            size: 1,
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

        if (
          !userAccountData.ok ||
          !userAccountData.data?.results ||
          userAccountData.data.results.length === 0
        ) {
          throw new Error('Legacy account information to be filled');
        }

        const userAccountLocal = userAccountData.data.results[0].payload.eId;

        const agentForRequestBody: AgentForQueryRequest = {
          filter: {
            eq: userAccountLocal,
            locator: 'user_account_local',
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
          setCompanies([]);
          setIsLoading(false);
          return;
        }

        const visibleTenantsEIds = agentForData.data.results.map(
          (result: { payload: { tenant: { local: string } } }) =>
            result.payload.tenant.local
        );

        const tenantQueryRequestBody: TenantQueryRequest = {
          filter: {
            in: {
              locator: 'eId',
              values: visibleTenantsEIds,
            },
          },
          paginate: {
            index: 0,
            size: 10,
          },
        };

        const tenantResponse = await fetch('/api/arda/tenant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(tenantQueryRequestBody),
        });

        if (!tenantResponse.ok) {
          const errorData = await tenantResponse.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `HTTP error! status: ${tenantResponse.status}`;
          throw new Error(errorMessage);
        }

        const tenantData = await tenantResponse.json();

        if (tenantData.ok && tenantData.data?.results) {
          const mappedCompanies: Company[] = tenantData.data.results.map(
            (result: TenantResult) => ({
              eId: result.payload.eId,
              name: result.payload.company.name,
              tenantName: result.payload.tenantName,
            })
          );
          setCompanies(mappedCompanies);
        } else {
          setError(tenantData.error || 'Failed to load companies');
        }
      } catch (err) {
        const isAuthError = handleAuthError(err);
        if (isAuthError) {
          return;
        }
        setError(
          err instanceof Error ? err.message : 'Failed to load companies'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, [authLoading, handleAuthError]);

  const handleButtonHover = (
    companyIndex: number,
    buttonType: 'leave' | 'ellipsis',
    isHovering: boolean
  ) => {
    setHoveredButtons((prev) => ({
      ...prev,
      [companyIndex]: {
        ...prev[companyIndex],
        [buttonType]: isHovering,
      },
    }));
  };

  return (
    <div className='w-full flex flex-col gap-6'>
      {/* Header Section */}
      <div
        className='flex items-start gap-[10px]'
        style={{
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          className='flex flex-col'
          style={{
            flex: 1,
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              alignSelf: 'stretch',
              position: 'relative',
              lineHeight: '28px',
              color: 'var(--base-foreground, #0a0a0a)',
              fontSize: '18px',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            }}
          >
            Companies
          </h3>
          <p
            style={{
              alignSelf: 'stretch',
              position: 'relative',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'var(--base-muted-foreground, #737373)',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
            }}
          >
            Your Arda universe: companies you&apos;re part of.
          </p>
        </div>
        {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
          <Button
            variant='outline'
            type='button'
            className='flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer relative'
            style={{
              height: '36px',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              backgroundColor: isHovered ? '#fef7f5' : '#fff',
              border: '1px solid #e5e5e5',
              boxSizing: 'border-box',
              padding: '8px 16px',
              gap: '8px',
              fontSize: '14px',
              color: 'var(--base-foreground, #0a0a0a)',
              fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              lineHeight: '20px',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push('/company-settings');
            }}
          >
            <div className='relative'>
              <Plus
                className='w-4 h-4'
                style={{ width: '16px', position: 'relative' }}
              />
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
            <span style={{ position: 'relative', lineHeight: '20px' }}>
              Add Company
            </span>
          </Button>
        )}
      </div>

      {/* Separator */}
      <div
        className='w-full h-px'
        style={{
          borderTop: '1px solid var(--base-border, #e5e5e5)',
        }}
      />

      {/* Companies List */}
      <div className='flex flex-col gap-3'>
        {isLoading && (
          <div className='text-center py-8 text-sm text-muted-foreground'>
            Loading companies...
          </div>
        )}
        {error && (
          <div className='text-center py-8 text-sm text-destructive'>
            {error}
          </div>
        )}
        {!isLoading && !error && companies.length === 0 && (
          <div className='text-center py-8 text-sm text-muted-foreground'>
            No companies found
          </div>
        )}
        {!isLoading &&
          !error &&
          companies.map((company, index) => (
            <div
              key={company.eId || index}
              style={{
                width: '100%',
                height: '62px',
                position: 'relative',
                boxShadow:
                  '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                borderRadius: '14px',
                backgroundColor: '#fff',
                border: '1px solid #e5e5e5',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '8px 24px',
                fontSize: '14px',
                color: '#0a0a0a',
                fontFamily: 'var(--font-geist, "Geist", sans-serif)',
              }}
            >
              <div
                style={{
                  alignSelf: 'stretch',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '28px',
                }}
              >
                <Factory
                  className='w-4 h-4 flex-shrink-0'
                  style={{
                    width: '16px',
                    position: 'relative',
                    color: '#0a0a0a',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0px',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        onClick={() => {
                          // TODO: Implement view company functionality
                        }}
                        style={{
                          position: 'relative',
                          lineHeight: '20px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#0a0a0a',
                          fontSize: '14px',
                          fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                        }}
                      >
                        {company.name}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Button
                      variant='outline'
                      className='flex items-center justify-center transition-colors'
                      style={{
                        height: '36px',
                        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                        borderRadius: '8px',
                        backgroundColor: hoveredButtons[index]?.leave
                          ? '#fef7f5'
                          : '#fff',
                        border: '1px solid #e5e5e5',
                        boxSizing: 'border-box',
                        padding: '8px 16px',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#0a0a0a',
                        fontFamily: 'var(--font-geist, "Geist", sans-serif)',
                        lineHeight: '20px',
                      }}
                      onMouseEnter={() =>
                        handleButtonHover(index, 'leave', true)
                      }
                      onMouseLeave={() =>
                        handleButtonHover(index, 'leave', false)
                      }
                    >
                      <X
                        className='w-4 h-4'
                        style={{ width: '16px', position: 'relative' }}
                      />
                      <span
                        style={{ position: 'relative', lineHeight: '20px' }}
                      >
                        Leave
                      </span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='outline'
                          className='flex items-center justify-center transition-colors'
                          style={{
                            height: '36px',
                            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                            borderRadius: '8px',
                            backgroundColor: hoveredButtons[index]?.ellipsis
                              ? '#fef7f5'
                              : '#fff',
                            border: '1px solid #e5e5e5',
                            boxSizing: 'border-box',
                            padding: '8px 10px',
                            fontSize: '14px',
                            color: '#0a0a0a',
                            fontFamily:
                              'var(--font-geist, "Geist", sans-serif)',
                          }}
                          onMouseEnter={() =>
                            handleButtonHover(index, 'ellipsis', true)
                          }
                          onMouseLeave={() =>
                            handleButtonHover(index, 'ellipsis', false)
                          }
                        >
                          <MoreHorizontal
                            className='w-4 h-4'
                            style={{
                              width: '16px',
                              position: 'relative',
                              color: '#0a0a0a',
                            }}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-48'>
                        <DropdownMenuItem
                          className='cursor-pointer transition-colors'
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
                          Switch to this company
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='cursor-pointer transition-colors'
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
                          onClick={() => {
                            router.push(
                              `/company-settings?tenantId=${company.eId}`
                            );
                          }}
                        >
                          Manage company
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
