'use client';

import { AuthGuard } from '@frontend/components/AuthGuard';

export default function ItemDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard intervalMs={15 * 60 * 1000} redirectTo='/signin'>
      {children}
    </AuthGuard>
  );
}
