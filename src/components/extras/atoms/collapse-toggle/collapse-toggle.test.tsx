import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ArdaCollapseToggle } from './collapse-toggle';

describe('ArdaCollapseToggle', () => {
  it('renders with aria-expanded=true when not collapsed', () => {
    render(<ArdaCollapseToggle collapsed={false} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAccessibleName('Collapse');
  });

  it('renders with aria-expanded=false when collapsed', () => {
    render(<ArdaCollapseToggle collapsed={true} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAccessibleName('Expand');
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ArdaCollapseToggle collapsed={false} onToggle={onToggle} />);
    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('uses custom labels', () => {
    render(
      <ArdaCollapseToggle
        collapsed={false}
        expandedLabel="Hide panel"
        collapsedLabel="Show panel"
      />,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Hide panel');
  });

  it('applies className prop', () => {
    render(<ArdaCollapseToggle collapsed={false} className="my-custom" />);
    expect(screen.getByRole('button')).toHaveClass('my-custom');
  });
});
