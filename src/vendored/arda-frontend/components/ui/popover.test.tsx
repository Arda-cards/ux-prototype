import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './popover';

describe('Popover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Popover with trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('Popover trigger has data-slot="popover-trigger"', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-trigger"]')).toBeInTheDocument();
  });

  it('Popover root renders trigger child', () => {
    render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
      </Popover>
    );
    // Radix Root is a context provider — no DOM element; trigger should be there
    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('content is not visible by default', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    );
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument();
  });

  it('shows content after trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('PopoverContent has data-slot="popover-content"', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    const content = document.querySelector('[data-slot="popover-content"]');
    expect(content).toBeInTheDocument();
  });

  it('PopoverContent merges className', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-content">Content</PopoverContent>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    const content = document.querySelector('[data-slot="popover-content"]');
    expect(content).toHaveClass('custom-content');
  });

  it('PopoverContent accepts custom align prop', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent align="start">Content</PopoverContent>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('PopoverContent accepts custom sideOffset prop', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent sideOffset={10}>Content</PopoverContent>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders PopoverAnchor with data-slot', () => {
    const { container } = render(
      <Popover>
        <PopoverAnchor>
          <div>Anchor</div>
        </PopoverAnchor>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-anchor"]')).toBeInTheDocument();
  });

  it('renders controlled popover open', () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Always visible</PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Always visible')).toBeInTheDocument();
  });

  it('closes popover when trigger is clicked again', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Toggle</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    await user.click(screen.getByText('Toggle'));
    expect(screen.getByText('Content')).toBeInTheDocument();
    await user.click(screen.getByText('Toggle'));
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
