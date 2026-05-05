import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DropdownMenuItem } from '@/components/canary/primitives/dropdown-menu';
import { SplitButton } from './split-button';

const menuContent = (
  <>
    <DropdownMenuItem>Option A</DropdownMenuItem>
    <DropdownMenuItem>Option B</DropdownMenuItem>
  </>
);

describe('SplitButton', () => {
  it('renders the primary action button and chevron trigger', () => {
    render(
      <SplitButton menuContent={menuContent} onClick={vi.fn()}>
        Add to Order
      </SplitButton>,
    );
    expect(screen.getByRole('button', { name: 'Add to Order' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'More options' })).toBeVisible();
  });

  it('fires onClick on the primary button', () => {
    const onClick = vi.fn();
    render(
      <SplitButton menuContent={menuContent} onClick={onClick}>
        Save
      </SplitButton>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('chevron trigger has dropdown menu attributes', () => {
    render(<SplitButton menuContent={menuContent}>Save</SplitButton>);
    const chevron = screen.getByRole('button', { name: 'More options' });
    expect(chevron).toHaveAttribute('aria-haspopup', 'menu');
    expect(chevron).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
  });

  it('disables both buttons when disabled', () => {
    render(
      <SplitButton menuContent={menuContent} disabled>
        Save
      </SplitButton>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'More options' })).toBeDisabled();
  });

  it('disables both buttons when loading', () => {
    render(
      <SplitButton menuContent={menuContent} loading>
        Save
      </SplitButton>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'More options' })).toBeDisabled();
  });

  it('shows loading text on primary button when loading is a string', () => {
    render(
      <SplitButton menuContent={menuContent} loading="Saving…">
        Save
      </SplitButton>,
    );
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });

  it('uses custom menuLabel for the chevron aria-label', () => {
    render(
      <SplitButton menuContent={menuContent} menuLabel="Order actions">
        Add to Order
      </SplitButton>,
    );
    expect(screen.getByRole('button', { name: 'Order actions' })).toBeVisible();
  });

  it('applies variant classes to both buttons', () => {
    render(
      <SplitButton menuContent={menuContent} variant="destructive">
        Delete
      </SplitButton>,
    );
    const primary = screen.getByRole('button', { name: 'Delete' });
    const chevron = screen.getByRole('button', { name: 'More options' });
    expect(primary.className).toContain('bg-destructive');
    expect(chevron.className).toContain('bg-destructive');
  });
});
