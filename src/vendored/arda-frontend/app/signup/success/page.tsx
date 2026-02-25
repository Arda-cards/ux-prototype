'use client';

import { Suspense } from 'react';
import { SignUpSuccessContent } from '../../../components/signIn/success-content';

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SignUpSuccessContent />
    </Suspense>
  );
}
