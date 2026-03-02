import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { sampleAffiliates } from '@/extras/types/reference/business-affiliates/business-affiliate';

import { ArdaSupplierForm } from './supplier-form';

const sampleAffiliate = sampleAffiliates[0]!;

describe('ArdaSupplierForm', () => {
  it('renders the viewer with a title derived from affiliate name', async () => {
    render(<ArdaSupplierForm value={sampleAffiliate} />);
    // The viewer shows a title — either the affiliate name or fallback
    await waitFor(() => {
      expect(screen.getByText('Fastenal Corp.')).toBeInTheDocument();
    });
  });

  it('renders in continuous-scroll mode by default', async () => {
    render(<ArdaSupplierForm value={sampleAffiliate} />);
    // Continuous-scroll shows all fields; loading then content
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });
    // Edit button should be visible (editable=true by default)
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders in stepped mode when mode="stepped"', async () => {
    render(<ArdaSupplierForm value={sampleAffiliate} mode="stepped" />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });
    // Stepped layout shows tab step indicators
    expect(screen.getByRole('button', { name: /Identity/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contact/ })).toBeInTheDocument();
  });

  it('renders create flow when affiliate has no eId', async () => {
    render(<ArdaSupplierForm value={{ eId: '', name: '', roles: [] }} />);
    // Create flow starts in edit mode immediately
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });
});
