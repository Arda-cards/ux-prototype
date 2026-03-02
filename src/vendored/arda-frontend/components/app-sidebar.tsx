'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  ShoppingCart,
  Table2,
  PackageOpen,
  ChevronsUpDown,
  Menu,
  X,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  useSidebar,
} from '@frontend/components/ui/sidebar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@frontend/components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '@frontend/components/ui/avatar';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useJWT } from '@frontend/store/hooks/useJWT';
import { useRouter, usePathname } from 'next/navigation';
import { useIsMobile } from '@frontend/hooks/use-mobile';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import { useSidebarVisibility } from '@frontend/store/hooks/useSidebarVisibility';
import { attemptNavigate } from '@frontend/lib/unsavedNavigation';

export const mainMenuItems = [
  {
    id: 'dashboard' as const,
    label: 'Dashboard',
    icon: LayoutDashboard,
    url: '/dashboard',
    children: [],
  },
  {
    id: 'items' as const,
    label: 'Items',
    icon: Table2,
    url: '/items',
    children: [],
  },
  {
    id: 'orderQueue' as const,
    label: 'Order Queue',
    icon: ShoppingCart,
    url: '/order-queue',
    children: [],
  },
  {
    id: 'receiving' as const,
    label: 'Receiving',
    icon: PackageOpen,
    url: '/receiving',
    children: [],
  },
];

export function AppSidebar({ menuItems }: { menuItems?: typeof mainMenuItems } = {}) {
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { user } = useAuth();
  const { userContext } = useJWT();
  const displayName = userContext?.name || user?.name || 'There';

  // Get order queue counts
  const { readyToOrderCount } = useOrderQueue();

  // Get sidebar visibility state
  const { visibility } = useSidebarVisibility();

  // Filter menu items based on visibility and production environment.
  // When custom menuItems are provided, skip the Redux visibility filter.
  const itemsSource = menuItems ?? mainMenuItems;
  const visibleMenuItems = menuItems
    ? itemsSource
    : itemsSource.filter((item) => {
        if (
          process.env.NEXT_PUBLIC_DEPLOY_ENV === 'PRODUCTION' &&
          item.id === 'dashboard'
        ) {
          return false;
        }
        return visibility[item.id];
      });

  // Function to check if a menu item is active based on current pathname
  const isMenuItemActive = (itemUrl: string) => {
    const isActive =
      pathname === itemUrl || (itemUrl === '/dashboard' && pathname === '/');
    return isActive;
  };

  const getAvatarFallback = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(' ');
    return words.length === 1
      ? words[0][0].toUpperCase()
      : (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const toggleOpen = (label: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const doNavigate = (url: string) => {
    if (attemptNavigate(url)) return;
    router.push(url);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Hard navigation ensures a full page reload, which cleanly resets all
      // React state and avoids race conditions between batched setState (user→null)
      // and client-side router transitions that may still see stale context.
      window.location.href = '/signin';
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleNavigation = (url: string) => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
    doNavigate(url);
  };

  // Mobile sidebar component
  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <button
          className='fixed top-4 left-4 z-50 p-2 bg-background border rounded-md shadow-sm md:hidden'
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className='h-5 w-5' />
          ) : (
            <Menu className='h-5 w-5' />
          )}
        </button>

        {/* Mobile sidebar */}
        {isMobileOpen && (
          <div
            className='fixed left-0 top-0 h-full w-64 bg-background border-r z-40 md:hidden'
            style={{
              background: 'rgba(42, 42, 42, 0.8)',
            }}
          >
            <div className='relative h-full overflow-hidden'>
              {/* Background solid layer - using dark primary color */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'var(--base-primary-dark, #000000)',
                  zIndex: 0,
                }}
              />

              {/* Diagonal gradient overlay - using dark primary color */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: -600,
                  width: 613,
                  height: 1025,
                  background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, var(--base-primary-dark, rgba(0, 0, 0, 0.20)) 68%)',
                  transform: 'skewX(-35deg)',
                  transformOrigin: 'top right',
                  zIndex: 1,
                }}
              />

              {/* Header */}
              <div className='relative z-10 p-4 border-b'>
                <div className='flex items-center justify-center'>
                  <Image
                    src='/images/ArdaLogoBlack.svg'
                    alt='Arda'
                    width={200}
                    height={30}
                  />
                </div>
              </div>

              {/* Content */}
              <div className='relative z-10 flex-1 overflow-y-auto p-4'>
                <SidebarGroup>
                  <SidebarMenu>
                    {visibleMenuItems.map((item) => (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          id={
                            item.label === 'Order Queue'
                              ? 'order-queue-target'
                              : undefined
                          }
                          onClick={() => {
                            if (item.label === 'Items')
                              handleNavigation('/items');
                            else if (item.label === 'Dashboard')
                              handleNavigation('/dashboard');
                            else if (item.label === 'Order Queue')
                              handleNavigation('/order-queue');
                            else if (item.label === 'Receiving')
                              handleNavigation('/receiving');
                            else toggleOpen(item.label);
                          }}
                          className='justify-between sidebar-menu-button-hover'
                          isActive={(() => {
                            const active = isMenuItemActive(item.url);

                            return active;
                          })()}
                        >
                          <div className='flex items-center gap-2'>
                            <item.icon className='h-4 w-4 shrink-0 text-white sidebar-icon' />
                            <span className='text-white sidebar-text'>
                              {item.label}
                            </span>
                            {item.label === 'Order Queue' &&
                              readyToOrderCount > 0 && (
                                <div className='ml-auto bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                                  {readyToOrderCount}
                                </div>
                              )}
                          </div>
                          {item.children.length > 0 && (
                            <ChevronsUpDown className='h-4 w-4' />
                          )}
                        </SidebarMenuButton>
                        {item.children.length > 0 && openItems[item.label] && (
                          <SidebarMenuSub>
                            {item.children.map((sub, index) => (
                              <li key={index}>
                                <SidebarMenuSubButton>
                                  {sub}
                                </SidebarMenuSubButton>
                              </li>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              </div>

              {/* Account Section */}
              <div className='relative z-10 p-4'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div data-testid="sidebar-user-menu" className='flex items-center gap-2 p-2 rounded-md transition-all duration-200 w-full cursor-pointer group'>
                      <Avatar className='h-12 w-12'>
                        <AvatarImage
                          src='/images/SidebarFooter.svg'
                          alt='Avatar'
                        />
                        <AvatarFallback>
                          {getAvatarFallback(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col text-left text-xs'>
                        <span
                          className='font-medium transition-colors duration-200'
                          style={{
                            color: 'var(--base-foreground-dark, #fafafa)',
                            fontSize: '14px',
                            fontFamily: 'Geist',
                            fontWeight: '600',
                            lineHeight: '14px',
                          }}
                        >
                          {displayName}
                        </span>
                        <span
                          className='transition-colors duration-200'
                          style={{
                            color: 'var(--base-foreground-dark, #fafafa)',
                            fontSize: '12px',
                            fontFamily: 'Geist',
                            fontWeight: '400',
                            lineHeight: '12px',
                          }}
                        >
                          Account Admin
                        </span>
                      </div>
                      <ChevronsUpDown
                        className='ml-auto h-4 w-4 transition-colors duration-200'
                        style={{
                          color: 'var(--base-foreground-dark, #fafafa)',
                        }}
                      />
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className='w-56'>
                    <DropdownMenuLabel>
                      <div className='flex items-center gap-3 px-1 py-1'>
                        <Avatar className='h-12 w-12'>
                          <AvatarImage
                            src='/images/SidebarFooter.svg'
                            alt='Avatar'
                          />
                          <AvatarFallback>
                            {getAvatarFallback(displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-semibold text-sm'>
                            {displayName}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            Account Admin
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => handleNavigation('/settings')}
                    >
                      Settings
                    </DropdownMenuItem>

                    {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
                      <DropdownMenuItem
                        onClick={() => handleNavigation('/company-settings')}
                      >
                        Admin
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar (existing code)
  return (
    <Sidebar
      collapsible='icon'
      className='relative overflow-hidden border-r h-screen fixed left-0 top-0 z-40'
      style={{ color: 'var(--base-foreground-dark, #fafafa)' }}
    >
      {/* Background solid layer - using dark primary color */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'var(--base-primary-dark, #000000)',
          zIndex: 0,
        }}
      />

      {/* Diagonal gradient overlay - using dark primary color */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: -600,
          width: 613,
          height: 1025,
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, var(--base-primary-dark, rgba(0, 0, 0, 0.20)) 100%)',
          transform: 'skewX(-30deg)',
          transformOrigin: 'top right',
          zIndex: 1,
        }}
      />

      <SidebarHeader
        className={`${
          state === 'collapsed' ? 'px-0 pt-3' : 'px-0 pt-4'
        } relative z-10`}
      >
        {state === 'collapsed' ? (
          <Image
            src='/images/ArdaLogoBlackMobile.svg'
            alt='Arda Icon'
            width={32}
            height={32}
            className='mx-auto'
          />
        ) : (
          <Image
            src='/images/ArdaLogoBlack.svg'
            alt='Arda'
            width={300}
            height={40}
            className='mx-auto'
          />
        )}
      </SidebarHeader>

      <SidebarContent className='relative z-10 flex-1 overflow-y-auto'>
        <SidebarGroup>
          <SidebarMenu>
            {visibleMenuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  id={
                    item.label === 'Order Queue'
                      ? 'order-queue-target'
                      : undefined
                  }
                  onClick={() => {
                    if (item.label === 'Items') doNavigate('/items');
                    else if (item.label === 'Dashboard')
                      doNavigate('/dashboard');
                    else if (item.label === 'Order Queue')
                      doNavigate('/order-queue');
                    else if (item.label === 'Receiving')
                      doNavigate('/receiving');
                    else toggleOpen(item.label);
                  }}
                  tooltip={undefined}
                  className={`${
                    state === 'collapsed' ? 'justify-center' : 'justify-between'
                  } sidebar-menu-button-hover`}
                  isActive={(() => {
                    const active = isMenuItemActive(item.url);

                    return active;
                  })()}
                >
                  <div className='flex items-center gap-2'>
                    <item.icon className='h-4 w-4 shrink-0 text-white sidebar-icon' />
                    {state !== 'collapsed' && (
                      <>
                        <span className='text-white sidebar-text'>
                          {item.label}
                        </span>
                        {item.label === 'Order Queue' &&
                          readyToOrderCount > 0 && (
                            <div className='ml-auto bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                              {readyToOrderCount}
                            </div>
                          )}
                      </>
                    )}
                  </div>
                  {item.children.length > 0 && state !== 'collapsed' && (
                    <ChevronsUpDown className='h-4 w-4' />
                  )}
                </SidebarMenuButton>
                {item.children.length > 0 && openItems[item.label] && (
                  <SidebarMenuSub>
                    {item.children.map((sub, index) => (
                      <li key={index}>
                        <SidebarMenuSubButton>{sub}</SidebarMenuSubButton>
                      </li>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='relative z-10 mt-auto'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              data-testid="sidebar-user-menu"
              className={`flex items-center ${
                state === 'collapsed' ? 'justify-center' : 'justify-start'
              } gap-2 p-2 rounded-md transition-all duration-200 w-full cursor-pointer group`}
            >
              <Avatar className='h-12 w-12'>
                <AvatarImage src='/images/SidebarFooter.svg' alt='Avatar' />
                <AvatarFallback>
                  {getAvatarFallback(displayName)}
                </AvatarFallback>
              </Avatar>
              {state !== 'collapsed' && (
                <>
                  <div className='flex flex-col text-left text-xs'>
                    <span
                      className='font-medium group-hover:text-gray-500 transition-colors duration-200'
                      style={{
                        color: 'var(--base-foreground-dark, #fafafa)',
                        fontSize: '14px',
                        fontFamily: 'Geist',
                        fontWeight: '600',
                        lineHeight: '14px',
                      }}
                    >
                      {displayName}
                    </span>
                    <span
                      className='group-hover:text-gray-500 transition-colors duration-200'
                      style={{
                        color: 'var(--base-foreground-dark, #fafafa)',
                        fontSize: '12px',
                        fontFamily: 'Geist',
                        fontWeight: '400',
                        lineHeight: '12px',
                      }}
                    >
                      Account Admin
                    </span>
                  </div>
                  <ChevronsUpDown
                    className='ml-auto h-4 w-4 group-hover:text-gray-500 transition-colors duration-200'
                    style={{ color: 'var(--base-foreground-dark, #fafafa)' }}
                  />
                </>
              )}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className='w-56'>
            <DropdownMenuLabel>
              <div className='flex items-center gap-3 px-1 py-1'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage src='/images/SidebarFooter.svg' alt='Avatar' />
                  <AvatarFallback>
                    {getAvatarFallback(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='font-semibold text-sm'>{displayName}</span>
                  <span className='text-muted-foreground text-xs'>
                    Account Admin
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => doNavigate('/settings')}>
              Settings
            </DropdownMenuItem>

            {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
              <DropdownMenuItem
                onClick={() => doNavigate('/company-settings')}
              >
                Admin
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
