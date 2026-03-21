import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquareText, Minus, X } from 'lucide-react';

/** Props for MemoButtonCell. */
export interface MemoButtonCellProps {
  /** The memo text value. */
  value?: string;
  /** Whether the memo is editable. When false, modal shows read-only view. */
  editable?: boolean;
  /** Called with the new value when the user clicks Done in the modal. */
  onSave?: (value: string) => void;
  /** Modal title. Default: "Note". */
  title?: string;
}

/**
 * Icon-button + modal cell component for memo/notes fields.
 *
 * Based on the vendored NotesCell pattern: renders an icon button that opens
 * a centered modal overlay with a textarea (editable) or read-only view.
 *
 * Framework-agnostic — no AG Grid coupling. Usable in grid cells, forms, or standalone.
 */
export function MemoButtonCell({
  value,
  editable = false,
  onSave,
  title = 'Note',
}: MemoButtonCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editValue, setEditValue] = useState(value ?? '');

  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(value ?? '');
    setIsModalOpen(true);
  };

  const handleDone = () => {
    if (editable && onSave) {
      onSave(editValue);
    }
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className="flex items-center justify-center w-full h-full"
        onClick={handleMouseEvent}
        onMouseDown={handleMouseEvent}
      >
        <button
          type="button"
          onClick={handleClick}
          onMouseDown={handleMouseEvent}
          className="flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
          title={value ? (editable ? 'Edit note' : 'View note') : 'Add note'}
        >
          {value ? (
            <MessageSquareText className="h-5 w-5 text-foreground" />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
      {isModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <MemoModal
            title={title}
            value={editable ? editValue : (value ?? '')}
            editable={editable}
            onChange={setEditValue}
            onDone={handleDone}
            onClose={handleClose}
          />,
          document.body,
        )}
    </>
  );
}

/** Internal modal component for MemoButtonCell. */
function MemoModal({
  title,
  value,
  editable,
  onChange,
  onDone,
  onClose,
}: {
  title: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
  onDone: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-[500px] min-h-[206px] rounded-[10px] bg-white border border-border shadow-lg px-6 py-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 opacity-70" />
        </button>

        <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>

        <div className="flex-1 mb-4">
          <div className="rounded-lg border border-border bg-white p-2 shadow-sm">
            {editable ? (
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full min-h-[100px] resize-y border-0 p-0 text-sm leading-5 text-foreground focus:outline-none focus:ring-0"
                placeholder="Add a note..."
                autoFocus
              />
            ) : (
              <div className="text-sm leading-5 text-foreground whitespace-pre-wrap break-words">
                {value || '—'}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-auto">
          <button
            type="button"
            onClick={onDone}
            className="h-9 px-4 py-2 bg-white border border-border rounded-lg shadow-sm text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {editable ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
