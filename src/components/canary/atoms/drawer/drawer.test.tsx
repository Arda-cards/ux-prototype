import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from './drawer';

describe('Drawer', () => {
  it('renders content when open', () => {
    render(
      <Drawer open onOpenChange={() => {}}>
        <DrawerHeader>
          <DrawerTitle>Test Title</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <p>Body content</p>
        </DrawerBody>
      </Drawer>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <Drawer open={false} onOpenChange={() => {}}>
        <DrawerHeader>
          <DrawerTitle>Hidden</DrawerTitle>
        </DrawerHeader>
      </Drawer>,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders accessible description', () => {
    render(
      <Drawer open onOpenChange={() => {}}>
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Helpful description</DrawerDescription>
        </DrawerHeader>
      </Drawer>,
    );
    expect(screen.getByText('Helpful description')).toBeInTheDocument();
  });

  it('renders footer content', () => {
    render(
      <Drawer open onOpenChange={() => {}}>
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <button>Done</button>
        </DrawerFooter>
      </Drawer>,
    );
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('calls onOpenChange when closing', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange}>
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerHeader>
      </Drawer>,
    );
    // Pressing Escape should trigger onOpenChange
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
