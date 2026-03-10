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

  it('shows card counter in navigation', () => {
    render(
      <ArdaItemDetailsCardPreview
        currentIndex={1}
        totalCards={5}
        onIndexChange={() => {}}
        renderCard={() => <div>Card</div>}
      />,
    );
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  it('navigates to next card', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(
      <ArdaItemDetailsCardPreview
        currentIndex={1}
        totalCards={3}
        onIndexChange={onIndexChange}
        renderCard={() => <div>Card</div>}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Next card' }));
    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first card', () => {
    render(
      <ArdaItemDetailsCardPreview
        currentIndex={1}
        totalCards={3}
        onIndexChange={() => {}}
        renderCard={() => <div>Card</div>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Previous card' })).toBeDisabled();
  });

  it('disables next button on last card', () => {
    render(
      <ArdaItemDetailsCardPreview
        currentIndex={3}
        totalCards={3}
        onIndexChange={() => {}}
        renderCard={() => <div>Card</div>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Next card' })).toBeDisabled();
  });
});
