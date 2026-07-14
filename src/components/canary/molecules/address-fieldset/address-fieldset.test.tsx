import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { AddressFieldset } from './address-fieldset';
import type { PostalAddress } from '@/types/canary/model/general/geo/postal-address';

function Harness({
  initial = null,
  onChange,
}: {
  initial?: PostalAddress | null;
  onChange?: (v: PostalAddress | null) => void;
}) {
  const [value, setValue] = useState<PostalAddress | null>(initial);
  return (
    <AddressFieldset
      label="Deliver to"
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe('AddressFieldset', () => {
  it('renders the current value across its fields', () => {
    render(
      <Harness
        initial={{
          addressLine1: '1 Infinite Loop',
          city: 'Cupertino',
          state: 'CA',
          postalCode: '95014',
          country: 'US',
        }}
      />,
    );
    expect(screen.getByLabelText('Deliver to street address')).toHaveValue('1 Infinite Loop');
    expect(screen.getByLabelText('Deliver to city')).toHaveValue('Cupertino');
    expect(screen.getByLabelText('Deliver to postal code')).toHaveValue('95014');
  });

  it('merges edits into the address object', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial={{ addressLine1: '1 Main St' }} onChange={onChange} />);
    await user.type(screen.getByLabelText('Deliver to city'), 'Berlin');
    expect(onChange).toHaveBeenLastCalledWith({ addressLine1: '1 Main St', city: 'Berlin' });
  });

  it('reports null when every field is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial={{ addressLine1: '1 Main St' }} onChange={onChange} />);
    await user.clear(screen.getByLabelText('Deliver to street address'));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('disables every field via the fieldset', () => {
    render(<AddressFieldset label="Deliver to" value={null} onChange={() => {}} disabled />);
    expect(screen.getByLabelText('Deliver to street address')).toBeDisabled();
  });
});
