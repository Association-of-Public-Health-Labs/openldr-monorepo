"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLLAPSE_BUTTON_CLASS } from "./sidebar-styles";

export function CollapseButton({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const Icon = expanded ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      data-slot="shell-collapse-button"
      aria-label={expanded ? "Recolher menu" : "Expandir menu"}
      onClick={onToggle}
      className={COLLAPSE_BUTTON_CLASS}
    >
      <Icon className="size-4" />
    </button>
  );
}
