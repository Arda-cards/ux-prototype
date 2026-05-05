import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ButtonGroup, ButtonGroupSeparator } from './button-group';
import { Button } from '../button/button';

describe('ButtonGroup', () => {
  it('renders children with group role', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>Save</Button>
        <Button>Cancel</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'Actions' });
    expect(group).toBeVisible();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('applies horizontal classes by default', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>A</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group');
    expect(group.className).toContain('inline-flex');
    expect(group.className).not.toContain('flex-col');
  });

  it('applies vertical classes when orientation is vertical', () => {
    render(
      <ButtonGroup orientation="vertical" aria-label="Actions">
        <Button>A</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group');
    expect(group.className).toContain('flex-col');
  });

  it('merges custom className', () => {
    render(
      <ButtonGroup className="mt-4" aria-label="Actions">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group').className).toContain('mt-4');
  });
});

describe('ButtonGroupSeparator', () => {
  it('renders with separator role and data-slot', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>A</Button>
        <ButtonGroupSeparator />
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('separator')).toBeVisible();
    expect(screen.getByRole('separator')).toHaveAttribute('data-slot', 'separator');
  });
});
