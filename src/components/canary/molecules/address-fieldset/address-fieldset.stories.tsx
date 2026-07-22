import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AddressFieldset } from './address-fieldset';
import type { PostalAddress } from '@/types/canary/model/general/geo/postal-address';

const meta: Meta = {
  title: 'Components/Canary/Molecules/AddressFieldset',
};

export default meta;

/** Controlled address form; the caller receives the merged PostalAddress. */
export const Default: StoryObj = {
  render: function DefaultStory() {
    const [value, setValue] = useState<PostalAddress | null>({
      addressLine1: '10880 Malibu Point',
      city: 'Malibu',
      state: 'CA',
      postalCode: '90265',
      country: 'US',
    });
    return (
      <div className="w-80 p-8">
        <AddressFieldset label="Deliver to" value={value} onChange={setValue} />
        <pre className="mt-3 text-xs text-muted-foreground">{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  },
};

/** Empty form — reports null until a field is filled. */
export const Empty: StoryObj = {
  render: function EmptyStory() {
    const [value, setValue] = useState<PostalAddress | null>(null);
    return (
      <div className="w-80 p-8">
        <AddressFieldset label="Vendor address" value={value} onChange={setValue} />
        <pre className="mt-3 text-xs text-muted-foreground">
          {value ? JSON.stringify(value) : '(null)'}
        </pre>
      </div>
    );
  },
};
