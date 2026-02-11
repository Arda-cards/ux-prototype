"use client";

import { useWireframeMode } from "@/components/wireframe-mode-provider";
import { Pencil, MonitorSmartphone } from "lucide-react";

export function WireframeToggle() {
  const { isWireframe, toggle } = useWireframeMode();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
      title={isWireframe ? "Switch to normal mode" : "Switch to wireframe mode"}
    >
      {isWireframe ? (
        <>
          <MonitorSmartphone className="h-4 w-4" />
          Normal
        </>
      ) : (
        <>
          <Pencil className="h-4 w-4" />
          Wireframe
        </>
      )}
    </button>
  );
}
