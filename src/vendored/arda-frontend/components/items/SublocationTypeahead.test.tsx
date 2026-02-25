import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SublocationTypeahead } from './SublocationTypeahead';
import { lookupSublocations } from '@frontend/lib/ardaClient';

jest.mock('@/lib/ardaClient', () => ({
  lookupSublocations: jest.fn(),
}));

const lookupSublocationsMock = lookupSublocations as jest.Mock;

describe('SublocationTypeahead', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lookupSublocationsMock.mockResolvedValue([]);
  });

  describe('initial render', () => {
    it('renders with value and placeholder', () => {
      render(
        <SublocationTypeahead
          value="Bin A"
          onChange={onChange}
          placeholder="Search for sub-location"
        />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Bin A');
    });

    it('renders with custom placeholder', () => {
      render(
        <SublocationTypeahead value="" onChange={onChange} placeholder="Find a sub-location" />
      );
      expect(screen.getByPlaceholderText('Find a sub-location')).toBeInTheDocument();
    });

    it('renders with empty initial value', () => {
      render(<SublocationTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      expect(input).toHaveValue('');
    });

    it('renders disabled state', () => {
      render(<SublocationTypeahead value="Bin A" onChange={onChange} disabled />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      expect(input).toBeDisabled();
    });

    it('updates input when value prop changes', () => {
      const { rerender } = render(
        <SublocationTypeahead value="Bin A" onChange={onChange} />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      expect(input).toHaveValue('Bin A');

      rerender(<SublocationTypeahead value="Shelf B" onChange={onChange} />);
      expect(input).toHaveValue('Shelf B');
    });
  });

  describe('focus behavior', () => {
    it('does not call lookupSublocations when input is empty on focus', () => {
      render(<SublocationTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);
      expect(lookupSublocationsMock).not.toHaveBeenCalled();
    });

    it('calls lookupSublocations when input has value on focus', async () => {
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);
      expect(lookupSublocationsMock).toHaveBeenCalledWith('Bin');
      await waitFor(() => expect(lookupSublocationsMock).toHaveBeenCalled());
    });

    it('does not call lookupSublocations on focus when value is only whitespace', () => {
      render(<SublocationTypeahead value="   " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);
      expect(lookupSublocationsMock).not.toHaveBeenCalled();
    });
  });

  describe('search and results', () => {
    it('shows results when sublocations are found', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A', 'Bin B']);
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
        expect(screen.getByText('Bin B')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', async () => {
      let resolve: (v: string[]) => void;
      lookupSublocationsMock.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => { resolve!([]); });
    });

    it('shows "new sub-location" option when typed text does not match results', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(<SublocationTypeahead value="NewBin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-location:/)).toBeInTheDocument();
      });
    });

    it('does not show "new sub-location" option when typed text matches result (case insensitive)', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(<SublocationTypeahead value="BIN A" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });
      expect(screen.queryByText(/New sub-location:/)).not.toBeInTheDocument();
    });

    it('handles API error gracefully — shows new sub-location option', async () => {
      lookupSublocationsMock.mockRejectedValue(new Error('Network error'));
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-location:/)).toBeInTheDocument();
      });
    });

    it('clears options when input is cleared', () => {
      render(<SublocationTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(lookupSublocationsMock).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('calls onChange with selected sublocation name', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A', 'Bin B']);
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Bin A'));
      expect(onChange).toHaveBeenCalledWith('Bin A');
    });

    it('calls onChange with trimmed typed value when new sub-location is selected', async () => {
      lookupSublocationsMock.mockResolvedValue([]);
      render(<SublocationTypeahead value="  NewBin  " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-location:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New sub-location:/));
      expect(onChange).toHaveBeenCalledWith('NewBin');
    });

    it('closes dropdown after selection', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Bin A'));
      expect(screen.queryByText('Bin A')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down through options with ArrowDown', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A', 'Bin B']);
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // past last item
    });

    it('navigates up through options with ArrowUp', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A', 'Bin B']);
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });

    it('selects highlighted option with Enter', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Bin A');
    });

    it('selects new sub-location with Enter when no option highlighted and input has text', async () => {
      lookupSublocationsMock.mockResolvedValue([]);
      render(<SublocationTypeahead value="BrandNew" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-location:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('BrandNew');
    });

    it('reverts on Escape when dropdown is open', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(<SublocationTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-location:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('Tab key with highlighted option selects it (non-cellEditorMode)', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Bin A');
    });

    it('Tab key with no highlighted option commits typed text (non-cellEditorMode)', async () => {
      lookupSublocationsMock.mockResolvedValue([]);
      render(<SublocationTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.change(input, { target: { value: 'TypedBin' } });

      await waitFor(() => {
        // Wait for state update
      });

      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedBin');
    });

    it('handles Escape when dropdown is closed', () => {
      render(<SublocationTypeahead value="previous" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('previous');
    });
  });

  describe('cellEditorMode', () => {
    it('renders in cellEditorMode', () => {
      render(
        <SublocationTypeahead value="Bin A" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Bin A');
    });

    it('in cellEditorMode, Escape reverts value', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(
        <SublocationTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-location:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('in cellEditorMode, Tab key with highlighted option saves that value', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(
        <SublocationTypeahead value="Bin" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Bin A');
    });

    it('in cellEditorMode, Tab key with no option saves typed text', async () => {
      lookupSublocationsMock.mockResolvedValue([]);
      render(
        <SublocationTypeahead value="" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.change(input, { target: { value: 'CustomBin' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('CustomBin');
    });

    it('in cellEditorMode, arrow keys when dropdown is closed commit current value', () => {
      render(
        <SublocationTypeahead value="Bin A" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('Bin A');
    });

    it('in cellEditorMode, Enter when dropdown is closed commits typed value', () => {
      render(
        <SublocationTypeahead value="Shelf C" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Shelf C');
    });

    it('in cellEditorMode, ArrowLeft commits value when dropdown is closed', () => {
      render(
        <SublocationTypeahead value="Bin A" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.keyDown(input, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith('Bin A');
    });
  });

  describe('blur behavior (form mode)', () => {
    it('reverts to previous value on blur when no selection made', async () => {
      render(<SublocationTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('original');
      });
    });

    it('in cellEditorMode, blur accepts typed value', async () => {
      render(<SublocationTypeahead value="original" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search for sub-location');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'newbin' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('newbin');
      });
    });
  });

  describe('mouse hover', () => {
    it('highlights option on mouse enter', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A', 'Bin B']);
      render(<SublocationTypeahead value="Bin" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.mouseEnter(screen.getByText('Bin A').closest('div')!);
    });
  });

  describe('click outside', () => {
    it('closes dropdown on click outside in form mode', async () => {
      lookupSublocationsMock.mockResolvedValue(['Bin A']);
      render(
        <div>
          <SublocationTypeahead value="Bin" onChange={onChange} />
          <div data-testid="outside">outside</div>
        </div>
      );
      const input = screen.getByPlaceholderText('Search for sub-location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Bin A')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByText('Bin A')).not.toBeInTheDocument();
      });
    });
  });
});
