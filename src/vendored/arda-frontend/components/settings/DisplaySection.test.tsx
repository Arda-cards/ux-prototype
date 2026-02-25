import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockSetItemVisibility = jest.fn();
const mockVisibility = {
  dashboard: true,
  items: true,
  orderQueue: false,
  receiving: true,
};

jest.mock('@/store/hooks/useSidebarVisibility', () => ({
  useSidebarVisibility: jest.fn(),
}));

import { DisplaySection } from './DisplaySection';
import { useSidebarVisibility } from '@frontend/store/hooks/useSidebarVisibility';

const mockUseSidebarVisibility = useSidebarVisibility as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSidebarVisibility.mockReturnValue({
    visibility: { ...mockVisibility },
    setItemVisibility: mockSetItemVisibility,
  });
});

describe('DisplaySection', () => {
  it('renders display heading', () => {
    render(<DisplaySection />);
    expect(screen.getByText('Display')).toBeInTheDocument();
  });

  it('renders sidebar section', () => {
    render(<DisplaySection />);
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('renders Items, Order Queue, Receiving checkboxes', () => {
    render(<DisplaySection />);
    expect(screen.getByLabelText('Items')).toBeInTheDocument();
    expect(screen.getByLabelText('Order Queue')).toBeInTheDocument();
    expect(screen.getByLabelText('Receiving')).toBeInTheDocument();
  });

  it('renders update display button', () => {
    render(<DisplaySection />);
    expect(screen.getByRole('button', { name: /update display/i })).toBeInTheDocument();
  });

  it('reflects initial visibility state in checkboxes', () => {
    render(<DisplaySection />);
    // items is true, orderQueue is false
    const itemsCheckbox = screen.getByLabelText('Items');
    expect(itemsCheckbox).toBeChecked();
  });

  it('calls setItemVisibility for each item when update button clicked', () => {
    render(<DisplaySection />);
    const updateButton = screen.getByRole('button', { name: /update display/i });
    fireEvent.click(updateButton);

    expect(mockSetItemVisibility).toHaveBeenCalledWith('items', expect.any(Boolean));
    expect(mockSetItemVisibility).toHaveBeenCalledWith('orderQueue', expect.any(Boolean));
    expect(mockSetItemVisibility).toHaveBeenCalledWith('receiving', expect.any(Boolean));
  });

  describe('production environment - dashboard checkbox', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;
    });

    afterEach(() => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
    });

    it('does not render dashboard checkbox in production', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      render(<DisplaySection />);
      expect(screen.queryByLabelText('Dashboard')).not.toBeInTheDocument();
    });

    it('renders dashboard checkbox in non-production', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGING';
      render(<DisplaySection />);
      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    });

    it('does not show Getting started section in production', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      render(<DisplaySection />);
      expect(screen.queryByText('Getting started')).not.toBeInTheDocument();
    });

    it('shows Getting started section in non-production', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGING';
      render(<DisplaySection />);
      expect(screen.getByText('Getting started')).toBeInTheDocument();
    });
  });
});
