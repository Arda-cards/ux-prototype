import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ArdaItemDetailsCardPreview } from './item-details-card-preview';

describe('ArdaItemDetailsCardPreview', () => {
  it('shows loading state', () => {
    render(
      <ArdaItemDetailsCardPreview
        currentIndex={1}
        totalCards={0}
        onIndexChange={() => {}}
        loading
      />,
    );
    expect(screen.getByText('Loading cards')).toBeInTheDocument();
  });

  it('shows empty state when no cards', () => {
    render(<ArdaItemDetailsCardPreview currentIndex={1} totalCards={0} onIndexChange={() => {}} />);
    expect(screen.getByText('No cards yet')).toBeInTheDocument();
  });

  it('renders card via renderCard prop', () => {
    render(
      <ArdaItemDetailsCardPreview
        currentIndex={1}
        totalCards={3}
        onIndexChange={() => {}}
        renderCard={(i) => <div>Card {i}</div>}
      />,
    );
    expect(screen.getByText('Card 1')).toBeInTheDocument();
  });

  it('navigates to a different card on click', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(
      <ArdaItemDetailsCardPreview
        currentIndex={1}
        totalCards={3}
        onIndexChange={onIndexChange}
        renderCard={(i) => <div>Card {i}</div>}
      />,
    );
    // Click on card 2 (inactive card)
    await user.click(screen.getByRole('button', { name: 'Go to card 2' }));
    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it('renders children slot', () => {
    render(
      <ArdaItemDetailsCardPreview
        currentIndex={1}
        totalCards={1}
        onIndexChange={() => {}}
        renderCard={() => <div>Card</div>}
      >
        <div>Actions here</div>
      </ArdaItemDetailsCardPreview>,
    );
    expect(screen.getByText('Actions here')).toBeInTheDocument();
  });
});
