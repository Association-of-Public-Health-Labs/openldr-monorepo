import { cn } from "../../../lib/utils";

export type StatusBadgeProps = {
  label: string;
  /** Class colour: the dot, and a soft tint behind the label. */
  color: string;
  size?: "sm" | "md";
  className?: string;
};

/** Minimals soft label: tinted background, coloured dot, dark text (readable on any class colour). */
export function StatusBadge({ label, color, size = "sm", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-bold whitespace-nowrap text-[#1C252E] dark:text-white",
        size === "md" ? "h-7 px-2.5 text-[13px]" : "h-6 px-2 text-xs",
        className,
      )}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)` }}
    >
      <span aria-hidden className={cn("shrink-0 rounded-full", size === "md" ? "size-2" : "size-1.5")} style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
