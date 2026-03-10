import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  ArdaDrawer,
  ArdaDrawerHeader,
  ArdaDrawerTitle,
  ArdaDrawerDescription,
  ArdaDrawerBody,
  ArdaDrawerFooter,
} from './drawer';

describe('ArdaDrawer', () => {
  it('renders content when open', () => {
    render(
      <ArdaDrawer open onOpenChange={() => {}}>
        <ArdaDrawerHeader>
          <ArdaDrawerTitle>Test Title</ArdaDrawerTitle>
        </ArdaDrawerHeader>
        <ArdaDrawerBody>
          <p>Body content</p>
        </ArdaDrawerBody>
      </ArdaDrawer>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <ArdaDrawer open={false} onOpenChange={() => {}}>
        <ArdaDrawerHeader>
          <ArdaDrawerTitle>Hidden</ArdaDrawerTitle>
        </ArdaDrawerHeader>
      </ArdaDrawer>,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders accessible description', () => {
    render(
      <ArdaDrawer open onOpenChange={() => {}}>
        <ArdaDrawerHeader>
          <ArdaDrawerTitle>Title</ArdaDrawerTitle>
          <ArdaDrawerDescription>Helpful description</ArdaDrawerDescription>
        </ArdaDrawerHeader>
      </ArdaDrawer>,
    );
    expect(screen.getByText('Helpful description')).toBeInTheDocument();
  });

  it('renders footer content', () => {
    render(
      <ArdaDrawer open onOpenChange={() => {}}>
        <ArdaDrawerHeader>
          <ArdaDrawerTitle>Title</ArdaDrawerTitle>
        </ArdaDrawerHeader>
        <ArdaDrawerFooter>
          <button>Done</button>
        </ArdaDrawerFooter>
      </ArdaDrawer>,
    );
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('calls onOpenChange when closing', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ArdaDrawer open onOpenChange={onOpenChange}>
        <ArdaDrawerHeader>
          <ArdaDrawerTitle>Title</ArdaDrawerTitle>
        </ArdaDrawerHeader>
      </ArdaDrawer>,
    );
    // Pressing Escape should trigger onOpenChange
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
