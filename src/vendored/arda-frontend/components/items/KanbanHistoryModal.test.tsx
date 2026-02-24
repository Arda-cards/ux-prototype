import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanHistoryModal } from './KanbanHistoryModal';

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    className,
    variant,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
    size?: string;
  }) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

function makeHistoryEntry(overrides: Partial<{
  rId: string;
  status: string;
  printStatus: string;
  author: string;
  effective: number;
  recorded: number;
  retired: boolean;
}> = {}) {
  const opts = {
    rId: 'r1',
    status: 'AVAILABLE',
    printStatus: 'NOT_PRINTED',
    author: 'user@example.com',
    effective: 1700000000000,
    recorded: 1700000000000,
    retired: false,
    ...overrides,
  };
  return {
    rId: opts.rId,
    asOf: { effective: opts.effective, recorded: opts.recorded },
    payload: {
      type: 'KanbanCard',
      eId: 'card-1',
      serialNumber: 'SN-001',
      item: { type: 'Item', eId: 'item-1', name: 'Test Item' },
      status: opts.status,
      printStatus: opts.printStatus,
    },
    metadata: { tenantId: 'T1' },
    author: opts.author,
    retired: opts.retired,
  };
}

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  itemName: 'Widget A',
};

describe('KanbanHistoryModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders when isOpen is true', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      expect(screen.getAllByText('Widget A').length).toBeGreaterThan(0);
    });

    it('does not render when isOpen is false', () => {
      render(<KanbanHistoryModal {...baseProps} isOpen={false} />);
      expect(screen.queryByText('Widget A')).not.toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('renders item name as title', () => {
      render(<KanbanHistoryModal {...baseProps} itemName='Surgical Gloves' />);
      // First occurrence in h1
      expect(screen.getAllByText('Surgical Gloves').length).toBeGreaterThan(0);
    });

    it('renders History breadcrumb', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    it('renders table headers: Activity, Version, Date, User', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      expect(screen.getByText('Activity')).toBeInTheDocument();
      expect(screen.getByText('Version')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  describe('close behaviour', () => {
    it('calls onClose when close button (X) is clicked', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      // First button in the panel is the X close button
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      expect(baseProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when Done button is clicked', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      fireEvent.click(screen.getByRole('button', { name: /done/i }));
      expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when back chevron button is clicked', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      // Back button is the second button (after X)
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);
      expect(baseProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay backdrop is clicked', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      const overlay = screen.getAllByText('Widget A')[0].closest('.fixed')!;
      fireEvent.click(overlay);
      expect(baseProps.onClose).toHaveBeenCalled();
    });

    it('does not call onClose when clicking panel content', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      // Click on the h1 inside the panel — should not propagate to overlay handler
      const h1 = screen.getByRole('heading', { level: 1 });
      fireEvent.click(h1);
      expect(baseProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('empty history', () => {
    it('renders no data rows when historyData is undefined', () => {
      render(<KanbanHistoryModal {...baseProps} />);
      expect(screen.queryByText('Card created')).not.toBeInTheDocument();
    });

    it('renders no data rows when results array is empty', () => {
      render(<KanbanHistoryModal {...baseProps} historyData={{ results: [] }} />);
      expect(screen.queryByText('Card created')).not.toBeInTheDocument();
    });
  });

  describe('history entries — getActivityFromStatus', () => {
    it('shows "Card created" for AVAILABLE status', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{ results: [makeHistoryEntry({ status: 'AVAILABLE', rId: 'r1' })] }}
        />
      );
      expect(screen.getByText('Card created')).toBeInTheDocument();
    });

    it('shows "In order queue" for REQUESTING status', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{ results: [makeHistoryEntry({ status: 'REQUESTING', rId: 'r1' })] }}
        />
      );
      expect(screen.getByText('In order queue')).toBeInTheDocument();
    });

    it('shows "Added to order queue" for REQUESTED status', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{ results: [makeHistoryEntry({ status: 'REQUESTED', rId: 'r1' })] }}
        />
      );
      expect(screen.getByText('Added to order queue')).toBeInTheDocument();
    });

    it('shows "Add to in process" for IN_PROCESS status', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{ results: [makeHistoryEntry({ status: 'IN_PROCESS', rId: 'r1' })] }}
        />
      );
      expect(screen.getByText('Add to in process')).toBeInTheDocument();
    });

    it('shows "Move card to receive" for FULFILLED status', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{ results: [makeHistoryEntry({ status: 'FULFILLED', rId: 'r1' })] }}
        />
      );
      expect(screen.getByText('Move card to receive')).toBeInTheDocument();
    });

    it('shows "Status updated" for unknown status', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{ results: [makeHistoryEntry({ status: 'UNKNOWN_STATUS', rId: 'r1' })] }}
        />
      );
      expect(screen.getByText('Status updated')).toBeInTheDocument();
    });

    it('shows "Printed card" when author is printing-author and printStatus is PRINTED', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{
            results: [
              makeHistoryEntry({
                status: 'AVAILABLE',
                printStatus: 'PRINTED',
                author: 'printing-author',
                rId: 'r1',
              }),
            ],
          }}
        />
      );
      expect(screen.getByText('Printed card')).toBeInTheDocument();
    });
  });

  describe('version and date rendering', () => {
    it('renders version numbers for entries', () => {
      const entries = [
        makeHistoryEntry({ rId: 'r1', status: 'AVAILABLE' }),
        makeHistoryEntry({ rId: 'r2', status: 'REQUESTING' }),
      ];
      render(<KanbanHistoryModal {...baseProps} historyData={{ results: entries }} />);
      expect(screen.getByText('2.0.0')).toBeInTheDocument();
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });

    it('renders formatted date for entries', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{
            results: [makeHistoryEntry({ effective: 1700000000000, rId: 'r1' })],
          }}
        />
      );
      // Just verify some date string is rendered (locale-dependent)
      const cells = screen.getAllByRole('generic');
      const hasDate = cells.some((el) => /\d{2}\/\d{2}\/\d{4}/.test(el.textContent || ''));
      expect(hasDate).toBe(true);
    });

    it('renders author in User column', () => {
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{
            results: [makeHistoryEntry({ author: 'john@example.com', rId: 'r1' })],
          }}
        />
      );
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('renders empty string when author is empty', () => {
      const entry = makeHistoryEntry({ author: '', rId: 'r1' });
      render(
        <KanbanHistoryModal
          {...baseProps}
          historyData={{ results: [entry] }}
        />
      );
      // Should not crash when author is empty
      expect(screen.getByText('Card created')).toBeInTheDocument();
    });
  });
});
