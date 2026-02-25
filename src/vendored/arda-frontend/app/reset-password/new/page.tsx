// app/reset-password/new/page.tsx
import { Suspense } from 'react';
import CreateNewPasswordPage from './client';

export default function Page() {
  return (
    <Suspense>
      <CreateNewPasswordPage />
    </Suspense>
  );
}
