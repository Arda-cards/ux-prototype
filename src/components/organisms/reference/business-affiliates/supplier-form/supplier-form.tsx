'use client';

import type { BusinessAffiliate } from '@/types/reference/business-affiliates/business-affiliate';
import { ArdaSupplierViewer } from '@/components/organisms/reference/business-affiliates/arda-supplier-viewer';
import { supplierTabs } from '@/components/organisms/reference/business-affiliates/arda-supplier-viewer/configs/stepped-layout';
import { supplierFieldOrder } from '@/components/organisms/reference/business-affiliates/arda-supplier-viewer/configs/continuous-scroll-layout';

export interface ArdaSupplierFormStaticConfig {
  mode?: 'single-scroll' | 'stepped';
}

export interface ArdaSupplierFormRuntimeConfig {
  value: BusinessAffiliate;
  onChange?: (value: BusinessAffiliate) => void;
  currentStep?: number;
}

export interface ArdaSupplierFormProps
  extends ArdaSupplierFormStaticConfig, ArdaSupplierFormRuntimeConfig {}

export function ArdaSupplierForm({ value, mode = 'single-scroll' }: ArdaSupplierFormProps) {
  const isStepped = mode === 'stepped';

  // Build MountConfig conditionally to respect exactOptionalPropertyTypes
  const mountProps = {
    title: value.name || 'Supplier',
    layoutMode: isStepped ? ('stepped' as const) : ('continuous-scroll' as const),
    editable: true,
    ...(value.eId ? { entityId: value.eId } : {}),
    ...(isStepped ? { tabs: supplierTabs } : { fieldOrder: supplierFieldOrder }),
  };

  return <ArdaSupplierViewer {...mountProps} />;
}
