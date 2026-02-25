'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@frontend/components/ui/breadcrumb';
import { AuthGuard } from '@frontend/components/AuthGuard';
import { AccountSection } from '@frontend/components/settings/AccountSection';
import { CompaniesSection } from '@frontend/components/settings/CompaniesSection';
import { AppearanceSection } from '@frontend/components/settings/AppearanceSection';
import { NotificationsSection } from '@frontend/components/settings/NotificationsSection';
import { DisplaySection } from '@frontend/components/settings/DisplaySection';

const allSettingsSections = [
  { id: 'account', label: 'Account' },
  { id: 'companies', label: 'Companies' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'display', label: 'Display' },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(
    sectionParam && allSettingsSections.some((s) => s.id === sectionParam)
      ? sectionParam
      : 'account'
  );

  useEffect(() => {
    if (sectionParam && allSettingsSections.some((s) => s.id === sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  // Filter out Appearance and Notifications sections in production
  const settingsSections = allSettingsSections.filter((section) => {
    if (process.env.NEXT_PUBLIC_DEPLOY_ENV === 'PRODUCTION') {
      return !['appearance', 'notifications'].includes(section.id);
    }
    return true;
  });

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSection />;
      case 'companies':
        return <CompaniesSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'display':
        return <DisplaySection />;
      default:
        return <AccountSection />;
    }
  };

  return (
    <div className='w-full flex flex-col gap-6'>
      <div className='px-4 pt-4 pb-2 md:px-8 md:pt-6'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='#'>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className='flex w-full items-center justify-between pb-6 md:py-2 pb-4 border-b'>
        <div className='px-10 pb-6 md:px-8'>
          <h2 className='text-3xl font-bold text-[#0A0A0A]'>Settings</h2>
          <p className='text-muted-foreground text-sm'>
            Your account, your rules. Edit details, change settings, and keep
            things the way you like.
          </p>
        </div>
      </div>

      <div className='flex gap-8 px-10 md:px-8'>
        {/* Sidebar Navigation */}
        <div className='w-48 space-y-1'>
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeSection === section.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className='flex-1 max-w-2xl'>{renderContent()}</div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard redirectTo="/signin">
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsContent />
      </Suspense>
    </AuthGuard>
  );
}
