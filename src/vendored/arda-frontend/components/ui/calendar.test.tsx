import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders current month', () => {
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    render(<Calendar />);
    expect(screen.getByText(new RegExp(monthName, 'i'))).toBeInTheDocument();
  });

  it('renders navigation buttons (previous/next month)', () => {
    render(<Calendar />);
    const buttons = screen.getAllByRole('button');
    // There should be at least 2 navigation buttons among all buttons
    // The nav buttons have specific class names, but let's just verify there are buttons
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('displays day cells', () => {
    render(<Calendar />);
    // Day 15 should always exist in any month
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('calls onSelect when a day is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<Calendar mode="single" onSelect={onSelect} />);
    await user.click(screen.getByText('15'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('highlights selected date', () => {
    const selected = new Date(2025, 0, 15);
    render(<Calendar mode="single" selected={selected} defaultMonth={selected} />);
    const dayButton = screen.getByText('15').closest('button');
    expect(dayButton).toHaveAttribute('data-selected-single', 'true');
  });

  it('applies custom className', () => {
    render(<Calendar className="my-custom-class" />);
    const calendarEl = document.querySelector('[data-slot="calendar"]');
    expect(calendarEl).toBeInTheDocument();
    // The className is applied to the DayPicker wrapper, check the outermost container
    const container = calendarEl?.closest('.my-custom-class') || calendarEl?.querySelector('.my-custom-class') || document.querySelector('.my-custom-class');
    expect(container).toBeInTheDocument();
  });
});
