import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaSupplierViewer } from './ArdaSupplierViewer';
import { supplierTabs } from './configs/stepped-layout';
import { supplierFieldOrder } from './configs/continuous-scroll-layout';
import { validateBusinessAffiliate, mockSupplier, createSupplierInstance } from './mocks/supplier-data';

// ============================================================================
// 1. Rendering
// ============================================================================

describe('Rendering', () => {
  it('displays title and loading then content in display mode', async () => {
    render(
      <ArdaSupplierViewer
        title="Supplier Details"
        layoutMode="continuous-scroll"
        editable={false}
        entityId="ba-001"
        fieldOrder={supplierFieldOrder}
      />,
    );

    // Title is visible immediately (even during loading)
    expect(screen.getByText('Supplier Details')).toBeInTheDocument();

    // Loading indicator shows while fetching
    expect(screen.getByText('Loading…')).toBeInTheDocument();

    // After async fetch resolves, loading disappears and content appears
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });
  });

  it('starts in edit mode when no entityId is provided (create flow)', async () => {
    render(
      <ArdaSupplierViewer
        title="New Supplier"
        layoutMode="continuous-scroll"
        editable={true}
        fieldOrder={supplierFieldOrder}
      />,
    );

    // Create flow should start in edit mode immediately — Cancel button visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  it('shows Edit button in display mode when editable is true', async () => {
    render(
      <ArdaSupplierViewer
        title="Editable Supplier"
        layoutMode="continuous-scroll"
        editable={true}
        entityId="ba-001"
        fieldOrder={supplierFieldOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
});

// ============================================================================
// 2. Layout
// ============================================================================

describe('Layout', () => {
  it('stepped layout shows step indicators', async () => {
    render(
      <ArdaSupplierViewer
        title="Stepped Supplier"
        layoutMode="stepped"
        editable={true}
        entityId="ba-001"
        tabs={supplierTabs}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Each tab label should appear as a step indicator button
    for (const tab of supplierTabs) {
      expect(screen.getByRole('button', { name: new RegExp(tab.label) })).toBeInTheDocument();
    }
  });

  it('continuous-scroll layout shows Submit button in edit mode', async () => {
    const user = userEvent.setup();

    render(
      <ArdaSupplierViewer
        title="Continuous Supplier"
        layoutMode="continuous-scroll"
        editable={true}
        entityId="ba-001"
        fieldOrder={supplierFieldOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Click Edit to enter edit mode
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 3. Validation
// ============================================================================

describe('Validation', () => {
  const baseSupplier = createSupplierInstance();

  it('returns error for empty name', () => {
    const result = validateBusinessAffiliate(baseSupplier, {
      ...mockSupplier,
      name: '',
    });

    expect(result.fieldErrors.some((e) => e.fieldPath === 'name')).toBe(true);
  });

  it('returns error for empty roles', () => {
    const result = validateBusinessAffiliate(baseSupplier, {
      ...mockSupplier,
      roles: [],
    });

    expect(result.fieldErrors.some((e) => e.fieldPath === 'roles')).toBe(true);
  });

  it('returns error for invalid email', () => {
    const result = validateBusinessAffiliate(baseSupplier, {
      ...mockSupplier,
      contact: { ...mockSupplier.contact!, email: 'not-an-email' },
    });

    expect(result.fieldErrors.some((e) => e.fieldPath === 'contact')).toBe(true);
    expect(result.fieldErrors.some((e) => e.message.toLowerCase().includes('email'))).toBe(true);
  });

  it('validates a valid supplier with no errors', () => {
    const result = validateBusinessAffiliate(baseSupplier, mockSupplier);

    expect(result.fieldErrors).toHaveLength(0);
    expect(result.entityErrors).toHaveLength(0);
  });
});

// ============================================================================
// 4. Sub-viewers
// ============================================================================

describe('Sub-viewers', () => {
  it('renders sub-viewer labels (Contact Information, Primary Address, Legal Information)', async () => {
    render(
      <ArdaSupplierViewer
        title="Sub-viewer Test"
        layoutMode="continuous-scroll"
        editable={false}
        entityId="ba-001"
        fieldOrder={supplierFieldOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Sub-viewers are rendered inside SubViewerContainer with their label as a toggle button
    expect(screen.getByRole('button', { name: /Contact Information/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Primary Address/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Legal Information/ })).toBeInTheDocument();
  });
});

// ============================================================================
// 5. Create flow
// ============================================================================

describe('Create flow', () => {
  it('starts in edit mode with Cancel button when no entityId is provided', async () => {
    render(
      <ArdaSupplierViewer
        title="Create Supplier"
        layoutMode="continuous-scroll"
        editable={true}
        fieldOrder={supplierFieldOrder}
      />,
    );

    // No loading state for create flow — jumps straight to edit mode
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    // Submit button should also be visible in continuous-scroll edit mode
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    // Edit button should NOT be visible (we're already in edit mode)
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });
});
