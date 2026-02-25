'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@frontend/components/ui/breadcrumb';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { Button } from '@frontend/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@frontend/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@frontend/components/ui/popover';
import { Calendar } from '@frontend/components/ui/calendar';
import { cn } from '@frontend/lib/utils';
import { ChangePasswordSection } from '@frontend/components/settings/ChangePasswordSection';

export default function AccountProfilePage() {
  const [date, setDate] = React.useState<Date | undefined>();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />

        <div className='w-full flex flex-col gap-6'>
          {/* Breadcrumb */}
          <div className='px-4 pt-4 pb-2 md:px-8 md:pt-6'>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='#'>Settings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>My Account</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header */}
          <div className='flex w-full items-start justify-between pb-6 md:py-2 border-b'>
            <div className='px-10 pb-6 md:px-8'>
              <h2 className='text-3xl font-bold text-[#0A0A0A]'>
                Account Profile
              </h2>
              <p className='text-muted-foreground text-sm'>
                Update your account settings. Set your preferred language and
                timezone.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className='flex flex-col gap-6 px-4 md:px-8 pb-10 w-full'>
            {/* Name - full width */}
            <div className='flex flex-col gap-2 w-full'>
              <Label htmlFor='name'>Name</Label>
              <Input id='name' placeholder='Your name' className='w-full' />
              <p className='text-sm text-muted-foreground'>
                This is the name that will be displayed on your profile and in
                emails.
              </p>
            </div>

            {/* Date of Birth */}
            <div className='flex flex-col gap-2 max-w-sm'>
              <Label htmlFor='dob'>Date of birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className='text-sm text-muted-foreground'>
                Your date of birth is used to calculate your age.
              </p>
            </div>

            {/* Language */}
            <div className='flex flex-col gap-2 max-w-sm'>
              <Label htmlFor='language'>Language</Label>
              <Select>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Placeholder' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='en'>English</SelectItem>
                  <SelectItem value='es'>Spanish</SelectItem>
                  <SelectItem value='fr'>French</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-sm text-muted-foreground'>
                This is the language that will be used in the dashboard.
              </p>
            </div>

            {/* Submit button */}
            <div className='pt-2'>
              <Button className='bg-black text-white rounded-md px-6 py-2 h-9 text-sm'>
                Update account
              </Button>
            </div>
          </div>

          {/* Change Password Section */}
          <ChangePasswordSection />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
