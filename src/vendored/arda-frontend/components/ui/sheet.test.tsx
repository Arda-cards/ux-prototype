import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './sheet';

describe('Sheet', () => {
  it('renders trigger button', () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
      </Sheet>
    );
    expect(screen.getByRole('button', { name: 'Open Sheet' })).toBeInTheDocument();
  });

  it('opens sheet content on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
          <div>Sheet body</div>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByRole('button', { name: 'Open Sheet' }));
    expect(await screen.findByText('Sheet body')).toBeInTheDocument();
  });

  it('renders sheet header with title', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Open</button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>My Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('My Title')).toBeInTheDocument();
  });

  it('renders sheet description', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Open</button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>A description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('A description')).toBeInTheDocument();
  });

  it('closes on close button click', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Open</button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
          <div>Content here</div>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Content here')).toBeInTheDocument();
    // The close button has sr-only text "Close"
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByText('Content here')).not.toBeInTheDocument();
    });
  });

  it('applies side variant', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Open</button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
          <div>Left content</div>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const content = await screen.findByText('Left content');
    const sheetContent = content.closest('[data-slot="sheet-content"]');
    expect(sheetContent).toBeInTheDocument();
    // Left side variant applies left-0 class
    expect(sheetContent?.className).toContain('left-0');
  });
});
