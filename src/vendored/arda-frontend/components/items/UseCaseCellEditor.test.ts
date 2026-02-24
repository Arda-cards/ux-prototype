import { UseCaseCellEditor } from './UseCaseCellEditor';

jest.mock('@/lib/ardaClient', () => ({ lookupUseCases: jest.fn().mockResolvedValue([]) }));
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn(),
  })),
}));

describe('UseCaseCellEditor', () => {
  let editor: UseCaseCellEditor;
  let params: {
    value: string;
    stopEditing: jest.Mock;
    [key: string]: unknown;
  };

  beforeEach(() => {
    editor = new UseCaseCellEditor();
    params = {
      value: 'Emergency',
      stopEditing: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getGui returns a div element after init', () => {
    editor.init(params as never);
    const gui = editor.getGui();
    expect(gui).toBeInstanceOf(HTMLDivElement);
    expect(gui.className).toContain('ag-cell-edit-usecase');
  });

  it('isCancelBeforeStart returns false', () => {
    editor.init(params as never);
    expect(editor.isCancelBeforeStart()).toBe(false);
  });

  it('isCancelAfterEnd returns false when ESC was not pressed', () => {
    editor.init(params as never);
    expect(editor.isCancelAfterEnd()).toBe(false);
  });

  it('isCancelAfterEnd returns true when ESC was pressed', () => {
    editor.init(params as never);
    const gui = editor.getGui();
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    gui.dispatchEvent(escEvent);
    expect(editor.isCancelAfterEnd()).toBe(true);
    expect(params.stopEditing).toHaveBeenCalledWith(true);
  });

  it('getValue returns input value when input is present', () => {
    editor.init(params as never);
    const gui = editor.getGui();
    const input = document.createElement('input');
    input.value = 'Surgery';
    gui.appendChild(input);
    expect(editor.getValue()).toBe('Surgery');
  });

  it('getValue returns committedValue when no input present', () => {
    editor.init(params as never);
    expect(editor.getValue()).toBe('Emergency');
  });

  it('focusIn focuses the input if present', () => {
    jest.useFakeTimers();
    editor.init(params as never);
    const gui = editor.getGui();
    const input = document.createElement('input');
    gui.appendChild(input);
    const focusSpy = jest.spyOn(input, 'focus');
    editor.focusIn();
    jest.runAllTimers();
    expect(focusSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('focusIn does nothing when no input present', () => {
    editor.init(params as never);
    expect(() => editor.focusIn()).not.toThrow();
  });

  it('focusOut updates committedValue from input value', () => {
    editor.init(params as never);
    const gui = editor.getGui();
    const input = document.createElement('input');
    input.value = '  Elective  ';
    gui.appendChild(input);
    editor.focusOut();
    expect(editor.getValue()).toBe('Elective');
  });

  it('focusOut does nothing when wasCancelled is true', () => {
    editor.init(params as never);
    const gui = editor.getGui();
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    gui.dispatchEvent(escEvent);
    editor.focusOut();
    expect(editor.getValue()).toBe('Emergency');
  });

  it('focusOut does nothing when no input present', () => {
    editor.init(params as never);
    expect(() => editor.focusOut()).not.toThrow();
  });

  it('afterGuiAttached focuses and selects the input', () => {
    jest.useFakeTimers();
    editor.init(params as never);
    const gui = editor.getGui();
    const input = document.createElement('input');
    gui.appendChild(input);
    const focusSpy = jest.spyOn(input, 'focus');
    const selectSpy = jest.spyOn(input, 'select');
    editor.afterGuiAttached();
    jest.runAllTimers();
    expect(focusSpy).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('afterGuiAttached does nothing when no input present', () => {
    editor.init(params as never);
    expect(() => editor.afterGuiAttached()).not.toThrow();
  });

  it('destroy clears reference so getGui returns new empty div', () => {
    editor.init(params as never);
    const guiBefore = editor.getGui();
    editor.destroy();
    const guiAfter = editor.getGui();
    expect(guiAfter).not.toBe(guiBefore);
    expect(guiAfter.querySelector('input')).toBeNull();
  });

  it('destroy removes keydown event listener', () => {
    editor.init(params as never);
    const gui = editor.getGui();
    const removeEventListenerSpy = jest.spyOn(gui, 'removeEventListener');
    editor.destroy();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('handles non-Escape keydown events without cancelling', () => {
    editor.init(params as never);
    const gui = editor.getGui();
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    gui.dispatchEvent(enterEvent);
    expect(editor.isCancelAfterEnd()).toBe(false);
    expect(params.stopEditing).not.toHaveBeenCalled();
  });

  it('init with undefined value defaults to empty string', () => {
    const paramsWithUndefined = { value: undefined, stopEditing: jest.fn() };
    editor.init(paramsWithUndefined as never);
    expect(editor.getValue()).toBe('');
  });
});
