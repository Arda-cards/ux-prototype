import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';

import { SidebarInset, SidebarProvider } from '@frontend/components/ui/sidebar';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';
import Image from 'next/image';
import {
  Dock,
  FileText,
  ShoppingCart,
  PackageOpen,
  Bell,
  TrendingUp,
  X,
  Building,
  UserRound,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import { Card } from '@frontend/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@frontend/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@frontend/components/ui/dropdown-menu';
import { Separator } from '@frontend/components/ui/separator';
import { useIsMobile } from '@frontend/hooks/use-mobile';
import HubSpotPostsPanel from '@frontend/components/homepage/HubSpotPosts';

export function DashboardContent() {
  const { user } = useAuth();
  const { readyToOrderCount } = useOrderQueue();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastShown = useRef(false);
  const isMobile = useIsMobile();

  // State for time filter selection
  const [timeFilter, setTimeFilter] = useState<'Week' | 'Month' | 'Year'>(
    'Week'
  );

  // REMOVED: Competing redirect logic - AuthGuard and useAuthValidation now handle all redirects
  // This prevents the "flashing screens" issue caused by multiple redirects

  useEffect(() => {
    if (searchParams.get('justSignedIn') === 'true' && !toastShown.current) {
      toastShown.current = true;
      toast.success('Sign in successful', {
        description: 'Welcome to Arda Systems',
        duration: 4000,
        icon: null,
      });
      const params = new URLSearchParams(window.location.search);
      params.delete('justSignedIn');
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '');
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const displayName = user?.name || 'There';

  // Mock data for orders
  const orders = [
    {
      item: '#4 x 3/8" Stainless Steel...',
      supplier: 'Stephanie Sharkey',
      status: 'Pending',
      date: 'Feb 24, 2025 1:31 pm',
      amount: '$80.04',
    },
    {
      item: '1" Raw Aluminum Stock',
      supplier: 'Joshua Jones',
      status: 'Received',
      date: 'Mar 3, 2025 4:31 pm',
      amount: '$65.31',
    },
    {
      item: '#4 x 1/2" Stainless Steel...',
      supplier: 'Rhonda Rhodes',
      status: 'Pending',
      date: 'Mar 5, 2025 7:08 am',
      amount: '$17.34',
    },
    {
      item: 'M8 x 1 - 50',
      supplier: 'James Hall',
      status: 'Pending',
      date: 'Feb 14, 2025 3:05 am',
      amount: '$158.44',
    },
    {
      item: '#8 x 3/8" Stainless Steel...',
      supplier: 'Corina McCoy',
      status: 'Received',
      date: 'Feb 12, 2025 11:37 am',
      amount: '$20.35',
    },
  ];

  const totalAmount = orders.reduce((sum, order) => {
    return sum + parseFloat(order.amount.replace('$', ''));
  }, 0);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        {/* Main Content Container */}
        <div className='w-full pt-20 px-4 pb-4 md:pt-24 md:pb-8 flex flex-col gap-6 lg:gap-8'>
          {/* Breadcrumb Navigation
          <div className='w-full border-b border-border pb-2'>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/dashboard'>Manage</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
 */}
          {/* Main Content */}
          <div className='w-full flex flex-col lg:flex-row gap-6 lg:gap-8'>
            {/* Left Column - Welcome Section + Summary Cards */}
            <div className='w-full lg:flex-1 flex flex-col gap-6'>
              {/* Welcome Section */}
              <section className='w-full'>
                <div className='w-full p-8 bg-card shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-[10px] border border-border flex flex-col gap-4'>
                  {/* Text Content */}
                  <div className='flex flex-col gap-4 pt-2.5'>
                    <div className='flex items-center gap-2'>
                      <h1 className='text-[30px] font-bold leading-[30px] text-foreground font-geist'>
                        Hiya, {displayName}.
                      </h1>
                    </div>
                    <div className='flex flex-col justify-end'>
                      <p className='text-[14px] text-muted-foreground leading-[20px] font-normal font-geist'>
                        Jump in — add an item, browse tips, or drop in your
                        inventory list.
                      </p>
                    </div>
                  </div>

                  {/* Action Icons Section */}
                  <div className='flex justify-center items-center gap-4'>
                    {/* Manage Items */}
                    <div
                      className='flex-1 bg-card overflow-hidden rounded-[10px] flex flex-col justify-center items-center gap-2 cursor-pointer transition-colors'
                      onClick={() => router.push('/items')}
                    >
                      <div className='relative w-24 h-24 p-3 flex items-center justify-center'>
                        {/* Background shape using Puddle1.svg */}
                        <Image
                          src='/images/Puddle1.svg'
                          alt='Manage items background'
                          width={90}
                          height={80}
                          className='absolute inset-0 object-contain'
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                        {/* Icon container with exact positioning */}
                        <div className='relative flex items-center justify-center z-10'>
                          <Dock className='w-12 h-12 text-foreground' />
                        </div>
                      </div>
                      <div className='text-center text-[14px] font-medium leading-[20px] text-foreground'>
                        Manage items
                      </div>
                    </div>

                    {/* Reorder Items */}
                    <div
                      className='flex-1 bg-card overflow-hidden rounded-[10px] flex flex-col justify-center items-center gap-2 relative cursor-pointer  transition-colors'
                      onClick={() => router.push('/order-queue')}
                    >
                      <div className='relative w-24 h-24 p-3 flex items-center justify-center'>
                        {/* Background shape using Puddle2.svg */}
                        <Image
                          src='/images/Puddle2.svg'
                          alt='Reorder items background'
                          width={90}
                          height={80}
                          className='absolute inset-0 object-contain'
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                        <div className='relative flex items-center justify-center z-10'>
                          <ShoppingCart className='w-12 h-12 text-foreground' />
                        </div>
                        {/* Badge - same as sidebar */}
                        {readyToOrderCount > 0 && (
                          <div className='absolute top-0 right-0 min-w-5 px-1.5 py-1 bg-orange-500 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-full flex justify-center items-center z-20'>
                            <span className='text-[10px] font-semibold leading-3 text-white'>
                              {readyToOrderCount}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className='text-center text-[14px] font-medium leading-[20px] text-foreground'>
                        Reorder items
                      </div>
                    </div>

                    {/* Receive Items */}
                    <div
                      className='flex-1 bg-card overflow-hidden rounded-[10px] flex flex-col justify-center items-center gap-2 cursor-pointer transition-colors'
                      onClick={() => router.push('/receiving')}
                    >
                      <div className='relative w-24 h-24 p-3 flex items-center justify-center'>
                        {/* Background shape using Puddle3.svg */}
                        <Image
                          src='/images/Puddle3.svg'
                          alt='Receive items background'
                          width={90}
                          height={80}
                          className='absolute inset-0 object-contain'
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                        <div className='relative flex items-center justify-center z-10'>
                          <PackageOpen className='w-12 h-12 text-foreground' />
                        </div>
                      </div>
                      <div className='text-center text-[14px] font-medium leading-[20px] text-foreground'>
                        Receive items
                      </div>
                    </div>

                    {/* View Notifications - Hidden in production */}
                    {process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'PRODUCTION' && (
                      <div className='flex-1 bg-card overflow-hidden rounded-[10px] flex flex-col justify-center items-center gap-2 relative'>
                        <div className='relative w-24 h-24 p-3 flex items-center justify-center'>
                          {/* Background shape using Puddle4.svg */}
                          <Image
                            src='/images/Puddle4.svg'
                            alt='View notifications background'
                            width={90}
                            height={80}
                            className='absolute inset-0 object-contain'
                            style={{
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                          <div className='relative flex items-center justify-center z-10'>
                            <Bell className='w-12 h-12 text-foreground' />
                          </div>
                          {/* Badge */}
                          <div className='absolute top-0 right-0 min-w-5 px-1.5 py-1 bg-[var(--base-primary)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-full flex justify-center items-center z-20'>
                            <span className='text-[10px] font-semibold leading-3 text-[var(--base-primary-foreground)]'>
                              8
                            </span>
                          </div>
                        </div>
                        <div className='text-center text-[14px] font-medium leading-[20px] text-foreground'>
                          View notifications
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Summary Cards Section */}
              <section className='w-full'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
                  {/* Total Orders Card - Exact Figma Design */}
                  <div className='w-full h-full p-6 bg-gradient-to-b from-[rgba(23,23,23,0)] to-[rgba(252,90,41,0.05)] bg-[var(--base-card,white)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-[14px] border border-[var(--base-border,#E5E5E5)] flex flex-col justify-start items-start gap-6 overflow-hidden'>
                    <div className='w-full flex flex-col justify-start items-start gap-6'>
                      <div className='w-full flex flex-col justify-start items-start gap-1.5'>
                        <div className='w-full flex justify-between items-start'>
                          <div className='text-[14px] text-[var(--base-muted-foreground,#737373)] font-normal font-geist leading-5'>
                            Total Orders
                          </div>
                          <div className='px-2 py-0.5 bg-[var(--base-background,white)] rounded-lg border border-[var(--base-border,#E5E5E5)] flex justify-center items-center gap-1'>
                            <TrendingUp className='w-3 h-3 text-[var(--base-foreground,#0A0A0A)]' />
                            <div className='text-[12px] text-[var(--base-foreground,#0A0A0A)] font-semibold font-geist leading-4'>
                              +12,5%
                            </div>
                          </div>
                        </div>
                        <div className='w-full text-[30px] text-[var(--base-card-foreground,#0A0A0A)] font-semibold font-geist leading-9'>
                          $15,231.89
                        </div>
                      </div>
                      <div className='w-full flex flex-col justify-start items-start gap-1.5'>
                        <div className='w-full flex justify-start items-center gap-2'>
                          <div className='text-[14px] text-[var(--base-card-foreground,#0A0A0A)] font-normal font-geist leading-5'>
                            Trending up this month
                          </div>
                          <TrendingUp className='w-4 h-4 text-[var(--base-card-foreground,#0A0A0A)]' />
                        </div>
                        <div className='w-full text-[14px] text-[var(--base-muted-foreground,#737373)] font-normal font-geist leading-5'>
                          Orders for last 6 months
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orders Placed Card - Exact Figma Design */}
                  <div className='w-full h-full p-6 bg-gradient-to-b from-[rgba(23,23,23,0)] to-[rgba(252,90,41,0.05)] bg-[var(--base-card,white)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-[14px] border border-[var(--base-border,#E5E5E5)] flex flex-col justify-start items-start gap-6 overflow-hidden'>
                    <div className='w-full flex flex-col justify-start items-start gap-6'>
                      <div className='w-full flex flex-col justify-start items-start gap-1.5'>
                        <div className='w-full flex justify-between items-start'>
                          <div className='text-[14px] text-[var(--base-muted-foreground,#737373)] font-normal font-geist leading-5'>
                            Orders placed
                          </div>
                          <div className='px-2 py-0.5 bg-[var(--base-background,white)] rounded-lg border border-[var(--base-border,#E5E5E5)] flex justify-center items-center gap-1'>
                            <TrendingUp className='w-3 h-3 text-[var(--base-foreground,#0A0A0A)]' />
                            <div className='text-[12px] text-[var(--base-foreground,#0A0A0A)] font-semibold font-geist leading-4'>
                              +9.5%
                            </div>
                          </div>
                        </div>
                        <div className='w-full text-[30px] text-[var(--base-card-foreground,#0A0A0A)] font-semibold font-geist leading-9'>
                          2,678
                        </div>
                      </div>
                      <div className='w-full flex flex-col justify-start items-start gap-1.5'>
                        <div className='w-full flex justify-start items-center gap-2'>
                          <div className='text-[14px] text-[var(--base-card-foreground,#0A0A0A)] font-normal font-geist leading-5'>
                            Strong order growth
                          </div>
                          <TrendingUp className='w-4 h-4 text-[var(--base-card-foreground,#0A0A0A)]' />
                        </div>
                        <div className='w-full text-[14px] text-[var(--base-muted-foreground,#737373)] font-normal font-geist leading-5'>
                          Outpacing previous month
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth Rate Card - Exact Figma Design */}
                  <div className='w-full h-full p-6 bg-gradient-to-b from-[rgba(23,23,23,0)] to-[rgba(252,90,41,0.05)] bg-[var(--base-card,white)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-[14px] border border-[var(--base-border,#E5E5E5)] flex flex-col justify-start items-start gap-6 overflow-hidden'>
                    <div className='w-full flex flex-col justify-start items-start gap-6'>
                      <div className='w-full flex flex-col justify-start items-start gap-1.5'>
                        <div className='w-full flex justify-between items-start'>
                          <div className='text-[14px] text-[var(--base-muted-foreground,#737373)] font-normal font-geist leading-5'>
                            Growth Rate
                          </div>
                          <div className='px-2 py-0.5 bg-[var(--base-background,white)] rounded-lg border border-[var(--base-border,#E5E5E5)] flex justify-center items-center gap-1'>
                            <TrendingUp className='w-3 h-3 text-[var(--base-foreground,#0A0A0A)]' />
                            <div className='text-[12px] text-[var(--base-foreground,#0A0A0A)] font-semibold font-geist leading-4'>
                              +4.5%
                            </div>
                          </div>
                        </div>
                        <div className='w-full text-[30px] text-[var(--base-card-foreground,#0A0A0A)] font-semibold font-geist leading-9'>
                          4.5%
                        </div>
                      </div>
                      <div className='w-full flex flex-col justify-start items-start gap-1.5'>
                        <div className='w-full flex justify-start items-center gap-2'>
                          <div className='text-[14px] text-[var(--base-card-foreground,#0A0A0A)] font-normal font-geist leading-5'>
                            Steady order increase
                          </div>
                          <TrendingUp className='w-4 h-4 text-[var(--base-card-foreground,#0A0A0A)]' />
                        </div>
                        <div className='w-full text-[14px] text-[var(--base-muted-foreground,#737373)] font-normal font-geist leading-5'>
                          Meets growth projections
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Orders Table Section */}
              <section className='w-full'>
                <div className='flex flex-col gap-4'>
                  {/* OUTSIDE controls row (sits above the card) */}
                  <div className='flex items-center justify-between'>
                    {/* Segmented control */}
                    <div className='flex items-center p-[6px] bg-[var(--base-muted,#F5F5F5)] rounded-[10px]'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setTimeFilter('Week')}
                        className={`flex-1 px-4 py-2 rounded-[8px] text-[14px] font-medium font-geist leading-5 ${
                          timeFilter === 'Week'
                            ? 'bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 outline-[rgba(255,255,255,0)] -outline-offset-1'
                            : 'hover:bg-white hover:shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] hover:outline hover:outline-1 hover:outline-[rgba(255,255,255,0)] hover:-outline-offset-1 transition-all duration-200'
                        }`}
                      >
                        Week
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setTimeFilter('Month')}
                        className={`flex-1 px-4 py-2 rounded-[8px] text-[14px] font-medium font-geist leading-5 ${
                          timeFilter === 'Month'
                            ? 'bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 outline-[rgba(255,255,255,0)] -outline-offset-1'
                            : 'hover:bg-white hover:shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] hover:outline hover:outline-1 hover:outline-[rgba(255,255,255,0)] hover:-outline-offset-1 transition-all duration-200'
                        }`}
                      >
                        Month
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setTimeFilter('Year')}
                        className={`flex-1 px-4 py-2 rounded-[8px] text-[14px] font-medium font-geist leading-5 ${
                          timeFilter === 'Year'
                            ? 'bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 outline-[rgba(255,255,255,0)] -outline-offset-1'
                            : 'hover:bg-white hover:shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] hover:outline hover:outline-1 hover:outline-[rgba(255,255,255,0)] hover:-outline-offset-1 transition-all duration-200'
                        }`}
                      >
                        Year
                      </Button>
                    </div>

                    {/* Filter button */}
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-10 px-5 text-[12px] font-medium font-geist leading-4 bg-white border border-[var(--base-border,#E5E5E5)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)]'
                    >
                      Filter
                    </Button>
                  </div>

                  {/* CARD starts here (only title + table inside) */}
                  <Card className='border border-[var(--base-border,#E5E5E5)] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] rounded-[14px] overflow-hidden'>
                    <div className='px-6 pt-5 pb-3'>
                      <h2 className='text-[22px] font-semibold text-[var(--base-card-foreground,#0A0A0A)] font-geist leading-7'>
                        Orders
                      </h2>
                      <p className='text-[14px] text-[var(--base-muted-foreground,#737373)] font-normal font-geist leading-5'>
                        Orders placed this week
                      </p>
                    </div>

                    <div className='overflow-x-auto  px-6 py-0'>
                      <Table>
                        <TableHeader>
                          <TableRow className='h-10 border-b border-[var(--base-border,#E5E5E5)] bg-white'>
                            <TableHead className='py-0 text-[14px] font-medium text-[var(--base-muted-foreground,#737373)] font-geist leading-5'>
                              Item
                            </TableHead>
                            <TableHead className='py-0 text-[14px] font-medium text-[var(--base-muted-foreground,#737373)] font-geist leading-5 hidden md:table-cell'>
                              Supplier
                            </TableHead>
                            <TableHead className='py-0 text-[14px] font-medium text-[var(--base-muted-foreground,#737373)] font-geist leading-5'>
                              Status
                            </TableHead>
                            <TableHead className='py-0 text-[14px] font-medium text-[var(--base-muted-foreground,#737373)] font-geist leading-5 hidden lg:table-cell'>
                              Date
                            </TableHead>
                            <TableHead className='py-0 text-right text-[14px] font-medium text-[var(--base-muted-foreground,#737373)] font-geist leading-5'>
                              Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {orders.map((order, index) => (
                            <TableRow
                              key={index}
                              className='h-[52px] border-b border-[color-mix(in_oklab,var(--base-border,#E5E5E5) 70%,transparent)] hover:bg-[rgba(23,23,23,0.02)] transition-colors'
                            >
                              {/* Item (with underline link on first line, supplier shown on mobile) */}
                              <TableCell className='text-[14px] text-[var(--base-foreground,#0A0A0A)] font-normal font-geist leading-5'>
                                <div className='flex flex-col'>
                                  <span className='underline underline-offset-[3px] decoration-[var(--base-foreground,#0A0A0A)]'>
                                    {order.item}
                                  </span>
                                  <span className='text-xs text-[var(--base-muted-foreground,#737373)] md:hidden'>
                                    {order.supplier}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Supplier (hidden on mobile) */}
                              <TableCell className='text-[14px] text-[var(--base-foreground,#0A0A0A)] font-normal font-geist leading-5 hidden md:table-cell'>
                                {order.supplier}
                              </TableCell>

                              {/* Status badge */}
                              <TableCell>
                                <span
                                  className={
                                    order.status === 'Received'
                                      ? 'inline-flex items-center rounded-md bg-[var(--base-secondary,#FEF7F5)] px-2 py-1 text-[12px] font-semibold font-geist leading-4 text-[var(--base-secondary-foreground,#171717)]'
                                      : 'inline-flex items-center rounded-md border border-[var(--base-border,#E5E5E5)] bg-[var(--base-background,white)] px-2 py-1 text-[12px] font-semibold font-geist leading-4 text-[var(--base-foreground,#0A0A0A)]'
                                  }
                                >
                                  {order.status}
                                </span>
                              </TableCell>

                              {/* Date (hidden on md) */}
                              <TableCell className='text-[14px] text-[var(--base-foreground,#0A0A0A)] font-normal font-geist leading-5 hidden lg:table-cell'>
                                {order.date}
                              </TableCell>

                              {/* Amount */}
                              <TableCell className='text-right text-[14px] text-[var(--base-foreground,#0A0A0A)] font-normal font-geist leading-5'>
                                {order.amount}
                              </TableCell>
                            </TableRow>
                          ))}

                          {/* Total row */}
                          <TableRow className='h-[44px] bg-[rgba(23,23,23,0.02)]'>
                            <TableCell
                              colSpan={4}
                              className='text-[14px] font-normal text-[var(--base-foreground,#0A0A0A)] font-geist leading-5'
                            >
                              Total
                            </TableCell>
                            <TableCell className='text-right text-[14px] font-medium text-[var(--base-foreground,#0A0A0A)] font-geist leading-5'>
                              ${totalAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              </section>
            </div>

            {/* Right Column - Get Started Section */}
            <section className='w-full lg:w-[365px]'>
              <div className='w-full bg-card shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[10px] border border-border flex flex-col overflow-hidden'>
                {/* Header Section */}
                <div className='w-full p-6 bg-gradient-to-b from-[rgba(255,255,255,0.50)] to-[rgba(255,255,255,0.50)] bg-muted flex justify-between items-center'>
                  <div className='flex-1 flex flex-col justify-start items-start gap-0.5'>
                    <h3 className='text-[18px] font-semibold text-foreground font-geist leading-[28px]'>
                      Get started with Arda
                    </h3>
                  </div>
                  <div className='flex justify-start items-center gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-9 px-2.5 py-2 bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-input rounded-lg'
                    >
                      <X className='w-4 h-4' />
                    </Button>
                  </div>
                </div>

                {/* Content Section */}
                <div className='w-full p-6 flex flex-col justify-center items-start gap-6'>
                  {/* Action Items */}
                  <div className='w-full flex flex-col justify-start items-start gap-1'>
                    <div className='w-full h-8 px-2 py-2 rounded-lg flex justify-start items-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors'>
                      <Building className='w-4 h-4 text-sidebar-foreground' />
                      <div className='flex-1 text-[14px] text-sidebar-foreground font-normal font-geist leading-[14px]'>
                        Set up your company
                      </div>
                      <ChevronRight className='w-4 h-4 text-sidebar-foreground' />
                    </div>

                    <div className='w-full h-8 px-2 py-2 rounded-lg flex justify-start items-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors'>
                      <Dock className='w-4 h-4 text-sidebar-foreground' />
                      <div className='flex-1 text-[14px] text-sidebar-foreground font-normal font-geist leading-[14px]'>
                        Add inventory items
                      </div>
                      <ChevronRight className='w-4 h-4 text-sidebar-foreground' />
                    </div>

                    <div className='w-full h-8 px-2 py-2 rounded-lg flex justify-start items-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors'>
                      <UserRound className='w-4 h-4 text-sidebar-foreground' />
                      <div className='flex-1 text-[14px] text-sidebar-foreground font-normal font-geist leading-[14px]'>
                        Invite your team
                      </div>
                      <ChevronRight className='w-4 h-4 text-sidebar-foreground' />
                    </div>
                  </div>

                  {/* Separator */}
                  <div className='w-full h-px bg-border'></div>

                  {/* HubSpot Blog Posts - Dynamic "Getting Started" Cards */}
                  <HubSpotPostsPanel />
                </div>

                {/* Footer Section */}
                <div className='w-full px-6 py-3 bg-gradient-to-b from-[rgba(255,255,255,0.50)] to-[rgba(255,255,255,0.50)] bg-muted flex justify-between items-center'>
                  <div className='text-[14px] text-muted-foreground font-normal font-geist leading-5'>
                    Page 1 of 2
                  </div>
                  <div className='flex justify-start items-center gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-6 px-2.5 py-2 bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-input rounded-lg'
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-6 px-2.5 py-2 bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-input rounded-lg'
                    >
                      <ChevronRight className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Mobile Sidebar Toggle - Only visible on mobile */}
          {isMobile && (
            <div className='lg:hidden fixed bottom-6 right-6 z-50'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size='lg'
                    className='rounded-full w-14 h-14 shadow-lg'
                  >
                    <Menu className='w-6 h-6' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-64'>
                  <DropdownMenuItem className='flex items-center gap-2 p-3'>
                    <FileText className='w-4 h-4' />
                    <span>Set up your company</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className='flex items-center gap-2 p-3'>
                    <FileText className='w-4 h-4' />
                    <span>Add inventory items</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className='flex items-center gap-2 p-3'>
                    <FileText className='w-4 h-4' />
                    <span>Invite your team</span>
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem className='flex items-center gap-2 p-3'>
                    <span className='text-sm text-muted-foreground'>
                      Getting started topics
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <Toaster position='top-right' />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
