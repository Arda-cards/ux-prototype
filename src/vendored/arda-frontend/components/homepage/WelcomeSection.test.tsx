/**
 * Unit tests for src/components/homepage/WelcomeSection.tsx
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock next/navigation (Link etc are not directly used but dependencies may use router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
}));

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock lucide-react icons (avoid SVG render issues in jsdom)
jest.mock('lucide-react', () => ({
  Plus: () => <svg data-testid='icon-plus' />,
  Users: () => <svg data-testid='icon-users' />,
}));

// Mock react-icons
jest.mock('react-icons/lu', () => ({
  LuFileUp: () => <svg data-testid='icon-file-up' />,
}));

// Mock CardButton
jest.mock('@/components/common/ CardButton', () => ({
  CardButton: ({ label }: { label: string }) => <button>{label}</button>,
}));

import { WelcomeSection } from './WelcomeSection';

describe('WelcomeSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the greeting with user name when user is present', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Alice' } });
    render(<WelcomeSection />);
    expect(screen.getByText(/Good Morning, Alice\./i)).toBeInTheDocument();
  });

  it('renders greeting with "There" when user has no name', () => {
    mockUseAuth.mockReturnValue({ user: { name: undefined } });
    render(<WelcomeSection />);
    expect(screen.getByText(/Good Morning, There\./i)).toBeInTheDocument();
  });

  it('renders greeting with "There" when user is null', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<WelcomeSection />);
    expect(screen.getByText(/Good Morning, There\./i)).toBeInTheDocument();
  });

  it('renders the descriptive paragraph', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Bob' } });
    render(<WelcomeSection />);
    expect(
      screen.getByText(/Create a new item, start exploring tutorials, or upload your inventory list!/i)
    ).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Carol' } });
    render(<WelcomeSection />);
    expect(screen.getByText('Create and Print Cards')).toBeInTheDocument();
    expect(screen.getByText('Upload Inventory List')).toBeInTheDocument();
    expect(screen.getByText('Invite Your Team')).toBeInTheDocument();
  });
});
