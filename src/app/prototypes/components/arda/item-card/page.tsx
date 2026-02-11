"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ArdaItemCard } from "@/components/arda/item-card";

export default function ItemCardPrototype() {
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Item Card</h1>
            <p className="mt-2 text-muted-foreground">
              High-fidelity physical card representation for Kanban inventory management.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Main Example */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold border-b pb-2">Single Card View</h2>
            <div className="flex justify-center p-12 bg-gray-200 rounded-2xl border border-dashed border-gray-400">
              <ArdaItemCard
                title="Microcontroller ATmega328P"
                minQty="100"
                minUnit="pcs"
                location="A-05-12"
                orderQty="500"
                orderUnit="pcs"
                supplier="Microchip Direct"
                sku="ATMEGA328P-AU"
                cardNotes="Flash carefully. Pins are fragile."
              />
            </div>
          </section>

          {/* Grid View */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold border-b pb-2">Multiple States</h2>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <ArdaItemCard
                title="Resistor 10k 1/4W"
                status="RUSH"
                cardIndex={1}
                totalCards={3}
                image="https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop"
              />
              <ArdaItemCard
                title="Ceramic Cap 0.1uF"
                location="B-12-4"
                cardIndex={2}
                totalCards={2}
                image="https://images.unsplash.com/photo-1594814171200-dfbc2f2479e9?w=400&h=300&fit=crop"
              />
              <ArdaItemCard
                title="LDO Regulator 3.3V"
                supplier="Digi-Key"
                status="PENDING"
                cardIndex={1}
                totalCards={10}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
