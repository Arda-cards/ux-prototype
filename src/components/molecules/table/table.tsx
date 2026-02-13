import React from 'react';

import { cn } from '@/lib/utils';

/* ================================================================
   TYPES
   ================================================================ */

/** Props for the ArdaTable wrapper. */
export interface ArdaTableProps {
  children: React.ReactNode;
  className?: string;
}

/** Props for the ArdaTableHeader section. */
export interface ArdaTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/** Props for the ArdaTableBody section. */
export interface ArdaTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

/** Design-time configuration for a table row. */
export interface ArdaTableRowStaticConfig {
  className?: string;
}

/** Runtime configuration for a table row. */
export interface ArdaTableRowRuntimeConfig {
  /** Click handler for row selection. */
  onClick?: () => void;
  /** Whether this row is in the active/selected state. */
  active?: boolean;
}

/** Combined props for ArdaTableRow. */
export interface ArdaTableRowProps extends ArdaTableRowStaticConfig, ArdaTableRowRuntimeConfig {
  children: React.ReactNode;
}

/** Props for a table header cell. */
export interface ArdaTableHeadProps {
  children?: React.ReactNode;
  className?: string;
}

/** Props for a table data cell. */
export interface ArdaTableCellProps {
  children?: React.ReactNode;
  className?: string;
}

/* ================================================================
   COMPONENTS
   ================================================================ */

export function ArdaTable({ children, className }: ArdaTableProps) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
      <table className={cn('w-full border-collapse text-sm text-left', className)}>
        {children}
      </table>
    </div>
  );
}

export function ArdaTableHeader({ children, className }: ArdaTableHeaderProps) {
  return (
    <thead className={cn('bg-[#F9FAFB] border-bottom border-[#E5E5E5]', className)}>
      {children}
    </thead>
  );
}

export function ArdaTableBody({ children, className }: ArdaTableBodyProps) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)}>{children}</tbody>;
}

export function ArdaTableRow({ children, className, onClick, active = false }: ArdaTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-[#E5E5E5] transition-colors hover:bg-[#F3F4F6] cursor-pointer',
        active && 'bg-[#F3F4F6] font-medium',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function ArdaTableHead({ children, className }: ArdaTableHeadProps) {
  return (
    <th
      className={cn(
        'h-10 px-4 py-2 align-middle font-semibold text-[#737373] text-[13px] uppercase tracking-wider',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function ArdaTableCell({ children, className }: ArdaTableCellProps) {
  return <td className={cn('p-4 align-middle text-[#0A0A0A]', className)}>{children}</td>;
}
