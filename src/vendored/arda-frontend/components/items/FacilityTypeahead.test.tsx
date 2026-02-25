import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FacilityTypeahead } from './FacilityTypeahead';
import { lookupFacilities } from '@frontend/lib/ardaClient';

jest.mock('@/lib/ardaClient', () => ({
  lookupFacilities: jest.fn(),
}));

const lookupFacilitiesMock = lookupFacilities as jest.Mock;

describe('FacilityTypeahead', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lookupFacilitiesMock.mockResolvedValue([]);
  });

  describe('initial render', () => {
    it('renders with value and placeholder', () => {
      render(
        <FacilityTypeahead
          value="Hospital"
          onChange={onChange}
          placeholder="Search for facility"
        />
      );
      const input = screen.getByPlaceholderText('Search for facility');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Hospital');
    });

    it('renders with custom placeholder', () => {
      render(
        <FacilityTypeahead value="" onChange={onChange} placeholder="Find a facility" />
      );
      expect(screen.getByPlaceholderText('Find a facility')).toBeInTheDocument();
    });

    it('renders with empty initial value', () => {
      render(<FacilityTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      expect(input).toHaveValue('');
    });

    it('renders disabled state', () => {
      render(<FacilityTypeahead value="Hospital" onChange={onChange} disabled />);
      const input = screen.getByPlaceholderText('Search for facility');
      expect(input).toBeDisabled();
    });

    it('updates input when value prop changes', () => {
      const { rerender } = render(
        <FacilityTypeahead value="Hospital A" onChange={onChange} />
      );
      const input = screen.getByPlaceholderText('Search for facility');
      expect(input).toHaveValue('Hospital A');

      rerender(<FacilityTypeahead value="Hospital B" onChange={onChange} />);
      expect(input).toHaveValue('Hospital B');
    });
  });

  describe('focus behavior', () => {
    it('does not call lookupFacilities when input is empty on focus', () => {
      render(<FacilityTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);
      expect(lookupFacilitiesMock).not.toHaveBeenCalled();
    });

    it('calls lookupFacilities when input has value on focus', async () => {
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);
      expect(lookupFacilitiesMock).toHaveBeenCalledWith('Hosp');
    });

    it('does not call lookupFacilities on focus when value is only whitespace', () => {
      render(<FacilityTypeahead value="   " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);
      expect(lookupFacilitiesMock).not.toHaveBeenCalled();
    });
  });

  describe('search and results', () => {
    it('shows results when facilities are found', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A', 'Hospital B']);
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
        expect(screen.getByText('Hospital B')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', async () => {
      let resolve: (v: string[]) => void;
      lookupFacilitiesMock.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => { resolve!([]); });
    });

    it('shows "new facility" option when typed text does not match results', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A']);
      render(<FacilityTypeahead value="NewFacility" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New facility:/)).toBeInTheDocument();
      });
    });

    it('does not show "new facility" option when typed text matches result (case insensitive)', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A']);
      render(<FacilityTypeahead value="hospital a" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });
      expect(screen.queryByText(/New facility:/)).not.toBeInTheDocument();
    });

    it('handles API error gracefully — shows new facility option', async () => {
      lookupFacilitiesMock.mockRejectedValue(new Error('Network error'));
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New facility:/)).toBeInTheDocument();
      });
    });

    it('clears options when input is cleared', () => {
      render(<FacilityTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(lookupFacilitiesMock).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('calls onChange with selected facility name', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A', 'Hospital B']);
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Hospital A'));
      expect(onChange).toHaveBeenCalledWith('Hospital A');
    });

    it('calls onChange with trimmed typed value when new facility is selected', async () => {
      lookupFacilitiesMock.mockResolvedValue([]);
      render(<FacilityTypeahead value="  NewFacility  " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New facility:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New facility:/));
      expect(onChange).toHaveBeenCalledWith('NewFacility');
    });

    it('closes dropdown after selection', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A']);
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Hospital A'));
      expect(screen.queryByText('Hospital A')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down through options with ArrowDown', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A', 'Hospital B']);
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // past last item
    });

    it('navigates up through options with ArrowUp', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A', 'Hospital B']);
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });

    it('selects highlighted option with Enter', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A']);
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Hospital A');
    });

    it('selects new facility with Enter when no option highlighted and input has text', async () => {
      lookupFacilitiesMock.mockResolvedValue([]);
      render(<FacilityTypeahead value="BrandNew" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New facility:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('BrandNew');
    });

    it('reverts on Escape when dropdown is open', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A']);
      render(<FacilityTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New facility:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('Tab key with highlighted option selects it (non-cellEditorMode)', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A']);
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Hospital A');
    });

    it('Tab key with no highlighted option commits typed text (non-cellEditorMode)', async () => {
      lookupFacilitiesMock.mockResolvedValue([]);
      render(<FacilityTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.change(input, { target: { value: 'TypedFacility' } });

      await waitFor(() => {
        // Wait for state update
      });

      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedFacility');
    });

    it('handles Escape when dropdown is closed', () => {
      render(<FacilityTypeahead value="previous" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('previous');
    });
  });

  describe('cellEditorMode', () => {
    it('renders in cellEditorMode', () => {
      render(
        <FacilityTypeahead value="Hospital" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for facility');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Hospital');
    });

    it('in cellEditorMode, Escape reverts value', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A']);
      render(
        <FacilityTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New facility:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('in cellEditorMode, Tab key with highlighted option saves that value', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A']);
      render(
        <FacilityTypeahead value="Hosp" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Hospital A');
    });

    it('in cellEditorMode, Tab key with no option saves typed text', async () => {
      lookupFacilitiesMock.mockResolvedValue([]);
      render(
        <FacilityTypeahead value="" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.change(input, { target: { value: 'CustomFacility' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('CustomFacility');
    });

    it('in cellEditorMode, arrow keys when dropdown is closed commit current value', () => {
      render(
        <FacilityTypeahead value="Hospital" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('Hospital');
    });

    it('in cellEditorMode, Enter when dropdown is closed commits typed value', () => {
      render(
        <FacilityTypeahead value="Clinic" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Clinic');
    });
  });

  describe('blur behavior (form mode)', () => {
    it('reverts to previous value on blur when no selection made', async () => {
      render(<FacilityTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('original');
      });
    });

    it('in cellEditorMode, blur accepts typed value', async () => {
      render(<FacilityTypeahead value="original" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search for facility');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'newfacility' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('newfacility');
      });
    });
  });

  describe('mouse hover', () => {
    it('highlights option on mouse enter', async () => {
      lookupFacilitiesMock.mockResolvedValue(['Hospital A', 'Hospital B']);
      render(<FacilityTypeahead value="Hosp" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for facility');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Hospital A')).toBeInTheDocument();
      });

      fireEvent.mouseEnter(screen.getByText('Hospital A').closest('div')!);
    });
  });
});
