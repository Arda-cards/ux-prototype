'use client';

import { AuthGuard } from '@frontend/components/AuthGuard';

export default function CompanySettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard intervalMs={5 * 60 * 1000} redirectTo='/signin'>
      {children}
    </AuthGuard>
  );
}
