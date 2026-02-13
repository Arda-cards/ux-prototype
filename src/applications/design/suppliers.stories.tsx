import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Search, Filter, Plus } from 'lucide-react';

import { ArdaBadge } from '@/components/atoms/badge/badge';
import { ArdaButton } from '@/components/atoms/button/button';
import {
  ArdaTable,
  ArdaTableBody,
  ArdaTableCell,
  ArdaTableHead,
  ArdaTableHeader,
  ArdaTableRow,
} from '@/components/molecules/table/table';
import { ArdaSupplierDrawer } from '@/components/organisms/reference/business-affiliates/supplier-drawer/supplier-drawer';
import { sampleAffiliates } from '@/types/reference/business-affiliates/business-affiliate';
import { AppLayout } from '@/applications/shared/app-layout';

const meta: Meta = {
  title: 'Application Mocks/Design/Suppliers',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const designOutline: React.CSSProperties = {
  outline: '1px dotted #CBD5E1',
  outlineOffset: 2,
  borderRadius: 4,
};

const roleVariant = (role: string) => {
  switch (role) {
    case 'SUPPLIER':
      return 'info' as const;
    case 'MANUFACTURER':
      return 'warning' as const;
    case 'DISTRIBUTOR':
      return 'default' as const;
    case 'CUSTOMER':
      return 'success' as const;
    default:
      return 'outline' as const;
  }
};

const roleLabel = (role: string) => {
  switch (role) {
    case 'SUPPLIER':
      return 'Vendor';
    case 'MANUFACTURER':
      return 'Manufacturer';
    case 'DISTRIBUTOR':
      return 'Distributor';
    case 'CUSTOMER':
      return 'Customer';
    default:
      return role;
  }
};

export const Default: Story = {
  render: () => (
    <AppLayout currentPath="/suppliers">
      <div style={{ maxWidth: 1200 }}>
        {/* Page Header */}
        <div
          style={{
            ...designOutline,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            padding: 4,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A' }}>Suppliers</h1>
          <ArdaButton variant="primary">
            <Plus size={16} />
            Add Supplier
          </ArdaButton>
        </div>

        {/* Toolbar */}
        <div
          style={{
            ...designOutline,
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            alignItems: 'center',
            padding: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              border: '1px solid #E5E5E5',
              borderRadius: 8,
              background: 'white',
              flex: 1,
              maxWidth: 360,
            }}
          >
            <Search size={16} color="#737373" />
            <span style={{ color: '#737373', fontSize: 14 }}>Search suppliers...</span>
          </div>
          <ArdaButton variant="secondary">
            <Filter size={16} />
            Filter
          </ArdaButton>
        </div>

        {/* Suppliers Table */}
        <div style={{ ...designOutline, padding: 4 }}>
          <ArdaTable>
            <ArdaTableHeader>
              <ArdaTableRow>
                <ArdaTableHead>Name</ArdaTableHead>
                <ArdaTableHead>Roles</ArdaTableHead>
                <ArdaTableHead>Contact</ArdaTableHead>
                <ArdaTableHead>Location</ArdaTableHead>
              </ArdaTableRow>
            </ArdaTableHeader>
            <ArdaTableBody>
              {sampleAffiliates.map((aff) => (
                <ArdaTableRow key={aff.entityId}>
                  <ArdaTableCell className="font-semibold">
                    {aff.companyInformation.name}
                  </ArdaTableCell>
                  <ArdaTableCell>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {aff.roles.map((r) => (
                        <ArdaBadge key={r.type} variant={roleVariant(r.type)}>
                          {roleLabel(r.type)}
                        </ArdaBadge>
                      ))}
                    </div>
                  </ArdaTableCell>
                  <ArdaTableCell>
                    {aff.primaryContact ? (
                      <div>
                        <div style={{ fontSize: 14 }}>{aff.primaryContact.name}</div>
                        <div style={{ fontSize: 12, color: '#737373' }}>
                          {aff.primaryContact.email}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#A3A3A3' }}>{'\u2014'}</span>
                    )}
                  </ArdaTableCell>
                  <ArdaTableCell>
                    {aff.address ? (
                      <span style={{ fontSize: 13 }}>
                        {aff.address.city}, {aff.address.state}
                      </span>
                    ) : (
                      <span style={{ color: '#A3A3A3' }}>{'\u2014'}</span>
                    )}
                  </ArdaTableCell>
                </ArdaTableRow>
              ))}
            </ArdaTableBody>
          </ArdaTable>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: '#737373' }}>
          Showing {sampleAffiliates.length} of {sampleAffiliates.length} suppliers
        </div>
      </div>
    </AppLayout>
  ),
};

export const WithAddDrawer: Story = {
  render: () => (
    <AppLayout currentPath="/suppliers">
      <div style={{ maxWidth: 1200 }}>
        {/* Page Header */}
        <div
          style={{
            ...designOutline,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            padding: 4,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A' }}>Suppliers</h1>
          <ArdaButton variant="primary">
            <Plus size={16} />
            Add Supplier
          </ArdaButton>
        </div>

        {/* Toolbar */}
        <div
          style={{
            ...designOutline,
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            alignItems: 'center',
            padding: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              border: '1px solid #E5E5E5',
              borderRadius: 8,
              background: 'white',
              flex: 1,
              maxWidth: 360,
            }}
          >
            <Search size={16} color="#737373" />
            <span style={{ color: '#737373', fontSize: 14 }}>Search suppliers...</span>
          </div>
          <ArdaButton variant="secondary">
            <Filter size={16} />
            Filter
          </ArdaButton>
        </div>

        {/* Suppliers Table */}
        <div style={{ ...designOutline, padding: 4 }}>
          <ArdaTable>
            <ArdaTableHeader>
              <ArdaTableRow>
                <ArdaTableHead>Name</ArdaTableHead>
                <ArdaTableHead>Roles</ArdaTableHead>
                <ArdaTableHead>Contact</ArdaTableHead>
                <ArdaTableHead>Location</ArdaTableHead>
              </ArdaTableRow>
            </ArdaTableHeader>
            <ArdaTableBody>
              {sampleAffiliates.map((aff) => (
                <ArdaTableRow key={aff.entityId}>
                  <ArdaTableCell className="font-semibold">
                    {aff.companyInformation.name}
                  </ArdaTableCell>
                  <ArdaTableCell>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {aff.roles.map((r) => (
                        <ArdaBadge key={r.type} variant={roleVariant(r.type)}>
                          {roleLabel(r.type)}
                        </ArdaBadge>
                      ))}
                    </div>
                  </ArdaTableCell>
                  <ArdaTableCell>
                    {aff.primaryContact ? (
                      <div>
                        <div style={{ fontSize: 14 }}>{aff.primaryContact.name}</div>
                        <div style={{ fontSize: 12, color: '#737373' }}>
                          {aff.primaryContact.email}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#A3A3A3' }}>{'\u2014'}</span>
                    )}
                  </ArdaTableCell>
                  <ArdaTableCell>
                    {aff.address ? (
                      <span style={{ fontSize: 13 }}>
                        {aff.address.city}, {aff.address.state}
                      </span>
                    ) : (
                      <span style={{ color: '#A3A3A3' }}>{'\u2014'}</span>
                    )}
                  </ArdaTableCell>
                </ArdaTableRow>
              ))}
            </ArdaTableBody>
          </ArdaTable>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: '#737373' }}>
          Showing {sampleAffiliates.length} of {sampleAffiliates.length} suppliers
        </div>
      </div>

      {/* Supplier Drawer in Add mode */}
      <ArdaSupplierDrawer open mode="add" onClose={() => {}} />
    </AppLayout>
  ),
};
