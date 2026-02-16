import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { FieldLabel } from './field-label';

describe('FieldLabel', () => {
  it('renders children without wrapper when no label is provided', () => {
    const { container } = render(
      <FieldLabel>
        <span data-testid="child">Content</span>
      </FieldLabel>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    // No wrapping div or label element
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('renders label on top when labelPosition is "top"', () => {
    render(
      <FieldLabel label="Name" labelPosition="top">
        <span data-testid="child">Content</span>
      </FieldLabel>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    // The wrapper should use flex-col for top layout
    const wrapper = screen.getByText('Name').closest('div');
    expect(wrapper).toHaveClass('flex-col');
  });

  it('renders label on the left by default', () => {
    render(
      <FieldLabel label="Name">
        <span data-testid="child">Content</span>
      </FieldLabel>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    // The wrapper should use items-start for left layout
    const wrapper = screen.getByText('Name').closest('div');
    expect(wrapper).toHaveClass('items-start');
  });

  it('renders label on the left when labelPosition is "left"', () => {
    render(
      <FieldLabel label="Name" labelPosition="left">
        <span data-testid="child">Content</span>
      </FieldLabel>,
    );
    const label = screen.getByText('Name');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveClass('w-[120px]');
  });
});
