import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { NotificationsSection } from './NotificationsSection';

describe('NotificationsSection', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
  });

  describe('production environment', () => {
    it('returns null in production', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      const { container } = render(<NotificationsSection />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('non-production environment', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGING';
    });

    it('renders notifications heading', () => {
      render(<NotificationsSection />);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('renders messages section', () => {
      render(<NotificationsSection />);
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    it('renders all message notification options', () => {
      render(<NotificationsSection />);
      expect(screen.getByLabelText('All new messages')).toBeInTheDocument();
      expect(screen.getByLabelText('Direct messages')).toBeInTheDocument();
      expect(screen.getByLabelText('Nothing')).toBeInTheDocument();
    });

    it('renders email notifications section', () => {
      render(<NotificationsSection />);
      expect(screen.getByText('Email notifications')).toBeInTheDocument();
    });

    it('renders all email notification types', () => {
      render(<NotificationsSection />);
      expect(screen.getByText('Communication emails')).toBeInTheDocument();
      expect(screen.getByText('Marketing emails')).toBeInTheDocument();
      expect(screen.getByText('Security emails')).toBeInTheDocument();
    });

    it('renders update notifications button', () => {
      render(<NotificationsSection />);
      expect(screen.getByRole('button', { name: /update notifications/i })).toBeInTheDocument();
    });

    it('defaults all-new-messages radio to checked', () => {
      render(<NotificationsSection />);
      expect(screen.getByLabelText('All new messages')).toBeChecked();
    });
  });
});
