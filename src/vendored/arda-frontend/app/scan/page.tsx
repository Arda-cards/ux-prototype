'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthGuard } from '@frontend/components/AuthGuard';
import { MobileScanView } from '@frontend/components/scan/MobileScanView';
import { DesktopScanView } from '@frontend/components/scan/DesktopScanView';
import { useIsMobile } from '@frontend/hooks/use-mobile';

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  const initialCardId = searchParams.get('cardId') || undefined;
  const initialView =
    (searchParams.get('view') as 'scan' | 'list' | 'card') || 'scan';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScanComplete = (scannedData: string) => {
    console.log('Scanned data:', scannedData);
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthGuard>
      {isMobile ? (
        <MobileScanView
          onScan={handleScanComplete}
          onClose={handleClose}
          initialCardId={initialCardId}
          initialView={initialView}
          showCardToggle={!!initialCardId}
        />
      ) : (
        <DesktopScanView
          isOpen={true}
          onClose={handleClose}
          onScan={handleScanComplete}
          initialCardId={initialCardId}
        />
      )}
    </AuthGuard>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={null}>
      <ScanPageContent />
    </Suspense>
  );
}
