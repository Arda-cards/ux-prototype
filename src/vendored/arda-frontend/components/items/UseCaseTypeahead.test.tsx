import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { UseCaseTypeahead } from './UseCaseTypeahead';
import { lookupUseCases } from '@frontend/lib/ardaClient';

jest.mock('@/lib/ardaClient', () => ({
  lookupUseCases: jest.fn(),
}));

const lookupUseCasesMock = lookupUseCases as jest.Mock;

describe('UseCaseTypeahead', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lookupUseCasesMock.mockResolvedValue([]);
  });

  describe('initial render', () => {
    it('renders with value and placeholder', () => {
      render(
        <UseCaseTypeahead
          value="Emergency"
          onChange={onChange}
          placeholder="Search for use case"
        />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Emergency');
    });

    it('renders with custom placeholder', () => {
      render(
        <UseCaseTypeahead value="" onChange={onChange} placeholder="Find a use case" />
      );
      expect(screen.getByPlaceholderText('Find a use case')).toBeInTheDocument();
    });

    it('renders with empty initial value', () => {
      render(<UseCaseTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      expect(input).toHaveValue('');
    });

    it('renders disabled state', () => {
      render(<UseCaseTypeahead value="Emergency" onChange={onChange} disabled />);
      const input = screen.getByPlaceholderText('Search for use case');
      expect(input).toBeDisabled();
    });

    it('updates input when value prop changes', () => {
      const { rerender } = render(
        <UseCaseTypeahead value="Old Use Case" onChange={onChange} />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      expect(input).toHaveValue('Old Use Case');

      rerender(<UseCaseTypeahead value="New Use Case" onChange={onChange} />);
      expect(input).toHaveValue('New Use Case');
    });
  });

  describe('focus behavior', () => {
    it('does not call lookupUseCases when input is empty on focus', () => {
      render(<UseCaseTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);
      expect(lookupUseCasesMock).not.toHaveBeenCalled();
    });

    it('calls lookupUseCases when input has value on focus', async () => {
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);
      expect(lookupUseCasesMock).toHaveBeenCalledWith('Emerg');
    });

    it('does not call lookupUseCases on focus when value is only whitespace', () => {
      render(<UseCaseTypeahead value="   " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);
      expect(lookupUseCasesMock).not.toHaveBeenCalled();
    });
  });

  describe('search and results', () => {
    it('shows results when use cases are found', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care', 'Emergency Response']);
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
        expect(screen.getByText('Emergency Response')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', async () => {
      let resolve: (v: string[]) => void;
      lookupUseCasesMock.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => { resolve!([]); });
    });

    it('shows "new use case" option when typed text does not match results', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(<UseCaseTypeahead value="NewUseCase" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New use case:/)).toBeInTheDocument();
      });
    });

    it('does not show "new use case" option when typed text matches result (case insensitive)', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(<UseCaseTypeahead value="emergency care" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });
      expect(screen.queryByText(/New use case:/)).not.toBeInTheDocument();
    });

    it('handles API error gracefully — shows new use case option', async () => {
      lookupUseCasesMock.mockRejectedValue(new Error('Network error'));
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New use case:/)).toBeInTheDocument();
      });
    });

    it('clears options when input is cleared', () => {
      render(<UseCaseTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(lookupUseCasesMock).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('calls onChange with selected use case name', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care', 'Emergency Response']);
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Emergency Care'));
      expect(onChange).toHaveBeenCalledWith('Emergency Care');
    });

    it('calls onChange with trimmed typed value when new use case is selected', async () => {
      lookupUseCasesMock.mockResolvedValue([]);
      render(<UseCaseTypeahead value="  NewUseCase  " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New use case:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New use case:/));
      expect(onChange).toHaveBeenCalledWith('NewUseCase');
    });

    it('closes dropdown after selection', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Emergency Care'));
      expect(screen.queryByText('Emergency Care')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down through options with ArrowDown', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care', 'Emergency Response']);
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // past last item
    });

    it('navigates up through options with ArrowUp', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care', 'Emergency Response']);
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });

    it('selects highlighted option with Enter', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Emergency Care');
    });

    it('selects new use case with Enter when no option highlighted and input has text', async () => {
      lookupUseCasesMock.mockResolvedValue([]);
      render(<UseCaseTypeahead value="BrandNew" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New use case:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('BrandNew');
    });

    it('reverts on Escape when dropdown is open', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(<UseCaseTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New use case:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('Tab key with highlighted option selects it (non-cellEditorMode)', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Emergency Care');
    });

    it('Tab key with no highlighted option commits typed text (non-cellEditorMode)', async () => {
      lookupUseCasesMock.mockResolvedValue([]);
      render(<UseCaseTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.change(input, { target: { value: 'TypedValue' } });

      await waitFor(() => {
        expect(input).toHaveValue('TypedValue');
      });

      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedValue');
    });

    it('handles Escape when dropdown is closed', () => {
      render(<UseCaseTypeahead value="previous" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('previous');
    });
  });

  describe('cellEditorMode', () => {
    it('renders in cellEditorMode', () => {
      render(
        <UseCaseTypeahead value="Emergency" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Emergency');
    });

    it('in cellEditorMode, Escape reverts value', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(
        <UseCaseTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New use case:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('in cellEditorMode, Tab key with highlighted option saves that value', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(
        <UseCaseTypeahead value="Emerg" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Emergency Care');
    });

    it('in cellEditorMode, Tab key with no option saves typed text', async () => {
      lookupUseCasesMock.mockResolvedValue([]);
      render(
        <UseCaseTypeahead value="" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.change(input, { target: { value: 'TypedUseCase' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedUseCase');
    });

    it('in cellEditorMode, arrow keys when dropdown is closed commit current value', () => {
      render(
        <UseCaseTypeahead value="Emergency" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('Emergency');
    });

    it('in cellEditorMode, Enter when dropdown is closed commits typed value', () => {
      render(
        <UseCaseTypeahead value="TypedValue" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('TypedValue');
    });

    it('in cellEditorMode, Tab key with new option highlighted saves typed text', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(
        <UseCaseTypeahead value="NewCase" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New use case:/)).toBeInTheDocument();
      });

      // Highlight the "new" option (it's the last in displayOptions)
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // move to new option
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('NewCase');
    });
  });

  describe('blur behavior (form mode)', () => {
    it('reverts to previous value on blur when no selection made', async () => {
      render(<UseCaseTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('original');
      });
    });

    it('in cellEditorMode, blur accepts typed value', async () => {
      render(<UseCaseTypeahead value="original" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search for use case');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'newvalue' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('newvalue');
      });
    });
  });

  describe('mouse hover', () => {
    it('highlights option on mouse enter', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care', 'Emergency Response']);
      render(<UseCaseTypeahead value="Emerg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.mouseEnter(screen.getByText('Emergency Care').closest('div')!);
    });
  });

  describe('click outside', () => {
    it('closes dropdown on click outside in form mode', async () => {
      lookupUseCasesMock.mockResolvedValue(['Emergency Care']);
      render(
        <div>
          <UseCaseTypeahead value="Emerg" onChange={onChange} />
          <div data-testid="outside">outside</div>
        </div>
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Emergency Care')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByText('Emergency Care')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tab with no options (dropdown closed)', () => {
    it('Tab commits typed text when dropdown is closed and no options', () => {
      render(<UseCaseTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.change(input, { target: { value: 'TypedText' } });
      // No focus - dropdown stays closed
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedText');
    });
  });

  describe('ArrowLeft/ArrowRight in cellEditorMode', () => {
    it('in cellEditorMode, ArrowLeft commits value when dropdown is closed', () => {
      render(
        <UseCaseTypeahead value="SomeValue" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.keyDown(input, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith('SomeValue');
    });

    it('in cellEditorMode, ArrowRight commits value when dropdown is closed', () => {
      render(
        <UseCaseTypeahead value="SomeValue" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for use case');
      fireEvent.keyDown(input, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith('SomeValue');
    });
  });
});
