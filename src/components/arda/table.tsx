"use client";
import React from "react";

import { cn } from "@/lib/utils";

export function ArdaTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
      <table className={cn("w-full border-collapse text-sm text-left", className)}>
        {children}
      </table>
    </div>
  );
}

export function ArdaTableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn("bg-[#F9FAFB] border-bottom border-[#E5E5E5]", className)}>
      {children}
    </thead>
  );
}

export function ArdaTableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)}>
      {children}
    </tbody>
  );
}

export function ArdaTableRow({
  children,
  className,
  onClick,
  active = false
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-[#E5E5E5] transition-colors hover:bg-[#F3F4F6] cursor-pointer",
        active && "bg-[#F3F4F6] font-medium",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function ArdaTableHead({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("h-10 px-4 py-2 align-middle font-semibold text-[#737373] text-[13px] uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

export function ArdaTableCell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("p-4 align-middle text-[#0A0A0A]", className)}>
      {children}
    </td>
  );
}
