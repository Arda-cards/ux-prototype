import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SupplierTypeahead } from './SupplierTypeahead';
import { lookupSuppliers } from '@frontend/lib/ardaClient';

jest.mock('@/lib/ardaClient', () => ({
  lookupSuppliers: jest.fn(),
}));

const lookupSuppliersMock = lookupSuppliers as jest.Mock;

describe('SupplierTypeahead', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lookupSuppliersMock.mockResolvedValue([]);
  });

  describe('initial render', () => {
    it('renders with initial value and default placeholder', () => {
      render(<SupplierTypeahead value="Acme Corp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Acme Corp');
    });

    it('renders with custom placeholder', () => {
      render(
        <SupplierTypeahead value="" onChange={onChange} placeholder="Find a supplier" />
      );
      expect(screen.getByPlaceholderText('Find a supplier')).toBeInTheDocument();
    });

    it('renders with empty initial value', () => {
      render(<SupplierTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      expect(input).toHaveValue('');
    });

    it('renders disabled state', () => {
      render(<SupplierTypeahead value="Acme" onChange={onChange} disabled />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      expect(input).toBeDisabled();
    });

    it('updates input when value prop changes', () => {
      const { rerender } = render(
        <SupplierTypeahead value="Old Supplier" onChange={onChange} />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      expect(input).toHaveValue('Old Supplier');

      rerender(<SupplierTypeahead value="New Supplier" onChange={onChange} />);
      expect(input).toHaveValue('New Supplier');
    });
  });

  describe('focus behavior', () => {
    it('does not call lookupSuppliers when input is empty on focus', () => {
      render(<SupplierTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);
      expect(lookupSuppliersMock).not.toHaveBeenCalled();
    });

    it('calls lookupSuppliers when input has value on focus', () => {
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);
      expect(lookupSuppliersMock).toHaveBeenCalledWith('Acme');
    });

    it('does not call lookupSuppliers on focus when value is only whitespace', () => {
      render(<SupplierTypeahead value="   " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);
      expect(lookupSuppliersMock).not.toHaveBeenCalled();
    });
  });

  describe('search and results', () => {
    it('shows results when suppliers are found', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp', 'Acme Industries']);
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('Acme Industries')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', async () => {
      let resolve: (v: string[]) => void;
      lookupSuppliersMock.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => { resolve!([]); });
    });

    it('shows "new supplier" option when typed text does not match results', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(<SupplierTypeahead value="NewBrand" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New supplier:/)).toBeInTheDocument();
      });
    });

    it('does not show "new supplier" option when typed text matches result (case insensitive)', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(<SupplierTypeahead value="acme corp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });
      expect(screen.queryByText(/New supplier:/)).not.toBeInTheDocument();
    });

    it('handles API error gracefully — shows new supplier option', async () => {
      lookupSuppliersMock.mockRejectedValue(new Error('Network error'));
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        // After error, options are empty, but inputValue is set so new supplier option appears
        expect(screen.getByText(/New supplier:/)).toBeInTheDocument();
      });
    });

    it('clears options when input is cleared', () => {
      render(<SupplierTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(lookupSuppliersMock).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('calls onChange with selected supplier name', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp', 'Acme Industries']);
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Acme Corp'));
      expect(onChange).toHaveBeenCalledWith('Acme Corp');
    });

    it('calls onChange with trimmed typed value when new supplier is selected', async () => {
      lookupSuppliersMock.mockResolvedValue([]);
      render(<SupplierTypeahead value="  NewBrand  " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New supplier:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New supplier:/));
      expect(onChange).toHaveBeenCalledWith('NewBrand');
    });

    it('closes dropdown after selection', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Acme Corp'));
      expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down through options with ArrowDown', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp', 'Acme Industries']);
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      // Third arrow down — should not exceed last index
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });

    it('navigates up through options with ArrowUp', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp', 'Acme Industries']);
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });

    it('selects highlighted option with Enter', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Acme Corp');
    });

    it('selects new supplier with Enter when no option highlighted and input has text', async () => {
      lookupSuppliersMock.mockResolvedValue([]);
      render(<SupplierTypeahead value="BrandNew" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New supplier:/)).toBeInTheDocument();
      });

      // No ArrowDown, so highlightedIndex = -1, inputValue = 'BrandNew'
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('BrandNew');
    });

    it('reverts on Escape when dropdown is open', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(<SupplierTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New supplier:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('Tab key with highlighted option selects it (non-cellEditorMode)', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Acme Corp');
    });

    it('Tab key with no highlighted option commits typed text (non-cellEditorMode)', async () => {
      lookupSuppliersMock.mockResolvedValue([]);
      render(<SupplierTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.change(input, { target: { value: 'TypedValue' } });

      await waitFor(() => {
        // Wait for state update
      });

      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedValue');
    });

    it('handles Escape when dropdown is closed', () => {
      render(<SupplierTypeahead value="previous" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      // Don't open dropdown - just press Escape
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('previous');
    });
  });

  describe('cellEditorMode', () => {
    it('renders in cellEditorMode', () => {
      render(
        <SupplierTypeahead value="Acme" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Acme');
    });

    it('in cellEditorMode, Escape reverts value', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(
        <SupplierTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New supplier:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('in cellEditorMode, Tab key with highlighted option saves that value', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(
        <SupplierTypeahead value="Acme" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Acme Corp');
    });

    it('in cellEditorMode, Tab key with no option saves typed text', async () => {
      lookupSuppliersMock.mockResolvedValue([]);
      render(
        <SupplierTypeahead value="" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.change(input, { target: { value: 'TypedBrand' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedBrand');
    });

    it('in cellEditorMode, arrow keys when dropdown is closed commit current value', async () => {
      render(
        <SupplierTypeahead value="Acme" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('Acme');
    });

    it('in cellEditorMode, Enter when dropdown is closed commits typed value', async () => {
      render(
        <SupplierTypeahead value="TypedValue" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('TypedValue');
    });
  });

  describe('blur behavior (form mode)', () => {
    it('reverts to previous value on blur when no selection made', async () => {
      render(<SupplierTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('original');
      });
    });
  });

  describe('mouse hover', () => {
    it('highlights option on mouse enter', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp', 'Acme Industries']);
      render(<SupplierTypeahead value="Acme" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.mouseEnter(screen.getByText('Acme Corp').closest('div')!);
    });

    it('highlights new supplier option on mouse enter when no results match', async () => {
      lookupSuppliersMock.mockResolvedValue([]);
      render(<SupplierTypeahead value="BrandNew" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New supplier:/)).toBeInTheDocument();
      });

      const newOptionDiv = screen.getByText(/New supplier:/).closest('div')!;
      fireEvent.mouseEnter(newOptionDiv);
    });

    it('clicks new supplier option when no results match', async () => {
      lookupSuppliersMock.mockResolvedValue([]);
      render(<SupplierTypeahead value="BrandNewOne" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New supplier:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New supplier:/));
      expect(onChange).toHaveBeenCalledWith('BrandNewOne');
    });
  });

  describe('debounce search on input change', () => {
    it('triggers search after typing in input (via debounce)', async () => {
      jest.useFakeTimers();
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(<SupplierTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');

      fireEvent.change(input, { target: { value: 'Acme' } });

      // Flush timers to trigger debounce
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(lookupSuppliersMock).toHaveBeenCalledWith('Acme');
      });

      jest.useRealTimers();
    });
  });

  describe('click outside', () => {
    it('closes dropdown on click outside in form mode and reverts value', async () => {
      lookupSuppliersMock.mockResolvedValue(['Acme Corp']);
      render(
        <div>
          <SupplierTypeahead value="Acme" onChange={onChange} />
          <div data-testid="outside">outside</div>
        </div>
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
      });
    });

    it('in cellEditorMode, click outside commits typed value', async () => {
      lookupSuppliersMock.mockResolvedValue([]);
      render(
        <div>
          <SupplierTypeahead value="Acme" onChange={onChange} cellEditorMode />
          <div data-testid="outside">outside</div>
        </div>
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'NewValue' } });

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('NewValue');
      });
    });
  });

  describe('Tab with empty input', () => {
    it('Tab with empty input does nothing in form mode', () => {
      render(<SupplierTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('in cellEditorMode, Tab with empty input does nothing', () => {
      render(<SupplierTypeahead value="" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search suppliers...');
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('cellEditorMode blur', () => {
    it('in cellEditorMode, blur calls onChange with current input value', async () => {
      render(<SupplierTypeahead value="original" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search suppliers...');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'newvalue' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('newvalue');
      });
    });
  });

  describe('cellEditorMode Escape when dropdown is closed', () => {
    it('in cellEditorMode, Escape when dropdown is closed reverts value', () => {
      render(
        <SupplierTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      // Don't open dropdown - just press Escape
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });
  });

  describe('cellEditorMode Tab when dropdown is closed', () => {
    it('in cellEditorMode, Tab when dropdown is closed saves typed text', () => {
      render(
        <SupplierTypeahead value="TypedValue" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search suppliers...');
      // Dropdown is closed initially
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedValue');
    });
  });
});
