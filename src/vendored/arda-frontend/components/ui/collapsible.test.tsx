import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';

describe('Collapsible', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Collapsible root with data-slot', () => {
    const { container } = render(<Collapsible />);
    expect(container.querySelector('[data-slot="collapsible"]')).toBeInTheDocument();
  });

  it('renders CollapsibleTrigger with data-slot', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      </Collapsible>
    );
    expect(container.querySelector('[data-slot="collapsible-trigger"]')).toBeInTheDocument();
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('renders CollapsibleContent with data-slot', () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleContent>Content here</CollapsibleContent>
      </Collapsible>
    );
    expect(container.querySelector('[data-slot="collapsible-content"]')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('content is not in DOM when closed by default', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden Content</CollapsibleContent>
      </Collapsible>
    );
    // Radix Collapsible removes content from DOM when closed
    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
  });

  it('content is visible when defaultOpen=true', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Visible Content')).toBeInTheDocument();
  });

  it('toggles content on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Toggled Content</CollapsibleContent>
      </Collapsible>
    );
    // Initially closed — content not in DOM
    expect(screen.queryByText('Toggled Content')).not.toBeInTheDocument();
    // Click to open
    await user.click(screen.getByText('Toggle'));
    expect(screen.getByText('Toggled Content')).toBeInTheDocument();
    // Click to close again
    await user.click(screen.getByText('Toggle'));
    expect(screen.queryByText('Toggled Content')).not.toBeInTheDocument();
  });

  it('accepts controlled open prop', () => {
    const { rerender } = render(
      <Collapsible open={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Controlled Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();

    rerender(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Controlled Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Controlled Content')).toBeInTheDocument();
  });

  it('calls onOpenChange when trigger is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(
      <Collapsible onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    await user.click(screen.getByText('Toggle'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('forwards props to Collapsible root', () => {
    const { container } = render(
      <Collapsible className="custom-class">
        <div>inner</div>
      </Collapsible>
    );
    expect(container.querySelector('[data-slot="collapsible"]')).toHaveClass('custom-class');
  });

  it('renders disabled collapsible', () => {
    render(
      <Collapsible disabled>
        <CollapsibleTrigger>Disabled Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Disabled Toggle')).toBeInTheDocument();
  });
});
