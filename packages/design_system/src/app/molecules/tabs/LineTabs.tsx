"use client";

import { cn } from "../../../lib/utils";

export type LineTabsProps<V extends string> = {
  items: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
};

/**
 * Minimals line tabs (TB's key indicators: Todos / Ultra / XDR): bold labels on a dashed rule,
 * the active one underlined in the dashboard colour. Controlled, so a card can reset it.
 */
export function LineTabs<V extends string>({ items, value, onChange, className }: LineTabsProps<V>) {
  return (
    <div role="tablist" className={cn("flex gap-10 border-b border-dashed border-[rgba(145,158,171,0.2)] px-6", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "-mb-px border-b-2 py-3 text-sm font-semibold transition-colors",
            value === item.value
              ? "border-[var(--primary)] text-[#1C252E] dark:text-white"
              : "border-transparent text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
