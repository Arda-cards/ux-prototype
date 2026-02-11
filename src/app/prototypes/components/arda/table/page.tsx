"use client";

import Link from "next/link";
import { ChevronLeft, MoreVertical, Filter, Download } from "lucide-react";
import {
  ArdaTable,
  ArdaTableHeader,
  ArdaTableBody,
  ArdaTableRow,
  ArdaTableHead,
  ArdaTableCell
} from "@/components/arda/table";
import { ArdaBadge, type ArdaBadgeVariant } from "@/components/arda/badge";

export default function TablePrototype() {
  const data = [
    { id: "ITEM-001", name: "Inductor 10uH", category: "Passives", stock: 1240, status: "healthy", price: "$0.12" },
    { id: "ITEM-002", name: "Op-Amp TL072", category: "ICs", stock: 45, status: "warning", price: "$0.85" },
    { id: "ITEM-003", name: "Connector DB9", category: "Hardware", stock: 12, status: "destructive", price: "$2.40" },
    { id: "ITEM-004", name: "USB-C Cable 1m", category: "Cables", stock: 89, status: "info", price: "$4.50" },
    { id: "ITEM-005", name: "OLED Display 0.96", category: "Displays", stock: 230, status: "success", price: "$3.20" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Gallery
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Table</h1>
            <p className="mt-2 text-muted-foreground">
              Standard table layout for listing inventory, orders, and system records with standardized spacing and typography.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Main Table Example */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Inventory Overview</h2>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-border bg-white hover:bg-muted transition-colors">
                  <Filter size={14} />
                  Filter
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-border bg-white hover:bg-muted transition-colors">
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>

            <ArdaTable>
              <ArdaTableHeader>
                <ArdaTableRow className="hover:bg-transparent cursor-default">
                  <ArdaTableHead className="w-[120px]">Item ID</ArdaTableHead>
                  <ArdaTableHead>Product Name</ArdaTableHead>
                  <ArdaTableHead>Category</ArdaTableHead>
                  <ArdaTableHead className="text-right">In Stock</ArdaTableHead>
                  <ArdaTableHead>Status</ArdaTableHead>
                  <ArdaTableHead className="text-right">Unit Price</ArdaTableHead>
                  <ArdaTableHead className="w-[50px]"></ArdaTableHead>
                </ArdaTableRow>
              </ArdaTableHeader>
              <ArdaTableBody>
                {data.map((item) => (
                  <ArdaTableRow key={item.id}>
                    <ArdaTableCell className="font-mono text-xs">{item.id}</ArdaTableCell>
                    <ArdaTableCell className="font-semibold text-blue-600">{item.name}</ArdaTableCell>
                    <ArdaTableCell>{item.category}</ArdaTableCell>
                    <ArdaTableCell className="text-right">{item.stock}</ArdaTableCell>
                    <ArdaTableCell>
                      <ArdaBadge
                        variant={item.status as ArdaBadgeVariant}
                        dot={item.status !== "info"}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </ArdaBadge>
                    </ArdaTableCell>
                    <ArdaTableCell className="text-right font-medium">{item.price}</ArdaTableCell>
                    <ArdaTableCell className="text-center">
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </ArdaTableCell>
                  </ArdaTableRow>
                ))}
              </ArdaTableBody>
            </ArdaTable>
          </section>

          {/* Simple List Example */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Simple Compressed View</h2>
            <div className="max-w-md">
              <ArdaTable>
                <ArdaTableBody>
                  <ArdaTableRow>
                    <ArdaTableCell className="font-medium">Supply Level</ArdaTableCell>
                    <ArdaTableCell className="text-right"><ArdaBadge variant="success">Normal</ArdaBadge></ArdaTableCell>
                  </ArdaTableRow>
                  <ArdaTableRow>
                    <ArdaTableCell className="font-medium">Recent Activity</ArdaTableCell>
                    <ArdaTableCell className="text-right text-xs text-muted-foreground">2 mins ago</ArdaTableCell>
                  </ArdaTableRow>
                  <ArdaTableRow>
                    <ArdaTableCell className="font-medium">Active Workers</ArdaTableCell>
                    <ArdaTableCell className="text-right">12</ArdaTableCell>
                  </ArdaTableRow>
                </ArdaTableBody>
              </ArdaTable>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
