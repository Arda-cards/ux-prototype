import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  sampleAffiliates,
  type BusinessAffiliate,
} from '@/types/reference/business-affiliates/business-affiliate';

import { ArdaSupplierForm } from './supplier-form';

function emptyAffiliate(): BusinessAffiliate {
  return { eId: '', name: '', legal: {}, roles: [] };
}

const sampleAffiliate = sampleAffiliates[0]!;

describe('ArdaSupplierForm', () => {
  describe('single-scroll mode', () => {
    it('renders all sections with identity fields visible', () => {
      render(<ArdaSupplierForm value={emptyAffiliate()} onChange={() => {}} />);
      expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
      expect(screen.getByText('Business Roles')).toBeInTheDocument();
      expect(screen.getByLabelText('General Notes')).toBeInTheDocument();
    });

    it('renders collapsible Contact and Address & Legal panels', () => {
      render(<ArdaSupplierForm value={emptyAffiliate()} onChange={() => {}} />);
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Address & Legal')).toBeInTheDocument();
    });

    it('auto-expands Contact panel when contact data is present', () => {
      const affiliate: BusinessAffiliate = {
        ...emptyAffiliate(),
        contact: { firstName: 'Sarah' },
      };
      render(<ArdaSupplierForm value={affiliate} onChange={() => {}} />);
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    });

    it('auto-expands Address & Legal panel when address data is present', () => {
      const affiliate: BusinessAffiliate = {
        ...emptyAffiliate(),
        mainAddress: { city: 'Winona' },
      };
      render(<ArdaSupplierForm value={affiliate} onChange={() => {}} />);
      expect(screen.getByLabelText('City')).toBeInTheDocument();
    });

    it('expands Contact panel on click', () => {
      render(<ArdaSupplierForm value={emptyAffiliate()} onChange={() => {}} />);
      fireEvent.click(screen.getByText('Contact'));
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    });
  });

  describe('stepped mode', () => {
    it('renders only identity fields at step 0', () => {
      render(
        <ArdaSupplierForm
          value={emptyAffiliate()}
          onChange={() => {}}
          mode="stepped"
          currentStep={0}
        />,
      );
      expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('City')).not.toBeInTheDocument();
    });

    it('renders only contact fields at step 1', () => {
      render(
        <ArdaSupplierForm
          value={emptyAffiliate()}
          onChange={() => {}}
          mode="stepped"
          currentStep={1}
        />,
      );
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.queryByLabelText('Company Name')).not.toBeInTheDocument();
    });

    it('renders only address & legal fields at step 2', () => {
      render(
        <ArdaSupplierForm
          value={emptyAffiliate()}
          onChange={() => {}}
          mode="stepped"
          currentStep={2}
        />,
      );
      expect(screen.getByLabelText('Address Line 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Legal Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('Company Name')).not.toBeInTheDocument();
    });
  });

  describe('field changes', () => {
    it('calls onChange when name is typed', () => {
      const onChange = vi.fn();
      render(<ArdaSupplierForm value={emptyAffiliate()} onChange={onChange} />);
      fireEvent.change(screen.getByLabelText('Company Name'), {
        target: { value: 'Acme Corp' },
      });
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Acme Corp' }));
    });

    it('toggles a role checkbox', () => {
      const onChange = vi.fn();
      render(<ArdaSupplierForm value={emptyAffiliate()} onChange={onChange} />);
      const checkboxes = screen.getAllByRole('checkbox');

      fireEvent.click(checkboxes[0]!); // Vendor
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: [{ role: 'VENDOR' }],
        }),
      );
    });

    it('shows role notes input when role is checked', () => {
      const affiliate: BusinessAffiliate = {
        ...emptyAffiliate(),
        roles: [{ role: 'VENDOR' }],
      };
      render(<ArdaSupplierForm value={affiliate} onChange={() => {}} />);
      expect(screen.getByLabelText('Vendor Notes')).toBeInTheDocument();
    });

    it('populates fields from sample affiliate', () => {
      render(<ArdaSupplierForm value={sampleAffiliate} onChange={() => {}} />);
      expect(screen.getByLabelText('Company Name')).toHaveValue('Fastenal Corp.');
    });
  });
});
