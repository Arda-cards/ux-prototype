import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaBooleanFieldDisplay } from './boolean-field-display';
import { ArdaBooleanFieldEditor } from './boolean-field-editor';
import { ArdaBooleanFieldInteractive } from './boolean-field-interactive';

describe('ArdaBooleanFieldDisplay', () => {
  describe('checkbox format', () => {
    it('renders check icon for true', () => {
      const { container } = render(
        <ArdaBooleanFieldDisplay value={true} displayFormat="checkbox" />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders cross icon for false', () => {
      const { container } = render(
        <ArdaBooleanFieldDisplay value={false} displayFormat="checkbox" />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders dash for undefined', () => {
      render(<ArdaBooleanFieldDisplay value={undefined} displayFormat="checkbox" />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  it('renders with label on the left', () => {
    const { container } = render(
      <ArdaBooleanFieldDisplay
        value={true}
        displayFormat="checkbox"
        label="Active"
        labelPosition="left"
      />,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(
      <ArdaBooleanFieldDisplay
        value={true}
        displayFormat="checkbox"
        label="Active"
        labelPosition="top"
      />,
    );
    const label = screen.getByText('Active');
    expect(label.closest('div')).toHaveClass('flex-col');
  });

  describe('yes-no format', () => {
    it('renders "Yes" for true', () => {
      render(<ArdaBooleanFieldDisplay value={true} displayFormat="yes-no" />);
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('renders "No" for false', () => {
      render(<ArdaBooleanFieldDisplay value={false} displayFormat="yes-no" />);
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('renders dash for undefined', () => {
      render(<ArdaBooleanFieldDisplay value={undefined} displayFormat="yes-no" />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});

describe('ArdaBooleanFieldEditor', () => {
  describe('checkbox format', () => {
    it('renders with initial value', () => {
      render(<ArdaBooleanFieldEditor value={true} displayFormat="checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('calls onChange on input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ArdaBooleanFieldEditor value={false} displayFormat="checkbox" onChange={onChange} />);
      await user.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onComplete on Enter', async () => {
      const onComplete = vi.fn();
      render(
        <ArdaBooleanFieldEditor value={true} displayFormat="checkbox" onComplete={onComplete} />,
      );
      const checkbox = screen.getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: 'Enter' });
      expect(onComplete).toHaveBeenCalledWith(true);
    });

    it('calls onCancel on Escape', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<ArdaBooleanFieldEditor value={true} displayFormat="checkbox" onCancel={onCancel} />);
      await user.type(screen.getByRole('checkbox'), '{Escape}');
      expect(onCancel).toHaveBeenCalled();
    });

    it('auto-focuses when autoFocus is true', () => {
      render(<ArdaBooleanFieldEditor value={true} displayFormat="checkbox" autoFocus />);
      expect(screen.getByRole('checkbox')).toHaveFocus();
    });

    it('is disabled when disabled prop is set', () => {
      render(<ArdaBooleanFieldEditor value={true} displayFormat="checkbox" disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });

  it('renders with label', () => {
    render(<ArdaBooleanFieldEditor value={true} displayFormat="checkbox" label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  describe('yes-no format', () => {
    it('renders toggle buttons', () => {
      render(<ArdaBooleanFieldEditor value={true} displayFormat="yes-no" />);
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    });

    it('highlights correct button based on value', () => {
      const { unmount } = render(<ArdaBooleanFieldEditor value={true} displayFormat="yes-no" />);
      const yesButton = screen.getByRole('button', { name: 'Yes' });
      expect(yesButton.className).toContain('bg-primary');
      unmount();

      render(<ArdaBooleanFieldEditor value={false} displayFormat="yes-no" />);
      const noButton = screen.getByRole('button', { name: 'No' });
      expect(noButton.className).toContain('bg-primary');
    });

    it('calls onChange and onComplete when button is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(
        <ArdaBooleanFieldEditor
          value={false}
          displayFormat="yes-no"
          onChange={onChange}
          onComplete={onComplete}
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Yes' }));
      expect(onChange).toHaveBeenCalledWith(true);
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });
});

describe('ArdaBooleanFieldInteractive', () => {
  it('starts in display mode', () => {
    render(<ArdaBooleanFieldInteractive value={true} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('switches to edit mode on double-click', async () => {
    const user = userEvent.setup();
    const { container } = render(<ArdaBooleanFieldInteractive value={true} />);
    const display = container.querySelector('div > div') as HTMLElement;
    await user.dblClick(display);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('commits value on Enter and returns to display', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <ArdaBooleanFieldInteractive value={true} onValueChange={onValueChange} />,
    );
    const display = container.querySelector('div > div') as HTMLElement;
    await user.dblClick(display);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    fireEvent.keyDown(checkbox, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(<ArdaBooleanFieldInteractive value={true} disabled />);
    const display = container.querySelector('div > div') as HTMLElement;
    await user.dblClick(display);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
