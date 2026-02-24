import { UnitCellEditor } from './UnitCellEditor';
import type { ICellEditorParams } from 'ag-grid-community';

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn(),
  })),
}));

jest.mock('./UnitTypeahead', () => ({
  UnitTypeahead: jest.fn(() => null),
}));

function makeParams(overrides: Partial<ICellEditorParams> = {}): ICellEditorParams {
  return {
    value: 'kg',
    stopEditing: jest.fn(),
    eGridCell: document.createElement('div'),
    column: {} as ICellEditorParams['column'],
    colDef: {} as ICellEditorParams['colDef'],
    node: {} as ICellEditorParams['node'],
    data: {},
    rowIndex: 0,
    api: {} as ICellEditorParams['api'],
    context: {},
    ...overrides,
  } as unknown as ICellEditorParams;
}

describe('UnitCellEditor', () => {
  let editor: UnitCellEditor;

  beforeEach(() => {
    jest.clearAllMocks();
    editor = new UnitCellEditor();
  });

  describe('init', () => {
    it('creates a GUI element', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });

    it('sets className on the GUI element', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      const gui = editor.getGui();
      expect(gui.className).toBe('ag-cell-edit-unit');
    });

    it('initializes committedValue from params.value', () => {
      const params = makeParams({ value: 'lbs' });
      editor.init(params);
      const input = document.createElement('input');
      input.value = 'lbs';
      editor.getGui().appendChild(input);
      expect(editor.getValue()).toBe('lbs');
    });

    it('handles null/undefined value gracefully', () => {
      const params = makeParams({ value: null });
      editor.init(params);
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });

    it('initializes wasCancelled to false', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      expect(editor.isCancelAfterEnd()).toBe(false);
    });
  });

  describe('getGui', () => {
    it('returns the GUI element after init', () => {
      const params = makeParams();
      editor.init(params);
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });

    it('returns a fallback div when called before init', () => {
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('getValue', () => {
    it('returns committed value when no input element present', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      expect(editor.getValue()).toBe('kg');
    });

    it('reads value from input element when present', () => {
      const params = makeParams({ value: 'old' });
      editor.init(params);
      const input = document.createElement('input');
      input.value = '  liters  ';
      editor.getGui().appendChild(input);
      expect(editor.getValue()).toBe('liters');
    });

    it('trims whitespace from input value', () => {
      const params = makeParams({ value: '' });
      editor.init(params);
      const input = document.createElement('input');
      input.value = '   gallons   ';
      editor.getGui().appendChild(input);
      expect(editor.getValue()).toBe('gallons');
    });
  });

  describe('isCancelBeforeStart', () => {
    it('always returns false', () => {
      expect(editor.isCancelBeforeStart()).toBe(false);
      const params = makeParams();
      editor.init(params);
      expect(editor.isCancelBeforeStart()).toBe(false);
    });
  });

  describe('isCancelAfterEnd', () => {
    it('returns false before any init', () => {
      expect(editor.isCancelAfterEnd()).toBe(false);
    });

    it('returns false after normal init', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      expect(editor.isCancelAfterEnd()).toBe(false);
    });

    it('returns true after Escape key is pressed on the GUI', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      const gui = editor.getGui();

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);

      expect(editor.isCancelAfterEnd()).toBe(true);
    });

    it('calls stopEditing(true) when Escape is pressed', () => {
      const stopEditing = jest.fn();
      const params = makeParams({ value: 'kg', stopEditing });
      editor.init(params);
      const gui = editor.getGui();

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);

      expect(stopEditing).toHaveBeenCalledWith(true);
    });

    it('marks wasCancelled and calls stopEditing when Escape is pressed', () => {
      const stopEditing = jest.fn();
      const params = makeParams({ value: 'lbs', stopEditing });
      editor.init(params);
      const gui = editor.getGui();

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);

      expect(editor.isCancelAfterEnd()).toBe(true);
      expect(stopEditing).toHaveBeenCalledWith(true);
    });

    it('other keys do not cancel editing', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      const gui = editor.getGui();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      gui.dispatchEvent(enterEvent);

      expect(editor.isCancelAfterEnd()).toBe(false);
    });
  });

  describe('focusIn', () => {
    it('focuses the input when called', () => {
      jest.useFakeTimers();
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      const gui = editor.getGui();

      const input = document.createElement('input');
      const focusSpy = jest.spyOn(input, 'focus');
      gui.appendChild(input);

      editor.focusIn();
      jest.runAllTimers();

      expect(focusSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('does not throw when no input is present', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      expect(() => editor.focusIn()).not.toThrow();
    });
  });

  describe('focusOut', () => {
    it('updates committedValue from input on focusOut (not cancelled)', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      const gui = editor.getGui();

      const input = document.createElement('input');
      input.value = 'liters';
      gui.appendChild(input);

      editor.focusOut();
      expect(editor.getValue()).toBe('liters');
    });

    it('does not update committedValue when cancelled (focusOut skips update)', () => {
      const stopEditing = jest.fn();
      const params = makeParams({ value: 'kg', stopEditing });
      editor.init(params);
      const gui = editor.getGui();

      // Press Escape to cancel
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);

      // focusOut with no input — wasCancelled skips update, committedValue=initialValue
      editor.focusOut();
      expect(editor.getValue()).toBe('kg');
    });

    it('does not throw when no input is present', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      expect(() => editor.focusOut()).not.toThrow();
    });
  });

  describe('afterGuiAttached', () => {
    it('focuses and selects input text', () => {
      jest.useFakeTimers();
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      const gui = editor.getGui();

      const input = document.createElement('input');
      const focusSpy = jest.spyOn(input, 'focus');
      const selectSpy = jest.spyOn(input, 'select');
      gui.appendChild(input);

      editor.afterGuiAttached();
      jest.runAllTimers();

      expect(focusSpy).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('does not throw when no input is present', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      expect(() => editor.afterGuiAttached()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('removes keydown event listener on destroy', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      const gui = editor.getGui();
      const removeListenerSpy = jest.spyOn(gui, 'removeEventListener');

      editor.destroy();
      expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('resets wasCancelled to false on destroy', () => {
      const stopEditing = jest.fn();
      const params = makeParams({ value: 'kg', stopEditing });
      editor.init(params);
      const gui = editor.getGui();

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);
      expect(editor.isCancelAfterEnd()).toBe(true);

      editor.destroy();
      expect(editor.isCancelAfterEnd()).toBe(false);
    });

    it('getGui returns fallback div after destroy', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      editor.destroy();
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });

    it('does not throw when destroyed multiple times', () => {
      const params = makeParams({ value: 'kg' });
      editor.init(params);
      expect(() => {
        editor.destroy();
        editor.destroy();
      }).not.toThrow();
    });
  });
});
