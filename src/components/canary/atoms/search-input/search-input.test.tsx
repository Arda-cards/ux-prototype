import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ArdaSearchInput } from './search-input';

describe('ArdaSearchInput', () => {
  it('renders with default placeholder', () => {
    render(<ArdaSearchInput />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<ArdaSearchInput placeholder="Find items..." />);
    expect(screen.getByPlaceholderText('Find items...')).toBeInTheDocument();
  });

  it('has an accessible label matching the placeholder', () => {
    render(<ArdaSearchInput placeholder="Search inventory" />);
    expect(screen.getByLabelText('Search inventory')).toBeInTheDocument();
  });

  it('hides the icon from assistive technology', () => {
    const { container } = render(<ArdaSearchInput />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onChange when text is entered', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ArdaSearchInput onChange={handleChange} />);

    await user.type(screen.getByRole('searchbox'), 'hello');
    expect(handleChange).toHaveBeenCalledWith('h');
    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it('displays a controlled value', () => {
    render(<ArdaSearchInput value="test query" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });
});
