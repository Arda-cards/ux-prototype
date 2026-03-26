import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('AvatarFallback — entityName prop', () => {
  it('renders initials from entityName prop ("Hex Bolt" → "HB")', () => {
    render(
      <Avatar>
        <AvatarFallback entityName="Hex Bolt" />
      </Avatar>,
    );
    expect(screen.getByText('HB')).toBeInTheDocument();
  });

  it('renders fallback icon for empty name ("" → "?")', () => {
    render(
      <Avatar>
        <AvatarFallback entityName="" />
      </Avatar>,
    );
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('existing children still render (regression)', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('image load error shows fallback', () => {
    render(
      <Avatar>
        <AvatarImage src="/broken.png" alt="Broken" />
        <AvatarFallback entityName="John Doe" />
      </Avatar>,
    );
    // Radix AvatarFallback is always mounted in the DOM; it becomes visible when image fails
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
